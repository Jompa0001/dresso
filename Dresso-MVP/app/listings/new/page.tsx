"use client";
import { useState } from "react";
import { SIZES, LENGTHS, COLORS, MATERIALS } from "@/lib/taxonomy";
import ImageUploader from "@/components/ImageUploader";
export default function NewListing() {
  const [form, setForm] = useState<any>({ title: "", price: "", size: "", length: "", color: "", brand: "", description: "", images: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string|null>(null);
  async function submit(e: any) {
    e.preventDefault(); setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, price: parseInt(form.price || "0", 10) }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Något gick fel");
      const checkout = await fetch("/api/checkout/listing", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ listingId: data.id }) });
      const ch = await checkout.json(); if (ch.url) window.location.href = ch.url; else setMessage("Skapad! (Demo) Checkout-länk saknas.");
    } catch (err: any) { setMessage(err.message); } finally { setLoading(false); }
  }
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Sälj din klänning</h1>
      <form onSubmit={submit} className="space-y-4 max-w-2xl">
        <input className="input" placeholder="Titel" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
        <textarea className="input" rows={5} placeholder="Beskrivning" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Pris (kr)" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
          <input className="input" placeholder="Märke" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} />
          <select className="select" value={form.size} onChange={e=>setForm({...form, size:e.target.value})}>
            <option value="">Storlek</option>
            {SIZES.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select" value={form.length} onChange={e=>setForm({...form, length:e.target.value})}>
            <option value="">Längd</option>
            {LENGTHS.map(l=> <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="select" value={form.color} onChange={e=>setForm({...form, color:e.target.value})}>
            <option value="">Färg</option>
            {COLORS.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="select" value={form.material} onChange={e=>setForm({...form, material:e.target.value})}>
            <option value="">Material</option>
            {MATERIALS.map(m=> <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <ImageUploader onUploaded={(urls)=>setForm((f:any)=>({...f, images: urls}))} />
        <button className="btn btn-primary" disabled={loading}>{loading ? "Skapar..." : "Fortsätt till betalning (99 kr)"}</button>
        {message && <p className="text-red-600">{message}</p>}
      </form>
    </main>
  );
}
