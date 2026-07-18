from fastapi import FastAPI

app = FastAPI(title="ODIC Orchestration")

@app.get('/health')
def health():
    return {"status": "ok", "service": "fastapi-orchestration"}
