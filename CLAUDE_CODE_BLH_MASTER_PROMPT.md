# Claude Code Master Prompt — BLH Care Navigator

You are a senior product engineer, UX designer, and AI engineer. Build a production-quality **interview demonstration** named **BLH Care Navigator**, an *unofficial concept prototype* inspired by https://www.blhnurses.com/. The goal is to demonstrate how an AI-powered visitor care navigator and employee workflow portal could support Beatrice Loving Heart's person-centered healthcare coordination and community programs.

## Operating instructions

- **Do the implementation, not just a plan.** Inspect the repository, establish a practical architecture, create the app, run tests/build, fix failures, and document deployment. Work independently using reasonable defaults. Keep a running checklist in `IMPLEMENTATION_PLAN.md` and mark completed tasks.
- Study the public website's information architecture, layout, fonts, spacing, color palette, navigation, page types, and publicly stated programs using normal browsing where available. **Recreate the overall look and feel with original implementation code**, not by scraping/publishing the site's source or reusing restricted assets. If you cannot browse, use clearly marked approximations and configurable design tokens. Do not invent company facts or eligibility requirements.
- **This is not the official BLH website.** Include a visible but tasteful banner on every public page and login screen: `Unofficial concept demo — Not affiliated with Beatrice Loving Heart. Do not enter real patient information.` Avoid real contact forms that appear to submit to BLH, and do not copy actual login screens or imply an official employee portal. Use demo-specific branding such as `BLH Care Navigator | Concept Demo` and distinct demo URLs.
- Respect copyright, trademarks, privacy, and security. Only use public company information with source links; don't mirror copyrighted photographs/text verbatim without permission. Do not expose real individual or patient data. Generate realistic but **fully synthetic** records.
- Do not collect, process, transmit, or persist real PHI in this demo. Warn users before input. Ensure example datasets, logs, analytics, and screenshots contain synthetic data only. This is **not** a HIPAA-compliant system and must not be described as one. No clinical diagnoses or medical advice.

## Product vision

Two connected experiences:

1. **Visitor-facing website:** A faithful visual homage to the public company's website, modernized for accessibility, with a floating **Care Navigator** button at bottom-right and an expandable right-side AI panel. Help people describe needs, identify potentially relevant **verified** BLH programs/resources, improve clarity of their request, and generate a structured inquiry for demonstration purposes.
2. **Employee demo workspace:** A separate, secure-feeling role-based interface that turns **synthetic demo inquiries** into a clean, actionable inbox, case details, follow-up tasks, knowledge-base suggestions, and operational analytics. Employees can understand the visitor's full conversation, what the AI suggested, and the next human action.

## Technical architecture and deployment

Use **React + TypeScript + Vite + Tailwind CSS**, React Router, a coherent component system (e.g. shadcn/ui + Lucide), and well-organized feature-based folders. Choose accessible components, responsive layouts, and low-complexity state patterns.

GitHub Pages only hosts static assets: configure Vite `base` for `/<repo-name>/`, GitHub Actions workflow for build/deploy, SPA deep-link fallback or HashRouter, and clear setup instructions. No backend secrets in the frontend.

Support two modes:

- **Demo mode (must work entirely on GitHub Pages):** Preloaded synthetic data; persistent browser-local state for demonstrations; simulated login clearly labeled `Demo access`; local deterministic assistant behavior with curated program mappings and explicit simulated-answer labels; export CSV/JSON. Explain that browser-local data is not shared between visitor and employee browsers and never imply otherwise. Provide a **one-click 'Send demo inquiry to employee inbox'** action that creates a synthetic inbox record within the same browser and a **Reset demo** action.
- **Optional real backend mode (separately hosted):** Architecture adapter/API contract for Supabase or a Node/FastAPI backend with genuine server-side auth, database, audited access, and server-side AI proxy. Environment-driven endpoints. No public anonymous access to employee records. Do not claim this backend is operating unless implemented and tested. If time permits implement a small backend in `/server`; otherwise provide full documented interfaces and a graceful demo-mode fallback.

Never store API keys, service-role credentials, or passwords in git or `VITE_*` env vars. Any real LLM request must go through a server-side proxy. Do not build fake security that masquerades as a real login: demo login is clearly nonsecure and for sample data only.

## Website pages and navigation

Create a cohesive public site with working routes and meaningful content sections patterned after the publicly available site. Suggested routes: Home, About, Programs Overview, Program Details, Who We Serve, Community, Careers, Contact, FAQ, Privacy/Demo Notice. Preserve the site's general navigation hierarchy where it can be verified; do not invent official policy statements.

Every page should have an accessible top nav, mobile menu, clear calls to action, footer, and a prominent Care Navigator launcher. On public program detail pages show `Ask the Care Navigator about this program` with page context passed into the assistant.

For content: maintain a typed `programCatalog` with source URLs, last-verified timestamp, plain-language descriptions, typical support areas, eligibility caveats, and contact instructions. At minimum cover care coordination, housing/community planning, aging services, developmental disability support, community resources, hospital discharge/readmission support, and related programs ONLY as verifiable from site sources. Include source links on AI answers. Never assert a visitor qualifies for a benefit; recommend confirming with staff.

## Visitor Care Navigator — core experience

Design a superb right-side panel (440–520 px desktop; full-screen sheet on mobile), with keyboard accessibility, polished transitions, scroll preservation, and a crisp conversation UI. Include:

1. Friendly welcome and starter chips: `Support for an older family member`, `Disability services`, `Housing assistance`, `Transportation help`, `After a hospital discharge`, `Not sure where to start`.
2. Guided needs assessment: ask only relevant questions, one at a time when possible (location at broad city/county level, age band, support categories, urgency of *administrative follow-up*, preferred contact channel, accessibility needs). No real medical histories, SSNs, insurance IDs, dates of birth, or other sensitive data.
3. Smart prompt improvement: as a visitor writes a vague problem, offer a **non-destructive** `Help me describe this better` button. Suggest a clearer, respectful, person-centered version preserving their meaning; show **Original / Suggested** with `Use suggestion`, `Edit`, and `Keep mine`. Never silently change user's input or add facts.
4. Hybrid response: conversational answer + **structured relevant-program cards** with `Why this may help`, `What to ask staff`, `Official source`, `Next step`, and uncertainty notes. Use curated matching rules in demo mode and optional server-backed RAG in backend mode. Cite source URLs; don't fabricate benefit eligibility, service availability, hours, or approvals.
5. **Draft assistance inquiry**: show a structured, editable summary: selected support needs, preferred follow-up method (demo only), recommended programs, unanswered questions, and requested next steps. Require explicit review/consent before saving to the **synthetic demo employee inbox**. Make all visitor personal fields optional; use dummy identifiers and no real transmission to BLH.
6. Session history and clear state; allow delete/reset. Download or copy a summary. Allow a satisfaction rating with realistic analytics only if explicitly recorded.
7. Safety: emergency disclaimer (urgent medical emergency -> contact emergency services; the tool is not for emergencies), respectful language, no diagnosis, no clinical judgment, no unverified claims; guardrails against irrelevant answers and prompt injection from retrieved pages.
8. Helpful secondary actions: translate/common language toggle if feasible, accessibility controls, breadcrumbs to public services, and `Talk to staff` routing to official publicly verified contact information (not an actual submission in demo mode).

## Employee demo portal

Route `/staff` (or hash equivalent) to a visually distinct workspace with **Demo Employee Login**. Provide selectable synthetic roles `Case Coordinator`, `Supervisor`, `Administrator`, with a disclaimer that role switching is simulated; do not collect passwords. A real login is only permitted with implemented backend authentication.

Provide desktop sidebar nav and mobile-appropriate navigation:

- **Overview:** KPIs (new inquiries, awaiting review, follow-ups due, assigned, resolved), trend charts and breakdown by support category. Clearly label all numbers `Sample data`.
- **Inbox:** compact and comfortable density options, full-text search, filters by status, program, assigned staff, urgency, date, unread, and source. Sort by newest, priority, and follow-up due. Row shows a dummy case ID, synthetic participant alias, summary, match suggestions, latest activity, and next action.
- **Inquiry detail:** three-column layout on wide screens (case info and status / complete visitor transcript + AI recommendations and citation provenance / tasks, internal notes, follow-ups). On mobile collapse to tabs. Distinguish visitor-authored content, AI-generated suggestions, and employee-approved decisions with visible labeling.
- **Workflow actions:** assign owner, set status (`New`, `Needs Review`, `Awaiting Information`, `In Progress`, `Closed`), tag program, add internal note, create follow-up task/date, mark complete, bulk update, export safely. Record an activity timeline and timestamps in local demo state.
- **AI Copilot:** draft an empathetic response, summarize long transcripts, suggest next questions, identify missing administrative details, suggest relevant official program pages. All outputs are drafts requiring employee approval; do not auto-send, auto-assign clinical priority, or auto-approve eligibility.
- **Analytics:** sample inquiry volume by day/week, categories, assignment workload, average follow-up latency based on sample events, unresolved queues, program distribution, demo satisfaction. Charts and table views; provide clear metric definitions and sample-data labels. Avoid misleading impact/savings claims.
- **Knowledge base:** browse program catalog and citations; show a 'source last verified' label; provide a mock review/update workflow, not an unverified public edit.
- **Settings / Audit / Demo tools:** sample roles, activity logs, generate fresh synthetic cases, reset all data, demo walkthrough. Include light/dark mode as a bonus.

Seed 30–60 varied synthetic inquiries with realistic but fictional names or aliases, timestamps, programs, statuses, conversations, tasks, and staff assignments. Include at least one story that goes all the way from visitor chat -> improved request -> program suggestions -> reviewed inquiry -> new inbox item -> staff follow-up -> dashboard update.

## Design and UX bar

- Public website: attractive, welcoming, healthcare-appropriate; draw structural inspiration from the original brand but visibly distinguish the unofficial concept. Employee portal: polished modern SaaS, excellent typography, restrained accent colors, clear information hierarchy, roomy spacing, sensible skeleton/empty/error states.
- No dead buttons or fake links. Every interactive feature should work in demo mode. Charts must represent actual seeded/in-session demo state, not arbitrary hardcoded claims.
- Accessibility: WCAG-minded contrast, focus styles, semantic landmarks, ARIA labels for dialogs/panels, keyboard navigation, reduced-motion preferences, usable font scaling, and responsive layouts at 375px, 768px, 1440px.
- Include clear data origin badges: `Visitor message`, `AI suggestion`, `Staff-reviewed`, `Synthetic demo data`.

## Testing and acceptance criteria

Create unit tests for program matching, input-improvement preservation, inquiry schema validation, status transitions, dashboard aggregation, and local persistence. Add at least one Playwright E2E journey if practical.

Acceptance checklist:

- GitHub Pages build succeeds and routing works on direct links.
- Visitor can open sidebar on any public page, complete guided conversation, refine their text, inspect sourced program recommendations, review a draft inquiry, and send it to the local **demo** inbox.
- Employee can enter demo portal, find that inquiry, read the exact full chat, examine suggestions, assign it, create/complete tasks, and see dashboard metrics update.
- Data persists after refresh in the same browser, resets cleanly, and is explicitly identified as synthetic/local.
- No PHI, real service requests, company credentials, actual employee accounts, or API secrets are present.
- Mobile experience and keyboard interactions work.
- `README.md` includes install/run/build/test instructions, GitHub Pages deployment steps, known limitations, security/privacy notices, screenshots/demo flow, and next steps for a real backend.

## Execution sequence

1. Inspect existing repo and public website; document verified pages/programs and design observations in `SOURCES.md`.
2. Implement base app, routing, shared design system, and public pages.
3. Implement right-side AI panel, program catalog and matching, input refinement, inquiry review, and local demo store.
4. Implement staff portal, inbox, transcript details, workflow actions, analytics, and sample data.
5. Add QA tests, refine responsive/accessibility, and deploy config.
6. Run install/lint/test/build and fix all failures. Include final concise summary listing what works, what is simulated, what needs a real backend, and how to demo it in 2 minutes.

Make well-reasoned decisions without asking me routine questions. **Start building now.**
