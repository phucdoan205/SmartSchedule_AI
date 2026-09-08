import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  AlertTriangle,
  RefreshCw,
  Save,
  Trash2,
  Shield,
  ChevronDown,
  FileText,
} from 'lucide-react';

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: {
    id: string;
    name: string;
    phone: string;
    email: string;
    gender: string;
    dob: string;
    age: number;
    address: string;
    doctor: string;
    treatment: string;
    aiTrust: number;
  };
}

/* ── helpers ─────────────────────────────────────────────────────────────── */
const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
    {text}
    {required && <span className="text-rose-500 ml-0.5"> *</span>}
  </label>
);

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all placeholder:text-slate-300';

const selectCls =
  'w-full px-3 py-2.5 pr-8 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer';

/* ── Component ───────────────────────────────────────────────────────────── */
export const PatientEditModal: React.FC<PatientEditModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncToggle, setSyncToggle] = useState(true);

  const [form, setForm] = useState({
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    dob: patient.dob,
    gender: patient.gender === 'Nam' ? 'male' : 'female',
    address: patient.address,
    memberTier: 'Khách hàng VIP (1.250 đ',
    treatmentStatus: patient.treatment,
    assignedDoctor: patient.doctor,
    bloodType: 'O+',
    allergy: 'Dị ứng thuốc tê nhóm Procaine / Cần trọng khi kê đơn',
    medicalHistory: ['bp', 'heart'] as string[],
    notes:
      'Bệnh nhân kỹ tính, ưu tiên sắp xếp lịch hẹn vào buổi sáng các ngày trong tuần',
  });

  const medicalOptions = [
    { id: 'bp', label: 'Huyết áp ổn định' },
    { id: 'heart', label: 'Không mắc bệnh tim mạch' },
    { id: 'diabetes', label: 'Tiểu đường nhẹ' },
    { id: 'thyroid', label: 'Rối loạn tuyến giáp' },
  ];

  const toggleMedical = (id: string) =>
    setForm((f) => ({
      ...f,
      medicalHistory: f.medicalHistory.includes(id)
        ? f.medicalHistory.filter((x) => x !== id)
        : [...f.medicalHistory, id],
    }));

  const set =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-edit-title"
      >
        <div
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'patientModalIn 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                <FileText className="w-[18px] h-[18px] text-sky-600" />
              </div>
              <div>
                <h2
                  id="patient-edit-title"
                  className="text-base font-black text-slate-900 leading-tight"
                >
                  Chỉnh Sửa Hồ Sơ Bệnh Nhân
                </h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Cập nhật thông tin liên hệ, tiền sử dùng thuốc và trạng thái
                  phân loại thành viên cho bệnh nhân{' '}
                  <span className="font-bold text-slate-600">{patient.name}</span>{' '}
                  <span className="font-bold text-sky-500">(#{patient.id})</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <div className="grid grid-cols-2 gap-6">
              {/* ── LEFT: Thông tin cá nhân ── */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1 border-b border-slate-100">
                  Thông tin cá nhân
                </p>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden border-4 border-white shadow-md">
                      <img
                        src="https://i.pravatar.cc/100?u=patient"
                        alt={patient.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    Đổi ảnh đại diện
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Patient code (read-only) */}
                <div>
                  <Label text="Mã bệnh nhân" />
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-500 select-none">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {patient.id}
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <Label text="Họ và tên" required />
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    className={inputCls}
                    placeholder="Họ và tên đầy đủ"
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label text="Số điện thoại" required />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    className={inputCls}
                    placeholder="090 123 4567"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label text="Email" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    className={inputCls}
                    placeholder="email@example.com"
                  />
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label text="Ngày sinh" />
                    <input
                      type="date"
                      value={form.dob}
                      onChange={set('dob')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <Label text="Giới tính" />
                    <div className="flex gap-2">
                      {(['male', 'female'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, gender: g }))}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            form.gender === g
                              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                              : 'bg-white text-slate-500 border-slate-200 hover:border-sky-300'
                          }`}
                        >
                          {g === 'male' ? 'Nam' : 'Nữ'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Label text="Địa chỉ liên hệ" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={set('address')}
                    className={inputCls}
                    placeholder="Phường, Quận, Thành phố"
                  />
                </div>
              </div>

              {/* ── RIGHT: Hồ sơ điều trị & phân loại ── */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pb-1 border-b border-slate-100">
                  Hồ sơ điều trị & phân loại
                </p>

                {/* Member tier + Treatment status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label text="Hạng thành viên" />
                    <div className="relative">
                      <select
                        value={form.memberTier}
                        onChange={set('memberTier')}
                        className={selectCls}
                      >
                        <option>Khách hàng VIP (1.250 đ</option>
                        <option>Khách hàng thân thiết</option>
                        <option>Khách hàng mới</option>
                        <option>Khách hàng cao cấp</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label text="Trạng thái điều trị" />
                    <div className="relative">
                      <select
                        value={form.treatmentStatus}
                        onChange={set('treatmentStatus')}
                        className={selectCls}
                      >
                        <option>Đang cấy Implant</option>
                        <option>Đang điều trị</option>
                        <option>Hoàn thành điều trị</option>
                        <option>Tái khám định kỳ</option>
                        <option>Chờ phẫu thuật</option>
                        <option>Dừng điều trị</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Assigned doctor + Blood type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label text="Bác sĩ phụ trách" />
                    <div className="relative">
                      <select
                        value={form.assignedDoctor}
                        onChange={set('assignedDoctor')}
                        className={selectCls}
                      >
                        <option>Dr. Lê Văn Hùng</option>
                        <option>TS.BS. Nguyễn Minh Anh</option>
                        <option>BS. CKII. Trần Thu Hương</option>
                        <option>BS. Phạm Quốc Huy</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <Label text="Nhóm máu" />
                    <div className="relative">
                      <select
                        value={form.bloodType}
                        onChange={set('bloodType')}
                        className={selectCls}
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                          (b) => (
                            <option key={b}>{b}</option>
                          )
                        )}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Allergy warning */}
                <div>
                  <Label text="Cảnh báo dị ứng" />
                  <div className="relative rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-[11px] font-bold text-amber-600">
                        Cảnh báo dị ứng
                      </span>
                    </div>
                    <textarea
                      value={form.allergy}
                      onChange={set('allergy')}
                      rows={2}
                      className="w-full px-3 pb-2.5 bg-transparent text-sm font-medium text-amber-900 focus:outline-none resize-none placeholder:text-amber-300"
                      placeholder="Dị ứng / chống chỉ định thuốc..."
                    />
                  </div>
                </div>

                {/* Medical history */}
                <div>
                  <Label text="Tiền sử bệnh lý (Nội khoa)" />
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-3">
                    {medicalOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => toggleMedical(opt.id)}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                            form.medicalHistory.includes(opt.id)
                              ? 'bg-sky-600 border-sky-600'
                              : 'border-slate-300 group-hover:border-sky-400'
                          }`}
                        >
                          {form.medicalHistory.includes(opt.id) && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M2 5l2.5 2.5L8 3"
                                stroke="currentColor"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs font-medium text-slate-600 select-none">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clinical notes */}
                <div>
                  <Label text="Ghi chú lâm sàng / CSKH" />
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition-all resize-none placeholder:text-slate-300"
                    placeholder="Ghi chú lâm sàng, chăm sóc khách hàng..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Sync Banner ── */}
          <div className="mx-6 mb-1 flex items-center justify-between gap-3 px-4 py-3 bg-sky-50 border border-sky-100 rounded-xl shrink-0">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-sky-500 shrink-0" />
              <span className="text-[11px] font-semibold text-sky-700">
                Tự động đồng bộ thông tin mới sang ứng dụng tra cứu lịch sử của bệnh nhân
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSyncToggle((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${
                syncToggle ? 'bg-sky-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                  syncToggle ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa / Lưu trữ hồ sơ
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes patientModalIn {
          from { opacity: 0; transform: scale(0.94) translateY(14px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>
  );
};
