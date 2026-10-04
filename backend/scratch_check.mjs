import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      userRoles: { include: { role: true } },
      doctorProfile: true,
    },
    orderBy: { employeeCode: 'asc' }
  });

  console.log('=== USERS ===');
  users.forEach(u => {
    console.log(u.id, u.employeeCode, u.fullName, u.email, u.userRoles.map(ur => ur.role?.name), u.doctorProfile?.specialty);
  });

  const roles = await prisma.role.findMany({
    include: { rolePermissions: { include: { permission: true } } }
  });
  console.log('=== ROLES ===');
  roles.forEach(r => {
    console.log(r.id, r.name, r.description, r.rolePermissions.length);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
