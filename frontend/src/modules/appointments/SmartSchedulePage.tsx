import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Sparkles,
  User,
  MapPin,
  Kanban,
  List,
  ChevronRight,
  MoveRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { appointmentsApi, staffApi, servicesApi, branchesApi } from '../../services/api';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Appointment } from '../../types/admin';
import { Modal } from '../../components/common/Modal';
import { toast } from '../../context/ToastContext';

export const SmartSchedulePage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Form inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [branchId, setBranchId] = useState('');

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await appointmentsApi.getAll();
      const mapped: Appointment[] = data.map((item: any) => ({
        id: item.appointmentCode,
        patientName: item.patient?.fullName || 'Khách hàng',
        patientPhone: item.patient?.phone || '',
        doctorName: item.doctor?.fullName || 'Bác sĩ trực',
        doctorId: item.doctorId,
        service: item.services?.[0]?.service?.name || 'Khám tổng quát',
        branch: item.branch?.name || 'Chi nhánh chính',
        dateTime: new Date(item.startTime).toLocaleString('vi-VN', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        status: item.status === 'CONFIRMED' ? 'Confirmed' : item.status === 'IN_PROGRESS' ? 'InProgress' : item.status === 'COMPLETED' ? 'Completed' : 'Pending',
        aiScore: item.isAiRecommended ? 98 : 92,
        aiNote: 'Xếp lịch kiểm soát đệm vô trùng 15 phút',
      }));
      setAppointments(mapped);
    } catch (err) {
      console.error('Lỗi khi tải lịch hẹn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();

    const loadMeta = async () => {
      try {
        const [docs, srvs, brs] = await Promise.all([
          staffApi.getDoctors(),
          servicesApi.getAll(),
          branchesApi.getAll(),
        ]);
        setDoctors(docs);
        setServices(srvs);
        setBranches(brs);

        if (docs.length > 0) setDoctorId(docs[0].id);
        if (srvs.length > 0) setServiceId(srvs[0].id);
        if (brs.length > 0) setBranchId(brs[0].id);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bổ trợ:', err);
      }
    };
    loadMeta();
  }, []);

  // Table Columns
  const tableColumns: Column<Appointment>[] = [
    {
      header: 'MÃ LỊCH HẸN',
      cell: (row) => (
        <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-xs">
          {row.id}
        </span>
      ),
    },
    {
      header: 'BỆNH NHÂN',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.patientName}</p>
          <p className="text-[11px] text-slate-400">{row.patientPhone}</p>
        </div>
      ),
    },
    {
      header: 'BÁC SĨ PHỤ TRÁCH',
      cell: (row) => <span className="font-semibold text-slate-700">{row.doctorName}</span>,
    },
    { header: 'DỊCH VỤ KHÁM', accessorKey: 'service' },
    {
      header: 'THỜI GIAN',
      cell: (row) => (
        <span className="flex items-center gap-1 font-semibold text-slate-700">
          <Clock className="w-3.5 h-3.5 text-sky-600" /> {row.dateTime}
        </span>
      ),
    },
    {
      header: 'ĐIỂM AI TỐI ƯU',
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-bold text-indigo-600">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{row.aiScore || 98}%</span>
        </div>
      ),
    },
    {
      header: 'TRẠNG THÁI',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  // Kanban Columns
  const kanbanColumns: { id: Appointment['status']; title: string; color: string }[] = [
    { id: 'Pending', title: 'Chờ Khám & Check-in', color: 'border-amber-400' },
    { id: 'Confirmed', title: 'Đã Xác Nhận Lịch', color: 'border-sky-400' },
    { id: 'InProgress', title: 'Đang Thực Hiện Điều Trị', color: 'border-purple-400' },
    { id: 'Completed', title: 'Hoàn Thành & Đã Thanh Toán', color: 'border-emerald-400' },
  ];

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDrop = async (targetStatus: Appointment['status']) => {
    if (!draggedId) return;
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === draggedId ? { ...apt, status: targetStatus } : apt)),
    );
    toast(`Đã chuyển trạng thái lịch hẹn ${draggedId} sang ${targetStatus}`);
    setDraggedId(null);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      now.setHours(now.getHours() + 2);

      await appointmentsApi.book({
        patientName,
        patientPhone,
        branchId: branchId || branches[0]?.id || 'CN01',
        doctorId: doctorId || doctors[0]?.id,
        chairId: 'chair-bh-01',
        serviceIds: [serviceId || services[0]?.id],
        startTime: now.toISOString(),
        durationMinutes: 60,
        isAiRecommended: true,
      });

      setIsModalOpen(false);
      setPatientName('');
      setPatientPhone('');
      toast(`Đã tạo thành công lịch hẹn mới cho bệnh nhân ${patientName}!`);
      await loadAppointments();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Lỗi khi tạo lịch hẹn', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" /> Quản Lý Lịch Hẹn &amp; Đệm Vô Trùng AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Điều phối lịch hẹn trực quan kết nối dữ liệu máy chủ và kiểm soát xung đột
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Bảng Kéo Thả
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Danh Sách Bảng
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Đặt Lịch Mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang nạp danh sách lịch hẹn từ máy chủ...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs space-y-2">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">Chưa có lịch hẹn nào trong hệ thống</p>
          <p className="text-slate-400">Bấm "Đặt Lịch Mới" hoặc đặt lịch từ trang chủ người dùng</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colAppointments = appointments.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className={`bg-slate-50/70 border-t-4 ${col.color} border-slate-200/80 rounded-2xl p-3 space-y-3 min-h-[450px] flex flex-col`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="font-bold text-xs text-slate-800">{col.title}</span>
                  <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600">
                    {colAppointments.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      draggable
                      onDragStart={() => handleDragStart(apt.id)}
                      className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                          {apt.id}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>AI: {apt.aiScore}%</span>
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 text-xs">{apt.patientName}</p>
                        <p className="text-[10px] text-slate-400">{apt.patientPhone}</p>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                        <p className="font-semibold text-slate-700 truncate">🦷 {apt.service}</p>
                        <p className="text-slate-500 flex items-center gap-1 truncate">
                          <User className="w-3 h-3 text-slate-400 shrink-0" /> {apt.doctorName}
                        </p>
                        <p className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" /> {apt.dateTime}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          data={appointments}
          columns={tableColumns}
          searchPlaceholder="Tìm tên bệnh nhân, số điện thoại..."
        />
      )}

      {/* Modal Đặt lịch khám mới */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Lịch Hẹn Khám Bệnh Mới"
        subtitle="AI sẽ tự động kiểm tra giờ trống của bác sĩ và tính đệm vô trùng 15 phút"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ &amp; Tên Bệnh Nhân:</label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại:</label>
            <input
              type="text"
              required
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cơ Sở Chi Nhánh:</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bác Sĩ Đảm Nhiệm:</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dịch Vụ Khám:</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {Number(s.standardPrice).toLocaleString('vi-VN')}đ
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs"
            >
              Lưu &amp; Xếp Lịch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
