import 'server-only';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { headingRank } from 'hast-util-heading-rank';
import { toString as hastToString } from 'hast-util-to-string';
import { visit } from 'unist-util-visit';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { slugify } from '@/lib/slug';

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
 * Assigns a Turkish-safe `id` to every heading that doesn't already have one
 * - a drop-in replacement for `rehype-slug`. That package hardcodes
 * `github-slugger`, whose plain (locale-unaware) `.toLowerCase()` mishandles
 * "İ": JS's default case folding turns it into "i" plus a separate combining
 * dot-above character (U+0307) rather than a clean "i", so a heading like
 * "İlgili Hesaplama Aracı" produced the anchor `#i̇lgili-hesaplama-aracı`
 * (SEO review, 16 Ekim 2026) - every other Turkish character came through
 * unconverted too, since github-slugger only strips ASCII punctuation. Using
 * this project's own `slugify()` (already Turkish-locale-aware for article
 * and page URL slugs) keeps heading anchors consistent with those and free
 * of the bug. Deduping repeated headings (`-2`, `-3`, ...) is reimplemented
 * here since `slugify()` itself has no notion of "already used in this
 * document."
 */
function rehypeTurkishSlug() {
  return (tree: unknown) => {
    const seen = new Map<string, number>();

    visit(tree as never, 'element', (node: HastNode) => {
      if (!headingRank(node as never) || (node.properties?.id as string | undefined)) return;

      const base = slugify(hastToString(node as never), 'baslik');
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);

      node.properties = { ...node.properties, id: count === 0 ? base : `${base}-${count}` };
    });
  };
}

/**
 * Markdown -> sanitised HTML plus the heading outline behind it.
 *
 * The outline is gathered from the same tree the HTML is rendered from, after
 * `rehypeTurkishSlug` has assigned ids and before `rehype-autolink-headings`
 * wraps the heading text in an anchor - so the ids are guaranteed to match
 * the rendered markup, and the captured text is the heading itself rather
 * than the permalink wrapper.
 */
export async function renderArticleMarkdown(markdown: string): Promise<RenderedArticle> {
  const headings: ArticleHeading[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeTurkishSlug)
    .use(() => (tree: unknown) => {
      collectHeadings(tree as HastNode, headings);
    })
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), headings };
}
