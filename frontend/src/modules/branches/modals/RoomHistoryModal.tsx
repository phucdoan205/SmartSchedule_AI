import React, { useState } from 'react';
import {
  X,
  History,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

interface RoomHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  branchName?: string;
}

export const RoomHistoryModal: React.FC<RoomHistoryModalProps> = ({
  isOpen,
  onClose,
  room,
  branchName = 'Chi nhánh Biên Hòa',
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'maintenance'>('appointments');
  const [maintenanceFilter, setMaintenanceFilter] = useState<'all' | 'sterilize' | 'periodic' | 'replacement'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Nhật Ký &amp; Lịch Sử Hoạt Động: {room.name} ({room.floor?.split('(')[0] || 'Tầng 1'})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>📍 {branchName}</span>
                <span>|</span>
                <span className="flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" /> Thiết bị: Máy lấy cao răng siêu âm Satelec &amp; Đèn trùng hợp
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Card 1: Tổng số ca */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TỔNG SỐ CA ĐÃ PHỤC VỤ THÁNG NÀY
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">142</span>
              <span className="text-xs font-bold text-slate-500">ca khám</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '94%' }} />
              </div>
              <span className="text-[10px] font-extrabold text-sky-700">94%</span>
            </div>
          </div>

          {/* Card 2: Thời gian hoạt động trung bình */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              THỜI GIAN HOẠT ĐỘNG TRUNG BÌNH
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">7.5</span>
              <span className="text-xs font-bold text-slate-500">giờ / ngày</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold">Tối ưu hiệu suất ghế khám</p>
          </div>

          {/* Card 3: Lần bảo trì & khử trùng gần nhất */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              LẦN BẢO TRÌ &amp; KHỬ TRÙNG GẦN NHẤT
            </span>
            <div className="text-xl font-extrabold text-slate-900">18/08/2026</div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt chuẩn vô trùng Bộ Y Tế
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'appointments'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🩺 Lịch sử ca khám &amp; Bệnh nhân</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>⚙️ Nhật ký bảo trì &amp; Khử trùng thiết bị</span>
          </button>
        </div>

        {/* TAB 1: LỊCH SỬ CA KHÁM & BỆNH NHÂN */}
        {activeTab === 'appointments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">THỜI GIAN / NGÀY</th>
                  <th className="py-3 px-3">BỆNH NHÂN &amp; MÃ BN</th>
                  <th className="py-3 px-3">DỊCH VỤ ĐIỀU TRỊ THỰC HIỆN</th>
                  <th className="py-3 px-3">BÁC SĨ PHỤ TRÁCH</th>
                  <th className="py-3 px-3">THỜI LƯỢNG</th>
                  <th className="py-3 px-3 text-right">TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">09:00 - 10:00</span>
                    <span className="text-[10px] text-slate-400">(Hôm nay)</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">Lê Văn A</span>
                    <span className="text-[10px] text-slate-400">#BN-101</span>
                  </td>
                  <td className="py-3.5 px-3">Cạo vôi răng siêu âm &amp; Đánh bóng</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">{room.doctorName || 'BS. Trần Đức Cường'}</td>
                  <td className="py-3.5 px-3 text-slate-600">45 phút</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-full border border-sky-200 text-[10px] inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" /> Đang khám
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">15:30</span>
                    <span className="text-[10px] text-slate-400">21/08/2026</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">Trần Thị Mai</span>
                    <span className="text-[10px] text-slate-400">#BN-092</span>
                  </td>
                  <td className="py-3.5 px-3">Khám tổng quát &amp; Lấy dấu sứ</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">BS. Nguyễn Thị An</td>
                  <td className="py-3.5 px-3 text-slate-600">60 phút</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoàn thành
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">10:00</span>
                    <span className="text-[10px] text-slate-400">21/08/2026</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">Phạm Minh Anh</span>
                    <span className="text-[10px] text-slate-400">#BN-088</span>
                  </td>
                  <td className="py-3.5 px-3">Hàn trám răng thẩm mỹ Composite</td>
                  <td className="py-3.5 px-3 font-bold text-slate-900">BS. Trần Đức Cường</td>
                  <td className="py-3.5 px-3 text-slate-600">30 phút</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[10px] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoàn thành
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">08:00</span>
                    <span className="text-[10px] text-slate-400">21/08/2026</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-extrabold text-slate-900 block">Khử trùng đầu xịt &amp; Thay bộ lọc nước</span>
                    <span className="text-[10px] text-slate-400">-</span>
                  </td>
                  <td className="py-3.5 px-3">-</td>
                  <td className="py-3.5 px-3 font-bold text-slate-600">Kỹ thuật viên bảo trì</td>
                  <td className="py-3.5 px-3 text-slate-600">20 phút</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full border border-indigo-200 text-[10px] inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-600" /> Vô trùng hoàn tất
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: NHẬT KÝ BẢO TRÌ & KHỬ TRÙNG THIẾT BỊ */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            {/* Sub-filter pills & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMaintenanceFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    maintenanceFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả nhật ký
                </button>
                <button
                  type="button"
                  onClick={() => setMaintenanceFilter('sterilize')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    maintenanceFilter === 'sterilize'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Khử trùng buồng ghế
                </button>
                <button
                  type="button"
                  onClick={() => setMaintenanceFilter('periodic')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    maintenanceFilter === 'periodic'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bảo dưỡng định kỳ
                </button>
                <button
                  type="button"
                  onClick={() => setMaintenanceFilter('replacement')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    maintenanceFilter === 'replacement'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Thay thế linh kiện
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm biên bản, kỹ thuật viên"
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Table Maintenance */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">THỜI GIAN / NGÀY</th>
                    <th className="py-3 px-3">HẠNG MỤC BẢO DƯỠNG / KHỬ TRÙNG</th>
                    <th className="py-3 px-3">KỸ THUẬT VIÊN THỰC HIỆN</th>
                    <th className="py-3 px-3">TIÊU CHUẨN ĐẠT ĐƯỢC</th>
                    <th className="py-3 px-3">ĐÁNH GIÁ TÌNH TRẠNG THIẾT BỊ</th>
                    <th className="py-3 px-3 text-right">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 block">08:00 - Hôm nay</span>
                      <span className="text-[10px] text-slate-400">(22/08/2026)</span>
                    </td>
                    <td className="py-3.5 px-3">Vệ sinh đường ống hút, khử khuẩn bề mặt &amp; đèn quang trùng hợp</td>
                    <td className="py-3.5 px-3 text-slate-700">KTV. Hoàng Minh</td>
                    <td className="py-3.5 px-3">
                      <span className="text-sky-600 font-bold hover:underline cursor-pointer">Chuẩn vô trùng Class B</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">Hoạt động hoàn hảo 100%</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đạt chuẩn - Sẵn sàng
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 block">18:30</span>
                      <span className="text-[10px] text-slate-400">21/08/2026</span>
                    </td>
                    <td className="py-3.5 px-3">Khử trùng nhiệt cao áp đầu cạo vôi Satelec &amp; xịt rửa</td>
                    <td className="py-3.5 px-3 text-slate-700">KTV. Lê Văn Bình</td>
                    <td className="py-3.5 px-3 text-slate-700">Hấp sấy nhiệt 134°C</td>
                    <td className="py-3.5 px-3 text-slate-600">Áp lực nước và tia siêu âm ổn định</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-bold rounded-full border border-teal-200 text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Đã kiểm định
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 block">18/08/2026</span>
                    </td>
                    <td className="py-3.5 px-3">Bảo dưỡng định kỳ: Thay lõi lọc nước nha khoa &amp; bôi trơn tay khoan</td>
                    <td className="py-3.5 px-3 text-slate-700">Kỹ sư hãng Satelec</td>
                    <td className="py-3.5 px-3 text-slate-700">Tiêu chuẩn nhà sản xuất</td>
                    <td className="py-3.5 px-3 text-slate-600">Đã hiệu chuẩn áp lực hơi khí nén</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-bold rounded-full border border-teal-200 text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Hoàn tất
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-slate-900 block">01/08/2026</span>
                    </td>
                    <td className="py-3.5 px-3">Kiểm tra hệ thống điện &amp; Bơm dầu mô tơ nâng hạ ghế</td>
                    <td className="py-3.5 px-3 text-slate-700">KTV. Hoàng Minh</td>
                    <td className="py-3.5 px-3 text-slate-700">Quy trình nội bộ</td>
                    <td className="py-3.5 px-3 text-slate-600">Mô tơ vận hành êm ái</td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-bold rounded-full border border-teal-200 text-[10px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-600" /> Hoàn tất
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất nhật ký (Excel/PDF)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Tạo lịch bảo trì định kỳ
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
