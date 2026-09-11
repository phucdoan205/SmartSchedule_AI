import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Download,
  Search,
  Filter,
  ArrowRightLeft,
  TrendingUp,
} from 'lucide-react';

interface BranchFinanceDetailViewProps {
  branchId: string;
  onBack: () => void;
  onOpenExportModal: () => void;
  onOpenVietQrModal: () => void;
}

export const BranchFinanceDetailView: React.FC<BranchFinanceDetailViewProps> = ({
  branchId,
  onBack,
  onOpenExportModal,
  onOpenVietQrModal,
}) => {
  const [txSearchQuery, setTxSearchQuery] = useState('');

  // Branch mapping info
  const branchInfoMap: Record<
    string,
    {
      code: string;
      name: string;
      type: string;
      address: string;
      director: string;
      revenue: number;
      target: number;
      kpi: string;
      cashless: number;
      debt: number;
      debtNote: string;
      cost: number;
      netProfit: number;
    }
  > = {
    'b-bienhoa': {
      code: 'CN01',
      name: 'Chi nhánh Biên Hòa',
      type: 'Trụ sở chính',
      address: '123 Đường ABC, Tam Hiệp, Biên Hòa',
      director: 'BS.CKI Nguyễn Văn Tuấn',
      revenue: 680000000,
      target: 600000000,
      kpi: '113.3%',
      cashless: 560000000,
      debt: 120000000,
      debtNote: 'Gồm 18 hồ sơ đang gắn mão răng sứ/chỉnh nha',
      cost: 195000000,
      netProfit: 485000000,
    },
    'b-quan1': {
      code: 'CN02',
      name: 'Chi nhánh Quận 1 (TP. HCM)',
      type: 'Chi nhánh VIP',
      address: '45 Đường Lê Duẩn, Phường Bến Nghé, Quận 1, TP. HCM',
      director: 'BS. Nguyễn Thị An',
      revenue: 540000000,
      target: 500000000,
      kpi: '108.0%',
      cashless: 470000000,
      debt: 150000000,
      debtNote: 'Gồm 22 hồ sơ chỉnh nha & bọc răng sứ thẩm mỹ',
      cost: 160000000,
      netProfit: 380000000,
    },
    'b-longthanh': {
      code: 'CN03',
      name: 'Chi nhánh Long Thành (Đồng Nai)',
      type: 'Khai trương T3/2026',
      address: 'Khu Đô thị Mới, Huyện Long Thành, Đồng Nai',
      director: 'BS. Trần Đức Cường',
      revenue: 200000000,
      target: 180000000,
      kpi: '111.1%',
      cashless: 165000000,
      debt: 30000000,
      debtNote: 'Gồm 6 ca thăm khám cấy ghép Implant dự kiến',
      cost: 65000000,
      netProfit: 135000000,
    },
  };

  const branch = branchInfoMap[branchId] || branchInfoMap['b-bienhoa'];

  // Transactions list
  const transactions = [
    {
      id: '#HD-8956',
      time: '16:15 - 22/08/2026',
      patientName: 'Nguyễn Văn An',
      patientCode: '#BN-104',
      service: 'Thanh toán Đợt 2 - Niềng răng/Implant',
      doctor: 'BS. Trần Đức Cường',
      amount: 13000000,
      paymentMethod: 'VietQR Động',
      status: 'Đã quyết toán',
    },
    {
      id: '#HD-8955',
      time: '14:30 - 22/08/2026',
      patientName: 'Trần Thị Mai',
      patientCode: '#BN-092',
      service: 'Cọc bọc răng sứ Cercon HT',
      doctor: 'BS. Nguyễn Thị An',
      amount: 5000000,
      paymentMethod: 'Quẹt thẻ POS',
      status: 'Đã quyết toán',
    },
    {
      id: '#HD-8954',
      time: '11:00 - 22/08/2026',
      patientName: 'Lê Văn Hoàng',
      patientCode: '#BN-115',
      service: 'Trồng răng Implant Straumann Đợt 1',
      doctor: 'BS.CKI Nguyễn Văn Tuấn',
      amount: 25000000,
      paymentMethod: 'VietQR Động',
      status: 'Đã quyết toán',
    },
    {
      id: '#HD-8953',
      time: '09:45 - 22/08/2026',
      patientName: 'Hoàng Thị Lan',
      patientCode: '#BN-088',
      service: 'Tẩy trắng răng Laser & Cạo vôi',
      doctor: 'BS. Nguyễn Thị An',
      amount: 2500000,
      paymentMethod: 'Tiền mặt',
      status: 'Đã quyết toán',
    },
    {
      id: '#HD-8952',
      time: '08:30 - 22/08/2026',
      patientName: 'Phạm Đức Minh',
      patientCode: '#BN-120',
      service: 'Trám răng Composite & Điều trị tủy',
      doctor: 'BS. Trần Đức Cường',
      amount: 1800000,
      paymentMethod: 'VietQR Động',
      status: 'Đã quyết toán',
    },
  ];

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.patientName.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(txSearchQuery.toLowerCase()) ||
      tx.service.toLowerCase().includes(txSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Báo cáo tài chính
        </button>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">
          Chi tiết: {branch.name} ({branch.code} - {branch.type})
        </span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Báo Cáo Doanh Thu &amp; Dòng Tiền: {branch.name}
            </h1>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl border border-emerald-200">
              Đang hoạt động - Đạt {branch.kpi} KPI
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            {branch.address} | Giám đốc cơ sở: <strong className="text-slate-700">{branch.director}</strong>
          </p>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0 text-xs">
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 shadow-xs">
            <span>Tháng 08/2026</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={onOpenVietQrModal}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" /> Đối soát VietQR hôm nay
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Xuất file Excel kế toán
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards (Khớp 100% Ảnh Mẫu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Card 1: Tổng thực thu trong tháng */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            TỔNG THỰC THU TRONG THÁNG
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {branch.revenue.toLocaleString('vi-VN')}đ
            </div>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> Mục tiêu: {branch.target.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>

        {/* Card 2: Đã quyết toán qua VietQR/POS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-sky-500" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            ĐÃ QUYẾT TOÁN QUA VIETQR/POS
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {branch.cashless.toLocaleString('vi-VN')}đ
            </div>
            <p className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-1">
              💳 82.4% dòng tiền không tiền mặt
            </p>
          </div>
        </div>

        {/* Card 3: Công nợ giai đoạn 2 chưa thu */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            CÔNG NỢ GIAI ĐOẠN 2 CHƯA THU
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {branch.debt.toLocaleString('vi-VN')}đ
            </div>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              📋 {branch.debtNote}
            </p>
          </div>
        </div>

        {/* Card 4: Chi phí Labo & Vật tư tiêu hao */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            CHI PHÍ LABO &amp; VẬT TƯ TIÊU HAO
          </span>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {branch.cost.toLocaleString('vi-VN')}đ
            </div>
            <p className="text-[11px] text-slate-800 font-bold mt-1">
              💰 Lợi nhuận ròng cơ sở: {branch.netProfit.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Doanh thu theo tuần & Tỷ trọng doanh thu Bác sĩ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Stacked Bar Chart: Doanh thu theo tuần (2/3 col) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm">Doanh thu theo tuần</h3>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-sky-500 shrink-0" />
                <span>Dịch vụ Implant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-900 shrink-0" />
                <span>Răng sứ thẩm mỹ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-300 shrink-0" />
                <span>Khám tổng quát</span>
              </div>
            </div>
          </div>

          {/* Stacked Bars Graphic */}
          <div className="pt-6 pb-2">
            <div className="h-64 flex items-end justify-around px-4 sm:px-8 border-b border-slate-200">
              {/* Tuần 1: 145M */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[11px] font-black text-slate-800">145M</span>
                <div className="w-12 sm:w-16 flex flex-col rounded-t-xl overflow-hidden shadow-xs">
                  <div className="bg-sky-500 h-16 transition-all group-hover:brightness-110" title="Implant: 65M" />
                  <div className="bg-slate-900 h-16 transition-all group-hover:brightness-110" title="Răng sứ: 55M" />
                  <div className="bg-slate-300 h-10 transition-all group-hover:brightness-110" title="Tổng quát: 25M" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-2">Tuần 1</span>
              </div>

              {/* Tuần 2: 180M */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[11px] font-black text-slate-800">180M</span>
                <div className="w-12 sm:w-16 flex flex-col rounded-t-xl overflow-hidden shadow-xs">
                  <div className="bg-sky-500 h-24 transition-all group-hover:brightness-110" title="Implant: 90M" />
                  <div className="bg-slate-900 h-18 transition-all group-hover:brightness-110" title="Răng sứ: 65M" />
                  <div className="bg-slate-300 h-10 transition-all group-hover:brightness-110" title="Tổng quát: 25M" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-2">Tuần 2</span>
              </div>

              {/* Tuần 3: 210M (Peak) */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[11px] font-black text-slate-800">210M</span>
                <div className="w-12 sm:w-16 flex flex-col rounded-t-xl overflow-hidden shadow-xs">
                  <div className="bg-sky-500 h-32 transition-all group-hover:brightness-110" title="Implant: 120M" />
                  <div className="bg-slate-900 h-20 transition-all group-hover:brightness-110" title="Răng sứ: 65M" />
                  <div className="bg-slate-300 h-10 transition-all group-hover:brightness-110" title="Tổng quát: 25M" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-2">Tuần 3</span>
              </div>

              {/* Tuần 4: 145M */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[11px] font-black text-slate-800">145M</span>
                <div className="w-12 sm:w-16 flex flex-col rounded-t-xl overflow-hidden shadow-xs">
                  <div className="bg-sky-500 h-16 transition-all group-hover:brightness-110" title="Implant: 65M" />
                  <div className="bg-slate-900 h-16 transition-all group-hover:brightness-110" title="Răng sứ: 55M" />
                  <div className="bg-slate-300 h-10 transition-all group-hover:brightness-110" title="Tổng quát: 25M" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 mt-2">Tuần 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tỷ trọng doanh thu Bác sĩ (1/3 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Tỷ trọng doanh thu Bác sĩ</h3>

          <div className="space-y-4">
            {/* Item 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-slate-800">BS.CKI Nguyễn Văn Tuấn (Implant)</span>
                <span className="font-black text-sky-700">48%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '48%' }} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">326.400.000đ</span>
            </div>

            {/* Item 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-slate-800">BS. Nguyễn Thị An (Răng sứ)</span>
                <span className="font-black text-slate-900">36%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-900 rounded-full" style={{ width: '36%' }} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">244.800.000đ</span>
            </div>

            {/* Item 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="text-slate-800">KTV &amp; Tổng quát</span>
                <span className="font-black text-slate-600">16%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: '16%' }} />
              </div>
              <span className="text-[11px] font-bold text-slate-500 block">108.800.000đ</span>
            </div>
          </div>

          <div className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 text-[11px] text-sky-800 font-semibold leading-relaxed">
            💡 Doanh thu mảng Implant đóng góp cao nhất, dự kiến đạt mốc 400M vào kỳ sau.
          </div>
        </div>
      </div>

      {/* Bottom Section: Danh sách giao dịch phát sinh gần nhất tại cơ sở */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Danh sách giao dịch phát sinh gần nhất tại cơ sở
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={txSearchQuery}
                onChange={(e) => setTxSearchQuery(e.target.value)}
                placeholder="Tìm giao dịch..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 w-full sm:w-56"
              />
            </div>
            <button
              type="button"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Transactions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">MÃ HĐ</th>
                <th className="py-3 px-3">THỜI GIAN</th>
                <th className="py-3 px-3">TÊN BỆNH NHÂN</th>
                <th className="py-3 px-3">DỊCH VỤ</th>
                <th className="py-3 px-3">BÁC SĨ</th>
                <th className="py-3 px-3">SỐ TIỀN (VNĐ)</th>
                <th className="py-3 px-3">HÌNH THỨC TT</th>
                <th className="py-3 px-3 text-right">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-sky-700">{tx.id}</td>
                  <td className="py-3.5 px-3 text-slate-500 font-medium">{tx.time}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">{tx.patientName}</span>
                    <span className="text-[10px] text-slate-400">{tx.patientCode}</span>
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-800">{tx.service}</td>
                  <td className="py-3.5 px-3 text-slate-700">{tx.doctor}</td>
                  <td className="py-3.5 px-3 font-black text-slate-900 font-mono">
                    {tx.amount.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-700">{tx.paymentMethod}</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-extrabold rounded-lg text-[10px] border border-emerald-200">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
