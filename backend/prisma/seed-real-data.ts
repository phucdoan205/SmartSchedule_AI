import { PrismaClient } from '@prisma/client';
import process from 'node:process';

const prisma = new PrismaClient();

async function seedRealData() {
  console.log('--- Bắt đầu cập nhật dữ liệu thật vào Database ---');

  // 1. Lấy thông tin các chi nhánh đã có
  const branches = await prisma.branch.findMany({ orderBy: { code: 'asc' } });
  if (branches.length === 0) {
    throw new Error('Chưa có chi nhánh nào trong database!');
  }

  const branch1 = branches[0]; // CN01: Biên Hòa
  const branch2 = branches[1] || branches[0]; // CN02: Quận 1
  const branch3 = branches[2] || branches[0]; // CN03: Thủ Đức / Long Thành

  // 2. Lấy KTV và Người dùng
  let technician = await prisma.user.findFirst({
    where: { email: { contains: 'minh' } },
  });

  if (!technician) {
    technician = await prisma.user.findFirst({
      where: { email: 'admin@smartschedule.ai' },
    });
  }

  const technicianId = technician?.id || branches[0].id;

  // 3. SEED THIẾT BỊ (EQUIPMENTS) ĐẦY ĐỦ CHO HỆ THỐNG
  console.log('\n--- 1. Cập nhật danh sách thiết bị y tế (Equipments) ---');

  const equipmentsData = [
    // --- CN01: Biên Hòa ---
    {
      code: 'TB-01',
      name: 'Ghế nha khoa cao cấp Sirona Intego',
      serialNumber: 'SRN-INT-2026-001',
      category: 'dental_chair',
      location: 'Ghế 01 - Tầng 1 (CN Biên Hòa)',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-15'),
      nextInspectionAt: new Date('2026-09-18'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch1.id,
      imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394598/smartschedule_ai/branches/hbof0tkdwotc5nvgbwc5.jpg',
    },
    {
      code: 'TB-03',
      name: 'Ghế nha khoa Sirona (TB-03)',
      serialNumber: 'SRN-INT-2026-003',
      category: 'dental_chair',
      location: 'Ghế 03 - Tầng 1 (CN Biên Hòa)',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-01'),
      nextInspectionAt: new Date(),
      status: 'WARNING',
      urgencyAlert: 'Cần thay bộ lọc nước Ghế 03',
      isPaused: true,
      branchId: branch1.id,
    },
    {
      code: 'TB-04',
      name: 'Máy chụp CT Cone Beam 3D Vatech PaX-3D',
      serialNumber: 'VT-CB-2026-88',
      category: 'xray',
      location: 'Phòng Chẩn đoán (Tầng 2)',
      technician: 'Kỹ sư Vatech',
      lastMaintenanceAt: new Date('2026-08-10'),
      nextInspectionAt: new Date('2026-11-10'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch1.id,
    },
    {
      code: 'TB-08',
      name: 'Ghế điều trị nha khoa Gnatus G3',
      serialNumber: 'GNT-G3-2025-08',
      category: 'dental_chair',
      location: 'Ghế 04 - Tầng 1 (CN Biên Hòa)',
      technician: 'KTV. Lê Văn Bình',
      lastMaintenanceAt: new Date('2026-08-22'),
      nextInspectionAt: new Date('2026-08-22'),
      status: 'UNDER_MAINTENANCE',
      isPaused: true,
      branchId: branch1.id,
    },
    {
      code: 'TB-12',
      name: 'Nồi hấp tiệt trùng Class B Melag',
      serialNumber: 'MLG-CLS-B-12',
      category: 'hvac',
      location: 'Phòng Vô trùng trung tâm',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-20'),
      nextInspectionAt: new Date('2026-08-27'),
      status: 'STERILIZING',
      isPaused: false,
      branchId: branch1.id,
    },
    {
      code: 'TB-15',
      name: 'Máy phẫu thuật cấy ghép Implant Surgic Pro NSK',
      serialNumber: 'NSK-SP-2026-15',
      category: 'implant',
      location: 'Phòng Phẫu thuật Implant 1 (Tầng 1)',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-05'),
      nextInspectionAt: new Date('2026-10-05'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch1.id,
    },
    {
      code: 'TB-18',
      name: 'Máy cạo vôi siêu âm Satelec số 03',
      serialNumber: 'SAT-US-2026-18',
      category: 'dental_chair',
      location: 'Phòng Khám Tổng Quát 2',
      technician: 'KTV. Lê Văn Bình',
      lastMaintenanceAt: new Date('2026-07-28'),
      nextInspectionAt: new Date('2026-08-30'),
      status: 'WARNING',
      urgencyAlert: 'Cần thay bộ lọc nước đầu máy siêu âm',
      isPaused: false,
      branchId: branch1.id,
    },
    {
      code: 'TB-20',
      name: 'Máy tẩy trắng răng Laser Whitening Beyond II',
      serialNumber: 'BYD-LW-2026-20',
      category: 'dental_chair',
      location: 'Phòng Thẩm mỹ Răng (Tầng 1)',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-12'),
      nextInspectionAt: new Date('2026-09-25'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch1.id,
    },

    // --- CN02: Quận 1 ---
    {
      code: 'TB-02',
      name: 'Ghế phẫu thuật vô trùng Planmeca Compact i5',
      serialNumber: 'PLM-CMP-2026-02',
      category: 'dental_chair',
      location: 'Phòng VIP 101 (CN Quận 1)',
      technician: 'Kỹ sư Planmeca',
      lastMaintenanceAt: new Date('2026-08-14'),
      nextInspectionAt: new Date('2026-09-20'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch2.id,
    },
    {
      code: 'TB-05',
      name: 'Máy chụp X-Quang Toàn Cảnh Panorama Dentsply Sirona',
      serialNumber: 'DNP-PAN-2026-05',
      category: 'xray',
      location: 'Phòng Chụp Phim (CN Quận 1)',
      technician: 'Kỹ sư Dentsply',
      lastMaintenanceAt: new Date('2026-08-08'),
      nextInspectionAt: new Date('2026-11-08'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch2.id,
    },
    {
      code: 'TB-09',
      name: 'Nồi hấp chân không tiệt trùng Melag Vacuklav 40B+',
      serialNumber: 'MLG-VK40-2026-09',
      category: 'hvac',
      location: 'Phòng Vô trùng khép kín (CN Quận 1)',
      technician: 'KTV. Lê Văn Bình',
      lastMaintenanceAt: new Date('2026-08-19'),
      nextInspectionAt: new Date('2026-08-26'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch2.id,
    },
    {
      code: 'TB-14',
      name: 'Máy cấy ghép Implant W&H Implantmed Plus',
      serialNumber: 'WH-IMP-2026-14',
      category: 'implant',
      location: 'Phòng Phẫu thuật VIP (CN Quận 1)',
      technician: 'Kỹ sư W&H',
      lastMaintenanceAt: new Date('2026-08-11'),
      nextInspectionAt: new Date('2026-10-15'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch2.id,
    },

    // --- CN03: Thủ Đức / Long Thành ---
    {
      code: 'TB-06',
      name: 'Ghế nha khoa thông minh Stern Weber S380TRc',
      serialNumber: 'STW-380-2026-06',
      category: 'dental_chair',
      location: 'Phòng Khám 01 (CN Thủ Đức)',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-16'),
      nextInspectionAt: new Date('2026-09-22'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch3.id,
    },
    {
      code: 'TB-07',
      name: 'Máy X-Quang Cầm Tay Rexton Dental Posdion',
      serialNumber: 'RXT-XD-2026-07',
      category: 'xray',
      location: 'Phòng Điều trị Tổng quát',
      technician: 'KTV. Lê Văn Bình',
      lastMaintenanceAt: new Date('2026-08-02'),
      nextInspectionAt: new Date('2026-11-02'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch3.id,
    },
    {
      code: 'TB-10',
      name: 'Tủ sấy tiệt trùng nhiệt độ cao Sturdy SA-300H',
      serialNumber: 'STD-SA300-2026-10',
      category: 'hvac',
      location: 'Phòng Chuẩn bị dụng cụ',
      technician: 'KTV. Hoàng Minh',
      lastMaintenanceAt: new Date('2026-08-18'),
      nextInspectionAt: new Date('2026-08-28'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch3.id,
    },
    {
      code: 'TB-16',
      name: 'Máy cấy ghép Implant Bien-Air Chiropro Plus',
      serialNumber: 'BNA-CHP-2026-16',
      category: 'implant',
      location: 'Phòng Phẫu thuật Thủ Đức',
      technician: 'KTV. Lê Văn Bình',
      lastMaintenanceAt: new Date('2026-08-07'),
      nextInspectionAt: new Date('2026-10-10'),
      status: 'OPERATIONAL',
      isPaused: false,
      branchId: branch3.id,
    },
  ];

  for (const item of equipmentsData) {
    const existing = await prisma.equipment.findFirst({
      where: { OR: [{ code: item.code }, { serialNumber: item.serialNumber }] },
    });

    if (existing) {
      await prisma.equipment.update({
        where: { id: existing.id },
        data: {
          code: item.code,
          name: item.name,
          serialNumber: item.serialNumber,
          category: item.category,
          location: item.location,
          technician: item.technician,
          lastMaintenanceAt: item.lastMaintenanceAt,
          nextInspectionAt: item.nextInspectionAt,
          status: item.status,
          isPaused: item.isPaused,
          branchId: item.branchId,
          urgencyAlert: item.urgencyAlert || null,
        },
      });
    } else {
      await prisma.equipment.create({
        data: item,
      });
    }
  }

  // 4. SEED LỊCH BẢO TRÌ & LỊCH SỬ KIỂM ĐỊNH (MAINTENANCE LOGS)
  console.log('\n--- 2. Cập nhật lịch thông báo bảo trì & lịch sử kiểm định ---');

  const eqTB03 = await prisma.equipment.findUnique({ where: { code: 'TB-03' } });
  const eqTB12 = await prisma.equipment.findUnique({ where: { code: 'TB-12' } });
  const eqTB04 = await prisma.equipment.findUnique({ where: { code: 'TB-04' } });
  const eqTB01 = await prisma.equipment.findUnique({ where: { code: 'TB-01' } });

  const maintenanceLogsData = [
    // 1. ST-2026-045: Cần xử lý khẩn cấp Ghế TB-03
    {
      logCode: '#ST-2026-045',
      equipmentId: eqTB03?.id || equipmentsData[0].code,
      technicianId,
      actionType: 'XỬ LÝ SỰ CỐ / THAY LỌC',
      findings: 'Cần thay bộ lọc nước Ghế 03 do áp lực nước cấp giảm 25%, cảnh báo từ cảm biến áp lực AI.',
      isCertified: false,
      status: 'PENDING',
      scheduledAt: new Date('2026-08-22T07:30:00Z'),
      result: 'pending',
    },
    // 2. ST-2026-046: Khử trùng & Test vi sinh Nồi hấp TB-12
    {
      logCode: '#ST-2026-046',
      equipmentId: eqTB12?.id || equipmentsData[0].code,
      technicianId,
      actionType: 'KHỬ TRÙNG & TEST VI SINH',
      findings: 'Kiểm định vi sinh chỉ thị sinh học Geobacillus stearothermophilus định kỳ hàng tuần cho chu trình hấp 134°C.',
      isCertified: true,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-08-25T18:00:00Z'),
      completedAt: new Date('2026-08-25T19:30:00Z'),
      result: 'passed',
      certificateUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394594/smartschedule_ai/services/awsiu55s7nzbbmbnewyn.jpg',
    },
    // 3. ST-2026-047: Hiệu chuẩn tia định kỳ Máy CT TB-04
    {
      logCode: '#ST-2026-047',
      equipmentId: eqTB04?.id || equipmentsData[0].code,
      technicianId,
      actionType: 'HIỆU CHUẨN TIA ĐỊNH KỲ',
      findings: 'Kiểm định đo đạc liều phát tia X, độ chuẩn trực chùm tia Cone Beam và che chắn bức xạ phòng chì.',
      isCertified: true,
      status: 'COMPLETED',
      scheduledAt: new Date('2026-08-27T08:00:00Z'),
      completedAt: new Date('2026-08-27T10:00:00Z'),
      result: 'certified',
      certificateUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394593/smartschedule_ai/services/zbl0qrhqnoxavsubarkw.jpg',
    },
    // 4. BT-2026-042: Bảo trì định kỳ Ghế Sirona TB-01
    {
      logCode: '#BT-2026-042',
      equipmentId: eqTB01?.id || equipmentsData[0].code,
      technicianId,
      actionType: 'BẢO TRÌ ĐỊNH KỲ',
      findings: 'Bảo dưỡng định kỳ hệ thống thủy lực, tra dầu bôi trơn motor ghế và vệ sinh đường ống hút trung tâm.',
      isCertified: true,
      status: 'COMPLETED',
      completedAt: new Date('2026-05-12T10:00:00Z'),
      result: 'passed',
      certificateUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394589/smartschedule_ai/services/xhrybk8wd5nwl89btp7b.jpg',
    },
    // 5. BT-2026-039: Khử trùng & kiểm định Nồi hấp
    {
      logCode: '#BT-2026-039',
      equipmentId: eqTB12?.id || equipmentsData[0].code,
      technicianId,
      actionType: 'KHỬ TRÙNG & KIỂM ĐỊNH',
      findings: 'Đạt kiểm định chu kỳ áp suất âm Class B và test rò rỉ chân không Bowie-Dick.',
      isCertified: true,
      status: 'COMPLETED',
      completedAt: new Date('2026-05-08T15:30:00Z'),
      result: 'passed',
    },
    // 6. BT-2026-035: Hiệu chuẩn tia X-Quang Vatech
    {
      logCode: '#BT-2026-035',
      equipmentId: eqTB04?.id || equipmentsData[0].code,
      technicianId,
      actionType: 'HIỆU CHUẨN TIA X-QUANG',
      findings: 'Cục An toàn Bức xạ Hạt nhân cấp chứng nhận kiểm chuẩn định kỳ đạt tiêu chuẩn an toàn.',
      isCertified: true,
      status: 'COMPLETED',
      completedAt: new Date('2026-05-02T09:15:00Z'),
      result: 'certified',
    },
  ];

  for (const log of maintenanceLogsData) {
    if (!log.equipmentId) continue;
    await prisma.equipmentMaintenanceLog.upsert({
      where: { logCode: log.logCode },
      update: {
        equipmentId: log.equipmentId,
        technicianId: log.technicianId,
        actionType: log.actionType,
        findings: log.findings,
        isCertified: log.isCertified,
        status: log.status,
        scheduledAt: log.scheduledAt,
        completedAt: log.completedAt,
        result: log.result,
        certificateUrl: log.certificateUrl,
      },
      create: log,
    });
  }

  // 5. LIÊN KẾT HÓA ĐƠN VỚI BỆNH NHÂN THẬT (BN26-XXXX) KHỚP VỚI DOANH THU 1.42 TỶ
  console.log('\n--- 3. Cập nhật Hóa đơn & Doanh thu khớp 1.42 tỷ ---');

  const seededPatients = await prisma.patient.findMany({
    orderBy: { patientCode: 'asc' },
  });

  // Danh sách hóa đơn thật phân bổ vào 3 chi nhánh:
  // CN01: 680M tổng doanh thu, thực thu: 560M, công nợ: 120M
  // CN02: 540M tổng doanh thu, thực thu: 470M, công nợ: 70M (+ 80M ca khác = 150M)
  // CN03: 200M tổng doanh thu, thực thu: 170M, công nợ: 30M
  // Tổng doanh thu hệ thống = 680 + 540 + 200 = 1,420,000,000 (1.42 Tỷ)
  // Tổng thực thu = 560 + 390 + 170 = 1.12 Tỷ
  // Tổng công nợ = 300 Triệu

  const invoicesToSeed = [
    // --- CN01 (Biên Hòa): 680M ---
    {
      invoiceCode: '#HD-2026-8956',
      branchId: branch1.id,
      patientId: seededPatients[0].id,
      totalAmount: 180000000,
      finalAmount: 180000000,
      paidAmount: 180000000,
      paymentMethod: 'VIETQR',
      status: 'PAID',
      createdAt: new Date('2026-08-22T16:15:00Z'),
    },
    {
      invoiceCode: '#HD-2026-8955',
      branchId: branch1.id,
      patientId: seededPatients[1].id,
      totalAmount: 200000000,
      finalAmount: 200000000,
      paidAmount: 200000000,
      paymentMethod: 'POS',
      status: 'PAID',
      createdAt: new Date('2026-08-22T14:40:00Z'),
    },
    {
      invoiceCode: '#HD-2026-8954',
      branchId: branch1.id,
      patientId: seededPatients[2].id,
      totalAmount: 180000000,
      finalAmount: 180000000,
      paidAmount: 180000000,
      paymentMethod: 'VIETQR',
      status: 'PAID',
      createdAt: new Date('2026-08-21T11:20:00Z'),
    },
    {
      invoiceCode: '#HD-2026-8953',
      branchId: branch1.id,
      patientId: seededPatients[3].id,
      totalAmount: 120000000,
      finalAmount: 120000000,
      paidAmount: 0,
      paymentMethod: 'VIETQR',
      status: 'UNPAID', // Công nợ 120M
      createdAt: new Date('2026-08-20T09:00:00Z'),
    },

    // --- CN02 (Quận 1): 540M ---
    {
      invoiceCode: '#HD-2026-7841',
      branchId: branch2.id,
      patientId: seededPatients[4].id,
      totalAmount: 220000000,
      finalAmount: 220000000,
      paidAmount: 220000000,
      paymentMethod: 'VIETQR',
      status: 'PAID',
      createdAt: new Date('2026-08-22T15:00:00Z'),
    },
    {
      invoiceCode: '#HD-2026-7840',
      branchId: branch2.id,
      patientId: seededPatients[5].id,
      totalAmount: 170000000,
      finalAmount: 170000000,
      paidAmount: 170000000,
      paymentMethod: 'POS',
      status: 'PAID',
      createdAt: new Date('2026-08-21T16:30:00Z'),
    },
    {
      invoiceCode: '#HD-2026-7839',
      branchId: branch2.id,
      patientId: seededPatients[6].id,
      totalAmount: 150000000,
      finalAmount: 150000000,
      paidAmount: 0,
      paymentMethod: 'VIETQR',
      status: 'UNPAID', // Công nợ 150M
      createdAt: new Date('2026-08-19T10:15:00Z'),
    },

    // --- CN03 (Thủ Đức): 200M ---
    {
      invoiceCode: '#HD-2026-6120',
      branchId: branch3.id,
      patientId: seededPatients[7].id,
      totalAmount: 90000000,
      finalAmount: 90000000,
      paidAmount: 90000000,
      paymentMethod: 'VIETQR',
      status: 'PAID',
      createdAt: new Date('2026-08-22T10:00:00Z'),
    },
    {
      invoiceCode: '#HD-2026-6119',
      branchId: branch3.id,
      patientId: seededPatients[8].id,
      totalAmount: 80000000,
      finalAmount: 80000000,
      paidAmount: 80000000,
      paymentMethod: 'CASH',
      status: 'PAID',
      createdAt: new Date('2026-08-21T09:30:00Z'),
    },
    {
      invoiceCode: '#HD-2026-6118',
      branchId: branch3.id,
      patientId: seededPatients[9].id,
      totalAmount: 30000000,
      finalAmount: 30000000,
      paidAmount: 0,
      paymentMethod: 'VIETQR',
      status: 'UNPAID', // Công nợ 30M
      createdAt: new Date('2026-08-18T14:00:00Z'),
    },
  ];

  for (const inv of invoicesToSeed) {
    const invoice = await prisma.invoice.upsert({
      where: { invoiceCode: inv.invoiceCode },
      update: {
        branchId: inv.branchId,
        patientId: inv.patientId,
        totalAmount: inv.totalAmount,
        finalAmount: inv.finalAmount,
        status: inv.status,
        createdAt: inv.createdAt,
      },
      create: {
        invoiceCode: inv.invoiceCode,
        branchId: inv.branchId,
        patientId: inv.patientId,
        totalAmount: inv.totalAmount,
        finalAmount: inv.finalAmount,
        status: inv.status,
        createdAt: inv.createdAt,
      },
    });

    if (inv.paidAmount > 0) {
      const receiptCode = `#PT-${inv.invoiceCode.replace('#HD-', '')}`;
      await prisma.payment.upsert({
        where: { receiptCode },
        update: {
          invoiceId: invoice.id,
          amountPaid: inv.paidAmount,
          paymentMethod: inv.paymentMethod,
          isMatched: true,
          paidAt: inv.createdAt,
        },
        create: {
          receiptCode,
          invoiceId: invoice.id,
          amountPaid: inv.paidAmount,
          paymentMethod: inv.paymentMethod,
          transactionRef: `VQR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          isMatched: true,
          paidAt: inv.createdAt,
        },
      });
    }
  }

  console.log('\n🎉 Hoàn tất cập nhật dữ liệu thật vào Database!');
}

seedRealData()
  .catch((e) => {
    console.error('Lỗi khi seed dữ liệu thật:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
