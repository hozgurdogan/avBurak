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
 * The default schema already covers headings, lists, tables (via remark-gfm)
 * and inline code. The only addition is keeping `href`/`rel`/`target` on
 * anchors so `rehype-autolink-headings` can attach its heading permalinks.
 */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'href', 'rel', 'target'],
  },
};

/** Markdown -> sanitised HTML string, ready for `dangerouslySetInnerHTML`. */
export async function renderArticleMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .process(markdown);

  return String(file);
}
