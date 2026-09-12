import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Users,
  Stethoscope,
  Plus,
  Info,
  Wrench,
} from 'lucide-react';
import { BranchDetailView } from './BranchDetailView';
import { StaffAllocationView } from './StaffAllocationView';
import { RoomConfigView, type RoomItem } from './RoomConfigView';

// Modals
import { EditBranchModal } from './modals/EditBranchModal';
import { AddBranchModal } from './modals/AddBranchModal';
import { AddStaffModal } from './modals/AddStaffModal';
import { TransferStaffModal } from './modals/TransferStaffModal';
import { AddRoomModal } from './modals/AddRoomModal';
import { ChangeDoctorModal } from './modals/ChangeDoctorModal';
import { RoomHistoryModal } from './modals/RoomHistoryModal';

// Images from assets
import branch1Img from '../../assets/cơ sở 1.jpg';
import branch2Img from '../../assets/cơ sở 2.jpg';
import branch3Img from '../../assets/cơ sở 3.jpg';

export const BranchesPage: React.FC = () => {
  // Navigation State
  const [activeView, setActiveView] = useState<'branches' | 'detail' | 'staff_allocation' | 'room_config'>('branches');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b-bienhoa');

  // Modals Visibility
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isTransferStaffOpen, setIsTransferStaffOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isChangeDoctorOpen, setIsChangeDoctorOpen] = useState(false);
  const [isRoomHistoryOpen, setIsRoomHistoryOpen] = useState(false);

  // Selected Room for Modals
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);

  // Branches Data
  const [branches, setBranches] = useState([
    {
      id: 'b-bienhoa',
      name: 'Chi nhánh Biên Hòa',
      subtitle: '(Trụ sở chính)',
      address: '123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai',
      phone: '0236 6555 555',
      email: 'bienhoa@vietanhduc.vn',
      status: 'Active',
      statusLabel: 'ĐANG HOẠT ĐỘNG',
      roomCount: 8,
      doctorCount: 16,
      performance: 92,
      image: branch1Img,
    },
    {
      id: 'b-quan1',
      name: 'Chi nhánh Quận 1 - TP. Hồ Chí Minh',
      subtitle: '',
      address: '45 Đường Lê Duẩn, Phường Bến Nghé, Quận 1, TP. HCM',
      phone: '028 3822 1111',
      email: 'quan1@vietanhduc.vn',
      status: 'Active',
      statusLabel: 'ĐANG HOẠT ĐỘNG',
      roomCount: 6,
      doctorCount: 12,
      performance: 84,
      image: branch2Img,
    },
    {
      id: 'b-longthanh',
      name: 'Chi nhánh Long Thành (Đồng Nai)',
      subtitle: '',
      address: 'Đang cập nhật địa chỉ chính thức...',
      phone: '0251 3888 999',
      email: 'longthanh@vietanhduc.vn',
      status: 'Upcoming',
      statusLabel: 'SẮP KHAI TRƯƠNG (10/2026)',
      roomCount: 4,
      doctorCount: 6,
      performance: 0,
      image: branch3Img,
    },
  ]);

  // Rooms Data State
  const [rooms, setRooms] = useState<RoomItem[]>([
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

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Actions for Navigation
  const handleOpenDetail = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('detail');
  };

  const handleOpenStaffAllocation = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('staff_allocation');
  };

  const handleOpenRoomConfig = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('room_config');
  };

  // Actions for Rooms
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

  const handleOpenChangeDoctor = (room: RoomItem) => {
    setSelectedRoom(room);
    setIsChangeDoctorOpen(true);
  };

  const handleOpenHistory = (room: RoomItem) => {
    setSelectedRoom(room);
    setIsRoomHistoryOpen(true);
  };

  const handleSaveUpdatedBranch = (updated: any) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
  };

  const handleAddNewBranch = (newBranch: any) => {
    setBranches((prev) => [
      ...prev,
      {
        ...newBranch,
        subtitle: '',
        statusLabel: newBranch.status === 'Active' ? 'ĐANG HOẠT ĐỘNG' : 'SẮP KHAI TRƯƠNG',
        performance: 0,
        image: branch3Img,
      },
    ]);
  };

  const handleAddNewRoom = (newRoom: any) => {
    setRooms((prev) => [...prev, newRoom]);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Sub-header */}
      <div className="flex items-center justify-between bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1 text-xs font-bold flex-wrap">
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
            ⚙️ Cấu Hình Phòng &amp; Phòng Thủ Thuật
          </button>
          {activeView === 'detail' && (
            <span className="px-3 py-1.5 bg-sky-50 text-sky-700 font-extrabold rounded-xl border border-sky-200">
              🔍 Đang xem chi tiết: {currentBranch.name}
            </span>
          )}
          {activeView === 'staff_allocation' && (
            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl border border-indigo-200">
              👥 Đang phân bổ nhân sự: {currentBranch.name}
            </span>
          )}
        </div>
      </div>

      {/* VIEW 1: QUẢN LÝ HỆ THỐNG CHI NHÁNH & CƠ SỞ KHÁM (KHỚP 100% ẢNH ADMIN) */}
      {activeView === 'branches' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold tracking-wide">
                Bệnh Viện Răng Hàm Mặt Việt Anh Đức | Đang đăng nhập: <strong className="text-slate-700">Chủ phòng khám / Admin</strong>
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Quản lý Hệ thống Chi nhánh &amp; Cơ sở khám
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
              <Plus className="w-4 h-4" /> Thêm chi nhánh mới
            </button>
          </div>

          {/* Top 3 Summary KPI Cards (Khớp Ảnh "giao diện trang quản lí chi nhánh.png") */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 text-xs">
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

          {/* Branch Cards Grid (Mỗi chi nhánh đều có đủ 3 button & ảnh thực tế từ folder assets) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs">
            {branches.map((b) => {
              const isUpcoming = b.status === 'Upcoming';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Real Image Header from assets with Overlay Badge */}
                    <div className="h-44 relative overflow-hidden bg-slate-900 group">
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                      {/* Top Tag Badge */}
                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                        <span
                          className={`px-3 py-1 font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-sm text-white ${
                            isUpcoming ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                        >
                          {b.statusLabel}
                        </span>

                        <div className="w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold text-xs">
                          {isUpcoming ? <Wrench className="w-4 h-4" /> : '🏢'}
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {b.name} {b.subtitle && <span className="text-slate-400 text-xs font-normal">{b.subtitle}</span>}
                        </h3>
                        <p className={`text-xs flex items-start gap-1.5 mt-1 ${isUpcoming ? 'text-slate-400 italic' : 'text-slate-500'}`}>
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          {b.address}
                        </p>
                      </div>

                      {/* Metrics Box */}
                      {!isUpcoming ? (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between font-extrabold text-slate-900">
                            <span className="flex items-center gap-1.5">🪑 {b.roomCount} Ghế nha khoa</span>
                            <span className="flex items-center gap-1.5">🩺 {b.doctorCount} Bác sĩ</span>
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-slate-500">Công suất hoạt động</span>
                              <span className={b.performance > 90 ? 'text-emerald-600' : 'text-sky-600'}>
                                {b.performance}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  b.performance > 90 ? 'bg-emerald-500' : 'bg-slate-800'
                                }`}
                                style={{ width: `${b.performance}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center gap-3">
                          <Info className="w-5 h-5 text-sky-600 shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-xs">Kế hoạch triển khai</h4>
                            <p className="text-[11px] text-sky-700 font-semibold mt-0.5">
                              {b.roomCount} Ghế nha khoa dự kiến
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3 Action Buttons Footer (Yêu Cầu Của User: Mỗi chi nhánh đều có 3 button) */}
                  <div className="p-5 pt-0 space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(b.id)}
                        className="py-2.5 px-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-bold text-slate-700 rounded-xl transition-all shadow-xs"
                      >
                        Xem chi tiết
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenStaffAllocation(b.id)}
                        className="py-2.5 px-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-bold text-slate-700 rounded-xl transition-all shadow-xs"
                      >
                        Phân bổ nhân sự
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenRoomConfig(b.id)}
                        className="py-2.5 px-1 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-bold text-slate-900 rounded-xl transition-all shadow-xs"
                      >
                        Cấu hình phòng
                      </button>
                    </div>

                    {isUpcoming && (
                      <button
                        type="button"
                        onClick={() => setIsAddRoomOpen(true)}
                        className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-sky-100"
                      >
                        <span>⚡ Hoàn tất thiết lập</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: CHI TIẾT CHI NHÁNH (Khớp 100% Ảnh "giao diện button xem chi tiết.png") */}
      {activeView === 'detail' && (
        <BranchDetailView
          branch={currentBranch}
          onBack={() => setActiveView('branches')}
          onOpenEdit={() => setIsEditBranchOpen(true)}
          onOpenStaffAllocation={() => setActiveView('staff_allocation')}
          onOpenRoomConfig={() => setActiveView('room_config')}
        />
      )}

      {/* VIEW 3: PHÂN BỔ NHÂN SỰ (Khớp 100% Ảnh "giao diện button phân bổ nhân sự.png") */}
      {activeView === 'staff_allocation' && (
        <StaffAllocationView
          branch={currentBranch}
          onBack={() => setActiveView('branches')}
          onOpenTransferModal={() => setIsTransferStaffOpen(true)}
          onOpenAddStaffModal={() => setIsAddStaffOpen(true)}
        />
      )}

      {/* VIEW 4: CẤU HÌNH PHÒNG KHÁM & PHÒNG THỦ THUẬT (Khớp 100% Ảnh "giao diện button cấu hình.png") */}
      {activeView === 'room_config' && (
        <RoomConfigView
          selectedBranchId={selectedBranchId}
          onSelectBranch={setSelectedBranchId}
          onBack={() => setActiveView('branches')}
          onOpenAddRoom={() => setIsAddRoomOpen(true)}
          onOpenChangeDoctor={handleOpenChangeDoctor}
          onOpenHistory={handleOpenHistory}
          rooms={rooms}
          onToggleWebBooking={handleToggleWebBooking}
          onReopenRoom={handleReopenRoom}
        />
      )}

      {/* ===================== TẤT CẢ CÁC MODAL CHUẨN THEO BỘ ẢNH ADMIN ===================== */}

      {/* 1. Modal: Chỉnh Sửa Thông Tin Chi Nhánh */}
      <EditBranchModal
        isOpen={isEditBranchOpen}
        onClose={() => setIsEditBranchOpen(false)}
        branch={currentBranch}
        onSave={handleSaveUpdatedBranch}
      />

      {/* 2. Modal: Thiết Lập & Thêm Chi Nhánh Mới */}
      <AddBranchModal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        onAddBranch={handleAddNewBranch}
      />

      {/* 3. Modal: Thêm & Phân Bổ Nhân Sự Vào Chi Nhánh */}
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        branchName={currentBranch.name}
      />

      {/* 4. Modal: Điều Chuyển Bác Sĩ & Nhân Sự */}
      <TransferStaffModal
        isOpen={isTransferStaffOpen}
        onClose={() => setIsTransferStaffOpen(false)}
        fromBranchName={currentBranch.name}
      />

      {/* 5. Modal: Thêm & Thiết Lập Phòng Khám Mới */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        branchName={currentBranch.name}
        onAddRoom={handleAddNewRoom}
      />

      {/* 6. Modal: Thay Đổi Bác Sĩ Phụ Trách Phòng Khám */}
      <ChangeDoctorModal
        isOpen={isChangeDoctorOpen}
        onClose={() => setIsChangeDoctorOpen(false)}
        room={selectedRoom}
        branchName={currentBranch.name}
        onConfirmChange={(newDoc) => {
          if (selectedRoom) {
            setRooms((prev) =>
              prev.map((r) => (r.id === selectedRoom.id ? { ...r, doctorName: newDoc } : r))
            );
          }
        }}
      />

      {/* 7. Modal: Nhật Ký & Lịch Sử Hoạt Động (2 Tab: Ca khám & Bảo trì) */}
      <RoomHistoryModal
        isOpen={isRoomHistoryOpen}
        onClose={() => setIsRoomHistoryOpen(false)}
        room={selectedRoom}
        branchName={currentBranch.name}
      />
    </div>
  );
};
