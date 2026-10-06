import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== BẮT ĐẦU KHÔI PHỤC QUYỀN SUPER_ADMIN CHO TÀI KHOẢN ADMIN ===');

  // 1. Kiểm tra hoặc tạo lại Role SUPER_ADMIN
  let superAdminRole = await prisma.role.findFirst({
    where: {
      OR: [
        { name: 'SUPER_ADMIN' },
        { name: 'super-admin' },
        { name: 'ADMIN' },
      ],
    },
  });

  if (!superAdminRole) {
    console.log('Role SUPER_ADMIN chưa tồn tại. Đang tạo mới...');
    superAdminRole = await prisma.role.create({
      data: {
        name: 'SUPER_ADMIN',
        description: 'Chủ phòng khám (Toàn quyền hệ thống)',
      },
    });
    console.log(`Đã tạo Role SUPER_ADMIN với ID: ${superAdminRole.id}`);
  } else {
    // Đảm bảo tên role chuẩn là SUPER_ADMIN
    if (superAdminRole.name !== 'SUPER_ADMIN') {
      superAdminRole = await prisma.role.update({
        where: { id: superAdminRole.id },
        data: { name: 'SUPER_ADMIN' },
      });
    }
    console.log(`Đã tìm thấy Role SUPER_ADMIN: ${superAdminRole.id} (${superAdminRole.name})`);
  }

  // 2. Tìm tài khoản admin
  // Thử các tiêu chí: email admin@smartschedule.ai, employeeCode NV-ADMIN, hoặc tài khoản có email/tên admin
  const adminUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'admin@smartschedule.ai' },
        { employeeCode: 'NV-ADMIN' },
        { phone: '0900000001' },
      ],
    },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  console.log(`Tìm thấy ${adminUsers.length} tài khoản quản trị khớp điều kiện.`);

  const passwordHash = await bcrypt.hash('123456', 10);

  let targetAdmin = adminUsers[0];

  if (!targetAdmin) {
    console.log('Không tìm thấy tài khoản admin@smartschedule.ai. Đang tạo mới...');
    const defaultBranch = await prisma.branch.findFirst();
    if (!defaultBranch) {
      throw new Error('KhÃ´ng tháº¥y chi nhÃ¡nh nÃ o Ä‘á»ƒ gÃ¡n cho tÃ i khoáº£n admin.');
    }

    const createdAdmin = await prisma.user.create({
      data: {
        employeeCode: 'NV-ADMIN',
        fullName: 'Quáº£n Trá»‹ ViÃªn Há»‡ Thá»‘ng',
        email: 'admin@smartschedule.ai',
        phone: '0900000001',
        passwordHash,
        branchId: defaultBranch.id,
        isActive: true,
      },
    });

    const reloadedAdmin = await prisma.user.findUnique({
      where: { id: createdAdmin.id },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!reloadedAdmin) {
      throw new Error('Unable to reload the newly created admin account.');
    }
    targetAdmin = reloadedAdmin;

    console.log(`Created admin account with ID: ${targetAdmin.id}`);  } else {
    // Cập nhật lại mật khẩu là 123456 và kích hoạt tài khoản
    await prisma.user.update({
      where: { id: targetAdmin.id },
      data: {
        passwordHash,
        isActive: true,
      },
    });
    console.log(`Đã cập nhật mật khẩu 123456 và isActive=true cho user: ${targetAdmin.email} (${targetAdmin.fullName})`);
  }

  // 3. Gán Role SUPER_ADMIN cho user admin
  const hasSuperAdminRole = targetAdmin.userRoles?.some(
    (ur) => ur.roleId === superAdminRole!.id || ur.role.name === 'SUPER_ADMIN'
  );

  if (!hasSuperAdminRole) {
    console.log(`Đang gán role SUPER_ADMIN cho user ${targetAdmin.email}...`);
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: targetAdmin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: targetAdmin.id,
        roleId: superAdminRole.id,
      },
    });
    console.log('Đã gán role SUPER_ADMIN thành công!');
  } else {
    console.log('Tài khoản đã có role SUPER_ADMIN.');
  }

  // 4. Cấp toàn bộ permissions cho Role SUPER_ADMIN
  const allPermissions = await prisma.permission.findMany();
  console.log(`Hệ thống có ${allPermissions.length} permissions trong DB.`);

  let grantedCount = 0;
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
    grantedCount++;
  }
  console.log(`Đã đồng bộ ${grantedCount} permissions cho role SUPER_ADMIN.`);

  // 5. Kiểm tra thông tin hoàn chỉnh của tài khoản
  const verifiedUser = await prisma.user.findUnique({
    where: { id: targetAdmin.id },
    include: {
      userRoles: {
        include: { role: true },
      },
    },
  });

  console.log('=== KẾT QUẢ KHÔI PHỤC ===');
  console.log({
    id: verifiedUser?.id,
    fullName: verifiedUser?.fullName,
    email: verifiedUser?.email,
    employeeCode: verifiedUser?.employeeCode,
    phone: verifiedUser?.phone,
    isActive: verifiedUser?.isActive,
    roles: verifiedUser?.userRoles.map((ur) => ur.role.name),
  });
  console.log('=== HOÀN TẤT THÀNH CÔNG ===');
}

main()
  .catch((err) => {
    console.error('Lỗi khi khôi phục role super-admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
