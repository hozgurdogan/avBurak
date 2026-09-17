'use client';

// Client component: the iframe's `src` is only set after a click, so
// nothing is requested from Google - and no cookie is set by Google - until
// the visitor deliberately asks to see the map. That is the mitigation for
// the KVKK point the project's own README raises about embedded maps
// (see next.config.ts's CSP comment and src/content/office.ts for the rest
// of that discussion).

import { useState } from 'react';

export function OfficeMap({
  src,
  title,
  loadLabel,
  privacyNote,
}: {
  src: string;
  title: string;
  loadLabel: string;
  privacyNote: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="mt-5 aspect-[4/3] w-full overflow-hidden border border-rule-neutral">
      {loaded ? (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-canvas-deep px-6 text-center transition-colors duration-base ease-out-editorial hover:bg-rule-soft"
        >
          <span className="label-lg border-b border-current pb-0.5 text-ink">{loadLabel}</span>
          <span className="max-w-[26rem] text-xs leading-normal text-ink-faint">
            {privacyNote}
          </span>
        </button>
      )}
    </div>
  );
}
