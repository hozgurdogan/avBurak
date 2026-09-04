import 'server-only';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

/**
 * Article bodies are trusted content today (seeded from `prisma/content`, or
 * later written through the admin editor), but the pipeline sanitises anyway:
 * a live edit is one stray `<script>` away from a stored-XSS bug, and running
 * a Markdown-derived tree through `rehype-sanitize` costs nothing.
 *
 * Two deliberate departures from the default schema:
 *
 * 1. `a` keeps `href`/`rel`/`target` so `rehype-autolink-headings` can attach
 *    its heading permalinks.
 * 2. `clobberPrefix` is cleared. The default rewrites every `id` to
 *    `user-content-<id>` (GitHub's defence against user comments clobbering
 *    `document.getElementById` on the surrounding page). That prefix is applied
 *    to the heading's `id` but NOT to the `href` that autolink-headings just
 *    generated, so the default schema silently produces
 *    `<h2 id="user-content-x"><a href="#x">` - every heading anchor, and every
 *    table-of-contents link pointing at one, lands nowhere. The clobbering
 *    defence buys us nothing here: this markup is first-party, it is the only
 *    content on the page, and no script of ours looks anything up by id.
 */
const schema = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'href', 'rel', 'target'],
  },
};

/** One entry in an article's table of contents. */
export type ArticleHeading = {
  id: string;
  text: string;
  /** 2 for a top-level section, 3 for a subsection. */
  level: 2 | 3;
};

export type RenderedArticle = {
  html: string;
  headings: ArticleHeading[];
};

/**
 * Minimal structural view of a hast node - enough to walk the tree for
 * headings without taking a direct dependency on `@types/hast`, which is only
 * present transitively.
 */
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** Concatenates the visible text of a node's subtree. */
function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

function collectHeadings(node: HastNode, into: ArticleHeading[]): void {
  if (node.type === 'element' && (node.tagName === 'h2' || node.tagName === 'h3')) {
    const id = node.properties?.id;
    if (typeof id === 'string' && id.length > 0) {
      const text = textOf(node).trim();
      if (text.length > 0) {
        into.push({ id, text, level: node.tagName === 'h2' ? 2 : 3 });
      }
    }
    // A heading never contains another heading; no need to descend.
    return;
  }

  for (const child of node.children ?? []) {
    collectHeadings(child, into);
  }
}

/**
 * Markdown -> sanitised HTML plus the heading outline behind it.
 *
 * The outline is gathered from the same tree the HTML is rendered from, after
 * `rehype-slug` has assigned ids and before `rehype-autolink-headings` wraps
 * the heading text in an anchor - so the ids are guaranteed to match the
 * rendered markup, and the captured text is the heading itself rather than the
 * permalink wrapper.
 */
export async function renderArticleMarkdown(markdown: string): Promise<RenderedArticle> {
  const headings: ArticleHeading[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(() => (tree: unknown) => {
      collectHeadings(tree as HastNode, headings);
    })
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), headings };
}
