"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
export default function Success() {
  const sp = useSearchParams(); const router = useRouter();
  useEffect(()=>{
    const type = sp.get("type");
    if (type === "bulk") {
      const ids = sp.get("ids") || "";
      fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bulkIds: ids }) }).then(()=>{ const first = ids.split(",")[0]; router.replace(`/listings/${first}`); });
    } else {
      const listingId = sp.get("listingId"); const addons = sp.get("addons") || "";
      if (!listingId) return;
      fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId, addons }) }).then(()=>{ router.replace(`/listings/${listingId}`); });
    }
  }, []);
  return <main className="container py-12">Bearbetar betalningen…</main>;
}
