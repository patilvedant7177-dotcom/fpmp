"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Determine user role based on path
  const getUserRole = () => {
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/faculty")) return "faculty";
    return "public";
  };

  const userRole = getUserRole();

  // Clear chat when role changes (e.g., login/logout) to ensure session privacy
  useEffect(() => {
    setMessages([]);
    setIsOpen(false);
  }, [userRole]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userRole,
          currentPage: pathname,
        }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I encountered an error. Please try again later." },
        ]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to connect to the assistant." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[380px] flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary p-4 text-on-primary shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-on-primary/20">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-headline text-[14px] font-bold">FPMP Assistant</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest">AI Powered</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                title="Reset Chat"
                className="rounded-full p-1.5 transition-colors hover:bg-on-primary/20"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 transition-colors hover:bg-on-primary/20"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-surface-container-lowest p-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles size={24} />
                </div>
                <h4 className="font-headline text-[15px] font-bold text-primary">
                  How can I help you today?
                </h4>
                <p className="mt-2 font-body text-[13px] text-secondary">
                  I'm your AI assistant for the Faculty Performance Management Portal.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-2 w-full">
                  <button 
                    onClick={() => setInput("What can you do?")}
                    className="rounded-lg border border-outline-variant/50 px-3 py-2 text-left font-body text-[12px] text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    &quot;What can you do?&quot;
                  </button>
                  
                  {userRole === "faculty" && (
                    <button 
                      onClick={() => setInput("How do I update my profile?")}
                      className="rounded-lg border border-outline-variant/50 px-3 py-2 text-left font-body text-[12px] text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      &quot;How do I update my profile?&quot;
                    </button>
                  )}

                  {userRole === "public" && (
                    <button 
                      onClick={() => setInput("How do I find a researcher?")}
                      className="rounded-lg border border-outline-variant/50 px-3 py-2 text-left font-body text-[12px] text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      &quot;How do I find a researcher?&quot;
                    </button>
                  )}

                  {userRole === "admin" && (
                    <button 
                      onClick={() => setInput("Show me faculty statistics.")}
                      className="rounded-lg border border-outline-variant/50 px-3 py-2 text-left font-body text-[12px] text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      &quot;Show me faculty statistics.&quot;
                    </button>
                  )}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex w-full gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm",
                    msg.role === "user" ? "bg-secondary text-on-secondary" : "bg-primary/10 text-primary"
                  )}
                >
                  {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 font-body text-[13px] leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-on-primary rounded-tr-none"
                      : "bg-surface-container text-on-surface rounded-tl-none border border-outline-variant/20"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex w-full gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-surface-container px-4 py-3 border border-outline-variant/20 rounded-tl-none shadow-sm">
                  <Loader2 size={14} className="animate-spin text-primary" />
                  <span className="text-[12px] text-secondary font-medium">Assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-outline-variant/30 bg-surface p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-full border border-outline-variant/50 bg-surface-container-low px-4 py-2 font-body text-[13px] outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-90",
          isOpen ? "bg-surface text-primary border border-outline-variant/30 rotate-90" : "bg-primary text-on-primary hover:scale-110"
        )}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-container border-2 border-primary"></span>
          </span>
        )}
      </button>
    </div>
  );
}
