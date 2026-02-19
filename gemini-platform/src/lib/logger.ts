export const logCache: { timestamp: string; message: string }[] = [];

export function addLog(message: string) {
  const timestamp = new Date().toISOString();
  logCache.unshift({ timestamp, message });
  // Keep only the last 100 logs
  if (logCache.length > 100) {
    logCache.pop();
  }
}

export function getLogs() {
  return logCache;
}
