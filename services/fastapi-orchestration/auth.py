import os

import jwt
import requests
from fastapi import Header, HTTPException
from jwt import PyJWKClient

ENTRA_TENANT_ID = os.environ.get("ENTRA_TENANT_ID", "e9394f90-446d-41dd-8c8c-98ac08c5f090")
ENTRA_CLIENT_ID = os.environ.get("ENTRA_CLIENT_ID", "30d2deb0-ee52-4949-a8f8-035e6053a812")

ISSUER = f"https://login.microsoftonline.com/{ENTRA_TENANT_ID}/v2.0"
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
            issuer=ISSUER,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc
    return claims


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    return verify_token(token)
