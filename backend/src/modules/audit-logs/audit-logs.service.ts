import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(moduleName?: string, search?: string) {
    const where: any = {};
    if (moduleName) where.module = moduleName;
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { targetEntity: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async log(data: {
    userId?: string;
    module: string;
    action: string;
    details: string;
    targetEntity?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        module: data.module,
        action: data.action,
        details: data.details,
        targetEntity: data.targetEntity,
        ipAddress: data.ipAddress || '127.0.0.1',
        userAgent: data.userAgent || 'SmartSchedule-System',
      },
    });
  }
}
