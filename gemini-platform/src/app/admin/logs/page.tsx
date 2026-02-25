
"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCcw, ShieldAlert } from "lucide-react";

type AdminLogRecord = {
  id?: number;
  timestamp: string;
  message: string;
  event_type?: string | null;
  user_email?: string | null;
  user_id?: string | number | null;
  ip?: string | null;
  user_agent?: string | null;
  path?: string | null;
  method?: string | null;
  chat_id?: string | number | null;
  metadata?: unknown;
};

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AdminLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-black p-8 text-white font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold">System Logs</h1>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Refresh
          </button>
        </header>

        <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-950 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="p-4 w-44">Timestamp</th>
                <th className="p-4 w-36">Event</th>
                <th className="p-4 w-56">User</th>
                <th className="p-4 w-40">IP</th>
                <th className="p-4 w-52">Route</th>
                <th className="p-4">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4 text-gray-500 whitespace-nowrap align-top font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 align-top">
                      <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-200">
                        {log.event_type || "(legacy)"}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-white text-sm truncate" title={log.user_email || "Unknown"}>
                        {log.user_email || "Unknown"}
                      </div>
                      {(log.user_id ?? null) !== null && (
                        <div className="text-xs text-gray-500">id: {String(log.user_id)}</div>
                      )}
                    </td>
                    <td className="p-4 text-gray-300 align-top font-mono text-xs whitespace-nowrap">
                      {log.ip || "-"}
                      {log.user_agent ? (
                        <div className="text-[10px] text-gray-500 truncate max-w-[10rem]" title={log.user_agent}>
                          {log.user_agent}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-4 text-gray-300 align-top">
                      <div className="text-xs font-mono">
                        {log.method || ""} {log.path || ""}
                      </div>
                      {log.chat_id ? <div className="text-[10px] text-gray-500">chat: {String(log.chat_id)}</div> : null}
                    </td>
                    <td className="p-4 text-green-400 font-medium break-all align-top group-hover:text-green-300">
                      {log.message}
                      {log.metadata ? (
                        <div className="text-[10px] text-gray-500 mt-1 break-words">
                          meta: {typeof log.metadata === "string" ? log.metadata : safeJson(log.metadata)}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-600 text-center">
          Logs are persisted to Postgres when configured; otherwise they fall back to in-memory.
        </p>
      </div>
    </div>
  );
}

