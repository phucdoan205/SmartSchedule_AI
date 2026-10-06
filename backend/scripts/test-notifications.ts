import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await (prisma as any).notification.count();
  console.log('Bảng notifications đã sẵn sàng, số lượng hiện tại:', count);
}

main().finally(() => prisma.$disconnect());
