import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  ShieldCheck,
  Wrench,
  Calendar,
  Receipt,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { notificationsApi } from '../../services/api';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch ban đầu 5 thông báo mới nhất
  const fetchInitialNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await notificationsApi.getNotifications({ page: 1, limit: 5 });
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
        setHasMore(Boolean(res.pagination?.hasMore));
        setPage(1);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông báo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialNotifications();

    // Polling nhẹ mỗi 45 giây để cập nhật thông báo mới
    const interval = setInterval(fetchInitialNotifications, 45000);
    return () => clearInterval(interval);
  }, [fetchInitialNotifications]);

  // Load thêm 5 thông báo nữa khi click "Xem thêm"
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await notificationsApi.getNotifications({ page: nextPage, limit: 5 });
      if (res?.success && res.data) {
        setNotifications((prev) => [...prev, ...res.data]);
        setHasMore(Boolean(res.pagination?.hasMore));
        setPage(nextPage);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thêm thông báo:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Đánh dấu đã đọc 1 tin
  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationsApi.markAsRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn('Lỗi đánh dấu đã đọc:', err);
      }
    }

    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  // Icon theo type
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'ROLE_CHANGE':
        return (
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'EQUIPMENT':
        return (
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
        );
      case 'APPOINTMENT':
        return (
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'FINANCE':
        return (
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
        );
      case 'STAFF':
        return (
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
        );
      case 'SUCCESS':
        return (
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        );
      case 'WARNING':
        return (
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Vừa xong';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return new Date(isoString).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icon Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo hệ thống"
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 min-w-4.5 h-4.5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100">
                Thông Báo Hệ Thống
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                title="Đánh dấu đã đọc tất cả"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc hết</span>
              </button>
            )}
          </div>

          {/* List content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                <span>Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1.5 px-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                <p className="font-bold text-slate-600">Bạn đã cập nhật tất cả thông tin!</p>
                <p className="text-[11px]">Không có thông báo mới nào cần xử lý lúc này.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                    item.isRead ? 'bg-white hover:bg-slate-50/80' : 'bg-sky-50/50 hover:bg-sky-50'
                  }`}
                >
                  {renderTypeIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4
                        className={`text-xs truncate ${
                          item.isRead ? 'font-semibold text-slate-700' : 'font-extrabold text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer - Load more button */}
          {hasMore && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                    <span>Đang tải thêm...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xem thêm thông báo cũ hơn &darr;</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
