# Dev Branch Deployment Investigation

## Summary answer

**A push to `dev` does not trigger any checked-in GitHub Actions workflow in this repository.** No `.github/workflows` files exist in the checked-out `dev` commit, `origin/dev`, or `origin/main`. The repository does contain a **manual Cloudflare Workers deployment command**: run `npm run deploy` from `e:\Personal\SDTECH\sdtech-app`. That command builds the Next.js app with OpenNext and deploys the Worker plus static assets.

There is one important limitation: local files cannot prove that no external automation exists. A Cloudflare Workers Builds/Git integration, GitHub webhook, GitHub App, deploy hook, or repository-level Actions setting could have been configured in the GitHub or Cloudflare dashboards. Those settings must be inspected separately using the checklist below.

At the start of this investigation, the actual Git state was:

- Local branch: `dev` at commit `b8ca5d9`.
- Upstream: `origin/dev` at the same commit (`+0/-0`).
- Working tree and index: clean; there were no staged or unstaged project changes.
- Remote-tracking branches available locally: only `origin/dev` and `origin/main`.
- `origin/main` is commit `821967d`; `origin/dev` is five commits ahead and descends directly from it.

This differs from the earlier supplied “known” state (`origin/dev` at `08c55de` with staged changes): the repository has since advanced and is currently synchronized. Running `git push origin dev` now should therefore report that everything is up to date unless new commits are created first.

**Pushing `dev` will not alter `main`.** GitHub likely shows the old `backend/` and `frontend/` layout because the viewed/default branch is `main`. Selecting the `dev` branch on GitHub should show `sdtech-app/`. Merging `dev` into `main` is the action that will replace the old top-level application layout on `main`; the diff deletes the old `backend/` and `frontend/` trees and adds `sdtech-app/`. The repository files do not reveal which branch GitHub currently designates as the default.

**Do not run the current remote migration against a populated production database.** `migrations/0001_schema.sql` begins by dropping both tables, so `npm run db:migrate` would erase existing jobs and applications before recreating the schema. Also, the admin token is hard-coded in tracked source; it should be rotated and moved to a Cloudflare secret before treating this as a secure production deployment.

## Evidence from the repository

### 1. Git branches, remote, and structural change

Read-only Git inspection used `git -C "e:\Personal\SDTECH" ...`:

- `dev` tracks `origin/dev`, and both pointed to `b8ca5d9` at investigation time.
- `main` and `origin/main` point to `821967d`.
- `git rev-list --left-right --count origin/main...origin/dev` returned `0 5`, so `dev` is five commits ahead with no `main`-only commits.
- The merge base is `821967d`, making a merge into an unchanged `main` a fast-forward in Git terms.
- `git diff --name-status origin/main...origin/dev` shows deletion of the old `README.md`, `backend/recruitment-api/**`, and `frontend/recruitment-ui/**`, and addition of `sdtech-app/**`.
- The configured `origin` points to the `Nithish0011/SDTECH` GitHub repository over HTTPS.

Consequences:

- A push to `dev` updates only the remote `dev` reference.
- A pull request from `dev` into `main` will intentionally present a large migration diff.
- Merging that pull request changes `main` to the new single-app layout; it does not inherently deploy anything unless dashboard automation is attached to `main`.
- Removing the old R2 binding from source control does not delete an existing R2 bucket in the Cloudflare account; cloud resources must be managed separately.

### 2. No checked-in GitHub Actions workflow

`git ls-tree` found no `.github` or `.github/workflows` files in `HEAD`, `origin/dev`, or `origin/main`. Therefore:

- No repository YAML currently defines `push`, `pull_request`, or deployment triggers for `dev` or `main`.
- There is no checked-in CI build, preview deployment, production deployment, or automatic database migration.
- Merely enabling GitHub Actions in repository settings would not create a workflow; a workflow YAML file still has to be committed.

This conclusion applies to the locally available branch snapshots. It does not cover dashboard-only integrations, workflow files on un-fetched branches, or external systems.

### 3. Actual package scripts and working directory

`sdtech-app/package.json` scripts (lines 7-13) define:

- `npm run dev` → standard Next.js development server.
- `npm run build` → Next.js production build.
- `npm run lint` → Next.js lint command.
- `npm run deploy` → `opennextjs-cloudflare build` followed by `opennextjs-cloudflare deploy`.
- `npm run db:migrate` → executes `migrations/0001_schema.sql` against the remote D1 database.
- `npm run db:migrate:local` → executes the same file against local D1 state.

There is **no `test` script and no current application test/spec files**, so the strongest checked-in validation is lint plus build and a manual Cloudflare-bound smoke test. There is also **no `preview` script** and no separate staging/preview Wrangler environment. The old `frontend` application on `main` had a Vite `preview` script, but that application is removed on `dev` and is not the current deployment model.

`sdtech-app/package-lock.json` is lockfile version 3, so use `npm ci` for a reproducible clean installation. Git commands operate from the repository root, but all npm/OpenNext/Wrangler commands for the new application must run with this working directory:

```text
e:\Personal\SDTECH\sdtech-app
```

Running `npm run deploy` at `e:\Personal\SDTECH` will fail because there is no root `package.json` on `dev`.

### 4. Cloudflare Worker, static assets, and D1

`sdtech-app/wrangler.jsonc` defines:

- Worker/service name: `sdtech-recruitment` (`name`).
- Generated Worker entry point: `.open-next/worker.js` (`main`).
- Node.js compatibility: `nodejs_compat` (`compatibility_flags`).
- Static asset directory: `.open-next/assets`, bound as `ASSETS` (`assets`).
- Observability enabled (`observability.enabled`).
- One D1 binding named `DB`, targeting the configured `recruitment-db` database and a specific database ID (`d1_databases`).

`sdtech-app/open-next.config.ts` uses the default `defineCloudflareConfig({})`; it does not add cache, queue, R2, KV, or other overrides. `sdtech-app/src/types/env.d.ts` declares only `DB: D1Database` in the application environment. Numerous pages and route handlers call `getCloudflareContext()` and query `env.DB`, including `src/app/admin/page.tsx`, `src/app/(public)/jobs/page.tsx`, and `src/app/api/jobs/route.ts`. D1 is therefore required for dynamic jobs, applications, admin, and API behavior.

No current `kv_namespaces`, `r2_buckets`, queues, Durable Objects, service bindings, or custom `vars` are configured. Although the old backend on `origin/main` declared an R2 bucket for resumes, the `dev` README explicitly describes the new app as having no resume uploads, and the current code/config does not use R2. The `ASSETS` binding is generated static content, not a user-created KV or R2 resource.

The config records a D1 database ID, but local inspection cannot prove that the database still exists, belongs to the Cloudflare account that will deploy, contains the expected schema/data, or is the desired production database.

### 5. Environment variables and secrets

Searches of tracked application source found no custom `process.env` variables other than Next.js's standard `NODE_ENV` check when setting the login cookie. There is no `.env.example`, no Wrangler `vars`, and no Cloudflare secret binding used by the current code.

However:

- `sdtech-app/src/lib/auth.ts` contains the admin credential directly in tracked source and uses it for both cookie and bearer-token authorization.
- `sdtech-app/src/lib/config.ts` contains the WhatsApp destination directly in tracked source.
- `sdtech-app/.gitignore` correctly ignores `.env`, `.env*.local`, `.dev.vars`, `.wrangler/`, `.open-next/`, `.next/`, logs, and dependency folders.

The ignore rules prevent common local secrets and generated artifacts from being newly committed, but they cannot protect a secret deliberately written in a tracked TypeScript file. A Cloudflare secret will have no effect until the application code is changed to read that binding. Recommended remediation is to add an `ADMIN_TOKEN` environment binding to the app types, read it from Cloudflare context, set it using Wrangler/GitHub secrets, remove the hard-coded credential, and rotate the exposed value. Do not print secret values in logs or workflow output.

### 6. Migration is destructive

`sdtech-app/migrations/0001_schema.sql` starts with:

- `DROP TABLE IF EXISTS applications`
- `DROP TABLE IF EXISTS jobs`

It then recreates both tables and indexes. Consequently, both `npm run db:migrate` and `npm run db:migrate:local` are reset operations, not safe incremental migrations. The README calls the remote command a table-creation step, but that description omits the data-loss behavior.

For a brand-new empty D1 database, the script can initialize the schema. For an existing database, first export/backup it and replace this file/command with a new numbered, non-destructive migration that uses only the required `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE` statements. Database migration should remain a separately approved operation rather than being automatically coupled to every code push or deploy.

### 7. Repository deployment documentation

`sdtech-app/README.md`, sections “Deploy to Cloudflare” and “Full Local Testing,” documents manual deployment:

1. Authenticate Wrangler.
2. Create or select a D1 database and put its ID in `wrangler.jsonc`.
3. initialize the schema.
4. Run `npm run deploy`.

It also states that full local D1 testing uses an OpenNext build followed by `npx wrangler dev`, normally on port 8787. The README lists a live `workers.dev` URL, but the URL's current availability, deployed commit, account ownership, and active bindings were not verified. `src/app/sitemap.ts` currently uses a different `pages.dev` base URL, so production SEO URLs should be corrected to the actual domain before release.

## What cannot be verified from local files

Inspect these items before assuming a push is harmless or automated:

### GitHub repository dashboard

1. **Actions tab:** Look for workflow runs, including workflows on branches not present locally.
2. **Settings → Actions → General:** Check whether Actions are enabled and what permissions are allowed. This setting alone does not deploy without a workflow.
3. **Settings → Webhooks:** Look for Cloudflare, deployment platform, or custom endpoints listening to pushes.
4. **Settings → Integrations / GitHub Apps:** Check whether Cloudflare Workers & Pages or another deployment app has repository access.
5. **Settings → Environments:** Check for `preview` or `production`, required approvals, and environment secrets.
6. **Settings → Secrets and variables → Actions:** Check only secret names and presence; never reveal values.
7. **Settings → Branches / Rules:** Check default branch and protections for `dev` and `main`.

### Cloudflare dashboard

1. **Workers & Pages → `sdtech-recruitment`:** Confirm the project exists and inspect its current deployment/version.
2. **Settings → Builds & deployments (or Git integration):** Determine whether the GitHub repository is connected, which production branch is selected, and whether non-production branches create previews.
3. **Settings → Variables and Secrets / Bindings:** Confirm `DB`, `ASSETS`, and any secrets actually attached to the deployed Worker.
4. **D1 → `recruitment-db`:** Confirm the database ID matches `wrangler.jsonc`, inspect tables, and create a backup/export before schema work.
5. **Domains & Routes:** Confirm the `workers.dev` subdomain and any custom domain.
6. **Deployments / Observability / Logs:** Confirm which commit/version is live and inspect runtime errors.
7. **Account API tokens:** Confirm a narrowly scoped deployment token exists if GitHub Actions will deploy. Never copy its value into source control.

Dashboard-only Git integration can automatically deploy on push even when `.github/workflows` is absent. Until the Cloudflare Builds/Git settings and GitHub integrations are inspected, the safe statement is: **no checked-in GitHub Action exists, but external auto-deployment is unknown.**

## Distinguishing each operation

| Operation | What it changes | What it does not do here |
|---|---|---|
| `git push origin dev` | Uploads new commits and moves GitHub's `dev` branch | Does not move `main`; no checked-in workflow runs |
| CI build | Installs, lints, and builds in an automation runner | No CI exists until a workflow/integration is configured |
| Local Cloudflare smoke test | Runs generated Worker locally with local D1 state | Does not publish to the Internet or use production D1 by default |
| Preview/staging deployment | Publishes a non-production Worker/version with isolated bindings | No safe preview environment or script is currently configured |
| Production deployment | `npm run deploy` uploads the Worker and static assets named by `wrangler.jsonc` | Does not safely migrate D1; may replace the current Worker version |
| Database migration | Changes remote D1 schema/data | Is separate from Git push and `npm run deploy`; current script deletes data |
| Merge `dev` → `main` | Moves `main` to the new layout after review | Does not inherently deploy unless external/main automation is configured |

## Recommended safe, ordered procedure

### Stage 1 — Confirm whether external auto-deploy exists

1. Open the GitHub repository and complete the GitHub dashboard checklist above.
2. Open Cloudflare and complete the Cloudflare dashboard checklist above.
3. Record the connected branch, Worker name, account, and database binding without recording secret values.
4. If Cloudflare shows Git integration enabled, temporarily treat a push as a deployment event. Do not push until you know whether `dev` is a preview branch, a production branch, or ignored.

**Verify:** GitHub Actions and webhook pages show either a known integration or none; Cloudflare's deployment settings explicitly identify the production branch and preview behavior. GitHub-run logs are under **Actions → workflow run → job**; Cloudflare-build logs are under the Worker project's **Deployments/Builds** area.

### Stage 2 — Review branch impact before merging

Run from PowerShell; these commands only inspect/fetch Git state:

```powershell
git -C "e:\Personal\SDTECH" fetch origin
git -C "e:\Personal\SDTECH" status --short --branch
git -C "e:\Personal\SDTECH" log --oneline --decorate origin/main..dev
git -C "e:\Personal\SDTECH" diff --stat origin/main...dev
git -C "e:\Personal\SDTECH" diff --name-status origin/main...dev
```

Expect the large backend/frontend-to-`sdtech-app` migration. Review it in a pull request with base `main` and compare `dev`; do not use the size of the diff as evidence of accidental duplication—it reflects the intentional structural replacement. Do not merge yet.

**Verify:** `git status` is clean before validation/push, `dev` contains only intended commits, and the GitHub branch selector shows different layouts for `main` and `dev`.

### Stage 3 — Fix release blockers before production

Make these as reviewed code/config changes in a future implementation, not as dashboard-only work:

1. Move the hard-coded admin credential to a Cloudflare secret binding and rotate it. Update application types and all auth consumers before setting/deploying the new secret.
2. Replace the destructive initialization script with safe incremental migration handling. Keep the reset script local-only or clearly label it as destructive.
3. Correct sitemap/robots URLs to the actual production domain.
4. Add a separate preview Worker/environment and separate preview D1 database before allowing `dev` to auto-deploy. Do not point preview deployments at production D1.
5. Add tests or at minimum a reliable lint/type/build check; the current app has no automated tests.

**Verify:** no credential remains in tracked files/history used by the release; preview and production resolve to different Worker/database identifiers; the production migration contains no destructive reset unless explicitly approved and backed up.

### Stage 4 — Validate locally from the correct directory

```powershell
Set-Location "e:\Personal\SDTECH\sdtech-app"
npm ci
npm run lint
npm run build
```

Then test with Cloudflare bindings and an isolated local D1 database. Be aware that the current local migration resets local tables:

```powershell
npm run db:migrate:local
npx opennextjs-cloudflare build
npx wrangler dev
```

Open the URL Wrangler prints (the README expects `http://localhost:8787`) and test home, jobs list/detail, apply, login, admin jobs, applications, and CSV export. Stop the local process after testing.

**Verify:** installation, lint, and build exit successfully; the local Worker starts; browser and terminal show no binding/database errors; local create/read/update/delete paths behave as expected. Build output is generated under ignored `.next/` and `.open-next/`. There is no unit-test command in the current project.

### Stage 5 — Push `dev` only when there are new reviewed commits

At investigation time no push is needed because `dev` equals `origin/dev`. For a future commit:

```powershell
git -C "e:\Personal\SDTECH" status --short --branch
git -C "e:\Personal\SDTECH" push origin dev
```

**Verify:** Git reports a successful update (or “Everything up-to-date”), GitHub's `dev` branch shows the intended commit SHA, and `main` remains at its old SHA. If automation was found in Stage 1, inspect its logs immediately; otherwise no GitHub Actions run should appear.

### Stage 6 — Prepare Cloudflare manually

From `e:\Personal\SDTECH\sdtech-app`:

1. Authenticate interactively with `npx wrangler login` for a developer machine, or use a scoped API token in CI.
2. Confirm the active Cloudflare account without sharing its identifiers publicly.
3. List/inspect D1 databases and confirm the configured `recruitment-db` ID belongs to that account.
4. For an existing production database, export/backup it and inspect its tables. **Do not run `npm run db:migrate` with the current SQL.** Apply only a reviewed, non-destructive migration.
5. For a genuinely new and empty database only, create/select it, update the ID through a reviewed commit if needed, and use the initialization SQL with explicit awareness that it resets tables.
6. Confirm the Worker name `sdtech-recruitment` is the intended production target and that deploying it will not overwrite an unrelated service.

**Verify:** Cloudflare D1 shows the expected `jobs` and `applications` tables after approved initialization/migration; existing row counts remain correct; the Worker configuration shows the intended DB binding. Migration/SQL execution output is visible in the terminal and D1 dashboard.

### Stage 7 — Deploy manually to production

Only after Stages 1-6 are complete:

```powershell
Set-Location "e:\Personal\SDTECH\sdtech-app"
npm run deploy
```

This builds OpenNext output and publishes the Worker plus assets. It targets the service/database configured in `wrangler.jsonc`; it is not a harmless local preview.

**Verify:** the command exits successfully and prints a deployment/version and URL; Cloudflare **Workers & Pages → sdtech-recruitment → Deployments** shows the new version; open the live URL and repeat the critical smoke tests. Inspect **Observability → Logs** for runtime errors, or run `npx wrangler tail sdtech-recruitment` from `sdtech-app` while testing. Check D1 metrics/data separately for failed queries.

If the release is bad, use Cloudflare deployment/version rollback controls for Worker code. A Worker rollback does not restore D1 data; database recovery requires the backup created before migration.

### Stage 8 — Merge to `main` after dev/preview approval

1. Open a pull request from `dev` to `main`.
2. Review the full structural change and required checks.
3. Merge only after the validated app is approved and branch protection requirements pass.
4. If production automation is later configured for `main`, understand that merging is the production trigger; require a protected GitHub Environment approval for that job.

**Verify:** `main` points to the approved commit, GitHub shows `sdtech-app/` on `main`, and any configured production deployment has a successful log tied to that SHA. Without configured automation, merging only changes GitHub and a separate manual `npm run deploy` remains necessary.

## Recommended automation model (not currently implemented)

After one successful and secure manual deployment, add automation with clear separation:

1. **Pull requests and pushes to `dev`:** run `npm ci`, lint, and build from `sdtech-app`; optionally deploy to an isolated preview Worker/D1 only.
2. **Push/merge to `main`:** run the same checks, then deploy production behind a protected GitHub `production` environment approval.
3. Store `CLOUDFLARE_API_TOKEN` and the account identifier as GitHub environment secrets, using a least-privilege token. Never commit them or print them.
4. Set the workflow's working directory to `sdtech-app`.
5. Keep D1 migrations out of the ordinary deploy job. Use a separately approved migration job with backup and non-destructive SQL.
6. Add concurrency protection so two production deploys cannot race.

With that model, GitHub's **Actions** tab becomes the source for CI/deploy logs, Cloudflare **Deployments/Observability** remains the source for platform/build/runtime logs, and D1's dashboard remains the source for schema/data verification.

## Conclusions

1. **Verified:** there is no checked-in GitHub Action on `dev` or `main`.
2. **Verified:** manual Cloudflare production deployment is supported through `npm run deploy` from `sdtech-app`.
3. **Verified:** there is no package-level preview deployment script, no separate Wrangler preview environment, and no current test suite.
4. **Verified:** current runtime resources are a Worker, generated static assets, and D1; current code does not require R2 or KV.
5. **Verified:** the remote migration command is destructive and must not be run against populated D1 without explicit data-loss approval and backup.
6. **Verified:** an admin credential is committed in source and should be rotated/moved to a Cloudflare secret before a secure production release.
7. **Verified:** `dev` is already pushed and synchronized at `b8ca5d9`; pushing it does not change `main`.
8. **Unverified locally:** GitHub default branch/settings, webhooks/Apps, Cloudflare Git integration, actual Worker deployment state, resource ownership, secrets, and live URL health.
9. **Recommendation:** inspect both dashboards first, fix credential/migration/preview isolation, validate locally, push only future commits to `dev`, deploy manually once safe, and merge to `main` only through a reviewed pull request. Add CI/CD afterward with production approvals and database migrations kept separate.
