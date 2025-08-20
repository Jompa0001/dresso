import Filters from "@/components/Filters";
import ListingCard from "@/components/ListingCard";

async function getListings(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => { if (!v) return; if (Array.isArray(v)) v.forEach(val=>params.append(k, val)); else params.set(k, v); });
  const res = await fetch(process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL + "/api/listings?" + params.toString() : "/api/listings?" + params.toString(), { cache: "no-store" });
  return await res.json();
}

export default async function Home({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const data = await getListings(searchParams);
  return (
    <main className="container py-6 grid md:grid-cols-[280px_1fr] gap-6">
      <aside className="md:sticky md:top-4 h-max"><Filters /></aside>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Festklänningar</h1>
          <div className="flex gap-2">
            <a href="/listings/new" className="btn btn-primary">Sälj 1</a>
            <a href="/listings/new/bulk" className="btn btn-outline">Sälj flera</a>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3 text-sm text-slate-600">
          <div>{data.count} annonser</div>
          <form action="/" method="get">
            <select name="sort" defaultValue={Array.isArray(searchParams.sort)?searchParams.sort[0]:searchParams.sort ?? "NEWEST"} className="select">
              <option value="NEWEST">Nyast</option>
              <option value="PRICE_ASC">Pris: Låg → Hög</option>
              <option value="PRICE_DESC">Pris: Hög → Låg</option>
            </select>
          </form>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.items.map((it: any) => <ListingCard key={it.id} item={it} />)}
        </div>
      </section>
    </main>
  );
}
