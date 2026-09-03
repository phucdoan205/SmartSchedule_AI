import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Stethoscope,
  Plus,
  ArrowRightLeft,
  Settings,
  MoreVertical,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  RotateCcw,
  History,
  UserCheck,
  ChevronRight,
  X,
  Sparkles,
  ShieldCheck,
  Info,
  Armchair,
  FileSpreadsheet,
} from 'lucide-react';
import { MOCK_BRANCHES, MOCK_DOCTORS } from '../../services/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';

interface RoomData {
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

export const BranchesPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'branches' | 'room_config'>('branches');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b2');

  // Modals
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isTransferStaffOpen, setIsTransferStaffOpen] = useState(false);
  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = useState(false);
  const [isRoomHistoryOpen, setIsRoomHistoryOpen] = useState(false);
  const [isBranchDetailOpen, setIsBranchDetailOpen] = useState(false);

  // Selected Item States
  const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);
  const [selectedDoctorForRoom, setSelectedDoctorForRoom] = useState<string>('');
  const [selectedBranchDetail, setSelectedBranchDetail] = useState<any>(null);

  // Form State
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomFloor, setRoomFloor] = useState('Tầng 1');

  // Rooms Data State
  const [rooms, setRooms] = useState<RoomData[]>([
    {
      id: 'r1',
      name: 'Phòng 01',
      floor: 'Tầng 1 (Khám & Cạo vôi)',
      status: 'InUse',
      statusLabel: 'Đang có bệnh nhân',
      doctorName: 'BS. Trần Đức Cường',
      currentPatient: { name: 'Lê Văn A', time: '09:00 - 10:00' },
      equipment: 'Máy lấy cao răng siêu âm Satelec',
      webBookingEnabled: true,
    },
    {
      id: 'r2',
      name: 'Phòng 02',
      floor: 'Tầng 2 (Phục hình Sứ)',
      status: 'Ready',
      statusLabel: 'Sẵn sàng',
      doctorName: 'BS. Nguyễn Thị An',
      nextAppointment: { time: '10:30', service: 'Bọc răng sứ Cercon' },
      webBookingEnabled: true,
    },
    {
      id: 'r3',
      name: 'Phòng mổ 01',
      floor: 'Tầng 3 (Phẫu thuật Implant)',
      status: 'Sterilized',
      statusLabel: 'Vô trùng hoàn tất',
      doctorName: 'BS.CKI Nguyễn Văn Tuấn',
      equipment: 'Máy phẫu thuật Implant Surgic Pro',
      webBookingEnabled: false,
    },
    {
      id: 'r4',
      name: 'Phòng 04',
      floor: 'Tầng 1',
      status: 'Maintenance',
      statusLabel: 'Bảo trì / Thay lọc',
      doctorName: 'Chưa phân bổ',
      webBookingEnabled: false,
    },
  ]);

  const handleToggleWebBooking = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, webBookingEnabled: !r.webBookingEnabled } : r))
    );
  };

  const handleReopenRoom = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: 'Ready', statusLabel: 'Sẵn sàng', doctorName: 'BS. Nguyễn Minh Anh' }
          : r
      )
    );
  };

  const handleOpenChangeDoctor = (room: RoomData) => {
    setSelectedRoom(room);
    setSelectedDoctorForRoom(room.doctorName);
    setIsChangeDoctorOpen(true);
  };

  const handleOpenHistory = (room: RoomData) => {
    setSelectedRoom(room);
    setIsRoomHistoryOpen(true);
  };

  const handleOpenDetailModal = (branch: any) => {
    setSelectedBranchDetail(branch);
    setIsBranchDetailOpen(true);
  };

  const handleConfigureRoomsForBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('room_config');
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Sub-header */}
      <div className="flex items-center justify-between bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveView('branches')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeView === 'branches'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🏢 Danh Sách Hệ Thống Chi Nhánh
          </button>
          <button
            type="button"
            onClick={() => setActiveView('room_config')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeView === 'room_config'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            ⚙️ Cấu Hình Phòng & Phòng Thủ Thuật
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-semibold px-3 hidden sm:inline">
          Bệnh Viện Răng Hàm Mặt Việt Anh Đức
        </span>
      </div>

      {/* VIEW 1: QUẢN LÝ HỆ THỐNG CHI NHÁNH & CƠ SỞ KHÁM (KHỚP 100% ÁNH MỚI CỦA USER) */}
      {activeView === 'branches' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Bệnh Viện Răng Hàm Mặt Việt Anh Đức | Đang đăng nhập: <strong className="text-slate-700">Chủ phòng khám / Admin</strong>
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Quản lý Hệ thống Chi nhánh & Cơ sở khám
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình danh sách cơ sở, phân bổ số lượng ghế nha khoa, phòng mổ và bác sĩ phụ trách từng chi nhánh.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddBranchOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> + Thêm chi nhánh mới
            </button>
          </div>

          {/* Top 3 Summary KPI Cards (Khớp Ảnh mới của User) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Card 1: TỔNG SỐ CƠ SỞ */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  TỔNG SỐ CƠ SỞ
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">3 chi nhánh</h3>
                <p className="text-[11px] text-slate-500 font-semibold">2 Đang hoạt động, 1 Đang hoàn thiện</p>
              </div>
            </div>

            {/* Card 2: TỔNG SỐ GHẾ KHÁM */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  TỔNG SỐ GHẾ KHÁM
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">18 ghế nha khoa</h3>
                <p className="text-[11px] text-slate-500 font-semibold">12 Ghế khám tiêu chuẩn, 6 Phòng mổ vô trùng Implant</p>
              </div>
            </div>

            {/* Card 3: TỔNG NHÂN SỰ */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  TỔNG NHÂN SỰ
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">48 bác sĩ &amp; điều dưỡng</h3>
                <p className="text-[11px] text-slate-500 font-semibold">Đã phân bổ trên toàn hệ thống</p>
              </div>
            </div>
          </div>

          {/* Branch Cards Grid (3 Chi Nhánh Khớp 100% Ảnh Mới Của User) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* CARD 1: Chi nhánh Biên Hòa (Trụ sở chính) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                {/* Banner Header Image */}
                <div className="h-36 bg-gradient-to-r from-sky-800 to-indigo-900 relative p-3 flex items-start justify-between">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  <span className="relative z-10 px-3 py-1 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-xs">
                    ĐANG HOẠT ĐỘNG
                  </span>
                  <div className="relative z-10 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold">
                    🏢
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Chi nhánh Biên Hòa <span className="text-slate-400 text-xs font-normal">(Trụ sở chính)</span>
                    </h3>
                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai
                    </p>
                  </div>

                  {/* Metrics Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between font-extrabold text-slate-900">
                      <span className="flex items-center gap-1.5">🪑 8 Ghế nha khoa</span>
                      <span className="flex items-center gap-1.5">🩺 16 Bác sĩ</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Công suất hoạt động</span>
                        <span className="text-emerald-600">92%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 pt-0 grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => handleOpenDetailModal(MOCK_BRANCHES[1])}
                  className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-colors"
                >
                  Xem chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => setIsTransferStaffOpen(true)}
                  className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-colors"
                >
                  Phân bổ nhân sự
                </button>
                <button
                  type="button"
                  onClick={() => handleConfigureRoomsForBranch('b2')}
                  className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-900 rounded-xl transition-colors"
                >
                  Cấu hình phòng
                </button>
              </div>
            </div>

            {/* CARD 2: Chi nhánh Quận 1 - TP. Hồ Chí Minh */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                {/* Banner Header Image */}
                <div className="h-36 bg-gradient-to-r from-teal-800 to-sky-900 relative p-3 flex items-start justify-between">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  <span className="relative z-10 px-3 py-1 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-xs">
                    ĐANG HOẠT ĐỘNG
                  </span>
                  <div className="relative z-10 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold">
                    🏥
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Chi nhánh Quận 1 - TP. Hồ Chí Minh</h3>
                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      45 Đường Lê Duẩn, Phường Bến Nghé, Quận 1, TP. HCM
                    </p>
                  </div>

                  {/* Metrics Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between font-extrabold text-slate-900">
                      <span className="flex items-center gap-1.5">🪑 6 Ghế nha khoa</span>
                      <span className="flex items-center gap-1.5">🩺 12 Bác sĩ</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Công suất hoạt động</span>
                        <span className="text-sky-600">84%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800 rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => handleOpenDetailModal(MOCK_BRANCHES[0])}
                  className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-colors"
                >
                  Xem chi tiết
                </button>
                <button
                  type="button"
                  onClick={() => handleConfigureRoomsForBranch('b1')}
                  className="py-2.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-900 rounded-xl transition-colors"
                >
                  Cấu hình phòng
                </button>
              </div>
            </div>

            {/* CARD 3: Chi nhánh Long Thành (Đồng Nai) - Sắp Khai Trương */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                {/* Banner Header Image */}
                <div className="h-36 bg-slate-100 relative p-3 flex items-start justify-between border-b border-slate-200/60">
                  <span className="relative z-10 px-3 py-1 bg-amber-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-xs">
                    SẮP KHAI TRƯƠNG (10/2026)
                  </span>
                  <Wrench className="w-10 h-10 text-slate-300 opacity-60" />
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Chi nhánh Long Thành (Đồng Nai)</h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-1 italic">
                      <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      Đang cập nhật địa chỉ chính thức...
                    </p>
                  </div>

                  {/* Implementation Info Box */}
                  <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center gap-3">
                    <Info className="w-5 h-5 text-sky-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">Kế hoạch triển khai</h4>
                      <p className="text-[11px] text-sky-700 font-semibold mt-0.5">4 Ghế nha khoa dự kiến</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width Complete Setup Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(true)}
                  className="w-full py-2.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>⚡ Hoàn tất thiết lập</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CẤU HÌNH PHÒNG KHÁM & PHÒNG THỦ THUẬT */}
      {activeView === 'room_config' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <span>Quản lý chi nhánh</span>
                <span>&gt;</span>
                <span className="text-slate-900 font-bold">Cấu hình Chi nhánh</span>
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                Cấu hình Phòng khám &amp; Phòng thủ thuật
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-1 font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="bg-transparent font-extrabold focus:outline-none cursor-pointer"
                  >
                    {MOCK_BRANCHES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <span>Thiết lập danh sách ghế nha khoa, gán bác sĩ phụ trách và quản lý trạng thái bảo trì thiết bị.</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> + Thêm phòng khám mới
            </button>
          </div>

          {/* Summary Box */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-extrabold">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg font-extrabold">
                🪑
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">TỔNG SỐ</span>
                <span className="text-base text-slate-900 font-extrabold">8 Phòng</span>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <span className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> 6 Đang hoạt động
              </span>
              <span className="flex items-center gap-2 text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> 1 Đang khám
              </span>
              <span className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> 1 Bảo trì / Khử trùng
              </span>
            </div>
          </div>

          {/* Room Cards Grid */}
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
                      ? 'border-amber-300 bg-amber-50/20'
                      : isInUse
                      ? 'border-sky-300'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-3">
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
                              <span className="font-extrabold text-slate-900 text-xs block">{room.currentPatient.name}</span>
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
                          <p className="text-[11px] text-slate-500 font-medium pt-1">
                            🔧 <strong>Thiết bị:</strong> {room.equipment}
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
                          onClick={() => handleReopenRoom(room.id)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>▶ Mở lại hoạt động</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-[11px]">Cho phép đặt lịch Web</span>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={room.webBookingEnabled}
                          onChange={() => handleToggleWebBooking(room.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isMaintenance}
                        onClick={() => handleOpenChangeDoctor(room)}
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
                        onClick={() => handleOpenHistory(room)}
                        className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-[11px] rounded-xl transition-colors flex items-center justify-center gap-1"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" /> Lịch sử
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div
              onClick={() => setIsAddRoomOpen(true)}
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
      )}

      {/* MODAL: Xem Chi Tiết Chi Nhánh */}
      {isBranchDetailOpen && selectedBranchDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" /> Chi Tiết {selectedBranchDetail.name}
              </h3>
              <button type="button" onClick={() => setIsBranchDetailOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700">Địa chỉ chính thức:</span>
                <p className="text-slate-900 font-semibold">{selectedBranchDetail.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[11px] block">Số lượng phòng khám:</span>
                  <span className="text-lg font-extrabold text-sky-900">{selectedBranchDetail.roomCount} Ghế/Phòng</span>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <span className="text-slate-500 text-[11px] block">Bác sĩ phụ trách:</span>
                  <span className="text-lg font-extrabold text-teal-900">{selectedBranchDetail.doctorCount} Nhân sự</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsBranchDetailOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Đổi Bác Sĩ Phụ Trách */}
      {isChangeDoctorOpen && selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" /> Phân Bổ / Đổi Bác Sĩ Phụ Trách
              </h3>
              <button type="button" onClick={() => setIsChangeDoctorOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedRoom) {
                  setRooms((prev) =>
                    prev.map((r) => (r.id === selectedRoom.id ? { ...r, doctorName: selectedDoctorForRoom } : r))
                  );
                }
                setIsChangeDoctorOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-800">Phòng: {selectedRoom.name}</p>
                <p className="text-[11px] text-slate-500">{selectedRoom.floor}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Bác Sĩ Phụ Trách Mới:</label>
                <select
                  value={selectedDoctorForRoom}
                  onChange={(e) => setSelectedDoctorForRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  {MOCK_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} - {doc.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeDoctorOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs">
                  Cập Nhật Bác Sĩ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Lịch Sử Phòng */}
      {isRoomHistoryOpen && selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-sky-600" /> Lịch Sử Ca Khám - {selectedRoom.name}
              </h3>
              <button type="button" onClick={() => setIsRoomHistoryOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Bệnh nhân: Lê Văn A</p>
                  <p className="text-[11px] text-slate-500">Khám &amp; Cạo vôi răng (BS. Trần Đức Cường)</p>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">Hoàn thành</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsRoomHistoryOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Phòng Khám Mới */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-sky-600" /> Thêm Phòng Khám / Ghế Mới
              </h3>
              <button type="button" onClick={() => setIsAddRoomOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (roomName) {
                  setRooms((prev) => [
                    ...prev,
                    {
                      id: `r${Date.now()}`,
                      name: roomName,
                      floor: roomFloor,
                      status: 'Ready',
                      statusLabel: 'Sẵn sàng',
                      doctorName: 'BS. Nguyễn Minh Anh',
                      webBookingEnabled: true,
                    },
                  ]);
                }
                setIsAddRoomOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Phòng Khám:</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="VD: Phòng 05, Phòng mổ 02..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vị Trí &amp; Chuyên Khoa:</label>
                <input
                  type="text"
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                  placeholder="VD: Tầng 2 (Chỉnh nha)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs">
                  Tạo Phòng Khám
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Chi Nhánh Mới */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-600" /> Thêm Chi Nhánh Mới
              </h3>
              <button type="button" onClick={() => setIsAddBranchOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddBranchOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Chi Nhánh:</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="VD: Chi nhánh Quận 7"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Chi Nhánh:</label>
                <input
                  type="text"
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="VD: 120 Nguyễn Thị Thập, Q.7, TP.HCM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs">
                  Tạo Chi Nhánh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Điều Chuyển Nhân Sự */}
      {isTransferStaffOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-sky-600" /> Điều Chuyển Bác Sĩ &amp; Nhân Sự
              </h3>
              <button type="button" onClick={() => setIsTransferStaffOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsTransferStaffOpen(false); }} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Nhân Sự / Bác Sĩ:</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900">
                  {MOCK_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chuyển Đến Chi Nhánh:</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900">
                  {MOCK_BRANCHES.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferStaffOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs">
                  Xác Nhận Chuyển
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
