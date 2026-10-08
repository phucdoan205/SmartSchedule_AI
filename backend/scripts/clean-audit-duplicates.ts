import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu dọn dẹp bản ghi nhật ký trùng lặp & chuẩn hóa trạng thái ---');

  // 1. Xóa các bản ghi duplicate sát nhau trong quá khứ (như LOG-2026-0027 trùng với LOG-2026-0028, LOG-2026-0025 trùng với LOG-2026-0026)
  const duplicateCodes = ['LOG-2026-0027', 'LOG-2026-0025'];
  const deleted = await prisma.auditLog.deleteMany({
    where: {
      logCode: { in: duplicateCodes },
    },
  });
  console.log(`Đã xóa ${deleted.count} bản ghi nhật ký trùng lặp chính xác.`);

  // 2. Chuẩn hóa các bản ghi đổi trạng thái thiết bị để hiển thị rõ ràng chuyển trạng thái
  await prisma.auditLog.updateMany({
    where: { logCode: 'LOG-2026-0036' },
    data: {
      action: 'Chuyển trạng thái thiết bị [Cảnh báo sự cố ➔ Sẵn sàng / Hoạt động]: Nồi hấp chân không tiệt trùng Melag Vacuklav 40B+ (TB-09)',
      details: 'Trạng thái thiết bị mã TB-09 đã được chuyển từ [Cảnh báo sự cố] sang [Sẵn sàng / Hoạt động]. Vị trí: Phòng Vô trùng khép kín (CN Quận 1). Kỹ thuật viên: BS. Vũ Phương Thảo.',
    },
  });

  await prisma.auditLog.updateMany({
    where: { logCode: 'LOG-2026-0035' },
    data: {
      action: 'Chuyển trạng thái thiết bị [Sẵn sàng / Hoạt động ➔ Cảnh báo sự cố]: Nồi hấp chân không tiệt trùng Melag Vacuklav 40B+ (TB-09)',
      details: 'Trạng thái thiết bị mã TB-09 đã được chuyển từ [Sẵn sàng / Hoạt động] sang [Cảnh báo sự cố]. Vị trí: Phòng Vô trùng khép kín (CN Quận 1). Kỹ thuật viên: BS. Vũ Phương Thảo.',
    },
  });

  await prisma.auditLog.updateMany({
    where: { logCode: 'LOG-2026-0033' },
    data: {
      action: 'Chuyển trạng thái thiết bị [Đang bảo trì ➔ Sẵn sàng / Hoạt động]: Máy cấy ghép Implant Bien-Air Chiropro Plus (TB-16)',
      details: 'Trạng thái thiết bị mã TB-16 đã được chuyển từ [Đang bảo trì] sang [Sẵn sàng / Hoạt động]. Vị trí: Phòng Phẫu thuật Thủ Đức. Kỹ thuật viên: BS. Nguyễn Thị An.',
    },
  });

  await prisma.auditLog.updateMany({
    where: { logCode: 'LOG-2026-0032' },
    data: {
      action: 'Chuyển trạng thái thiết bị [Sẵn sàng / Hoạt động ➔ Đang bảo trì]: Máy cấy ghép Implant Bien-Air Chiropro Plus (TB-16)',
      details: 'Trạng thái thiết bị mã TB-16 đã được chuyển từ [Sẵn sàng / Hoạt động] sang [Đang bảo trì]. Vị trí: Phòng Phẫu thuật Thủ Đức. Kỹ thuật viên: BS. Nguyễn Thị An.',
    },
  });

  // 3. Chuẩn hóa bản ghi khóa / mở khóa nhân sự
  await prisma.auditLog.updateMany({
    where: { logCode: 'LOG-2026-0028' },
    data: {
      action: 'Mở khóa tài khoản nhân sự: BS. Lê Thị Lan (NV006) [Đã khóa ➔ Đang hoạt động]',
      details: 'Trạng thái hoạt động của tài khoản đã được chuyển từ [Đã khóa] sang [Đang hoạt động].',
    },
  });

  await prisma.auditLog.updateMany({
    where: { logCode: 'LOG-2026-0026' },
    data: {
      action: 'Khóa tài khoản nhân sự: BS. Lê Thị Lan (NV006) [Đang hoạt động ➔ Đã khóa]',
      details: 'Trạng thái hoạt động của tài khoản đã được chuyển từ [Đang hoạt động] sang [Đã khóa].',
    },
  });

  console.log('--- Hoàn tất dọn dẹp và chuẩn hóa nhật ký thành công! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
