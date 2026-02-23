export const PROGRESS_SECTIONS = [
  { key: "install", label: "Install OpenClaw", path: "/install" },
  { key: "memory", label: "Memory Framework", path: "/memory" },
  { key: "config", label: "Config Editor", path: "/json-editor" },
  { key: "troubleshoot", label: "Troubleshooting", path: "/troubleshoot" },
] as const;

// Simple localStorage-based progress (no zustand needed to avoid adding deps)
const STORAGE_KEY = "openclaw-progress";

function getProgress(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setProgress(data: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function markSectionDone(key: string) {
  const p = getProgress();
  p[key] = true;
  setProgress(p);
  window.dispatchEvent(new Event("progress-update"));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("progress-update"));
}

export function getSectionProgress(): Record<string, boolean> {
  return getProgress();
}
