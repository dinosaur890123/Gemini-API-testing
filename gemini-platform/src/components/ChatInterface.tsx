"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    setMessages((prev) => [...prev, userMessage]);
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

      // Initialize empty bot message
      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "" }] },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkValue = decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMessage = newMessages[lastIndex];
          
          if (lastMessage && lastMessage.role === "model") {
             const currentText = lastMessage.parts[0].text;
             newMessages[lastIndex] = {
               ...lastMessage,
               parts: [{ text: currentText + chunkValue }]
             };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto bg-white/5 rounded-xl border border-white/10 shadow-xl overflow-hidden backdrop-blur-sm">
      <header className="bg-white/10 p-4 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-400" />
          Gemini 3 Pro Platform
        </h1>
        <div className="text-xs text-gray-400 font-mono">
          Model: {process.env.NEXT_PUBLIC_GEMINI_MODEL || "Pro-Latest"}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-4">
            <Bot className="w-16 h-16 text-white/5" />
            <p>Start a conversation with Gemini AI...</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3 max-w-[80%]",
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
                <User className="w-5 h-5 text-white" />
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

      <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/10">
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
  );
}
