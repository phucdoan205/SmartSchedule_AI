import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          employeeCode: true,
        },
      },
    },
  });

  console.log(`Tổng số audit logs lấy được: ${logs.length}`);
  logs.forEach((l) => {
    console.log(
      `ID: ${l.id} | Code: ${l.logCode} | Time: ${l.createdAt.toISOString()} | Module: ${l.module} | User: ${l.user ? l.user.fullName + ' (' + l.user.employeeCode + ')' : 'NULL (system)'} | Action: ${l.action}`
    );
  });
}

main().finally(() => prisma.$disconnect());
