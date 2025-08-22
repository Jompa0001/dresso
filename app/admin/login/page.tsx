"use client";
import { useState } from "react";
export default function AdminLogin() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string|null>(null);
  async function submit(e: any) {
    e.preventDefault(); setError(null);
    const res = await fetch("/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    if (res.ok) window.location.href = "/admin"; else setError("Fel token.");
  }
  return (
    <main className="container py-16 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Admin login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="ADMIN_TOKEN" value={token} onChange={e=>setToken(e.target.value)} />
        <button className="btn btn-primary" type="submit">Logga in</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <p className="text-xs text-slate-500 mt-4">Sätt <code>ADMIN_TOKEN</code> i .env/Vercel.</p>
    </main>
  );
}
