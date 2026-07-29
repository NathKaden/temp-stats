FROM python:3.11-slim

WORKDIR /app

# Install Docker CLI to execute docker commands on the host daemon, and smartmontools for disk temps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    smartmontools \
    && curl -fsSL https://get.docker.com | sh \
    && apt-get purge -y curl \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
