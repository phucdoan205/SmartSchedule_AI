import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Sparkles,
  User,
  Kanban,
  List,
  Building2,
  XCircle,
  Edit3,
} from 'lucide-react';
import { appointmentsApi, staffApi, servicesApi, branchesApi } from '../../services/api';
import { DataTable, type Column } from '../../components/common/DataTable';
import type { Appointment } from '../../types/admin';
import { Modal } from '../../components/common/Modal';
import { EditAppointmentModal } from './modals/EditAppointmentModal';
import { toast } from '../../context/ToastContext';
import { useBranch } from '../../context/BranchContext';

export const SmartSchedulePage: React.FC = () => {
  const { selectedBranchId, branches: globalBranches, selectedBranch } = useBranch();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientDob, setPatientDob] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [doctorId, setDoctorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [branchId, setBranchId] = useState('');

  const handleOpenEdit = (apt: Appointment) => {
    setEditingAppointment(apt);
    setIsEditModalOpen(true);
  };

  const loadAppointments = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await appointmentsApi.getAll();
      const mapped: Appointment[] = data.map((item: any) => {
        const startDate = new Date(item.startTime);
        const hours = String(startDate.getHours()).padStart(2, '0');
        const minutes = String(startDate.getMinutes()).padStart(2, '0');
        const day = String(startDate.getDate()).padStart(2, '0');
        const month = String(startDate.getMonth() + 1).padStart(2, '0');
        const year = startDate.getFullYear();
        const timeFormatted = `${hours}:${minutes}`;
        const dateFormatted = `${day}/${month}/${year}`;
        const dateTimeFull = `${timeFormatted} • ${dateFormatted}`;
        const dateRaw = `${year}-${month}-${day}`;
        const timeRaw = `${hours}:${minutes}`;

        let patientDob = '';
        if (item.patient?.medicalAlerts && item.patient.medicalAlerts.includes('DOB:')) {
          const match = item.patient.medicalAlerts.match(/DOB:(\d{4}-\d{2}-\d{2})/);
          if (match) patientDob = match[1];
        }

        return {
          id: item.appointmentCode,
          realId: item.id,
          patientName: item.patient?.fullName || 'Khách hàng',
          patientPhone: item.patient?.phone || '',
          patientDob,
          medicalAlerts: item.patient?.medicalAlerts || '',
          doctorName: item.doctor?.fullName || 'Bác sĩ trực',
          doctorId: item.doctorId,
          service: item.services?.[0]?.service?.name || 'Khám tổng quát',
          serviceId: item.services?.[0]?.serviceId || item.services?.[0]?.service?.id,
          branch: item.branch?.name || 'Chi nhánh chính',
          branchId: item.branchId,
          chairId: item.chairId,
          chairName: item.chair?.name,
          startTime: item.startTime,
          dateTime: dateTimeFull,
          timeStr: timeFormatted,
          dateStr: dateFormatted,
          dateRaw,
          timeRaw,
          notes: item.notes || '',
          status:
            item.status === 'CONFIRMED' ? 'Confirmed'
            : item.status === 'IN_PROGRESS' ? 'InProgress'
            : item.status === 'COMPLETED' ? 'Completed'
            : item.status === 'CANCELLED' ? 'Cancelled'
            : 'Pending',
          aiScore: item.isAiRecommended ? 98 : 92,
          aiNote: 'Xep lich kiem soat dem vo trung 15 phut',
          rawItem: item,
        };
      });
      setAppointments(mapped);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    const loadMeta = async () => {
      try {
        const [docs, srvs, brs] = await Promise.all([staffApi.getDoctors(), servicesApi.getAll(), branchesApi.getAll()]);
        setDoctors(docs); setServices(srvs); setBranches(brs);
        if (docs.length > 0) setDoctorId(docs[0].id);
        if (srvs.length > 0) setServiceId(srvs[0].id);
        if (brs.length > 0) setBranchId(brs[0].id);
      } catch (err) { console.error(err); }
    };
    loadMeta();
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = () => loadAppointments(true);
    }
    const handleFocus = () => loadAppointments(true);
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => loadAppointments(true), 5000);
    return () => { channel?.close(); window.removeEventListener('focus', handleFocus); clearInterval(interval); };
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'ALL') {
      return appointments;
    }
    return appointments.filter(
      (a) => a.branchId === selectedBranchId || a.branch === selectedBranch?.name
    );
  }, [appointments, selectedBranchId, selectedBranch]);

  const tableColumns: Column<Appointment>[] = [
    { header: 'MÃ LỊCH HẸN', cell: (row) => <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-xs">{row.id}</span> },
    { header: 'BỆNH NHÂN', cell: (row) => <div><p className="font-bold text-slate-800">{row.patientName}</p><p className="text-[11px] text-slate-400">{row.patientPhone}</p></div> },
    { header: 'BÁC SĨ', cell: (row) => <span className="font-semibold text-slate-700">{row.doctorName}</span> },
    { header: 'DỊCH VỤ', accessorKey: 'service' },
    {
      header: 'CHI NHÁNH',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>{row.branch}</span>
        </span>
      ),
    },
    {
      header: 'THỜI GIAN KHÁM',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.timeStr || row.dateTime.split(' • ')[0]}</p>
            <p className="text-[11px] text-slate-400 font-medium">{row.dateStr || row.dateTime.split(' • ')[1]}</p>
          </div>
        </div>
      ),
    },
    { header: 'ĐIỂM AI', cell: (row) => <div className="flex items-center gap-1.5 font-bold text-indigo-600"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /><span>{row.aiScore || 98}%</span></div> },
    {
      header: 'TRẠNG THÁI',
      cell: (row) => {
        const cfg: Record<string, { label: string; bg: string; dot: string }> = {
          Pending: { label: 'Chờ Khám', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
          Confirmed: { label: 'Đã Xác Nhận', bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
          InProgress: { label: 'Đang Điều Trị', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
          Completed: { label: 'Hoàn Thành', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
          Cancelled: { label: 'Đã Hủy', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
        };
        const c = cfg[row.status] || { label: row.status, bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' };
        return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg}`}><span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{c.label}</span>;
      },
    },
    {
      header: 'THAO TÁC',
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleOpenEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-all cursor-pointer shadow-2xs"
          title="Chỉnh sửa lịch hẹn khi có sai sót"
        >
          <Edit3 className="w-3.5 h-3.5 text-sky-600" />
          <span>Sửa Lịch</span>
        </button>
      ),
    },
  ];

  const kanbanColumns = [
    { id: 'Pending' as const, title: 'Chờ Khám', titleFull: 'Chờ Khám & Check-in', containerBg: 'bg-amber-50/70', borderTop: 'border-t-amber-500', borderBase: 'border-amber-200/80', headerText: 'text-amber-900', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300', dotColor: 'bg-amber-500' },
    { id: 'Confirmed' as const, title: 'Đã Xác Nhận', titleFull: 'Đã Xác Nhận Lịch', containerBg: 'bg-sky-50/70', borderTop: 'border-t-sky-500', borderBase: 'border-sky-200/80', headerText: 'text-sky-900', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300', dotColor: 'bg-sky-500' },
    { id: 'InProgress' as const, title: 'Đang Điều Trị', titleFull: 'Đang Thực Hiện Điều Trị', containerBg: 'bg-purple-50/70', borderTop: 'border-t-purple-500', borderBase: 'border-purple-200/80', headerText: 'text-purple-900', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300', dotColor: 'bg-purple-500' },
    { id: 'Completed' as const, title: 'Hoàn Thành', titleFull: 'Hoàn Thành & Thanh Toán', containerBg: 'bg-emerald-50/70', borderTop: 'border-t-emerald-500', borderBase: 'border-emerald-200/80', headerText: 'text-emerald-900', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', dotColor: 'bg-emerald-500' },
    { id: 'Cancelled' as const, title: 'Đã Hủy', titleFull: 'Đã Hủy Lịch Hẹn', containerBg: 'bg-rose-50/70', borderTop: 'border-t-rose-500', borderBase: 'border-rose-200/80', headerText: 'text-rose-900', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300', dotColor: 'bg-rose-500' },
  ];

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = async (targetStatus: Appointment['status']) => {
    if (!draggedId) return;
    const prev = appointments;
    setAppointments((a) => a.map((apt) => (apt.id === draggedId ? { ...apt, status: targetStatus } : apt)));
    const map: Record<Appointment['status'], string> = { Pending: 'PENDING', Confirmed: 'CONFIRMED', InProgress: 'IN_PROGRESS', Completed: 'COMPLETED', Cancelled: 'CANCELLED' };
    const newStatus = map[targetStatus] || 'PENDING';
    const id = draggedId;
    setDraggedId(null);
    try {
      await appointmentsApi.updateStatus(id, newStatus);
      toast(`Đã chuyển trạng thái ${id} → ${targetStatus}`);
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('smartschedule_sync');
        ch.postMessage({ type: 'APPOINTMENT_STATUS_UPDATED', id, status: newStatus });
        ch.close();
      }
    } catch (err: any) {
      toast('Không thể lưu, đang khôi phục...', 'error');
      setAppointments(prev);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const startTime = `${appointmentDate}T${appointmentTime}:00`;
      await appointmentsApi.book({
        patientName,
        patientPhone,
        dateOfBirth: patientDob || undefined,
        birthYear: patientDob ? parseInt(patientDob.split('-')[0], 10) : undefined,
        branchId: branchId || branches[0]?.id || 'CN01',
        doctorId: doctorId || doctors[0]?.id,
        chairId: 'chair-bh-01',
        serviceIds: [serviceId || services[0]?.id],
        startTime,
        durationMinutes: 60,
        isAiRecommended: true,
      });
      setIsModalOpen(false);
      setPatientName('');
      setPatientPhone('');
      setPatientDob('');
      toast(`Đã tạo thành công lịch hẹn mới cho bệnh nhân ${patientName}!`);
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('smartschedule_sync');
        ch.postMessage({ type: 'APPOINTMENT_CREATED' }); ch.close();
      }
      await loadAppointments();
    } catch (err: any) { toast(err.response?.data?.message || 'Lỗi khi tạo lịch hẹn', 'error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" /> Quản Lý Lịch Hẹn &amp; Đệm Vô Trùng AI
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Điều phối lịch hẹn trực quan kết nối dữ liệu máy chủ</span>
            {selectedBranch && (
              <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                • {selectedBranch.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button id="btn-view-kanban" type="button" onClick={() => setViewMode('kanban')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}><Kanban className="w-3.5 h-3.5" /> Bảng Kéo Thả</button>
            <button id="btn-view-table" type="button" onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}><List className="w-3.5 h-3.5" /> Danh Sách Bảng</button>
          </div>
          <button id="btn-create-appointment" type="button" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Đặt Lịch Mới</button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang nạp danh sách lịch hẹn...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs space-y-2">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">
            {selectedBranchId && selectedBranchId !== 'ALL'
              ? `Chưa có lịch hẹn nào tại ${selectedBranch?.name || 'chi nhánh này'}`
              : 'Chưa có lịch hẹn nào'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-x-visible sm:snap-none lg:grid-cols-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {kanbanColumns.map((col) => {
            const allItems = filteredAppointments.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={() => handleDrop(col.id)}
                className={`${col.containerBg} border-t-4 ${col.borderTop} border ${col.borderBase} rounded-2xl p-3 flex flex-col shadow-xs transition-all min-w-[82vw] sm:min-w-0 snap-start flex-shrink-0 h-[640px]`}
              >
                {/* Sticky Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-black/5 mb-2 shrink-0">
                  <span className={`font-bold text-xs ${col.headerText} flex items-center gap-1.5`}>
                    <span className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`} />
                    <span className="hidden lg:inline">{col.titleFull}</span>
                    <span className="lg:hidden">{col.title}</span>
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${col.badgeClass} shrink-0`}>
                    {allItems.length}
                  </span>
                </div>

                {/* Cards Container with smooth inner scroll for >= 5 items */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                  {allItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 opacity-40">
                      <XCircle className="w-7 h-7 mb-1" />
                      <span className="text-[10px] font-semibold">Không có lịch hẹn</span>
                    </div>
                  ) : (
                    allItems.map((apt) => (
                      <div
                        key={apt.id}
                        draggable
                        onDragStart={() => handleDragStart(apt.id)}
                        onDoubleClick={() => handleOpenEdit(apt)}
                        className="group bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 relative"
                        title="Kéo thả để đổi trạng thái, hoặc nhấp đúp để chỉnh sửa lịch hẹn"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                            {apt.id}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              <Sparkles className="w-3 h-3 text-indigo-500" />
                              <span>AI: {apt.aiScore}%</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(apt);
                              }}
                              className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                              title="Chỉnh sửa lịch hẹn này"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="font-bold text-slate-900 text-xs">{apt.patientName}</p>
                          <p className="text-[10px] text-slate-400">{apt.patientPhone}</p>
                        </div>

                        <div className="text-[11px] text-slate-600 space-y-1 pt-1.5 border-t border-slate-100">
                          <p className="font-semibold text-slate-700 truncate">🦷 {apt.service}</p>
                          <p className="text-slate-500 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" /> {apt.doctorName}
                          </p>
                          <p className="text-sky-700 font-semibold flex items-center gap-1 truncate text-[10px] bg-sky-50/80 px-1.5 py-0.5 rounded border border-sky-100/70">
                            <Building2 className="w-3 h-3 text-sky-600 shrink-0" /> {apt.branch}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>Khám lúc: <strong className="text-sky-700 font-bold">{apt.timeStr || apt.dateTime.split(' • ')[0]}</strong> • <span className="text-slate-500 font-medium">{apt.dateStr || apt.dateTime.split(' • ')[1]}</span></span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                            <span className="text-[10px] text-slate-400">Nhấp đúp thẻ để sửa</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(apt);
                              }}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                              title="Chỉnh sửa thông tin lịch hẹn"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Sửa lịch</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer notification when >= 5 items */}
                {allItems.length >= 5 && (
                  <div className="pt-2 border-t border-black/5 text-[10px] text-center text-slate-500 font-medium shrink-0">
                    Cuộn để xem toàn bộ {allItems.length} lịch hẹn
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          data={filteredAppointments}
          columns={tableColumns}
          itemsPerPage={5}
          searchPlaceholder="Tìm tên bệnh nhân, số điện thoại..."
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo Lịch Hẹn Khám Bệnh Mới" subtitle="AI sẽ tự động kiểm tra giờ trống của bác sĩ và tính đệm vô trùng 15 phút">
        <form onSubmit={handleCreateAppointment} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ &amp; Tên Bệnh Nhân:</label>
            <input type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số Điện Thoại:</label>
              <input type="text" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} placeholder="0912345678" className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày Sinh (Hồ sơ y bạ):</label>
              <input type="date" value={patientDob} onChange={(e) => setPatientDob(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50" />
            </div>
          </div>

          {/* Chọn Ngày & Giờ Hẹn Khám Rõ Ràng */}
          <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 space-y-2">
            <span className="text-[11px] font-bold text-sky-900 block uppercase tracking-wide">
              THỜI GIAN HẸN KHÁM TẠI PHÒNG KHÁM
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" /> Ngày Khám:
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> Giờ Khám:
                </label>
                <input
                  type="time"
                  required
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div><label className="block font-semibold text-slate-700 mb-1">Cơ Sở Chi Nhánh:</label><select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Bác Sĩ Đảm Nhiệm:</label><select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">{doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>)}</select></div>
          <div><label className="block font-semibold text-slate-700 mb-1">Dịch Vụ Khám:</label><select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">{services.map((s) => <option key={s.id} value={s.id}>{s.name} - {Number(s.standardPrice).toLocaleString('vi-VN')}đ</option>)}</select></div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-100 font-semibold">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs">Lưu &amp; Xếp Lịch</button>
          </div>
        </form>
      </Modal>

      <EditAppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAppointment(null);
        }}
        appointment={editingAppointment}
        doctors={doctors}
        services={services}
        branches={branches}
        onSaved={async () => {
          await loadAppointments(true);
        }}
      />
    </div>
  );
};