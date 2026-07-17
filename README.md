# NUC Monitor Dashboard

A full-stack monitoring solution for Intel NUC (and other host machines), featuring a FastAPI backend with an integrated cron worker for local metrics collection, and a Next.js frontend with historical charts.

## Architecture

- **NUC Backend (FastAPI):** Collects local system metrics (CPU, RAM, Disk, Network, Temperature) on a scheduled background cron worker, stores them in an SQLite database, and provides API endpoints.
- **NUC Frontend (Next.js):** Displays real-time overview and historical trends using Recharts and shadcn/ui.

## Setup Instructions

### 1. Deployment (Docker Compose)

1.  Clone this repository on your NUC.
2.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Adjust the `API_KEY` and `NEXT_PUBLIC_API_URL` in `.env`. You can also configure:
    - `COLLECTION_INTERVAL_SECONDS`: The interval in seconds for the background cron worker to collect metrics (default is `3600` seconds / 1 hour).
    - `POWER_BASE_W` and `POWER_MAX_W`: Power consumption estimates for your NUC.
4.  Launch the services:
    ```bash
    docker-compose up -d --build
    ```

## Features

- **Real-time Overview:** Latest CPU, RAM, Disk usage and Uptime.
- **Historical Charts:** Interactive graphs for Temperature, Usage, and Network statistics.
- **Data Table:** View the last 10 snapshots in a sorted table.
- **Atomic Design:** Clean and maintainable frontend component structure.
- **Secure:** Basic API key authentication for data submission.
