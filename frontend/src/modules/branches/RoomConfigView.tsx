import React from 'react';
import {
  MapPin,
  Plus,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MoreVertical,
  Wrench,
  Sparkles,
  History,
  Building2,
} from 'lucide-react';
import { MOCK_BRANCHES } from '../../services/mockData';

export interface RoomItem {
  id: string;
  name: string;
  floor: string;
  status: 'InUse' | 'Ready' | 'Sterilized' | 'Maintenance';
  statusLabel: string;
  doctorName: string;
  currentPatient?: { name: string; time: string };
  nextAppointment?: { time: string; service: string };
  equipment?: string;
  webBookingEnabled: boolean;
}

interface RoomConfigViewProps {
  selectedBranchId: string;
  onSelectBranch: (id: string) => void;
  onBack: () => void;
  onOpenAddRoom: () => void;
  onOpenChangeDoctor: (room: RoomItem) => void;
  onOpenHistory: (room: RoomItem) => void;
  rooms: RoomItem[];
  onToggleWebBooking: (roomId: string) => void;
  onReopenRoom: (roomId: string) => void;
}

export const RoomConfigView: React.FC<RoomConfigViewProps> = ({
  selectedBranchId,
  onSelectBranch,
  onBack,
  onOpenAddRoom,
  onOpenChangeDoctor,
  onOpenHistory,
  rooms,
  onToggleWebBooking,
  onReopenRoom,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
        <button
          type="button"
          onClick={onBack}
          className="hover:text-slate-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Quản lý chi nhánh
        </button>
        <span>&gt;</span>
        <span className="text-slate-900 font-bold">Cấu hình Chi nhánh</span>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Cấu hình Phòng khám &amp; Phòng thủ thuật
          </h1>

          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <select
                value={selectedBranchId}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="bg-transparent font-extrabold focus:outline-none cursor-pointer text-xs"
              >
                {MOCK_BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
                <option value="b-bienhoa">Chi nhánh Biên Hòa (Trụ sở chính)</option>
                <option value="b-quan1">Chi nhánh Quận 1 - TP. HCM</option>
                <option value="b-longthanh">Chi nhánh Long Thành (Đồng Nai)</option>
              </select>
            </div>
            <span>Thiết lập danh sách ghế nha khoa, gán bác sĩ phụ trách và quản lý trạng thái bảo trì thiết bị.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddRoom}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm phòng khám mới
        </button>
      </div>

      {/* Summary Bar (Khớp 100% Ảnh "giao diện button cấu hình.png") */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-extrabold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">TỔNG SỐ</span>
            <span className="text-base text-slate-900 font-extrabold">8 Phòng</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap font-bold text-[11px] sm:text-xs">
          <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> 6 Đang hoạt động
          </span>
          <span className="flex items-center gap-2 text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /> 1 Đang khám
          </span>
          <span className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 1 Bảo trì / Khử trùng
          </span>
        </div>
      </div>

      {/* Grid Room Cards (Khớp 100% Ảnh "giao diện button cấu hình.png") */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
        {rooms.map((room) => {
          const isMaintenance = room.status === 'Maintenance';
          const isInUse = room.status === 'InUse';
          const isReady = room.status === 'Ready';
          const isSterilized = room.status === 'Sterilized';

          return (
            <div
              key={room.id}
              className={`bg-white rounded-3xl border p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
                isMaintenance
                  ? 'border-amber-300 bg-amber-50/15'
                  : isInUse
                  ? 'border-sky-300'
                  : 'border-slate-200/90'
              }`}
            >
              <div className="space-y-3">
                {/* Header Room Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{room.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{room.floor}</p>
                  </div>

                  {isInUse && (
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-full border border-sky-200 text-[10px] flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-sky-600" /> {room.statusLabel}
                    </span>
                  )}
                  {isReady && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {room.statusLabel}
                    </span>
                  )}
                  {isSterilized && (
                    <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-bold rounded-full border border-teal-200 text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-teal-600" /> {room.statusLabel}
                    </span>
                  )}
                  {isMaintenance && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-bold rounded-full border border-amber-200 text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> {room.statusLabel}
                    </span>
                  )}
                </div>

                {/* Details / Maintenance body */}
                {!isMaintenance ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        BÁC SĨ PHỤ TRÁCH
                      </span>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        {room.doctorName}
                      </span>
                    </div>

                    {room.currentPatient && (
                      <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-slate-900 text-xs block">
                            {room.currentPatient.name}
                          </span>
                          <span className="text-[10px] text-sky-700 font-bold flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {room.currentPatient.time}
                          </span>
                        </div>
                        <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {room.nextAppointment && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          CA TIẾP THEO ({room.nextAppointment.time})
                        </span>
                        <span className="font-bold text-slate-800">{room.nextAppointment.service}</span>
                      </div>
                    )}

                    {room.equipment && (
                      <p className="text-[11px] text-slate-500 font-medium pt-1 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong>Thiết bị:</strong> {room.equipment}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-amber-900 font-semibold leading-relaxed px-2">
                      Thiết bị đang trong quá trình bảo dưỡng định kỳ. Không thể xếp lịch khám.
                    </p>
                    <button
                      type="button"
                      onClick={() => onReopenRoom(room.id)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>▶ Mở lại hoạt động</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer: Toggle Web Booking & Action Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-[11px]">Cho phép đặt lịch Web</span>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={room.webBookingEnabled}
                      onChange={() => onToggleWebBooking(room.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isMaintenance}
                    onClick={() => onOpenChangeDoctor(room)}
                    className={`py-2 px-3 rounded-xl font-bold text-[11px] border transition-colors flex items-center justify-center gap-1 ${
                      isMaintenance
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Đổi BS
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenHistory(room)}
                    className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-slate-500" /> Lịch sử
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Card: Thêm phòng khám mới */}
        <div
          onClick={onOpenAddRoom}
          className="bg-white rounded-3xl border-2 border-dashed border-slate-300 hover:border-sky-400 p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all hover:bg-sky-50/20 group min-h-[340px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-sky-100 text-slate-600 group-hover:text-sky-600 flex items-center justify-center text-2xl font-extrabold transition-colors">
            +
          </div>
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
            Thêm phòng khám mới
          </h3>
          <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
            Cài đặt thiết bị và phân bổ không gian mới cho chi nhánh.
          </p>
        </div>
      </div>
    </div>
  );
};
