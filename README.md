# Pi Monitor Dashboard

A full-stack monitoring solution for Raspberry Pi, featuring a FastAPI backend, a Next.js frontend with historical charts, and a lightweight bash client for data collection.

## Architecture

- **Raspberry Pi (Client):** Collects system metrics (CPU, RAM, Disk, Network) and sends them to the VPS via a cron job.
- **VPS Backend (FastAPI):** Receives metrics, stores them in an SQLite database, and provides API endpoints for the dashboard.
- **VPS Frontend (Next.js):** Displays real-time overview and historical trends using Recharts and shadcn/ui.

## Setup Instructions

### 1. VPS Deployment (Docker Compose)

1.  Clone this repository on your VPS.
2.  Create a `.env` file from `.env.example`:
    ```bash
    cp .env.example .env
    ```
3.  Adjust the `API_KEY` and `NEXT_PUBLIC_API_URL` in `.env`.
4.  Launch the services:
    ```bash
    docker-compose up -d --build
    ```

### 2. Raspberry Pi Configuration

1.  Copy `pi_monitor.sh` to your Raspberry Pi.
2.  Make it executable:
    ```bash
    chmod +x pi_monitor.sh
    ```
3.  Edit `pi_monitor.sh` and set your VPS IP and the `API_KEY` you configured in `.env`.
4.  Add a cron job to run it every 5 minutes:
    ```bash
    crontab -e
    ```
    Add the following line:
    ```cron
    */5 * * * * /path/to/pi_monitor.sh
    ```

## Features

- **Real-time Overview:** Latest CPU, RAM, Disk usage and Uptime.
- **Historical Charts:** Interactive graphs for Temperature, Usage, and Network statistics.
- **Data Table:** View the last 10 snapshots in a sorted table.
- **Atomic Design:** Clean and maintainable frontend component structure.
- **Secure:** Basic API key authentication for data submission.
