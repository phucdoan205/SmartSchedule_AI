import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu Seed Danh Sách Nhân Sự & Lịch Trực Chuẩn ---');

  // 1. Lấy chi nhánh
  const branches = await prisma.branch.findMany();
  const branchMap: Record<string, any> = {};
  branches.forEach((b) => {
    branchMap[b.code] = b;
  });

  const b1 = branchMap['CN01'] || branches[0];
  const b2 = branchMap['CN02'] || branches[1] || b1;
  const b3 = branchMap['CN03'] || branches[2] || b1;

  // 2. Roles
  const rolesData = [
    { name: 'SUPER_ADMIN', description: 'Quản trị viên toàn hệ thống' },
    { name: 'BRANCH_MANAGER', description: 'Giám đốc / Quản lý chi nhánh' },
    { name: 'DOCTOR', description: 'Bác sĩ điều trị chuyên khoa' },
    { name: 'NURSE', description: 'Điều dưỡng & Phụ tá nha khoa' },
    { name: 'TECHNICIAN', description: 'Kỹ thuật viên phòng mổ & Lab' },
    { name: 'RECEPTIONIST', description: 'Lễ tân tiếp đón & CSKH' },
  ];

  const roleMap: Record<string, any> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roleMap[r.name] = role;
  }

  const passwordHash = await bcrypt.hash('123456', 10);

  // 3. Danh sách 12 nhân sự thật
  const staffData = [
    // Chi nhánh Biên Hòa (CN01)
    {
      code: 'NV001',
      name: 'BS. Nguyễn Thị An',
      email: 'nguyenthian@smartschedule.ai',
      phone: '0901234567',
      branchId: b1.id,
      roleName: 'DOCTOR',
      specialty: 'Phục hình Răng sứ & Thẩm mỹ',
      department: 'Khoa Phục hình sứ',
      licenseNumber: '004589/ĐNAI-CCHN',
      experienceYears: 12,
      rating: 4.9,
      reviews: 128,
      commissionRate: 15,
      avatarUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394602/smartschedule_ai/doctors/ldp6puin5gfouc0wsj54.jpg',
      bio: 'Bác sĩ chuyên khoa II với hơn 12 năm kinh nghiệm trong lĩnh vực phục hình răng sứ thẩm mỹ và dán sứ Veneer.',
    },
    {
      code: 'NV002',
      name: 'TS.BS. Nguyễn Minh Anh',
      email: 'minhanh.nguyen@smartschedule.ai',
      phone: '0903123456',
      branchId: b1.id,
      roleName: 'DOCTOR',
      specialty: 'Cấy ghép Implant Chuyên Sâu',
      department: 'Khoa Cấy ghép Implant',
      licenseNumber: '007821/HCM-CCHN',
      experienceYears: 15,
      rating: 5.0,
      reviews: 210,
      commissionRate: 20,
      avatarUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394601/smartschedule_ai/doctors/vkie8jrp9liff0yrjcgy.jpg',
      bio: 'Tiến sĩ - Bác sĩ đầu ngành cấy ghép Implant vô trùng, thành viên Hiệp hội Cấy ghép Nha khoa Quốc tế (ICOI).',
    },
    {
      code: 'NV003',
      name: 'KTV. Hoàng Minh',
      email: 'hoangminh@smartschedule.ai',
      phone: '0908777123',
      branchId: b1.id,
      roleName: 'TECHNICIAN',
      specialty: 'Vô trùng & Phụ mổ',
      department: 'Phòng Mổ & Tiệt khuẩn',
      experienceYears: 6,
      rating: 4.8,
      reviews: 65,
      commissionRate: 8,
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      bio: 'Kỹ thuật viên kiểm soát nhiễm khuẩn và vô trùng buồng phẫu thuật đạt chứng chỉ quốc tế.',
    },
    {
      code: 'NV004',
      name: 'LT. Trần Thị Ngọc',
      email: 'ngoc.tran@smartschedule.ai',
      phone: '0919333444',
      branchId: b1.id,
      roleName: 'RECEPTIONIST',
      specialty: 'Lễ tân & Điều phối bệnh nhân',
      department: 'Bộ phận Tiếp tân & CSKH',
      experienceYears: 4,
      rating: 4.9,
      reviews: 90,
      commissionRate: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813588-e9f0d7e63b39?w=300&auto=format&fit=crop&q=80',
      bio: 'Chuyên viên điều phối lịch hẹn và đón tiếp bệnh nhân tại chi nhánh Biên Hòa.',
    },

    // Chi nhánh Quận 1 (CN02)
    {
      code: 'NV005',
      name: 'BS.CKI Nguyễn Văn Tuấn',
      email: 'tuan.nguyen@smartschedule.ai',
      phone: '0908889991',
      branchId: b2.id,
      roleName: 'DOCTOR',
      specialty: 'Cấy ghép Implant & Tiểu phẫu',
      department: 'Khoa Phẫu thuật trong miệng',
      licenseNumber: '006123/HCM-CCHN',
      experienceYears: 10,
      rating: 4.9,
      reviews: 145,
      commissionRate: 18,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
      bio: 'Chuyên gia phục hình và tiểu phẫu xương hàm, cấy ghép tức thì chịu lực.',
    },
    {
      code: 'NV006',
      name: 'BS. Lê Thị Lan',
      email: 'lan.le@smartschedule.ai',
      phone: '0912345888',
      branchId: b2.id,
      roleName: 'DOCTOR',
      specialty: 'Phục hình sứ & Chỉnh nha',
      department: 'Khoa Chỉnh nha Thẩm mỹ',
      licenseNumber: '009876/HCM-CCHN',
      experienceYears: 8,
      rating: 4.8,
      reviews: 112,
      commissionRate: 15,
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
      bio: 'Bác sĩ chuyên sâu niềng răng trong suốt Invisalign và thẩm mỹ nụ cười.',
    },
    {
      code: 'NV007',
      name: 'ĐD. Phạm Hoàng Nam',
      email: 'nam.pham@smartschedule.ai',
      phone: '0933221100',
      branchId: b2.id,
      roleName: 'NURSE',
      specialty: 'Điều dưỡng trưởng & Hỗ trợ phẫu thuật',
      department: 'Bộ phận Điều dưỡng',
      experienceYears: 7,
      rating: 4.9,
      reviews: 58,
      commissionRate: 8,
      avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
      bio: 'Điều dưỡng trưởng phụ trách điều phối hỗ trợ ghế nha khoa và chăm sóc hậu phẫu.',
    },
    {
      code: 'NV008',
      name: 'LT. Đặng Thùy Linh',
      email: 'linh.dang@smartschedule.ai',
      phone: '0909112233',
      branchId: b2.id,
      roleName: 'RECEPTIONIST',
      specialty: 'Lễ tân & Điều phối VIP',
      department: 'Bộ phận Tiếp tân & CSKH',
      experienceYears: 5,
      rating: 5.0,
      reviews: 104,
      commissionRate: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      bio: 'Chuyên viên chăm sóc khách hàng cao cấp và điều phối phòng VIP cơ sở Quận 1.',
    },

    // Chi nhánh TP. Thủ Đức (CN03)
    {
      code: 'NV009',
      name: 'BS. Trần Đức Cường',
      email: 'cuong.tran@smartschedule.ai',
      phone: '0988776655',
      branchId: b3.id,
      roleName: 'DOCTOR',
      specialty: 'Nha khoa Tổng quát & Trẻ em',
      department: 'Khoa Nha khoa Tổng quát',
      licenseNumber: '008123/TDUC-CCHN',
      experienceYears: 9,
      rating: 4.9,
      reviews: 160,
      commissionRate: 15,
      avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
      bio: 'Bác sĩ chuyên khoa nụ cười trẻ thơ và điều trị nha khoa không đau cho người cao tuổi.',
    },
    {
      code: 'NV010',
      name: 'BS. Vũ Phương Thảo',
      email: 'thao.vu@smartschedule.ai',
      phone: '0977665544',
      branchId: b3.id,
      roleName: 'DOCTOR',
      specialty: 'Chỉnh nha & Niềng răng thẩm mỹ',
      department: 'Khoa Chỉnh nha',
      licenseNumber: '004129/TDUC-CCHN',
      experienceYears: 7,
      rating: 4.8,
      reviews: 95,
      commissionRate: 15,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813588-e9f0d7e63b39?w=300&auto=format&fit=crop&q=80',
      bio: 'Bác sĩ chuyên khoa chỉnh nha mặt trong và khí cụ can thiệp tăng trưởng hàm trẻ em.',
    },
    {
      code: 'NV011',
      name: 'KTV. Lê Quốc Bảo',
      email: 'bao.le@smartschedule.ai',
      phone: '0944556677',
      branchId: b3.id,
      roleName: 'TECHNICIAN',
      specialty: 'Kỹ thuật viên X-Quang & Lab',
      department: 'Khoa Chẩn đoán Hình ảnh & Labo',
      experienceYears: 5,
      rating: 4.7,
      reviews: 42,
      commissionRate: 8,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      bio: 'Chuyên viên vận hành máy chụp CT Cone Beam 3D và quét dấu hàm kỹ thuật số Trios.',
    },
    {
      code: 'NV012',
      name: 'LT. Nguyễn Mai Phương',
      email: 'phuong.nguyen@smartschedule.ai',
      phone: '0966554433',
      branchId: b3.id,
      roleName: 'RECEPTIONIST',
      specialty: 'Lễ tân tiếp đón & CSKH',
      department: 'Bộ phận Tiếp tân & CSKH',
      experienceYears: 3,
      rating: 4.9,
      reviews: 78,
      commissionRate: 5,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      bio: 'Tiếp đón và hướng dẫn thủ tục khám bảo hiểm tại chi nhánh TP. Thủ Đức.',
    },
  ];

  const createdUsers: any[] = [];

  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        employeeCode: s.code,
        fullName: s.name,
        phone: s.phone,
        branchId: s.branchId,
        avatarUrl: s.avatarUrl,
      },
      create: {
        employeeCode: s.code,
        fullName: s.name,
        email: s.email,
        phone: s.phone,
        passwordHash,
        branchId: s.branchId,
        avatarUrl: s.avatarUrl,
      },
    });

    createdUsers.push(user);

    // Gán Role
    const targetRole = roleMap[s.roleName] || roleMap['DOCTOR'];
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: targetRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: targetRole.id,
      },
    });

    // Nếu là Bác sĩ thì tạo DoctorProfile
    if (s.roleName === 'DOCTOR') {
      await prisma.doctorProfile.upsert({
        where: { userId: user.id },
        update: {
          specialty: s.specialty,
          licenseNumber: s.licenseNumber,
          experienceYears: s.experienceYears,
          ratingAverage: s.rating,
          totalReviews: s.reviews,
          bio: s.bio,
        },
        create: {
          userId: user.id,
          specialty: s.specialty,
          licenseNumber: s.licenseNumber || `CCHN-${Math.floor(100000 + Math.random() * 900000)}`,
          experienceYears: s.experienceYears || 5,
          ratingAverage: s.rating || 5.0,
          totalReviews: s.reviews || 50,
          bio: s.bio,
        },
      });
    }
  }

  console.log(`✓ Đã tạo/cập nhật ${createdUsers.length} nhân sự thật trên 3 chi nhánh.`);

  // 4. Seed Lịch làm việc (StaffSchedule) cho tuần này & tuần sau
  console.log('--- Tạo Lịch Trực Chuẩn (StaffSchedule) ---');

  // Xóa các ca trực cũ để tạo bộ ca chuẩn đồng bộ
  await prisma.staffSchedule.deleteMany({});

  // Sinh các ngày từ Thứ 2 đến Thứ 7 tuần này
  // Dùng ngày hiện tại để tính tuần
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  // Tạo lịch cho 2 tuần liên tiếp
  for (let weekOffset = 0; weekOffset <= 1; weekOffset++) {
    for (let dayOffset = 0; dayOffset < 6; dayOffset++) { // T2 -> T7
      const shiftDate = new Date(monday);
      shiftDate.setDate(monday.getDate() + (weekOffset * 7) + dayOffset);
      const dateOnly = new Date(shiftDate.toISOString().split('T')[0] + 'T00:00:00.000Z');

      for (const u of createdUsers) {
        // Phân ca theo nhân sự
        // Ca Sáng: 08:00 -> 12:00
        const isMorning = (u.employeeCode.charCodeAt(u.employeeCode.length - 1) + dayOffset) % 2 === 0;
        const isAfternoon = (u.employeeCode.charCodeAt(u.employeeCode.length - 1) + dayOffset) % 3 === 0;
        const isLeave = dayOffset === 4 && (u.employeeCode === 'NV001' || u.employeeCode === 'NV005'); // Nghỉ T6

        if (isLeave) {
          await prisma.staffSchedule.create({
            data: {
              userId: u.id,
              branchId: u.branchId,
              workDate: dateOnly,
              shiftStart: new Date('1970-01-01T08:00:00.000Z'),
              shiftEnd: new Date('1970-01-01T17:30:00.000Z'),
              isLeave: true,
              notes: 'Đăng ký nghỉ phép định kỳ (Đã duyệt)',
            },
          });
        } else {
          if (isMorning) {
            await prisma.staffSchedule.create({
              data: {
                userId: u.id,
                branchId: u.branchId,
                workDate: dateOnly,
                shiftStart: new Date('1970-01-01T08:00:00.000Z'),
                shiftEnd: new Date('1970-01-01T12:00:00.000Z'),
                isLeave: false,
                notes: 'Ca Sáng (08:00 - 12:00)',
              },
            });
          }
          if (isAfternoon) {
            await prisma.staffSchedule.create({
              data: {
                userId: u.id,
                branchId: u.branchId,
                workDate: dateOnly,
                shiftStart: new Date('1970-01-01T13:30:00.000Z'),
                shiftEnd: new Date('1970-01-01T17:30:00.000Z'),
                isLeave: false,
                notes: 'Ca Chiều (13:30 - 17:30)',
              },
            });
          }
        }
      }
    }
  }

  const totalShifts = await prisma.staffSchedule.count();
  console.log(`✓ Đã tạo thành công ${totalShifts} ca trực chuẩn cho 12 nhân sự.`);
  console.log('🎉 Hoàn thành Seed Nhân Sự & Lịch Trực!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi seed nhân sự:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
