import type {
  DoctorStaff,
  ShiftSchedule,
  LeaveRequest,
  Appointment,
} from '../../types/admin';
import { CLOUDINARY_DOCTOR_1, CLOUDINARY_DOCTOR_2 } from './cloudinaryAssets';

export const MOCK_DOCTORS: DoctorStaff[] = [
  {
    id: 'nv-001',
    code: 'NV001',
    name: 'BS. Nguyễn Thị An',
    avatar: CLOUDINARY_DOCTOR_1,
    role: 'Doctor',
    specialty: 'Phục hình Răng sứ & Thẩm mỹ',
    department: 'Khoa Phục Hình',
    branch: 'Chi nhánh Biên Hòa',
    phone: '0901 234 567',
    email: 'nguyenthian@smartschedule.ai',
    status: 'Active',
    rating: 4.9,
    totalAppointments: 128,
    salaryBase: 35000000,
    allowance: 5000000,
    commission: 15000000,
    commissionRate: 15,
  },
  {
    id: 'nv-002',
    code: 'NV002',
    name: 'TS.BS. Nguyễn Minh Anh',
    avatar: CLOUDINARY_DOCTOR_2,
    role: 'Doctor',
    specialty: 'Cấy ghép Implant Chuyên Sâu',
    department: 'Khoa Implant',
    branch: 'Chi nhánh Biên Hòa',
    phone: '0903 123 456',
    email: 'minhanh.nguyen@smartschedule.ai',
    status: 'Active',
    rating: 5.0,
    totalAppointments: 210,
    salaryBase: 42000000,
    allowance: 6000000,
    commission: 25000000,
    commissionRate: 20,
  },
];

export const MOCK_SHIFTS: ShiftSchedule[] = [];
export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [];
export const MOCK_APPOINTMENTS: Appointment[] = [];
