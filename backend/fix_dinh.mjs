import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Find user dinh@gmail.com
  const user = await prisma.user.findFirst({
    where: { email: 'dinh@gmail.com' },
    include: { userRoles: true, doctorProfile: true },
  });

  if (!user) {
    console.log('User dinh@gmail.com not found!');
    return;
  }

  console.log('Found user:', user.fullName, 'Current code:', user.employeeCode);

  // 2. Find role 'Kế Toán' or create it if missing
  let accountantRole = await prisma.role.findFirst({
    where: {
      OR: [
        { name: 'Kế Toán' },
        { name: 'ACCOUNTANT' },
        { name: 'Kế toán' },
      ],
    },
  });

  if (!accountantRole) {
    accountantRole = await prisma.role.create({
      data: {
        name: 'Kế Toán',
        description: 'Nhân viên Kế toán & Quản lý lương thưởng phòng khám',
      },
    });
    console.log('Created role Kế Toán:', accountantRole.id);
  } else {
    console.log('Found role Kế Toán:', accountantRole.id, accountantRole.name);
  }

  // 3. Update user employeeCode to NV013, remove DoctorProfile, update role
  await prisma.user.update({
    where: { id: user.id },
    data: {
      employeeCode: 'NV013',
    },
  });
  console.log('Updated employeeCode to NV013');

  // Remove doctor profile
  if (user.doctorProfile) {
    await prisma.doctorProfile.delete({
      where: { userId: user.id },
    });
    console.log('Deleted DoctorProfile for dinh@gmail.com');
  }

  // Update UserRoles
  await prisma.userRole.deleteMany({
    where: { userId: user.id },
  });
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: accountantRole.id,
    },
  });
  console.log('Assigned role Kế Toán to dinh@gmail.com');

  // 4. Ensure permissions for role Kế Toán in DB
  const perms = await prisma.permission.findMany();
  console.log(`Found ${perms.length} total permissions in DB`);

  // Permissions relevant to accountant
  const accountantPermCodes = [
    'BILLING_EXPORT',
    'FINANCE_VIEW',
    'FINANCE_EXPORT',
    'STAFF_VIEW',
    'STAFF_SCHEDULE_VIEW',
    'PAYROLL_VIEW',
    'PAYROLL_MANAGE',
  ];

  for (const p of perms) {
    // If permission name or code matches finance/billing/payroll or module FINANCE
    if (
      p.module === 'FINANCE' ||
      accountantPermCodes.includes(p.code) ||
      p.code.includes('BILLING') ||
      p.code.includes('SALARY') ||
      p.code.includes('PAYROLL')
    ) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: accountantRole.id,
            permissionId: p.id,
          },
        },
        update: {},
        create: {
          roleId: accountantRole.id,
          permissionId: p.id,
        },
      });
    }
  }

  console.log('Completed permissions for role Kế Toán');

  // Verify updated user
  const updated = await prisma.user.findFirst({
    where: { id: user.id },
    include: {
      userRoles: { include: { role: true } },
      doctorProfile: true,
    },
  });

  console.log('=== UPDATED USER ===');
  console.log({
    id: updated.id,
    code: updated.employeeCode,
    name: updated.fullName,
    email: updated.email,
    roles: updated.userRoles.map((ur) => ur.role?.name),
    doctorProfile: updated.doctorProfile,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
