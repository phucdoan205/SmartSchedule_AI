import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, CheckCircle2, AlertTriangle, Download, Plus, Search,
  MapPin, Clock, User, Wrench, Flame, FileText, ToggleLeft, ToggleRight
} from 'lucide-react';
import { ScheduleMaintenanceModal } from './ScheduleMaintenanceModal';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type MaintenanceType = 'periodic' | 'sterilize' | 'calibration';
type NotifStatus = 'pending' | 'inprogress' | 'done';
type HistoryCategory = 'periodic' | 'sterilize' | 'replacement' | 'calibration';

interface MaintenanceNotif {
  id: string;
  deviceName: string;
  deviceId: string;
  location: string;
  time: string;
  date: string;
  technician: string;
  type: MaintenanceType;
  typeLabel: string;
  status: NotifStatus;
  paused: boolean;
  scheduled: boolean;
}

interface HistoryRecord {
  id: string;
  deviceName: string;
  category: HistoryCategory;
  categoryLabel: string;
  completedDate: string;
  result: 'passed' | 'certified';
  downloadLabel: string;
}

// ──────────────────────────────────────────────
// Mock Data
// ──────────────────────────────────────────────
const MOCK_NOTIFS: MaintenanceNotif[] = [
  {
    id: '#ST-2026-045',
    deviceName: 'Ghế nha khoa Sirona (TB-03)',
    deviceId: 'TB-03',
    location: 'Ghế 03 - Tầng 1 (CN Biên Hòa)',
    time: '07:30 – Hôm nay',
    date: 'Hôm nay',
    technician: 'KTV. Hoàng Minh',
    type: 'periodic',
    typeLabel: 'XỬ LÝ SỰ CỐ / THAY LỌC',
    status: 'pending',
    paused: true,
    scheduled: false,
  },
  {
    id: '#ST-2026-046',
    deviceName: 'Nồi hấp Melag (TB-12)',
    deviceId: 'TB-12',
    location: 'Phòng Vô trùng',
    time: '18:00 – 25/08/2026',
    date: '25/08/2026',
    technician: 'KTV. Lê Văn Bình',
    type: 'sterilize',
    typeLabel: 'KHỬ TRÙNG & TEST VI SINH',
    status: 'done',
    paused: false,
    scheduled: true,
  },
  {
    id: '#ST-2026-047',
    deviceName: 'Máy chụp CT Vatech (TB-04)',
    deviceId: 'TB-04',
    location: 'Phòng Chẩn đoán hình ảnh',
    time: '08:00 – 27/08/2026',
    date: '27/08/2026',
    technician: 'Kỹ sư Vatech',
    type: 'calibration',
    typeLabel: 'HIỆU CHUẨN TIA ĐỊNH KỲ',
    status: 'done',
    paused: true,
    scheduled: true,
  },
];

const MOCK_HISTORY: HistoryRecord[] = [
  {
    id: '#BT-2026-042',
    deviceName: 'Ghế nha khoa Sirona Intego',
    category: 'periodic',
    categoryLabel: 'BẢO TRÌ ĐỊNH KỲ',
    completedDate: '12/05/2026',
    result: 'passed',
    downloadLabel: 'Tải biên bản (PDF)',
  },
  {
    id: '#BT-2026-039',
    deviceName: 'Nồi hấp Melag',
    category: 'sterilize',
    categoryLabel: 'KHỬ TRÙNG & KIỂM ĐỊNH',
    completedDate: '08/05/2026',
    result: 'passed',
    downloadLabel: 'Tải biên bản (PDF)',
  },
  {
    id: '#BT-2026-035',
    deviceName: 'Máy chụp CT Vatech',
    category: 'calibration',
    categoryLabel: 'HIỆU CHUẨN TIA X-QUANG',
    completedDate: '02/05/2026',
    result: 'certified',
    downloadLabel: 'Tải chứng chỉ (PDF)',
  },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
const TYPE_BADGE: Record<string, string> = {
  'XỬ LÝ SỰ CỐ / THAY LỌC': 'bg-red-100 text-red-700 border-red-200',
  'KHỬ TRÙNG & TEST VI SINH': 'bg-teal-100 text-teal-700 border-teal-200',
  'HIỆU CHUẨN TIA ĐỊNH KỲ': 'bg-sky-100 text-sky-700 border-sky-200',
};

const CATEGORY_BADGE: Record<string, string> = {
  'BẢO TRÌ ĐỊNH KỲ': 'bg-slate-100 text-slate-600',
  'KHỬ TRÙNG & KIỂM ĐỊNH': 'bg-teal-50 text-teal-700',
  'HIỆU CHUẨN TIA X-QUANG': 'bg-sky-50 text-sky-700',
};

const DEVICE_ICON = (type: MaintenanceType) => {
  if (type === 'sterilize') return <Flame className="w-4 h-4 text-teal-600" />;
  if (type === 'calibration') return <FileText className="w-4 h-4 text-sky-600" />;
  return <Wrench className="w-4 h-4 text-slate-600" />;
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export const MaintenanceNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'history'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<MaintenanceNotif[]>(MOCK_NOTIFS);

  const togglePause = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, paused: !n.paused } : n));
  };

  const TYPE_FILTERS = [
    { id: 'all', label: 'Tất cả loại hình' },
    { id: 'periodic', label: 'Bảo trì định kỳ' },
    { id: 'sterilize', label: 'Khử trùng buồng máy' },
    { id: 'suco', label: 'Cảnh báo sự cố' },
  ];

  const filteredNotifs = notifications.filter((n) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return n.deviceName.toLowerCase().includes(q) || n.deviceId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý & Thông báo Lịch Bảo</h2>
          <h2 className="text-xl font-bold text-slate-900">Dưỡng Thiết Bị</h2>
          <p className="text-xs text-slate-500 mt-1.5">Theo dõi lịch bảo trì sắp tới và các cảnh báo kỹ thuật khẩn cấp.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Branch filter */}
          <div className="relative">
            <select className="pl-3 pr-8 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:border-sky-400">
              <option>Tất cả chi nhánh</option>
              <option>Chi nhánh Biên Hòa</option>
              <option>Chi nhánh Quận 1</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
          </div>

          <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
            <Download className="w-3.5 h-3.5" />
            Xuất biên bản (PDF/Excel)
          </button>
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 rounded-xl shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Lên lịch bảo dưỡng mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-sky-50 rounded-xl"><Calendar className="w-4 h-4 text-sky-600" /></div>
          </div>
          <p className="text-2xl font-black text-slate-900">5</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Lịch bảo trì sắp tới (7 ngày tới)</p>
          <p className="text-[11px] text-slate-400 mt-1">Gồm: 3 ghế, 1 CT, 1 nồi hấp</p>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-xl"><AlertTriangle className="w-4 h-4 text-red-500" /></div>
            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">Khẩn cấp</span>
          </div>
          <p className="text-2xl font-black text-red-700">1</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Yêu cầu xử lý khẩn cấp / Cảnh báo AI</p>
          <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Cần thay bộ lọc nước Ghế 03
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Tháng này</span>
          </div>
          <p className="text-2xl font-black text-slate-900">16</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Đã hoàn tất bảo dưỡng tháng này</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% theo kế hoạch
          </p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'all' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="text-lg">🔔</span>
            Tất cả thông báo bảo trì (Sắp tới & Cần xử lý)
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${activeTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {notifications.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <span className="text-lg">📋</span>
            Lịch sử bảo dưỡng & Kiểm định
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${activeTab === 'history' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {MOCK_HISTORY.length}
            </span>
          </button>
        </div>

        {/* ── Tab: Tất cả thông báo ── */}
        {activeTab === 'all' && (
          <>
            {/* Sub-filter bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              <div className="flex gap-1.5">
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setTypeFilter(f.id)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${typeFilter === f.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="pl-3 pr-7 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none">
                    <option value="all">Trạng thái: Chưa thực hiện</option>
                    <option value="done">Đã hoàn thành</option>
                    <option value="inprogress">Đang thực hiện</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
                </div>
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Search className="w-3.5 h-3.5" /></div>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm mã BT, thiết bị..." className="pl-8 pr-3 py-1.5 text-[11px] border border-slate-200 rounded-lg w-48 focus:outline-none bg-white focus:border-sky-400" />
                </div>
              </div>
            </div>

            {/* Notification list */}
            <div className="divide-y divide-slate-100">
              {filteredNotifs.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start gap-3.5">
                    {/* Device icon */}
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      {DEVICE_ICON(notif.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{notif.id}</span>
                        <span className="text-sm font-bold text-slate-800">{notif.deviceName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_BADGE[notif.typeLabel] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {notif.typeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{notif.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{notif.time}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{notif.technician}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Tam ngưng toggle */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Tam ngưng TB</span>
                      <button
                        type="button"
                        onClick={() => togglePause(notif.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${notif.paused ? 'bg-sky-600' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${notif.paused ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {notif.scheduled && (
                      <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 border border-sky-200 px-2 py-1 rounded-lg">● Đã lên lịch</span>
                    )}

                    {notif.status === 'pending' && !notif.scheduled && (
                      <button type="button" className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 rounded-lg transition-colors">Bắt đầu làm</button>
                    )}

                    {notif.scheduled && (
                      <button type="button" className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors">Chi tiết</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Tab: Lịch sử ── */}
        {activeTab === 'history' && (
          <>
            {/* Category filter */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-50 bg-slate-50/50">
              {['Tất cả biên bản', 'Đã nghiệm thu', 'Thay thế linh kiện', 'Khử trùng định kỳ'].map((f, idx) => (
                <button key={f} type="button" className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${idx === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                  {f}
                </button>
              ))}
            </div>

            {/* History list */}
            <div className="divide-y divide-slate-100">
              {MOCK_HISTORY.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <Wrench className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500">{record.id}</span>
                        <span className="text-sm font-bold text-slate-800">{record.deviceName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${CATEGORY_BADGE[record.categoryLabel] || 'bg-slate-100 text-slate-600'}`}>
                          {record.categoryLabel}
                        </span>
                        <span>• Ngày hoàn tất: {record.completedDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1 ${record.result === 'certified' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {record.result === 'certified' ? 'Đã cấp chứng nhận' : 'Đã nghiệm thu & Đạt chuẩn'}
                    </span>
                    <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors">
                      <Download className="w-3 h-3" />
                      {record.downloadLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleMaintenanceModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} />
    </div>
  );
};
