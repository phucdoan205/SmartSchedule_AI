import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Users,
  Armchair,
  CreditCard,
  Edit3,
  TrendingUp,
  ArrowLeft,
  CalendarCheck,
} from 'lucide-react';

interface BranchDetailViewProps {
  branch: any;
  onBack: () => void;
  onOpenEdit: () => void;
  onOpenStaffAllocation: () => void;
  onOpenRoomConfig: () => void;
}

export const BranchDetailView: React.FC<BranchDetailViewProps> = ({
  branch,
  onBack,
  onOpenEdit,
  onOpenStaffAllocation,
  onOpenRoomConfig,
}) => {
  const branchName = branch?.name || 'Chi nhánh Biên Hòa';
  const isHeadquarters = branch?.id === 'b-bienhoa' || branch?.id === 'b2';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Quản lý chi nhánh
          </button>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold">
            Chi tiết: {branchName} {isHeadquarters ? '(Trụ sở chính)' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenStaffAllocation}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-sky-600" /> Phân bổ nhân sự
          </button>
          <button
            type="button"
            onClick={onOpenRoomConfig}
            className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Armchair className="w-3.5 h-3.5 text-indigo-600" /> Cấu hình phòng
          </button>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Thông tin chi tiết: {branchName}
            </h1>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Đang hoạt động
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            {isHeadquarters ? 'Trụ sở chính – Hoạt động từ năm 2018' : 'Cơ sở trực thuộc hệ thống SmartSchedule'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenEdit}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <Edit3 className="w-4 h-4 text-slate-600" /> Chỉnh sửa thông tin
        </button>
      </div>

      {/* 6 Metric Information Cards (Khớp 100% Ảnh "giao diện button xem chi tiết.png") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Card 1: Thông tin liên hệ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Thông tin liên hệ</h3>
          </div>

          <div className="space-y-2 pt-1 font-semibold text-slate-700">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-relaxed">
                {branch?.address || '123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px]">{branch?.phone || '0236 6555 555'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-[11px]">{branch?.email || 'bienhoa@vietanhduc.vn'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Giờ hoạt động */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Giờ hoạt động</h3>
          </div>

          <div className="space-y-2.5 pt-1 font-bold text-slate-800 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-600">Thứ 2 - Thứ 7</span>
              <span className="font-extrabold text-slate-900">08:00 - 20:00</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">Chủ Nhật</span>
              <span className="font-extrabold text-slate-900">08:00 - 17:00</span>
            </div>
          </div>
        </div>

        {/* Card 3: Quy mô cơ sở */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">Quy mô cơ sở</h3>
          </div>

          <div className="space-y-2 pt-1 font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-800">
                {branch?.roomCount || 8} Ghế nha khoa
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-800">
                {branch?.doctorCount || 18} Bác sĩ &amp; KTV
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono text-sm">📐</span>
              <span className="text-[11px] text-slate-600">Diện tích: 450m² (3 Tầng lầu)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Công suất hoạt động trung bình */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            CÔNG SUẤT HOẠT ĐỘNG TRUNG BÌNH
          </span>

          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl font-black text-slate-900">92%</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] rounded-md border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4% so với tháng trước
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Card 5: Số ca khám hôm nay */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            SỐ CA KHÁM HÔM NAY
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">34</span>
            <span className="text-xs font-bold text-slate-500">ca khám</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg text-[10px] font-extrabold border border-sky-100">
              12 ca Implant
            </span>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-extrabold border border-indigo-100">
              15 ca Răng sứ
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-extrabold">
              7 ca Tổng quát
            </span>
          </div>
        </div>

        {/* Card 6: Doanh thu cơ sở tháng này */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-sm space-y-3 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-4 right-4 text-white/20">
            <CreditCard className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              DOANH THU CƠ SỞ THÁNG NÀY
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-2">
              680.000.000đ
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" /> Đạt 108% chỉ tiêu kế hoạch tháng
          </p>
        </div>
      </div>

      {/* Sơ Đồ Bố Trí Cơ Sở (Theo Tầng) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Sơ đồ bố trí cơ sở</h3>

        <div className="space-y-3 text-xs">
          {/* Tầng 1 */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
              T1
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Tầng 1</h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                <span>🏢</span> Khu tiếp đón &amp; 3 Ghế khám tổng quát / Cạo vôi răng
              </p>
            </div>
          </div>

          {/* Tầng 2 */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
              T2
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Tầng 2</h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                <span>🦷</span> Khu phục hình răng sứ &amp; Phòng chụp X-quang CT Cone Beam
              </p>
            </div>
          </div>

          {/* Tầng 3 */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-4 hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center shrink-0 text-sm">
              T3
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Tầng 3</h4>
              <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                <span>🏥</span> 2 Phòng phẫu thuật vô trùng Cấy ghép Implant &amp; Ghép xương
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
