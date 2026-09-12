import React, { useState } from 'react';
import {
  Monitor, CheckCircle2, AlertTriangle, Bell, Search, SlidersHorizontal,
  MapPin, Calendar, User, QrCode, Bot, ChevronRight, Filter, Download
} from 'lucide-react';
import { ScheduleMaintenanceModal } from './ScheduleMaintenanceModal';

interface Device {
  id: string;
  name: string;
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  technician: string;
  status: 'active' | 'warning' | 'maintenance' | 'sterilize';
}

const MOCK_DEVICES: Device[] = [
  {
    id: 'TB-01',
    name: 'Ghế nha khoa cao cấp Sirona Intego',
    location: 'Ghế 01 - Tầng 1 (CN Biên Hòa)',
    lastMaintenance: '15/08/2026',
    nextMaintenance: '18/09/2026',
    technician: 'KTV. Hoàng Minh',
    status: 'active',
  },
  {
    id: 'TB-04',
    name: 'Máy chụp CT Cone Beam 3D Vatech PaX-3D',
    location: 'Phòng Chẩn đoán (Tầng 2)',
    lastMaintenance: '10/08/2026',
    nextMaintenance: '10/11/2026',
    technician: 'Kỹ sư Vatech',
    status: 'active',
  },
  {
    id: 'TB-08',
    name: 'Ghế điều trị nha khoa Gnatus G3',
    location: 'Ghế 04 - Tầng 1 (CN Biên Hòa)',
    lastMaintenance: '22/08/2026',
    nextMaintenance: '22/08/2026 (Hôm nay)',
    technician: 'KTV. Lê Văn Bình',
    status: 'warning',
  },
  {
    id: 'TB-12',
    name: 'Nồi hấp tiệt trùng Chass B Melag',
    location: 'Phòng Vô trùng trung tâm',
    lastMaintenance: '20/08/2026',
    nextMaintenance: '27/08/2026',
    technician: 'KTV. Hoàng Minh',
    status: 'sterilize',
  },
];

const STATUS_MAP = {
  active: { label: 'Đang hoạt động', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  warning: { label: 'Đang bảo trì / Thay lọc', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  maintenance: { label: 'Đang bảo trì', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
  sterilize: { label: 'Đạt chuẩn vô trùng', dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
};

const TABS = [
  { id: 'all', label: 'Tất cả thiết bị', count: 42 },
  { id: 'dental_chair', label: 'Ghế khám & Đèn mổ', count: 18 },
  { id: 'xray', label: 'Thiết bị X-quang', count: 6 },
  { id: 'hvac', label: 'Hệ thống vô trùng', count: 10 },
  { id: 'implant', label: 'Máy Implant', count: 8 },
];

export const MaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const filtered = MOCK_DEVICES.filter((d) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Thiết Bị Y Tế & Lịch</h2>
          <h2 className="text-xl font-bold text-slate-900">Bảo Dưỡng Định Kỳ</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Theo dõi tình trạng vận hành của 18 ghế nha khoa, máy C1 Cone Beam 3D, lò hấp vô trùng Class B và máy phẫu thuật cấy ghép Implant.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Branch filter */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><MapPin className="w-3.5 h-3.5" /></div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="pl-8 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:border-sky-400"
            >
              <option value="all">Chi nhánh: Tất cả cơ sở (3 chi nhánh)</option>
              <option value="bienhoa">Chi nhánh Biên Hòa</option>
              <option value="quan1">Chi nhánh Quận 1</option>
              <option value="longthanh">Chi nhánh Long Thành</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
          </div>

          {/* Export */}
          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Xuất biên bản kiểm định
          </button>

          {/* Schedule button */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 rounded-xl shadow-md transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            + Lên lịch bảo dưỡng mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Tổng thiết bị */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 leading-tight">Tổng thiết bị máy móc</p>
            <div className="p-2 bg-slate-100 rounded-xl"><Monitor className="w-4 h-4 text-slate-600" /></div>
          </div>
          <p className="text-2xl font-black text-slate-900">42 thiết bị</p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <QrCode className="w-3 h-3" /> 100% có mã định danh QR
          </p>
        </div>

        {/* Đang hoạt động */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 leading-tight">Đang hoạt động ổn định</p>
            <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
          </div>
          <p className="text-2xl font-black text-slate-900">38 thiết bị</p>
          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90.5%' }} />
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">90.5%</p>
        </div>

        {/* Đang bảo trì */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 leading-tight">Đang bảo trì / Khử khuẩn</p>
            <div className="p-2 bg-amber-50 rounded-xl"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>
          </div>
          <p className="text-2xl font-black text-slate-900">3 thiết bị</p>
          <p className="text-[11px] text-slate-400 mt-1">Ghế 04, Lò hấp 02, Máy chụp...</p>
        </div>

        {/* Cảnh báo AI */}
        <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-semibold text-red-600 leading-tight">Cảnh báo cần kiểm định (AI)</p>
            <div className="p-2 bg-red-100 rounded-xl"><Bell className="w-4 h-4 text-red-600" /></div>
          </div>
          <p className="text-2xl font-black text-red-700">1 thiết bị</p>
          <p className="text-[11px] text-red-500 mt-1">Máy can vôi siêu âm Satelec số 03 cần thay bộ lọc</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-slate-100">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative pb-3">
            <div className="absolute left-3 top-1/2 -translate-y-[60%] text-slate-400"><Search className="w-3.5 h-3.5" /></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mã TB, tên thiết bị..."
              className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl w-56 focus:outline-none focus:border-sky-400 bg-slate-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide w-16">Mã TB</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tên thiết bị</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Vị trí đặt</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Bảo dưỡng lần cuối</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Lịch tiếp theo</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Người phụ trách</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((device) => {
                const statusInfo = STATUS_MAP[device.status];
                return (
                  <tr key={device.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded-lg">{device.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-800">{device.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {device.location}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {device.lastMaintenance}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`text-xs font-semibold ${device.status === 'warning' ? 'text-amber-600' : 'text-slate-700'}`}>
                        {device.nextMaintenance}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <User className="w-3 h-3 text-slate-400" />
                        {device.technician}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} shrink-0`} />
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Footer */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-[11px] text-slate-600">
            <span className="font-bold text-emerald-700">Trợ lý AI Bảo trì:</span> Tần suất bảo dưỡng định kỳ 2 tuần/lần giúp hệ thống ghế khám giảm 98% nguy cơ hỏng hóc đột xuất trong giờ tiếp bệnh nhân.
          </p>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0" />
        </div>
      </div>

      {/* Schedule Modal */}
      <ScheduleMaintenanceModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onConfirm={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
};
