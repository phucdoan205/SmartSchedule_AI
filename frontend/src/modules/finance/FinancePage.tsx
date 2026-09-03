import React from 'react';
import { BarChart3, TrendingUp, DollarSign, ArrowDownRight, Download } from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';

export const FinancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Báo Cáo Tài Chính & Báo Cáo Doanh Thu</h2>
          <p className="text-xs text-slate-500 mt-1">Phân tích tổng hợp doanh thu dịch vụ, chi phí vận hành và lợi nhuận clinic</p>
        </div>

        <button type="button" className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5">
          <Download className="w-4 h-4" /> Xuất báo cáo tài chính
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="TỔNG DOANH THU THÁNG 9" value="1.450.000.000 VNĐ" change="+14.2%" isIncrease={true} icon={DollarSign} iconBgColor="bg-emerald-50" iconTextColor="text-emerald-600" />
        <StatCard title="CHI PHÍ VẬN HÀNH" value="680.000.000 VNĐ" change="-3.1%" isIncrease={false} icon={ArrowDownRight} iconBgColor="bg-rose-50" iconTextColor="text-rose-600" />
        <StatCard title="LỢI NHUẬN RÒNG EST." value="770.000.000 VNĐ" change="+22.5%" isIncrease={true} icon={TrendingUp} iconBgColor="bg-sky-50" iconTextColor="text-sky-600" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm text-center py-16">
        <BarChart3 className="w-12 h-12 mx-auto text-sky-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Biểu Đồ Doanh Thu Realtime Theo Chi Nhánh</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Tích hợp sẵn với API dữ liệu báo cáo kế toán phòng khám</p>
      </div>
    </div>
  );
};
