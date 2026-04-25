import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  console.log('Cleaned existing data.');

  // Create users with stores
  const hashedPassword = await bcrypt.hash('12345678', 8);

  // User 1
  const user1 = await prisma.user.create({
    data: {
      email: 'joao@exemplo.com',
      password: hashedPassword,
      store: {
        create: {
          name: 'Loja do Joao',
          slug: 'loja-do-joao',
          whatsappNumber: '+5511999999999',
          products: {
            create: [
              {
                name: 'Camiseta Basica',
                description: 'Camiseta de algodao confortavel',
                price: 49.9,
                available: true,
              },
              {
                name: 'Calca Jeans',
                description: 'Calca jeans modelo clasico',
                price: 129.9,
                available: true,
              },
              {
                name: 'Tenis Esportivo',
                description: 'Tenis para corrida leve',
                price: 199.9,
                available: false,
              },
            ],
          },
        },
      },
    },
    include: { store: true },
  });
  console.log('Created user + store:', user1.email);

  // User 2
  const user2 = await prisma.user.create({
    data: {
      email: 'maria@exemplo.com',
      password: hashedPassword,
      store: {
        create: {
          name: 'Boutique da Maria',
          slug: 'boutique-da-maria',
          whatsappNumber: '+5511888888888',
          products: {
            create: [
              {
                name: 'Vestido Floral',
                description: 'Vestido estampado floral verao',
                price: 89.9,
                available: true,
              },
              {
                name: 'Bolsa de Couro',
                description: 'Bolsa artesanal de couro legtimo',
                price: 159.9,
                available: true,
              },
            ],
          },
        },
      },
    },
    include: { store: true },
  });
  console.log('Created user + store:', user2.email);

  // User 3 (no store)
  const user3 = await prisma.user.create({
    data: {
      email: 'admin@exemplo.com',
      password: hashedPassword,
    },
  });
  // Compatibilidade: define role por SQL para evitar erro de tipagem
  // quando o Prisma Client local ainda estiver desatualizado.
  await prisma.$executeRaw`UPDATE "User" SET "role" = 'ADMIN' WHERE "id" = ${user3.id}`;
  console.log('Created user (no store):', user3.email);

  // Create orders
  if (user1.store) {
    await prisma.order.create({
      data: {
        total: 179.8,
        whatsappLink: 'https://wa.me/5511999999999',
        storeId: user1.store.id,
        items: {
          create: [
            { product: 'Camiseta Basica', price: 49.9, quantity: 2 },
            { product: 'Calca Jeans', price: 129.9, quantity: 1 },
          ],
        },
      },
    });
    console.log('Created order for store:', user1.store.name);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
