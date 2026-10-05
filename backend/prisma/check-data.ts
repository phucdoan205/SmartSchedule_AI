import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const branchCount = await prisma.branch.count();
  const userCount = await prisma.user.count();
  const eqCount = await prisma.equipment.count();
  const invCount = await prisma.invoice.count();
  const payCount = await prisma.payment.count();
  const logCount = await prisma.equipmentMaintenanceLog.count();
  const branches = await prisma.branch.findMany({ select: { id: true, code: true, name: true } });

  console.log(JSON.stringify({
    branchCount,
    userCount,
    eqCount,
    invCount,
    payCount,
    logCount,
    branches
  }, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
