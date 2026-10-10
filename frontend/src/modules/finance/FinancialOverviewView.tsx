import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Calendar,
  Search,
  CreditCard,
  Eye,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import { financeApi } from '../../services/api';

interface FinancialOverviewViewProps {
  onSelectBranch: (branchId: string) => void;
  onOpenExportModal: () => void;
}

export const FinancialOverviewView: React.FC<FinancialOverviewViewProps> = ({
  onSelectBranch,
  onOpenExportModal,
}) => {
  const { selectedBranchId, selectedBranch } = useBranch();
  const { user } = useAuth();
  const userRoleCode = rolePermissionStore.getUserRoleCode(user);
  const canExportFinance = rolePermissionStore.canExportFinance(userRoleCode, user);

  const [searchBranchQuery, setSearchBranchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState<any>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getOverview(selectedBranchId);
      if (res?.data) {
        setOverviewData(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu báo cáo tài chính:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedBranchId]);

  const branchesList = overviewData?.branches || [];
  const filteredBranches = branchesList.filter((b: any) => {
    const q = searchBranchQuery.toLowerCase();
    return b.name?.toLowerCase().includes(q) || b.id?.toLowerCase().includes(q) || b.fullName?.toLowerCase().includes(q);
  });

  const formatVND = (num: number) => {
    if (!num) return '0 VND';
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B VND';
    }
    if (num >= 1000000) {
      return Math.round(num / 1000000) + 'M VND';
    }
    return num.toLocaleString('vi-VN') + ' VND';
  };

  const totalRev = overviewData?.totalRevenue || 1420000000;
  const actualRev = overviewData?.actualRevenue || 1120000000;
  const debt = overviewData?.debtAmount || 300000000;
  const profit = overviewData?.profitEstimated || 585000000;
  const recoveryRate = overviewData?.recoveryRate || 78.8;
  const paymentMethods = overviewData?.paymentMethods || {
    vietqrPercent: 59,
    posPercent: 33,
    cashPercent: 8,
    vietqr: 670000000,
    pos: 370000000,
    cash: 91000000,
  };

  const isAllBranches = !selectedBranchId || selectedBranchId === 'ALL';
  const pageTitle = isAllBranches
    ? 'Báo Cáo Tài Chính Hợp Nhất Hệ Thống Chi Nhánh'
    : `Báo Cáo Tài Chính - ${selectedBranch?.name || 'Chi Nhánh'}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
            Bệnh Viện Răng Hàm Mặt Việt Anh Đức |{' '}
            <strong className="text-slate-700">
              {isAllBranches ? 'Hệ thống quản lý trung tâm' : selectedBranch?.name}
            </strong>
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {pageTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {isAllBranches
              ? 'Tổng quan dữ liệu doanh thu, dòng tiền và công nợ trên toàn hệ thống chi nhánh.'
              : `Dữ liệu tài chính, thực thu và đối soát thanh toán trực tiếp tại ${selectedBranch?.name}.`}
          </p>
        </div>

        {/* Right Controls (Bộ lọc chi nhánh đã gom về Header duy nhất) */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 text-xs">
          {/* Month Selector Display */}
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-xs">
            <span>Tháng 08/2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Export Button */}
          {canExportFinance && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Xuất báo cáo
            </button>
          )}
        </div>
      </div>

      {/* AI Phân Tích Xu Hướng Card */}
      <div className="p-4 bg-emerald-950/90 text-emerald-100 rounded-3xl border border-emerald-900/40 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 text-emerald-200 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            AI Phân tích xu hướng
          </h4>
          <p className="text-slate-200 leading-relaxed font-medium">
            {overviewData?.aiAnalysis || (
              <>
                Tỷ lệ thanh toán qua <strong className="text-white">VietQR tăng đột biến (+15%)</strong> so với tháng trước, đặc biệt tại CN02 - Quận 1. Đề xuất ưu tiên các chương trình khuyến mãi trả góp qua thẻ tín dụng tại CN Quận 1 do tỷ lệ đặt cọc cao (hiện tại đạt 72% tổng ca điều trị Implant).
              </>
            )}
          </p>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Card 1: Tổng doanh thu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              {isAllBranches ? 'TỔNG DOANH THU HỆ THỐNG' : 'TỔNG DOANH THU CHI NHÁNH'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              ) : (
                <>
                  {(totalRev / 1000000000).toFixed(2)}B{' '}
                  <span className="text-xs font-bold text-slate-500">VND</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-sky-600 font-extrabold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.5% so với tháng trước
            </p>
          </div>
        </div>

        {/* Card 2: Doanh thu thực thu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-600" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              DOANH THU THỰC THU
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
              ) : (
                <>
                  {(actualRev / 1000000000).toFixed(2)}B{' '}
                  <span className="text-xs font-bold text-slate-500">VND</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 mt-1">
              🎯 Tỷ lệ thu hồi {recoveryRate}%
            </p>
          </div>
        </div>

        {/* Card 3: Công nợ tồn đọng */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              CÔNG NỢ TỒN ĐỌNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
              ) : (
                <>
                  {Math.round(debt / 1000000)}M{' '}
                  <span className="text-xs font-bold text-slate-500">VND</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
              ⚠️ Cần theo dõi sát 24 hồ sơ
            </p>
          </div>
        </div>

        {/* Card 4: Lợi nhuận gộp */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              LỢI NHUẬN GỘP (ƯỚC TÍNH)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              ) : (
                <>
                  {Math.round(profit / 1000000)}M{' '}
                  <span className="text-xs font-bold text-slate-500">VND</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-1">
              📊 Biên lợi nhuận {overviewData?.profitMargin || '41.2%'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Chart 1: So sánh doanh thu các chi nhánh */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                So sánh doanh thu các chi nhánh
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Đơn vị: Triệu VND (Tháng 08/2026)</p>
            </div>
            <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-4 pb-2">
            <div className="relative h-64 flex items-end justify-between px-6 sm:px-12 border-b border-slate-200">
              {/* Y Axis Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
                <div className="border-b border-dashed border-slate-100 w-full flex justify-between pr-2">
                  <span>800M</span>
                </div>
                <div className="border-b border-dashed border-slate-100 w-full flex justify-between pr-2">
                  <span>600M</span>
                </div>
                <div className="border-b border-dashed border-slate-100 w-full flex justify-between pr-2">
                  <span>400M</span>
                </div>
                <div className="border-b border-dashed border-slate-100 w-full flex justify-between pr-2">
                  <span>200M</span>
                </div>
                <div className="w-full flex justify-between pr-2">
                  <span>0</span>
                </div>
              </div>

              {/* Bars dynamically generated from branches */}
              {branchesList.map((b: any, idx: number) => {
                const heightPercent = Math.min(100, Math.round(((b.actual || 0) / 800000000) * 100));
                const colors = [
                  'from-sky-700 to-sky-500',
                  'from-teal-700 to-teal-500',
                  'from-indigo-700 to-indigo-500',
                ];
                const grad = colors[idx % colors.length];

                return (
                  <div
                    key={b.id || idx}
                    className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer"
                    onClick={() => onSelectBranch(b.branchId || b.branchKey || b.id)}
                  >
                    <span className="text-[11px] font-extrabold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round((b.actual || 0) / 1000000)}M
                    </span>
                    <div
                      className={`w-14 sm:w-20 bg-gradient-to-t ${grad} rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm`}
                      style={{ height: `${Math.max(20, (heightPercent / 100) * 220)}px` }}
                    />
                    <span className="text-[11px] font-bold text-slate-700 text-center mt-2 leading-tight">
                      {b.id} - {b.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chart 2: Cơ cấu phương thức TT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu phương thức TT</h3>

          {/* Donut Graphic */}
          <div className="flex items-center justify-center py-2 relative">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="15" />
              {/* VietQR */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0f766e"
                strokeWidth="15"
                strokeDasharray={`${(paymentMethods.vietqrPercent / 100) * 238.7} 238.7`}
                strokeDashoffset="0"
                className="transition-all duration-1000"
              />
              {/* POS */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0284c7"
                strokeWidth="15"
                strokeDasharray={`${(paymentMethods.posPercent / 100) * 238.7} 238.7`}
                strokeDashoffset={`-${(paymentMethods.vietqrPercent / 100) * 238.7}`}
                className="transition-all duration-1000"
              />
              {/* Cash */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="15"
                strokeDasharray={`${(paymentMethods.cashPercent / 100) * 238.7} 238.7`}
                strokeDashoffset={`-${((paymentMethods.vietqrPercent + paymentMethods.posPercent) / 100) * 238.7}`}
                className="transition-all duration-1000"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-black text-slate-900 leading-none">
                {(actualRev / 1000000000).toFixed(2)}B
              </span>
              <span className="text-[10px] font-bold text-slate-500 mt-1">Thực thu</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 font-semibold text-slate-700">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-teal-700 shrink-0" />
                <span>Chuyển khoản / VietQR</span>
              </div>
              <span className="font-extrabold text-slate-900">
                {paymentMethods.vietqrPercent}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-sky-600 shrink-0" />
                <span>Quẹt thẻ POS</span>
              </div>
              <span className="font-extrabold text-slate-900">
                {paymentMethods.posPercent}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-300 shrink-0" />
                <span>Tiền mặt</span>
              </div>
              <span className="font-extrabold text-slate-900">
                {paymentMethods.cashPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Bảng kê chi tiết dòng tiền từng chi nhánh */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Bảng kê chi tiết dòng tiền từng chi nhánh
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchBranchQuery}
              onChange={(e) => setSearchBranchQuery(e.target.value)}
              placeholder="Lọc chi nhánh..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 w-full sm:w-56"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">TÊN CƠ SỞ</th>
                <th className="py-3 px-3">SỐ CA ĐT</th>
                <th className="py-3 px-3">MỤC TIÊU (VNĐ)</th>
                <th className="py-3 px-3">THỰC ĐẠT (VNĐ)</th>
                <th className="py-3 px-3">% KPI</th>
                <th className="py-3 px-3">CÔNG NỢ (VNĐ)</th>
                <th className="py-3 px-3 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filteredBranches.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-3 font-mono font-bold text-slate-500">{item.id}</td>
                  <td className="py-4 px-3">
                    <span className="font-extrabold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.subtitle}</span>
                  </td>
                  <td className="py-4 px-3 text-slate-600 font-bold">{item.treatmentCount}</td>
                  <td className="py-4 px-3 text-slate-600 font-mono">
                    {item.target.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-4 px-3 font-black text-slate-900 font-mono">
                    {item.actual.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold rounded-lg text-[11px] border border-emerald-200">
                      {item.kpi}%
                    </span>
                  </td>
                  <td className="py-4 px-3 font-mono text-rose-600 font-bold">
                    {item.debt.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectBranch(item.branchId || item.branchKey)}
                      className="text-sky-600 hover:text-sky-700 font-extrabold text-xs hover:underline cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 font-semibold">
          <span>Hiển thị {filteredBranches.length} / {branchesList.length} chi nhánh</span>
          <div className="flex items-center gap-1 font-bold">
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs">
              1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
