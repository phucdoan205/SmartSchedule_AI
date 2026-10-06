import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  content: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ROLE_CHANGE' | 'STAFF' | 'APPOINTMENT' | 'SCHEDULE' | 'EQUIPMENT' | 'FINANCE' | 'SYSTEM';
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, page: number = 1, limit: number = 5) {
    const validPage = Math.max(1, Number(page) || 1);
    const validLimit = Math.max(1, Number(limit) || 5);
    const skip = (validPage - 1) * validLimit;

    const [total, unreadCount, items] = await Promise.all([
      (this.prisma as any).notification.count({
        where: { userId },
      }),
      (this.prisma as any).notification.count({
        where: { userId, isRead: false },
      }),
      (this.prisma as any).notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit,
      }),
    ]);

    const hasMore = total > skip + items.length;

    return {
      success: true,
      data: items,
      unreadCount,
      pagination: {
        total,
        unreadCount,
        page: validPage,
        limit: validLimit,
        hasMore,
        totalPages: Math.ceil(total / validLimit) || 1,
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    await (this.prisma as any).notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    return {
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc',
    };
  }

  async markAllAsRead(userId: string) {
    await (this.prisma as any).notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return {
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    };
  }

  async create(data: CreateNotificationDto) {
    return (this.prisma as any).notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type || 'INFO',
        link: data.link || null,
        isRead: false,
      },
    });
  }

  async notifyUsers(userIds: string[], data: Omit<CreateNotificationDto, 'userId'>) {
    if (!userIds || userIds.length === 0) return;
    const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));

    const promises = uniqueIds.map((uid) =>
      this.create({
        userId: uid,
        title: data.title,
        content: data.content,
        type: data.type,
        link: data.link,
      }),
    );

    return Promise.all(promises);
  }
}
