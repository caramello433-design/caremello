const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log('Products already seeded');
    return;
  }

  const samples = [
    {
      name: 'Vanilla Cake',
      description: 'Simple, elegant vanilla cake',
      price: '₹600',
      originalPrice: null,
      categories: ['regular'],
      images: ['all items/VANILA Cake/Screenshot 2026-06-21 190732.png'],
      mainImage: 'all items/VANILA Cake/Screenshot 2026-06-21 190732.png'
    },
    {
      name: 'Classic Mango',
      description: 'Indulge in seasonal mango goodness',
      price: '₹700',
      originalPrice: '₹750',
      categories: ['regular'],
      images: ['all items/CLASSIC MANGO/Screenshot 2026-06-21 190254.png'],
      mainImage: 'all items/CLASSIC MANGO/Screenshot 2026-06-21 190254.png'
    }
  ];

  for (const p of samples) {
    await prisma.product.create({ data: {
      ...p,
      categories: JSON.stringify(p.categories || []),
      images: JSON.stringify(p.images || [])
    } });
  }
  console.log('Seed complete');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
