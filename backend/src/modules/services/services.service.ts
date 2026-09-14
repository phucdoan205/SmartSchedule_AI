import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { categoryId?: string; search?: string; isActive?: boolean }) {
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

  async findCategories() {
    return this.prisma.serviceCategory.findMany({
      include: {
        _count: {
          select: { services: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

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

  async create(data: {
    categoryId: string;
    code: string;
    name: string;
    standardPrice: number;
    deposit?: number;
    warranty?: string;
    durationMinutes?: number;
    description?: string;
    imageUrl?: string;
    isAiRecommended?: boolean;
  }) {
    return this.prisma.service.create({
      data: {
        categoryId: data.categoryId,
        code: data.code,
        name: data.name,
        standardPrice: data.standardPrice,
        deposit: data.deposit ?? 0,
        warranty: data.warranty,
        durationMinutes: data.durationMinutes ?? 60,
        description: data.description,
        imageUrl: data.imageUrl,
        isAiRecommended: data.isAiRecommended ?? false,
      },
      include: {
        category: true,
      },
    });
  }

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
      imageUrl?: string;
      isActive?: boolean;
      isAiRecommended?: boolean;
    },
  ) {
    return this.prisma.service.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
