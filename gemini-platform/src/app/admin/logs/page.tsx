
"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCcw, ShieldAlert } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<{ timestamp: string; message: string }[]>([]);
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
      <div className="max-w-4xl mx-auto space-y-6">
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
                <th className="p-4 w-48">Timestamp</th>
                <th className="p-4">Message Input</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-gray-500">
                    No logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4 text-gray-500 whitespace-nowrap align-top font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-green-400 font-medium break-all align-top group-hover:text-green-300">
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <p className="text-xs text-gray-600 text-center">
          Logs are stored in-memory and will clear on server restart (or lambda cold start).
        </p>
      </div>
    </div>
  );
}

