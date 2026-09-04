# Av. Burak Uğur Öztürk — Hukuk Bürosu Web Sitesi

A trilingual (TR / EN / AR) practice website for an independent attorney admitted
in Türkiye. Next.js 15 App Router, TypeScript, Prisma + MySQL, self-hosted on
cPanel shared hosting via Phusion Passenger — no Docker, no root access.

> **Status: Phases 1–4 of 6 substantially complete.** Public pages and the
> blog are live; OG image generation, admin, and SEO/sitemap polish remain.
> See [Build phases](#build-phases).

---

## 1. Regulatory constraints — read before editing any copy

This is the website of an attorney admitted to a Turkish bar. It is therefore
bound by **Avukatlık Kanunu m.55** and the **TBB Reklam Yasağı Yönetmeliği**
(the Turkish Bar Association's advertising prohibition). These are not
decorative rules: they constrain the words on the page, not just the footer.

**Never appears anywhere on this site:**

- Superlatives or comparatives — "best", "leading", "en iyi", "#1",
  "award-winning", "elite".
- Client testimonials, star ratings, review widgets.
- Case-win statistics, success rates, monetary results.
- Named clients or identifiable case details.
- Sales CTAs — "Book now", "Free consultation", "Hemen ara".
- Pricing, discounts, promotions, campaign language.

**Used instead:**

- A neutral, informational register throughout.
- The call to action is *contact*, never solicitation: `İletişim` / `Contact` /
  `اتصل بنا`, with an optional secondary line `Randevu talebi` /
  `Request an appointment` / `طلب موعد`.
- Practice areas are described as **fields of work**, not services for sale.
- Every article carries a disclaimer in its own language stating that the
  content is general information, is not legal advice, and does not create an
  attorney–client relationship.
- The footer shows the bar association and registry number, the full office
  address, and a link to the KVKK notice.

If a later instruction, ticket or design idea conflicts with this section,
**this section wins.**

### Privacy posture (KVKK)

- **No third-party requests at runtime.** No analytics, no tracking pixels, no
  Google Fonts CDN, no Google Maps iframe. Fonts are self-hosted; the contact
  page links out to a map rather than embedding one, because an embedded map
  sets cookies before the visitor has consented to anything.
- **Zero cookies by default** other than the locale preference
  (`NEXT_LOCALE`) and, inside the admin area, the session cookie. No consent
  banner is needed for those, and none is shipped. If any additional cookie is
  ever introduced, a consent banner becomes mandatory.
- **IP addresses are never stored raw.** Contact submissions and rate-limit
  records keep only a salted hash (`IP_HASH_SALT`), which is enough for abuse
  control and nothing else. Rotating the salt invalidates every stored hash.
- The Content-Security-Policy in `next.config.ts` blocks outbound connections to
  any origin other than the site itself, so a third-party script cannot be
  introduced by accident.

### Deliberate deviation from the brief

The brief asks for the disclaimer to be part of each seeded article body **and**
for a disclaimer component on every article. Shipping both would print it twice.
The seeded Markdown therefore ends with a substantive closing section, and the
disclaimer is rendered by a single `<LegalDisclaimer />` component (Phase 4)
below every article and in the footer. This satisfies the regulatory
requirement — which governs — without duplication.

---

## 2. Stack

| Concern        | Choice                                                       |
| -------------- | ------------------------------------------------------------ |
| Framework      | Next.js 15.5 (App Router, React Server Components by default) |
| Language       | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess`         |
| Styling        | Tailwind CSS v4, CSS-first token layer (`src/app/globals.css`) |
| i18n           | next-intl 4, `[locale]` routing segment, `tr` / `en` / `ar`   |
| Data           | Prisma 6.19 + MySQL 8, committed migrations                   |
| Validation     | Zod 4, shared between client and server actions               |
| Auth           | bcryptjs password hashing, `jose` signed session cookies      |
| Motion         | Framer Motion 13, gated behind `prefers-reduced-motion`       |
| Markdown       | unified / remark / rehype with `rehype-sanitize`              |
| Runtime        | Node 20 LTS (pinned in `.nvmrc` and `engines`)                |

Prisma is pinned to the 6.x line rather than 7.x deliberately: 7.x reworks
driver-adapter configuration across every provider, and there is no forcing
function to take that on mid-project. The 6.x binary query engine needs
nothing beyond the `DATABASE_URL` below to talk to MySQL. Upgrading later is a
contained change.

**Deployment target: cPanel shared hosting, not Docker.** The host gives
MySQL and phpMyAdmin through the panel, no root access and no Docker daemon.
The app runs as a single long-lived Node process under cPanel's **Setup
Node.js App** (Phusion Passenger) instead of a container - see section 7.

---

## 3. Getting started

Requirements: **Node 20.11+** (`.nvmrc` pins 20.18.1), npm 10, and a **local
MySQL 8 server** (any of: a native MySQL/MariaDB install, XAMPP, Laragon, or a
throwaway `mysql` container run by hand for dev only - production is cPanel
MySQL either way, see section 7).

```bash
nvm use                    # or install Node 20 by other means
npm install
cp .env.example .env       # then edit - see the table below, incl. DATABASE_URL
npm run db:migrate         # applies prisma/migrations against your local MySQL
npm run db:seed            # admin user, 6 categories, 3 article groups x 3 locales
npm run dev                # http://localhost:3000
```

Generate the two secrets before seeding:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"  # AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"        # IP_HASH_SALT
```

The seed refuses to run if `SEED_ADMIN_PASSWORD` is still the placeholder or is
shorter than 12 characters. It is idempotent: re-running updates content in
place and does not duplicate rows, and it will **not** overwrite an admin
password that has since been changed from the admin UI.

### Scripts

| Script               | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Development server                                       |
| `npm run build`      | `prisma generate` then a production build                |
| `npm start`          | Serves the production build                              |
| `npm run typecheck`  | `tsc --noEmit` over the whole project, seed included     |
| `npm run lint`       | ESLint (flat config, `next/core-web-vitals`)             |
| `npm run db:migrate` | Create + apply a migration in development                |
| `npm run db:deploy`  | Apply committed migrations (production)                  |
| `npm run db:seed`    | Seed admin, categories and articles                      |
| `npm run db:studio`  | Prisma Studio                                            |
| `npm run db:reset`   | Drop, re-migrate and re-seed — destroys local data       |

### Environment variables

| Variable                      | Required | Notes                                                        |
| ----------------------------- | -------- | ------------------------------------------------------------ |
| `DATABASE_URL`                | yes      | `mysql://user:pass@localhost:3306/dbname` — local MySQL in dev, cPanel MySQL in production (always `localhost` there) |
| `NEXT_PUBLIC_SITE_URL`        | yes      | Canonical origin, no trailing slash. Baked in at build time.  |
| `AUTH_SECRET`                 | yes      | 32+ random bytes; signs session cookies                       |
| `SESSION_MAX_AGE`             | no       | Seconds, default 28800 (8 hours)                              |
| `IP_HASH_SALT`                | yes      | Salt for hashing visitor IPs; rotating it clears all hashes   |
| `SEED_ADMIN_EMAIL`            | seed     | Read only by `prisma/seed.ts`                                 |
| `SEED_ADMIN_NAME`             | seed     | Display name for the admin user                               |
| `SEED_ADMIN_PASSWORD`         | seed     | Minimum 12 characters, must not be the placeholder            |
| `NEXT_PUBLIC_BAR_ASSOCIATION` | launch   | e.g. `İstanbul Barosu` — shown in the footer and JSON-LD      |
| `NEXT_PUBLIC_BAR_REGISTRY_NO` | launch   | Sicil no. **Currently `PLACEHOLDER` — must be set.**          |
| `NEXT_PUBLIC_OFFICE_PHONE`    | launch   | E.164, e.g. `+902121234567`                                   |
| `NEXT_PUBLIC_OFFICE_WHATSAPP` | launch   | E.164, used to build the `wa.me` link                         |
| `NEXT_PUBLIC_OFFICE_EMAIL`    | launch   | Shown in the footer and contact page                          |

`.env` is git-ignored. Never commit it.

---

## 4. Design system

Tokens live in `src/app/globals.css` under Tailwind v4's `@theme`. The default
Tailwind palette, radii, shadows, easings and breakpoints are reset to
`initial`, so a stock utility such as `text-blue-500`, `rounded-2xl` or
`shadow-lg` simply does not exist. If a value is not a token, it is not
available — that is the enforcement mechanism for "tokens first, no arbitrary
values in JSX".

### The gold rule

Contrast was measured, not estimated:

| Foreground        | Background   | Ratio     | Verdict                        |
| ----------------- | ------------ | --------- | ------------------------------ |
| `ink` #1E293B     | canvas       | 12.97:1   | AAA body                       |
| `ink-muted` #4A5568 | canvas     | 6.67:1    | AA body                        |
| `ink-faint` #616B7B | canvas     | 4.78:1    | AA body — the lightest allowed |
| `gold-500` #C5A059 | canvas      | **2.18:1** | **Fails even the 3:1 large-text threshold** |
| `gold-800` #84682F | canvas      | 4.65:1    | AA body — the "gold ink"       |
| `gold-500` #C5A059 | navy-900    | 7.61:1    | AAA body                       |
| `gold-300` #D9C79A | navy-900    | 11.20:1   | AAA body                       |
| `canvas` #F4F1EA  | navy-900     | 16.57:1   | AAA body                       |
| `mist` #C9D0DC    | navy-900     | 12.05:1   | AAA body                       |
| `mist-muted` #9AA6B8 | navy-900  | 7.58:1    | AAA body                       |

`#C5A059` on the cream canvas measures 2.18:1. That fails AA for body text and
also fails the 3:1 large-text threshold, so the "use it only at 18pt or larger"
allowance does **not** rescue it here. The rule applied throughout:

- **On light surfaces** (`canvas`, `paper`), `gold-500` is decoration only —
  hairlines, rule marks, underline strokes, the monogram stroke. It never
  carries text of any size. Gold-toned labels on light use `gold-800`.
- **On the navy field**, the relationship inverts: `gold-500` at 7.61:1 and
  `gold-300` at 11.20:1 are both safe for text, including small caps labels.
- Focus rings are `gold-800` on light and `gold-300` on navy (via
  `[data-surface='navy']`), so the indicator is always visible.

### Named utilities

`label`, `label-lg`, `rule-mark`, `measure` (68ch), `frost`, `sr-focusable` and
`mirror-rtl` are declared with `@utility`. `mirror-rtl` is opt-in per icon:
chevrons and arrows mirror in RTL, but the monogram, the telephone glyph and the
map pin must not.

### Motion

`--duration-slow` (440ms) and `--duration-slower` (600ms) with
`--ease-out-editorial`, a curve with no overshoot. Scroll-in animations are
opacity plus a 10px translate, staggered at most 60ms. A global
`prefers-reduced-motion` block in `globals.css` neutralises CSS animation, and
components additionally gate Framer Motion behind `useReducedMotion()`.

---

## 5. Typography

Nine self-hosted `.woff2` files in `src/assets/fonts`, 466 kB in total, loaded
through `next/font/local` in `src/lib/fonts.ts`.

| Family                | Role              | Subsets loaded    | Preloaded |
| --------------------- | ----------------- | ----------------- | --------- |
| Cormorant Garamond    | Latin headings    | latin, latin-ext  | yes       |
| Inter                 | Latin body        | latin, latin-ext  | latin only |
| Noto Naskh Arabic     | Arabic headings   | arabic            | no        |
| IBM Plex Sans Arabic  | Arabic body       | arabic (4 weights) | no       |

Cormorant Garamond, Inter and Noto Naskh Arabic are variable fonts, so one file
covers the whole weight axis per subset; the Cormorant axis is capped at
`300 500` because the brief forbids bold display weights. IBM Plex Sans Arabic
ships as static weights, hence four files.

**Why one loader call per subset.** `next/font/local` emits a single
`@font-face` per call and cannot vary `unicode-range` across the entries of a
`src` array. A single call covering latin + latin-ext would let the first face
claim the entire range, and Turkish `ğ ş İ` (which live in latin-ext) would
silently fall back to a system serif. Splitting the calls and composing the
result into a CSS font stack restores per-character fallback:

```css
--font-display: var(--font-display-latin), var(--font-display-latin-ext), Georgia, serif;
```

`html[lang="ar"]` re-points `--font-display` and `--font-body` at the Arabic
faces, raises line-height to 1.9, and zeroes every tracking token — letter
spacing applied to Arabic breaks the joining of the script. Latin characters
inside Arabic copy (proper nouns, "KVKK", digits) fall through to the Latin
faces via the same stack, so nothing needs to be tagged manually.

Preload budget: the two Cormorant faces and Inter latin are preloaded (119 kB),
since a heading is the LCP element on nearly every route. Inter latin-ext
(85 kB) is fetched on demand; `adjustFontFallback` generates size-adjusted
Arial/Times fallbacks so the swap does not move the layout.

All four families are licensed under the SIL Open Font License 1.1, which
permits self-hosting and redistribution with the software.

---

## 6. Data model

```
User ─┬─< Session
      └─< Article (author)

ArticleGroup ──< Article ──< ArticleCategory >── Category ──< CategoryTr
ContactMessage
RateLimit
```

The multilingual design turns on **`ArticleGroup`**. One logical article — say
"company formation for foreign investors" — is a group; each of its TR, EN and
AR renderings is an `Article` row inside it. `@@unique([groupId, locale])`
guarantees at most one version per language, and `hreflang` alternates resolve
with a single query on the group instead of guessing slugs across languages.

Notes:

- `role`, `locale` and `status` are `String` columns rather than MySQL's native
  `ENUM` — the allowed values are documented in `schema.prisma` and enforced by
  Zod at the application edge instead, so a value change never needs a schema
  migration and a future move to another SQL provider stays mechanical.
- Indexes on `[status, publishedAt]` and `[locale, status]` back the article
  index and its filters.
- `ContactMessage.consentAt` records the moment the KVKK checkbox was ticked;
  the server action rejects any submission without it. `ipHash` holds a salted
  hash, never the address.
- `Session` rows make sign-out genuinely revocable — the cookie carries only a
  session id, so deleting the row invalidates it everywhere at once.
- `RateLimit` lives in the database rather than in memory so limits survive a
  restart.

Migrations are committed under `prisma/migrations/` and applied with
`migrate deploy`. `prisma db push` is not used anywhere.

### Seed content

`prisma/content/` holds the article bodies as Markdown — three groups × three
locales, 841 to 1178 words each — with slugs, titles, summaries and SEO fields
declared in `prisma/content/manifest.ts`. Reading time is computed at seed time
by `src/lib/reading-time.ts`, which uses a lower words-per-minute figure for
Arabic because the same idea takes fewer words in Arabic than in English.

Slugs are Latin in all three locales, including Arabic (for example
`shurut-al-tahkim-fi-al-uqud-abr-al-hudud`). That keeps URLs copy-pasteable and
free of percent-encoding, and matches the transliteration the admin editor
applies when an author types an Arabic title.

---

## 7. Deployment

The target is **cPanel shared hosting**: MySQL and phpMyAdmin through the
panel, no root access, no Docker daemon. The app runs as a single long-lived
Node process under cPanel's **Setup Node.js App** (Phusion Passenger).

### Why not a static export

`output: 'export'` was considered and rejected. Three things in this app need
a live Node process at request time, not just at build time, and static export
disables all three outright:

- The contact form is a Server Action that writes to MySQL and rate-limits by
  hashed IP.
- The admin area (Phase 5) authenticates against the database and reads/writes
  content on every request.
- Article pages are read from the database, so content edited after a deploy
  is live without a rebuild.

Cutting all three would be a different, much smaller product, not a
deployment mode of this one — so the target is a Node process, not a static
folder in `public_html`.

### Why not Vercel / a VPS

No infrastructure decision here — the hosting is already fixed to a cPanel
shared-hosting account. The database (MySQL, provisioned through the panel) is
what actually needs to persist, and it does so independently of the Node app's
process lifecycle, so a single Passenger-managed process is enough.

### One-time server setup (cPanel)

1. **MySQL Databases** → create a database and a database user, then add the
   user to the database with **All Privileges**. cPanel prefixes both names
   with your account name (e.g. `cpaneluser_hukuk`, `cpaneluser_hukukuser`) —
   note the prefixed names, `DATABASE_URL` needs both.
2. **Remote MySQL** *(optional)* → allowlist your own IP address here if you
   want to run `prisma migrate deploy` from your local machine against the
   live database instead of importing SQL through phpMyAdmin. Some hosts
   disable this entirely — if so, use the phpMyAdmin path below instead.
3. **Setup Node.js App** → create the application:
   - **Node.js version** — 20.x, the highest 20.x offered (see `.nvmrc` /
     `engines` in `package.json`).
   - **Application mode** — Production.
   - **Application root** — the folder you upload the project into (e.g.
     `buo-hukuk`), not `public_html` itself.
   - **Application URL** — your domain or subdomain.
   - **Application startup file** — `server.js`.

   Saving this provisions a dedicated Node virtual environment and writes the
   proxy `.htaccess` that routes the domain to the app — both managed by
   cPanel, nothing in this repo touches either.

### Uploading the project

Upload everything **except** what gets rebuilt on the server or never belongs
there:

| Upload | Skip |
| --- | --- |
| `src/`, `messages/` | `node_modules/` |
| `prisma/` — schema, `migrations/`, `seed.ts`, `content/` (not a local `dev.db`, there isn't one on MySQL) | `.next/` |
| `public/` | `.git/` (unless deploying via git) |
| `package.json`, `package-lock.json` | your local `.env` — create a fresh one on the server instead |
| `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `server.js`, `.nvmrc` | any local scratch folder |

Then, in cPanel:

1. Open the Node.js app and use its **"Enter to the virtual environment"**
   command in **Terminal**, if your plan includes it — cPanel shows a line
   like `source /home/USER/nodevenv/APP_PATH/20/bin/activate && cd /home/USER/APP_PATH`.
2. Create `.env` directly in the application root: copy the fields from
   `.env.example`, fill in the real `DATABASE_URL` from step 1 above, and
   generate fresh `AUTH_SECRET` / `IP_HASH_SALT` values on the server rather
   than reusing local ones.
3. From the Node.js App page, click **Run NPM Install** (equivalent to
   `npm ci`).
4. Inside the virtual environment: `npm run build` (`prisma generate` then
   `next build`).
5. Apply the schema — see below.
6. Seed once: `npm run db:seed`.
7. Back on the Node.js App page, click **Restart**.

No Terminal access on your plan? Steps 3–6 aren't reachable from the UI alone
— ask the host to enable it, or do the equivalent steps locally against the
live database with Remote MySQL allowlisted (step 2 above), then upload the
built `.next/` folder alongside everything else instead of building on the
server.

### Applying the schema

**With Terminal / SSH access on the server (preferred):**

```bash
# inside the app's virtual environment, in the application root
npx prisma migrate deploy
```

Replays `prisma/migrations/20260904120000_init_mysql/migration.sql` (and any
migration added later) against the live database. Safe to re-run — already
applied migrations are skipped, so this doubles as the redeploy step whenever
a later change adds a new migration.

**No Terminal access — import through phpMyAdmin instead:**

The migration file is plain MySQL DDL; it needs the Prisma CLI to generate but
not to apply.

1. Open `prisma/migrations/20260904120000_init_mysql/migration.sql` in this
   repo.
2. In cPanel, open **phpMyAdmin**, select the database from step 1 of server
   setup, go to **Import**, and upload that file (or paste it into the **SQL**
   tab and run it).
3. Tell Prisma the migration is already applied, so a later `migrate deploy`
   from anywhere with CLI access does not try to run it again:
   ```bash
   npx prisma migrate resolve --applied 20260904120000_init_mysql
   ```

**If the schema changes later**, regenerate the SQL for the new migration the
same offline way — no live database connection required to produce it:

```bash
npm run db:diff:mysql > prisma/migrations/<timestamp>_<name>/migration.sql
```

(This only emits DDL for a fresh, empty database — from-empty diffs, not
incremental ones. For an incremental change against an existing table, run
`prisma migrate dev` locally against a disposable MySQL copy of the schema and
commit the migration it generates instead.)

### Running it

Passenger starts `server.js` itself once the app is enabled — there is no
`docker compose up` step and nothing to `exec` into. `server.js` wraps
Next.js's request handler in a plain `http.createServer` and listens on the
port Passenger assigns via `process.env.PORT`, which is the pattern Next.js
documents for self-hosting outside Vercel without a container.

- Redeploy = re-upload changed files, **Run NPM Install** again if
  dependencies changed, `npm run build`, apply any new migration, **Restart**.
- Logs are on the Node.js App page, plus a `stderr.log` in the application
  root.
- **Do not run more than one instance of this app.** MySQL itself handles
  concurrent connections fine — this isn't the SQLite single-writer
  constraint — but cPanel's Node App is one process by design on shared
  hosting, and nothing here needs more than that.

### Backups

MySQL, not a file — back it up the ordinary cPanel way. **Backup Wizard** or
**MySQL Databases → Export** produces a `.sql` dump on a schedule you control
from the panel; there is no application-level backup step. Back up
`public/uploads` (admin-uploaded cover images, once Phase 5 ships) on the same
schedule — those are not in the database.

---

## 8. Project structure

```
prisma/
  schema.prisma            data model, with the enum-as-String rationale
  migrations/              committed; applied with `migrate deploy`
  seed.ts                  idempotent; refuses placeholder credentials
  content/
    manifest.ts            slugs, titles, summaries, SEO, category links
    <group>/{tr,en,ar}.md  article bodies as prose
src/
  app/
    globals.css            the entire design token layer
  assets/fonts/            nine self-hosted woff2 files
  i18n/
    locales.ts             locale list, direction, BCP 47 tags, endonyms
  lib/
    fonts.ts               next/font/local, one call per unicode subset
    prisma.ts              single client per process
    reading-time.ts        per-locale words-per-minute estimate
server.js                  Passenger entry point (cPanel "Setup Node.js App")
```

---

## 9. Build phases

| Phase | Scope                                                              | Status |
| ----- | ------------------------------------------------------------------ | ------ |
| 1     | Foundation: config, tokens, fonts, server entry, schema, migration, seed | done |
| 2     | Design system and shell: layout, dir handling, header/footer, monogram, i18n wiring, `messages/*.json` | done |
| 3     | Public pages: home, practice areas, profile, contact, KVKK, privacy | done |
| 4     | Blog: index, filters, detail, Markdown pipeline, metadata            | done — OG images not yet generated |
| 5     | Admin: auth, middleware, CRUD, uploads, inbox                       | next |
| 6     | SEO and polish: sitemap, robots, JSON-LD, a11y and motion passes    | |

The repository does not build between phases 1 and 2 — Phase 1 deliberately
ships no `app/` routes, and a Next.js project needs at least one. The
foundation *was* verified end to end with temporary scaffolding before that
scaffolding was removed; see below.

### What has been verified

- `npm install` resolves every pinned version (492 packages).
- `prisma migrate dev` generated and applied `20260828154138_init`.
- `npm run db:seed` runs clean and is idempotent — after two consecutive runs:
  3 article groups, 9 articles, 6 categories, 18 category translations, 1 admin,
  18 article-category links.
- `npm run typecheck` passes with `strict` and `noUncheckedIndexedAccess`.
- The Tailwind token layer compiles, and every custom utility and variant
  (`label`, `measure`, `frost`, `rule-mark`, `mirror-rtl`, `rtl:`, `motion-ok:`,
  `px-gutter`, `text-display`, `ease-out-editorial`, …) resolves.
- `next build` succeeded against temporary scaffolding: 9 `@font-face` rules
  emitted, each with its `unicode-range`; 3 faces marked for preload; 4
  size-adjusted fallback faces generated for CLS control.

---

## 10. Before launch

These are the placeholders that must be replaced. None of them are code.

- [ ] `NEXT_PUBLIC_BAR_REGISTRY_NO` — currently the literal `PLACEHOLDER`.
- [ ] `NEXT_PUBLIC_BAR_ASSOCIATION`, office phone, WhatsApp number, e-mail.
- [ ] Full office address (used in the footer and in the JSON-LD `LegalService`).
- [ ] `NEXT_PUBLIC_SITE_URL` — set to the real origin **before** building; it is
      inlined into the client bundle at build time.
- [ ] `AUTH_SECRET` and `IP_HASH_SALT` generated fresh for production.
- [ ] `SEED_ADMIN_PASSWORD` set to a real password, then changed from the admin
      UI after the first login.
- [ ] The KVKK notice and the privacy policy (Phase 3) reviewed by counsel —
      they are drafted, and marked `REVIEW WITH COUNSEL` in the source.
- [ ] Portrait photograph supplied for the profile page.
- [ ] Every string re-read against section 1 of this README.
