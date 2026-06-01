# Content Audit Baseline (2026-06-01)

## Snapshot
- Total KO pages audited: **92**
- Mission-ready pages (Prompt + Checklist + Done Criteria): **15 / 92** (16.3%)
- Prompt coverage: **17 / 92** (18.5%)
- Checklist coverage: **21 / 92** (22.8%)
- Done criteria coverage: **46 / 92** (50.0%)

## Category Coverage
| Category | Pages | Prompt | Checklist | Done Criteria | Mission-ready |
| --- | ---: | ---: | ---: | ---: | ---: |
| baas | 2 | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| deploy | 6 | 0 (0.0%) | 2 (33.3%) | 2 (33.3%) | 0 (0.0%) |
| fix | 16 | 0 (0.0%) | 0 (0.0%) | 6 (37.5%) | 0 (0.0%) |
| map | 43 | 0 (0.0%) | 1 (2.3%) | 20 (46.5%) | 0 (0.0%) |
| path | 3 | 2 (66.7%) | 2 (66.7%) | 2 (66.7%) | 1 (33.3%) |
| recipes | 11 | 10 (90.9%) | 10 (90.9%) | 10 (90.9%) | 9 (81.8%) |
| reference | 1 | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| root | 3 | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) | 0 (0.0%) |
| start | 7 | 5 (71.4%) | 6 (85.7%) | 6 (85.7%) | 5 (71.4%) |

## Priority Gaps
- map: mission-ready 0/43 (0.0%)
- fix: mission-ready 0/16 (0.0%)
- deploy: mission-ready 0/6 (0.0%)
- root: mission-ready 0/3 (0.0%)

## Sample Pages Missing Mission Signals
- baas/firebase.astro (missing: prompt, checklist, done criteria)
- baas/supabase.astro (missing: prompt, checklist, done criteria)
- deploy/cloud-run.astro (missing: prompt, checklist, done criteria)
- deploy/cloudflare-pages.astro (missing: prompt, done criteria)
- deploy/index.astro (missing: prompt, checklist, done criteria)
- deploy/netlify.astro (missing: prompt, checklist)
- deploy/railway.astro (missing: prompt, checklist)
- deploy/vercel.astro (missing: prompt, done criteria)
- fix/auth-cookie.astro (missing: prompt, checklist, done criteria)
- fix/build-fail.astro (missing: prompt, checklist, done criteria)
- fix/build-oom.astro (missing: prompt, checklist, done criteria)
- fix/cors.astro (missing: prompt, checklist)
- fix/dns-nxdomain.astro (missing: prompt, checklist)
- fix/env.astro (missing: prompt, checklist, done criteria)
- fix/failed-to-fetch.astro (missing: prompt, checklist, done criteria)
- fix/gateway-timeout.astro (missing: prompt, checklist, done criteria)
- fix/index.astro (missing: prompt, checklist)
- fix/mixed-content.astro (missing: prompt, checklist)
- fix/node-version.astro (missing: prompt, checklist, done criteria)
- fix/preflight-405.astro (missing: prompt, checklist)

## Audit Rule
- Mission-ready = PromptBox + Checklist + explicit done criteria text.
