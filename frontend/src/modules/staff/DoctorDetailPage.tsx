import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Calendar,
  Phone,
  Mail,
  Award,
  Clock,
  Edit,
  DollarSign,
  Building,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { MOCK_DOCTORS, MOCK_SHIFTS, MOCK_SERVICES } from '../../services/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { DataTable, type Column } from '../../components/common/DataTable';
import { ShiftModal } from './ShiftModal';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('shifts');
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const doctor = MOCK_DOCTORS.find((d) => d.id === id) || MOCK_DOCTORS[0];

  const detailTabs: TabItem[] = [
    { id: 'shifts', label: 'Lịch Trực & Ca Khám', count: 3, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'services', label: 'Dịch Vụ Đảm Nhiệm', count: 2, icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Lịch Sử Khám & Đánh Giá', count: 12, icon: <Star className="w-3.5 h-3.5" /> },
    { id: 'salary', label: 'Chi Tiết Lương Thưởng', icon: <DollarSign className="w-3.5 h-3.5" /> },
  ];

  // Columns for shifts tab
  const shiftColumns: Column<any>[] = [
    { header: 'NGÀY TRỰC', accessorKey: 'date' },
    { header: 'KHUNG GIỜ', cell: (row) => `${row.startTime} - ${row.endTime}` },
    { header: 'PHÒNG KHÁM', accessorKey: 'room' },
    { header: 'TRẠNG THÁI', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/admin/staff')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Danh sách Bác sĩ & Nhân sự
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-sky-50 shadow-md"
            />
            <div className="absolute -bottom-2 right-0">
              <StatusBadge status={doctor.status} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                {doctor.code}
              </span>
            </div>

            <p className="text-xs font-bold text-teal-600">{doctor.specialty}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {doctor.department} ({doctor.branch})
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {doctor.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {doctor.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right Stats & Edit Action */}
        <div className="flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">ĐÁNH GIÁ</p>
              <div className="flex items-center text-amber-500 font-bold text-sm justify-center mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 mr-1" />
                {doctor.rating}
              </div>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase">LƯỢT KHÁM</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{doctor.totalAppointments}</p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-3.5 h-3.5" />
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm">
        <Tabs tabs={detailTabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content Display */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Lịch Trực & Phân Công Ca Khám</h3>
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm ca trực
            </button>
          </div>
          <DataTable data={MOCK_SHIFTS} columns={shiftColumns} />
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_SERVICES.map((srv) => (
            <div key={srv.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">{srv.code}</span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">{srv.name}</h4>
                <p className="text-xs text-slate-500">{srv.category} • {srv.durationMinutes} phút</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-teal-600">{srv.price.toLocaleString('vi-VN')} VNĐ</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đủ chứng chỉ
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Lịch Sử Khám Bệnh & Phản Hồi Từ Bệnh Nhân</h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Bệnh nhân: Nguyễn Văn An</span>
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" /> 5.0
                </div>
              </div>
              <p className="text-slate-600">"Bác sĩ tư vấn rất tận tình, giải thích chi tiết kết quả siêu âm tim. Phòng khám hiện đại."</p>
              <span className="text-[10px] text-slate-400">03/09/2026 10:15</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Bảng Tổng Hợp Thu Nhập & Hoa Hồng T9/2026</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-medium">Lương Cơ Bản</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{doctor.salaryBase.toLocaleString('vi-VN')} VNĐ</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-slate-500 font-medium">Phụ Cấp Trách Nhiệm</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{doctor.allowance.toLocaleString('vi-VN')} VNĐ</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-emerald-700 font-medium">Hoa Hồng Ca Khám (AI Calculated)</p>
              <p className="text-lg font-bold text-emerald-800 mt-1">{doctor.commission.toLocaleString('vi-VN')} VNĐ</p>
            </div>
          </div>
        </div>
      )}

      <ShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />
    </div>
  );
};
