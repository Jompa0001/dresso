"use client";

export default function AddonsButtons({ listingId }: { listingId: string }) {
  async function buy(addons: ("bump" | "highlight")[]) {
    try {
      const res = await fetch("/api/checkout/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, addons }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Kunde inte starta checkout.");
      }
    } catch (e: any) {
      alert(e?.message || "Något gick fel");
    }
  }

  return (
    <div className="pt-3 border-t">
      <div className="font-semibold mb-2">Boost-alternativ</div>
      <button
        type="button"
        className="btn btn-outline w-full"
        onClick={() => buy(["bump"])}
      >
        Lyft annons (Bump)
      </button>
      <button
        type="button"
        className="btn btn-outline w-full mt-2"
        onClick={() => buy(["highlight"])}
      >
        Highlight
      </button>
    </div>
  );
}
