import { prisma } from "@/lib/db";
import ChatWidget from "@/components/ChatWidget";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const item = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!item) return <main className="container py-10">Annons saknas.</main>;
  const price = new Intl.NumberFormat("sv-SE").format(item.price);

  return (
    <main className="container py-8 grid md:grid-cols-[1fr_320px] gap-6">
      <div className={`card overflow-hidden ${item.highlight ? "ring-2 ring-yellow-400" : ""}`}>
        <div className="aspect-[4/5] bg-slate-100">
          {item.images?.[0] && <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />}
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold">{item.title}</h1>
          <p className="text-slate-600 mt-1">{item.brand ?? "—"} · {item.size ?? "—"} · {item.length ?? "—"} · {item.material ?? "—"} · {item.color ?? "—"}</p>
          <p className="mt-4">{item.description}</p>
        </div>
      </div>
      <aside className="card p-5 h-max space-y-3">
        <div className="text-2xl font-extrabold">{price} kr</div>
        <a href="/listings/new" className="btn btn-outline">Sälj en liknande</a>
        <div className="pt-3 border-t">
          <div className="font-semibold mb-2">Boost‑alternativ</div>
          <a className="btn btn-outline w-full" href={`/api/checkout/addons`}
             onClick={(e)=>{ e.preventDefault(); fetch('/api/checkout/addons',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({listingId:'' + params.id + '', addons:['bump']})}).then(r=>r.json()).then(d=>{ if(d.url) window.location.href=d.url; }); }}>Lyft annons (Bump)</a>
          <a className="btn btn-outline w-full" href={`/api/checkout/addons`}
             onClick={(e)=>{ e.preventDefault(); fetch('/api/checkout/addons',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({listingId:'' + params.id + '', addons:['highlight']})}).then(r=>r.json()).then(d=>{ if(d.url) window.location.href=d.url; }); }}>Highlight</a>
        </div>
        <ChatWidget listingId={item.id} />
      </aside>
    </main>
  );
}
