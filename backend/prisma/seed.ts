import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dolpobdpw',
  api_key: process.env.CLOUDINARY_API_KEY || '529424352781198',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Cbi0k2-Y47jmHwpNNB4P6JYx9ws',
});

async function uploadAsset(relativeAssetPath: string, folder: string): Promise<string> {
  const fullPath = path.resolve(__dirname, '../../frontend/src/assets', relativeAssetPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`[Warning] Asset file not found: ${fullPath}`);
    return '';
  }

  try {
    console.log(`Uploading ${relativeAssetPath} to Cloudinary folder ${folder}...`);
    const result = await cloudinary.uploader.upload(fullPath, {
      folder: `smartschedule_ai/${folder}`,
      resource_type: 'image',
    });
    console.log(`Uploaded successfully: ${result.secure_url}`);
    return result.secure_url;
  } catch (err: any) {
    console.error(`Error uploading ${relativeAssetPath}:`, err.message);
    return '';
  }
}

async function main() {
  console.log('--- Starting SmartSchedule AI Database Seeding ---');

  // 1. Upload real assets to Cloudinary
  console.log('\n--- 1. Uploading real assets from assets folder to Cloudinary ---');
  const service1Url = await uploadAsset('ảnh dịch vụ 1.jpg', 'services');
  const service2Url = await uploadAsset('ảnh dịch vụ 2.jpg', 'services');
  const service3Url = await uploadAsset('ảnh dịch vụ 3.jpg', 'services');
  const service4Url = await uploadAsset('ảnh dịch vụ 4.jpg', 'services');

  const branch1Url = await uploadAsset('cơ sở 1.jpg', 'branches');
  const branch2Url = await uploadAsset('cơ sở 2.jpg', 'branches');
  const branch3Url = await uploadAsset('cơ sở 3.jpg', 'branches');

  const doctor1Url = await uploadAsset('bacsi.jpg', 'doctors');
  const doctor2Url = await uploadAsset('bacsi1.jpg', 'doctors');

  // 2. Roles & Permissions
  console.log('\n--- 2. Seeding Roles & Permissions ---');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN', description: 'Quản trị viên toàn hệ thống' },
  });

  const branchManagerRole = await prisma.role.upsert({
    where: { name: 'BRANCH_MANAGER' },
    update: {},
    create: { name: 'BRANCH_MANAGER', description: 'Giám đốc / Quản lý chi nhánh' },
  });

  const doctorRole = await prisma.role.upsert({
    where: { name: 'DOCTOR' },
    update: {},
    create: { name: 'DOCTOR', description: 'Bác sĩ điều trị chuyên khoa' },
  });

  const receptionistRole = await prisma.role.upsert({
    where: { name: 'RECEPTIONIST' },
    update: {},
    create: { name: 'RECEPTIONIST', description: 'Lễ tân tiếp đón & CSKH' },
  });

  // 3. Branches
  console.log('\n--- 3. Seeding Branches ---');
  const branch1 = await prisma.branch.upsert({
    where: { code: 'CN01' },
    update: { imageUrl: branch1Url || undefined },
    create: {
      code: 'CN01',
      name: 'Chi nhánh Biên Hòa (Trụ sở chính)',
      address: '123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai',
      phone: '0236 6555 555',
      imageUrl: branch1Url,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { code: 'CN02' },
    update: { imageUrl: branch2Url || undefined },
    create: {
      code: 'CN02',
      name: 'Chi nhánh Quận 1 (Trung tâm)',
      address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
      phone: '028 3822 1111',
      imageUrl: branch2Url,
    },
  });

  const branch3 = await prisma.branch.upsert({
    where: { code: 'CN03' },
    update: { imageUrl: branch3Url || undefined },
    create: {
      code: 'CN03',
      name: 'Chi nhánh TP. Thủ Đức',
      address: '789 Đường Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM',
      phone: '028 3720 3333',
      imageUrl: branch3Url,
    },
  });

  // 4. Rooms & Chairs
  console.log('\n--- 4. Seeding Rooms & Operatory Chairs ---');
  // Rooms for Branch 1
  const room101 = await prisma.room.upsert({
    where: { id: 'room-bh-101' },
    update: {},
    create: {
      id: 'room-bh-101',
      branchId: branch1.id,
      roomNumber: 'P.101',
      name: 'Phòng Phẫu Thuật Implant Vô Trùng',
      floor: 1,
      isSterilized: true,
    },
  });

  const room102 = await prisma.room.upsert({
    where: { id: 'room-bh-102' },
    update: {},
    create: {
      id: 'room-bh-102',
      branchId: branch1.id,
      roomNumber: 'P.102',
      name: 'Phòng Khám Răng Tổng Quát & Thẩm Mỹ',
      floor: 1,
      isSterilized: true,
    },
  });

  // Chairs for Room 101 & 102
  const chair1 = await prisma.operatoryChair.upsert({
    where: { id: 'chair-bh-01' },
    update: {},
    create: {
      id: 'chair-bh-01',
      roomId: room101.id,
      code: 'GHE-01',
      name: 'Ghế Phẫu Thuật Vô Trùng Ghế 01',
      status: 'AVAILABLE',
    },
  });

  const chair2 = await prisma.operatoryChair.upsert({
    where: { id: 'chair-bh-02' },
    update: {},
    create: {
      id: 'chair-bh-02',
      roomId: room101.id,
      code: 'GHE-02',
      name: 'Ghế Phẫu Thuật Vô Trùng Ghế 02',
      status: 'AVAILABLE',
    },
  });

  const chair3 = await prisma.operatoryChair.upsert({
    where: { id: 'chair-bh-03' },
    update: {},
    create: {
      id: 'chair-bh-03',
      roomId: room102.id,
      code: 'GHE-03',
      name: 'Ghế Thẩm Mỹ Cao Cấp Ghế 03',
      status: 'AVAILABLE',
    },
  });

  // 5. Service Categories & Real Services
  console.log('\n--- 5. Seeding Service Categories & Real Services with Cloudinary URLs ---');
  const catImplant = await prisma.serviceCategory.upsert({
    where: { slug: 'cay-ghep-implant' },
    update: {},
    create: {
      name: 'Cấy ghép Implant',
      slug: 'cay-ghep-implant',
      description: 'Công nghệ cấy ghép trụ răng nhân tạo phục hình vĩnh viễn',
    },
  });

  const catPorcelain = await prisma.serviceCategory.upsert({
    where: { slug: 'rang-su-tham-my' },
    update: {},
    create: {
      name: 'Răng sứ thẩm mỹ',
      slug: 'rang-su-tham-my',
      description: 'Phục hình bọc răng sứ, mặt dán veneer công nghệ Nano',
    },
  });

  const catGeneral = await prisma.serviceCategory.upsert({
    where: { slug: 'nha-khoa-tong-quat' },
    update: {},
    create: {
      name: 'Nha khoa thẩm mỹ & Tổng quát',
      slug: 'nha-khoa-tong-quat',
      description: 'Tẩy trắng răng, lấy cao răng siêu âm và điều trị tổng quát',
    },
  });

  // The 4 REAL services matching the 4 real images in assets:
  const srv1 = await prisma.service.upsert({
    where: { code: 'DV-IMP-01' },
    update: { imageUrl: service1Url || undefined },
    create: {
      categoryId: catImplant.id,
      code: 'DV-IMP-01',
      name: 'Cấy ghép 1 trụ Implant Straumann SLA (Thụy Sỹ)',
      standardPrice: 43000000,
      deposit: 5000000,
      warranty: 'Trọn đời',
      durationMinutes: 60,
      description: 'Trụ Implant Straumann SLA tiêu chuẩn y khoa Thụy Sỹ, tích hợp xương nhanh sau 3-4 tuần, bảo hành trọn đời.',
      imageUrl: service1Url,
      isActive: true,
      isAiRecommended: true,
    },
  });

  const srv2 = await prisma.service.upsert({
    where: { code: 'DV-POR-01' },
    update: { imageUrl: service2Url || undefined },
    create: {
      categoryId: catPorcelain.id,
      code: 'DV-POR-01',
      name: 'Bọc Răng Sứ Toàn Phần Cercon HT (Đức)',
      standardPrice: 6000000,
      deposit: 500000,
      warranty: '10 năm',
      durationMinutes: 60,
      description: 'Răng sứ toàn phần Cercon HT chính hãng Đức, độ trong tự nhiên và chịu lực gấp 5 lần răng thật.',
      imageUrl: service2Url,
      isActive: true,
      isAiRecommended: true,
    },
  });

  const srv3 = await prisma.service.upsert({
    where: { code: 'DV-VEN-01' },
    update: { imageUrl: service3Url || undefined },
    create: {
      categoryId: catPorcelain.id,
      code: 'DV-VEN-01',
      name: 'Mặt Dán Sứ Veneer Emax Siêu Mỏng (Thụy Sĩ)',
      standardPrice: 8000000,
      deposit: 1000000,
      warranty: '10 năm',
      durationMinutes: 90,
      description: 'Dán sứ Veneer Emax cao cấp không mài nhỏ răng, bảo tồn tối đa tủy răng và thẩm mỹ nụ cười chuẩn tỷ lệ vàng.',
      imageUrl: service3Url,
      isActive: true,
      isAiRecommended: true,
    },
  });

  const srv4 = await prisma.service.upsert({
    where: { code: 'DV-WHT-01' },
    update: { imageUrl: service4Url || undefined },
    create: {
      categoryId: catGeneral.id,
      code: 'DV-WHT-01',
      name: 'Tẩy Trắng Răng Chuyên Sâu Công Nghệ Laser Whitening',
      standardPrice: 5500000,
      deposit: 300000,
      warranty: '2 năm',
      durationMinutes: 45,
      description: 'Tẩy trắng răng công nghệ ánh sáng Laser kết hợp gel làm trắng chuẩn FDA Hoa Kỳ, không ê buốt.',
      imageUrl: service4Url,
      isActive: true,
      isAiRecommended: false,
    },
  });

  // 6. Users & Doctors
  console.log('\n--- 6. Seeding Users (Admin, Doctors) ---');
  const passwordHash = await bcrypt.hash('123456', 10);

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smartschedule.ai' },
    update: { avatarUrl: doctor1Url || undefined },
    create: {
      employeeCode: 'NV-ADMIN',
      fullName: 'Quản Trị Viên Hệ Thống',
      email: 'admin@smartschedule.ai',
      phone: '0900000001',
      passwordHash,
      branchId: branch1.id,
      avatarUrl: doctor1Url,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // Doctor 1: BS. Nguyễn Thị An
  const doctor1User = await prisma.user.upsert({
    where: { email: 'nguyenthian@smartschedule.ai' },
    update: { avatarUrl: doctor2Url || undefined },
    create: {
      employeeCode: 'NV001',
      fullName: 'BS. Nguyễn Thị An',
      email: 'nguyenthian@smartschedule.ai',
      phone: '0901234567',
      passwordHash,
      branchId: branch1.id,
      avatarUrl: doctor2Url,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: doctor1User.id,
        roleId: doctorRole.id,
      },
    },
    update: {},
    create: {
      userId: doctor1User.id,
      roleId: doctorRole.id,
    },
  });

  const doctor1Profile = await prisma.doctorProfile.upsert({
    where: { userId: doctor1User.id },
    update: {},
    create: {
      userId: doctor1User.id,
      licenseNumber: '004589/ĐNAI-CCHN',
      specialty: 'Phục hình Răng sứ & Thẩm mỹ',
      experienceYears: 12,
      bio: 'Bác sĩ chuyên khoa II với hơn 12 năm kinh nghiệm trong lĩnh vực phục hình răng sứ thẩm mỹ và dán sứ Veneer.',
      ratingAverage: 4.9,
      totalReviews: 128,
    },
  });

  // Assign Chair 1 to Doctor 1
  await prisma.operatoryChair.update({
    where: { id: chair1.id },
    data: { assignedDoctorId: doctor1Profile.id },
  });

  // Doctor 2: TS.BS. Nguyễn Minh Anh
  const doctor2User = await prisma.user.upsert({
    where: { email: 'minhanh.nguyen@smartschedule.ai' },
    update: { avatarUrl: doctor1Url || undefined },
    create: {
      employeeCode: 'NV002',
      fullName: 'TS.BS. Nguyễn Minh Anh',
      email: 'minhanh.nguyen@smartschedule.ai',
      phone: '0903123456',
      passwordHash,
      branchId: branch1.id,
      avatarUrl: doctor1Url,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: doctor2User.id,
        roleId: doctorRole.id,
      },
    },
    update: {},
    create: {
      userId: doctor2User.id,
      roleId: doctorRole.id,
    },
  });

  const doctor2Profile = await prisma.doctorProfile.upsert({
    where: { userId: doctor2User.id },
    update: {},
    create: {
      userId: doctor2User.id,
      licenseNumber: '007821/HCM-CCHN',
      specialty: 'Cấy ghép Implant Chuyên Sâu',
      experienceYears: 15,
      bio: 'Tiến sĩ - Bác sĩ đầu ngành cấy ghép Implant vô trùng, thành viên Hiệp hội Cấy ghép Nha khoa Quốc tế (ICOI).',
      ratingAverage: 5.0,
      totalReviews: 210,
    },
  });

  // Assign Chair 2 to Doctor 2
  await prisma.operatoryChair.update({
    where: { id: chair2.id },
    data: { assignedDoctorId: doctor2Profile.id },
  });

  // 7. Seed Equipment
  console.log('\n--- 7. Seeding Equipments ---');
  await prisma.equipment.upsert({
    where: { code: 'TB-01' },
    update: {},
    create: {
      branchId: branch1.id,
      chairId: chair1.id,
      code: 'TB-01',
      name: 'Ghế Phẫu Thuật Sirona Intego (Đức)',
      serialNumber: 'SRN-INT-2026-001',
      status: 'OPERATIONAL',
    },
  });

  await prisma.equipment.upsert({
    where: { code: 'TB-02' },
    update: {},
    create: {
      branchId: branch1.id,
      chairId: chair2.id,
      code: 'TB-02',
      name: 'Máy Chụp Phim CT Cone Beam Vatech PaX-i3D',
      serialNumber: 'VT-CB-2026-88',
      status: 'OPERATIONAL',
    },
  });

  console.log('\n🎉 SmartSchedule AI Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
