"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { SIZES, LENGTHS, COLORS, MATERIALS, BRANDS } from "@/lib/taxonomy";
function setParam(router: any, sp: URLSearchParams, k: string, v: string) {
  const p = new URLSearchParams(sp as any);
  v ? p.set(k, v) : p.delete(k);
  router.push("/?" + p.toString());
}
export default function Filters() {
  const router = useRouter();
  const sp = useSearchParams();
  return (
    <div className="card p-4 space-y-3">
      <h2 className="font-semibold">Filtrera</h2>
      <input className="input" placeholder="Sök märke, titel..." defaultValue={sp.get("q") ?? ""}
        onKeyDown={(e)=>{ if(e.key==='Enter'){ setParam(router, sp as any, 'q', (e.target as HTMLInputElement).value ); }}} />
      <select className="select" defaultValue={sp.get("size") ?? ""} onChange={e=>setParam(router, sp as any, "size", e.target.value)}>
        <option value="">Storlek (alla)</option>
        {SIZES.map(s=> <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="select" defaultValue={sp.get("length") ?? ""} onChange={e=>setParam(router, sp as any, "length", e.target.value)}>
        <option value="">Längd (alla)</option>
        {LENGTHS.map(l=> <option key={l} value={l}>{l}</option>)}
      </select>
      <select className="select" defaultValue={sp.get("color") ?? ""} onChange={e=>setParam(router, sp as any, "color", e.target.value)}>
        <option value="">Färg (alla)</option>
        {COLORS.map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="select" defaultValue={sp.get("material") ?? ""} onChange={e=>setParam(router, sp as any, "material", e.target.value)}>
        <option value="">Material (alla)</option>
        {MATERIALS.map(m=> <option key={m} value={m}>{m}</option>)}
      </select>
      <select className="select" defaultValue={sp.get("brand") ?? ""} onChange={e=>setParam(router, sp as any, "brand", e.target.value)}>
        <option value="">Märke (alla)</option>
        {BRANDS.map(b=> <option key={b} value={b}>{b}</option>)}
      </select>
      <div>
        <label className="text-sm text-slate-600">Pris (kr)</label>
        <div className="flex gap-2 mt-1">
          <input className="input" type="number" placeholder="Min" defaultValue={sp.get("minPrice") ?? ""} 
            onBlur={(e)=>setParam(router, sp as any, "minPrice", (e.target as HTMLInputElement).value)} />
          <input className="input" type="number" placeholder="Max" defaultValue={sp.get("maxPrice") ?? ""} 
            onBlur={(e)=>setParam(router, sp as any, "maxPrice", (e.target as HTMLInputElement).value)} />
        </div>
      </div>
      <button className="btn btn-outline w-full" onClick={()=>router.push("/")}>Rensa</button>
    </div>
  );
}
