import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    moduleName?: string;
    search?: string;
    timeFilter?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.moduleName && params.moduleName !== 'all') {
      const mod = params.moduleName.toUpperCase();
      where.module = { contains: mod, mode: 'insensitive' };
    }

    if (params.timeFilter && params.timeFilter !== 'all') {
      const now = new Date();
      if (params.timeFilter === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        where.createdAt = { gte: startOfDay };
      } else if (params.timeFilter === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.createdAt = { gte: sevenDaysAgo };
      }
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { logCode: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { details: { contains: q, mode: 'insensitive' } },
        { targetEntity: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q, mode: 'insensitive' } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              employeeCode: true,
              avatarUrl: true,
              userRoles: {
                include: { role: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async log(data: {
    userId?: string;
    module: string;
    action: string;
    details: string;
    targetEntity?: string;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const year = new Date().getFullYear();
    const count = await this.prisma.auditLog.count();
    const logCode = `LOG-${year}-${String(count + 1).padStart(4, '0')}`;

    return (this.prisma.auditLog as any).create({
      data: {
        logCode,
        userId: data.userId,
        module: data.module,
        action: data.action,
        details: data.details,
        targetEntity: data.targetEntity,
        status: data.status || 'SUCCESS',
        ipAddress: data.ipAddress || '127.0.0.1',
        userAgent: data.userAgent || 'SmartSchedule-System/2.0',
      },
    });
  }
}
