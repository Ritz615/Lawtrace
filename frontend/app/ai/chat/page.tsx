"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Bot, Send, FileText, AlertTriangle, Sparkles, ChevronRight } from "lucide-react";
import type { RiskLevel } from "@/types";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: { text: string; chunk_index: number }[];
  timestamp: Date;
}

const SUGGESTED = [
  "Summarize this contract",
  "What are my termination rights?",
  "Who owns the intellectual property?",
  "Are there any penalties?",
  "What is my notice period?",
  "Explain the liability clause",
];

const MOCK_DOC = { id: "demo", name: "ServiceAgreement_Acme.pdf", risk: "high" as RiskLevel };

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: `👋 I'm LexAI, your AI Legal Assistant.\n\nI've analyzed **${MOCK_DOC.name}** and I'm ready to answer your questions. Ask me anything about this contract — termination rights, payment terms, risks, or anything else.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with real API call in Phase 3)
    await new Promise((r) => setTimeout(r, 1500));

    const aiResponses: Record<string, string> = {
      "summarize": "This **Service Agreement** between Acme Corp (Client) and TechVentures Inc (Provider) covers software development services for 12 months at $15,000/month. \n\n⚠️ **Key risks identified:**\n- Unlimited liability clause (Clause 8.2)\n- No IP ownership specified\n- 15% early termination penalty",
      "termination": "According to **Clause 12.3**, you can terminate this contract with **30 days written notice**. However:\n\n⚠️ **HIGH RISK:** A termination penalty of **15% of the remaining contract value** applies.\n\nFor a $15,000/month contract with 6 months remaining, that's approximately **$13,500**.\n\n📎 Source: Clause 12.3, Page 8",
      "intellectual property": "⚠️ **No IP ownership clause was found in this contract.**\n\nThis is a **CRITICAL RISK**. Without an explicit IP clause:\n- Work created may default to the Provider's ownership\n- You may not be able to use deliverables freely\n\n**Recommendation:** Add an IP assignment clause before signing.",
      default: "Based on my analysis of the contract, I found relevant information in Clauses 3-5. The contract appears to be a standard service agreement with some notable risk areas. Would you like me to focus on any specific clause or section?",
    };

    const lower = text.toLowerCase();
    const response = Object.entries(aiResponses).find(([k]) => lower.includes(k))?.[1] ?? aiResponses.default;

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: response,
      sources: [{ text: "...termination with 30 days written notice with 15% penalty...", chunk_index: 23 }],
      timestamp: new Date(),
    };
    setMessages((p) => [...p, aiMsg]);
    setIsLoading(false);
  };

  return (
    <AppShell title="AI Legal Assistant">
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto">
        {/* Doc header */}
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl mb-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{MOCK_DOC.name}</p>
            <p className="text-xs text-muted-foreground">Powered by RAG • ChromaDB • LangChain</p>
          </div>
          <RiskBadge level={MOCK_DOC.risk} showIcon />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-end
                  ${msg.role === "ai" ? "bg-primary/10" : "gradient-primary"}`}>
                  {msg.role === "ai"
                    ? <Bot className="h-4 w-4 text-primary" />
                    : <span className="text-white text-xs font-bold">R</span>}
                </div>

                <div className={`max-w-[75%] space-y-1`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${msg.role === "user"
                      ? "gradient-primary text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm"}`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={line === "" ? "h-2" : ""}>
                        {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </p>
                    ))}
                  </div>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {msg.sources.map((s, i) => (
                        <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                          📎 Chunk {s.chunk_index}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div className="flex flex-wrap gap-2 py-3 flex-shrink-0">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs bg-secondary hover:bg-primary/10 hover:text-primary border border-border hover:border-primary/30
                         px-3 py-1.5 rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-3 flex-shrink-0">
          <div className="flex-1 relative">
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about this contract…"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-card border border-border rounded-2xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all
                         disabled:opacity-60"
            />
          </div>
          <button
            id="chat-send"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="btn-primary px-4 py-3 flex items-center gap-2 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
