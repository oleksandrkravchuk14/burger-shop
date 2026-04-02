import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/shops', async (req, res) => {
  const { minRating, maxRating, sortByRating } = req.query;

  try {
    const shops = await prisma.shop.findMany({
      where: {
        rating: {
          gte: minRating ? parseFloat(String(minRating)) : 0,
          lte: maxRating ? parseFloat(String(maxRating)) : 5,
        },
      },
      orderBy: {
        rating: sortByRating === 'asc' ? 'asc' : 'desc',
      },
    });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ error: "Помилка при отриманні магазинів" });
  }
});

app.get('/api/products', async (req, res) => {
  const { shopId, categoryId, sortBy, order } = req.query;

  const allowedSortFields = ['price', 'name', 'createdAt'];
  const sortField = allowedSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
  const sortOrder = order === 'desc' ? 'desc' : 'asc';

  try {
    const products = await prisma.product.findMany({
      where: {
        ...(shopId ? { shopId: String(shopId) } : {}),
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      },
      orderBy: { 
        [sortField]: sortOrder 
      },
    });
    res.json(products);
  } catch (error) {
    console.error("Prisma Error:", error);
    res.status(500).json({ error: "Помилка при отриманні товарів" });
  }
});

app.post('/api/orders', async (req, res) => {
  // Дістаємо дані точно так, як їх шле фронтенд
  const { customerName, customerEmail, customerPhone, customerAddress, totalPrice, items } = req.body;

  try {
    const order = await prisma.order.create({
      data: {
        name: customerName,        // Збігається з моделлю Prisma
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        totalPrice: Number(totalPrice),
        items: {
          create: items.map((item: any) => ({
            productId: item.productId, // Збігається з тим, що шле CartPage
            quantity: Number(item.quantity),
            price: Number(item.price), 
          })),
        },
      },
      include: {
        items: true 
      }
    });
    res.status(201).json(order);
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({ error: "Не вдалося створити замовлення" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});