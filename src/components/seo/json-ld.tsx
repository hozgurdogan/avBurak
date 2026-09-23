/**
 * Renders one JSON-LD `<script>` block. `data` is always a plain object this
 * codebase constructs itself (see `src/lib/structured-data.ts`) from data
 * already public elsewhere on the site - never raw user input - so
 * `dangerouslySetInnerHTML` here is not the risk it would be for HTML.
 * `<` is escaped anyway, purely so a stray "</script>" inside a string value
 * (an article title, say) can never break out of the script tag.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
