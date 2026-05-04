import { HistoryItem } from "@/types";

const HISTORY_KEY = "dl_history";
const MAX_HISTORY = 500;

const isBrowser = typeof window !== "undefined";

export function getHistory(): HistoryItem[] {
  if (!isBrowser) return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse history", e);
    return [];
  }
}

export function addHistory(item: HistoryItem): void {
  if (!isBrowser) return;
  const history = getHistory();
  // Prepend new item and enforce limit
  const updated = [item, ...history].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function deleteHistory(job_id: string): void {
  if (!isBrowser) return;
  const history = getHistory();
  const updated = history.filter((item) => item.job_id !== job_id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (!isBrowser) return;
  localStorage.removeItem(HISTORY_KEY);
}
