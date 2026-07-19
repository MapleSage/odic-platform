# ODIC AKS overlays

This directory defines ODIC-owned Kubernetes manifests and overlays for deployment into shared dev01 AKS infrastructure.

## Current intent
- reuse shared dev01 cluster/platform patterns
- isolate ODIC into namespace `odic-dev01`
- map these overlays into the existing dev01 deployment system once the upstream infra repo/path is provided
