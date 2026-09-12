import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  ArrowRightLeft,
  Plus,
  ArrowLeft,
  Star,
  Check,
  X,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';

interface StaffAllocationViewProps {
  branch: any;
  onBack: () => void;
  onOpenTransferModal: () => void;
  onOpenAddStaffModal: () => void;
}

export const StaffAllocationView: React.FC<StaffAllocationViewProps> = ({
  branch,
  onBack,
  onOpenTransferModal,
  onOpenAddStaffModal,
}) => {
  const branchName = branch?.name || 'Chi nhánh Biên Hòa';
  const [activeTab, setActiveTab] = useState<'all' | 'doctor' | 'nurse' | 'reception'>('all');
  const [confirmedTransfer, setConfirmedTransfer] = useState(false);

  // Staff allocation mock records based on screenshot
  const staffList = [
    {
      id: 's1',
      code: 'NT',
      name: 'BS.CKI Nguyễn Văn Tuấn',
      specialty: 'Trưởng khoa Implant',
      category: 'doctor',
      status: 'permanent',
      statusLabel: 'Thường trực tại cơ sở',
      shift: 'Sáng (08:00 - 12:00)',
      rating: 4.9,
    },
    {
      id: 's2',
      code: 'NA',
      name: 'BS. Nguyễn Thị An',
      specialty: 'Răng sứ thẩm mỹ',
      category: 'doctor',
      status: 'permanent',
      statusLabel: 'Thường trực tại cơ sở',
      shift: 'Chiều (13:30 - 17:30)',
      rating: 4.8,
    },
    {
      id: 's3',
      code: 'TH',
      name: 'BS. Trần Minh Hoàng',
      specialty: 'Chỉnh nha luân chuyển',
      category: 'doctor',
      status: 'shift',
      statusLabel: 'Luân chuyển theo ca',
      shift: 'Cả ngày (T2, T4, T6)',
      rating: 4.7,
    },
    {
      id: 's4',
      code: 'LB',
      name: 'PT. Lê Văn Bình',
      specialty: 'Điều dưỡng & Phụ tá',
      category: 'nurse',
      status: 'permanent',
      statusLabel: 'Thường trực tại cơ sở',
      shift: 'Cả ngày (08:00 - 17:30)',
      rating: 4.8,
    },
    {
      id: 's5',
      code: 'PD',
      name: 'LT. Phạm Thị Dung',
      specialty: 'Lễ tân & Điều phối',
      category: 'reception',
      status: 'permanent',
      statusLabel: 'Thường trực tại cơ sở',
      shift: 'Sáng (07:30 - 15:30)',
      rating: 4.9,
    },
  ];

  const filteredStaff = staffList.filter((s) => {
    if (activeTab === 'all') return true;
    return s.category === activeTab;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quản lý chi nhánh
        </button>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">Phân bổ nhân sự: {branchName}</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Phân bổ Bác sĩ &amp; Nhân sự: {branchName}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Điều phối nhân sự thường trực, bác sĩ luân chuyển và kỹ thuật viên phụ trách tại chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenTransferModal}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-600" /> Điều chuyển nhân sự
          </button>

          <button
            type="button"
            onClick={onOpenAddStaffModal}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm nhân sự vào chi nhánh
          </button>
        </div>
      </div>

      {/* 3 Top Summary KPI Cards (Khớp 100% Ảnh "giao diện button phân bổ nhân sự.png") */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        {/* Card 1: Tổng nhân sự */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TỔNG NHÂN SỰ
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">18 người</h3>
            <p className="text-[11px] text-slate-500 font-semibold">8 Bác sĩ, 6 Phụ tá, 4 Lễ tân</p>
          </div>
        </div>

        {/* Card 2: Đang trong ca trực hôm nay */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              ĐANG TRONG CA TRỰC HÔM NAY
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">14 người</h3>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hoạt động bình thường
            </p>
          </div>
        </div>

        {/* Card 3: Đang công tác/luân chuyển */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              ĐANG CÔNG TÁC/LUÂN CHUYỂN
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900">2 người</h3>
            <p className="text-[11px] text-amber-600 font-bold">Cần xác nhận lịch trình</p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (2/3): DANH SÁCH NHÂN SỰ & TABS */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
          {/* Tabs filter */}
          <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-100 text-xs font-extrabold overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Tất cả nhân sự
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doctor')}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'doctor'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Bác sĩ điều trị
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nurse')}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'nurse'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Điều dưỡng &amp; Phụ tá
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reception')}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === 'reception'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Lễ tân
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[540px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">NHÂN SỰ</th>
                  <th className="py-3 px-3">TRẠNG THÁI</th>
                  <th className="py-3 px-3">CA LÀM VIỆC</th>
                  <th className="py-3 px-3">ĐÁNH GIÁ</th>
                  <th className="py-3 px-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {staff.code}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{staff.name}</span>
                          <span className="text-[10px] text-slate-500">{staff.specialty}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold ${
                          staff.status === 'permanent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {staff.statusLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">{staff.shift}</td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-extrabold text-slate-900">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{staff.rating}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={onOpenTransferModal}
                        className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                        title="Điều chuyển hoặc đổi ca"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI (1/3): THAO TÁC NHANH (Khớp 100% Ảnh) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <span>⚡</span> Thao tác nhanh
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Xác nhận lịch luân chuyển sắp tới</p>
            </div>

            {/* Quick action transfer card */}
            {!confirmedTransfer ? (
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                    L
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">
                      Điều chuyển {MOCK_DOCTORS[0]?.name || 'BS. Lan'}
                    </h5>
                    <p className="text-[10px] text-slate-500">Chuyên khoa Răng trẻ em</p>
                  </div>
                </div>

                <div className="flex items-center justify-between font-bold text-xs text-slate-800 px-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-extrabold uppercase">TỪ</span>
                    <span>Biên Hòa</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-extrabold uppercase">ĐẾN</span>
                    <span>Chi nhánh Quận 1</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-2">
                  <span>📅</span> Thứ 6 tuần này (Cả ngày)
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirmedTransfer(true)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Xác nhận
                  </button>
                  <button
                    type="button"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-1">
                <span className="font-extrabold text-xs flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" /> Đã xác nhận điều chuyển
                </span>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Thông báo lịch trình đã được gửi đến BS và Quản lý chi nhánh Quận 1.
                </p>
              </div>
            )}

            {/* AI Suggestion Box */}
            <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-800 font-semibold leading-relaxed">
                <strong>Đề xuất:</strong> Chi nhánh Q1 đang thiếu ca sáng T6.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
