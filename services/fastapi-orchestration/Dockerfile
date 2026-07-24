FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml ./
RUN pip install --no-cache-dir fastapi "uvicorn[standard]" pydantic "pyjwt[crypto]" requests
COPY app.py auth.py gia.py intelligence.py connect.py orgs.py search.py azure_search.py source_registry.json ./
COPY data ./data
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
