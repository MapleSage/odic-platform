# Atlas Entra OIDC — setup and status (2026-07-19)

## App Registration
- Name: `atlas.sagesure.io`
- Client (app) ID: `30d2deb0-ee52-4949-a8f8-035e6053a812`
- Tenant ID: `e9394f90-446d-41dd-8c8c-98ac08c5f090` (maplesage.com / SageSure tenant)
- Type: **SPA / public client (PKCE)** — matches the `app1.sagesure.io` convention. No client secret exists or is needed.
- Sign-in audience: `AzureADandPersonalMicrosoftAccount` (matches `app1.sagesure.io` convention)
- Redirect URIs (SPA platform): `https://atlas.sagesure.io`, `http://localhost:3000`
- Exposed API scope: `api://30d2deb0-ee52-4949-a8f8-035e6053a812/access_as_user` (used so the SPA can get an access token to call its own backend)
- Delegated Graph permission: `User.Read` (admin consent granted)

The backend validates tokens against issuer `https://login.microsoftonline.com/<tenant>/v2.0`, restricted to this specific tenant — this is intentionally narrower than the app registration's own `AzureADandPersonalMicrosoftAccount` audience setting, so personal Microsoft accounts and other tenants cannot obtain a token the backend will accept, even though Entra would issue them one.

Passkey/FIDO2/Windows Hello/WebAuthn sign-in is handled entirely by Entra's hosted login page during the redirect — MSAL only redirects to `login.microsoftonline.com`, it never collects credentials itself, so any authentication method enabled for the tenant/user (including passkeys) works automatically. No custom biometric code was written.

## Required environment variables

### Backend (`services/fastapi-orchestration`)
| Var | Value | Secret? |
|---|---|---|
| `ENTRA_TENANT_ID` | `e9394f90-446d-41dd-8c8c-98ac08c5f090` | No — set in `infra/k8s/dev01/backend.yaml` as a plain env var |
| `ENTRA_CLIENT_ID` | `30d2deb0-ee52-4949-a8f8-035e6053a812` | No |

No client secret is required or stored anywhere — this is a public-client PKCE flow.

### Frontend (`apps/shell`), all optional — defaults match the values above
| Var | Default |
|---|---|
| `VITE_ENTRA_CLIENT_ID` | `30d2deb0-ee52-4949-a8f8-035e6053a812` |
| `VITE_ENTRA_TENANT_ID` | `e9394f90-446d-41dd-8c8c-98ac08c5f090` |
| `VITE_ENTRA_API_SCOPE` | `api://30d2deb0-ee52-4949-a8f8-035e6053a812/access_as_user` |
| `VITE_ENTRA_REDIRECT_URI` | `window.location.origin` at runtime |
| `VITE_API_BASE_URL` | empty (same-origin `/api/*`, matches ingress routing) |

## What's implemented
- `packages/auth`: real MSAL (`@azure/msal-browser`) `AuthProvider`/`useAuth`, login/logout via `loginRedirect`/`logoutRedirect`, silent token acquisition with redirect fallback.
- `apps/shell`: unauthenticated users see a sign-in screen (`Sign in with Microsoft`), not the app or any data. Authenticated users get the existing workspace shell; the avatar button in the top bar signs out. The `/api/workspace` fetch attaches `Authorization: Bearer <token>`.
- `services/fastapi-orchestration/auth.py`: validates the bearer token's signature via the tenant's JWKS (`PyJWKClient`), issuer, and audience before any `/api/*` route runs (`APIRouter(dependencies=[Depends(get_current_user)])`). `/health` stays open.
- Ingress `atlas-basic-auth` gate removed; the `atlas-basic-auth` secret deleted from the cluster. Access control is now enforced by the app, not the ingress.

## What is NOT yet verified (needs a human)
I cannot drive an interactive Microsoft login redirect/consent screen from this environment. What I verified headlessly:
- `/api/workspace` with no token → `401`
- `/api/workspace` with a garbage bearer token → `401` (not a crash)
- The deployed JS bundle contains the real sign-in gate and MSAL wiring (not a stale build)
- The tenant's JWKS endpoint is reachable from the backend pod and returns valid keys

**Not yet confirmed:** a real user clicking "Sign in with Microsoft," completing the Entra redirect, landing back on `atlas.sagesure.io` authenticated, seeing live workspace data, and signing out cleanly. Someone with a maplesage.com/SageSure account needs to do this once. Until that happens, treat auth as **implemented, not yet end-to-end tested**.
