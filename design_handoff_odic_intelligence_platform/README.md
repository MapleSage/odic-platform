# Handoff: ODIC Enterprise Intelligence Platform -- Workspace Shell, Exposure Network & HubSpot Cards

## Overview
ODIC is positioned as an "Enterprise Intelligence Operating System": a workspace-driven, graph-aware application where users investigate organizations, people, risks, opportunities and documents without losing context. This bundle covers three deliverables:

1. **Workspace Shell** -- the core application frame (header, sidebar nav, GIA panel, utility rail) plus the Organization workspace (Overview / Timeline / Relationships / Documents / AI Insights / Activity Feed tabs), a Search workspace, and a Reports workspace.
2. **Exposure Network** -- a dedicated full-screen 360-degree counterparty/exposure network view (a Bloomberg-terminal-inspired dark data visualization) with click-through drill-down into entity detail and multi-level org-chart navigation ("Open as Full Chart").
3. **HubSpot CRM Cards** -- three record-page card designs (Company / Contact / Deal) intended for HubSpot's CRM Cards integration, shown in situ inside a schematic HubSpot record page.

## About the Design Files
The files in this bundle (`workspace-shell.html`, `exposure-network.html`, `hubspot-cards.html`) are **design references built as self-contained HTML/React prototypes** (using an internal "Design Component" runtime with inline styles and a lightweight templating layer). They are NOT production code to copy directly -- do not port the custom template syntax (`{{ }}` holes, `<sc-for>`, `<sc-if>`) or the internal component runtime into your codebase.

The task is to **recreate these HTML designs in your target codebase's existing environment** (React, Vue, Swift/UIKit, native Android, etc.) using its established component patterns, state management, and design-system primitives. If no frontend environment exists yet, choose the framework best suited to the project (React + a component library is a reasonable default for a data-dense enterprise app like this) and implement the designs there.

For the HubSpot Cards specifically: implement them as actual **HubSpot CRM Cards** via HubSpot's CRM Cards / UI Extensions API (React-based, using HubSpot's `@hubspot/ui-extensions` components) rather than raw HTML -- the mockups define the visual spec and information hierarchy, not the literal markup.

## Fidelity
**High-fidelity.** All three deliverables use final color values, typography, spacing and copy as intended. Recreate pixel-perfectly using your codebase's existing libraries -- adjust only what your design system's tokens require (e.g. if you have an established spacing scale, snap these measurements to the nearest token).

---

## Screens / Views

### 1. Workspace Shell (`workspace-shell.html`)

**Purpose:** Primary application frame. Users switch between four workspaces via the left nav (Organization, Search, Reports, Graph) while a persistent header (workspace switcher, global search, "Ask GIA") and a collapsible GIA intelligence panel stay available at all times.

**Layout:**
- CSS Grid, 4 columns x 2 rows: `212px sidebar | 1fr main | 56px utility rail | 0-380px GIA panel` x `64px header | 1fr body`.
- Header: dark navy (`#0D2B3D`) full-width bar. Flex row: logo mark (28x28px rounded-6px orange square with "OD" monospace wordmark) + wordmark/tagline stack, workspace-switcher pill (`#174D6D` bg), global search bar (flex:1, max-width 520px), "Ask GIA" pill (right-aligned before avatar), 32px circular user avatar (orange bg).
- Sidebar: dark navy, 14px/10px padding. Two sections ("WORKSPACES", "RECENT") each with an 10px monospace uppercase label. Nav items: 34x20px colored code-chip (e.g. "ORG", "SRCH") + label, active state = `#174D6D` background row + orange chip.
- Main content area: light background (`oklch(97% 0.006 240)`), 20px/24px padding, vertical scroll.
- Utility rail: white, 56px wide, vertically stacked icon buttons (GIA toggle, notification count, context).
- GIA panel: white, slides from 0 to 380px width when open. Contains a search-style input, quick-action pill row, and a list of recommendation cards (title, body, orange CTA pill).

**Organization workspace tabs** (Overview / Timeline / Relationships / Documents / AI Insights / Activity Feed), each full-width below a shared header (org name, risk badge, meta line, action buttons) and a 4-up stat-card row (white cards, colored 3px top border, label/value/sub):
- **Overview**: 2-column (1.3fr/1fr) -- left column stacks "Key People" and "Recent Activity" list cards; right column stacks "Risks" (severity chip + title + detail) and "Opportunities" (title + stage + value) list cards.
- **Timeline**: single white card, vertical list of dated events (date column, colored dot, label + detail).
- **Relationships**: 2-column -- left is a placeholder canvas (striped background) for a force-directed graph; right is a "Connections" list (`from -> type -> to` rows).
- **Documents**: single white card, 4-column table (Name / Type / Tag / Date) with a colored tag pill.
- **AI Insights**: 2-column grid of cards (colored dot + title, body text, outlined CTA pill).
- **Activity Feed**: sync-status chip row (channel name + colored dot + status, e.g. "Email -- Live" in green, "Social -- Delayed 12m" in amber), a row of filter pill chips (All/Email/Calls/Social/Filings/CRM -- clicking sets the active filter and re-filters the list client-side), and a white card list of activity rows (34x22px channel code chip, title, timestamp, snippet).

**Search workspace**: 3-column (220px filters / 1fr results / 320px preview). Filters list facet + count. Results are white cards (code chip, name, sub, tag). Preview pane shows a text summary of the selected result.

**Reports workspace**: 2-column (200px sticky table-of-contents / 1fr report body). Report body is a titled document with sections (Executive Summary, Evidence, Relationships, Visualizations, Timeline, Sources, AI Analysis, Recommendations), each anchor-linked from the TOC.

**Graph workspace**: embeds the Exposure Network component (see below) at 100% width/height within the workspace body, plus an "Open Full Screen" link to the standalone page.

### 2. Exposure Network (`exposure-network.html`)

**Purpose:** A dedicated, full-bleed 360-degree counterparty/exposure network for a single organization (sample data: a real-estate group with multiple project SPVs). Shows suppliers/vendors/licensees on the left, capital/institutions/buyers on the right, and the organization's project SPVs in the center, connected by real (sourced) relationship lines -- NOT a decorative full mesh. Every card and every line is clickable and opens a detail panel; SPV/entity cards can carry nested sub-entities with multi-level drill-down and an "Open as Full Chart" action that promotes a sub-entity into its own full-screen view.

**Layout:**
- Dark theme throughout: page bg `#050810`, card bg `#0E1826`/`#0A1A22`, borders `#22364a`.
- Header bar (`#0A0F1A`): back link, ticker-style wordmark, page purpose line.
- Sub-header bar (`#0D1420`): "Viewing: <org>", explainer copy, and a confidence-grade legend (colored circle + letter + label for grades A-D).
- Main canvas: fixed **1600x900px** coordinate space (deliberately NOT percentage/responsive -- horizontal scroll is expected and acceptable for this dense a diagram) containing:
  - Left column (7 rows, 445x88px cards, x=70): each card has a 5px colored left border (color = confidence grade), bold name, small role/description line, and a `[A]-[D]` grade badge top-right.
  - Right column: mirrored, x=1085.
  - Center: an orange-bordered "platform" card (320x64px) plus up to 6 cyan-bordered SPV/project cards (320x88px, x=640), one card intentionally skipped (blank row) to create visual rhythm.
  - Connector lines: thin SVG `<line>` elements ONLY (red `#B0424F` for left-to-center, green `#3E8A5A` for right-to-center), each with a matching invisible 12px-wide transparent hit-target line layered on top for click handling. Lines are real, specific relationships (one line per sourced edge), plus two legitimate "fan to all" edges (a low-confidence hypothesis vendor, and an escrow/custodian relationship that genuinely touches every SPV) rendered dashed/dimmed to visually distinguish them from the solid 1:1 edges.
- Evidence Inspector strip: a persistent cyan-bordered card below the canvas showing whatever was last clicked (title, subtitle, label/value rows).
- Two-column "Supplementary" lists below the canvas for entities not part of the main 1:1 mapping (still clickable, open the same detail modal).
- Interlocking Directorate panel: plain list of director names + which entities they bridge.

**Detail Modal** (opens on card/line click): fixed-position centered overlay, `#0A121C` bg, `1.5px solid #3DD6E8` border, max-width 760px, max-height 85vh scrollable. Structure: breadcrumb row (only shown when drill depth > 1, click any crumb to pop back to that level) -> title + subtitle + close (x) -> repeating sections (10.5px cyan uppercase heading + label/value rows) -> if the entity has sub-entities, a 2-column grid of clickable child cards plus an "Open as Full Chart" button (orange, top-right of that section).

**Full Chart view**: fixed full-screen overlay (`z-index:20`) replacing the whole viewport. Header with back link + entity title. Body: centered orange hub card for the entity, below it a 3-column grid of its children as cyan-bordered cards; clicking a child opens that child's own detail modal (which can itself have further children / its own "Open as Full Chart").

### 3. HubSpot CRM Cards (`hubspot-cards.html`)

**Purpose:** Three CRM record-page cards (Company / Contact / Deal) that surface ODIC intelligence natively inside HubSpot, switchable via a tab row for review purposes (in production these are three separate card definitions, not a tabbed single view).

**Layout (shared card shell, ~360px wide):**
- White card, `1px solid oklch(88% 0.008 240)` border, 8px radius, subtle shadow (`0 1px 3px rgba(0,0,0,0.05)`).
- Card header: 18x18px rounded-4px orange (`#FF7A59` -- HubSpot's brand accent) icon swatch + "ODIC Intelligence" title (13px/600) + right-aligned "Synced Xm ago" timestamp (10.5px, muted).
- Card body (16px padding):
  - **Company card**: risk-level chip + "Exposure score 71" line; 2x2 stat grid (Open Risks / Opportunities / Active Projects / Last Filing); a "GIA RECOMMENDATION" section (10.5px bold label + 12.5px body copy); two full-width action buttons ("Open in ODIC" filled orange, "Generate Report" outlined).
  - **Contact card**: "ROLE IN KNOWLEDGE GRAPH" freeform line; "LINKED RISKS & OPPORTUNITIES" list (name + colored tag pill per row); "LAST ACTIVITY" line; two actions ("Open in ODIC", "Log to Timeline").
  - **Deal card**: stage chip (green); 2-col stat grid (Deal Value / Win Propensity); "GIA RECOMMENDATION" section; two actions ("Open in ODIC", "View Similar Deals").
- Each card is shown next to a schematic (non-functional, illustrative-only) HubSpot record page on the left -- avatar/icon, record name, record-type sub-label, a native tab row (Overview/Activities/Notes/Emails/Deals), and a placeholder note. This left column is NOT part of the deliverable -- it exists only to show the card in situ. Do not build it; HubSpot's own record page already provides this chrome.

**Content density rule:** keep each card to 3-5 data points plus exactly one primary (filled) and one secondary (outlined) action, matching HubSpot's own CRM Card conventions and size constraints.

---

## Interactions & Behavior

- **Nav switching** (Workspace Shell): clicking a sidebar item or workspace tab is a pure client-side state change (`activeView` / `activeOrgTab`), no page navigation, no animation beyond the existing 0.2s `fadeIn` keyframe on the main content region on every switch.
- **GIA panel**: toggled open/closed by clicking "Ask GIA" (header) or the GIA icon (utility rail); animate width 0 -> 380px (add a CSS transition in your implementation -- the prototype changes it instantly via conditional render, but a ~200ms ease-out slide is the intended feel).
- **Activity Feed filters**: clicking a channel pill sets the active filter and the list re-renders filtered client-side; "active" pill state = dark navy fill + white text, inactive = white fill + outlined border.
- **Exposure Network -- card/line click**: opens the Detail Modal with that item's data. Clicking the modal backdrop or the close (x) closes it; clicking inside the modal card must NOT close it (stop propagation).
- **Exposure Network -- drill-down**: clicking a sub-entity chip inside an open modal pushes a new level onto a breadcrumb stack and replaces the modal body with that entity's data (no close/reopen animation needed, instant swap is fine). Clicking a breadcrumb crumb pops the stack back to that level.
- **Exposure Network -- "Open as Full Chart"**: closes the modal and opens the full-screen chart overlay for that entity, replacing the entire viewport (not just the modal). "Back to Exposure Network" returns to the main diagram.
- **HubSpot Cards tab row** (review-only affordance, not part of the shipped card): switches which of the 3 sample cards is shown; not part of the production HubSpot integration.
- **Loading/empty states**: not explicitly designed in these mocks. Recommend: skeleton rows matching each card's row height for the Activity Feed and Exposure Network card lists while data loads; an explicit "No relationships evidenced yet" empty state for the Exposure Network when an org has no mapped edges.

## State Management

- **Workspace Shell**: `activeView` (organization | search | reports | graph), `activeOrgTab` (overview | timeline | relationships | documents | insights | activity), `giaOpen` (bool), `expandedGraphEdge` (index, legacy/unused after Graph tab was replaced by the embedded Exposure Network), `activityFilter` (all | email | call | social | filing | crm).
- **Exposure Network**: `selected` (last-clicked item for the inline inspector strip -- superseded by the modal but harmless to keep or drop), `modal` (current modal content object: `{title, subtitle, sections[], childList[]}` or null), `drillStack` (array of modal-content objects, last = currently shown, used for breadcrumbs), `chartView` (entity id or null -- when set, the full-chart overlay renders for that entity).
- **HubSpot Cards**: `tab` (company | contact | deal) -- review-only, not part of production state.
- **Data fetching (production)**: Workspace Shell and Exposure Network both need a backing "intelligence object" API (organizations, people, risks, opportunities, documents, activity-feed events per channel, relationship edges with evidence grade/source/notes, and an entity hierarchy for drill-down). The Activity Feed additionally needs per-channel sync-status metadata (last-synced timestamp, live/delayed/error state) from whatever ingestion/cron jobs back Email, Calls, Social, Filings and CRM.

## Design Tokens

**Color -- Workspace Shell (light theme):**
- Background: `oklch(97% 0.006 240)` (page), `white` (cards)
- Text: `oklch(22% 0.03 250)` (primary), `oklch(45-55% 0.02 250)` (secondary/muted)
- Navy chrome (header/sidebar): `#0D2B3D` (base), `#174D6D` (elevated/active), `#0D2B3D` (badge text on orange)
- Accent orange (primary action / brand): `#F7761F`
- Accent teal (secondary/info): `#3D9CA2`
- Semantic: risk/critical `oklch(45% 0.16 35)` on `oklch(92% 0.08 40)`; success/opportunity `oklch(45-50% 0.1 155)` on `oklch(93% 0.06 150)`; warning `oklch(48% 0.13 65)` on `oklch(93% 0.07 70)`
- Borders: `oklch(88-92% 0.006-0.008 240)`
- Shadow: `0 1px 2px rgba(0,0,0,0.06)`

**Color -- Exposure Network (dark theme):**
- Background: `#050810` (page), `#0E1826`/`#0A1A22`/`#0A121C` (cards/modal), `#0A0F1A`/`#0D1420` (header bars)
- Borders: `#22364a` / `#1E2E40`
- Grade colors: A `#4CAF6D`, B `#3D9CA2`, C `#D4A017`, D `#9B6FD1`
- Platform/primary accent: `#F7761F` (orange), SPV accent: `#3DD6E8` (cyan)
- Edge colors: left-to-center `#B0424F` (muted red), right-to-center `#3E8A5A` (muted green)

**Color -- HubSpot Cards:** matches Workspace Shell light theme, plus HubSpot's own brand orange `#FF7A59` for the card icon and primary button (used only inside these cards, to feel native to HubSpot).

**Typography:**
- Headings/UI: `IBM Plex Sans` (400/500/600/700)
- Monospace (labels, codes, data): `IBM Plex Mono` (400/500/600/700)
- Sizes in use: 9-11px (micro labels/codes), 12-13px (body/list text), 14px (card values / nav labels), 15-16px (card titles / stat values), 18-24px (page/record titles)

**Spacing scale observed:** 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20 / 24 / 28 / 32px

**Radius:** 4px (small chips/badges), 6px (buttons/cards/rows), 8px (panels/major cards), 50% (avatars/dots)

**Shadow:** `0 1px 2px rgba(0,0,0,0.06)` (light theme cards), `0 1px 3px rgba(0,0,0,0.05)` (HubSpot cards)

## Assets
No external image assets. All "imagery" is schematic (striped placeholder backgrounds for graph canvases). Logo mark is a simple typographic "OD" wordmark on a colored square (no icon font/SVG asset). Google Fonts: IBM Plex Sans, IBM Plex Mono (loaded via `<link>` in each file's `<head>`).

## Files
- `workspace-shell.html` -- ODIC Workspace Shell (full application frame + Organization/Search/Reports/Graph workspaces)
- `exposure-network.html` -- 360-degree Exposure Network (standalone full-screen view, also embedded inside the Workspace Shell's Graph tab)
- `hubspot-cards.html` -- HubSpot CRM Card designs (Company / Contact / Deal)

Open any file directly in a browser to view/interact with it -- each is fully self-contained (no build step, no server required).
