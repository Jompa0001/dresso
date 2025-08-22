import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "Dresso",
  description: "Nischad marknadsplats för festklänningar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
          <div className="container h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="header-logo">D</div>
              <span className="font-semibold">{process.env.NEXT_PUBLIC_SITE_NAME || "Dresso"}</span>
            </div>
            <div className="flex gap-2">
              <a href="/listings/new" className="btn btn-primary">Sälj 1 klänning</a>
              <a href="/listings/new/bulk" className="btn btn-outline">Sälj flera</a>
            </div>
          </div>
        </header>
        {children}
        <footer className="border-t border-slate-200 mt-10">
          <div className="container py-8 text-sm text-slate-600 flex items-center justify-between">
            <div>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || "Dresso"}</div>
            <div>Beta – demo</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
