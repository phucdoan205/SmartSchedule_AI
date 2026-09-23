import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Building2,
  Stethoscope,
  Sparkles,
  AlertCircle,
  Save,
  CheckCircle2,
  CalendarDays,
  FileEdit,
  HeartPulse,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { appointmentsApi } from '../../../services/api';
import { toast } from '../../../context/ToastContext';
import type { Appointment } from '../../../types/admin';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: (Appointment & { [key: string]: any }) | null;
  doctors: any[];
  services: any[];
  branches: any[];
  onSaved: () => Promise<void> | void;
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  doctors,
  services,
  branches,
  onSaved,
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [medicalAlerts, setMedicalAlerts] = useState('');
  const [branchId, setBranchId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [status, setStatus] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when appointment changes
  useEffect(() => {
    if (appointment) {
      setPatientName(appointment.patientName || '');
      setPatientPhone(appointment.patientPhone || '');
      setPatientDob(appointment.patientDob || '');
      setMedicalAlerts(appointment.medicalAlerts || '');
      setBranchId(appointment.branchId || branches[0]?.id || '');
      setDoctorId(appointment.doctorId || doctors[0]?.id || '');
      setServiceId(appointment.serviceId || services[0]?.id || '');

      // Parse date & time from raw or string
      if (appointment.dateRaw) {
        setAppointmentDate(appointment.dateRaw);
      } else if (appointment.startTime) {
        const d = new Date(appointment.startTime);
        setAppointmentDate(d.toISOString().split('T')[0]);
      } else {
        setAppointmentDate(new Date().toISOString().split('T')[0]);
      }

      if (appointment.timeRaw) {
        setAppointmentTime(appointment.timeRaw);
      } else if (appointment.timeStr) {
        setAppointmentTime(appointment.timeStr);
      } else {
        setAppointmentTime('09:00');
      }

      // Map status
      const statusMap: Record<string, string> = {
        Pending: 'PENDING',
        Confirmed: 'CONFIRMED',
        InProgress: 'IN_PROGRESS',
        Completed: 'COMPLETED',
        Cancelled: 'CANCELLED',
      };
      setStatus(statusMap[appointment.status] || appointment.status || 'CONFIRMED');
      setNotes(appointment.notes || '');
      setEditReason('Điều chỉnh thông tin lịch hẹn theo yêu cầu');
    }
  }, [appointment, branches, doctors, services]);

  // Quick Reschedule Helpers (Dời lịch nhanh 1-Click)
  const addDaysToCurrent = (days: number) => {
    const base = appointmentDate ? new Date(appointmentDate) : new Date();
    base.setDate(base.getDate() + days);
    const yyyy = base.getFullYear();
    const mm = String(base.getMonth() + 1).padStart(2, '0');
    const dd = String(base.getDate()).padStart(2, '0');
    setAppointmentDate(`${yyyy}-${mm}-${dd}`);
    toast(`Đã dời ngày sang: ${dd}/${mm}/${yyyy}`);
  };

  const setPresetTime = (time: string) => {
    setAppointmentTime(time);
    toast(`Đã đổi giờ sang: ${time}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setIsSubmitting(true);
      const startTime = `${appointmentDate}T${appointmentTime}:00`;

      // Extract raw medical alert if DOB is included
      let finalAlerts = medicalAlerts;
      if (patientDob && !finalAlerts.includes('DOB:')) {
        finalAlerts = finalAlerts ? `${finalAlerts} | DOB:${patientDob}` : `DOB:${patientDob}`;
      }

      const payload = {
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        dateOfBirth: patientDob || undefined,
        birthYear: patientDob ? parseInt(patientDob.split('-')[0], 10) : undefined,
        medicalAlerts: finalAlerts || undefined,
        branchId,
        doctorId,
        serviceIds: serviceId ? [serviceId] : undefined,
        startTime,
        durationMinutes: 60,
        notes: notes.trim() || undefined,
        status,
        editReason: editReason.trim() || 'Cập nhật lại lịch hẹn',
        changedBy: 'Lễ tân / Quản trị viên',
      };

      const targetId = appointment.realId || appointment.id;
      await appointmentsApi.update(targetId, payload);

      toast(`Đã cập nhật thành công lịch hẹn #${appointment.id}!`);

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('smartschedule_sync');
        ch.postMessage({ type: 'APPOINTMENT_UPDATED', id: targetId });
        ch.close();
      }

      await onSaved();
      onClose();
    } catch (err: any) {
      console.error('Update appointment error:', err);
      const msg = err.response?.data?.message || err.message || 'Lỗi khi cập nhật lịch hẹn';
      toast(Array.isArray(msg) ? msg.join(', ') : msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chỉnh Sửa Lịch Hẹn [${appointment.id}]`}
      subtitle="Điều chỉnh ngày giờ, bác sĩ phụ trách hoặc thông tin bệnh nhân khi có sai sót"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Quick Reschedule Bar */}
        <div className="bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 p-3 rounded-2xl border border-sky-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sky-900 font-bold">
            <CalendarDays className="w-4 h-4 text-sky-600" />
            <span>Dời Lịch Nhanh 1-Click:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => addDaysToCurrent(1)}
              className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 font-semibold rounded-lg border border-sky-200 transition-colors shadow-2xs cursor-pointer"
            >
              +1 Ngày
            </button>
            <button
              type="button"
              onClick={() => addDaysToCurrent(2)}
              className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 font-semibold rounded-lg border border-sky-200 transition-colors shadow-2xs cursor-pointer"
            >
              +2 Ngày
            </button>
            <button
              type="button"
              onClick={() => addDaysToCurrent(7)}
              className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 font-semibold rounded-lg border border-sky-200 transition-colors shadow-2xs cursor-pointer"
            >
              +1 Tuần
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />
            <button
              type="button"
              onClick={() => setPresetTime('09:00')}
              className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-700 font-semibold rounded-lg border border-teal-200 transition-colors shadow-2xs cursor-pointer"
            >
              Sáng 09:00
            </button>
            <button
              type="button"
              onClick={() => setPresetTime('14:30')}
              className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-700 font-semibold rounded-lg border border-teal-200 transition-colors shadow-2xs cursor-pointer"
            >
              Chiều 14:30
            </button>
          </div>
        </div>

        {/* SECTION 1: THÔNG TIN BỆNH NHÂN */}
        <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wide">
            <User className="w-3.5 h-3.5 text-sky-600" />
            <span>1. Thông Tin Bệnh Nhân</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Họ & Tên Bệnh Nhân: *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại: *</label>
              <input
                type="text"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày Sinh (Hồ sơ y bạ):</label>
              <input
                type="date"
                value={patientDob}
                onChange={(e) => setPatientDob(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-amber-500" />
                Cảnh Báo Y Tế / Dị Ứng Thuốc:
              </label>
              <input
                type="text"
                value={medicalAlerts}
                onChange={(e) => setMedicalAlerts(e.target.value)}
                placeholder="VD: Dị ứng Lidocaine, cao huyết áp..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: THỜI GIAN & ĐỊA ĐIỂM */}
        <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-sky-900 text-[11px] uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>2. Thời Gian & Cơ Sở Điều Trị</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md border border-teal-200">
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>AI Đệm vô trùng 15p: Tự động kích hoạt</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600" /> Cơ Sở Chi Nhánh: *
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" /> Ngày Hẹn Khám: *
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" /> Giờ Bắt Đầu: *
              </label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: BÁC SĨ & DỊCH VỤ & TRẠNG THÁI */}
        <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wide">
            <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
            <span>3. Dịch Vụ, Bác Sĩ & Trạng Thái Lịch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dịch Vụ Điều Trị: *</label>
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({Number(s.standardPrice).toLocaleString('vi-VN')}đ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bác Sĩ Đảm Nhiệm: *</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty || 'Nha sĩ'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Trạng Thái Cuộc Hẹn: *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="PENDING">Chờ Khám & Check-in</option>
                <option value="CONFIRMED">Đã Xác Nhận Lịch</option>
                <option value="IN_PROGRESS">Đang Thực Hiện Điều Trị</option>
                <option value="COMPLETED">Hoàn Thành & Thanh Toán</option>
                <option value="CANCELLED">Đã Hủy Lịch Hẹn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileEdit className="w-3.5 h-3.5 text-slate-500" /> Lý Do Điều Chỉnh (Ghi log hệ thống):
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="VD: Bệnh nhân bận việc đột xuất xin dời ca..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi Chú Bổ Sung Cho Bác Sĩ:</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Khách yêu cầu bôi tê nhẹ trước khi làm..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mọi thay đổi được lưu tự động vào nhật ký lịch hẹn</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu & Cập Nhật Lịch Hẹn</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
