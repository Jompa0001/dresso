"use client";
import { useState } from "react";
import { SIZES, LENGTHS, COLORS, MATERIALS } from "@/lib/taxonomy";
import { bulkListingFeeSEK } from "@/lib/pricing";
type Draft = { title: string; price: string; size: string; length: string; color: string; brand: string; description: string; material?: string; images?: string[] };
function EmptyDraft(): Draft { return { title: "", price: "", size: "", length: "", color: "", brand: "", description: "" }; }
export default function NewBulk() {
  const [drafts, setDrafts] = useState<Draft[]>([EmptyDraft(), EmptyDraft()]);
  const [loading, setLoading] = useState(false);
  const count = drafts.filter(d=>d.title && d.price).length;
  const fee = bulkListingFeeSEK(count);
  function update(i: number, patch: Partial<Draft>) { setDrafts(ds => ds.map((d, idx)=> idx===i ? { ...d, ...patch } : d)); }
  async function submit(e: any) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/listings/bulk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ drafts }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Fel vid skapande.");
      const checkout = await fetch("/api/checkout/listing-bulk", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ listingIds: data.listingIds }) });
      const ch = await checkout.json(); if (ch.url) window.location.href = ch.url;
    } catch (err:any) { alert(err.message); } finally { setLoading(false); }
  }
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-2">Lägg upp flera klänningar</h1>
      <p className="text-sm text-slate-600 mb-4">Avgift för {count} annonser: <b>{fee} kr</b></p>
      <form onSubmit={submit} className="space-y-6">
        {drafts.map((d, i)=>(
          <div key={i} className="card p-4 space-y-3">
            <div className="font-semibold">Annons {i+1}</div>
            <input className="input" placeholder="Titel" value={d.title} onChange={e=>update(i, { title: e.target.value })} />
            <textarea className="input" rows={3} placeholder="Beskrivning" value={d.description} onChange={e=>update(i, { description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Pris (kr)" value={d.price} onChange={e=>update(i, { price: e.target.value })} />
              <input className="input" placeholder="Märke" value={d.brand} onChange={e=>update(i, { brand: e.target.value })} />
              <select className="select" value={d.size} onChange={e=>update(i, { size: e.target.value })}>
                <option value="">Storlek</option>
                {SIZES.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="select" value={d.length} onChange={e=>update(i, { length: e.target.value })}>
                <option value="">Längd</option>
                {LENGTHS.map(l=> <option key={l} value={l}>{l}</option>)}
              </select>
              <select className="select" value={d.color} onChange={e=>update(i, { color: e.target.value })}>
                <option value="">Färg</option>
                {COLORS.map(c=> <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="select" value={d.material || ""} onChange={e=>update(i, { material: (e.target as HTMLSelectElement).value })}>
                <option value="">Material</option>
                {MATERIALS.map(m=> <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline" onClick={()=>setDrafts(d=>[...d, EmptyDraft()])}>Lägg till en till</button>
          <button className="btn btn-primary" disabled={loading || count===0}>{loading ? "Skapar..." : `Betala & publicera (${fee} kr)`}</button>
        </div>
      </form>
    </main>
  );
}
