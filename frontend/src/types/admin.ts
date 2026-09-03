export type StaffRole = 'Doctor' | 'Nurse' | 'Receptionist' | 'Technician' | 'Manager';

export type StaffStatus = 'Active' | 'OnLeave' | 'OffDuty' | 'Busy';

export interface DoctorStaff {
  id: string;
  code: string;
  name: string;
  avatar: string;
  role: StaffRole;
  specialty: string;
  department: string;
  branch: string;
  phone: string;
  email: string;
  status: StaffStatus;
  rating: number;
  totalAppointments: number;
  salaryBase: number;
  allowance: number;
  commission: number;
}

export interface ShiftSchedule {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  avatar: string;
  role: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'Annual' | 'Sick' | 'Personal';
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorId: string;
  service: string;
  branch: string;
  dateTime: string;
  status: 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled' | 'InProgress';
  aiScore?: number;
  aiNote?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  doctorCount: number;
  roomCount: number;
  status: 'Active' | 'Maintenance' | 'Inactive';
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  status?: 'Active' | 'Inactive';
}

export interface FinanceReport {
  period: string;
  revenue: number;
  expense: number;
  profit: number;
  appointmentCount: number;
}

export interface AiInsightItem {
  id: string;
  title: string;
  description: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  category: 'Schedule Optimization' | 'Resource Allocation' | 'Patient Flow' | 'Revenue';
  suggestedAction: string;
  timestamp: string;
}

export interface SystemAuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  status: 'Success' | 'Warning' | 'Error' | 'Completed' | 'Failed';
}
