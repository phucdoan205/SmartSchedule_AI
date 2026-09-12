import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Camera,
  Trash2,
  Calendar,
  ChevronDown,
  Check,
  Clock,
  Utensils,
  Globe,
  Lock,
  Unlock,
  Save,
  Plus,
  Pencil,
  CheckCircle2,
} from 'lucide-react';

export interface DoctorEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: {
    id: string;
    code: string;
    name: string;
    phone?: string;
    email?: string;
    avatar?: string;
    initials?: string;
    specialty?: string;
    branch?: string;
    role?: string;
    department?: string;
    status?: string;
    commissionRate?: number;
    joinedDate?: string;
    title?: string;
    bio?: string;
    services?: string[];
  };
  onSave?: (updatedDoctor: any) => void;
}

const AVAILABLE_SERVICES = [
  'Sứ toàn phần Cercon (Đức)',
  'Sứ toàn phần Emax',
  'Mặt dán Veneer Emax',
  'Cấy ghép Implant Straumann',
  'Niềng răng trong suốt Invisalign',
  'Tẩy trắng răng Laser Whitening',
  'Nhổ răng khôn không đau Piezotome',
  'Điều trị tủy công nghệ vi phẫu',
];

export const DoctorEditModal: React.FC<DoctorEditModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states initialized with doctor or default values
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(doctor.avatar);
  const [code] = useState(doctor.code || 'NV001');
  const [name, setName] = useState(doctor.name || 'BS. Nguyễn Thị An');
  const [title, setTitle] = useState(doctor.title || 'Bác sĩ Chuyên khoa - Răng Hàm Mặt');
  const [phone, setPhone] = useState(doctor.phone || '090 123 4567');
  const [joinedDate, setJoinedDate] = useState(doctor.joinedDate || '12/05/2021');
  const [email, setEmail] = useState(doctor.email || 'bs.an@vietanhduc.vn');
  const [status, setStatus] = useState<'active' | 'leave' | 'resigned'>('active');

  const [branch, setBranch] = useState(doctor.branch || 'Chi nhánh Biên Hòa (Trụ sở chính)');
  const [specialty, setSpecialty] = useState(doctor.specialty || 'Phục hình Răng sứ thẩm mỹ');

  // Selected services
  const [services, setServices] = useState<string[]>([
    'Sứ toàn phần Cercon (Đức)',
    'Sứ toàn phần Emax',
    'Mặt dán Veneer Emax',
  ]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');

  // Commission & default working schedule
  const [commissionRate, setCommissionRate] = useState<number | string>(
    doctor.commissionRate !== undefined ? doctor.commissionRate : 15
  );
  const [workDays, setWorkDays] = useState<string[]>(['T2', 'T3', 'T4', 'T5', 'T6', 'T7']);
  const [workHours, setWorkHours] = useState('08:00 - 17:30');
  const [lunchBreak, setLunchBreak] = useState('12:00 - 13:30');
  const [isEditingHours, setIsEditingHours] = useState(false);

  // Bio
  const [bio, setBio] = useState(
    doctor.bio ||
      'Chuyên gia phục hình nụ cười với hơn 8 năm kinh nghiệm, tu nghiệp chuyên sâu về dán sứ Veneer bảo tồn men răng.'
  );

  // Online booking portal switch
  const [onlineBookingEnabled, setOnlineBookingEnabled] = useState(true);

  // Account locked status
  const [isLocked, setIsLocked] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  // Sync state whenever modal opens or doctor changes
  useEffect(() => {
    if (isOpen) {
      setAvatarPreview(doctor.avatar);
      setName(doctor.name || 'BS. Nguyễn Thị An');
      setTitle(doctor.title || 'Bác sĩ Chuyên khoa - Răng Hàm Mặt');
      setPhone(doctor.phone || '090 123 4567');
      setEmail(doctor.email || 'bs.an@vietanhduc.vn');
      setBranch(doctor.branch || 'Chi nhánh Biên Hòa (Trụ sở chính)');
      setSpecialty(doctor.specialty || 'Phục hình Răng sứ thẩm mỹ');
      setIsEditingHours(false);
      setIsAddingService(false);
      setShowToast(null);
    }
  }, [isOpen, doctor]);

  if (!isOpen) return null;

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Toggle work day (T2 - CN)
  const toggleWorkDay = (day: string) => {
    setWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle service
  const removeService = (srv: string) => {
    setServices((prev) => prev.filter((s) => s !== srv));
  };

  const addService = (srv: string) => {
    if (srv && !services.includes(srv)) {
      setServices((prev) => [...prev, srv]);
    }
    setCustomServiceName('');
    setIsAddingService(false);
  };

  // Handle Save
  const handleSave = () => {
    const updatedData = {
      ...doctor,
      name,
      title,
      phone,
      email,
      avatar: avatarPreview,
      branch,
      specialty,
      services,
      commissionRate: Number(commissionRate),
      joinedDate,
      status: isLocked ? 'Locked' : status === 'active' ? 'Active' : status === 'leave' ? 'On Leave' : 'Resigned',
      bio,
      workDays,
      workHours,
      lunchBreak,
      onlineBookingEnabled,
    };

    if (onSave) {
      onSave(updatedData);
    }

    setShowToast({ message: 'Cập nhật hồ sơ bác sĩ thành công!', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleToggleLock = () => {
    setIsLocked((prev) => !prev);
    setShowToast({
      message: !isLocked ? 'Đã khóa tài khoản bác sĩ!' : 'Đã mở khóa tài khoản bác sĩ!',
      type: 'warn',
    });
  };

  const ALL_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal
      >
        <div
          className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden relative border border-slate-100"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Toast Notification */}
          {showToast && (
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce transition-all ${
                showToast.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{showToast.message}</span>
            </div>
          )}

          {/* ─── Header ─────────────────────────────────────────────── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100/80 shadow-2xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Chỉnh Sửa Hồ Sơ Bác Sĩ &amp; Nhân Sự
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Cập nhật thông tin định danh, chuyên khoa điều trị, tỷ lệ hoa hồng và khung giờ làm việc chuẩn cho{' '}
                  <span className="font-bold text-slate-800">{doctor.name}</span>{' '}
                  <span className="text-sky-600 font-semibold">(#{code})</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ─── Body (2 Columns) ──────────────────────────────────── */}
          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* ════ LEFT COLUMN: Thông tin cá nhân & định danh (5 cols) ════ */}
              <div className="md:col-span-5 space-y-4">
                {/* Avatar Box */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative group">
                  <div className="relative mb-2.5">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt={name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-sky-100 text-sky-600 font-bold text-xl flex items-center justify-center border-2 border-white shadow-sm">
                        {doctor.initials || name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-sky-600 hover:scale-105 transition-all cursor-pointer"
                      title="Chỉnh sửa ảnh"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:text-sky-600 transition-colors cursor-pointer"
                    >
                      Thay đổi ảnh
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-rose-500 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                      title="Xóa ảnh đại diện"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Mã NV (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mã NV
                  </label>
                  <input
                    type="text"
                    value={code}
                    disabled
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-100/70 border border-slate-200/80 text-xs font-bold text-slate-600 cursor-not-allowed select-none"
                  />
                </div>

                {/* Họ và tên * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                    placeholder="BS. Nguyễn Thị An"
                  />
                </div>

                {/* Chức danh * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Chức danh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                    placeholder="Bác sĩ Chuyên khoa - Răng Hàm Mặt"
                  />
                </div>

                {/* SĐT * & Ngày gia nhập */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      SĐT <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                      placeholder="090 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ngày gia nhập
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={joinedDate}
                        onChange={(e) => setJoinedDate(e.target.value)}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                        placeholder="12/05/2021"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-300"
                    placeholder="bs.an@vietanhduc.vn"
                  />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Trạng thái
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      Đang hoạt động
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('leave')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        status === 'leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-300 shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tạm nghỉ phép
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatus('resigned')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        status === 'resigned'
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Đã nghỉ việc
                    </button>
                  </div>
                </div>
              </div>

              {/* ════ RIGHT COLUMN: Chuyên môn, Dịch vụ & Thiết lập (7 cols) ════ */}
              <div className="md:col-span-7 space-y-4">
                {/* Chi nhánh làm việc & Chuyên môn chính */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chi nhánh làm việc
                    </label>
                    <div className="relative">
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                      >
                        <option>Chi nhánh Biên Hòa (Trụ sở chính)</option>
                        <option>Cơ sở Quận 1 (Trung tâm)</option>
                        <option>Cơ sở Bình Dương</option>
                        <option>Cơ sở Quận 7</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chuyên môn chính
                    </label>
                    <div className="relative">
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 appearance-none focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
                      >
                        <option>Phục hình Răng sứ thẩm mỹ</option>
                        <option>Cấy ghép Implant Nha Khoa</option>
                        <option>Chỉnh nha - Niềng răng</option>
                        <option>Nha khoa tổng quát & Điều trị tủy</option>
                        <option>Phẫu thuật Tạo hình Hàm mặt</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Dịch vụ thực hiện */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-700">
                      Dịch vụ thực hiện
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingService((v) => !v)}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Thêm dịch vụ
                    </button>
                  </div>

                  {/* Add service drop-in */}
                  {isAddingService && (
                    <div className="mb-3 p-2.5 bg-white rounded-xl border border-sky-200 shadow-sm space-y-2">
                      <div className="text-[11px] font-bold text-slate-600">Chọn nhanh dịch vụ:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_SERVICES.filter((s) => !services.includes(s)).map((srv) => (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => addService(srv)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-700 transition-colors cursor-pointer"
                          >
                            + {srv}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <input
                          type="text"
                          value={customServiceName}
                          onChange={(e) => setCustomServiceName(e.target.value)}
                          placeholder="Hoặc nhập tên dịch vụ mới..."
                          className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-sky-400"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customServiceName.trim()) addService(customServiceName.trim());
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customServiceName.trim()) addService(customServiceName.trim());
                          }}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Thêm
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selected service tags */}
                  <div className="flex flex-wrap gap-2">
                    {services.map((srv) => (
                      <span
                        key={srv}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 shadow-2xs group hover:border-slate-300 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{srv}</span>
                        <button
                          type="button"
                          onClick={() => removeService(srv)}
                          className="text-slate-300 hover:text-rose-500 ml-0.5 transition-colors cursor-pointer"
                          title="Xóa dịch vụ"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {services.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Chưa chọn dịch vụ nào</span>
                    )}
                  </div>
                </div>

                {/* Hoa hồng (%) & Khung giờ làm việc (Mặc định) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  {/* Hoa hồng */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Hoa hồng (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        className="w-full px-3 py-2 pr-7 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 text-center focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                        placeholder="15"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Khung giờ làm việc */}
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Khung giờ làm việc (Mặc định)
                    </label>

                    {/* Day selector buttons: T2 - CN */}
                    <div className="flex items-center gap-1 mb-2">
                      {ALL_DAYS.map((day) => {
                        const isSelected = workDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleWorkDay(day)}
                            className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                            title={`Nhấp để ${isSelected ? 'bỏ chọn' : 'chọn'} ${day}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Work hours card */}
                    <div className="px-3 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600 font-medium">
                      {!isEditingHours ? (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-700">{workHours}</span>
                            <span className="text-slate-300">|</span>
                            <Utensils className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Nghỉ trưa: {lunchBreak}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsEditingHours(true)}
                            className="text-slate-400 hover:text-sky-600 transition-colors p-1 cursor-pointer"
                            title="Sửa khung giờ"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={workHours}
                            onChange={(e) => setWorkHours(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs w-28 bg-white"
                            placeholder="08:00 - 17:30"
                          />
                          <span className="text-slate-300">|</span>
                          <input
                            type="text"
                            value={lunchBreak}
                            onChange={(e) => setLunchBreak(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs w-28 bg-white"
                            placeholder="12:00 - 13:30"
                          />
                          <button
                            type="button"
                            onClick={() => setIsEditingHours(false)}
                            className="ml-auto px-2 py-0.5 bg-sky-600 text-white rounded text-[11px] font-bold"
                          >
                            Xong
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tiểu sử chuyên môn (Bio) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tiểu sử chuyên môn (Bio)
                    </label>
                  </div>
                  <div className="relative">
                    <textarea
                      value={bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setBio(e.target.value);
                        }
                      }}
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none leading-relaxed placeholder:text-slate-300"
                      placeholder="Mô tả quá trình đào tạo, chuyên sâu và kinh nghiệm điều trị..."
                    />
                    <div className="text-right text-[11px] text-slate-400 mt-1 font-medium select-none">
                      {bio.length}/500 ký tự
                    </div>
                  </div>
                </div>

                {/* Cổng Đặt lịch trực tuyến */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Cổng Đặt lịch trực tuyến
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Cho phép khách hàng chọn {doctor.name.split(' ').slice(-2).join(' ')} trên website/app đặt lịch
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setOnlineBookingEnabled((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                      onlineBookingEnabled ? 'bg-sky-600' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        onlineBookingEnabled ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Footer ─────────────────────────────────────────────── */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {/* Khóa tài khoản bác sĩ button */}
              <button
                type="button"
                onClick={handleToggleLock}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isLocked
                    ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                    : 'text-rose-600 hover:bg-rose-50 border-transparent hover:border-rose-200'
                }`}
              >
                {isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mở khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Khóa tài khoản bác sĩ</span>
                  </>
                )}
              </button>

              {/* Primary action: CẬP NHẬT HỒ SƠ */}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>CẬP NHẬT HỒ SƠ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);  }
        }
      `}</style>
    </>
  );
};
