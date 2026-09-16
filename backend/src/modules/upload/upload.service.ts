import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

export const UPLOAD_CATEGORIES = {
  SERVICES: 'services',
  BRANCHES: 'branches',
  DOCTORS: 'doctors',
  PATIENTS: 'patients',
  XRAYS: 'xrays',
  EQUIPMENTS: 'equipments',
  PAYMENTS: 'payments',
  PRESCRIPTIONS: 'prescriptions',
  STAFF: 'staff',
  BANNERS: 'banners',
} as const;

export type UploadCategoryType = keyof typeof UPLOAD_CATEGORIES | string;

@Injectable()
export class UploadService {
  constructor(private readonly prisma: PrismaService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dolpobdpw',
      api_key: process.env.CLOUDINARY_API_KEY || '529424352781198',
      api_secret: process.env.CLOUDINARY_API_SECRET || 'Cbi0k2-Y47jmHwpNNB4P6JYx9ws',
    });
  }

  resolveFolderPath(categoryOrFolder: string = 'services'): string {
    const raw = (categoryOrFolder || 'services').trim().toLowerCase();
    // If already has root namespace smartschedule_ai, keep it
    if (raw.startsWith('smartschedule_ai/')) {
      return raw;
    }
    if (raw === 'smartschedule_ai') {
      return 'smartschedule_ai/services';
    }
    const cleanSub = raw.replace(/^\/+|\/+$/g, '');
    return `smartschedule_ai/${cleanSub}`;
  }

  async uploadImage(
    file: MulterFile,
    categoryOrFolder: string = 'services',
  ): Promise<{ url: string; public_id: string; folder: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng cung cấp tệp hình ảnh hợp lệ');
    }

    const folder = this.resolveFolderPath(categoryOrFolder);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            return reject(new BadRequestException(error?.message || 'Tải ảnh lên Cloudinary thất bại'));
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            folder,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadAvatar(
    file: MulterFile,
    userId: string,
  ): Promise<{ url: string; public_id: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng cung cấp tệp ảnh hợp lệ');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF');
    }

    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Ảnh đại diện tối đa 2 MB');
    }

    const folder = 'smartschedule_ai/avatars';

    const result = await new Promise<{ url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
          public_id: `avatar_${userId}_${Date.now()}`,
          overwrite: true,
        },
        (error, res: UploadApiResponse | undefined) => {
          if (error || !res) {
            return reject(new BadRequestException(error?.message || 'Tải ảnh lên Cloudinary thất bại'));
          }
          resolve({ url: res.secure_url, public_id: res.public_id });
        },
      );
      uploadStream.end(file.buffer);
    });

    // Save Cloudinary URL to database
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: result.url },
    });

    return result;
  }

  async uploadFilePath(
    filePath: string,
    categoryOrFolder: string = 'services',
  ): Promise<{ url: string; public_id: string; folder: string }> {
    const folder = this.resolveFolderPath(categoryOrFolder);
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      folder,
    };
  }

  getFolders(): Array<{ id: string; name: string; description: string; path: string }> {
    return [
      { id: 'services', name: 'Dịch vụ & Bảng giá', description: 'Hình ảnh dịch vụ nha khoa, bảng giá điều trị', path: 'smartschedule_ai/services' },
      { id: 'branches', name: 'Cơ sở & Chi nhánh', description: 'Hình ảnh các cơ sở phòng khám, phòng điều trị', path: 'smartschedule_ai/branches' },
      { id: 'doctors', name: 'Đội ngũ Bác sĩ', description: 'Ảnh chân dung, bằng cấp chứng chỉ bác sĩ', path: 'smartschedule_ai/doctors' },
      { id: 'patients', name: 'Khách hàng & Bệnh nhân', description: 'Ảnh đại diện, hồ sơ định danh khách hàng', path: 'smartschedule_ai/patients' },
      { id: 'xrays', name: 'Phim X-Quang & Bệnh án', description: 'Ảnh chụp X-Quang ConeBeam, Panorama, ảnh tình trạng trước/sau', path: 'smartschedule_ai/xrays' },
      { id: 'equipments', name: 'Trang thiết bị & Ghế khám', description: 'Ảnh máy móc y tế, ghế phẫu thuật, dụng cụ nha khoa', path: 'smartschedule_ai/equipments' },
      { id: 'payments', name: 'Hóa đơn & Thanh toán', description: 'Ảnh biên lai, chứng từ thanh toán chuyển khoản VietQR', path: 'smartschedule_ai/payments' },
      { id: 'prescriptions', name: 'Đơn thuốc & Chỉ định', description: 'Ảnh toa thuốc điện tử, phiếu chỉ định cận lâm sàng', path: 'smartschedule_ai/prescriptions' },
      { id: 'staff', name: 'Nhân sự & Phụ tá', description: 'Ảnh nhân viên y tế, điều dưỡng, lễ tân', path: 'smartschedule_ai/staff' },
      { id: 'banners', name: 'Banner & Quảng bá', description: 'Ảnh banner trang chủ, ưu đãi sự kiện phòng khám', path: 'smartschedule_ai/banners' },
    ];
  }
}
