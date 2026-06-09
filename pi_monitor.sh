#!/bin/bash

# Configuration
API_URL="http://your-vps-ip:8000/api/metrics"
API_KEY="your-secret-key"

# Collect Metrics
CPU_TEMP=$(vcgencmd measure_temp | cut -d= -f2 | sed 's/..$//')
CPU_USAGE=$(vmstat 1 2 | tail -1 | awk "{print 100-\$15}")

# SSD / Disk
DISK_TEMP=$(sudo smartctl -A /dev/sda | grep "Temperature:" | head -1 | awk "{print \$2}")
if [ -z "$DISK_TEMP" ]; then DISK_TEMP=0; fi
DISK_USAGE_GB=$(df / | awk "NR==2{print \$3}" | sed 's/G//')
DISK_TOTAL_GB=$(df / | awk "NR==2{print \$2}" | sed 's/G//')

# RAM
RAM_USAGE_MB=$(free -m | awk "/Mem/{print \$3}")
RAM_TOTAL_MB=$(free -m | awk "/Mem/{print \$2}")
RAM_USAGE_PERCENT=$(free | awk "/Mem/{printf \"%.2f\", \$3/\$2*100}")

# Network (eth0)
NET_STATS=$(cat /proc/net/dev | grep eth0)
NET_RX_MB=$(echo $NET_STATS | awk "{printf \"%.2f\", \$2/1048576}")
NET_TX_MB=$(echo $NET_STATS | awk "{printf \"%.2f\", \$10/1048576}")

# Uptime
UPTIME=$(uptime -p)

# Prepare JSON
JSON_PAYLOAD=$(cat <<EOF
{
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
