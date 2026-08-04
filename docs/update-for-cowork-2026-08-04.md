# Update for Cowork — 2026-08-04

**Who wrote this:** Claude Code (CC). `STATUS.md`/`LOG.md` last update was 2026-07-26/27
— everything below happened since, across four days (2026-08-01 through 2026-08-04) in one
continuous session. This is a report for you to curate into `STATUS.md`/`LOG.md`, not a
tracker edit — I have no write access to either, per the existing rule.

**Live state right now (verified via `kubectl get pods`, not just commit messages):**
`backend:v30` / `shell:v37`, both pods `Running`, both confirmed against the deployed
cluster in `odic-dev01`, not inferred from git.

**Commits, oldest to newest** (`c299e72` through `ad90b79`, all on `main`, all pushed):

```
c299e72  Sync Cowork's tracker: STATUS.md/LOG.md added, legacy trackers marked superseded
b021297  Commit Cargo.lock for the rust-*-service workspace
241df67  Add development-rights engineering (FAR/TDR/TOD) to platform-level context
d6e74bf  Add Sky Arc capitalization + proxy-director + Trump Residences Gurgaon lead
efe1e55  Add Tribeca Developers as a left-flank entity with full drill-down
070db8c  Fix Graph tab scroll jank at the actual structural cause, not another patch
7a73d04  Simplify embedded Graph scroll to native page scroll; auto-generate Reports
061d52b  Fix sign-in outage: AADSTS70011 scope incompatibility
4e03c71  Three real bugs found from an actual screen recording, not guessed from code
c5f8155  Fix regression: min-height:0 missing on .main-content/.sidebar
6aa22a7  Restore the fixed-header/scrolling-middle contract; real headless-browser proof
e685e08  Fix the actual wheel-scroll dead-zone -- real Playwright wheel gestures
c174e5a  Add PWA infrastructure: installable app shell, iOS meta tags
47aa168  PWA infrastructure: vite-plugin-pwa config, icons, iOS meta tags, shell:v33
4096938  Mobile responsive UX: bottom tab nav, Evidence Inspector as a bottom sheet, shell:v34
dfb18d7  GIA rich-text rendering; Smartworld KB update, shell:v35 + backend:v27
ce803fc  Restyle sign-in screen with Microsoft/Biometric/Google options, shell:v36
02ffede  Fix Graph tab bottom-content cutoff; expand banking/catchment nodes, shell:v37 + backend:v28
1557ddf  Upgrade Kotak master-account facts to [A]; correct "bypasses RERA" framing, backend:v29
ad90b79  Add CLP-2 payment plan structure from reviewed BBA, backend:v30
```

---

## 1. A genuine production outage happened and was fixed — `061d52b`

**AADSTS70011 — total sign-in outage.** Combining Graph's `User.Read` scope with the
custom API scope in one MSAL request is incompatible for this app's `signInAudience`
(`AzureADandPersonalMicrosoftAccount`). Fix: dropped `User.Read` — it was never actually
used (`user` comes from ID token claims, no Graph calls anywhere in this app). Confirmed
by the user directly ("Sign is working"). This should be a `STATUS.md` incident line, not
just a commit message — it took the app fully down for an unknown period before being
reported.

## 2. A long, expensive debugging saga on the Graph tab scroll — now genuinely closed

Multiple rounds (`070db8c` → `7a73d04` → `c5f8155` → `4e03c71` → `6aa22a7` → `e685e08`) of
"fixed" that turned out not to be, driven by guessing from source reading instead of
testing the real running app. Ended only once Playwright (Chromium + WebKit, installed
into the session scratchpad, not the repo) was used to actually measure `scrollTop`/
`scrollHeight`/`getBoundingClientRect` against the live app with real data — not
`element.scrollTop` assignment (bypasses hit-testing) and not a single large wheel delta
(gets clamped, misleading). Root cause of the final bug: a canvas wrapper's
`overflow-x: auto` implicitly computed `overflow-y: auto` too (CSS spec behavior), giving
it a spurious ~36px of real vertical scroll that absorbed the first part of every scroll
gesture before the real scrollable region moved. Fixed with explicit `overflowY:
'hidden'`. **If `STATUS.md` still lists this as open or uncertain, it should be closed —
verified against real code, real data, and real simulated multi-tick wheel gestures in
both browser engines.**

A second, related bug surfaced today (`02ffede`) and is also now closed: `.graph-
workspace-embed` used `height: 100%`, which doesn't account for `.page-head` (a preceding
sibling with its own real, variable height) also needing space in the same box —
overflowed `.main-content`'s bottom edge by exactly `.page-head`'s height, which read as
the Evidence Inspector footer being cut off. Fixed by making `.main-content` a flex
column and switching the embed to `flex: 1` / `min-height: 0`. Verified via Playwright
measurement before/after, plus screenshot confirmation of zero regression across the
other four tabs.

## 3. PWA infrastructure — shipped, install criteria verified live, no physical device test

Full installable-web-app setup: `vite-plugin-pwa`, manifest (name/icons/`display:
standalone`), service worker (app-shell precache only — `NetworkOnly` on all `/api/*`,
deliberately never caching live risk/compliance data), four icon sizes, iOS-specific meta
tags (`apple-touch-icon`, `apple-mobile-web-app-*`). Verified live: manifest, `sw.js`, and
all four icons return `200` from `atlas.sagesure.io` directly (not just build output).
**Not verified:** actual "Add to Home Screen" behavior on a real iPhone/iPad/Android
device — no physical device access this session. If this needs to go in `STATUS.md` as
done, it should carry that caveat.

## 4. Mobile responsive UX — bottom tab nav, Evidence Inspector as a bottom sheet

Below 640px: sidebar replaced by a bottom tab bar (reused a grid row the 1220px
breakpoint had already reserved but never wired up); Evidence Inspector goes from an
always-visible footer to an off-screen bottom sheet that slides up only when something is
selected. Verified via Playwright at 375×812 and 412×915 against the real app with real
Smartworld fixture data: zero horizontal overflow, canvas pans ~1200px on realistic
multi-tick wheel gestures, sheet opens/closes correctly, zero console errors. **Not
tested:** real touch-drag (vs. wheel-gesture) on an actual device, and Safari/WebKit
specifically (Chromium only this round).

## 5. Sign-in screen restyle — Microsoft real, Biometric/Google visibly disabled

User shared a reference screenshot from a different app. Restyled to match layout while
keeping Atlas's own teal (`#0d2b3d`) branding — no role-selector copied over (doesn't map
to how Atlas actually handles roles). Only "Sign in with Microsoft" is wired; Biometric
and Google are `disabled` with a "Coming soon" badge — not fake-functional buttons. Both
are explicitly scoped as **separate future projects** if picked up: Biometric needs
WebAuthn/passkey backend work (credential storage + registration/verification endpoints);
Google needs a registered OAuth client and `auth.py` accepting a second token issuer.
Neither is started.

## 6. GIA now renders markdown as actual rich text

Added `react-markdown` + `remark-gfm`. Assistant replies render as real headings/bold/
lists/tables/links instead of literal markdown syntax in the chat panel. No raw-HTML
rendering enabled (no `rehype-raw`) — stays safe against injection from either side.
User-typed messages stay plain text.

## 7. Entra auth audience — confirmed already correct, not changed

User asked whether sign-in was restricted to corporate-only. Verified across all three
layers (Azure App Registration `signInAudience`, MSAL `authority`, backend `auth.py`
`ACCEPTED_ISSUERS`) that both SageSure's own tenant and personal Microsoft accounts are
already accepted — this was already correct from earlier session work, nothing changed
here. **Gap identified, not fixed:** other organizations' Azure AD tenants are not
accepted — someone from a different company's Entra tenant would pass MSAL sign-in but
get a 401 from the API. Not acted on; flagged only.

## 8. Smartworld KB — substantial forensic update, with real corrections along the way

This is the largest single chunk of work this session and needs the most careful
`STATUS.md` treatment, because it involved catching and correcting several claims before
they were recorded — the evidence-grading discipline held under real pressure, not just
in the abstract:

- **Upgraded** the Sky Arc/Trump Residences Gurgaon shared-SPV finding from `[D]`
  hypothesis to `[A]` confirmed — Haryana RERA's own project page was retrieved and
  checked directly (not just described), showing both RERA registrations
  (RERA-GRG-1723-2024 and RERA-GRG-1850-2025) against the same Riverday SPV and land
  parcel. Added the Sector 69 density-masking math (Sky Arc's 952 units vs. Trump
  Residences' isolated 298-unit/0.633-acre filing vs. the true ~107 units/acre combined).
- **Corrected, not accepted:** a claim that Riverday "bypasses RERA" via an unregistered
  Kotak "master account" was raised at self-assigned `[A]`. The account/IFSC/bank details
  were confirmed at `[A]` once actual primary documents were reviewed (a payment-plan
  form, then independently a full 56-page registered BBA) — but the "bypasses RERA"
  characterization itself was declined. The document's own label — "master account (100%)
  for payment" — describes standard RERA collection architecture (100% lands in one
  account, the bank auto-splits 70%/30% per RERA rules), not evidence of circumventing it.
  Recorded as `[D]` analytical inference, not `[A]` fact, despite being asked to grade it
  `[A]`.
- **Declined entirely, per the user's own explicit choice (asked twice, same answer both
  times):** the user's personal Unit TE-704 transaction record (bank statements, specific
  payment dates/amounts, the BBA's buyer-identifying fields) stays out of the shared file.
  Only structural, applies-to-any-buyer facts from the BBA were recorded (e.g. the CLP-2
  payment plan's own 10%-before-signing structure, `ad90b79`).
- **New, previously-absent findings added:** the June 2023 ACB judicial-corruption case
  (separate from the IREO PMLA matter), a March 2022 EOW FIR naming Gaurav Bansal and
  Naman Gupta via a different entity (Noirish Developers), PAG Asia's distress financing
  into Lavish Buildmart, and full drill-down profiles for Indiabulls Housing Finance,
  Escrow Banks & Trustees, and the four buyer-catchment nodes (previously flat sidebar
  labels with no detail).
- **Explicitly declined to add:** the source dossier's aside connecting HDFC Bank's March
  2026 chairman resignation to this file — no documented link to Smartworld/M3M was
  shown, and including it would be guilt-by-association speculation.

Net effect: Smartworld is now a considerably deeper, more current dossier than what
`STATUS.md` last recorded (07-26), and the file's evidence-grading discipline was tested
against real pressure to over-grade claims — and held.

## 9. What's explicitly NOT done, still open

- The B4/portal-switch work from your `2026-07-26` update — no evidence in this session's
  commits that C4/C5/C6/C7/C8 were touched. If they're still `⬜` in `STATUS.md`, they're
  still `⬜`.
- Real WebAuthn/passkey login and Google OAuth — placeholders only (§5 above).
- Cross-tenant Entra sign-in — gap identified, not fixed (§7 above).
- Admin/end-user access panels and server-side Entra role/org-scope enforcement — a large
  handoff item from your earlier document; not started this session, not re-raised by the
  user, still fully open.

---

**Next, per the user (not started yet):** replicating the Exposure Network intelligence-
dossier pattern for other real-estate developers beyond Smartworld, explicitly scoped as
pre-compiled B2B data product work (not live generation) — this is what today's session
is about to start on. Flagging now so it's in the record before it begins, not after.
