# Atlas HubSpot CRM Cards

A HubSpot developer project (platform version `2026.03`) containing three CRM
Card UI extensions — Company, Contact, and Deal — that surface Atlas
intelligence directly on HubSpot record pages. Built to match the fidelity of
`design_handoff_odic_intelligence_platform/hubspot-cards.html`.

Currently static/sample data (same fictional "Meridian Health Systems" data
used elsewhere in Atlas), matching the design mockup's own stated build
stage: the layout and interactions are real, live data wiring is a follow-up
once Atlas exposes a public API HubSpot can call.

## What's here
- `hsproject.json` — project manifest
- `src/app/app-hsmeta.json` — the private app definition (static-token auth,
  read-only CRM scopes for companies/contacts/deals)
- `src/app/cards/CompanyCard.tsx`, `ContactCard.tsx`, `DealCard.tsx` — the
  three cards, each with its own `*-hsmeta.json` config
- `src/app/cards/package.json`, `eslint.config.js`, `.prettierrc.json`,
  `tsconfig.json` — copied verbatim from HubSpot's official
  `2026.03/components/cards` reference so lint/format/typecheck match what
  `hs project upload` expects

## Verified, not just written
`npx tsc --noEmit`, `npx eslint .`, and `npx prettier --check .` all pass
clean against the real, published `@hubspot/ui-extensions` package (installed
locally to verify — not committed; run `npm install` in `src/app/cards`
before iterating).

## What I could NOT do from this environment
Deploying and visually testing this in a real HubSpot portal requires the
[HubSpot CLI](https://www.npmjs.com/package/@hubspot/cli) authenticated
against a developer account (`hs auth`, which requires an interactive browser
login), and a project distributed via `hs project upload` /
`hs project dev`. I don't have that access here, so **this has been
typechecked and linted against the real SDK, but never actually rendered
inside HubSpot.** Someone with HubSpot CLI access needs to:

1. `cd services/connectors-hubspot`
2. `hs project upload` (or `hs project dev` for local iteration)
3. On a Company/Contact/Deal record, **Customize** the record view → add the
   Atlas Intelligence card from the App card library
4. Confirm it renders correctly and the two stub actions (`Generate Report`,
   `Log to Timeline`, `View Similar Deals`) show their "not wired up yet"
   alert as expected
