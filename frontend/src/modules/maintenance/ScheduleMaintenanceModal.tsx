import React, { useState, useEffect } from 'react';
import { X, ClipboardList, CalendarCheck, Wrench, Flame, Zap, Bot, ToggleRight, DollarSign, Loader2 } from 'lucide-react';
import { equipmentApi } from '../../services/api';
import { useBranch } from '../../context/BranchContext';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  initialPriority?: 'normal' | 'high' | 'urgent';
  initialActionType?: string;
  modalTitle?: string;
}

export const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialPriority = 'normal',
  initialActionType = 'BẢO TRÌ ĐỊNH KỲ',
  modalTitle,
}) => {
  const { branches, selectedBranchId } = useBranch();
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    branchId: selectedBranchId !== 'ALL' ? selectedBranchId : '',
    deviceId: '',
    actionType: initialActionType,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '07:30',
    repeatCycle: 'Lặp lại mỗi tháng 1 lần',
    technician: 'KTV. Hoàng Minh',
    findings: '',
    estimatedCost: '0',
    autoLockChair: true,
  });
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>(initialPriority);

  useEffect(() => {
    if (isOpen) {
      setPriority(initialPriority);
      setForm((prev) => ({
        ...prev,
        actionType: initialActionType,
        branchId: selectedBranchId !== 'ALL' ? selectedBranchId : prev.branchId,
      }));
      setLoadingDevices(true);
      equipmentApi
        .getAll({ branchId: form.branchId || undefined, limit: 50 })
        .then((res) => {
          if (res?.data && res.data.length > 0) {
            setDeviceList(res.data);
            if (!form.deviceId) {
              setForm((prev) => ({ ...prev, deviceId: res.data[0].id }));
            }
          }
        })
        .finally(() => setLoadingDevices(false));
    }
  }, [isOpen, form.branchId]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!form.deviceId) {
      alert('Vui lòng chọn thiết bị');
      return;
    }

    try {
      setSubmitting(true);
      const isUrgent = priority === 'urgent';
      await equipmentApi.createSchedule({
        equipmentId: form.deviceId,
        branchId: form.branchId || undefined,
        actionType: form.actionType,
        scheduledAt: `${form.scheduledDate}T${form.scheduledTime}:00Z`,
        scheduledTime: form.scheduledTime,
        findings: form.findings || `${form.actionType} theo kế hoạch`,
        isUrgent,
      });

      if (onConfirm) onConfirm();
      onClose();
    } catch (err) {
      console.error('Lỗi khi lên lịch bảo dưỡng:', err);
      alert('Không thể tạo lịch bảo dưỡng. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'} rounded-xl flex items-center justify-center shrink-0`}>
              {priority === 'urgent' ? <Wrench className="w-5 h-5" /> : <CalendarCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {modalTitle || (priority === 'urgent' ? 'Báo Sự Cố & Tạo Lệnh Kỹ Thuật Khẩn Cấp' : 'Lên Lịch Bảo Dưỡng & Kiểm Định Thiết Bị Mới')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {priority === 'urgent' ? 'Gửi yêu cầu can thiệp khẩn cấp và cảnh báo đến bộ phận kỹ thuật thiết bị' : 'Thiết lập kế hoạch bảo trì định kỳ lưu trực tiếp vào cơ sở dữ liệu và tự động đồng bộ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Row 1: Chi nhánh + Ngày thực hiện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cơ sở phòng khám <span className="text-red-500">*</span>
              </label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-sky-400"
              >
                <option value="">Tất cả cơ sở</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ngày thực hiện <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          {/* Chọn thiết bị thật từ database */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chọn thiết bị máy móc <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ClipboardList className="w-4 h-4" />
              </div>
              <select
                value={form.deviceId}
                onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                className="w-full pl-9 pr-8 py-2.5 text-xs border border-slate-200 rounded-xl bg-white appearance-none focus:outline-none focus:border-sky-400"
              >
                {loadingDevices ? (
                  <option value="">Đang tải danh sách thiết bị...</option>
                ) : deviceList.length === 0 ? (
                  <option value="">Không có thiết bị khả dụng</option>
                ) : (
                  deviceList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code}: {d.name} ({d.location || 'Khu điều trị'})
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▾</div>
            </div>
          </div>

          {/* Loại hình bảo dưỡng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Loại hình bảo dưỡng</label>
            <div className="space-y-2">
              {[
                { value: 'BẢO TRÌ ĐỊNH KỲ', label: 'Bảo trì định kỳ (Hàng tháng / Quý)', Icon: Wrench, iconColor: 'text-sky-600' },
                { value: 'KHỬ TRÙNG & TEST VI SINH', label: 'Khử trùng buồng máy & Test vi sinh chuyên sâu', Icon: Flame, iconColor: 'text-teal-600' },
                { value: 'XỬ LÝ SỰ CỐ / THAY LỌC', label: 'Sửa chữa / Xử lý cảnh báo sự cố kỹ thuật', Icon: Zap, iconColor: 'text-red-500' },
              ].map(({ value, label, Icon, iconColor }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    form.actionType === value
                      ? 'border-sky-400 bg-sky-50/70 ring-1 ring-sky-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="actionType"
                    value={value}
                    checked={form.actionType === value}
                    onChange={() => setForm({ ...form, actionType: value })}
                    className="accent-sky-600"
                  />
                  <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
                  <span className="text-xs font-semibold text-slate-800">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mức độ ưu tiên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Mức độ ưu tiên</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  priority === 'normal'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                Bình thường
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  priority === 'high'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'text-slate-600 border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                Ưu tiên cao
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                  priority === 'urgent'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                }`}
              >
                Khẩn cấp (Cảnh báo AI)
              </button>
            </div>
          </div>

          {/* Kỹ thuật viên & Nội dung chi tiết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kỹ thuật viên phụ trách <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.technician}
                onChange={(e) => setForm({ ...form, technician: e.target.value })}
                placeholder="KTV. Hoàng Minh"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dự toán chi phí (VNĐ)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  value={form.estimatedCost}
                  onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú phát hiện / Nội dung bảo trì
            </label>
            <textarea
              rows={2}
              value={form.findings}
              onChange={(e) => setForm({ ...form, findings: e.target.value })}
              placeholder="Nhập ghi chú yêu cầu kiểm tra, thay bộ lọc hoặc bảo dưỡng linh kiện..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Auto-lock toggle */}
          <div className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
            <button
              type="button"
              onClick={() => setForm({ ...form, autoLockChair: !form.autoLockChair })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 cursor-pointer ${
                form.autoLockChair ? 'bg-sky-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.autoLockChair ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
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
              <span className="font-bold">Gợi ý từ AI:</span> Tần suất kiểm tra định kỳ 2-4 tuần/lần giúp hệ thống thiết bị phòng khám luôn vận hành ổn định và đạt chuẩn chứng nhận ISO y tế vô trùng.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-center cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CalendarCheck className="w-4 h-4" />
            )}
            XÁC NHẬN LÊN LỊCH BẢO DƯỠNG
          </button>
        </div>
      </div>
    </div>
  );
};
