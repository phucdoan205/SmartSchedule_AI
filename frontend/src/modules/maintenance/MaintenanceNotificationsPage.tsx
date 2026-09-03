import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Calendar, Wrench, CheckCircle2, Clock, Plus, ShieldAlert } from 'lucide-react';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

interface MaintenanceNotification {
  id: string;
  deviceName: string;
  location: string;
  scheduledDate: string;
  technician: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Warning';
  notes: string;
}

const MOCK_NOTIFICATIONS: MaintenanceNotification[] = [
  {
    id: 'MN-001',
    deviceName: 'Máy Siêu Âm Tim 4D Doppler #01',
    location: 'Phòng 201 - Chi nhánh Quận 1',
    scheduledDate: '2026-09-10 09:00',
    technician: 'KTV. Trần Đức Anh',
    priority: 'High',
    status: 'Pending',
    notes: 'Bảo trì định kỳ 6 tháng & kiểm tra đầu dò siêu âm',
  },
  {
    id: 'MN-002',
    deviceName: 'Ghế Phẫu Thuật Nha Khoa Laser #03',
    location: 'Phòng 105 - Chi nhánh Quận 1',
    scheduledDate: '2026-09-05 14:30',
    technician: 'KTV. Lê Hoàng Nam',
    priority: 'Medium',
    status: 'Warning',
    notes: 'Kiểm tra đường áp suất hơi và đèn phẫu thuật',
  },
  {
    id: 'MN-003',
    deviceName: 'Máy Chụp X-Quang Kỹ Thuật Số',
    location: 'Phòng 102 - Chi nhánh Thủ Đức',
    scheduledDate: '2026-08-20 10:00',
    technician: 'KTV. Nguyễn Thanh Tùng',
    priority: 'Low',
    status: 'Completed',
    notes: 'Thay bóng phát tia X và cân chỉnh cảm biến hình ảnh',
  },
];

export const MaintenanceNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<MaintenanceNotification[]>(MOCK_NOTIFICATIONS);

  // Form input states for maintenance modal
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Thông Báo', count: notifications.length, icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Lịch Sử Bảo Trì Hoàn Tất', count: notifications.filter((n) => n.status === 'Completed').length, icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule: MaintenanceNotification = {
      id: `MN-${Math.floor(100 + Math.random() * 900)}`,
      deviceName,
      location,
      scheduledDate,
      technician: technician || 'KTV. Kỹ Thuật Viên',
      priority: 'Medium',
      status: 'Pending',
      notes,
    };
    setNotifications([newSchedule, ...notifications]);
    setIsModalOpen(false);
  };

  const filtered = activeTab === 'history' ? notifications.filter((n) => n.status === 'Completed') : notifications;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/maintenance')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Danh sách Thiết bị
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Thông Báo & Lịch Bảo Trì Thiết Bị</h2>
          <p className="text-xs text-slate-500 mt-1">Quản lý các thông báo nhắc nhở kiểm định và đặt lịch bảo dưỡng thiết bị y tế</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Lên lịch bảo dưỡng
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{item.id}</span>
                  <h4 className="text-sm font-bold text-slate-800">{item.deviceName}</h4>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-xs text-slate-500">{item.location} • {item.notes}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" /> {item.scheduledDate}
                  </span>
                  <span>Kỹ thuật viên: {item.technician}</span>
                </div>
              </div>
            </div>

            {item.status !== 'Completed' && (
              <button
                type="button"
                onClick={() =>
                  setNotifications(
                    notifications.map((n) => (n.id === item.id ? { ...n, status: 'Completed' } : n))
                  )
                }
                className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất bảo dưỡng
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal lên lịch bảo dưỡng */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lên Lịch Bảo Dưỡng Thiết Bị Y Tế"
        subtitle="Đặt lịch kiểm định và phân công kỹ thuật viên phụ trách"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên Thiết Bị Y Tế:</label>
            <input
              type="text"
              required
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="VD: Máy Siêu Âm Tim 4D"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Vị Trí Đặt Máy (Phòng / Chi nhánh):</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Phòng 201 - Cơ sở Quận 1"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ngày & Giờ Bảo Dưỡng:</label>
            <input
              type="datetime-local"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kỹ Thuật Viên Phụ Trách:</label>
            <input
              type="text"
              required
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              placeholder="VD: KTV. Trần Đức Anh"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Nội Dung Bảo Trì:</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nội dung hạng mục bảo trì..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
            >
              Xác Nhận Đặt Lịch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
