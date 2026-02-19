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
  Trash2,
  RefreshCw,
  LayoutDashboard,
  Eye,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  chat_count: number;
}

interface Chat {
  id: number;
  title: string;
  user_email: string;
  user_name: string;
  created_at: string;
  updated_at: string;
  messages?: any[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'chats'>('dashboard');
  const [config, setConfig] = useState<any>({ rateLimit: 2, systemMessage: "", isMaintenanceMode: false });
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  useEffect(() => {
    fetch("/api/admin/config").then(res => res.json()).then(setConfig);
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'chats') fetchChats();
  }, [activeTab]);

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  };

  const fetchChats = async () => {
    const res = await fetch("/api/admin/chats");
    if (res.ok) setChats(await res.json());
  };
viewChat = async (id: number) => {
    const res = await fetch(`/api/admin/chats?id=${id}`);
    if (res.ok) {
        const chatData = await res.json();
        // Parse messages if it's a string
        if (typeof chatData.messages === 'string') {
            try {
                chatData.messages = JSON.parse(chatData.messages);
            } catch (e) {
                chatData.messages = [];
            }
        }
        setSelectedChat(chatData);
    }
  };

  const 
  const deleteUser = async (id: number) => {
    if (!confirm("Are you sure? This will delete the user and all their chats.")) return;
    await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchUsers();
  };

  const deleteChat = async (id: number) => {
    if (!confirm("Delete this chat?")) return;
    await fetch("/api/admin/chats", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchChats();
  };

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
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-950">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <div>
            <h1 className="text-xl font-bold">Admin Command Center</h1>
            <p className="text-xs text-gray-400">Gemini Platform Management</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 bg-gray-900 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('dashboard')}
             className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
           >
             <LayoutDashboard className="w-4 h-4" />
             Dashboard
           </button>
           <button 
             onClick={() => setActiveTab('users')}
             className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
           >
             <Users className="w-4 h-4" />
             Users
           </button>
           <button 
             onClick={() => setActiveTab('chats')}
             className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'chats' ? 'bg-gray-800 text-white shadow' : 'text-gray-400 hover:text-white'}`}
           >
             <MessageSquare className="w-4 h-4" />
             Chats
           </button>
        </nav>

        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded border border-red-900/50 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {activeTab === 'dashboard' && (
            <>
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
                  {config.activeModel || "Gemini 3.0 Flash"}
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                     <Terminal className="w-5 h-5 text-purple-500" />
                     Model Configuration
                  </h3>
                   <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm text-gray-400">Active Model</label>
                        <select 
                           value={config.activeModel || "gemini-3-flash-preview"}
                           onChange={(e) => updateSettings({ activeModel: e.target.value })}
                           className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                           <option value="gemini-3-flash-preview">Gemini 3.0 Flash Preview (Only Model)</option>
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

                <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                     <Link href="/admin/logs" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                        <Terminal className="w-5 h-5 text-blue-500" />
                        System Logs
                     </Link>
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-black rounded border border-gray-800">
                     <span className="text-gray-400 text-sm">View real-time system events</span>
                     <Link href="/admin/logs" className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded text-xs hover:bg-blue-900/50 border border-blue-900/50">
                        Open Logs
                     </Link>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 pt-4 border-t border-gray-800">
                     <Database className="w-5 h-5 text-purple-500" />
                     Database Actions
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-black rounded border border-gray-800">
                     <span className="text-gray-400 text-sm">Initialize Tables</span>
                     <a href="/api/setup-db" target="_blank" className="px-3 py-1 bg-purple-900/30 text-purple-400 rounded text-xs hover:bg-purple-900/50 border border-purple-900/50">
                        Run Setup
                     </a>
                  </div>
               </div>
            </div>
            </>
          )}

          {activeTab === 'users' && (
             <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                   <h2 className="text-lg font-bold">Registered Users ({users.length})</h2>
                   <button onClick={fetchUsers} className="p-2 hover:bg-gray-800 rounded"><RefreshCw className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-black text-gray-400 font-medium">
                         <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Chats</th>
                            <th className="p-4 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                         {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                               <td className="p-4 text-gray-500">#{user.id}</td>
                               <td className="p-4 font-medium text-white">{user.name}</td>
                               <td className="p-4 text-gray-400">{user.email}</td>
                               <td className="p-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                               <td className="p-4 text-white">{user.chat_count}</td>
                               <td className="p-4 text-right">
                                  <button 
                                    onClick={() => deleteUser(user.id)}
                                    className="p-2 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-500 transition-colors"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {users.length === 0 && (
                            <tr>
                               <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {activeTab === 'chats' && (
             <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                   <h2 className="text-lg font-bold">Recent Chats</h2>
                   <button onClick={fetchChats} className="p-2 hover:bg-gray-800 rounded"><RefreshCw className="w-4 h-4 text-gray-400" /></button>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="bg-black text-gray-400 font-medium">
                         <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Title</th> space-x-2">
                                  <button 
                                    onClick={() => viewChat(chat.id)}
                                    className="p-2 hover:bg-blue-900/30 rounded text-gray-500 hover:text-blue-500 transition-colors"
                                    title="View Chat"
                                  >
                                     <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => deleteChat(chat.id)}
                                    className="p-2 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-500 transition-colors"
                                    title="Delete Chat
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                         {chats.map(chat => (
                            <tr key={chat.id} className="hover:bg-gray-800/50 transition-colors">
                               <td className="p-4 text-gray-500">#{chat.id}</td>
                               <td className="p-4 font-medium text-white max-w-xs truncate">{chat.title || "Untitled"}</td>
                               <td className="p-4 text-gray-400">
                                  <div className="text-white">{chat.user_name}</div>
                                  <div className="text-xs text-gray-500">{chat.user_email}</div>

        {/* Chat Viewer Modal */}
        {selectedChat && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950 rounded-t-xl">
                 <div>
                    <h3 className="text-lg font-bold text-white">{selectedChat.title || "Untitled Chat"}</h3>
                    <p className="text-sm text-gray-400">User: {selectedChat.user_name} ({selectedChat.user_email})</p>
                 </div>
                 <button 
                   onClick={() => setSelectedChat(null)}
                   className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/50">
                 {selectedChat.messages && selectedChat.messages.length > 0 ? (
                    selectedChat.messages.map((msg: any, idx: number) => (
                       <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-xl ${
                             msg.role === 'user' 
                               ? 'bg-blue-600/20 text-blue-100 border border-blue-600/30 rounded-br-none' 
                               : 'bg-gray-800 text-gray-300 border border-gray-700 rounded-bl-none'
                          }`}>
                             <div className="text-xs font-bold mb-1 opacity-50 uppercase">{msg.role}</div>
                             <div className="whitespace-pre-wrap text-sm">{msg.parts ? msg.parts[0]?.text : (msg.content || JSON.stringify(msg))}</div>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-12 text-gray-500">
                       <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                       <p>No messages found in this chat.</p>
                    </div>
                 )}
              </div>

               <div className="p-4 border-t border-gray-800 bg-gray-950 rounded-b-xl flex justify-between items-center">
                  <span className="text-xs text-gray-500">ID: {selectedChat.id} • Created: {new Date(selectedChat.created_at).toLocaleString()}</span>
                  <button 
                     onClick={() => setSelectedChat(null)}
                     className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                  >
                     Close Viewer
                  </button>
               </div>
            </div>
          </div>
        )}
                               </td>
                               <td className="p-4 text-gray-500">{new Date(chat.updated_at).toLocaleString()}</td>
                               <td className="p-4 text-right">
                                  <button 
                                    onClick={() => deleteChat(chat.id)}
                                    className="p-2 hover:bg-red-900/30 rounded text-gray-500 hover:text-red-500 transition-colors"
                                  >
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {chats.length === 0 && (
                            <tr>
                               <td colSpan={5} className="p-8 text-center text-gray-500">No recent chats.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
}
