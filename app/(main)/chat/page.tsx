"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { HistoryPanel, type HistoryItem } from "@/components/history-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {HITESH_SIR_PERSONA} from "@/persona/hitesh"
import { PIYUSH_SIR_PERSONA } from "@/persona/piyush"

interface Video {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  videos?: Video[];
}

const QUICK_QUESTIONS = [
  "What can you help me with?",
  "Give me a fun fact",
  "Summarize the latest AI trends",
  "Help me write a short email",
  "Explain a concept simply",
  "Suggest a productivity tip",
];


export default function ChatPage() {
  const [selectedPersona, setSelectedPersona] = useState("HITESH_SIR");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory() {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (res.ok) setHistory(data.history || []);
    } catch {
      // silent — history is non-critical
    }
  }

  async function selectConversation(id: string) {
    const res = await fetch(`/api/history?id=${id}`);
    const data = await res.json();
    if (res.ok) {
      setConversationId(id);
      setMessages(
        (data.conversation.messages || []).map((m: any) => ({ role: m.role, content: m.content }))
      );
    }
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setLoading(true);

    const persona = selectedPersona === "HITESH_SIR" ? HITESH_SIR_PERSONA : PIYUSH_SIR_PERSONA;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, conversationId, persona}),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, videos: data.videos ?? [] }]);
      if (!conversationId) {
        setConversationId(data.conversationId);
        loadHistory();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Could not reach the server. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setConversationId(undefined);
    setMessages([]);
  }

  return (
    <>
      <HistoryPanel items={history} activeId={conversationId} onSelect={selectConversation} />

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <p className="text-sm text-muted-foreground">
            {conversationId ? "Continuing conversation" : "New conversation"}
          </p>
          <Button variant="outline" size="sm" onClick={startNewChat}>
            New chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Ask me anything</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try one of these, or type your own question below.
                  </p>
                </div>
                <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {QUICK_QUESTIONS.map((q) => (
                    <Card
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="cursor-pointer p-3 text-left text-sm transition-colors hover:border-primary hover:bg-accent"
                    >
                      {q}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {m.content}
                  {m.videos && m.videos.length > 0 && (
  <div className="mt-3 flex flex-col gap-2">
    {m.videos.map((video) => (
      <a
        key={video.url}
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-primary/20 bg-primary/5 p-3 transition hover:bg-primary/10"
      >
        <div className="font-medium">
          ▶ {video.title}
        </div>

        <div className="text-xs text-muted-foreground truncate">
          {video.url}
        </div>
      </a>
    ))}
  </div>
)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="border-t border-border p-4"
        >
          <div className="mx-auto max-w-3xl">

    {/* Toggle */}
    <div className="mb-3 flex rounded-full bg-muted p-1">
      <button
        type="button"
        onClick={() => setSelectedPersona("PIYUSH_SIR")}
        className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
          selectedPersona === "PIYUSH_SIR"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-background"
        }`}
      >
        PG
      </button>

      <button
        type="button"
        onClick={() => setSelectedPersona("HITESH_SIR")}
        className={`flex-1 rounded-full py-2 text-sm font-medium transition-all ${
          selectedPersona === "HITESH_SIR"
            ? "bg-primary text-primary-foreground shadow"
            : "text-muted-foreground hover:bg-background"
        }`}
      >
        HC
      </button>
    </div>
    </div>
          <div className="mx-auto flex max-w-3xl items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your persona…"
              className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="icon" className="rounded-full" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}
