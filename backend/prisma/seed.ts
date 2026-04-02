import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.category.deleteMany();


  const burgerCat = await prisma.category.create({ data: { id: 1, name: 'Burgers' } });
  const drinkCat = await prisma.category.create({ data: { id: 2, name: 'Drinks' } });
  const dessertCat = await prisma.category.create({ data: { id: 3, name: 'Desserts' } });
  const sideCat = await prisma.category.create({ data: { id: 4, name: 'Sides' } });

  const shopsData = [
    { name: 'McBurger', rating: 4.8 },
    { name: 'KFCherry', rating: 3.2 },
    { name: 'Burger Kinga', rating: 4.5 },
    { name: 'Street Food Lviv', rating: 2.5 },
    { name: 'Healthy Buns', rating: 5.0 },
    { name: 'Late Night Snacks', rating: 1.8 }, 
  ];

  for (const [index, s] of shopsData.entries()) {
    const shop = await prisma.shop.create({
      data: {
        ...s,
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.product.createMany({
      data: [
        { 
          name: `${s.name} Signature`, 
          price: 100 + index * 15, 
          categoryId: burgerCat.id, 
          shopId: shop.id,
          createdAt: new Date(Date.now() - index * 3600000)
        },
        { 
          name: `Junior ${s.name}`, 
          price: 80 + index * 10, 
          categoryId: burgerCat.id, 
          shopId: shop.id 
        },
        { 
          name: `Craft Cola ${index + 1}`, 
          price: 40 + index * 5, 
          categoryId: drinkCat.id, 
          shopId: shop.id 
        },
        { 
          name: `Special Fries`, 
          price: 50 + index * 2, 
          categoryId: sideCat.id, 
          shopId: shop.id 
        },
        ...(s.rating > 4 ? [{ 
          name: `Premium Cheesecake`, 
          price: 150, 
          categoryId: dessertCat.id, 
          shopId: shop.id 
        }] : [])
      ]
    });
  }

  console.log("✅ Seed finished: Created a diverse ecosystem of shops and products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });