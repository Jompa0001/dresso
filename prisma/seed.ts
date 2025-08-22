import { PrismaClient, Color, Material, DressLength, Condition } from '@prisma/client';
const prisma = new PrismaClient();
const SIZES = ["EU32","EU34","EU36","EU38","EU40","EU42","EU44","EU46","EU48"] as const;
const BRANDS = ["NA-KD","Bubbleroom","ASOS","Nelly","By Malina","Zara","H&M","House of CB"];
function rand<T>(arr: readonly T[]) { return arr[Math.floor(Math.random()*arr.length)]; }
async function main() {
  const seller = await prisma.user.upsert({ where: { email: "demo@dresso.se" }, update: {}, create: { email: "demo@dresso.se", name: "Demo Seller" } });
  await prisma.user.upsert({ where: { email: "buyer@dresso.se" }, update: {}, create: { email: "buyer@dresso.se", name: "Demo Buyer" } });
  const images = [
    "https://images.unsplash.com/photo-1520975922131-c3a84b0d96f8?q=80&w=1600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1503342217505-b0a15cf70489?q=80&w=1600&auto=format&fit=crop"
  ];
  for (let i = 0; i < 30; i++) {
    const price = Math.floor(400 + Math.random()*4600);
    const size = rand(SIZES);
    const length = rand([DressLength.MINI, DressLength.MIDI, DressLength.MAXI]);
    const color = rand([Color.BLACK, Color.WHITE, Color.RED, Color.BLUE, Color.GREEN, Color.PINK, Color.PURPLE, Color.BEIGE, Color.SILVER, Color.GOLD, Color.MULTI]);
    const material = rand([Material.SATIN, Material.SILK, Material.CHIFFON, Material.LACE, Material.VELVET, Material.SEQUINS, Material.TULLE]);
    const brand = rand(BRANDS);
    await prisma.listing.create({
      data: {
        title: `${brand} ${length.toLowerCase()} dress ${size}`,
        description: "Stilren festklänning – perfekt för bal, bröllop eller examensfest.",
        price,
        size,
        brand,
        color,
        material,
        length,
        condition: rand([Condition.LIKE_NEW, Condition.GOOD, Condition.OK]),
        images,
        location: "Stockholm",
        publishPaid: true,
        userId: seller.id
      }
    });
  }
}
main().then(()=>prisma.$disconnect()).catch(async (e)=>{ console.error(e); await prisma.$disconnect(); process.exit(1); });
