"use client";
import { useEffect, useRef, useState } from "react";
export default function ChatWidget({ listingId }: { listingId: string }) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(()=>{ start(); }, []);
  useEffect(()=>{ const iv = setInterval(()=>{ if (conversationId) refresh(); }, 2500); return ()=>clearInterval(iv); }, [conversationId]);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  async function start() {
    const res = await fetch("/api/chat/start", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ listingId }) });
    const data = await res.json();
    setConversationId(data.id); await refresh(data.id);
  }
  async function refresh(id?: string) {
    const cid = id || conversationId; if (!cid) return;
    const res = await fetch(`/api/chat/messages?conversationId=${cid}`); const data = await res.json(); setMessages(data.messages || []);
  }
  async function send() {
    if (!conversationId || !input.trim()) return;
    await fetch("/api/chat/messages", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ conversationId, body: input, from: "buyer" }) });
    setInput(""); await refresh();
  }
  return (
    <div className="card p-4 h-[420px] flex flex-col">
      <div className="font-semibold mb-2">Chatta med säljaren</div>
      <div className="flex-1 overflow-auto space-y-2 pr-1">
        {messages.map((m, i)=>(
          <div key={i} className={`max-w-[80%] p-2 rounded-xl ${i%2===0 ? "bg-[var(--accent)] self-start" : "bg-slate-100 self-end"}`}>
            <div className="text-sm">{m.body}</div>
            <div className="text-[10px] opacity-60">{new Date(m.createdAt).toLocaleString("sv-SE")}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="mt-2 flex gap-2">
        <input className="input flex-1" placeholder="Skriv ett meddelande..." value={input} onChange={e=>setInput(e.target.value)} />
        <button className="btn btn-primary" onClick={send}>Skicka</button>
      </div>
      <p className="text-[11px] text-slate-500 mt-1">Demo: du skriver som köpare. (Auth/realtid kopplas vid lansering.)</p>
    </div>
  );
}
