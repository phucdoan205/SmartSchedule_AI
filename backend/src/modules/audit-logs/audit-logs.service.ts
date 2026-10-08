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

    const rawLogs = await this.prisma.auditLog.findMany({
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
    });

    // Gom nhóm các hành động trong cùng Ngày + Mô-đun + Người thực hiện thành 1 Log Tổng (Master Log)
    const groupsMap = new Map<string, any>();
    const groups: any[] = [];

    for (const item of rawLogs) {
      const dateKey = item.createdAt.toISOString().slice(0, 10);
      const modKey = (item.module || '').toUpperCase();
      const userKey = item.userId || 'system';
      const groupKey = `${dateKey}_${modKey}_${userKey}`;

      const timeOnly = item.createdAt.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const childAction = {
        id: item.id,
        logCode: item.logCode || item.id,
        action: item.action,
        time: timeOnly,
        status: item.status || 'SUCCESS',
        targetEntity: item.targetEntity,
        details: item.details,
        createdAt: item.createdAt,
      };

      if (groupsMap.has(groupKey)) {
        const existingGroup = groupsMap.get(groupKey);
        // Chống hiển thị trùng lặp: Nếu có hành động giống hệt về nội dung và đối tượng diễn ra trong vòng 5 giây
        const isDuplicate = existingGroup.actions.some((prevAct: any) => {
          if (prevAct.action === childAction.action && prevAct.targetEntity === childAction.targetEntity) {
            const timeDiff = Math.abs(
              new Date(item.createdAt).getTime() - new Date(prevAct.createdAt).getTime(),
            );
            return timeDiff <= 5000;
          }
          return false;
        });

        if (!isDuplicate) {
          existingGroup.actions.push(childAction);
          existingGroup.actionsCount = existingGroup.actions.length;
        }
      } else {
        const newGroup = {
          id: item.id,
          logCode: item.logCode || item.id,
          createdAt: item.createdAt,
          date: dateKey,
          module: item.module,
          user: item.user,
          actionsCount: 1,
          actions: [childAction],
        };
        groupsMap.set(groupKey, newGroup);
        groups.push(newGroup);
      }
    }

    const totalGroups = groups.length;
    const pagedGroups = groups.slice(skip, skip + limit);

    return {
      success: true,
      data: pagedGroups,
      pagination: {
        total: totalGroups,
        totalActions: rawLogs.length,
        page,
        limit,
        totalPages: Math.ceil(totalGroups / limit) || 1,
      },
    };
  }

  /**
   * Quy tắc logic sinh mã log hệ thống: LOG-{YYYY}-{XXXX}
   * - YYYY: Năm hiện tại (ví dụ 2026)
   * - XXXX: Số thứ tự tăng dần 4 chữ số (ví dụ 0018, 0019)
   * Lấy số thứ tự lớn nhất đã có trong cơ sở dữ liệu thay vì count để tránh trùng lặp khi có xóa/thêm song song.
   */
  async generateLogCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `LOG-${year}-`;

    const latestLogs = await this.prisma.auditLog.findMany({
      where: {
        logCode: { startsWith: prefix },
      },
      select: { logCode: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    let maxSeq = 0;
    for (const log of latestLogs) {
      if (log.logCode) {
        const parts = log.logCode.split('-');
        const seqPart = parts[parts.length - 1];
        const num = parseInt(seqPart, 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }

    if (maxSeq === 0) {
      const count = await this.prisma.auditLog.count({
        where: { logCode: { startsWith: prefix } },
      });
      maxSeq = count;
    }

    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }

  async log(data: {
    userId?: string | null;
    module: string;
    action: string;
    details: string;
    targetEntity?: string;
    status?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // Chống ghi trùng log: Kiểm tra xem cùng module, cùng hành động, cùng đối tượng có vừa được ghi trong 4 giây qua không
    try {
      const recentDuplicate = await this.prisma.auditLog.findFirst({
        where: {
          module: (data.module || 'SYSTEM').toUpperCase(),
          action: data.action,
          targetEntity: data.targetEntity || null,
          createdAt: { gte: new Date(Date.now() - 4000) },
        },
      });
      if (recentDuplicate) {
        return recentDuplicate;
      }
    } catch (checkErr) {
      // Tiếp tục ghi log nếu câu truy vấn kiểm tra gặp sự cố
    }

    let attempts = 0;
    while (attempts < 5) {
      try {
        const logCode = await this.generateLogCode();
        return await (this.prisma.auditLog as any).create({
          data: {
            logCode,
            userId: data.userId || null,
            module: (data.module || 'SYSTEM').toUpperCase(),
            action: data.action,
            details: data.details,
            targetEntity: data.targetEntity || null,
            status: data.status || 'SUCCESS',
            ipAddress: data.ipAddress || '127.0.0.1',
            userAgent: data.userAgent || 'SmartSchedule-System/2.0',
          },
        });
      } catch (err: any) {
        attempts++;
        if (attempts >= 5) {
          console.error('Không thể tạo mã log audit sau 5 lần thử:', err);
          throw err;
        }
      }
    }
  }
}
