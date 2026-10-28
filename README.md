# BLH Care Navigator

An interview prototype: an AI-style **Care Navigator** for visitors plus an **Employee portal** that turns their inquiries into an actionable workflow. The visual design follows the public Beatrice Loving Heart site's palette and layout (see `SOURCES.md`).

> Unofficial concept demo — not affiliated with Beatrice Loving Heart. All data is synthetic and stays in your browser. Not HIPAA-compliant; no medical advice or eligibility decisions.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/blh-care-navigator/
npm test           # 21 unit tests (Vitest)
npm run build      # type-check + production build → dist/
```

## 2-minute demo

1. **Home** → click **Care Navigator** (bottom-right, or on any program page use "Ask the Care Navigator about this program").
2. Click **Fill a sample story** → **Help me describe this better** → compare Original/Suggested → **Use suggestion** → send.
3. See sourced program cards (Care Coordination, Aging & Health, Readmission Prevention). Answer the 5 guided questions with chips.
4. Review the editable draft, tick consent, **Send demo inquiry to employee inbox**.
5. Click **Open in employee portal** → choose a demo persona/role → the new inquiry is flagged on Overview.
6. In the inquiry: read the full transcript (visitor vs AI badges, original vs rewrite), approve a program, assign an owner, add and complete a task, try the AI Copilot draft.
7. Back on **Overview** / **Analytics**, KPIs and charts reflect the change. `DEMO-1000` is a pre-built end-to-end story.

Shortcut: the navigator's **Send demo inquiry to employee inbox** button creates a full sample inquiry in one click.

## What's real vs simulated

| Works fully (demo mode) | Simulated | Needs a real backend |
|---|---|---|
| Matching, rewrite, validation, inbox, workflow, analytics, exports, persistence | "AI" = deterministic rules over a curated catalog, labeled *Simulated answer* / *AI suggestion*; demo login and roles | Shared data across browsers, real auth, audited access, LLM calls |

Data lives in `localStorage` (`blh-care-navigator-demo-v5`). It is **not** shared between browsers or devices. Reset via the navigator (conversation) or Employee portal → Settings → **Reset all demo data**.

## Deploy to GitHub Pages

1. Create a repo (e.g. `blh-care-navigator`) and push to `main`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. `.github/workflows/deploy.yml` tests, builds with `VITE_BASE=/<repo-name>/`, and deploys. HashRouter means deep links like `/#/programs/dda` work without server rewrites.

## Project layout

```
src/data/programs.ts     curated program catalog (source URLs, verified dates)
src/data/seed.ts         synthetic inquiries + DEMO-1000 story
src/lib/navigator.ts     matching, rewrite suggestion, safety checks
src/lib/inquiry.ts       draft validation, status transitions
src/lib/store.ts         localStorage store (useSyncExternalStore)
src/lib/analytics.ts     KPI and chart aggregations
src/lib/copilot.ts       copilot drafts, CSV export
src/navigator/           visitor Care Navigator panel
src/pages/public.tsx     public site pages
src/employee/            employee portal
```

## Real backend (next step — not implemented)

Replace `src/lib/store.ts` calls with an API client behind the same functions. Suggested contract (Supabase or Node/FastAPI):

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/navigator/chat` | anonymous, rate-limited | Server-side LLM proxy with RAG over `programCatalog`; returns answer + program ids + citations |
| POST | `/api/inquiries` | anonymous + CAPTCHA | Create inquiry (server re-validates, strips PHI patterns) |
| GET | `/api/inquiries?status=&q=` | staff (SSO/OIDC) | Inbox list, row-level security by team |
| PATCH | `/api/inquiries/:id` | staff | Status/owner/tags; server enforces `canTransition` |
| POST | `/api/inquiries/:id/tasks` · `/notes` | staff | Workflow; every write appends an immutable audit row |
| GET | `/api/analytics/summary` | supervisor+ | Aggregations computed server-side |

Rules: API keys and service-role credentials live only on the server (never `VITE_*`); no anonymous read access to inquiries; a real deployment needs a BAA-covered host and HIPAA review before any real PHI.

## Known limitations

- No Playwright E2E yet (the journey above was verified manually in a browser).
- No translation toggle; text-size control is provided instead.
- Program content is a paraphrased snapshot from 2026-10-28; "source last verified" dates must be refreshed.
- The seed regenerates relative to today on reset, so exact numbers vary.
