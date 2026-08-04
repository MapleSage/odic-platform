import os

import jwt
import requests
from fastapi import Header, HTTPException
from jwt import PyJWKClient

ENTRA_TENANT_ID = os.environ.get("ENTRA_TENANT_ID", "e9394f90-446d-41dd-8c8c-98ac08c5f090")
ENTRA_CLIENT_ID = os.environ.get("ENTRA_CLIENT_ID", "30d2deb0-ee52-4949-a8f8-035e6053a812")

# Org-only: the App Registration's signInAudience is AzureADMyOrg (no personal Microsoft
# accounts, no other organization's tenant) -- this must match at the token-validation
# layer too. Checking only the frontend/Azure config isn't enough on its own: a stolen or
# replayed token from a different issuer would otherwise still pass here. Previously this
# also accepted Microsoft's well-known "consumers" tenant (9188040d-6c67-4c5b-b112-
# 36a304b66dad) so personal accounts could authenticate -- removed along with the
# signInAudience change.
ACCEPTED_ISSUERS = [
    f"https://login.microsoftonline.com/{ENTRA_TENANT_ID}/v2.0",
]
# Tenant-specific JWKS now that only this org's tokens are accepted -- "common" JWKS
# exists to also cover personal-account signing keys, which are no longer relevant here.
JWKS_URL = f"https://login.microsoftonline.com/{ENTRA_TENANT_ID}/discovery/v2.0/keys"
ACCEPTED_AUDIENCES = {ENTRA_CLIENT_ID, f"api://{ENTRA_CLIENT_ID}"}

_jwk_client: PyJWKClient | None = None


def _get_jwk_client() -> PyJWKClient:
    global _jwk_client
    if _jwk_client is None:
        _jwk_client = PyJWKClient(JWKS_URL)
    return _jwk_client


def verify_token(token: str) -> dict:
    try:
        signing_key = _get_jwk_client().get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=list(ACCEPTED_AUDIENCES),
            issuer=ACCEPTED_ISSUERS,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc
    return claims


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    return verify_token(token)


# Entra App Roles assigned to a user appear in the token's "roles" claim automatically --
# no extra scope request needed. "Atlas.Admin" is the only role defined so far (see the
# App Registration); more granular roles can be added the same way later without
# changing how callers use is_admin().
def is_admin(user: dict) -> bool:
    return "Atlas.Admin" in (user.get("roles") or [])
