# Sources & design observations

Reviewed 2026-10-28 by normal browsing of the public site. Program text in `src/data/programs.ts` is paraphrased (not copied), and every program links to its page. No photos, logos, or testimonials are reused.

## Verified pages
| Page | URL |
|---|---|
| Home | https://www.blhnurses.com/ |
| About | https://www.blhnurses.com/about.html |
| Programs overview | https://www.blhnurses.com/programs.html |
| Who We Serve | https://www.blhnurses.com/who-we-serve.html |
| Community | https://www.blhnurses.com/community.html |
| Careers (external) | https://careers.blhnurses.com/careers |
| Contact | https://www.blhnurses.com/contact.html |

## Verified programs (10)
Core five: Community Care Coordination · Managed Care Case Management (described on the overview page only) · Housing & Community Planning · Community Care Resources · Aging & Health Services.
Also listed: Supported Care Case Management · Developmental Disabilities Administration (DDA) · Hospital Readmission Prevention · Transitional Housing · Population Health Initiative (aimed at partner organizations).
Each has its own page: `programs-care-coordination`, `-housing`, `-community-care`, `-aging`, `-supported-care`, `-dda`, `-readmission`, `-transitional-housing`, `-population-health` (.html).

## Public contact info used for "Talk to staff"
4201 Mitchellville Road, Suite 300, Bowie, MD 20714 · (301) 951-0105 ext. 504 · toll free 1-855-653-3502 · care@blhnurses.com · Housing Initiative (301) 804-0039 (housing page).

## Design tokens (read from the site's `:root` CSS variables)
- Font: Inter (Google Fonts), headings 800 weight with negative tracking; nav is 11px uppercase, heavy weight, wide letter-spacing.
- Colors: ink `#0e1014`, muted `#6b6259`, background `#fbfaf7`, sand `#f2eee7`, footer cream `#faf5f2`, green `#00af4c` (eyebrow text `#0b7c38`), leaf `#52c122`, gold `#ffc629`, deep gold `#e2a737`, navy `#031025`.
- Signature gradient: `linear-gradient(100deg, #e2a737, #00af4c)` on pill CTAs. Body has soft gold/green radial glows; key band (mission) is dark ink.
- Layout: sticky translucent header, large hero with eyebrow, numbered program cards (01–05), values ribbon (Dignity · Choice · Community · Independence · Respect), CTA band "Let's build a plan of care together."

## Not verified / not claimed
Eligibility rules, availability, hours, and service areas beyond what the pages say. The navigator never asserts that anyone qualifies.
