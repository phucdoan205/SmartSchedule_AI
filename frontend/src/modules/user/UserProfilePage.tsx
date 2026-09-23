import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  FileText,
  Activity,
  Stethoscope,
  ChevronRight,
  Edit3,
  Save,
  X,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { RatingModal } from './modals/RatingModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { authApi, appointmentsApi, uploadApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const UserProfilePage: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('info');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState('TS.BS. Nguyễn Minh Anh');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Standard working days and self-schedule permission
  const [allowSelfSchedule, setAllowSelfSchedule] = useState<boolean>(() => {
    const saved = localStorage.getItem('user_allow_self_schedule');
    return saved !== null ? saved === 'true' : true;
  });
  const [standardWorkDays, setStandardWorkDays] = useState<string[]>(['T2', 'T3', 'T4', 'T5', 'T6', 'T7']);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthYear: 1995,
    gender: 'Nam',
    address: '',
    medicalAlerts: '',
    avatarUrl: '',
  });

  // Appointments state
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Helper to extract address & alerts from medicalAlerts string
  const parseAlertsAndAddress = (alertsStr?: string) => {
    if (!alertsStr) return { address: '', alerts: '' };
    if (alertsStr.includes(' | ')) {
      const parts = alertsStr.split(' | ');
      return { address: parts[0] || '', alerts: parts.slice(1).join(' | ') };
    }
    return { address: alertsStr, alerts: '' };
  };

  // Sync form data with current user
  useEffect(() => {
    if (user) {
      const { address, alerts } = parseAlertsAndAddress(user.patient?.medicalAlerts);
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || '',
        birthYear: user.patient?.birthYear || 1995,
        gender: user.patient?.gender || 'Nam',
        address: address || '',
        medicalAlerts: alerts || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  // Load user's real appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      try {
        setIsLoadingAppointments(true);
        const all = await appointmentsApi.getAll();
        const matched = all.filter((a: any) => {
          const matchPhone = user.phone && a.patient?.phone === user.phone;
          const matchCode = user.patient?.patientCode && a.patient?.patientCode === user.patient.patientCode;
          const matchEmail = user.email && a.patient?.email === user.email;
          return matchPhone || matchCode || matchEmail;
        });
        setUserAppointments(matched);
      } catch (err) {
        console.error('Không thể tải lịch hẹn của bệnh nhân:', err);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const tabs: TabItem[] = [
    { id: 'info', label: 'Thông Tin Cá Nhân' },
    { id: 'history', label: 'Lịch Sử Khám Bệnh' },
    { id: 'dental', label: 'Sơ Đồ Răng Điện Tử (EMR)' },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'BN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const openRating = (docName: string) => {
    setSelectedDocName(docName);
    setIsRatingModalOpen(true);
  };

  // Handle Avatar file upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const res = await uploadApi.uploadImage(file, 'patients');
      if (res?.url) {
        setFormData((prev) => ({ ...prev, avatarUrl: res.url }));
        // If not in editing mode, immediately update profile
        if (!isEditing && user) {
          const updated = await authApi.updateProfile({ avatarUrl: res.url });
          updateUser(updated);
          showToast('Cập nhật ảnh đại diện thành công!', 'success');
        } else {
          showToast('Đã tải ảnh lên! Hãy bấm Lưu Thay Đổi để hoàn tất.', 'info');
        }
      }
    } catch (err: any) {
      showToast('Tải ảnh đại diện thất bại: ' + (err.message || 'Lỗi kết nối'), 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      showToast('Vui lòng nhập đầy đủ Họ tên và Số điện thoại', 'error');
      return;
    }

    try {
      setIsSaving(true);
      const updatedUser = await authApi.updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        avatarUrl: formData.avatarUrl.trim() || undefined,
        birthYear: Number(formData.birthYear),
        gender: formData.gender,
        address: formData.address.trim(),
        medicalAlerts: formData.medicalAlerts.trim(),
      });

      updateUser(updatedUser);

      // Persist self schedule preference
      localStorage.setItem('user_allow_self_schedule', String(allowSelfSchedule));

      // Broadcast sync event so admin staff view updates in real-time
      try {
        const channel = new BroadcastChannel('smartschedule_sync');
        channel.postMessage({
          type: 'STAFF_UPDATED',
          userId: user?.id,
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          avatarUrl: formData.avatarUrl.trim() || undefined,
          allowSelfSchedule,
        });
        channel.close();
      } catch (e) {
        // BroadcastChannel fallback
      }

      setIsEditing(false);
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Cập nhật thất bại';
      showToast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // If not logged in
  if (!isAuthenticated && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto border border-sky-100 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Vui lòng đăng nhập</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Bạn cần đăng nhập vào tài khoản bệnh nhân để xem và quản lý hồ sơ cá nhân, lịch sử khám và sơ đồ răng.
        </p>
        <button
          type="button"
          onClick={() => navigate('/auth/login')}
          className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          Đăng Nhập Ngay
        </button>
      </div>
    );
  }

  const { address: currentAddress, alerts: currentAlerts } = parseAlertsAndAddress(user?.patient?.medicalAlerts);
  const patientCode = user?.patient?.patientCode || user?.employeeCode || `BN-${user?.id?.slice(0, 6).toUpperCase()}`;
  const completedCount = userAppointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Profile Header Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-100/40 via-teal-50/30 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        {/* Avatar with dynamic photo/initials and quick upload button */}
        <div className="relative group shrink-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-sky-100"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-md ring-2 ring-sky-100 tracking-wider">
              {getInitials(user?.fullName)}
            </div>
          )}

          {/* Quick Change Avatar Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            title="Đổi ảnh đại diện"
            className="absolute bottom-0 right-0 p-2 bg-slate-900/80 hover:bg-sky-600 text-white rounded-full shadow-lg border-2 border-white transition-all cursor-pointer group-hover:scale-110"
          >
            {isUploadingAvatar ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* User Key Information */}
        <div className="space-y-1.5 text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {user?.fullName || 'Bệnh Nhân'}
            </h1>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-600" />
              Bệnh Nhân Thân Thiết (VIP)
            </span>
          </div>

          <p className="text-xs text-slate-600 font-medium flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <span>
              Mã bệnh nhân: <strong className="text-slate-900 font-bold">{patientCode}</strong>
            </span>
            <span>•</span>
            <span>
              SĐT: <strong className="text-slate-900 font-bold">{user?.phone || 'Chưa cập nhật'}</strong>
            </span>
          </p>

          <p className="text-[11px] text-slate-500 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1">
            <span>
              Email: <strong className="text-slate-700 font-semibold">{user?.email || 'Chưa liên kết'}</strong>
            </span>
            <span>•</span>
            <span>
              Địa chỉ: <strong className="text-slate-700 font-semibold">{currentAddress || 'TP. Hồ Chí Minh'}</strong>
            </span>
          </p>

          {/* Quick Edit Profile Button */}
          <div className="pt-2 flex justify-center md:justify-start">
            <button
              type="button"
              onClick={() => {
                setActiveTab('info');
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Chỉnh Sửa Hồ Sơ</span>
            </button>
          </div>
        </div>

        {/* Stats on the right */}
        <div className="flex justify-center gap-6 sm:gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8 text-center text-xs w-full md:w-auto shrink-0">
          <div>
            <p className="text-xl sm:text-2xl font-black text-sky-600">
              {completedCount > 0 ? `${completedCount} ca` : '0 ca'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">Đã khám thành công</p>
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black text-teal-600">100%</p>
            <p className="text-[10px] text-slate-400 font-medium">Đúng giờ hẹn AI</p>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: THÔNG TIN CÁ NHÂN (INFO) */}
      {activeTab === 'info' && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-sky-600" />
                Hồ Sơ & Thông Tin Cá Nhân
              </h3>
              <p className="text-xs text-slate-500">
                Thông tin được đồng bộ tự động từ tài khoản của bạn và có thể chỉnh sửa bất kỳ lúc nào.
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh Sửa Thông Tin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hủy Chỉnh Sửa</span>
              </button>
            )}
          </div>

          {/* VIEW MODE */}
          {!isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên:
                </p>
                <p className="font-bold text-slate-900 text-sm">{user?.fullName || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại:
                </p>
                <p className="font-bold text-slate-900 text-sm">{user?.phone || 'Chưa cập nhật'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ Email:
                </p>
                <p className="font-bold text-slate-900 text-sm">{user?.email || 'Chưa liên kết'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Năm sinh:
                </p>
                <p className="font-bold text-slate-900 text-sm">{user?.patient?.birthYear || '1995'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Giới tính:
                </p>
                <p className="font-bold text-slate-900 text-sm">{user?.patient?.gender || 'Nam'}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Mã hồ sơ bệnh nhân:
                </p>
                <p className="font-bold text-sky-700 text-sm">{patientCode}</p>
              </div>

              <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1 sm:col-span-2 lg:col-span-3">
                <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ thường trú / Liên hệ:
                </p>
                <p className="font-bold text-slate-900 text-sm">{currentAddress || 'Chưa cập nhật địa chỉ'}</p>
              </div>

              {currentAlerts && (
                <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1 sm:col-span-2 lg:col-span-3">
                  <p className="text-amber-700 font-bold text-[11px] flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-600" /> Tiền sử y tế / Dị ứng thuốc:
                  </p>
                  <p className="font-semibold text-amber-900 text-xs">{currentAlerts}</p>
                </div>
              )}

              {/* Khung ngày làm việc tiêu chuẩn */}
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3 sm:col-span-2 lg:col-span-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <h4 className="font-extrabold text-slate-900 text-xs">
                      Khung ngày làm việc tiêu chuẩn &amp; Phân ca
                    </h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      allowSelfSchedule
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {allowSelfSchedule
                      ? '✓ Cho phép tự chọn lịch làm việc'
                      : '🔒 Lịch làm việc do phòng khám ấn định (Không tự chọn)'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                    <span
                      key={d}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        standardWorkDays.includes(d)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {d}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-400">
                    CN: OFF
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold text-sky-800 bg-sky-100 border border-sky-200">
                    Sáng: 08:00 - 12:00
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold text-sky-800 bg-sky-100 border border-sky-200">
                    Chiều: 13:30 - 17:30
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    (Nghỉ trưa: 12:00 - 13:30)
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE FORM */
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Họ tên */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên bệnh nhân <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="VD: Lê Trọng Phúc"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="VD: 0912345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="VD: user@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Năm sinh */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Năm sinh
                  </label>
                  <input
                    type="number"
                    min="1930"
                    max={new Date().getFullYear()}
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Giới tính */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Ảnh đại diện */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-slate-400" /> Ảnh đại diện
                  </label>
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-slate-200 bg-white min-h-[42px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {formData.avatarUrl ? (
                        <img
                          src={formData.avatarUrl}
                          alt="Avatar"
                          className="w-7 h-7 rounded-full object-cover border border-sky-300 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          {getInitials(formData.fullName)}
                        </div>
                      )}
                      <span className="text-[11px] text-slate-600 truncate font-medium">
                        {formData.avatarUrl ? 'Đã cài đặt ảnh đại diện' : 'Chưa có ảnh đại diện'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] rounded-lg border border-sky-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                          <span>Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-sky-600" />
                          <span>Chọn ảnh từ máy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ liên hệ / Nơi ở hiện tại
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Tiền sử bệnh */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-500" /> Tiền sử y tế / Ghi chú dị ứng thuốc (Nếu có)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.medicalAlerts}
                    onChange={(e) => setFormData({ ...formData, medicalAlerts: e.target.value })}
                    placeholder="VD: Tiền sử cao huyết áp, dị ứng thuốc gây tê Lidocaine, bệnh tim mạch..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* Khung ngày làm việc tiêu chuẩn & Tùy chọn tự chọn lịch */}
                <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-600" /> Khung ngày làm việc tiêu chuẩn &amp; Tùy chọn tự chọn ca
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 font-medium">
                      Chọn các ngày làm việc tiêu chuẩn trong tuần (Mặc định: Ca sáng 08:00 - 12:00, Ca chiều 13:30 - 17:30):
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => {
                        const isSelected = standardWorkDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setStandardWorkDays((prev) =>
                                prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle: Cho phép hoặc không cho phép tự chọn lịch làm việc */}
                  <div className="pt-2 border-t border-sky-100/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        Cho phép tự đăng ký &amp; chọn lịch làm việc
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Khi bật: Cho phép nhân viên/bác sĩ tự đăng ký hoặc điều chỉnh ca làm việc trong tuần. Khi tắt: Cố định theo chỉ định của phòng khám.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAllowSelfSchedule(!allowSelfSchedule)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                        allowSelfSchedule ? 'bg-sky-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                          allowSelfSchedule ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang Lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Lưu Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: LỊCH SỬ KHÁM BỆNH (HISTORY) */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Lịch Sử Các Ca Khám & Điều Trị:</h3>
            <span className="text-xs text-slate-500">
              Tổng số: <strong>{userAppointments.length}</strong> ca hẹn
            </span>
          </div>

          {isLoadingAppointments ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Đang tải lịch sử khám bệnh...</p>
            </div>
          ) : userAppointments.length === 0 ? (
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto border border-sky-100 shadow-2xs">
                <Calendar className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-slate-900">Chưa có lịch sử khám bệnh</h4>
                <p className="text-xs text-slate-500">
                  Bạn chưa có ca khám nào tại hệ thống SmartSchedule. Hãy đặt lịch hẹn để trải nghiệm công nghệ điều trị không đau và đúng giờ 100%!
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt Lịch Khám Ngay (AI)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userAppointments.map((item: any) => (
                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200/80">
                        {item.appointmentCode || item.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.services?.[0]?.service?.name || 'Khám Nha Khoa Toàn Diện'}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <StatusBadge status={item.status as any} />
                      {item.status === 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => openRating(item.doctor?.fullName || 'Bác sĩ điều trị')}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Đánh Giá Ca Khám
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 text-[11px]">Bác sĩ phụ trách:</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {item.doctor?.fullName || 'Bác sĩ chuyên khoa SmartSchedule'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Ngày khám & Cơ sở:</p>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {new Date(item.startTime).toLocaleDateString('vi-VN')} • {item.branch?.name || 'Chi nhánh Quận 1'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Mã QR check-in:</p>
                      <p className="font-extrabold text-teal-600 mt-0.5 tracking-wider">
                        {item.qrPassCode || 'Đã check-in'}
                      </p>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                      <strong>Ghi chú / Chẩn đoán:</strong> {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SƠ ĐỒ RĂNG ĐIỆN TỬ (DENTAL EMR) */}
      {activeTab === 'dental' && (
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Sơ Đồ Răng Điện Tử Bệnh Nhân (Dental EMR Chart)
            </h3>
            <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Mã hồ sơ: {patientCode}
            </span>
          </div>

          <div className="p-8 bg-slate-50/70 rounded-2xl text-center space-y-3 border border-slate-200">
            <Activity className="w-12 h-12 text-sky-600 mx-auto animate-pulse" />
            <p className="font-bold text-slate-800 text-sm">
              Sơ đồ 32 răng hàm của bệnh nhân: <strong className="text-sky-700">{user?.fullName}</strong>
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hệ thống EMR lưu trữ tự động mọi thao tác điều trị (nhổ, trám, phục hình sứ, cấy ghép Implant) được đồng bộ thời gian thực với bác sĩ điều trị.
            </p>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        doctorName={selectedDocName}
      />
    </div>
  );
};
