import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Sinh mã bệnh nhân theo quy luật chuẩn y khoa: BN{YY}-{STT 4 chữ số}
 * Ví dụ: BN26-0001, BN26-0002,...
 * Tự động tìm số thứ tự lớn nhất trong năm hiện tại và tăng dần lên 1.
 */
export async function generatePatientCode(
  prismaClient: any,
): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2); // "26" cho năm 2026
  const prefix = `BN${yearSuffix}-`;

  const latestPatient = await prismaClient.patient.findFirst({
    where: {
      patientCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      patientCode: 'desc',
    },
    select: {
      patientCode: true,
    },
  });

  let nextSeq = 1;
  if (latestPatient && latestPatient.patientCode) {
    const parts = latestPatient.patientCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const paddedSeq = String(nextSeq).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
}

/**
 * Sinh mã lịch hẹn theo ngày giờ hiện tại: #LH-YYYYMMDD-HHmmss
 * Ví dụ: #LH-20260922-224512
 * Đảm bảo tính duy nhất và trực quan: nhìn vào là biết ngày giờ đặt lịch!
 */
export async function generateAppointmentCode(
  prismaClient?: any,
): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');

  const baseCode = `#LH-${yyyy}${MM}${dd}-${hh}${mm}${ss}`;

  if (!prismaClient) {
    return baseCode;
  }

  const existing = await prismaClient.appointment.findUnique({
    where: { appointmentCode: baseCode },
  });

  if (!existing) {
    return baseCode;
  }

  const extra = Math.floor(10 + Math.random() * 90);
  return `${baseCode}-${extra}`;
}
