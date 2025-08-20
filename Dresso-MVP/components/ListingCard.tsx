import Link from "next/link";
export default function ListingCard({ item }: { item: any }) {
  const price = new Intl.NumberFormat("sv-SE").format(item.price);
  return (
    <Link href={`/listings/${item.id}`} className={`card overflow-hidden hover:-translate-y-0.5 transition ${item.highlight ? "ring-2 ring-yellow-400" : ""}`}>
      <div className="aspect-[4/5] bg-slate-100">
        {item.images?.[0] && <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold line-clamp-1">{item.title}</h3>
          <div className="font-bold whitespace-nowrap">{price} kr</div>
        </div>
        <p className="text-sm text-slate-600">{item.brand ?? "—"} · {item.size ?? "—"} · {item.length ?? "—"}</p>
      </div>
    </Link>
  );
}
