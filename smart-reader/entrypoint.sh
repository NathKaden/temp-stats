#!/bin/sh
while true; do
  for disk in sda sdb; do
    if smartctl -A -d sat /dev/$disk > /shared/sata_temp_${disk}.tmp 2>/dev/null; then
      mv /shared/sata_temp_${disk}.tmp /shared/sata_temp_${disk}.txt
    fi
  done
  sleep 60
done
