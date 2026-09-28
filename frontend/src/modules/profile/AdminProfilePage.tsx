import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Building2,
  BadgeCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  CalendarDays,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Sun,
  Moon,
  Plane,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient, staffSchedulesApi } from '../../services/api';
import { toast } from '../../context/ToastContext';

// ─── Helpers ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN:    { label: 'Chủ phòng khám',       color: 'text-sky-700',     bg: 'bg-sky-50 border-sky-200' },
  ADMIN:          { label: 'Quản trị viên',         color: 'text-sky-700',     bg: 'bg-sky-50 border-sky-200' },
  DOCTOR:         { label: 'Bác sĩ chuyên khoa',    color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200' },
  RECEPTIONIST:   { label: 'Lễ tân phòng khám',     color: 'text-slate-700',   bg: 'bg-slate-100 border-slate-300' },
  NURSE:          { label: 'Điều dưỡng viên',       color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  TECHNICIAN:     { label: 'Kỹ thuật viên',         color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  BRANCH_MANAGER: { label: 'Quản lý chi nhánh',     color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200' },
  STAFF:          { label: 'Nhân viên',             color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-300' },
};

const AVATAR_GRADIENTS = [
  'from-sky-500 to-teal-400',
  'from-violet-500 to-indigo-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
];

function getGradient(name: string) {
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
  if (!name) return 'AD';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Tab type ────────────────────────────────────────────────────────────────

type Tab = 'info' | 'security' | 'schedule';

// ─── Component ───────────────────────────────────────────────────────────────

export const AdminProfilePage: React.FC = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state — prefilled from user
  const [form, setForm] = useState({
    fullName:  user?.fullName  || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
  });

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Hidden file input ref for avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Working shift selection state & permission (Req 3 & 4)
  const [allowSelfSchedule, setAllowSelfSchedule] = useState<boolean>(() => {
    if (!user) return true;
    const userKey = user.id || user.employeeCode || '';
    const fromStorage =
      localStorage.getItem(`staff_self_schedule_${userKey}`) ??
      localStorage.getItem(`staff_self_schedule_${user.employeeCode}`);
    if (fromStorage !== null) return fromStorage === 'true';
    const globalSelf = localStorage.getItem('user_allow_self_schedule');
    if (globalSelf !== null) return globalSelf === 'true';
    return true;
  });

  // Advance schedule offset: 0 = current week, 1 = next week
  const [profileWeekOffset, setProfileWeekOffset] = useState<number>(0);

  const getProfileMonday = (offset: number) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diff + offset * 7, 0, 0, 0, 0);
    return monday;
  };

  const profileDays = useMemo(() => {
    const monday = getProfileMonday(profileWeekOffset);
    const dayKeys = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const labels = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    return dayKeys.map((key, i) => {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateFull = `${year}-${month}-${day}`;
      const dateStr = `${day}/${month}`;
      return {
        dayKey: key,
        label: labels[i],
        dateFull,
        dateStr,
      };
    });
  }, [profileWeekOffset]);

  const profileDateRangeStr = profileDays.length === 7
    ? `${profileDays[0].dateStr} - ${profileDays[6].dateStr}/${profileDays[6].dateFull.slice(0, 4)}`
    : '';

  // Selected shifts for each day of the week
  const [weeklyShifts, setWeeklyShifts] = useState<Record<string, string>>({
    T2: 'fullday',
    T3: 'fullday',
    T4: 'fullday',
    T5: 'morning',
    T6: 'afternoon',
    T7: 'morning',
    CN: 'off',
  });

  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  // Fetch real schedules for user from backend
  const loadUserSchedules = async () => {
    if (!user?.id || profileDays.length === 0) return;
    try {
      const start = profileDays[0].dateFull;
      const end = profileDays[6].dateFull;
      const schedules = await staffSchedulesApi.getAll({
        userId: user.id,
        startDate: start,
        endDate: end,
      });

      const newShifts: Record<string, string> = {
        T2: 'off', T3: 'off', T4: 'off', T5: 'off', T6: 'off', T7: 'off', CN: 'off'
      };

      if (Array.isArray(schedules) && schedules.length > 0) {
        profileDays.forEach((pDay: any) => {
          const dayShifts = schedules.filter((s: any) => s.date?.split('T')[0] === pDay.dateFull);
          if (dayShifts.length > 0) {
            const hasMorning = dayShifts.some((s: any) => s.shiftType === 'morning');
            const hasAfternoon = dayShifts.some((s: any) => s.shiftType === 'afternoon');
            const hasFull = dayShifts.some((s: any) => s.shiftType === 'full_day' || s.shiftType === 'fullday');
            const hasOvertime = dayShifts.some((s: any) => s.shiftType === 'evening' || s.shiftType === 'overtime');
            const hasLeave = dayShifts.some((s: any) => s.isLeave || s.shiftType === 'leave');

            if (hasLeave) newShifts[pDay.dayKey] = 'leave';
            else if (hasFull || (hasMorning && hasAfternoon)) newShifts[pDay.dayKey] = 'fullday';
            else if (hasMorning) newShifts[pDay.dayKey] = 'morning';
            else if (hasAfternoon) newShifts[pDay.dayKey] = 'afternoon';
            else if (hasOvertime) newShifts[pDay.dayKey] = 'overtime';
          }
        });
        setWeeklyShifts(newShifts);
      } else {
        const saved = localStorage.getItem(`user_weekly_shifts_${user?.employeeCode}_${profileDays[0].dateFull}`);
        if (saved) {
          try { setWeeklyShifts(JSON.parse(saved)); return; } catch {}
        }
        setWeeklyShifts({
          T2: 'fullday', T3: 'fullday', T4: 'fullday', T5: 'morning', T6: 'afternoon', T7: 'morning', CN: 'off'
        });
      }
    } catch (err) {
      console.warn('Lỗi khi tải lịch nhân sự:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadUserSchedules();
    }
  }, [activeTab, profileWeekOffset, user?.id]);

  // Listen for broadcast sync of permission and schedule updates
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = (msg) => {
        if (msg.data?.type === 'STAFF_UPDATED') {
          const userKey = user?.id || user?.employeeCode || '';
          const fromStorage =
            localStorage.getItem(`staff_self_schedule_${userKey}`) ??
            localStorage.getItem(`staff_self_schedule_${user?.employeeCode}`);
          if (fromStorage !== null) {
            setAllowSelfSchedule(fromStorage === 'true');
          }
        }
        if (msg.data?.type === 'SCHEDULE_UPDATED') {
          loadUserSchedules();
        }
      };
    }
    return () => channel?.close();
  }, [user, profileDays]);

  const handleSaveWeeklyShifts = async () => {
    if (!user) return;
    if (!allowSelfSchedule) {
      toast('Quyền tự chọn ca của bạn hiện đang bị khóa bởi Quản lý phòng khám', 'error');
      return;
    }
    setIsSavingSchedule(true);
    try {
      const start = profileDays[0].dateFull;
      const end = profileDays[6].dateFull;
      const branchId = typeof user.branch === 'object' ? (user.branch as any)?.id : ((user as any).branchId || (user.branch as string));

      // 1. Clear current user shifts for this week
      await staffSchedulesApi.clearWeek({
        userId: user.id,
        startDate: start,
        endDate: end,
      });

      // 2. Create newly selected shifts
      const createPromises: Promise<any>[] = [];
      for (const pDay of profileDays) {
        const shift = weeklyShifts[pDay.dayKey];
        if (shift && shift !== 'off') {
          if (shift === 'fullday') {
            createPromises.push(
              staffSchedulesApi.create({
                userId: user.id,
                branchId,
                date: pDay.dateFull,
                shiftType: 'MORNING',
                startTime: '08:00',
                endTime: '12:00',
              }),
              staffSchedulesApi.create({
                userId: user.id,
                branchId,
                date: pDay.dateFull,
                shiftType: 'AFTERNOON',
                startTime: '13:30',
                endTime: '17:30',
              })
            );
          } else {
            createPromises.push(
              staffSchedulesApi.create({
                userId: user.id,
                branchId,
                date: pDay.dateFull,
                shiftType: shift === 'morning' ? 'MORNING' : shift === 'afternoon' ? 'AFTERNOON' : shift === 'overtime' ? 'OVERTIME' : 'LEAVE',
                startTime: shift === 'morning' ? '08:00' : shift === 'afternoon' ? '13:30' : shift === 'overtime' ? '18:00' : '00:00',
                endTime: shift === 'morning' ? '12:00' : shift === 'afternoon' ? '17:30' : shift === 'overtime' ? '20:30' : '23:59',
              })
            );
          }
        }
      }

      await Promise.all(createPromises);

      localStorage.setItem(`user_weekly_shifts_${user?.employeeCode}_${profileDays[0].dateFull}`, JSON.stringify(weeklyShifts));

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('smartschedule_sync');
        channel.postMessage({ type: 'SCHEDULE_UPDATED' });
        channel.close();
      }

      toast('Đã lưu đăng ký ca làm việc thành công! Hệ thống quản lý đã được đồng bộ.', 'success');
    } catch (err: any) {
      toast(err?.message || 'Có lỗi khi lưu ca làm việc', 'error');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải thông tin...
      </div>
    );
  }

  const displayName = user.fullName || 'Tài khoản hệ thống';
  const initials    = getInitials(displayName);
  const gradient    = getGradient(displayName);

  const roleKey   = user.roles?.[0] || 'STAFF';
  const roleMeta  = ROLE_LABEL[roleKey] || { label: roleKey, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-300' };

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditStart = () => {
    setForm({ fullName: user.fullName || '', email: user.email || '', phone: user.phone || '' });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleSaveInfo = async () => {
    if (!form.fullName.trim()) { toast('Họ tên không được để trống', 'error'); return; }
    setIsSaving(true);
    try {
      await apiClient.patch('/auth/profile', {
        fullName: form.fullName.trim(),
        email:    form.email.trim(),
        phone:    form.phone.trim(),
      });
      updateUser({ fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() });
      await refreshUser();
      setIsEditing(false);
      toast('Đã cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Có lỗi khi cập nhật thông tin', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current) { toast('Vui lòng nhập mật khẩu hiện tại', 'error'); return; }
    if (pwForm.next.length < 6) { toast('Mật khẩu mới tối thiểu 6 ký tự', 'error'); return; }
    if (pwForm.next !== pwForm.confirm) { toast('Xác nhận mật khẩu không khớp', 'error'); return; }
    setIsSavingPw(true);
    try {
      await apiClient.patch('/auth/profile', { currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwForm({ current: '', next: '', confirm: '' });
      toast('Đổi mật khẩu thành công!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Mật khẩu hiện tại không đúng', 'error');
    } finally {
      setIsSavingPw(false);
    }
  };

  // ── Avatar upload via Cloudinary (FormData → backend → Cloudinary → URL stored in DB) ────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      toast('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast('Ảnh đại diện tối đa 2 MB', 'error');
      return;
    }

    setIsUploadingAvatar(true);

    // Optimistic local preview while uploading
    const localPreview = URL.createObjectURL(file);
    updateUser({ avatarUrl: localPreview });

    try {
      // Send as multipart/form-data — backend uploads to Cloudinary, returns URL
      const formData = new FormData();
      formData.append('file', file);

      const res = await apiClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const cloudinaryUrl: string = res.data?.data?.url;
      if (!cloudinaryUrl) throw new Error('Không nhận được URL từ Cloudinary');

      // Replace local preview with real Cloudinary URL and sync to AuthContext
      updateUser({ avatarUrl: cloudinaryUrl });
      await refreshUser();
      toast('Đã cập nhật ảnh đại diện thành công!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Có lỗi khi tải ảnh lên', 'error');
      // Revert optimistic update on error
      updateUser({ avatarUrl: user?.avatarUrl });
    } finally {
      setIsUploadingAvatar(false);
      URL.revokeObjectURL(localPreview);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ─── Breadcrumb ─── */}
      <div>
        <span className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
          Hệ thống / Tài khoản
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
          Hồ sơ cá nhân
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Xem và chỉnh sửa thông tin tài khoản của bạn trong hệ thống SmartSchedule AI.
        </p>
      </div>

      {/* ─── Profile Hero Card ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className={`h-28 bg-gradient-to-r ${gradient} relative`}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
        </div>

        {/* Avatar + Basic Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12">
            {/* Avatar — shows uploaded image or initials fallback */}
            <div className="relative w-fit">
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />

              {/* Avatar display */}
              <div className={`w-24 h-24 rounded-2xl shadow-lg border-4 border-white overflow-hidden flex items-center justify-center bg-gradient-to-br ${gradient}`}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-black text-3xl">{initials}</span>
                )}
                {/* Upload overlay spinner */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Camera button — triggers file input */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer hover:bg-sky-50 hover:border-sky-300 transition-colors disabled:opacity-50"
                title="Đổi ảnh đại diện (JPG, PNG, tối đa 2MB)"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:mb-0 mt-2 sm:mt-10">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEditStart}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveInfo}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Lưu thay đổi
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name + Role + Codes */}
          <div className="mt-4 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{displayName}</h2>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleMeta.bg} ${roleMeta.color}`}>
                {roleMeta.label}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Đã xác minh
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              {user.employeeCode && (
                <span className="flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                  Mã NV: <span className="font-bold text-slate-700 ml-0.5">{user.employeeCode}</span>
                </span>
              )}
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
              )}
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {([
          { key: 'info',     label: 'Thông tin cá nhân', icon: User },
          { key: 'security', label: 'Bảo mật & Mật khẩu', icon: KeyRound },
          { key: 'schedule', label: 'Đăng ký & Chọn ca làm việc', icon: CalendarDays },
        ] as { key: Tab; label: string; icon: React.FC<any> }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setActiveTab(key); setIsEditing(false); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === key
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Thông tin cá nhân ─── */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Thông tin tài khoản</h3>
            {isEditing && (
              <span className="ml-auto text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Đang chỉnh sửa
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="Nguyễn Văn A"
                />
              ) : (
                <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 border border-slate-100">
                  {user.fullName || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Địa chỉ email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="email@example.com"
                />
              ) : (
                <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 border border-slate-100">
                  {user.email || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                </p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  placeholder="0909 xxx xxx"
                />
              ) : (
                <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 border border-slate-100">
                  {user.phone || <span className="text-slate-400 italic">Chưa cập nhật</span>}
                </p>
              )}
            </div>

            {/* Mã nhân viên — readonly */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-slate-400" /> Mã nhân viên
              </label>
              <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-semibold text-slate-500 border border-slate-100 flex items-center gap-2">
                {user.employeeCode || '—'}
                <span className="text-[10px] text-slate-400 font-medium">(Không thể chỉnh sửa)</span>
              </p>
            </div>

            {/* Chức vụ — readonly */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Chức vụ / Vai trò
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap gap-1.5">
                {user.roles?.length ? user.roles.map((r) => {
                  const m = ROLE_LABEL[r] || { label: r, color: 'text-slate-600', bg: 'bg-slate-100 border-slate-300' };
                  return (
                    <span key={r} className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${m.bg} ${m.color}`}>
                      {m.label}
                    </span>
                  );
                }) : <span className="text-sm text-slate-400 italic">Chưa phân vai trò</span>}
              </div>
            </div>

            {/* Chi nhánh — readonly */}
            {user.branch && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> Chi nhánh làm việc
                </label>
                <p className="px-3.5 py-2.5 rounded-xl bg-slate-50 text-sm font-semibold text-slate-800 border border-slate-100">
                  {typeof user.branch === 'string' ? user.branch : user.branch?.name || '—'}
                </p>
              </div>
            )}
          </div>

          {/* Save button inside tab for convenience */}
          {isEditing && (
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button type="button" onClick={handleEditCancel} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveInfo}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Bảo mật ─── */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <KeyRound className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Đổi mật khẩu</h3>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            {/* Current password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Mật khẩu hiện tại *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.current}
                  onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Mật khẩu mới *</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.next}
                onChange={(e) => setPwForm(f => ({ ...f, next: e.target.value }))}
                required
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
              {pwForm.next && (
                <div className="flex gap-1 mt-1">
                  {['weak', 'medium', 'strong'].map((lvl, i) => (
                    <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${
                      pwForm.next.length >= 6 && i === 0 ? 'bg-amber-400' :
                      pwForm.next.length >= 8 && i <= 1 ? 'bg-emerald-400' :
                      pwForm.next.length >= 10 && i <= 2 ? 'bg-emerald-500' :
                      'bg-slate-200'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Xác nhận mật khẩu mới *</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.confirm}
                onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                required
                placeholder="Nhập lại mật khẩu mới"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                  pwForm.confirm && pwForm.confirm !== pwForm.next
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-sky-500/20 focus:border-sky-500'
                }`}
              />
              {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Mật khẩu không khớp
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSavingPw}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isSavingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              Đổi mật khẩu
            </button>
          </form>

          {/* Security info */}
          {/* Security info */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Thông tin bảo mật</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Tài khoản đã xác minh</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Email và số điện thoại đã được xác thực</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-sky-50 border border-sky-100">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-sky-800">Phiên đăng nhập an toàn</p>
                  <p className="text-[10px] text-sky-600 mt-0.5">JWT token hết hạn sau 24 giờ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Đăng ký & Chọn ca làm việc (Yêu cầu 3 & 4) ─── */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-600" />
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Lịch Làm Việc &amp; Đăng Ký Ca
                </h3>
                <p className="text-[11px] text-slate-500">
                  Quản lý ca trực cá nhân, khung giờ làm việc và điều phối nhân sự theo quy chế phòng khám
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/staff/schedule')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all border border-sky-200 cursor-pointer self-start sm:self-auto"
            >
              <span>Xem bảng ca toàn phòng khám</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Banner trạng thái quyền tự chọn ca làm việc (Khóa quyền / Cho phép) */}
          {allowSelfSchedule ? (
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-900">
                    Quyền tự chọn ca làm việc: Đang BẬT
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800">
                    Được phép tự đăng ký
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Quản lý phòng khám đã cấp quyền cho tài khoản này tự lựa chọn và điều chỉnh ca trực trong tuần. Bạn có thể chọn ca trực dưới đây và bấm <strong>Lưu đăng ký ca</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-amber-900">
                    Quyền tự chọn ca làm việc: Đang KHÓA
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800">
                    Chỉ Quản lý phân ca
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Tài khoản của bạn hiện <strong>không có quyền tự điều chỉnh hay chọn ca</strong>. Toàn bộ lịch làm việc được Quản lý cơ sở phân công trực tiếp để đảm bảo vận hành.
                </p>
                <div className="pt-1.5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/staff/leave')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 underline hover:text-amber-700 cursor-pointer"
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>Gửi đơn xin nghỉ phép tại đây nếu có việc bận</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bảng chọn / xem ca làm việc trong tuần */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Chọn tuần làm việc:</span>
                <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setProfileWeekOffset(0)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      profileWeekOffset === 0
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tuần này
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileWeekOffset(1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      profileWeekOffset === 1
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Tuần tới (+1 tuần)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold shadow-2xs">
                      Đăng ký trước
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
                  Cơ sở: <strong>{typeof user.branch === 'string' ? user.branch : user.branch?.name || 'Chi nhánh Biên Hòa'}</strong>
                </span>
                <div className="text-xs font-black text-sky-800 bg-sky-100/70 px-3 py-1.5 rounded-xl border border-sky-200/80 w-fit">
                  Tuần: {profileDateRangeStr}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {profileDays.map(({ dayKey, label, dateStr }: any) => {
                const currentShift = weeklyShifts[dayKey] || 'off';

                return (
                  <div
                    key={dayKey}
                    className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all ${
                      currentShift === 'off'
                        ? 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                        : currentShift === 'fullday'
                        ? 'bg-sky-50/50 border-sky-200 text-sky-900'
                        : currentShift === 'morning'
                        ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                        : currentShift === 'afternoon'
                        ? 'bg-teal-50/50 border-teal-200 text-teal-900'
                        : currentShift === 'leave'
                        ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                        : 'bg-indigo-50/50 border-indigo-200 text-indigo-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-xs font-black text-slate-800">{label}</span>
                          <span className="text-[10px] text-slate-500 font-bold ml-1">({dateStr})</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{dayKey}</span>
                      </div>

                      {/* Display current badge */}
                      <div className="mb-3">
                        {currentShift === 'fullday' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                            <Clock className="w-3 h-3" /> Cả ngày (08:00 - 17:30)
                          </span>
                        )}
                        {currentShift === 'morning' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Sun className="w-3 h-3" /> Ca sáng (08:00 - 12:00)
                          </span>
                        )}
                        {currentShift === 'afternoon' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                            <Sun className="w-3 h-3" /> Ca chiều (13:30 - 17:30)
                          </span>
                        )}
                        {currentShift === 'overtime' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                            <Moon className="w-3 h-3" /> Tăng ca (18:00 - 20:30)
                          </span>
                        )}
                        {currentShift === 'leave' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <Plane className="w-3 h-3" /> Nghỉ phép
                          </span>
                        )}
                        {currentShift === 'off' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                            Không trực / Nghỉ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Selector — Only interactive when allowSelfSchedule is TRUE */}
                    {allowSelfSchedule ? (
                      <div className="space-y-1 pt-2 border-t border-slate-200/50">
                        <label className="text-[10px] font-semibold text-slate-500">Chọn ca trực:</label>
                        <select
                          value={currentShift}
                          onChange={(e) =>
                            setWeeklyShifts((prev) => ({ ...prev, [dayKey]: e.target.value }))
                          }
                          className="w-full text-[11px] font-bold py-1.5 px-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                        >
                          <option value="fullday">Cả ngày (08:00 - 17:30)</option>
                          <option value="morning">Ca Sáng (08:00 - 12:00)</option>
                          <option value="afternoon">Ca Chiều (13:30 - 17:30)</option>
                          <option value="overtime">Tăng ca (18:00 - 20:30)</option>
                          <option value="leave">Nghỉ phép</option>
                          <option value="off">Không đăng ký (Nghỉ)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-200/50 flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Lịch cố định do Quản lý xếp</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 font-medium">
              {allowSelfSchedule ? (
                <span className="text-emerald-700 font-semibold">
                  * Nhấn &quot;Lưu đăng ký ca&quot; để cập nhật lịch trực tuần của bạn vào hệ thống.
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">
                  * Quyền tự chọn ca đang bị khóa. Nếu cần đổi ca, vui lòng báo với Quản lý cơ sở.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {allowSelfSchedule && (
                <button
                  type="button"
                  disabled={isSavingSchedule}
                  onClick={handleSaveWeeklyShifts}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSavingSchedule ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu đăng ký ca làm việc</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
