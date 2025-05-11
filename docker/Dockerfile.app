FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

# Copy requirement files
COPY ./pyproject.toml .
COPY ./uv.lock .

# Copy source code
COPY ./src ./src

RUN uv sync --frozen

# Expose port 8001
EXPOSE 8000

ENTRYPOINT ["uv", "run", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]



