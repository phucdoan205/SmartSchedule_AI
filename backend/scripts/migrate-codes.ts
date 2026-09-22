import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function formatVnDateTime(date: Date): string {
  // Convert to Vietnam GMT+7
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const yyyy = vnTime.getUTCFullYear();
  const MM = String(vnTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(vnTime.getUTCDate()).padStart(2, '0');
  const hh = String(vnTime.getUTCHours()).padStart(2, '0');
  const mm = String(vnTime.getUTCMinutes()).padStart(2, '0');
  const ss = String(vnTime.getUTCSeconds()).padStart(2, '0');
  return `#LH-${yyyy}${MM}${dd}-${hh}${mm}${ss}`;
}

async function main() {
  console.log('--- Starting Migration for Patient and Appointment Codes ---');

  // 1. Update Patients
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${patients.length} patients to migrate.`);

  let pIndex = 1;
  for (const p of patients) {
    const newPatientCode = `BN26-${String(pIndex).padStart(4, '0')}`;
    const oldCode = p.patientCode;
    console.log(`Migrating Patient [${p.fullName}]: ${oldCode} -> ${newPatientCode}`);

    // Update patient
    await prisma.patient.update({
      where: { id: p.id },
      data: { patientCode: newPatientCode },
    });

    // Update corresponding user employeeCode if matched
    await prisma.user.updateMany({
      where: { employeeCode: oldCode },
      data: { employeeCode: newPatientCode },
    });

    pIndex++;
  }

  // 2. Update Appointments
  const appointments = await prisma.appointment.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Found ${appointments.length} appointments to migrate.`);

  for (const apt of appointments) {
    const newAptCode = formatVnDateTime(apt.createdAt);
    console.log(`Migrating Appointment [ID ${apt.id}]: ${apt.appointmentCode} -> ${newAptCode}`);

    await prisma.appointment.update({
      where: { id: apt.id },
      data: { appointmentCode: newAptCode },
    });
  }

  console.log('--- Migration Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
