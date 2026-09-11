import React, { useState } from 'react';
import { X, ClipboardList, Calendar, Clock, RefreshCw, DollarSign, CalendarCheck, Wrench, Flame, Zap, Bot, ToggleRight } from 'lucide-react';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (data: ScheduleFormData) => void;
}

interface ScheduleFormData {
  branch: string;
  deviceId: string;
  maintenanceType: 'periodic' | 'sterilize' | 'repair';
  scheduledDate: string;
  startTime: string;
  endTime: string;
  repeatCycle: string;
  technician: string;
  estimatedCost: string;
  autoLockChair: boolean;
}

const DEVICES = [
  { id: 'TB-01', label: 'TB-01: Ghế nha khoa cao cấp Sirona Intego (Ghế...)' },
  { id: 'TB-04', label: 'TB-04: Máy chụp CT Cone Beam 3D Vatech PaX-3D' },
  { id: 'TB-08', label: 'TB-08: Ghế điều trị nha khoa Gnatus G3' },
  { id: 'TB-12', label: 'TB-12: Nồi hấp tiệt trùng Class B Melag' },
];

const TECHNICIANS = [
  'KTV. Hoàng Minh (Chuyên trách vô trùng & thiết bị)',
  'KTV. Lê Văn Bình (Kỹ sư điện - điện tử y tế)',
  'Kỹ sư Vatech (Bảo hành chính hãng)',
  'KTV. Nguyễn Thành Long (Chụp X-quang)',
];

const REPEAT_OPTIONS = [
  'Lặp lại mỗi tháng 1 lần',
  'Lặp lại mỗi 2 tuần',
  'Lặp lại mỗi 3 tháng',
  'Lặp lại mỗi 6 tháng',
  'Không lặp lại',
];

export const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [form, setForm] = useState<ScheduleFormData>({
    branch: 'Chi nhánh Biên Hòa (Trụ sở chính)',
    deviceId: 'TB-01',
    maintenanceType: 'periodic',
    scheduledDate: '2026-08-24',
    startTime: '07:00',
    endTime: '08:30',
    repeatCycle: 'Lặp lại mỗi tháng 1 lần',
    technician: TECHNICIANS[0],
    estimatedCost: '0',
    autoLockChair: true,
  });
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Lên Lịch Bảo Dưỡng & Kiểm Định Thiết Bị Mới</h2>
              <p className="text-xs text-slate-500 mt-0.5">Thiết lập kế hoạch bảo trì định kỳ, khử trùng buồng máy hoặc sửa chữa đột xuất cho trang thiết bị y tế toàn viện</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Row 1: Chi nhánh + Ngày thực hiện */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chi nhánh thực hiện <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white appearance-none pr-8 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
                  <option>Chi nhánh Biên Hòa (Trụ sở chính)</option>
                  <option>Chi nhánh Quận 1</option>
                  <option>Chi nhánh Long Thành (Đồng Nai)</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ngày thực hiện <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Calendar className="w-4 h-4" /></div>
                <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 pl-1">Thứ Hai, 24/08/2026</p>
            </div>
          </div>

          {/* Row 2: Khung giờ + Chu kỳ lặp lại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Khung giờ <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><Clock className="w-3.5 h-3.5" /></div>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full pl-8 pr-2 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400" />
                </div>
                <span className="text-slate-400 text-xs shrink-0">–</span>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="flex-1 px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chu kỳ lặp lại</label>
              <div className="relative">
                <select value={form.repeatCycle} onChange={(e) => setForm({ ...form, repeatCycle: e.target.value })} className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white appearance-none pr-8 focus:outline-none focus:border-sky-400">
                  {REPEAT_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"><RefreshCw className="w-3.5 h-3.5" /></div>
              </div>
            </div>
          </div>

          {/* Chọn thiết bị */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Chọn thiết bị <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><ClipboardList className="w-4 h-4" /></div>
              <select value={form.deviceId} onChange={(e) => setForm({ ...form, deviceId: e.target.value })} className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:border-sky-400">
                {DEVICES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
            </div>
          </div>

          {/* Loại hình bảo dưỡng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Loại hình bảo dưỡng</label>
            <div className="space-y-2">
              {[
                { value: 'periodic' as const, label: 'Bảo trì định kỳ (Hàng tháng)', Icon: Wrench, iconColor: 'text-sky-600' },
                { value: 'sterilize' as const, label: 'Khử trùng & Hấp vô trùng chuyên sâu', Icon: Flame, iconColor: 'text-orange-500' },
                { value: 'repair' as const, label: 'Sửa chữa / Xử lý cảnh báo sự cố', Icon: Zap, iconColor: 'text-amber-500' },
              ].map(({ value, label, Icon, iconColor }) => (
                <label key={value} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${form.maintenanceType === value ? 'border-sky-400 bg-sky-50/70 ring-1 ring-sky-200' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                  <input type="radio" name="maintenanceType" value={value} checked={form.maintenanceType === value} onChange={() => setForm({ ...form, maintenanceType: value })} className="accent-sky-600" />
                  <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
                  <span className="text-xs font-semibold text-slate-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Mức độ ưu tiên</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPriority('normal')} className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${priority === 'normal' ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>Bình thường</button>
              <button type="button" onClick={() => setPriority('high')} className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${priority === 'high' ? 'bg-sky-600 text-white border-sky-600' : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'}`}>Ưu tiên cao</button>
              <button type="button" onClick={() => setPriority('urgent')} className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${priority === 'urgent' ? 'bg-red-600 text-white border-red-600' : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'}`}>Khẩn cấp (Khóa máy ngay)</button>
            </div>
          </div>

          {/* Kỹ thuật viên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kỹ thuật viên phụ trách <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">HM</div>
              <select value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} className="w-full pl-12 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:border-sky-400">
                {TECHNICIANS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
            </div>
          </div>

          {/* Dự toán chi phí */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dự toán chi phí (VNĐ)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><DollarSign className="w-4 h-4" /></div>
              <input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} placeholder="0" className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
            </div>
          </div>

          {/* Auto-lock toggle */}
          <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
            <button type="button" onClick={() => setForm({ ...form, autoLockChair: !form.autoLockChair })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${form.autoLockChair ? 'bg-sky-600' : 'bg-slate-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.autoLockChair ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <ToggleRight className="w-3.5 h-3.5 text-sky-600" />
                Tự động khóa ghế/phòng khám
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tự động khóa ghế/phòng khám trên Lịch Thông Minh và Cổng Đặt Lịch Online trong thời gian bảo dưỡng
              </p>
            </div>
          </div>

          {/* AI tip */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              <span className="font-bold">Gợi ý từ AI:</span> Ghế 01 đã hoạt động 142 ca khám trong tháng qua. Khuyến nghị kỹ thuật viên kiểm tra độ áp lực van xả và thay lọc cán nước siêu âm trong đợt này.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">Hủy bỏ</button>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors">Lưu bản nháp</button>
            <button type="button" onClick={handleConfirm} className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 rounded-xl shadow-md transition-colors flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              XÁC NHẬN LÊN LỊCH BẢO DƯỠNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
