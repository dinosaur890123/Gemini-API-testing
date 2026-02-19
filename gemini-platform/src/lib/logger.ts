import { query } from "@/lib/db";

// In-memory cache for fallback and buffer
export const logCache: { timestamp: string; message: string }[] = [];

export async function addLog(message: string) {
  const timestamp = new Date().toISOString();
  
  // 1. Always update memory cache for instant UI feedback (if using memory mode)
  logCache.unshift({ timestamp, message });
  if (logCache.length > 100) {
    logCache.pop();
  }

  // 2. Try to persist to database
  try {
    const result = await query(
      "INSERT INTO logs (message, timestamp) VALUES ($1, $2)",
      [message, timestamp]
    );
    if (!result) {
      // DB not connected, continue with memory only
      return; 
    }
  } catch (error) {
    console.error("Failed to log to database:", error);
    // Don't crash the request if logging fails
  }
}

export async function getLogs() {
  try {
    // Try to fetch from DB first
    const result = await query("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100");
    if (result && result.rows) {
      return result.rows;
    }
  } catch (error) {
    console.warn("Database query failed, using in-memory logs:", error);
  }
  
  // Fallback to memory
  return logCache;
}
