# Handoff — Exposure Network generalized off Smartworld hardcoding, 2026-07-24

**For: CC (Claude Code, owns Atlas frontend) and Luna (owns backend/data).**
**From: Cowork/Claude, out of normal lane — see note at bottom.**

## What happened

Parvind pushed back hard on the Exposure Network component (`apps/shell/src/exposureNetwork/`) being a bespoke Smartworld-only implementation instead of the generic, data-driven capability the original Claude Design handoff (`design_handoff_odic_intelligence_platform/README.md`, 2026-07-19) specified from day one. That doc explicitly called for a "backing intelligence object API" with "relationship edges with evidence grade/source/notes, and an entity hierarchy for drill-down" — i.e. any org should be able to populate this view. What actually shipped was 432 lines of literal Smartworld TypeScript (`data.ts`) that the component imported directly, with no schema and no way for any other org to render this tab at all.

Parvind asked directly whether this could be fixed now rather than filed as another gap report. Given write access to this repo, I did it — commit `40d089f` on `main`, same day.

## What changed, concretely

- `apps/shell/src/exposureNetwork/schema.ts` (new) — the generic schema: `Grade`, `FlankDef`, `SpvDef`, `EntityDef`, `ExtraDef`, `PromoterLead`, and the top-level `ExposureNetworkData` type that bundles everything a per-org exposure network needs. Also the genuinely org-agnostic theme constants (`GRADE_COLOR`, `GRADE_LABEL`, `CONFIDENCE_LEGEND`, canvas layout constants) that used to live in `data.ts`.
- `apps/shell/src/exposureNetwork/orgs/smartworld.ts` (new) — Smartworld's data, content byte-for-byte unchanged, repackaged as the first `ExposureNetworkData` object. This is the pattern the next org should follow: one file per org under `orgs/`.
- `apps/shell/src/exposureNetwork/registry.ts` (new) — `getExposureNetworkData(orgId)`, currently a static map (`{ smartworld: smartworldExposureNetwork }`). Explicitly marked `TODO(Luna, backend)`: this should become a fetch against a real intelligence-object API. See the updated `docs/atlas-backend-brief-for-luna-2026-07-24.md` P0 section for the exact contract.
- `apps/shell/src/exposureNetwork/ExposureNetwork.tsx` (modified) — now takes an `orgId` prop, loads data via the registry instead of importing module-level constants, and renders an explicit "No relationships evidenced yet" empty state for any org without a data file — per the original design doc's own recommended empty-state behavior, which was never implemented before.
- `apps/shell/src/exposureNetwork/data.ts` (rewritten) — kept as a thin deprecated re-export of the same names (`SPV_DEFS`, `PROMOTER_NETWORK`, etc.) pointed at `orgs/smartworld.ts`, purely for back-compat in case anything else imports it. Safe to delete once confirmed nothing does.
- `apps/shell/src/main.tsx` (modified) — both `<ExposureNetwork>` render sites now pass `orgId={activeOrg.id}`. `ExposureNetworkSummary` and the GIA chat context builder no longer import the global Smartworld constants directly; they call `getExposureNetworkData(activeOrg.id)` and handle the missing-data case.

Verified before committing: `cd apps/shell && node node_modules/typescript/lib/tsc.js -p tsconfig.json --noEmit` — exit 0, clean. Manually traced every remaining reference to `SPV_DEFS`/`PROMOTER_NETWORK`/etc. across `apps/shell/src` to confirm none are left as global hardcoded imports outside `ExposureNetwork.tsx`'s own local destructuring from the loaded data object.

## What this does NOT do yet

- No second org has a data file. The claim "onboarding a new org is just `orgs/<id>.ts` + one registry line, zero component changes" is architecturally true but untested — nobody has actually done it yet.
- `registry.ts` is still static/in-code, not backed by a real API. That's Luna's half — see the updated P0 in her brief.
- Contact-level depth (flat 4-field people → drillable records) is untouched — separate P1.5 item in Luna's brief, not part of this change.

## Note on process

This was a direct code commit by Cowork/Claude, which is outside the normal division of labor (CC owns frontend, Luna owns backend, Cowork does investigation/coordination/handoff docs). Parvind explicitly asked "can you do it" and I did; he then corrected that this should have gone through CC instead of being committed directly, and asked that CC and Luna actually be told rather than the change sitting silently in git history — hence this file. Decision was to leave the commit in place rather than revert it, since it's correct and verified. Going forward, changes to this repo should route through CC (frontend) / Luna (backend), not through Cowork committing directly.
