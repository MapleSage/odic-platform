import os

import requests
from fastapi import HTTPException
from pydantic import BaseModel

AZURE_OPENAI_ENDPOINT = os.environ.get("AZURE_OPENAI_ENDPOINT", "").rstrip("/")
AZURE_OPENAI_API_KEY = os.environ.get("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_DEPLOYMENT = os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
AZURE_OPENAI_API_VERSION = "2024-08-01-preview"

SYSTEM_PROMPT = (
    "You are Atlas AI, the embedded intelligence assistant inside Atlas, an "
    "Enterprise Intelligence OS for investigating organizations, risks, "
    "opportunities, and counterparty relationships. Answer using only the "
    "workspace context provided below. If the context doesn't cover the "
    "question, say so plainly rather than inventing facts. Be concise -- "
    "this renders in a narrow side panel, not a document."
)


class ChatRequest(BaseModel):
    message: str
    context: str = ""


class ChatResponse(BaseModel):
    reply: str


def ask_gia(request: ChatRequest) -> ChatResponse:
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="Atlas AI is not configured in this environment")

    url = f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version={AZURE_OPENAI_API_VERSION}"
    payload = {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Workspace context:\n{request.context}\n\nQuestion: {request.message}"},
        ],
        "temperature": 0.4,
        "max_tokens": 500,
    }

    try:
        response = requests.post(
            url,
            headers={"api-key": AZURE_OPENAI_API_KEY, "Content-Type": "application/json"},
            json=payload,
            timeout=30,
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Atlas AI request failed: {exc}") from exc

    data = response.json()
    reply = data["choices"][0]["message"]["content"]
    return ChatResponse(reply=reply)
