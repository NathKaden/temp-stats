#!/bin/bash

# Load .env file if it exists to retrieve local configuration
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# Configuration (defaults to env variables or fallback values)
API_KEY="${API_KEY:-your-secret-key}"
API_URL="${API_URL:-${NEXT_PUBLIC_API_URL:-http://localhost:8000}/api/metrics}"
DEVICE_NAME="${DEVICE_NAME:-$(hostname)}"

# Collect Metrics
CPU_TEMP=$(vcgencmd measure_temp | cut -d= -f2 | sed 's/..$//')
CPU_TEMP="${CPU_TEMP:-0.0}"

CPU_USAGE=$(vmstat 1 2 | tail -1 | awk "{print 100-\$15}")
CPU_USAGE="${CPU_USAGE:-0.0}"

# SSD / Disk
DISK_TEMP=$(sudo smartctl -A /dev/sda | grep "Temperature:" | head -1 | awk "{print \$2}")
if [ -z "$DISK_TEMP" ]; then DISK_TEMP=0; fi
DISK_TEMP="${DISK_TEMP:-0.0}"

DISK_USAGE_GB=$(df / | awk 'NR==2{printf "%.1f", $3/1048576}')
DISK_USAGE_GB="${DISK_USAGE_GB:-0.0}"

DISK_TOTAL_GB=$(df / | awk 'NR==2{printf "%.1f", $2/1048576}')
DISK_TOTAL_GB="${DISK_TOTAL_GB:-0.0}"

# RAM
RAM_USAGE_MB=$(free -m | awk "/Mem/{print \$3}")
RAM_USAGE_MB="${RAM_USAGE_MB:-0.0}"

RAM_TOTAL_MB=$(free -m | awk "/Mem/{print \$2}")
RAM_TOTAL_MB="${RAM_TOTAL_MB:-0.0}"

RAM_USAGE_PERCENT=$(free | awk "/Mem/{printf \"%.2f\", \$3/\$2*100}")
RAM_USAGE_PERCENT="${RAM_USAGE_PERCENT:-0.0}"

# Network Stats (auto-detects active interface like eth0 or wlan0, and calculates real-time speed)
NET_IFACE=$(awk 'NR>2 && $1!~"lo"{if($2>0){print $1; exit}}' /proc/net/dev 2>/dev/null | sed 's/://' | tr -d '[:space:]')
if [ -z "$NET_IFACE" ]; then NET_IFACE="eth0"; fi

# Read initial stats
INIT_STATS=$(cat /proc/net/dev 2>/dev/null | grep "$NET_IFACE")
RX1=$(echo "$INIT_STATS" | awk '{print $2}')
TX1=$(echo "$INIT_STATS" | awk '{print $10}')

sleep 1

# Read final stats
FINAL_STATS=$(cat /proc/net/dev 2>/dev/null | grep "$NET_IFACE")
RX2=$(echo "$FINAL_STATS" | awk '{print $2}')
TX2=$(echo "$FINAL_STATS" | awk '{print $10}')

# Calculate difference in MB (1048576 bytes) over 1s interval
NET_RX_MB=$(awk -v r1="${RX1:-0}" -v r2="${RX2:-0}" 'BEGIN { diff = (r2-r1)/1048576; if (diff < 0) diff = 0; printf "%.2f", diff }')
NET_TX_MB=$(awk -v t1="${TX1:-0}" -v t2="${TX2:-0}" 'BEGIN { diff = (t2-t1)/1048576; if (diff < 0) diff = 0; printf "%.2f", diff }')

NET_RX_MB="${NET_RX_MB:-0.0}"
NET_TX_MB="${NET_TX_MB:-0.0}"

# Uptime
UPTIME=$(uptime -p)
UPTIME="${UPTIME:-unknown}"

# Prepare JSON
JSON_PAYLOAD=$(cat <<EOF
{
  "device_name": "$DEVICE_NAME",
  "cpu_temp": $CPU_TEMP,
  "cpu_usage": $CPU_USAGE,
  "disk_temp": $DISK_TEMP,
  "disk_usage_gb": $DISK_USAGE_GB,
  "disk_total_gb": $DISK_TOTAL_GB,
  "ram_usage_mb": $RAM_USAGE_MB,
  "ram_total_mb": $RAM_TOTAL_MB,
  "ram_usage_percent": $RAM_USAGE_PERCENT,
  "net_rx_mb": $NET_RX_MB,
  "net_tx_mb": $NET_TX_MB,
  "uptime": "$UPTIME"
}
EOF
)

# Send to API
curl -X POST "$API_URL" \
     -H "Content-Type: application/json" \
     -H "x-api-key: $API_KEY" \
     -d "$JSON_PAYLOAD"
