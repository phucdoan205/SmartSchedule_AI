import React from 'react';
import { ScrollText, ShieldCheck } from 'lucide-react';
import { MOCK_AUDIT_LOGS } from '../../services/mockData';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { SystemAuditLog } from '../../types/admin';

export const AuditLogsPage: React.FC = () => {
  const columns: Column<SystemAuditLog>[] = [
    { header: 'THỜI GIAN', accessorKey: 'timestamp' },
    { header: 'NGƯỜI DÙNG / TÀI KHOẢN', accessorKey: 'user' },
    { header: 'HÀNH ĐỘNG THỰC HIỆN', accessorKey: 'action' },
    { header: 'MÔ-ĐƯN', accessorKey: 'module' },
    { header: 'ĐỊA CHỈ IP', accessorKey: 'ipAddress' },
    { header: 'TRẠNG THÁI', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Nhật Ký Truy Cập & Thao Tác Hệ Thống</h2>
        <p className="text-xs text-slate-500 mt-1">Ghi lại toàn bộ thao tác bảo mật của người dùng và tiến trình AI</p>
      </div>

      <DataTable data={MOCK_AUDIT_LOGS} columns={columns} searchPlaceholder="Tìm theo IP, người dùng..." />
    </div>
  );
};
