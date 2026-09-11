import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Calendar,
  Search,
  ChevronDown,
  CreditCard,
  Eye,
  AlertTriangle,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';

interface FinancialOverviewViewProps {
  onSelectBranch: (branchId: string) => void;
  onOpenExportModal: () => void;
}

export const FinancialOverviewView: React.FC<FinancialOverviewViewProps> = ({
  onSelectBranch,
  onOpenExportModal,
}) => {
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [searchBranchQuery, setSearchBranchQuery] = useState('');

  const branchesFinancialData = [
    {
      id: 'CN01',
      branchKey: 'b-bienhoa',
      name: 'Biên Hòa',
      subtitle: 'Trụ sở chính',
      treatmentCount: 342,
      target: 600000000,
      actual: 680000000,
      kpi: 113,
      debt: 120000000,
    },
    {
      id: 'CN02',
      branchKey: 'b-quan1',
      name: 'Quận 1',
      subtitle: 'Chi nhánh VIP',
      treatmentCount: 128,
      target: 500000000,
      actual: 540000000,
      kpi: 108,
      debt: 150000000,
    },
    {
      id: 'CN03',
      branchKey: 'b-longthanh',
      name: 'Long Thành',
      subtitle: 'Khai trương T3/2026',
      treatmentCount: 185,
      target: 180000000,
      actual: 200000000,
      kpi: 111,
      debt: 30000000,
    },
  ];

  const filteredBranches = branchesFinancialData.filter((b) => {
    const matchesFilter = selectedBranchFilter === 'all' || b.branchKey === selectedBranchFilter;
    const matchesSearch =
      b.name.toLowerCase().includes(searchBranchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchBranchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar (Khớp Ảnh "giao diện trang báo cáo tài chính.png") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
            Bệnh Viện Răng Hàm Mặt Việt Anh Đức | <strong className="text-slate-700">Hệ thống quản lý trung tâm</strong>
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Báo Cáo Tài Chính Hợp Nhất Hệ Thống Chi Nhánh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Tổng quan dữ liệu doanh thu, dòng tiền và công nợ trên toàn hệ thống.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 text-xs">
          {/* Dropdown Tất cả chi nhánh */}
          <div className="relative">
            <select
              value={selectedBranchFilter}
              onChange={(e) => {
                if (e.target.value !== 'all') {
                  onSelectBranch(e.target.value);
                } else {
                  setSelectedBranchFilter('all');
                }
              }}
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 font-extrabold text-slate-800 px-3.5 py-2.5 pr-8 rounded-xl shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả chi nhánh (3 cơ sở)</option>
              <option value="b-bienhoa">Chi nhánh Biên Hòa (CN01)</option>
              <option value="b-quan1">Chi nhánh Quận 1 (CN02)</option>
              <option value="b-longthanh">Chi nhánh Long Thành (CN03)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>

          {/* Month Selector Button */}
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-xs">
            <span>Tháng 08/2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* AI Phân Tích Xu Hướng Card (Khớp 100% Ảnh Mẫu) */}
      <div className="p-4 bg-emerald-950/90 text-emerald-100 rounded-3xl border border-emerald-900/40 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-emerald-800/80 text-emerald-200 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-emerald-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            AI Phân tích xu hướng
          </h4>
          <p className="text-slate-200 leading-relaxed font-medium">
            Tỷ lệ thanh toán qua <strong className="text-white">VietQR tăng đột biến (+15%)</strong> so với tháng trước, đặc biệt tại CN02 - Quận 1. Đề xuất ưu tiên các chương trình khuyến mãi trả góp qua thẻ tín dụng tại CN Quận 1 do tỷ lệ đặt cọc cao (hiện tại đạt 72% tổng ca điều trị Implant).
          </p>
        </div>
      </div>

      {/* 4 Top KPI Cards (Khớp 100% Ảnh Mẫu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Card 1: Tổng doanh thu hệ thống */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              TỔNG DOANH THU HỆ THỐNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              1.42B <span className="text-xs font-bold text-slate-500">VND</span>
            </div>
            <p className="text-[11px] text-sky-600 font-extrabold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18.5% so với tháng trước
            </p>
          </div>
        </div>

        {/* Card 2: Doanh thu thực thu (Left blue border accent) */}
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
              1.12B <span className="text-xs font-bold text-slate-500">VND</span>
            </div>
            <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 mt-1">
              🎯 Tỷ lệ thu hồi 78.8%
            </p>
          </div>
        </div>

        {/* Card 3: Công nợ tồn đọng (Left red/amber border accent) */}
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
              300M <span className="text-xs font-bold text-slate-500">VND</span>
            </div>
            <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
              ⚠️ Cần theo dõi sát 24 hồ sơ
            </p>
          </div>
        </div>

        {/* Card 4: Lợi nhuận gộp (ước tính) */}
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
              585M <span className="text-xs font-bold text-slate-500">VND</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-1">
              📊 Biên lợi nhuận 41.2%
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Chart 1 (2/3 col): So sánh doanh thu các chi nhánh */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">So sánh doanh thu các chi nhánh</h3>
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

              {/* Bar 1: CN01 - Biên Hòa (680M -> 85% of 800M) */}
              <div className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => onSelectBranch('b-bienhoa')}>
                <span className="text-[11px] font-extrabold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  680M
                </span>
                <div className="w-14 sm:w-20 bg-gradient-to-t from-sky-700 to-sky-500 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm" style={{ height: '210px' }} />
                <span className="text-[11px] font-bold text-slate-700 text-center mt-2 leading-tight">
                  CN01 - Biên Hòa
                </span>
              </div>

              {/* Bar 2: CN02 - Quận 1 (540M -> 67.5% of 800M) */}
              <div className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => onSelectBranch('b-quan1')}>
                <span className="text-[11px] font-extrabold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  540M
                </span>
                <div className="w-14 sm:w-20 bg-gradient-to-t from-teal-700 to-teal-500 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm" style={{ height: '168px' }} />
                <span className="text-[11px] font-bold text-slate-700 text-center mt-2 leading-tight">
                  CN02 - Quận 1
                </span>
              </div>

              {/* Bar 3: CN03 - Long Thành (200M -> 25% of 800M) */}
              <div className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => onSelectBranch('b-longthanh')}>
                <span className="text-[11px] font-extrabold text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  200M
                </span>
                <div className="w-14 sm:w-20 bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-xl transition-all duration-300 group-hover:brightness-110 shadow-sm" style={{ height: '64px' }} />
                <span className="text-[11px] font-bold text-slate-700 text-center mt-2 leading-tight">
                  CN03 - Long Thành
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2 (1/3 col): Cơ cấu phương thức TT */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu phương thức TT</h3>

          {/* Donut Graphic */}
          <div className="flex items-center justify-center py-2 relative">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="15" />
              {/* Segment 1: Chuyển khoản / VietQR (62%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0f766e"
                strokeWidth="15"
                strokeDasharray="238.7"
                strokeDashoffset="0"
                className="transition-all duration-1000"
              />
              {/* Segment 2: Quẹt thẻ POS (28%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0284c7"
                strokeWidth="15"
                strokeDasharray="66.8 238.7"
                strokeDashoffset="-148"
                className="transition-all duration-1000"
              />
              {/* Segment 3: Tiền mặt (10%) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="15"
                strokeDasharray="23.8 238.7"
                strokeDashoffset="-214.8"
                className="transition-all duration-1000"
              />
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-xl font-black text-slate-900 leading-none">1.12B</span>
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
              <span className="font-extrabold text-slate-900">62%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-sky-600 shrink-0" />
                <span>Quẹt thẻ POS</span>
              </div>
              <span className="font-extrabold text-slate-900">28%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-300 shrink-0" />
                <span>Tiền mặt</span>
              </div>
              <span className="font-extrabold text-slate-900">10%</span>
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
              {filteredBranches.map((item) => (
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
                      onClick={() => onSelectBranch(item.branchKey)}
                      className="text-sky-600 hover:text-sky-700 font-extrabold text-xs hover:underline"
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
          <span>Hiển thị {filteredBranches.length} / 3 chi nhánh</span>
          <div className="flex items-center gap-1 font-bold">
            <button type="button" className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
              &lt;
            </button>
            <span className="px-3 py-1 rounded-lg bg-slate-900 text-white font-extrabold text-xs">
              1
            </span>
            <button type="button" className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
