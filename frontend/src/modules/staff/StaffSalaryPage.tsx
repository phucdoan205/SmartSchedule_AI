import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Download, CreditCard, TrendingUp } from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';
import { DataTable, type Column } from '../../components/common/DataTable';
import type { DoctorStaff } from '../../types/admin';

export const StaffSalaryPage: React.FC = () => {
  const navigate = useNavigate();

  const totalPayroll = MOCK_DOCTORS.reduce(
    (acc, d) => acc + d.salaryBase + d.allowance + d.commission,
    0
  );

  const salaryColumns: Column<DoctorStaff>[] = [
    {
      header: 'BÁC SĨ / NHÂN SỰ',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.avatar} alt={row.name} className="w-9 h-9 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-slate-800">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.role} • {row.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'LƯƠNG CƠ BẢN',
      cell: (row) => `${row.salaryBase.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      header: 'PHỤ CẤP',
      cell: (row) => `${row.allowance.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      header: 'HOA HỒNG CA KHÁM',
      cell: (row) => (
        <span className="font-bold text-emerald-600">
          +{row.commission.toLocaleString('vi-VN')} VNĐ
        </span>
      ),
    },
    {
      header: 'TỔNG THỰC LĨNH',
      cell: (row) => (
        <span className="font-bold text-slate-900 text-sm">
          {(row.salaryBase + row.allowance + row.commission).toLocaleString('vi-VN')} VNĐ
        </span>
      ),
    },
    {
      header: 'TRẠNG THÁI',
      cell: () => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Đã chốt sổ
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/staff')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Quản lý Bác sĩ & Nhân sự
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Bảng Quản Lý Lương Thưởng & Phụ Cấp</h2>
          <p className="text-xs text-slate-500 mt-1">Kỳ chốt lương Tháng 09/2026 tự động tính toán từ lượt khám AI</p>
        </div>

        <button
          type="button"
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          Xuất Bảng Lương Excel
        </button>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">TỔNG NGÂN SÁCH LƯƠNG T9/2026</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalPayroll.toLocaleString('vi-VN')} VNĐ</h3>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +5.2% so với tháng trước
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">TỔNG HOA HỒNG CA KHÁM</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            {MOCK_DOCTORS.reduce((a, b) => a + b.commission, 0).toLocaleString('vi-VN')} VNĐ
          </h3>
          <span className="text-[11px] text-slate-400 mt-2 block">Dựa trên 3.490 lượt khám hoàn tất</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400">HÌNH THỨC CHI TRẢ</p>
          <h3 className="text-sm font-bold text-slate-800 mt-2 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sky-600" /> Chuyển khoản ngân hàng tự động
          </h3>
          <span className="text-[11px] text-sky-600 font-semibold mt-2 block">Dự kiến chi trả: 05/10/2026</span>
        </div>
      </div>

      <DataTable data={MOCK_DOCTORS} columns={salaryColumns} title="Chi Tiết Lương Thưởng Nhân Sự" />
    </div>
  );
};
