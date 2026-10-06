import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== CẬP NHẬT USERID CHO CÁC AUDIT LOGS NGÀY 05/10/2026 ===');

  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@smartschedule.ai' },
        { employeeCode: 'NV-ADMIN' },
      ],
    },
  });

  if (!admin) {
    console.error('Không tìm thấy tài khoản admin@smartschedule.ai');
    return;
  }

  console.log(`Tìm thấy admin: ${admin.fullName} (${admin.id})`);

  // Tìm các log từ LOG-2026-0013 đến LOG-2026-0017 hoặc các log trong ngày 05/10/2026 có userId null
  const updated = await prisma.auditLog.updateMany({
    where: {
      userId: null,
      createdAt: {
        gte: new Date('2026-10-05T00:00:00.000Z'),
        lte: new Date('2026-10-05T23:59:59.999Z'),
      },
    },
    data: {
      userId: admin.id,
    },
  });

  console.log(`Đã cập nhật ${updated.count} bản ghi audit log ngày 05/10/2026 về Quản Trị Viên Hệ Thống!`);

  // Kiểm tra lại
  const checkLogs = await prisma.auditLog.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-10-05T00:00:00.000Z'),
      },
    },
    include: {
      user: {
        select: {
          fullName: true,
          employeeCode: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('Danh sách log sau cập nhật:');
  checkLogs.forEach((l) => {
    console.log(`${l.logCode} - ${l.action} -> Thực hiện bởi: ${l.user?.fullName} (${l.user?.employeeCode})`);
  });
}

main().finally(() => prisma.$disconnect());
