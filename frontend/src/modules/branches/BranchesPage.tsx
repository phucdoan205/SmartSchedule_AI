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
import { branchesApi, staffApi, appointmentApi, operatoriesApi } from '../../services/api';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import { toast } from '../../context/ToastContext';

export const BranchesPage: React.FC = () => {
  const { selectedBranchId: globalBranchId, refreshBranches: refreshGlobalBranches } = useBranch();
  const { user } = useAuth();
  const userRoleCode = rolePermissionStore.getUserRoleCode(user);
  const canEditBranches = rolePermissionStore.canEditBranches(userRoleCode, user);

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
  const [selectedStaffForTransfer, setSelectedStaffForTransfer] = useState<any | null>(null);

  // Branches & Staff Data
  const [branches, setBranches] = useState<any[]>([]);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [doctorsCount, setDoctorsCount] = useState<number>(0);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Helper to load and dynamically evaluate rooms from real appointments & sterilization buffer
  const getBranchRooms = (
    branchId: string,
    appointmentsList: any[] = [],
    dbRoomsList?: any[],
    branchDoctorsList?: any[],
  ): RoomItem[] => {
    const defaultEquipmentMap: Record<number, string> = {
      1: 'Máy lấy cao răng siêu âm Satelec',
      2: 'Máy lấy dấu kỹ thuật số 3Shape Trios',
      3: 'Máy phẫu thuật Implant Surgic Pro',
      4: 'Hệ thống khử khuẩn tia cực tím UV-C',
    };

    let roomsToMap: any[] = [];
    if (Array.isArray(dbRoomsList) && dbRoomsList.length > 0) {
      roomsToMap = dbRoomsList.map((r: any, idx: number) => {
        const chair = r.chairs?.[0];

        // 1. Kiểm tra nếu phòng này đã được đổi bác sĩ trong phiên làm việc (localStorage)
        let savedDocName: string | undefined;
        try {
          const cached = JSON.parse(localStorage.getItem(`smartschedule_branch_rooms_${branchId}`) || '[]');
          const match = cached.find((c: any) => c.id === r.id || c.name === r.name);
          if (match?.doctorName) savedDocName = match.doctorName;
        } catch (e) {}

        // 2. Bác sĩ phân công trong cơ sở dữ liệu
        let docName = savedDocName ||
          chair?.assignedDoctor?.user?.fullName ||
          r.assignedDoctorName;

        // 3. Nếu chưa gán, lấy từ danh sách bác sĩ thuộc phân bổ nhân sự của CHI NHÁNH ĐÓ
        if (!docName && Array.isArray(branchDoctorsList) && branchDoctorsList.length > 0) {
          const doc = branchDoctorsList[idx % branchDoctorsList.length];
          docName = doc?.name || doc?.fullName || doc?.user?.fullName;
        }

        if (!docName) {
          docName = 'Chưa phân công bác sĩ';
        }

        const eqName =
          chair?.equipments?.[0]?.name ||
          defaultEquipmentMap[idx + 1] ||
          'Máy lấy cao răng siêu âm Satelec';
        const floorStr = r.floor
          ? `Tầng ${r.floor} (${
              r.name.includes('mổ') || r.floor === 3
                ? 'Phẫu thuật Implant'
                : r.floor === 2
                ? 'Phục hình Sứ'
                : 'Khám & Cạo vôi'
            })`
          : `Tầng ${idx + 1}`;

        return {
          id: r.id,
          name: r.name,
          floor: floorStr,
          doctorName: docName,
          equipment: eqName,
          webBookingEnabled: true,
          initialMaintenance: chair?.status === 'MAINTENANCE' || r.isSterilized === false,
          chairId: chair?.id,
        };
      });
    } else {
      const baseRoomConfigs = [
        { id: 'r1', name: 'Phòng 01', floor: 'Tầng 1 (Khám & Cạo vôi)', equipment: 'Máy lấy cao răng siêu âm Satelec' },
        { id: 'r2', name: 'Phòng 02', floor: 'Tầng 2 (Phục hình Sứ)', equipment: 'Máy lấy dấu kỹ thuật số 3Shape Trios' },
        { id: 'r3', name: 'Phòng mổ 01', floor: 'Tầng 3 (Phẫu thuật Implant)', equipment: 'Máy phẫu thuật Implant Surgic Pro' },
        { id: 'r4', name: 'Phòng 04', floor: 'Tầng 1 (Chỉnh nha & Khám tổng quát)', equipment: 'Hệ thống khử khuẩn tia cực tím UV-C' },
      ];

      roomsToMap = baseRoomConfigs.map((br, idx) => {
        let savedDocName: string | undefined;
        try {
          const cached = JSON.parse(localStorage.getItem(`smartschedule_branch_rooms_${branchId}`) || '[]');
          const match = cached.find((c: any) => c.id === br.id || c.name === br.name);
          if (match?.doctorName) savedDocName = match.doctorName;
        } catch (e) {}

        let docName = savedDocName;
        if (!docName && Array.isArray(branchDoctorsList) && branchDoctorsList.length > 0) {
          const doc = branchDoctorsList[idx % branchDoctorsList.length];
          docName = doc?.name || doc?.fullName || doc?.user?.fullName;
        }

        if (!docName) {
          docName = 'Chưa phân công bác sĩ';
        }

        return {
          id: br.id,
          name: br.name,
          floor: br.floor,
          doctorName: docName,
          equipment: br.equipment,
          webBookingEnabled: true,
        };
      });
    }

    const branchAppts = appointmentsList.filter((a: any) => {
      return !a.branchId || a.branchId === branchId || a.branch?.id === branchId;
    });

    const now = new Date();

    return roomsToMap.map((baseRoom, index) => {
      const roomAppts = branchAppts.filter((a: any) => {
        const docName = a.doctor?.fullName || a.doctorName;
        return docName === baseRoom.doctorName || (!docName && index === 0);
      });

      // 1. Kiểm tra xem có ca khám nào ĐANG THỰC HIỆN (IN_PROGRESS) không
      const inProgressAppt = roomAppts.find((a: any) => {
        const st = (a.status || '').toUpperCase();
        return st === 'IN_PROGRESS' || st === 'INPROGRESS';
      });

      // 2. Kiểm tra xem có ca khám nào VỪA HOÀN THÀNH trong đệm vô trùng 15 phút không
      const recentCompletedAppt = roomAppts.find((a: any) => {
        const st = (a.status || '').toUpperCase();
        if (st !== 'COMPLETED') return false;
        const endTime = a.endTime ? new Date(a.endTime) : new Date(a.updatedAt || a.startTime);
        const bufferEnd = a.bufferEndTime
          ? new Date(a.bufferEndTime)
          : new Date(endTime.getTime() + 15 * 60 * 1000);
        return now >= endTime && now < bufferEnd;
      });

      // 3. Tìm ca khám tiếp theo sắp tới (CONFIRMED hoặc PENDING)
      const upcomingAppt = roomAppts.find((a: any) => {
        const st = (a.status || '').toUpperCase();
        if (st === 'CANCELLED' || st === 'COMPLETED' || st === 'IN_PROGRESS' || st === 'INPROGRESS') {
          return false;
        }
        const start = new Date(a.startTime);
        return start > now;
      });

      let status: 'InUse' | 'Ready' | 'Sterilized' | 'Maintenance' = 'Ready';
      let statusLabel = 'Sẵn sàng';
      let currentPatient: { name: string; time: string } | undefined = undefined;

      if (inProgressAppt) {
        status = 'InUse';
        statusLabel = 'Đang có bệnh nhân';
        const pName = inProgressAppt.patient?.fullName || inProgressAppt.patientName || 'Bệnh nhân';
        const startStr = inProgressAppt.startTime
          ? new Date(inProgressAppt.startTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '09:00';
        const endStr = inProgressAppt.endTime
          ? new Date(inProgressAppt.endTime).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '10:00';
        currentPatient = { name: pName, time: `${startStr} - ${endStr}` };
      } else if (recentCompletedAppt) {
        status = 'Sterilized';
        statusLabel = 'Đang vô trùng';
        currentPatient = undefined;
      } else if ((baseRoom as any).initialMaintenance) {
        status = 'Maintenance';
        statusLabel = 'Bảo trì / Thay lọc';
        currentPatient = undefined;
      } else {
        status = 'Ready';
        statusLabel = 'Sẵn sàng';
        currentPatient = undefined;
      }

      let nextAppointment: { time: string; service: string } | undefined = undefined;
      if (upcomingAppt) {
        const upStartStr = new Date(upcomingAppt.startTime).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        const serviceName =
          upcomingAppt.services?.[0]?.service?.name || upcomingAppt.service || 'Khám tổng quát';
        nextAppointment = { time: upStartStr, service: serviceName };
      }

      return {
        id: baseRoom.id,
        name: baseRoom.name,
        floor: baseRoom.floor,
        doctorName: baseRoom.doctorName,
        equipment: baseRoom.equipment,
        webBookingEnabled: baseRoom.webBookingEnabled,
        status,
        statusLabel,
        currentPatient,
        nextAppointment,
      };
    });
  };

  const [rooms, setRooms] = useState<RoomItem[]>([]);

  const loadRoomsForBranch = async (branchId: string, currentAppts: any[] = appointments) => {
    try {
      const [dbRooms, branchDocs] = await Promise.all([
        operatoriesApi.getByBranch(branchId).catch(() => []),
        staffApi.getDoctors({ branchId }).catch(() => []),
      ]);
      setRooms(getBranchRooms(branchId, currentAppts, dbRooms, branchDocs));
    } catch (e) {
      setRooms(getBranchRooms(branchId, currentAppts));
    }
  };

  React.useEffect(() => {
    const fetchBranchesAndStaff = async () => {
      try {
        const [data, staffList, appts] = await Promise.all([
          branchesApi.getAll(),
          staffApi.getAllStaff().catch(() => []),
          appointmentApi.getAppointments().catch(() => []),
        ]);
        const apptsArray = Array.isArray(appts) ? appts : appts?.data || [];
        setAppointments(apptsArray);

        if (data && data.length > 0) {
          setBranches(
            data.map((b: any, idx: number) => {
              const savedStatus = localStorage.getItem(`smartschedule_branch_status_${b.id}`);
              const savedLabel = localStorage.getItem(`smartschedule_branch_statusLabel_${b.id}`);
              const status = savedStatus || (b.isActive ? 'Active' : 'Inactive');
              const statusLabel =
                savedLabel ||
                (status === 'Active'
                  ? 'ĐANG HOẠT ĐỘNG'
                  : status === 'Maintenance'
                  ? 'BẢO TRÌ TẠM THỜI'
                  : 'TẠM NGƯNG');
              return {
                id: b.id,
                name: b.name,
                subtitle: idx === 0 ? '(Trụ sở chính)' : '',
                address: b.address,
                phone: b.phone,
                email: `${b.code.toLowerCase()}@vietanhduc.vn`,
                status,
                statusLabel,
                isActive: status === 'Active',
                roomCount: b.roomCount || 0,
                chairCount: b.chairCount || b.roomCount || 0,
                doctorCount: b.doctorCount || 0,
                performance: 92,
                image: b.imageUrl || (idx === 0 ? branch1Img : idx === 1 ? branch2Img : branch3Img),
              };
            }),
          );
          setSelectedBranchId(data[0].id);
          const [initialDbRooms, branchDocs] = await Promise.all([
            operatoriesApi.getByBranch(data[0].id).catch(() => []),
            staffApi.getDoctors({ branchId: data[0].id }).catch(() => []),
          ]);
          setRooms(getBranchRooms(data[0].id, apptsArray, initialDbRooms, branchDocs));
        }
        if (Array.isArray(staffList)) {
          setStaffCount(staffList.length);
          const docs = staffList.filter((s: any) => s.role === 'DOCTOR' || s.doctorProfile);
          setDoctorsCount(docs.length);
        }
      } catch (err) {
        console.error('Lỗi khi tải chi nhánh & nhân sự:', err);
      }
    };
    fetchBranchesAndStaff();
  }, []);

  React.useEffect(() => {
    if (globalBranchId && globalBranchId !== 'ALL' && branches.some((b) => b.id === globalBranchId)) {
      setSelectedBranchId(globalBranchId);
      loadRoomsForBranch(globalBranchId, appointments);
    }
  }, [globalBranchId, branches]);

  React.useEffect(() => {
    if (selectedBranchId) {
      loadRoomsForBranch(selectedBranchId, appointments);
    }
  }, [selectedBranchId]);

  const defaultBranch = {
    id: 'b-default',
    name: 'Chi nhánh',
    subtitle: '',
    address: 'Đang tải thông tin...',
    phone: '',
    email: '',
    status: 'Active',
    statusLabel: 'ĐANG HOẠT ĐỘNG',
    roomCount: 0,
    doctorCount: 0,
    performance: 0,
    image: branch1Img,
  };

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0] || defaultBranch;

  // Sync with Kanban drag-and-drop status changes in real-time
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('smartschedule_sync');
    ch.onmessage = async (e) => {
      if (e.data?.type === 'APPOINTMENT_STATUS_UPDATED' || e.data?.type === 'BRANCH_ROOMS_UPDATED') {
        const [freshAppts, freshBranches, freshDbRooms] = await Promise.all([
          appointmentApi.getAppointments().catch(() => []),
          branchesApi.getAll().catch(() => []),
          operatoriesApi.getByBranch(selectedBranchId).catch(() => []),
        ]);
        const apptsArray = Array.isArray(freshAppts) ? freshAppts : freshAppts?.data || [];
        setAppointments(apptsArray);
        if (Array.isArray(freshBranches) && freshBranches.length > 0) {
          setBranches(
            freshBranches.map((b: any, idx: number) => {
              const savedStatus = localStorage.getItem(`smartschedule_branch_status_${b.id}`);
              const savedLabel = localStorage.getItem(`smartschedule_branch_statusLabel_${b.id}`);
              const status = savedStatus || (b.isActive ? 'Active' : 'Inactive');
              const statusLabel =
                savedLabel ||
                (status === 'Active'
                  ? 'ĐANG HOẠT ĐỘNG'
                  : status === 'Maintenance'
                  ? 'BẢO TRÌ TẠM THỜI'
                  : 'TẠM NGƯNG');
              return {
                id: b.id,
                name: b.name,
                subtitle: idx === 0 ? '(Trụ sở chính)' : '',
                address: b.address,
                phone: b.phone,
                email: `${b.code.toLowerCase()}@vietanhduc.vn`,
                status,
                statusLabel,
                isActive: status === 'Active',
                roomCount: b.roomCount || 0,
                chairCount: b.chairCount || b.roomCount || 0,
                doctorCount: b.doctorCount || 0,
                performance: 92,
                image: b.imageUrl || (idx === 0 ? branch1Img : idx === 1 ? branch2Img : branch3Img),
              };
            }),
          );
        }
        setRooms(getBranchRooms(selectedBranchId, apptsArray, freshDbRooms));
      }
    };
    return () => ch.close();
  }, [selectedBranchId]);

  const handleOpenDetail = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('detail');
  };

  const handleOpenStaffAllocation = (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('staff_allocation');
  };

  const handleOpenRoomConfig = async (branchId: string) => {
    setSelectedBranchId(branchId);
    setActiveView('room_config');
    try {
      const [freshAppts, dbRooms, branchDocs] = await Promise.all([
        appointmentApi.getAppointments().catch(() => []),
        operatoriesApi.getByBranch(branchId).catch(() => []),
        staffApi.getDoctors({ branchId }).catch(() => []),
      ]);
      const apptsArray = Array.isArray(freshAppts) ? freshAppts : freshAppts?.data || [];
      setAppointments(apptsArray);
      setRooms(getBranchRooms(branchId, apptsArray, dbRooms, branchDocs));
    } catch (e) {
      loadRoomsForBranch(branchId);
    }
  };

  const handleToggleWebBooking = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, webBookingEnabled: !r.webBookingEnabled } : r))
    );
  };

  const handleReopenRoom = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, status: 'Ready' as const, statusLabel: 'Sẵn sàng' }
          : r
      )
    );
    toast('✓ Đã mở lại hoạt động cho phòng khám thành công!');
  };

  const handleOpenChangeDoctor = (room: RoomItem) => {
    setSelectedRoom(room);
    setIsChangeDoctorOpen(true);
  };

  const handleOpenHistory = (room: RoomItem) => {
    setSelectedRoom(room);
    setIsRoomHistoryOpen(true);
  };

  const handleSaveEditBranch = (updated: any) => {
    setBranches((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
    if (updated.id === selectedBranchId) {
      toast(`Đã cập nhật thông tin chi nhánh "${updated.name}"!`);
    }
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
    refreshGlobalBranches();
  };

  const handleAddNewRoom = async (roomData: any) => {
    try {
      const targetBranchId = selectedBranchId || branches[0]?.id;
      if (!targetBranchId) throw new Error('Chưa chọn chi nhánh');

      // 1. Lưu vào Database thật qua Backend API
      await branchesApi.createRoom(targetBranchId, roomData);

      // 2. Tải lại danh sách chi nhánh để cập nhật Stat Cards & Branch Cards từ Database thật!
      const [freshBranches, freshAppts, freshDbRooms] = await Promise.all([
        branchesApi.getAll(),
        appointmentApi.getAppointments().catch(() => []),
        operatoriesApi.getByBranch(targetBranchId).catch(() => []),
      ]);

      const apptsArray = Array.isArray(freshAppts) ? freshAppts : freshAppts?.data || [];
      setAppointments(apptsArray);

      if (freshBranches && freshBranches.length > 0) {
        setBranches(
          freshBranches.map((b: any, idx: number) => {
            const savedStatus = localStorage.getItem(`smartschedule_branch_status_${b.id}`);
            const savedLabel = localStorage.getItem(`smartschedule_branch_statusLabel_${b.id}`);
            const status = savedStatus || (b.isActive ? 'Active' : 'Inactive');
            const statusLabel =
              savedLabel ||
              (status === 'Active'
                ? 'ĐANG HOẠT ĐỘNG'
                : status === 'Maintenance'
                ? 'BẢO TRÌ TẠM THỜI'
                : 'TẠM NGƯNG');
            return {
              id: b.id,
              name: b.name,
              subtitle: idx === 0 ? '(Trụ sở chính)' : '',
              address: b.address,
              phone: b.phone,
              email: `${b.code.toLowerCase()}@vietanhduc.vn`,
              status,
              statusLabel,
              isActive: status === 'Active',
              roomCount: b.roomCount || 0,
              chairCount: b.chairCount || b.roomCount || 0,
              doctorCount: b.doctorCount || 0,
              performance: 92,
              image: b.imageUrl || (idx === 0 ? branch1Img : idx === 1 ? branch2Img : branch3Img),
            };
          }),
        );
      }

      // 3. Cập nhật danh sách phòng của chi nhánh hiện tại
      const branchDocs = await staffApi.getDoctors({ branchId: targetBranchId }).catch(() => []);
      setRooms(getBranchRooms(targetBranchId, apptsArray, freshDbRooms, branchDocs));

      // 4. Phát tín hiệu đồng bộ realtime
      refreshGlobalBranches();
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('smartschedule_sync');
        ch.postMessage({ type: 'BRANCH_ROOMS_UPDATED', branchId: targetBranchId });
        ch.close();
      }

      toast(`✓ Đã thêm phòng khám "${roomData.name}" và lưu vào cơ sở dữ liệu thành công!`);
    } catch (err: any) {
      console.error('Lỗi khi thêm phòng khám:', err);
      toast(err?.response?.data?.message || err?.message || 'Không thể tạo phòng khám. Vui lòng thử lại!');
      throw err;
    }
  };

  // Tính toán dữ liệu thời gian thực cho Stat Cards
  const totalBranches = branches.length;
  const activeBranches = branches.filter((b) => b.status === 'Active' || b.isActive).length;
  const inactiveBranches = totalBranches - activeBranches;

  const totalChairs = branches.reduce((sum, b) => sum + (b.chairCount || b.roomCount || 0), 0);
  const totalRooms = branches.reduce((sum, b) => sum + (b.roomCount || 0), 0);

  const totalStaff = staffCount || branches.reduce((sum, b) => sum + (b.doctorCount || 0), 0);
  const totalDocs = doctorsCount || branches.reduce((sum, b) => sum + (b.doctorCount || 0), 0);
  const otherStaff = totalStaff > totalDocs ? totalStaff - totalDocs : 0;

  return (
    <div className="space-y-6">

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

            {canEditBranches && (
              <button
                type="button"
                onClick={() => setIsAddBranchOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm chi nhánh mới
              </button>
            )}
          </div>

          {/* Top 3 Summary KPI Cards (Dữ Liệu Thật 100% Từ Cơ Sở Dữ Liệu) */}
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
                <h3 className="text-xl font-extrabold text-slate-900">{totalBranches} chi nhánh</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {activeBranches} Đang hoạt động{inactiveBranches > 0 ? `, ${inactiveBranches} Đang hoàn thiện` : ''}
                </p>
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
                <h3 className="text-xl font-extrabold text-slate-900">{totalChairs} ghế nha khoa</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {totalRooms} phòng khám tiêu chuẩn &amp; phòng mổ
                </p>
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
                <h3 className="text-xl font-extrabold text-slate-900">{totalStaff} bác sĩ &amp; nhân sự</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {totalDocs} Bác sĩ{otherStaff > 0 ? `, ${otherStaff} điều dưỡng/nhân viên` : ' phân bổ toàn hệ thống'}
                </p>
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
                            b.status === 'Maintenance' || b.status === 'maintenance'
                              ? 'bg-amber-500'
                              : b.status === 'Closed' || b.status === 'closed' || b.isActive === false
                              ? 'bg-rose-600'
                              : isUpcoming
                              ? 'bg-sky-600'
                              : 'bg-emerald-600'
                          }`}
                        >
                          {b.status === 'Maintenance' || b.status === 'maintenance'
                            ? 'BẢO TRÌ TẠM THỜI'
                            : b.status === 'Closed' || b.status === 'closed' || b.isActive === false
                            ? 'TẠM ĐÓNG CỬA'
                            : b.statusLabel}
                        </span>

                        <div className="w-8 h-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-bold text-xs">
                          {b.status === 'Maintenance' || b.status === 'maintenance' || isUpcoming ? <Wrench className="w-4 h-4" /> : '🏢'}
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
                            <span className="flex items-center gap-1.5">🪑 {b.chairCount || b.roomCount || 4} Ghế nha khoa</span>
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
          onOpenTransferModal={(staff) => {
            setSelectedStaffForTransfer(staff);
            setIsTransferStaffOpen(true);
          }}
          onOpenAddStaffModal={() => setIsAddStaffOpen(true)}
        />
      )}

      {/* VIEW 4: CẤU HÌNH PHÒNG KHÁM & PHÒNG THỦ THUẬT (Khớp 100% Ảnh "giao diện button cấu hình.png") */}
      {activeView === 'room_config' && (
        <RoomConfigView
          selectedBranchId={selectedBranchId}
          branchName={currentBranch?.name}
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
        onSave={handleSaveEditBranch}
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
        branchId={currentBranch?.id}
        branchName={currentBranch?.name || ''}
      />

      {/* 4. Modal: Điều Chuyển Bác Sĩ & Nhân Sự */}
      <TransferStaffModal
        isOpen={isTransferStaffOpen}
        onClose={() => {
          setIsTransferStaffOpen(false);
          setSelectedStaffForTransfer(null);
        }}
        fromBranchName={currentBranch?.name || ''}
        initialStaffId={selectedStaffForTransfer?.id}
      />

      {/* 5. Modal: Thêm & Thiết Lập Phòng Khám Mới */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        branchId={currentBranch?.id}
        branchName={currentBranch?.name || ''}
        onAddRoom={handleAddNewRoom}
      />

      {/* 6. Modal: Thay Đổi Bác Sĩ Phụ Trách Phòng Khám */}
      <ChangeDoctorModal
        isOpen={isChangeDoctorOpen}
        onClose={() => setIsChangeDoctorOpen(false)}
        room={selectedRoom}
        branchId={currentBranch?.id}
        branchName={currentBranch?.name || ''}
        onConfirmChange={async (newDoc, doctorId) => {
          if (selectedRoom) {
            setRooms((prev) => {
              const next = prev.map((r) => (r.id === selectedRoom.id ? { ...r, doctorName: newDoc } : r));
              const key = `smartschedule_branch_rooms_${selectedBranchId || 'default'}`;
              try {
                localStorage.setItem(key, JSON.stringify(next));
              } catch (e) {}
              return next;
            });

            if ((selectedRoom as any).chairId && doctorId) {
              try {
                await operatoriesApi.updateChairStatus((selectedRoom as any).chairId, 'AVAILABLE', doctorId);
              } catch (err) {
                console.warn('Không thể cập nhật bác sĩ vào DB chair:', err);
              }
            }
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
