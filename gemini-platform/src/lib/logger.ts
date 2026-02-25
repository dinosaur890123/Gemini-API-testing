import { query } from "@/lib/db";

export type LogEventType =
  | "chat_request"
  | "rate_limit"
  | "maintenance_block"
  | "register"
  | "admin_login"
  | "system"
  | string;

export interface LogEntry {
  timestamp?: string;
  message: string;
  event_type?: LogEventType;
  user_id?: string | number | null;
  user_email?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  path?: string | null;
  method?: string | null;
  chat_id?: string | number | null;
  metadata?: unknown;
}

// In-memory cache for fallback/buffer
export const logCache: LogEntry[] = [];

function normalizeLogEntry(entry: string | LogEntry): Required<Pick<LogEntry, "timestamp" | "message">> & LogEntry {
  if (typeof entry === "string") {
    return { timestamp: new Date().toISOString(), message: entry };
  }
  return {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
    message: entry.message,
  };
}

export async function addLog(entry: string | LogEntry) {
  const normalized = normalizeLogEntry(entry);

  // 1) Always update memory cache (best-effort)
  logCache.unshift(normalized);
  if (logCache.length > 200) logCache.pop();

  // 2) Try to persist to DB (best-effort; backward-compatible)
  try {
    const result = await query(
      "INSERT INTO logs (timestamp, message, event_type, user_id, user_email, ip, user_agent, path, method, chat_id, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [
        normalized.timestamp,
        normalized.message,
        normalized.event_type ?? null,
        normalized.user_id ?? null,
        normalized.user_email ?? null,
        normalized.ip ?? null,
        normalized.user_agent ?? null,
        normalized.path ?? null,
        normalized.method ?? null,
        normalized.chat_id ?? null,
        normalized.metadata === undefined ? null : JSON.stringify(normalized.metadata),
      ]
    );
    if (!result) return;
  } catch {
    // Likely schema is old (logs table missing new columns). Fall back to legacy insert.
    try {
      await query("INSERT INTO logs (message, timestamp) VALUES ($1, $2)", [normalized.message, normalized.timestamp]);
    } catch (innerError) {
      console.error("Failed to log to database:", innerError);
    }
  }
}

export async function getLogs() {
  try {
    const result = await query("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 200");
    if (result?.rows) return result.rows;
  } catch (error) {
    console.warn("Database query failed, using in-memory logs:", error);
  }

  return logCache;
}
