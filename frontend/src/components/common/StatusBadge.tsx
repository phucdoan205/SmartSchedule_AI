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
  | 'Error';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  customLabel?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel }) => {
  const getBadgeStyle = (st: string) => {
    switch (st) {
      case 'Active':
      case 'Confirmed':
      case 'Completed':
      case 'Approved':
      case 'Success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';

      case 'InProgress':
      case 'Pending':
      case 'Busy':
        return 'bg-amber-50 text-amber-700 border-amber-200';

      case 'OnLeave':
      case 'Warning':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'OffDuty':
      case 'Cancelled':
      case 'Rejected':
      case 'Error':
        return 'bg-rose-50 text-rose-700 border-rose-200';

      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getDotStyle = (st: string) => {
    switch (st) {
      case 'Active':
      case 'Confirmed':
      case 'Completed':
      case 'Approved':
      case 'Success':
        return 'bg-emerald-500';

      case 'InProgress':
      case 'Pending':
      case 'Busy':
        return 'bg-amber-500';

      case 'OnLeave':
      case 'Warning':
        return 'bg-blue-500';

      case 'OffDuty':
      case 'Cancelled':
      case 'Rejected':
      case 'Error':
        return 'bg-rose-500';

      default:
        return 'bg-slate-400';
    }
  };

  const formatText = (st: string) => {
    if (customLabel) return customLabel;
    switch (st) {
      case 'Active': return 'Đang hoạt động';
      case 'OnLeave': return 'Nghỉ phép';
      case 'OffDuty': return 'Nghỉ ca';
      case 'Busy': return 'Đang khám';
      case 'Confirmed': return 'Đã xác nhận';
      case 'Completed': return 'Hoàn thành';
      case 'Pending': return 'Chờ phê duyệt';
      case 'Cancelled': return 'Đã hủy';
      case 'InProgress': return 'Đang tiến hành';
      case 'Approved': return 'Đã duyệt';
      case 'Rejected': return 'Từ chối';
      case 'Success': return 'Thành công';
      case 'Warning': return 'Cảnh báo';
      case 'Error': return 'Lỗi';
      default: return st;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyle(status)}`} />
      {formatText(status)}
    </span>
  );
};
