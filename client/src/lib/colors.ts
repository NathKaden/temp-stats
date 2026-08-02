// System-wide unified color system for services

export const SERVICE_COLORS: Record<string, string> = {
  beskarfox: "#10b981",   // Emerald
  nextcloud: "#3b82f6",   // Blue
  stats: "#a855f7",       // Purple
  minecraft: "#22c55e",   // Green
  outline: "#6366f1",     // Indigo
  autres: "#f94a29",      // Reddish Orange
  disponible: "rgba(255, 255, 255, 0.1)",
};

const EXTRA_PALETTE = [
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#e11d48", // Rose
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f97316", // Orange
];

/**
 * Returns a consistent, deterministic color for any service name.
 * Handles known service names as well as unknown dynamic services deterministically.
 */
export function getServiceColor(name: string): string {
  if (!name) return SERVICE_COLORS.autres;
  const lower = name.toLowerCase().trim();

  // Direct match or substring match for known services
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (lower === key || lower.includes(key)) {
      return color;
    }
  }

  // Deterministic hash for any new or unknown service name
  let hash = 0;
  for (let i = 0; i < lower.length; i++) {
    hash = lower.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % EXTRA_PALETTE.length;
  return EXTRA_PALETTE[index];
}
