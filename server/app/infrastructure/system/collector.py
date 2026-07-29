import os
import time
import platform
import socket
from datetime import datetime
import psutil
from app.core.config import settings
from app.domain.models import SystemMetricDomain

class SystemMetricsCollector:
    @staticmethod
    def get_dir_size(path: str) -> float:
        total_size = 0
        try:
            if os.path.exists(path):
                count = 0
                for dirpath, dirnames, filenames in os.walk(path):
                    for f in filenames:
                        fp = os.path.join(dirpath, f)
                        if not os.path.islink(fp):
                            total_size += os.path.getsize(fp)
                        count += 1
                        if count > 2000:
                            break
                    if count > 2000:
                        break
        except Exception:
            pass
        return round(total_size / (1024 ** 3), 1)

    @staticmethod
    def get_cpu_name() -> str:
        try:
            if platform.system() == "Windows":
                import winreg
                key = winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"HARDWARE\DESCRIPTION\System\CentralProcessor\0")
                name = winreg.QueryValueEx(key, "ProcessorNameString")[0]
                return name.strip()
            elif platform.system() == "Linux":
                if os.path.exists("/proc/cpuinfo"):
                    with open("/proc/cpuinfo", "r") as f:
                        for line in f:
                            if "model name" in line:
                                return line.split(":")[1].strip()
        except Exception:
            pass
        return platform.processor() or "Intel Core Processor"

    @staticmethod
    def query_docker_socket(path: str):
        import socket
        import json
        import os
        socket_path = "/var/run/docker.sock"
        if not os.path.exists(socket_path):
            return None
        try:
            s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            s.settimeout(2.0)
            s.connect(socket_path)
            request = f"GET {path} HTTP/1.0\r\nHost: localhost\r\n\r\n"
            s.sendall(request.encode('utf-8'))
            
            response = b""
            while True:
                data = s.recv(4096)
                if not data:
                    break
                response += data
            
            parts = response.split(b"\r\n\r\n", 1)
            if len(parts) < 2:
                return None
            return json.loads(parts[1].decode('utf-8'))
        except Exception:
            return None
        finally:
            try:
                s.close()
            except Exception:
                pass

    @staticmethod
    def get_container_mem_usage(container_id: str) -> float:
        import os
        # Try cgroups v2
        v2_path = f"/sys/fs/cgroup/system.slice/docker-{container_id}.scope/memory.current"
        if os.path.exists(v2_path):
            try:
                with open(v2_path, "r") as f:
                    return float(f.read().strip())
            except Exception:
                pass
        # Try cgroups v1
        v1_path = f"/sys/fs/cgroup/memory/docker/{container_id}/memory.usage_in_bytes"
        if os.path.exists(v1_path):
            try:
                with open(v1_path, "r") as f:
                    return float(f.read().strip())
            except Exception:
                pass
        # Try alternative cgroups v2 path
        v2_alt_path = f"/sys/fs/cgroup/docker/{container_id}/memory.current"
        if os.path.exists(v2_alt_path):
            try:
                with open(v2_alt_path, "r") as f:
                    return float(f.read().strip())
            except Exception:
                pass
        return 0.0

    @staticmethod
    def get_docker_ram_usage() -> str:
        import json
        import os
        import subprocess

        ram_usage = {}
        
        known_names = {
            "beskarfox": "Beskarfox",
            "nextcloud": "Nextcloud",
            "outline": "Outline",
            "nuc-stats": "Stats",
            "temp-stats": "Stats",
            "stats": "Stats",
            "minecraft": "Minecraft",
            "traefik": "Traefik"
        }

        # 1. Try Docker socket query and cgroups reading
        containers = SystemMetricsCollector.query_docker_socket("/containers/json")
        if containers:
            for container in containers:
                c_id = container.get("Id", "")
                names = container.get("Names", [])
                if not c_id or not names:
                    continue
                name = names[0].lstrip('/')
                
                # Group by compose project name if available, otherwise by container prefix
                labels = container.get("Labels", {})
                project = labels.get("com.docker.compose.project")
                if not project:
                    proj_parts = name.replace('_', '-').split('-')
                    project = proj_parts[0] if proj_parts else name
                
                project = project.strip().lower()
                project_display = known_names.get(project, project.capitalize())
                
                mem_bytes = SystemMetricsCollector.get_container_mem_usage(c_id)
                mem_mb = mem_bytes / (1024.0 * 1024.0)
                if mem_mb > 0:
                    ram_usage[project_display] = round(ram_usage.get(project_display, 0.0) + mem_mb, 1)

        # 2. Fallback to docker stats CLI if socket returned nothing (e.g. running outside docker, or permissions issues)
        if not ram_usage:
            try:
                result = subprocess.run(
                    ["docker", "stats", "--no-stream", "--format", "{{.Name}}:{{.MemUsage}}"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=3
                )
                if result.returncode == 0:
                    for line in result.stdout.strip().split("\n"):
                        if not line or ":" not in line:
                            continue
                        parts = line.split(":", 1)
                        if len(parts) < 2:
                            continue
                        name, mem_part = parts[0], parts[1]
                        mem_str = mem_part.split("/")[0].strip()
                        mem_mb = 0.0
                        try:
                            num_str = "".join([c for c in mem_str if c.isdigit() or c == "."])
                            value = float(num_str) if num_str else 0.0
                            if "gib" in mem_str.lower():
                                mem_mb = value * 1024.0
                            elif "mib" in mem_str.lower():
                                mem_mb = value
                            elif "kib" in mem_str.lower():
                                mem_mb = value / 1024.0
                            elif "b" in mem_str.lower():
                                mem_mb = value / (1024.0 * 1024.0)
                            else:
                                mem_mb = value
                        except ValueError:
                            pass
                        
                        if mem_mb > 0:
                            proj_parts = name.replace('_', '-').split('-')
                            project = proj_parts[0] if proj_parts else name
                            project = project.strip().lower()
                            project_display = known_names.get(project, project.capitalize())
                            ram_usage[project_display] = round(ram_usage.get(project_display, 0.0) + mem_mb, 1)
            except Exception:
                pass

        # 3. Always ensure our local Stats process is represented
        try:
            import psutil
            process = psutil.Process(os.getpid())
            local_stats_mb = process.memory_info().rss / (1024.0 * 1024.0)
            stats_key = "Stats"
            ram_usage[stats_key] = round(ram_usage.get(stats_key, 0.0) + local_stats_mb, 1)
        except Exception:
            pass

        return json.dumps(ram_usage)

    @staticmethod
    def get_hostname() -> str:
        try:
            return socket.gethostname()
        except Exception:
            return "host-machine"

    @staticmethod
    def get_cpu_temp(cpu_usage: float) -> float:
        # 1. Try psutil sensors
        try:
            temps = psutil.sensors_temperatures()
            if temps:
                # Look for typical CPU thermal zones
                for name in ['cpu-thermal', 'coretemp', 'acpitz', 'cpu_thermal']:
                    if name in temps and temps[name]:
                        return float(temps[name][0].current)
                # Fallback to any sensor
                for name, entries in temps.items():
                    if entries:
                        return float(entries[0].current)
        except Exception:
            pass

        # 2. Try Linux sysfs (Intel NUC/generic Linux)
        try:
            if os.path.exists("/sys/class/thermal/thermal_zone0/temp"):
                with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
                    temp_raw = f.read().strip()
                    return float(temp_raw) / 1000.0
        except Exception:
            pass

        # 3. Fallback: Return 0.0 if no hardware sensors are available
        return 0.0

    @staticmethod
    def get_disk_temps() -> tuple[float, float]:
        """Reads NVMe and SATA temperatures directly from Linux sysfs (hwmon)."""
        nvme_temp = 0.0
        sata_temp = 0.0
        
        try:
            hwmon_dir = "/sys/class/hwmon"
            if os.path.exists(hwmon_dir):
                for hwmon in os.listdir(hwmon_dir):
                    hwmon_path = os.path.join(hwmon_dir, hwmon)
                    name_path = os.path.join(hwmon_path, "name")
                    temp_path = os.path.join(hwmon_path, "temp1_input")
                    
                    if os.path.exists(name_path) and os.path.exists(temp_path):
                        with open(name_path, "r") as f:
                            name = f.read().strip()
                        
                        # Read NVMe temperature
                        if name == "nvme" and nvme_temp == 0.0:
                            with open(temp_path, "r") as f:
                                nvme_temp = float(f.read().strip()) / 1000.0
                                
                        # Read SATA temperature (requires 'drivetemp' kernel module)
                        elif name == "drivetemp" and sata_temp == 0.0:
                            with open(temp_path, "r") as f:
                                sata_temp = float(f.read().strip()) / 1000.0
                                
        except Exception as e:
            print(f"Error reading hwmon for disk temps: {e}")
            
        # Fallback for SATA: read from smartctl directly if installed and authorized
        if sata_temp == 0.0:
            import subprocess
            try:
                for dev in ["/dev/sda", "/dev/sdb", "/dev/sdc"]:
                    if not os.path.exists(dev):
                        continue
                    
                    # Try with '-d sat' for USB-SATA bridges
                    result = subprocess.run(["smartctl", "-A", "-d", "sat", dev], capture_output=True, text=True)
                    # smartctl returns non-zero if there are any logged SMART errors, so we don't check returncode.
                    for line in result.stdout.splitlines():
                        # Look for standard SMART temperature attributes (case insensitive)
                        line_lower = line.lower()
                        if "temperature" in line_lower:
                            parts = line.split()
                            # Typically the raw value is at the 10th column (index 9)
                            if len(parts) >= 10:
                                try:
                                    # Some disks have it at index 9, others at the end
                                    temp_val = float(parts[9])
                                    if temp_val > 0.0:
                                        sata_temp = temp_val
                                        break
                                except ValueError:
                                    pass
                    if sata_temp > 0.0:
                        break
            except Exception as e:
                print(f"Error reading SATA fallback with smartctl: {e}")
            
        return round(nvme_temp, 1), round(sata_temp, 1)

    @staticmethod
    def get_uptime() -> str:
        try:
            boot_time_timestamp = psutil.boot_time()
            uptime_seconds = time.time() - boot_time_timestamp

            days, rem = divmod(int(uptime_seconds), 86400)
            hours, rem = divmod(rem, 3600)
            minutes, seconds = divmod(rem, 60)

            parts = []
            if days > 0:
                parts.append(f"{days} jour{'s' if days > 1 else ''}")
            if hours > 0:
                parts.append(f"{hours} heure{'s' if hours > 1 else ''}")
            if minutes > 0:
                parts.append(f"{minutes} minute{'s' if minutes > 1 else ''}")

            if not parts:
                return "actif depuis moins d'une minute"
            return "actif depuis " + ", ".join(parts)
        except Exception:
            return "actif depuis durée inconnue"

    @classmethod
    def get_rapl_energy(cls):
        try:
            with open('/sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj', 'r') as f:
                return int(f.read().strip())
        except Exception:
            return None

    @classmethod
    def get_host_net_bytes(cls):
        total_rx = 0
        total_tx = 0
        
        # 1. Try reading from host's proc fs if mounted at /host/proc
        proc_net_dev = '/host/proc/net/dev'
        if not os.path.exists(proc_net_dev):
            proc_net_dev = '/proc/net/dev'
            
        try:
            if os.path.exists(proc_net_dev):
                with open(proc_net_dev, 'r') as f:
                    lines = f.readlines()
                
                has_interfaces = False
                for line in lines[2:]:  # skip headers
                    parts = line.split()
                    if len(parts) < 10:
                        continue
                    iface = parts[0].strip(':')
                    
                    # Exclude loopback, virtual interfaces, docker bridges, veths
                    if iface == 'lo' or iface.startswith('docker') or iface.startswith('br-') or iface.startswith('veth') or iface.startswith('vnet') or iface.startswith('wio'):
                        continue
                    
                    rx_bytes = int(parts[1])
                    tx_bytes = int(parts[9])
                    
                    total_rx += rx_bytes
                    total_tx += tx_bytes
                    has_interfaces = True
                
                if has_interfaces:
                    return total_rx, total_tx
        except Exception:
            pass
            
        # 2. Fallback to /sys/class/net if proc dev fails
        try:
            net_dir = '/sys/class/net'
            if os.path.exists(net_dir):
                has_interfaces = False
                for iface in os.listdir(net_dir):
                    if iface == 'lo' or iface.startswith('docker') or iface.startswith('br-') or iface.startswith('veth'):
                        continue
                    
                    rx_file = f'{net_dir}/{iface}/statistics/rx_bytes'
                    tx_file = f'{net_dir}/{iface}/statistics/tx_bytes'
                    
                    if os.path.exists(rx_file) and os.path.exists(tx_file):
                        with open(rx_file, 'r') as f:
                            total_rx += int(f.read().strip())
                        with open(tx_file, 'r') as f:
                            total_tx += int(f.read().strip())
                        has_interfaces = True
                if has_interfaces:
                    return total_rx, total_tx
        except Exception:
            pass
            
        return None

    @classmethod
    def collect(cls) -> SystemMetricDomain:
        # Get start RAPL energy and timestamp
        start_energy = cls.get_rapl_energy()
        start_time = time.time()

        # Get host device name
        device_name = cls.get_hostname()

        # 1. CPU usage
        cpu_usage = psutil.cpu_percent(interval=0.5)

        # 2. CPU Temperature
        cpu_temp = cls.get_cpu_temp(cpu_usage)

        # 3. Disk Temps (NVMe & SATA)
        disk_nvme_temp, disk_sata_temp = cls.get_disk_temps()

        # 4. Disk Space Usage (NVMe and SATA)
        nvme_path = 'C:\\' if platform.system() == 'Windows' else '/'
        try:
            disk_nvme = psutil.disk_usage(nvme_path)
            disk_total_gb = round(disk_nvme.total / (1024 ** 3), 1)
            disk_usage_gb = round(disk_nvme.used / (1024 ** 3), 1)
        except Exception:
            disk_total_gb = 250.0
            disk_usage_gb = 85.0

        # Services sizes breakdown on NVMe SSD
        stats_path = '/opt/stats'
        if platform.system() == 'Windows':
            stats_path = os.getcwd()

        import json
        services_breakdown = {}

        # Scan /opt dynamically
        if os.path.exists('/opt'):
            try:
                for entry in os.listdir('/opt'):
                    full_path = os.path.join('/opt', entry)
                    if os.path.isdir(full_path):
                        # Use the exact folder name as the key
                        size = cls.get_dir_size(full_path)
                        services_breakdown[entry] = size
            except Exception:
                pass

        # Fallbacks for key folders if they weren't found in /opt (e.g. running locally on Windows)
        for key, path in [("beskarfox", "/opt/beskarfox"), ("nextcloud", "/opt/nextcloud"), ("outline", "/opt/outline")]:
            if key not in services_breakdown or services_breakdown[key] == 0.0:
                size = cls.get_dir_size(path)
                if size > 0:
                    services_breakdown[key] = size

        if "stats" not in services_breakdown or services_breakdown["stats"] == 0.0:
            services_breakdown["stats"] = cls.get_dir_size(stats_path)

        # Query Docker system df to associate volume sizes and count docker images
        system_df = SystemMetricsCollector.query_docker_socket("/system/df")
        if system_df:
            try:
                # Docker volumes sizes
                volumes = system_df.get("Volumes", [])
                if volumes:
                    for vol in volumes:
                        name = vol.get("Name", "")
                        usage = vol.get("UsageData", {})
                        if usage:
                            size_bytes = usage.get("Size", 0)
                            size_gb = size_bytes / (1024 ** 3)
                            if size_gb > 0.05:  # more than 50MB
                                # Try to match to an existing service in services_breakdown (case-insensitive)
                                matched = False
                                for key in list(services_breakdown.keys()):
                                    if key.lower() in name.lower() or name.lower() in key.lower():
                                        services_breakdown[key] = round(services_breakdown.get(key, 0.0) + size_gb, 1)
                                        matched = True
                                        break
                                
                                # If no match, try to group under a base name derived from the volume name
                                if not matched:
                                    # E.g. beskarfox_db-data -> beskarfox
                                    parts = name.replace('_', '-').split('-')
                                    if parts:
                                        proj = parts[0]
                                        services_breakdown[proj] = round(services_breakdown.get(proj, 0.0) + size_gb, 1)

                # Docker images size
                images = system_df.get("Images", [])
                if images:
                    total_images_bytes = sum(img.get("Size", 0) for img in images)
                    docker_images_gb = round(total_images_bytes / (1024 ** 3), 1)
                    if docker_images_gb > 0:
                        services_breakdown["Docker Images"] = docker_images_gb
            except Exception:
                pass

        # Normalize and group keys under clean names
        known_names = {
            "beskarfox": "Beskarfox",
            "nextcloud": "Nextcloud",
            "outline": "Outline",
            "nuc-stats": "Stats",
            "temp-stats": "Stats",
            "stats": "Stats",
            "minecraft": "Minecraft",
            "traefik": "Traefik"
        }
        
        grouped_breakdown = {}
        for key, val in services_breakdown.items():
            lower_key = key.lower().strip()
            clean_key = known_names.get(lower_key, key.capitalize())
            grouped_breakdown[clean_key] = round(grouped_breakdown.get(clean_key, 0.0) + val, 1)

        # Calculate 'Autres' (Others)
        known_size = sum(v for k, v in grouped_breakdown.items() if k != "Autres")
        autres_size = round(disk_usage_gb - known_size, 1)
        if autres_size < 0:
            autres_size = 0.0

        grouped_breakdown["Autres"] = autres_size
        disk_services_json = json.dumps(grouped_breakdown)

        disk_sata_total_gb = 480.0
        disk_sata_usage_gb = 120.0
        try:
            sata_path = None
            if os.path.exists('/mnt/backup'):
                sata_path = '/mnt/backup'
            else:
                parts = psutil.disk_partitions(all=False)
                for p in parts:
                    if 'cdrom' in p.opts or p.fstype == '':
                        continue
                    if platform.system() == 'Windows':
                        if p.mountpoint.upper() != 'C:\\':
                            sata_path = p.mountpoint
                            break
                    else:
                        if p.mountpoint != '/' and (p.mountpoint.startswith('/mnt') or p.mountpoint.startswith('/media') or p.mountpoint.startswith('/data')):
                            sata_path = p.mountpoint
                            break
            if sata_path:
                disk_sata = psutil.disk_usage(sata_path)
                disk_sata_total_gb = round(disk_sata.total / (1024 ** 3), 1)
                disk_sata_usage_gb = round(disk_sata.used / (1024 ** 3), 1)
        except Exception:
            pass

        # 5. RAM Usage
        try:
            mem = psutil.virtual_memory()
            ram_total_mb = round(mem.total / (1024 ** 2), 1)
            ram_usage_mb = round(mem.used / (1024 ** 2), 1)
            ram_usage_percent = round(mem.percent, 2)
        except Exception:
            ram_total_mb = 8192.0
            ram_usage_mb = 2048.0
            ram_usage_percent = 25.0

        # 6. Network stats
        try:
            host_bytes_start = cls.get_host_net_bytes()
            psutil_start = psutil.net_io_counters()
            
            time.sleep(1.0)
            
            host_bytes_end = cls.get_host_net_bytes()
            psutil_end = psutil.net_io_counters()

            if host_bytes_start is not None and host_bytes_end is not None:
                rx_diff = host_bytes_end[0] - host_bytes_start[0]
                tx_diff = host_bytes_end[1] - host_bytes_start[1]
            else:
                rx_diff = psutil_end.bytes_recv - psutil_start.bytes_recv
                tx_diff = psutil_end.bytes_sent - psutil_start.bytes_sent

            # Calculate speed in MB/s (1024*1024 bytes)
            net_rx_mb = round(rx_diff / (1024 * 1024), 2)
            net_tx_mb = round(tx_diff / (1024 * 1024), 2)

            # Prevent negative speeds (e.g. if counter resets)
            if net_rx_mb < 0: net_rx_mb = 0.0
            if net_tx_mb < 0: net_tx_mb = 0.0
        except Exception:
            net_rx_mb = 0.0
            net_tx_mb = 0.0

        # 7. Uptime
        uptime = cls.get_uptime()

        # Get end RAPL energy and calculate actual consumption
        end_energy = cls.get_rapl_energy()
        end_time = time.time()

        rapl_power = None
        if start_energy is not None and end_energy is not None:
            elapsed = end_time - start_time
            if elapsed > 0:
                rapl_power = (end_energy - start_energy) / (1_000_000 * elapsed)

        # 8. Electricity consumption (W)
        if rapl_power is not None:
            # CPU RAPL power + NUC base idle power (rest of motherboard/components)
            power_usage_w = round(settings.POWER_BASE_W + rapl_power, 2)
        else:
            # Fallback dynamic formula: base_power + (max_power - base_power) * (cpu_usage / 100)
            power_usage_w = settings.POWER_BASE_W + (settings.POWER_MAX_W - settings.POWER_BASE_W) * (cpu_usage / 100.0)
            power_usage_w = max(settings.POWER_BASE_W, round(power_usage_w, 2))

        cpu_name = cls.get_cpu_name()
        ram_services_json = cls.get_docker_ram_usage()

        return SystemMetricDomain(
            device_name=device_name,
            cpu_temp=cpu_temp,
            cpu_usage=cpu_usage,
            disk_temp=disk_nvme_temp,
            disk_sata_temp=disk_sata_temp,
            disk_usage_gb=disk_usage_gb,
            disk_total_gb=disk_total_gb,
            disk_sata_usage_gb=disk_sata_usage_gb,
            disk_sata_total_gb=disk_sata_total_gb,
            ram_usage_mb=ram_usage_mb,
            ram_total_mb=ram_total_mb,
            ram_usage_percent=ram_usage_percent,
            net_rx_mb=net_rx_mb,
            net_tx_mb=net_tx_mb,
            uptime=uptime,
            power_usage_w=power_usage_w,
            disk_services_json=disk_services_json,
            cpu_name=cpu_name,
            ram_services_json=ram_services_json
        )
