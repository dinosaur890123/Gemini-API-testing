// src/app/admin/page.tsx
"use client";

import { 
  ShieldCheck, 
  Terminal, 
  Database, 
  LogOut,
  Activity,
  Users,
  Settings,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getConfig } from "@/lib/config";

export default function AdminDashboard() {
  const [config, setConfig] = useState<any>({ rateLimit: 2, systemMessage: "", isMaintenanceMode: false });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetch("/api/admin/config").then(res => res.json()).then(setConfig);
  }, []);

  const updateSettings = async (updates: any) => {
    setLoading(true);
    await fetch("/api/admin/config", {
      method: "POST",
      body: JSON.stringify(updates)
    });
    const newConfig = await fetch("/api/admin/config").then(res => res.json());
    setConfig(newConfig);
    setLoading(false);
  };

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
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Rate Limit</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-4">
               <div className="text-2xl font-bold text-white">{config.rateLimit} req/min</div>
               <div className="flex gap-1">
                 <button 
                    onClick={() => updateSettings({ rateLimit: Math.max(0, config.rateLimit - 1) })}
                    className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 text-xs text-white"
                 >-</button>
                 <button 
                    onClick={() => updateSettings({ rateLimit: config.rateLimit + 1 })}
                    className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700 text-xs text-white"
                 >+</button>
               </div>
            </div>
            <div className="text-xs text-green-400">Dynamic scaling active</div>
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2 relative">
             {config.isMaintenanceMode && (
               <div className="absolute inset-0 bg-red-900/20 pointer-events-none" />
             )}
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">System Status</span>
              <Settings className="w-4 h-4" />
            </div>
            <div className={`text-2xl font-bold ${config.isMaintenanceMode ? "text-red-500" : "text-green-500"}`}>
              {config.isMaintenanceMode ? "Maintenance" : "Online"}
            </div>
            <button 
              onClick={() => updateSettings({ isMaintenanceMode: !config.isMaintenanceMode })}
              className={`text-xs px-2 py-1 rounded transition-colors ${config.isMaintenanceMode ? "bg-green-900 text-green-300 hover:bg-green-800" : "bg-red-900 text-red-300 hover:bg-red-800"}`}
            >
              {config.isMaintenanceMode ? "Go Online" : "Start Maintenance"}
            </button>
          </div>

          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-medium">Active Model</span>
              <Terminal className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-white truncate" title={config.activeModel}>
              {config.activeModel || "Gemini 1.5 Pro"}
            </div>
            <div className="text-xs text-blue-400">Production ready</div>
          </div>
        </div>

        {/* Global Announcement */}
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl">
           <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold text-white">Global Announcement</h3>
           </div>
           <div className="flex gap-4">
             <input 
               type="text" 
               placeholder="Enter a message to show all users..."
               className="flex-1 bg-black border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
               value={config.systemMessage || ""}
               onChange={(e) => setConfig({ ...config, systemMessage: e.target.value })}
             />
             <button 
               onClick={() => updateSettings({ systemMessage: config.systemMessage })}
               disabled={loading}
               className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
             >
               Broadcast
             </button>
             <button 
               onClick={() => updateSettings({ systemMessage: "" })}
               className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
             >
               Clear
             </button>
           </div>
           <p className="text-xs text-gray-500 mt-2">
             This message will appear as a banner on the chat interface for all active users.
           </p>
        </div>

        {/* AI Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Model Selection */}
           <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <Terminal className="w-5 h-5 text-purple-500" />
                 Model Configuration
              </h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">Active Model</label>
                    <select 
                       value={config.activeModel || "gemini-1.5-pro"}
                       onChange={(e) => updateSettings({ activeModel: e.target.value })}
                       className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                       <option value="gemini-1.5-pro">Gemini 1.5 Pro (Best Quality)</option>
                       <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</option>
                       <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Preview)</option>
                    </select>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">System Instruction (Persona)</label>
                    <textarea 
                       className="w-full h-32 bg-black border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none font-mono"
                       placeholder="You are a helpful assistant..."
                       value={config.systemInstruction || ""}
                       onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
                    />
                    <div className="flex justify-end">
                       <button 
                          onClick={() => updateSettings({ systemInstruction: config.systemInstruction })}
                          className="px-4 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded transition-colors"
                       >
                          Update Persona
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Quick Actions / Presets */}
            <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-blue-500" />
                 Quick Presets
              </h3>
              <div className="space-y-3">
                 <button 
                    onClick={() => updateSettings({ 
                       activeModel: "gemini-1.5-pro", 
                       systemInstruction: "You are a helpful, professional AI assistant focused on accuracy and clarity." 
                    })}
                    className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded text-left transition-colors flex items-center gap-3 group"
                 >
                    <div className="p-2 bg-blue-900/30 rounded group-hover:bg-blue-900/50 text-blue-400">
                       <Users className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="font-medium text-white">Helpful Assistant</div>
                       <div className="text-xs text-gray-400">Standard behavior with 1.5 Pro</div>
                    </div>
                 </button>

                 <button 
                    onClick={() => updateSettings({ 
                       activeModel: "gemini-1.5-flash", 
                       systemInstruction: "You are a concise coding expert. Provide only code and brief explanations." 
                    })}
                    className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded text-left transition-colors flex items-center gap-3 group"
                 >
                    <div className="p-2 bg-green-900/30 rounded group-hover:bg-green-900/50 text-green-400">
                       <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="font-medium text-white">Coding Expert</div>
                       <div className="text-xs text-gray-400">Fast 1.5 Flash optimized for code</div>
                    </div>
                 </button>

                 <button 
                    onClick={() => updateSettings({ 
                       activeModel: "gemini-1.5-pro", 
                       systemInstruction: "You are a creative writer. Use vivid imagery and metaphors." 
                    })}
                    className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded text-left transition-colors flex items-center gap-3 group"
                 >
                    <div className="p-2 bg-purple-900/30 rounded group-hover:bg-purple-900/50 text-purple-400">
                       <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="font-medium text-white">Creative Writer</div>
                       <div className="text-xs text-gray-400">Expressive persona</div>
                    </div>
                 </button>
              </div>
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
