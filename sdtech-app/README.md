# SD Tech Recruitment

A lightweight job-posting website. Admin posts jobs, candidates apply via a form, details are sent to WhatsApp. No resume uploads, no heavy backend — just Next.js + Cloudflare D1.

**Live URL:** https://sdtech-recruitment.nithishbaswa0011.workers.dev

---

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 15 (App Router) | Free |
| Styling | Tailwind CSS 4 | Free |
| Database | Cloudflare D1 (SQLite) | Free |
| Hosting | Cloudflare Workers | Free |
| Icons | Lucide React | Free |
| WhatsApp | wa.me link (no API) | Free |

---

## Quick Start (Local Development)

```bash
cd sdtech-app
npm install
npm run dev
```

Opens at http://localhost:3000. Static pages (home, login) work. Dynamic pages (jobs, admin) need Cloudflare bindings — see "Full local testing" below.

---

## Deploy to Cloudflare (FREE)

### First Time Setup

```bash
# 1. Login to Cloudflare (opens browser)
npx wrangler login

# 2. Create D1 database (skip if you already have one)
npx wrangler d1 create recruitment-db
# Copy the database_id and update wrangler.jsonc

# 3. Create tables on remote D1
npx wrangler d1 execute recruitment-db --remote --file=./migrations/0001_schema.sql

# 4. Build and deploy
npm run deploy
```

Your site will be live at: `https://sdtech-recruitment.<your-account>.workers.dev`

### Every Time You Make Changes

```bash
npm run deploy
```

That's it. One command builds and deploys.

### What `npm run deploy` Does

1. Runs `opennextjs-cloudflare build` — builds Next.js and converts output for Cloudflare Workers
2. Runs `opennextjs-cloudflare deploy` — uploads the worker + static assets to Cloudflare

---

## Full Local Testing (with D1 database)

Standard `npm run dev` doesn't have D1 access. To test everything locally:

```bash
# Create local database
npx wrangler d1 execute recruitment-db --local --file=./migrations/0001_schema.sql

# Build and run with Cloudflare bindings
npx opennextjs-cloudflare build
npx wrangler dev
```

This runs at http://localhost:8787 with full D1 access.

---

## Configuration

### WhatsApp Number

Edit `src/app/(public)/jobs/[id]/actions.ts` line 5:

```typescript
const WHATSAPP_NUMBER = "919876543210"; // Change to your number
```

Format: country code + number, no `+`, no spaces.

### Admin Token

Edit BOTH files with the same value:

- `src/app/login/actions.ts` line 7
- `src/middleware.ts` line 4

```typescript
const ADMIN_TOKEN = "Kumar@123";
```

### Site Domain (SEO)

Update in:
- `src/app/sitemap.ts` — change `baseUrl`
- `src/app/robots.ts` — change sitemap URL

---

## Project Structure

```
sdtech-app/
├── migrations/0001_schema.sql    # Database schema
├── open-next.config.ts           # OpenNext Cloudflare config
├── wrangler.jsonc                # Cloudflare bindings (D1)
├── src/
│   ├── middleware.ts             # Admin route protection
│   ├── types/env.d.ts            # TypeScript types
│   ├── components/
│   │   ├── header.tsx
│   │   └── footer.tsx
│   └── app/
│       ├── globals.css
│       ├── layout.tsx, not-found.tsx, robots.ts, sitemap.ts
│       ├── login/                # Admin login (outside admin layout)
│       ├── (public)/
│       │   ├── page.tsx          # Home
│       │   └── jobs/             # Job listings + detail + apply
│       ├── admin/
│       │   ├── page.tsx          # Dashboard
│       │   ├── jobs/             # Job CRUD
│       │   └── applications/     # View applicants
│       └── api/
│           └── export-csv/       # Download CSV
└── public/images/                # Hero images + client logos
```

---

## How It Works

### Candidate Flow
1. Visits `/jobs` → sees job listings
2. Clicks a job → reads description
3. Taps "Apply for this Job" → form appears
4. Fills name, email, phone, experience
5. Submits → saved to D1 → "Continue on WhatsApp" button appears
6. Taps WhatsApp → message opens with their details pre-filled
7. Sends to recruiter

### Admin Flow
1. Goes to `/login` → enters token
2. Dashboard shows stats
3. Posts/hides/deletes jobs
4. Views all applications
5. Exports to CSV (opens in Excel)

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run deploy` | Build + deploy to Cloudflare |
| `npm run db:migrate` | Create tables on remote D1 |
| `npm run db:migrate:local` | Create tables on local D1 |

---

## Troubleshooting

**"getCloudflareContext" error in dev:**
Normal. Use `npx wrangler dev` after building for full local D1 access.

**Admin redirects to login:**
Token in `middleware.ts` must match `login/actions.ts`.

**Deploy fails with "No open-next.config.ts":**
Make sure `open-next.config.ts` exists in project root.

**Jobs page empty:**
Login to admin and post your first job.
