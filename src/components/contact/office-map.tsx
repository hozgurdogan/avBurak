// Server component - the map loads directly with the page, at the client's
// explicit request (told twice: 2026-09-17 and again 2026-09-18 after a
// click-to-load version was shipped as a lower-risk alternative). This does
// mean a request reaches Google, and Google's own cookie may be set, as soon
// as the page renders - see the KVKK note in README.md and the scope note on
// `mapsEmbedSrc` in src/content/office.ts.

export function OfficeMap({ src, title }: { src: string; title: string }) {
  return (
    <div className="mt-5 aspect-[4/3] w-full overflow-hidden border border-rule-neutral">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}
