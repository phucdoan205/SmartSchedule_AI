import type {
  DoctorStaff,
  ShiftSchedule,
  LeaveRequest,
  Appointment,
  Branch,
  ServiceItem,
  AiInsightItem,
  SystemAuditLog,
} from '../types/admin';

export const CLOUDINARY_DOCTOR_1 = 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394602/smartschedule_ai/doctors/ldp6puin5gfouc0wsj54.jpg';
export const CLOUDINARY_DOCTOR_2 = 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394601/smartschedule_ai/doctors/vkie8jrp9liff0yrjcgy.jpg';

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

export const MOCK_AI_INSIGHTS: AiInsightItem[] = [
  {
    id: 'ai-1',
    title: 'Khử khuẩn vô trùng tự động kích hoạt',
    description: 'Khoảng đệm 15 phút sau mỗi ca phẫu thuật Implant đang được kiểm soát 100% không phát sinh xung đột ghế mổ.',
    impactLevel: 'High',
    category: 'Schedule Optimization',
    suggestedAction: 'Xem sơ đồ ghế khám',
    timestamp: 'Vừa xong',
  },
];

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'CN01',
    name: 'Chi nhánh Biên Hòa (Trụ sở chính)',
    address: '123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai',
    phone: '0236 6555 555',
    doctorCount: 8,
    roomCount: 4,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394598/smartschedule_ai/branches/hbof0tkdwotc5nvgbwc5.jpg',
  },
  {
    id: 'CN02',
    name: 'Chi nhánh Quận 1 (Trung tâm)',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    phone: '028 3822 1111',
    doctorCount: 6,
    roomCount: 3,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394599/smartschedule_ai/branches/lm4e0z8emvydtalxcsu0.jpg',
  },
  {
    id: 'CN03',
    name: 'Chi nhánh TP. Thủ Đức',
    address: '789 Đường Võ Văn Ngân, Phường Bình Thọ, TP. Thủ Đức, TP.HCM',
    phone: '028 3720 3333',
    doctorCount: 4,
    roomCount: 2,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394600/smartschedule_ai/branches/spek6sbrzvggnjjjonyi.jpg',
  },
];

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    code: 'DV-IMP-01',
    name: 'Cấy ghép 1 trụ Implant Straumann SLA (Thụy Sỹ)',
    category: 'Cấy ghép Implant',
    price: 43000000,
    deposit: 5000000,
    warranty: 'Trọn đời',
    durationMinutes: 60,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394589/smartschedule_ai/services/xhrybk8wd5nwl89btp7b.jpg',
    isAiRecommended: true,
  },
  {
    id: 'srv-2',
    code: 'DV-POR-01',
    name: 'Bọc Răng Sứ Toàn Phần Cercon HT (Đức)',
    category: 'Răng sứ thẩm mỹ',
    price: 6000000,
    deposit: 500000,
    warranty: '10 năm',
    durationMinutes: 60,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394593/smartschedule_ai/services/zbl0qrhqnoxavsubarkw.jpg',
    isAiRecommended: true,
  },
  {
    id: 'srv-3',
    code: 'DV-VEN-01',
    name: 'Mặt Dán Sứ Veneer Emax Siêu Mỏng (Thụy Sĩ)',
    category: 'Răng sứ thẩm mỹ',
    price: 8000000,
    deposit: 1000000,
    warranty: '10 năm',
    durationMinutes: 90,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394594/smartschedule_ai/services/awsiu55s7nzbbmbnewyn.jpg',
    isAiRecommended: true,
  },
  {
    id: 'srv-4',
    code: 'DV-WHT-01',
    name: 'Tẩy Trắng Răng Chuyên Sâu Laser Whitening',
    category: 'Nha khoa thẩm mỹ & Tổng quát',
    price: 5500000,
    deposit: 300000,
    warranty: '2 năm',
    durationMinutes: 45,
    status: 'Active',
    imageUrl: 'https://res.cloudinary.com/dolpobdpw/image/upload/v1789394597/smartschedule_ai/services/jffzudgw58llooasissg.jpg',
    isAiRecommended: false,
  },
];

export const MOCK_AUDIT_LOGS: SystemAuditLog[] = [];
