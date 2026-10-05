import React, { useState, useEffect } from 'react';
import { X, Edit3, Wrench, MapPin, User, Building2, Tag, Loader2, Calendar, AlertTriangle } from 'lucide-react';
import { equipmentApi, staffApi, branchesApi } from '../../services/api';
import { toast } from '../../context/ToastContext';

interface EditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  device: any;
}

export const EditEquipmentModal: React.FC<EditEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  device,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('dental_chair');
  const [location, setLocation] = useState('');
  const [branchId, setBranchId] = useState('');
  const [technician, setTechnician] = useState('');
  const [status, setStatus] = useState('OPERATIONAL');
  const [urgencyAlert, setUrgencyAlert] = useState('');
  const [nextInspectionAt, setNextInspectionAt] = useState('');

  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);

  useEffect(() => {
    if (!device) return;
    setName(device.name || '');
    setCode(device.code || '');
    setSerialNumber(device.serialNumber || '');
    setCategory(device.category || 'dental_chair');
    setLocation(device.location || '');
    setBranchId(device.branchId || '');
    setTechnician(device.technician || 'KTV. Hoàng Minh');
    setStatus(device.status || 'OPERATIONAL');
    setUrgencyAlert(device.urgencyAlert || '');
    if (device.nextInspectionAt) {
      setNextInspectionAt(new Date(device.nextInspectionAt).toISOString().split('T')[0]);
    } else {
      setNextInspectionAt(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }
  }, [device, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchMetadata = async () => {
      try {
        setIsLoadingMeta(true);
        const [staffRes, branchRes] = await Promise.all([
          staffApi.getAllStaff().catch(() => []),
          branchesApi.getAll().catch(() => []),
        ]);
        if (Array.isArray(staffRes)) {
          setStaffList(staffRes);
        }
        if (Array.isArray(branchRes)) {
          setBranches(branchRes);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách nhân viên & chi nhánh:', err);
      } finally {
        setIsLoadingMeta(false);
      }
    };
    fetchMetadata();
  }, [isOpen]);

  if (!isOpen || !device) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Vui lòng nhập tên thiết bị', 'info');
      return;
    }

    try {
      setIsSubmitting(true);
      await equipmentApi.update(device.id, {
        name: name.trim(),
        code: code.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        category,
        location: location.trim() || undefined,
        branchId: branchId && branchId !== 'ALL' ? branchId : undefined,
        technician: technician || undefined,
        status,
        urgencyAlert: urgencyAlert.trim() ? urgencyAlert.trim() : null,
        nextInspectionAt: nextInspectionAt || undefined,
      });

      toast(`Cập nhật thiết bị ${device.code} thành công!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi cập nhật thiết bị:', err);
      toast(err.response?.data?.message || 'Không thể cập nhật thiết bị. Vui lòng thử lại.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                Chỉnh Sửa Thiết Bị: {device.code}
              </h3>
              <p className="text-xs text-slate-500">Cập nhật vị trí, trạng thái và người phụ trách</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên thiết bị y tế <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã thiết bị</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-bold text-sky-700 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-sky-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số Seri</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại thiết bị</label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50 appearance-none"
                >
                  <option value="dental_chair">Ghế khám &amp; Đèn mổ</option>
                  <option value="xray">Thiết bị X-quang</option>
                  <option value="hvac">Hệ thống vô trùng</option>
                  <option value="implant">Máy cấy ghép Implant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chi nhánh quản lý</label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50 appearance-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vị trí đặt máy</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Người phụ trách (Nhân viên database)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50 appearance-none"
                >
                  {isLoadingMeta ? (
                    <option>Đang tải nhân sự...</option>
                  ) : staffList.length === 0 ? (
                    <option value={technician}>{technician}</option>
                  ) : (
                    staffList.map((s) => (
                      <option key={s.id} value={s.fullName}>
                        {s.fullName} ({s.employeeCode})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái vận hành</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50"
              >
                <option value="OPERATIONAL">Đang hoạt động ổn định</option>
                <option value="UNDER_MAINTENANCE">Đang bảo trì</option>
                <option value="STERILIZING">Đạt chuẩn vô trùng</option>
                <option value="WARNING">Cần kiểm định / Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lịch kiểm định tiếp theo</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={nextInspectionAt}
                  onChange={(e) => setNextInspectionAt(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Cảnh báo sự cố / Ghi chú kỹ thuật AI
              </label>
              <input
                type="text"
                value={urgencyAlert}
                onChange={(e) => setUrgencyAlert(e.target.value)}
                placeholder="Để trống nếu máy hoạt động bình thường, hoặc ghi chú sự cố cần xử lý..."
                className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Lưu thay đổi thiết bị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
