# Dresso – MVP
Nischad marknadsplats för festklänningar (Blocket-stil) med:
- Dresso-branding (beige/rosa/vit)
- Publisering: 1 annons = 99 kr
- Bulk: 2=139, 3=169, 4=189, 5+= +10 kr/st
- Addons: Bump & Highlight
- Chat mellan köpare/säljare
- Adminpanel + webhook
- Bilduppladdning via S3/R2 (mock i dev)

## Kom igång
```bash
npm i
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```
Öppna http://localhost:3000

## Deploy
Sätt ENV i Vercel: `DATABASE_URL`, `NEXT_PUBLIC_SITE_NAME=Dresso`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_TOKEN` (+ ev. `STRIPE_*`, `S3_*`). Kör `npx prisma migrate deploy` i produktion.
