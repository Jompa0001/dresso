export default async function Admin() {
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL + "/api/admin/listings" : "/api/admin/listings", { cache: "no-store" });
  const data = await res.json();
  return (
    <main className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Admin – Annonser</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.items.map((it: any) => (
          <div key={it.id} className="card overflow-hidden">
            <div className="aspect-[4/5] bg-slate-100">{it.images?.[0] && <img src={it.images[0]} alt={it.title} className="w-full h-full object-cover" />}</div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between"><h3 className="font-semibold line-clamp-1">{it.title}</h3><div className="text-sm">{new Intl.NumberFormat("sv-SE").format(it.price)} kr</div></div>
              <p className="text-sm text-slate-600">{it.brand ?? "—"} · {it.size ?? "—"} · {it.length ?? "—"}</p>
              <p className="text-xs text-slate-500">Status: {it.status}{it.highlight ? " · Highlight" : ""}{it.bumpedAt ? " · Bumped" : ""}</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a className="btn btn-outline text-sm text-center" href={`/listings/${it.id}`} target="_blank">Öppna</a>
                <button className="btn btn-outline text-sm" onClick={async(e)=>{ e.preventDefault(); await fetch(`/api/admin/listings/${it.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: it.status === "ACTIVE" ? "HIDDEN" : "ACTIVE" }) }); location.reload(); }}>{it.status === "ACTIVE" ? "Dölj" : "Gör aktiv"}</button>
                <button className="btn btn-outline text-sm" onClick={async(e)=>{ e.preventDefault(); await fetch(`/api/admin/listings/${it.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: "SOLD" }) }); location.reload(); }}>Markera såld</button>
                <button className="btn btn-outline text-sm" onClick={async(e)=>{ e.preventDefault(); await fetch(`/api/admin/listings/${it.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ highlight: !it.highlight }) }); location.reload(); }}>{it.highlight ? "Ta bort highlight" : "Highlight"}</button>
                <button className="btn btn-outline text-sm col-span-2" onClick={async(e)=>{ e.preventDefault(); await fetch(`/api/admin/listings/${it.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ bumpedAt: new Date().toISOString() }) }); location.reload(); }}>Bump nu</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
