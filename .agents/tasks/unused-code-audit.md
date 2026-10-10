# Unused / Unwanted Code Audit — SDTECH repo

Read-only investigation. Nothing was modified, deleted, committed, or deployed.

Repo root: `e:\Personal\SDTECH`
Date of audit: based on current working tree (branch `dev`).

---

## Summary answer (read this first)

**Scope correction:** The investigation brief assumed two applications — a Next.js app at `sdtech-app` and an Expo/React Native app at `mobile-admin`. **`mobile-admin` does not exist in this repository.** The repo contains exactly one app: `sdtech-app` (Next.js 15 App Router on Cloudflare Workers via OpenNext). The entire audit below is for `sdtech-app`. The absence of the mobile app is itself the single most important finding, because a large block of code in `sdtech-app` exists only to serve that missing mobile client.

**Headline findings:**

1. **A whole REST API surface (`src/app/api/admin/**` + `src/app/api/jobs/**`, 8 route files) and the `isApiAuthorized` helper are not used by the web app at all.** The web UI is 100% Server Components + server actions; there is not a single `fetch()` call in `src/`. These routes were built for the mobile admin app (`src/lib/auth.ts` literally says "web (cookie) and mobile app (Bearer header)"). With no mobile app in the repo, they are an unused — and publicly exposed — API surface. **Needs human decision** (keep for the planned mobile app, or remove to shrink attack surface). Only `/api/export-csv` is actually linked from the web UI and must stay.

2. **A real deploy bug, not just dead code:** two client-logo files are committed with capitalized names (`Havells.png`, `Panasonic.png`) but referenced in code as lowercase (`havells.png`, `panasonic.png`). This works on your Windows machine (case-insensitive filesystem) but **will 404 on Cloudflare's case-sensitive filesystem after you push/deploy.** Directly relevant to your "what happens when I push" question.

3. A few genuinely safe, small cleanups: one unused exported function (`logoutAdmin`), one commented-out JSX block, and three unused CSS tokens/classes.

Nothing dangerous was found tracked (no `.env`, no logs, no build output committed — `.gitignore` is doing its job; `.open-next/`, `node_modules`, `*.tsbuildinfo` are all correctly untracked).

---

## Risk legend

- **SAFE** — verified zero references anywhere in maintained source; removing it changes no behavior.
- **DECISION** — looks unused today but may be intentional (future mobile app, framework convention). Needs a human call.

---

## Summary table

| # | Item | Path | Category | Risk |
|---|------|------|----------|------|
| 1 | Unused REST API routes (8 files) | `src/app/api/admin/**`, `src/app/api/jobs/**` | Unused feature / dead-for-web | DECISION |
| 2 | `isApiAuthorized()` helper | `src/lib/auth.ts` | Unused export (only the API routes use it) | DECISION |
| 3 | Logo filename casing mismatch | `public/images/clients/Havells.png`, `Panasonic.png` | Deploy bug / broken asset ref | DECISION (fix needed) |
| 4 | `logoutAdmin()` exported, never imported | `src/app/login/actions.ts` | Unused export | SAFE |
| 5 | Commented-out "FINAL CTA" JSX block | `src/app/(public)/page.tsx` | Commented-out code | SAFE |
| 6 | Unused CSS: `.scrollbar-hide` | `src/app/globals.css` | Dead CSS | SAFE |
| 7 | Unused theme tokens `--color-surface-dark`, `--color-warm` | `src/app/globals.css` | Dead CSS tokens | SAFE |
| 8 | Inert class name `hero-slideshow` (no matching CSS rule) | `src/app/(public)/page.tsx` | Harmless no-op | DECISION (leave) |
| 9 | Stale README instructions (wrong file/line refs) | `sdtech-app/README.md` | Doc drift (not code) | DECISION |

No orphaned image assets. No unused npm dependencies. No stray logs/temp files. No tracked-but-ignored artifacts.

---

## Evidence by finding

### 1. Unused REST API routes — `src/app/api/admin/**` and `src/app/api/jobs/**`  [DECISION]

**Files (all under `e:\Personal\SDTECH\sdtech-app\`):**
- `src/app/api/jobs/route.ts` — GET active jobs (public)
- `src/app/api/jobs/[id]/route.ts` — GET single job (public)
- `src/app/api/jobs/[id]/apply/route.ts` — POST application (public)
- `src/app/api/admin/jobs/route.ts` — GET all jobs / POST create (Bearer auth)
- `src/app/api/admin/jobs/[id]/route.ts` — PATCH toggle / DELETE (Bearer auth)
- `src/app/api/admin/applications/route.ts` — GET applications (Bearer auth)
- `src/app/api/admin/stats/route.ts` — GET dashboard stats (Bearer auth)
- `src/app/api/admin/login/route.ts` — POST token login (returns the token)

**Evidence this is unused by the web app:**
- Searched all of `sdtech-app/src/**` for `fetch(` — **zero results**. The web app never calls its own JSON API.
- Searched `src/**/*.tsx` for `/api/` — the only hit is `src/app/admin/applications/page.tsx:33`, `<a href="/api/export-csv">`. That is the CSV route (finding below), **not** any of the routes above.
- The web UI gets its data directly through Server Components calling `getCloudflareContext()` (e.g. `src/app/(public)/jobs/page.tsx`, `src/app/admin/page.tsx`) and mutates via server actions (`src/app/admin/jobs/page.tsx` `createJob`/`deleteJob`/`toggleJob`, `src/app/(public)/jobs/[id]/actions.ts`). These duplicate what the REST routes do.
- `src/lib/auth.ts` comment: the token is "used by web (cookie) and mobile app (Bearer header)". The admin REST routes are the mobile app's backend. **No mobile app exists in this repo** (`mobile-admin` directory not present).

**Why it matters beyond dead code:** `src/app/api/admin/login/route.ts` returns the admin token in its JSON body on success, and the `/api/admin/*` routes are a live, publicly reachable write surface (create/delete jobs, read all applicant PII) guarded only by a hard-coded Bearer token. If the mobile app is cancelled, deleting these routes removes real attack surface.

**Recommended action:** Decide first. If a mobile admin app is still planned, **keep** these and treat them as that app's contract. If not, remove the whole `src/app/api/jobs/**` and `src/app/api/admin/**` trees (keep `src/app/api/export-csv/`). Removing them also lets you delete `isApiAuthorized` (finding 2). Do **not** auto-delete without the user's intent, since they are a deliberate API, not an accident.

### 2. `isApiAuthorized()` — `src/lib/auth.ts`  [DECISION]

Defined at `src/lib/auth.ts:9`. The only importers are the `/api/admin/*` route files (finding 1). The web app's own auth path uses `ADMIN_TOKEN` + cookies via `src/middleware.ts` and `src/app/login/actions.ts`, not this function.
**Action:** Lives and dies with finding 1. If the admin REST routes stay, keep it; if they go, remove `isApiAuthorized` and keep only `ADMIN_TOKEN`.

### 3. Client logo filename casing mismatch  [DECISION — real fix needed]

**Tracked files (from `git ls-files`):**
- `sdtech-app/public/images/clients/Havells.png`  (capital H)
- `sdtech-app/public/images/clients/Panasonic.png` (capital P)

**Referenced in code (`src/app/(public)/page.tsx:6-7`):**
```
{ name: "Havells",   logo: "/images/clients/havells.png" }   // lowercase
{ name: "Panasonic", logo: "/images/clients/panasonic.png" } // lowercase
```
The other six logos match case exactly (`bluestar`, `cadbury`, `daikin`, `kelloggs`, `lg-polymers`, `tata`).

**Why it matters:** Windows (your dev machine) is case-insensitive so the images load locally. Cloudflare Workers static assets are served from a **case-sensitive** store, so after `npm run deploy` the Havells and Panasonic logos will return 404 and show as broken images on the live homepage. This is almost certainly the kind of "structure changed / something breaks on push" surprise you were worried about.

**Action (human decision on which side to change, but it must be fixed):** either rename the two files to lowercase (`git mv` so the rename is tracked) or change the two `logo:` strings to match the capitalized filenames. Renaming the files to lowercase is the more consistent fix. Not auto-fixed here (read-only step).

### 4. `logoutAdmin()` — `src/app/login/actions.ts:34`  [SAFE]

Exported server action that clears the `admin_session` cookie and redirects to `/`. Searched all of `src/**` for `logoutAdmin` — the only hit is its own definition. The admin "Exit" control in `src/app/admin/layout.tsx` is a plain `<Link href="/">` that does **not** call this action, so the session cookie is never actually cleared on logout.
**Action:** Safe to remove as dead code. (Alternatively, if proper logout is desired, wire the Exit button to call `logoutAdmin` — that's a behavior change, so flag it rather than silently deleting.) `loginAdmin` in the same file **is** used (by `src/app/login/page.tsx`) — keep it.

### 5. Commented-out "FINAL CTA" block — `src/app/(public)/page.tsx`  [SAFE]

At the end of the component JSX there is a large `{/* <section ...> ... </section> */}` commented-out "Ready to Take the Next Step?" CTA. It renders nothing.
**Action:** Safe to delete the commented block.

### 6. `.scrollbar-hide` CSS — `src/app/globals.css`  [SAFE]

Defines `.scrollbar-hide` and `.scrollbar-hide::-webkit-scrollbar`. Searched `src/**` for `scrollbar-hide` — only the CSS definition, no className uses it. (The clients carousel uses `.clients-carousel` / `.clients-track`, which ARE used.)
**Action:** Safe to remove both rules.

### 7. Unused theme tokens — `src/app/globals.css`  [SAFE]

`--color-surface-dark` (line 10) and `--color-warm` (line 12) are declared in `@theme` but never referenced. Searched `src/**` for `surface-dark`, `--color-warm`/`color-warm`, and the Tailwind utility forms (`bg-warm`, `bg-surface-dark`, etc.) — no usages. The other tokens (`primary`, `primary-light`, `accent`, `accent-light`, `surface`, `border`) are all used.
**Action:** Safe to remove the two unused token lines.

### 8. `hero-slideshow` class — `src/app/(public)/page.tsx:30`  [DECISION — leave as-is]

The hero wrapper `<div className="... hero-slideshow">` uses a class that has **no matching rule** in `globals.css` (only `.hero-slide` and `.hero-slide-1/2/3` are defined). It is therefore an inert, harmless class name — not dead CSS to remove, and removing the className changes nothing visually. Listed only for completeness; recommend leaving it.

### 9. Stale README — `sdtech-app/README.md`  [DECISION — doc only]

The README's "Configuration" section tells you to edit the WhatsApp number at `src/app/(public)/jobs/[id]/actions.ts` line 5 and the admin token at `src/app/login/actions.ts` line 7 / `src/middleware.ts` line 4. The code has since been refactored: the WhatsApp number now lives in `src/lib/config.ts` (`WHATSAPP_NUMBER`) and the token in `src/lib/auth.ts` (`ADMIN_TOKEN`). The README's "Project Structure" tree also omits `src/lib/` and the `api/admin` routes.
**Action:** Not code, so out of strict scope, but worth updating so the config instructions point at `src/lib/config.ts` and `src/lib/auth.ts`. Advisory.

---

## Things explicitly checked and found CLEAN (no action)

- **Framework entry points** — `layout.tsx`, `page.tsx`, `route.ts`, `middleware.ts`, `sitemap.ts`, `robots.ts`, `not-found.tsx` are all convention-invoked. Not flagged as unused even where nothing imports them (per framework-awareness rules). All are legitimately part of the app.
- **public/ assets** — all 11 files referenced: `shivaduti_logo.png` (header + footer), `hero1.jpeg`/`hero3.jpeg`/`hero4.jpg` (homepage hero), and the 8 client logos (`src/app/(public)/page.tsx`). No orphan images. (Two have the casing bug in finding 3, but none are unused.)
- **npm dependencies** (`sdtech-app/package.json`) — all accounted for:
  - `next`, `react`, `react-dom` — core, used everywhere.
  - `@opennextjs/cloudflare` — used in `next.config.ts`, `open-next.config.ts`, and every data-fetching Server Component (`getCloudflareContext`).
  - `lucide-react` — icons imported across 10 files (verified).
  - devDeps `typescript`, `@types/*`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `wrangler`, `@cloudflare/workers-types` — all used via config/CLI/types (`postcss.config.js`, `globals.css` `@import "tailwindcss"`, `src/types/env.d.ts`, deploy scripts). No unused dependency candidates.
- **`src/lib/`** — `config.ts` (used by both apply paths), `auth.ts` (`ADMIN_TOKEN` used by middleware + login + api; `isApiAuthorized` see finding 2), `api-helpers.ts` (`jsonResponse`/`errorResponse`/`handleOptions` all used by the API routes — so their fate is tied to finding 1). No duplicate/superseded helpers.
- **Git hygiene** — `git ls-files -i -c --exclude-standard` returned nothing: **no tracked file matches `.gitignore`.** `.open-next/`, `node_modules/`, `.next/`, `*.tsbuildinfo`, `.env*` are all correctly untracked. No logs/temp/`.bak`/`.orig` files tracked under source. `.vscode/settings.json` is tracked (intentional, fine).

---

## Could not fully verify / caveats

- **Dependency usage** is based on static import scanning of `src/**` plus config files; a dep used only through an undiscovered dynamic mechanism would be missed. None suspected here — the dependency list is small and every entry has a clear use.
- Whether the `/api/**` routes (findings 1–2) are truly dead depends on **intent**: if the `mobile-admin` app is still planned, they are the contract for it and must stay. This is exactly why they are classed DECISION, not SAFE. I could not find the mobile app in this repo to confirm either way.
- The casing bug (finding 3) was reasoned from `git ls-files` output + code refs on a case-insensitive OS; it is a near-certain deploy-time 404 but was not empirically reproduced against a case-sensitive filesystem (read-only, no deploy allowed).

---

## Ordered, low-risk removal plan (for user approval)

Do these top-to-bottom; each is independent and leaves the app building. The web UI is untouched by any SAFE step.

1. **(SAFE)** Delete the commented-out FINAL CTA block in `src/app/(public)/page.tsx` (finding 5).
2. **(SAFE)** Remove `.scrollbar-hide` rules and the `--color-surface-dark` + `--color-warm` tokens from `src/app/globals.css` (findings 6–7).
3. **(SAFE)** Remove the unused `logoutAdmin` export from `src/app/login/actions.ts` (finding 4) — unless you'd rather wire the admin "Exit" button to it (that's a feature change, confirm first).
4. **(FIX, needs decision on direction)** Resolve the logo casing mismatch (finding 3) — rename `Havells.png`/`Panasonic.png` to lowercase via `git mv`, or update the two `logo:` paths. Required before/with the next deploy.
5. **(DECISION — do NOT do without confirming mobile-app intent)** If the mobile admin app is abandoned: delete `src/app/api/admin/**` and `src/app/api/jobs/**` (keep `src/app/api/export-csv/`), then delete `isApiAuthorized` from `src/lib/auth.ts` and prune now-unused imports in `src/lib/api-helpers.ts` consumers. Rebuild/redeploy to confirm (findings 1–2).
6. **(Advisory, docs)** Refresh `README.md` config section to point at `src/lib/config.ts` and `src/lib/auth.ts` (finding 9).

Suggested verification after any change: `cd sdtech-app && npm run build` (Next build; must succeed) and `npm run lint`. For the asset fix, also confirm the two logos load from the deployed URL (case-sensitive host) rather than only locally.
