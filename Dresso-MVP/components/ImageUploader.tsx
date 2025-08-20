"use client";
import { useState } from "react";
export default function ImageUploader({ onUploaded }: { onUploaded: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [urls, setUrls] = useState<string[]>([]);
  async function upload() {
    if (!files?.length) return;
    setBusy(true);
    const collected: string[] = [];
    for (const file of Array.from(files)) {
      const res = await fetch("/api/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type }) });
      const data = await res.json();
      if (data.url) {
        const put = await fetch(data.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!put.ok) throw new Error("Uppladdning misslyckades");
        collected.push(data.publicUrl);
      } else if (data.publicUrl) {
        collected.push(data.publicUrl);
      }
    }
    setUrls(collected);
    onUploaded(collected);
    setBusy(false);
  }
  return (
    <div className="card p-4 space-y-3">
      <div className="font-semibold">Bilder</div>
      <input type="file" multiple accept="image/*" onChange={e=>setFiles(e.target.files)} />
      <button type="button" className="btn btn-outline" onClick={upload} disabled={busy}>{busy ? "Laddar upp…" : "Ladda upp"}</button>
      {!!urls.length && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((u,i)=>(
            <div key={i} className="aspect-square bg-slate-100 overflow-hidden rounded-xl">
              <img src={u} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-500">I dev utan S3-nycklar används demo‑bilder automatiskt.</p>
    </div>
  );
}
