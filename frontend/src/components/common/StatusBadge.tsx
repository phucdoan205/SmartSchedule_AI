import React from 'react';

export type BadgeStatus =
  | 'Active'
  | 'OnLeave'
  | 'OffDuty'
  | 'Busy'
  | 'Confirmed'
  | 'Completed'
  | 'Pending'
  | 'Cancelled'
  | 'InProgress'
  | 'Approved'
  | 'Rejected'
  | 'Success'
  | 'Warning'
  | 'Error'
  | 'AVAILABLE'
  | 'IN_USE'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PENDING';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const norm = (status || '').toUpperCase();

  const getBadgeStyle = () => {
    switch (norm) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'APPROVED':
      case 'SUCCESS':
      case 'AVAILABLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'INPROGRESS':
      case 'IN_PROGRESS':
      case 'CHECKED_IN':
      case 'BUSY':
        return 'bg-sky-50 text-sky-700 border-sky-200';

      case 'PENDING':
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'ONLEAVE':
      case 'OFFDUTY':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'CANCELLED':
      case 'REJECTED':
      case 'ERROR':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDotStyle = () => {
    switch (norm) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'APPROVED':
      case 'SUCCESS':
      case 'AVAILABLE':
        return 'bg-emerald-500';

      case 'INPROGRESS':
      case 'IN_PROGRESS':
      case 'CHECKED_IN':
      case 'BUSY':
        return 'bg-sky-500';

      case 'PENDING':
      case 'WARNING':
        return 'bg-amber-500';

      case 'ONLEAVE':
      case 'OFFDUTY':
        return 'bg-blue-500';

      case 'CANCELLED':
      case 'REJECTED':
      case 'ERROR':
        return 'bg-rose-500';

      default:
        return 'bg-slate-400';
    }
  };

  const formatText = () => {
    if (customLabel) return customLabel;
    switch (norm) {
      case 'ACTIVE': return 'Đang hoạt động';
      case 'AVAILABLE': return 'Đang hoạt động';
      case 'ONLEAVE': return 'Nghỉ phép';
      case 'OFFDUTY': return 'Nghỉ ca';
      case 'BUSY': return 'Đang khám';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CHECKED_IN': return 'Đã check-in';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'PENDING': return 'Chờ xác nhận';
      case 'CANCELLED': return 'Đã hủy';
      case 'INPROGRESS':
      case 'IN_PROGRESS': return 'Đang khám';
      case 'APPROVED': return 'Đã duyệt';
      case 'REJECTED': return 'Từ chối';
      case 'SUCCESS': return 'Thành công';
      case 'WARNING': return 'Cảnh báo';
      case 'ERROR': return 'Lỗi';
      default: return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle()}`} />
      {formatText()}
    </span>
  );
};
