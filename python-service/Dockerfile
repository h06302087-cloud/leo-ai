FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Create non-root user for sandboxing
RUN useradd -m -u 1000 sandbox
USER sandbox

EXPOSE 3006

CMD ["python", "main.py"]
