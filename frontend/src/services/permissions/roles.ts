import type { SystemRoleItem } from './types';

// Default initial roles
export const DEFAULT_ROLES: SystemRoleItem[] = [
  {
    id: 'role_owner',
    code: 'owner',
    name: 'Chủ phòng khám',
    subtitle: '(Toàn quyền)',
    iconName: 'Building2',
    isSystem: true,
  },
  {
    id: 'role_doctor',
    code: 'doctor',
    name: 'Bác sĩ chuyên khoa',
    subtitle: '(Chuyên môn)',
    iconName: 'Stethoscope',
    isSystem: true,
  },
  {
    id: 'role_receptionist',
    code: 'receptionist',
    name: 'Lễ tân phòng khám',
    subtitle: '(Vận hành & Tiếp đón)',
    iconName: 'UserCheck',
    isSystem: true,
  },
  {
    id: 'role_nurse',
    code: 'nurse',
    name: 'Điều dưỡng viên',
    subtitle: '(Hỗ trợ điều trị)',
    iconName: 'Award',
    isSystem: true,
  },
  {
    id: 'role_technician',
    code: 'technician',
    name: 'Kỹ thuật viên xét nghiệm',
    subtitle: '(Chẩn đoán hình ảnh)',
    iconName: 'Wrench',
    isSystem: true,
  },
  {
    id: 'role_accountant',
    code: 'ke_toan',
    name: 'Kế Toán',
    subtitle: '(Tài chính & Lương thưởng)',
    iconName: 'DollarSign',
    isSystem: true,
  },
  {
    id: 'role_manager',
    code: 'manager',
    name: 'Quản lý chi nhánh',
    subtitle: '(Quản lý cơ sở)',
    iconName: 'Building',
    isSystem: true,
  },
];
