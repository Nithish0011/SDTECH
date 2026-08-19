# SD Tech Recruitment

A lightweight job-posting website for a recruitment agency. Admin posts jobs, candidates apply via a form, and details are sent to WhatsApp. No resume uploads, no heavy backend — just Next.js + Cloudflare D1.

**Live URL:** `https://sdtech.pages.dev` (after deployment)

---

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Framework | Next.js 15 (App Router) | Free |
| Styling | Tailwind CSS 4 | Free |
| Database | Cloudflare D1 (SQLite) | Free (5GB, 5M reads/day) |
| Hosting | Cloudflare Pages | Free (unlimited bandwidth) |
| Icons | Lucide React | Free |
| WhatsApp | wa.me link (no API) | Free |

**Total cost: $0/month** (handles up to ~3,000 daily visitors on free tier)

---

## Features

### Public Site
- Home page with hero, stats, services
- Job listings (server-rendered, SEO-indexed)
- Job detail with apply form
- Apply → saves to database → opens WhatsApp with pre-filled message
- SEO: sitemap, robots.txt, per-page meta tags

### Admin Dashboard
- Token-based login (HTTP-only cookie)
- Post new jobs (title, company, location, type, description)
- Activate/deactivate jobs
- Delete jobs
- View all applications in a table
- Export applications as CSV (open in Excel/Google Sheets)

---

## Project Structure

```
sdtech-app/
├── migrations/
│   └── 0001_schema.sql         # Database tables
├── src/
│   ├── middleware.ts           # Protects /admin/* routes
│   ├── types/env.d.ts          # Cloudflare bindings type
│   ├── components/
│   │   ├── header.tsx          # Site header + nav
│   │   └── footer.tsx          # Site footer
│   └── app/
│       ├── globals.css         # Tailwind + custom styles
│       ├── layout.tsx          # Root HTML layout
│       ├── not-found.tsx       # 404 page
│       ├── robots.ts           # robots.txt (blocks /admin, /api)
│       ├── sitemap.ts          # Dynamic sitemap for SEO
│       ├── (public)/
│       │   ├── layout.tsx      # Header + Footer wrapper
│       │   ├── page.tsx        # Home page
│       │   └── jobs/
│       │       ├── page.tsx    # Job listings
│       │       └── [id]/
│       │           ├── page.tsx        # Job detail
│       │           ├── apply-form.tsx  # Client form component
│       │           └── actions.ts      # Server Action (save + WhatsApp)
│       ├── admin/
│       │   ├── layout.tsx      # Sidebar layout
│       │   ├── page.tsx        # Dashboard (stats)
│       │   ├── login/
│       │   │   ├── layout.tsx  # No sidebar for login
│       │   │   ├── page.tsx    # Login form
│       │   │   └── actions.ts  # Auth logic
│       │   ├── jobs/
│       │   │   ├── page.tsx    # Job CRUD
│       │   │   └── delete-button.tsx  # Delete with confirm
│       │   └── applications/
│       │       └── page.tsx    # Applications table
│       └── api/
│           └── export-csv/
│               └── route.ts    # CSV download endpoint
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.js
├── wrangler.jsonc              # Cloudflare D1 binding
└── .gitignore
```

---

## Prerequisites

- Node.js 18+ installed
- A Cloudflare account (free)
- Wrangler CLI (included as dev dependency)

---

## Local Development

### 1. Install dependencies

```bash
cd sdtech-app
npm install
```

### 2. Run in development mode

**Quick start (static pages only, no database):**
```bash
npm run dev
# Opens http://localhost:3000
# Home page and login page work. Job pages will error (no D1 locally).
```

**Full local testing with D1:**
```bash
# Create local database
npx wrangler d1 execute recruitment-db --local --file=./migrations/0001_schema.sql

# Build and run with Cloudflare bindings
npm run build
npx wrangler pages dev .vercel/output/static --d1=DB=recruitment-db

# Opens http://localhost:8788 with full D1 access
```

---

## Deployment (Cloudflare Pages - Free)

### First-time setup

```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Create the database (skip if you already have recruitment-db)
npx wrangler d1 create recruitment-db
# Copy the database_id and update wrangler.jsonc

# 3. Create tables on remote D1
npx wrangler d1 execute recruitment-db --remote --file=./migrations/0001_schema.sql

# 4. Deploy
npm run deploy
```

### After first deploy: Bind D1 to Pages

1. Go to **dash.cloudflare.com** → **Workers & Pages** → **sdtech**
2. **Settings** → **Bindings** → **Add binding**
3. Type: **D1 Database**
4. Variable name: `DB`
5. Select: `recruitment-db`
6. **Save** → **Redeploy**

### Subsequent deployments

```bash
npm run deploy
```

---

## Configuration

### WhatsApp Number

Edit `src/app/(public)/jobs/[id]/actions.ts` line 5:

```typescript
const WHATSAPP_NUMBER = "919876543210"; // Change to your number
```

Format: country code + number, no `+`, no spaces. Example: `919876543210` for India.

### Admin Token

Edit both files with the same value:

- `src/app/admin/login/actions.ts` line 6:
  ```typescript
  const ADMIN_TOKEN = "sdtech-admin-2024"; // Change this
  ```

- `src/middleware.ts` line 4:
  ```typescript
  const ADMIN_TOKEN = "sdtech-admin-2024"; // Must match
  ```

### Site Domain (SEO)

Update the base URL in:
- `src/app/sitemap.ts` → `const baseUrl = "https://sdtech.pages.dev"`
- `src/app/robots.ts` → `sitemap: "https://sdtech.pages.dev/sitemap.xml"`

Replace with your custom domain if you have one.

---

## Database Schema

```sql
-- jobs: admin creates and manages
jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type TEXT DEFAULT 'full-time',   -- full-time, part-time, contract, internship
  description TEXT,
  is_active INTEGER DEFAULT 1,         -- 1 = visible, 0 = hidden
  created_at TIMESTAMP
)

-- applications: candidates submit via form
applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,                -- links to jobs.id
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  experience TEXT,                     -- optional
  created_at TIMESTAMP
)
```

---

## How It Works

### Candidate Flow
1. Visits `/jobs` → sees all active job listings
2. Clicks a job → sees description + apply form
3. Fills form (name, email, phone, experience)
4. Submits → data saved to D1 → success page shows
5. Clicks "Continue on WhatsApp" → WhatsApp opens with pre-filled message
6. Candidate sends the message to the recruiter

### Admin Flow
1. Visits `/admin/login` → enters token
2. Dashboard shows stats (active jobs, total applications)
3. Posts new jobs, activates/deactivates, deletes
4. Views all applications in a table
5. Exports to CSV (opens in Excel/Google Sheets)

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run deploy` | Build + deploy to Cloudflare Pages |
| `npm run db:migrate` | Run migrations on remote D1 |
| `npm run db:migrate:local` | Run migrations on local D1 |
| `npm run lint` | Run ESLint |

---

## Cloudflare Free Tier Limits

| Resource | Free Limit | What it means |
|----------|-----------|---------------|
| Pages bandwidth | Unlimited | Site loads free no matter how many visitors |
| Worker requests | 100,000/day | ~3,000-5,000 daily visitors |
| D1 reads | 5,000,000/day | More than enough for job listings |
| D1 writes | 100,000/day | ~100,000 applications/day |
| D1 storage | 5 GB | Millions of text records |
| Builds | 500/month | ~16 deploys/day |

**When you'd start paying:** Only if you consistently exceed 100K dynamic requests/day (~$5/month removes the cap).

---

## Custom Domain (Optional, Free)

1. Add your domain to Cloudflare (free plan)
2. In Pages project → **Custom domains** → Add `yourdomain.com`
3. Cloudflare handles SSL automatically
4. Update `sitemap.ts` and `robots.ts` with the new domain

---

## Troubleshooting

**"getCloudflareContext" error in dev mode:**
Normal. D1 isn't available in standard `next dev`. Use the full local setup with `wrangler pages dev`.

**Admin pages redirect to login:**
The admin token in `middleware.ts` must match the one in `login/actions.ts`.

**Jobs page is empty:**
Login to admin and post your first job.

**WhatsApp doesn't open:**
Check that `WHATSAPP_NUMBER` has the correct format (country code + number, digits only).
