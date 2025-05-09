FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

# Copy requirement files
COPY pyproject.toml .
COPY uv.lock .

# Copy source code
COPY ./src ./src

RUN uv sync --frozen

# Set Environment
ENV PYTHONPATH=/app/src

# Expose port 8001
EXPOSE 8001

ENTRYPOINT ["uv", "run", "python", "-m", "src.auth"]



