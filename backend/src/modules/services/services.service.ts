import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { AuditLogsService } from '../audit-logs/audit-logs.service.js';
import {
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_SERVICES_DATA,
} from './services.data.js';

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Tự động bù đắp dữ liệu mặc định từ 4 ảnh bảng giá nếu database chưa đủ dữ liệu
   */
  private async ensureDefaultServices() {
    const count = await this.prisma.service.count();
    if (count >= 30) return;

    // 1. Tạo hoặc cập nhật các danh mục chuẩn
    const categoryMap = new Map<string, string>();
    for (const cat of DEFAULT_SERVICE_CATEGORIES) {
      const record = await this.prisma.serviceCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, description: cat.description },
        create: cat,
      });
      categoryMap.set(cat.slug, record.id);
    }

    // 2. Tạo hoặc cập nhật từng dịch vụ vào database
    for (const s of DEFAULT_SERVICES_DATA) {
      const categoryId = categoryMap.get(s.catSlug);
      if (!categoryId) continue;

      await this.prisma.service.upsert({
        where: { code: s.code },
        update: {
          name: s.name,
          categoryId,
          standardPrice: s.standardPrice,
          deposit: s.deposit,
          warranty: s.warranty,
          durationMinutes: s.durationMinutes,
          description: s.description,
          imageUrl: s.imageUrl || null,
          isAiRecommended: s.isAiRecommended,
        },
        create: {
          categoryId,
          code: s.code,
          name: s.name,
          standardPrice: s.standardPrice,
          deposit: s.deposit,
          warranty: s.warranty,
          durationMinutes: s.durationMinutes,
          description: s.description,
          imageUrl: s.imageUrl || null,
          isActive: true,
          isAiRecommended: s.isAiRecommended,
        },
      });
    }
  }

  /**
   * Lấy danh sách dịch vụ (lưu trong Database)
   */
  async findAll(query?: { categoryId?: string; search?: string; isActive?: boolean }) {
    await this.ensureDefaultServices();

    const where: any = {};

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.service.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Lấy danh sách các danh mục dịch vụ từ Database
   */
  async findCategories() {
    await this.ensureDefaultServices();

    return this.prisma.serviceCategory.findMany({
      include: {
        _count: {
          select: { services: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Thêm mới một danh mục dịch vụ vào Database
   */
  async createCategory(data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Tên danh mục không được để trống');
    }

    const cleanName = data.name.trim();
    const slug = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `cat-${Date.now()}`;

    return this.prisma.serviceCategory.upsert({
      where: { slug },
      update: { name: cleanName, description: data.description?.trim() || null },
      create: {
        slug,
        name: cleanName,
        description: data.description?.trim() || null,
      },
    });
  }

  /**
   * Xem chi tiết 1 dịch vụ theo ID từ Database
   */
  async findById(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        branchServices: {
          include: { branch: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Dịch vụ với ID ${id} không tồn tại`);
    }

    return service;
  }

  /**
   * Thêm mới 1 dịch vụ - Lưu trực tiếp vĩnh viễn vào Database
   */
  async create(
    data: {
      categoryId?: string;
      categoryName?: string;
      code: string;
      name: string;
      standardPrice: number;
      deposit?: number;
      warranty?: string;
      durationMinutes?: number;
      description?: string;
      imageUrl?: string | null;
      isAiRecommended?: boolean;
      isActive?: boolean;
    },
    operatorUserId?: string,
  ) {
    let categoryId = data.categoryId;

    // Nếu không có categoryId nhưng có categoryName hoặc categoryId là tên danh mục
    if (!categoryId && data.categoryName) {
      const cat = await this.createCategory({ name: data.categoryName });
      categoryId = cat.id;
    } else if (categoryId) {
      // Kiểm tra categoryId có tồn tại không
      const exists = await this.prisma.serviceCategory.findUnique({ where: { id: categoryId } });
      if (!exists) {
        // Có thể user truyền tên danh mục vào categoryId
        const cat = await this.createCategory({ name: categoryId });
        categoryId = cat.id;
      }
    } else {
      // Fallback danh mục đầu tiên
      const firstCat = await this.prisma.serviceCategory.findFirst();
      if (firstCat) {
        categoryId = firstCat.id;
      } else {
        const cat = await this.createCategory({ name: 'Nha khoa tổng quát' });
        categoryId = cat.id;
      }
    }

    const created = await this.prisma.service.create({
      data: {
        categoryId,
        code: data.code,
        name: data.name,
        standardPrice: data.standardPrice,
        deposit: data.deposit ?? 0,
        warranty: data.warranty,
        durationMinutes: data.durationMinutes ?? 60,
        description: data.description,
        imageUrl: data.imageUrl || null,
        isAiRecommended: data.isAiRecommended ?? false,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: {
        category: true,
      },
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'SERVICES',
      action: `Thêm mới dịch vụ khám điều trị: ${created.name} (${created.code})`,
      details: `Khởi tạo dịch vụ bảng giá ${created.code}. Đơn giá: ${Number(created.standardPrice).toLocaleString('vi-VN')} VNĐ. Thời lượng: ${created.durationMinutes} phút.`,
      targetEntity: created.code,
      status: 'SUCCESS',
    });

    return created;
  }

  /**
   * Chỉnh sửa thông tin / Bật tắt trạng thái dịch vụ - Cập nhật trực tiếp vào Database
   */
  async update(
    id: string,
    data: {
      categoryId?: string;
      code?: string;
      name?: string;
      standardPrice?: number;
      deposit?: number;
      warranty?: string;
      durationMinutes?: number;
      description?: string;
      imageUrl?: string | null;
      isActive?: boolean;
      isAiRecommended?: boolean;
    },
    operatorUserId?: string,
  ) {
    const updated = await this.prisma.service.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'SERVICES',
      action: `Cập nhật dịch vụ / bảng giá: ${updated.name} (${updated.code})`,
      details: `Điều chỉnh thông tin dịch vụ mã ${updated.code}. Giá: ${Number(updated.standardPrice).toLocaleString('vi-VN')} VNĐ. Trạng thái: ${updated.isActive ? 'Đang kích hoạt' : 'Tạm ẩn'}.`,
      targetEntity: updated.code,
      status: 'SUCCESS',
    });

    return updated;
  }

  /**
   * Xóa vĩnh viễn 1 dịch vụ khỏi Database
   */
  async delete(id: string, operatorUserId?: string) {
    const deleted = await this.prisma.service.delete({
      where: { id },
    });

    await this.auditLogsService.log({
      userId: operatorUserId || null,
      module: 'SERVICES',
      action: `Xóa dịch vụ khỏi hệ thống: ${deleted.name} (${deleted.code})`,
      details: `Đã xóa dịch vụ ${deleted.name} (${deleted.code}) khỏi cơ sở dữ liệu.`,
      targetEntity: deleted.code,
      status: 'SUCCESS',
    });

    return deleted;
  }
}

