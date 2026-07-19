# Design Sync Note — 2026-07-19

Pulled current `odic-platform` remote and confirmed Claude Design artifacts now present in the repository under:
- `design_handoff_odic_intelligence_platform/README.md`
- `design_handoff_odic_intelligence_platform/workspace-shell.html`
- `design_handoff_odic_intelligence_platform/exposure-network.html`
- `design_handoff_odic_intelligence_platform/hubspot-cards.html`

## Implication
Backend work should now align to real frontend/design references instead of generic scaffolding.

## Immediate backend translation completed
- mapped workspace shell requirements to aggregate organization/search/report contracts
- mapped exposure-network design to graph/entity/relationship contracts
- mapped HubSpot card design to company/contact/deal payload contracts
- mapped service ownership across gateway/orchestration/graph/search/events/ingestion/connectors

## Next missing input
The runtime still does not directly expose the Mac local dev01 infra repo path. For cluster/deployment-level implementation, the actual shared infra repo/path still needs to be surfaced in a runtime-accessible location or mirrored into GitHub/workspace.
