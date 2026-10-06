import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { OR: [{ email: 'admin@smartschedule.ai' }, { employeeCode: 'NV-ADMIN' }] },
  });

  if (!admin) {
    console.log('Không tìm thấy admin');
    return;
  }

  // Tạo một vài notifications mẫu thực tế cho Admin
  const sampleNotifications = [
    {
      userId: admin.id,
      title: 'Đồng bộ hệ thống kiểm toán hoàn tất',
      content: 'Nhật ký kiểm toán ngày 05/10/2026 đã được đồng bộ chính xác với tài khoản Quản trị viên hệ thống.',
      type: 'SUCCESS',
      link: '/admin/audit-logs',
      isRead: false,
    },
    {
      userId: admin.id,
      title: 'Thiết bị y tế hoàn tất kiểm định',
      content: 'Ghế khám tổng quát (TB-21) đã hoàn tất chu kỳ kiểm định định kỳ và đạt chuẩn an toàn 100%.',
      type: 'EQUIPMENT',
      link: '/admin/maintenance',
      isRead: false,
    },
    {
      userId: admin.id,
      title: 'Cập nhật phân quyền chức vụ',
      content: 'Phân quyền chức vụ và ma trận RBAC đã được xác lập bảo mật toàn hệ thống.',
      type: 'ROLE_CHANGE',
      link: '/admin/settings',
      isRead: false,
    },
    {
      userId: admin.id,
      title: 'Lịch hẹn trực tuyến mới',
      content: 'Bệnh nhân Nguyễn Văn A đã đặt lịch hẹn cấy ghép Implant tại Chi nhánh Biên Hòa.',
      type: 'APPOINTMENT',
      link: '/admin/appointments',
      isRead: true,
    },
    {
      userId: admin.id,
      title: 'Báo cáo doanh thu tháng',
      content: 'Báo cáo doanh thu và đối soát thu chi phòng khám đã được cập nhật.',
      type: 'FINANCE',
      link: '/admin/finance',
      isRead: true,
    },
  ];

  for (const n of sampleNotifications) {
    await (prisma as any).notification.create({ data: n });
  }

  const count = await (prisma as any).notification.count({ where: { userId: admin.id } });
  console.log(`Đã khởi tạo ${sampleNotifications.length} thông báo mẫu cho Admin. Tổng: ${count}`);
}

main().finally(() => prisma.$disconnect());
