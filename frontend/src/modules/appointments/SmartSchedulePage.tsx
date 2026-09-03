import React, { useState } from 'react';
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
import { MOCK_APPOINTMENTS, MOCK_DOCTORS } from '../../services/mockData';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { Appointment } from '../../types/admin';
import { Modal } from '../../components/common/Modal';

export const SmartSchedulePage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Form inputs
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [doctorId, setDoctorId] = useState(MOCK_DOCTORS[0].id);
  const [service, setService] = useState('Khám Tim Mạch Chuyên Sâu');

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

  // Kanban Columns configuration
  const kanbanColumns = [
    { key: 'Pending', title: 'Chờ Xác Nhận', color: 'border-amber-400 bg-amber-50/30' },
    { key: 'Confirmed', title: 'Đã Xác Nhận', color: 'border-sky-400 bg-sky-50/30' },
    { key: 'InProgress', title: 'Đang Khám Bệnh', color: 'border-teal-400 bg-teal-50/30' },
    { key: 'Completed', title: 'Hoàn Thành', color: 'border-emerald-400 bg-emerald-50/30' },
    { key: 'Cancelled', title: 'Đã Hủy / Dời', color: 'border-rose-400 bg-rose-50/30' },
  ];

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus: string) => {
    if (!draggedId) return;
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === draggedId ? { ...apt, status: targetStatus as any } : apt))
    );
    setDraggedId(null);
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = MOCK_DOCTORS.find((d) => d.id === doctorId);
    const newApt: Appointment = {
      id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName,
      patientPhone,
      doctorName: doc?.name || 'TS.BS. Nguyễn Minh Anh',
      doctorId,
      service,
      branch: 'Cơ sở Quận 1',
      dateTime: '2026-09-04 09:00',
      status: 'Confirmed',
      aiScore: 99,
      aiNote: 'Xếp lịch tự động tối ưu không trùng ca',
    };
    setAppointments([newApt, ...appointments]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" /> Quản Lý Lịch Hẹn Kéo Thả Bảng AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Giao diện Bảng Kéo Thả (Kanban Board) điều phối tiến trình khám bệnh trực quan
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Đặt lịch khám mới
          </button>
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {kanbanColumns.map((col) => {
            const colAppointments = appointments.filter((a) => a.status === col.key);
            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.key)}
                className={`p-3.5 rounded-2xl border-t-4 bg-slate-50/60 border border-slate-200/80 shadow-xs space-y-3 min-h-[500px] ${col.color}`}
              >
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-bold text-slate-800">{col.title}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 shadow-2xs">
                    {colAppointments.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      draggable
                      onDragStart={() => handleDragStart(apt.id)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-grab active:cursor-grabbing space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                          {apt.id}
                        </span>
                        {apt.aiScore && (
                          <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 text-indigo-500" /> {apt.aiScore}%
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{apt.patientName}</h5>
                        <p className="text-[11px] text-slate-400">{apt.patientPhone}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                        <p className="font-semibold text-teal-700 truncate">{apt.service}</p>
                        <p className="truncate">BS: {apt.doctorName}</p>
                        <p className="flex items-center gap-1 font-semibold text-slate-600 pt-0.5">
                          <Clock className="w-3 h-3 text-sky-600" /> {apt.dateTime}
                        </p>
                      </div>
                    </div>
                  ))}

                  {colAppointments.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400 italic">
                      Kéo thẻ lịch hẹn vào đây
                    </div>
                  )}
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
        subtitle="AI sẽ tự động kiểm tra giờ trống của bác sĩ để đề xuất khung giờ tối ưu nhất"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ & Tên Bệnh Nhân:</label>
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
              placeholder="0912.xxx.xxx"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bác Sĩ Đảm Nhiệm:</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              {MOCK_DOCTORS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dịch Vụ Khám:</label>
            <input
              type="text"
              required
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs"
            >
              Xác Nhận Lịch Hẹn
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
