// src/app/admin/page.tsx
"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  Terminal, 
  Database, 
  LogOut,
  Activity,
  Users
} from "lucide-react";

export default function AdminDashboard() {
  const logout = () => {
    // In a real app, call an API to clear the cookie
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-black p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-2xl font-bold">Admin Command Center</h1>
              <p className="text-sm text-gray-400">Gemini Platform Management</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded border border-red-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Rate Limit</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">2 req/min</div>
            <div className="text-xs text-green-400">Strict mode active</div>
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Model</span>
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">Gemini 1.5 Pro</div>
            <div className="text-xs text-blue-400">Production ready</div>
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Status</span>
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-green-400">Online</div>
            <div className="text-xs text-gray-500">System operational</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          <Link href="/admin/logs" className="block group">
            <div className="h-full p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500/50 hover:bg-gray-900/80 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-900/20 rounded-lg group-hover:bg-blue-900/30 transition-colors">
                  <Terminal className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Logs</h3>
              <p className="text-sm text-gray-400">
                View real-time user inputs, timestamps, and system events. Monitoring dashboard.
              </p>
            </div>
          </Link>

          <a href="/api/setup-db" target="_blank" className="block group">
            <div className="h-full p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-purple-500/50 hover:bg-gray-900/80 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-900/20 rounded-lg group-hover:bg-purple-900/30 transition-colors">
                  <Database className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Initialize Database</h3>
              <p className="text-sm text-gray-400">
                Run the setup script to create tables in Vercel Postgres. Use this for first-time deploy.
              </p>
            </div>
          </a>

        </div>
      </div>
    </div>
  );
}
