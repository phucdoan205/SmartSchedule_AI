import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Lấy các thành phần ngày giờ theo chuẩn múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7).
 * Đảm bảo hiển thị chính xác giờ Việt Nam kể cả khi máy chủ Cloud (Render, AWS, Docker) đặt múi giờ UTC.
 */
export function getVietnamTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const partMap: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    partMap[part.type] = part.value;
  }

  return {
    yyyy: partMap.year,
    MM: partMap.month,
    dd: partMap.day,
    hh: partMap.hour,
    mm: partMap.minute,
    ss: partMap.second,
  };
}

/**
 * Sinh mã bệnh nhân theo quy luật chuẩn y khoa: BN{YY}-{STT 4 chữ số}
 * Ví dụ: BN26-0001, BN26-0002,...
 * Tự động tìm số thứ tự lớn nhất trong năm hiện tại (theo giờ VN) và tăng dần lên 1.
 */
export async function generatePatientCode(
  prismaClient: any,
): Promise<string> {
  const { yyyy } = getVietnamTimeParts();
  const yearSuffix = yyyy.slice(-2); // "26" cho năm 2026
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
 * Sinh mã lịch hẹn theo ngày giờ Việt Nam hiện tại (GMT+7): #LH-YYYYMMDD-HHmmss
 * Ví dụ: #LH-20261017-204512
 * Đảm bảo tính duy nhất và trực quan: nhìn vào là biết chính xác ngày giờ đặt lịch theo giờ Việt Nam!
 */
export async function generateAppointmentCode(
  prismaClient?: any,
): Promise<string> {
  const { yyyy, MM, dd, hh, mm, ss } = getVietnamTimeParts();
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
