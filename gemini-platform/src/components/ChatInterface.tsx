"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Loader2, Info, Lock, LogOut, Plus, MessageSquare, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

export default function ChatInterface() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // History State
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Dynamic Config Features
  const [systemMessage, setSystemMessage] = useState<string | null>(null);
  const [isMaintenance, setMaintenance] = useState(false);

  // Load Chats on Mount
  useEffect(() => {
    if (status === "authenticated") {
      fetchChats();
    }
  }, [status]);

  // Poll for system messages
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const config = await res.json();
          setSystemMessage(config.systemMessage || null);
          setMaintenance(config.isMaintenanceMode || false);
        }
      } catch (err) {
        // Silently fail
      }
    };
    checkConfig();
    const interval = setInterval(checkConfig, 15000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Failed to load chats", error);
    }
  };

  const loadChat = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/chats/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentChatId(id);
        setMessages(data.messages || []);
        if (window.innerWidth < 768) setSidebarOpen(false);
      }
    } catch (error) {
      console.error("Failed to load chat", id, error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const saveChat = async (newMessages: Message[]) => {
    if (!session) return;

    try {
      if (currentChatId) {
        // Update existing
        await fetch(`/api/chats/${currentChatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });
      } else {
        // Create new
        const firstUserMsg = newMessages.find(m => m.role === 'user');
        const title = firstUserMsg?.parts[0]?.text.slice(0, 30) || "New Chat";
        
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, messages: newMessages }),
        });
        
        if (res.ok) {
          const chat = await res.json();
          setCurrentChatId(chat.id);
          fetchChats();
        }
      }
    } catch (error) {
      console.error("Failed to save chat", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    const initialMessages = [...messages, userMessage];
    setMessages(initialMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.map((msg) => ({
            role: msg.role,
            parts: msg.parts,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");
      if (!response.body) throw new Error("ReadableStream not supported");

      setMessages((prev) => [...prev, { role: "model", parts: [{ text: "" }] }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponseText = "";
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkValue = decoder.decode(value, { stream: true });
        fullResponseText += chunkValue;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex].role === "model") {
             newMessages[lastIndex] = {
               ...newMessages[lastIndex],
               parts: [{ text: fullResponseText }]
             };
          }
          return newMessages;
        });
      }

      await saveChat([...initialMessages, { role: "model", parts: [{ text: fullResponseText }] }]);

    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "Error: Failed to get response." }] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] max-w-6xl mx-auto bg-white/5 rounded-xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-sm">
      
      {/* Sidebar - Desktop & Mobile */}
      <div className={cn(
        "bg-black/20 border-r border-white/10 flex flex-col transition-all duration-300 absolute md:relative z-20 h-full",
        isSidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden"
      )}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold text-white">Chats</h2>
            <button onClick={createNewChat} className="p-1 hover:bg-white/10 rounded">
                <Plus className="w-5 h-5 text-white" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {!session ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                    <p className="mb-2">Login to save history</p>
                    <Link href="/auth/login" className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        Login
                    </Link>
                </div>
            ) : (
                chats.map(chat => (
                    <button
                        key={chat.id}
                        onClick={() => loadChat(chat.id)}
                        className={cn(
                            "w-full text-left p-3 rounded-lg text-sm truncate transition-colors",
                            currentChatId === chat.id ? "bg-blue-600/20 text-blue-200" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="truncate">{chat.title || "New Chat"}</span>
                        </div>
                    </button>
                ))
            )}
        </div>

        {session && (
            <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                   <div className="text-sm text-gray-400 truncate w-32">
                       {session.user?.email}
                   </div>
                   <button onClick={() => signOut()} className="p-1 hover:bg-red-500/20 rounded hover:text-red-400 text-gray-400">
                       <LogOut className="w-4 h-4" />
                   </button>
                </div>
            </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="bg-white/10 p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-1 mr-2 text-gray-400 hover:text-white"
            >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              Gemini 3 Pro Platform
            </h1>
          </div>
          <div className="text-xs text-gray-400 font-mono hidden sm:block">
            Model: {process.env.NEXT_PUBLIC_GEMINI_MODEL || "Pro-Latest"}
          </div>
        </header>
        
        {/* System Announcement Banner */}
        {systemMessage && (
          <div className="bg-blue-900/40 border-b border-blue-500/30 p-2 text-center text-sm text-blue-200 flex items-center justify-center gap-2">
            <Info className="w-4 h-4" />
            {systemMessage}
          </div>
        )}

        {/* Maintenance Mode Overlay */}
        {isMaintenance && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-8">
            <Lock className="w-16 h-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">System Maintenance</h2>
            <p className="text-gray-400 max-w-md">
                The platform is currently undergoing scheduled maintenance. Please check back later.
            </p>
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
                <Bot className="w-16 h-16 text-white/5" />
                <p>Start a conversation with Gemini AI...</p>
                {!session && (
                    <p className="text-xs text-gray-500">
                        Login not detected. Chat history will not be saved.
                    </p>
                )}
            </div>
            )}
            {messages.map((msg, index) => (
            <div
                key={index}
                className={cn(
                "flex gap-3 max-w-[90%] md:max-w-[80%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
            >
                <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === "user" ? "bg-blue-600" : "bg-purple-600"
                )}
                >
                {msg.role === "user" ? (
                    <UserIcon className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
                </div>
                <div
                className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed overflow-x-auto",
                    msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white/10 text-gray-100 rounded-tl-sm border border-white/5"
                )}
                >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    code({node, inline, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                        ) : (
                        <code className={cn("bg-black/20 rounded px-1", className)} {...props}>
                            {children}
                        </code>
                        )
                    }
                    }}
                >
                    {msg.parts[0].text}
                </ReactMarkdown>
                </div>
            </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
            <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="p-3 rounded-2xl bg-white/10 text-white rounded-tl-sm border border-white/5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs text-gray-400">Thinking...</span>
                </div>
            </div>
            )}
            <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/10 relative">
            <div className="relative flex items-center">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-black/20 border border-white/10 rounded-full py-3 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-1.5 bg-purple-600 rounded-full hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                <Send className="w-5 h-5 text-white" />
                )}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
}
