import { apiClient } from './api';

export interface SubPermissionItem {
  id: string;
  code: string;
  name: string;
}

export interface SystemModuleItem {
  id: string;
  code: string;
  name: string;
  path: string;
  iconName: string;
  subPermissions: SubPermissionItem[];
}

export interface SystemRoleItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  iconName?: string;
  isSystem?: boolean;
}

// 15 Modules corresponding 1-to-1 with Sidebar
export const SYSTEM_MODULES: SystemModuleItem[] = [
  {
    id: 'mod_overview',
    code: 'overview',
    name: 'Module: Trang tổng quan',
    path: '/admin/overview',
    iconName: 'LayoutDashboard',
    subPermissions: [
      { id: 'p_ov_view', code: 'overview_view', name: 'Xem số liệu KPI tổng quan phòng khám' },
      { id: 'p_ov_exp', code: 'overview_export', name: 'Xuất biểu đồ & báo cáo tổng quan' },
    ],
  },
  {
    id: 'mod_appointments',
    code: 'appointments',
    name: 'Module: Lịch hẹn thông minh',
    path: '/admin/appointments',
    iconName: 'CalendarCheck',
    subPermissions: [
      { id: 'p_apt_view', code: 'appointments_view', name: 'Xem danh sách lịch hẹn (Toàn bộ)' },
      { id: 'p_apt_add', code: 'appointments_create', name: 'Thêm & đặt lịch hẹn khám mới' },
      { id: 'p_apt_edit', code: 'appointments_edit', name: 'Sửa giờ / Chuyển ca / Hủy lịch hẹn' },
      { id: 'p_apt_qr', code: 'appointments_checkin', name: 'Quét mã QR Check-in Kiosk tự động' },
    ],
  },
  {
    id: 'mod_patients',
    code: 'patients',
    name: 'Module: Khách hàng & Bệnh án',
    path: '/admin/patients',
    iconName: 'Users',
    subPermissions: [
      { id: 'p_pat_view', code: 'patients_view', name: 'Xem danh sách bệnh nhân & hồ sơ EMR' },
      { id: 'p_pat_create', code: 'patients_create', name: 'Tạo hồ sơ bệnh nhân mới' },
      { id: 'p_pat_edit', code: 'patients_edit', name: 'Chỉnh sửa thông tin cá nhân & tiền sử' },
      { id: 'p_pat_dental', code: 'patients_dental_chart', name: 'Cập nhật sơ đồ răng điện tử 3D' },
    ],
  },
  {
    id: 'mod_staff',
    code: 'staff',
    name: 'Module: Danh sách nhân sự',
    path: '/admin/staff',
    iconName: 'UserCheck',
    subPermissions: [
      { id: 'p_stf_view', code: 'staff_view', name: 'Xem danh sách bác sĩ & nhân viên y tế' },
      { id: 'p_stf_create', code: 'staff_create', name: 'Thêm hồ sơ bác sĩ / nhân sự mới' },
      { id: 'p_stf_edit', code: 'staff_edit', name: 'Chỉnh sửa hồ sơ, chuyên khoa & hợp đồng' },
      { id: 'p_stf_delete', code: 'staff_delete', name: 'Tạm khóa hoặc cho thôi việc nhân sự' },
    ],
  },
  {
    id: 'mod_staff_schedule',
    code: 'staff_schedule',
    name: 'Module: Lịch làm việc',
    path: '/admin/staff/schedule',
    iconName: 'CalendarDays',
    subPermissions: [
      { id: 'p_sch_view', code: 'schedule_view', name: 'Xem lịch trực ca của các phòng khám' },
      { id: 'p_sch_edit', code: 'schedule_edit', name: 'Phân ca & điều phối bác sĩ khám' },
    ],
  },
  {
    id: 'mod_staff_salary',
    code: 'staff_salary',
    name: 'Module: Quản lý lương thưởng',
    path: '/admin/staff/salary',
    iconName: 'DollarSign',
    subPermissions: [
      { id: 'p_sal_view', code: 'salary_view', name: 'Xem bảng tính lương cơ bản & hoa hồng' },
      { id: 'p_sal_edit', code: 'salary_edit', name: 'Điều chỉnh tỷ lệ hoa hồng & chốt lương' },
    ],
  },
  {
    id: 'mod_staff_leave',
    code: 'staff_leave',
    name: 'Module: Đăng ký nghỉ phép',
    path: '/admin/staff/leave',
    iconName: 'FileSpreadsheet',
    subPermissions: [
      { id: 'p_lve_view', code: 'leave_view', name: 'Xem danh sách đơn xin nghỉ phép' },
      { id: 'p_lve_appr', code: 'leave_approve', name: 'Phê duyệt / Từ chối đơn nghỉ phép' },
    ],
  },
  {
    id: 'mod_branches',
    code: 'branches',
    name: 'Module: Quản lý chi nhánh',
    path: '/admin/branches',
    iconName: 'Building2',
    subPermissions: [
      { id: 'p_br_view', code: 'branches_view', name: 'Xem danh sách phòng khám & chi nhánh' },
      { id: 'p_br_edit', code: 'branches_edit', name: 'Thêm mới hoặc sửa cấu hình chi nhánh' },
    ],
  },
  {
    id: 'mod_services',
    code: 'services',
    name: 'Module: Dịch vụ & Bảng giá',
    path: '/admin/services',
    iconName: 'Receipt',
    subPermissions: [
      { id: 'p_srv_view', code: 'services_view', name: 'Xem danh mục dịch vụ nha khoa & giá niêm yết' },
      { id: 'p_srv_edit', code: 'services_edit', name: 'Thêm dịch vụ & điều chỉnh bảng giá' },
    ],
  },
  {
    id: 'mod_finance',
    code: 'finance',
    name: 'Module: Báo cáo tài chính',
    path: '/admin/finance',
    iconName: 'BarChart3',
    subPermissions: [
      { id: 'p_fin_view', code: 'finance_view', name: 'Xem báo cáo doanh thu & dòng tiền' },
      { id: 'p_fin_rec', code: 'finance_receipt', name: 'Lập phiếu thu & đối soát VietQR' },
      { id: 'p_fin_exp', code: 'finance_export', name: 'Xuất sổ sách kế toán Excel/PDF' },
    ],
  },
  {
    id: 'mod_maintenance',
    code: 'maintenance',
    name: 'Module: Danh sách thiết bị',
    path: '/admin/maintenance',
    iconName: 'Wrench',
    subPermissions: [
      { id: 'p_eq_view', code: 'equipment_view', name: 'Xem danh mục ghế máy & trang thiết bị' },
      { id: 'p_eq_edit', code: 'equipment_edit', name: 'Cập nhật trạng thái bảo trì ghế & máy X-Quang' },
    ],
  },
  {
    id: 'mod_maintenance_notifications',
    code: 'maintenance_notifications',
    name: 'Module: Thông báo & Bảo trì',
    path: '/admin/maintenance/notifications',
    iconName: 'Bell',
    subPermissions: [
      { id: 'p_not_view', code: 'notifications_view', name: 'Xem cảnh báo bảo trì định kỳ thiết bị' },
      { id: 'p_not_create', code: 'notifications_create', name: 'Tạo lệnh yêu cầu kỹ thuật khẩn cấp' },
    ],
  },
  {
    id: 'mod_ai_insights',
    code: 'ai_insights',
    name: 'Module: AI Insights & Schedule',
    path: '/admin/ai-insights',
    iconName: 'Sparkles',
    subPermissions: [
      { id: 'p_ai_view', code: 'ai_view', name: 'Xem gợi ý xếp ca & cảnh báo quá tải AI' },
      { id: 'p_ai_cfg', code: 'ai_configure', name: 'Điều chỉnh trọng số thuật toán AI' },
    ],
  },
  {
    id: 'mod_audit_logs',
    code: 'audit_logs',
    name: 'Module: Nhật ký hệ thống',
    path: '/admin/audit-logs',
    iconName: 'ScrollText',
    subPermissions: [
      { id: 'p_aud_view', code: 'audit_view', name: 'Xem lịch sử truy cập & thay đổi dữ liệu' },
    ],
  },
  {
    id: 'mod_settings',
    code: 'settings',
    name: 'Module: Cấu hình hệ thống',
    path: '/admin/settings',
    iconName: 'Settings',
    subPermissions: [
      { id: 'p_set_view', code: 'settings_view', name: 'Xem cấu hình phân quyền hệ thống' },
      { id: 'p_set_edit', code: 'settings_edit', name: 'Thêm chức vụ & sửa ma trận RBAC' },
    ],
  },
];

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
    id: 'role_manager',
    code: 'manager',
    name: 'Quản lý chi nhánh',
    subtitle: '(Quản lý cơ sở)',
    iconName: 'Building',
    isSystem: true,
  },
];

export interface ModulePermissionState {
  enabled: boolean;
  subPermissions: Record<string, boolean>; // subPermCode -> boolean
}

export type MatrixState = Record<string, Record<string, ModulePermissionState>>; 
// roleCode -> moduleCode -> { enabled, subPermissions }

const STORAGE_KEY_ROLES = 'smartschedule_system_roles';
const STORAGE_KEY_MATRIX = 'smartschedule_rbac_matrix';

// Initial default matrix
const buildDefaultMatrix = (roles: SystemRoleItem[]): MatrixState => {
  const matrix: MatrixState = {};

  roles.forEach((r) => {
    matrix[r.code] = {};
    SYSTEM_MODULES.forEach((mod) => {
      const subPerms: Record<string, boolean> = {};
      let isEnabled = false;

      if (r.code === 'owner') {
        // Owner has everything
        isEnabled = true;
        mod.subPermissions.forEach((sp) => {
          subPerms[sp.code] = true;
        });
      } else if (r.code === 'doctor') {
        // Doctor: overview, appointments, patients, schedule, services, ai_insights
        const doctorModules = ['overview', 'appointments', 'patients', 'staff_schedule', 'services', 'ai_insights'];
        if (doctorModules.includes(mod.code)) {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            // Can view, check-in, dental chart, but not delete
            subPerms[sp.code] = !sp.code.includes('delete') && !sp.code.includes('cfg');
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      } else if (r.code === 'receptionist') {
        // Receptionist: overview, appointments, patients, finance (receipts), staff_leave
        const recepModules = ['overview', 'appointments', 'patients', 'finance', 'staff_leave'];
        if (recepModules.includes(mod.code)) {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = sp.code.includes('view') || sp.code.includes('create') || sp.code.includes('receipt') || sp.code.includes('checkin');
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      } else if (r.code === 'nurse') {
        // Nurse: appointments, patients, schedule, maintenance
        const nurseModules = ['appointments', 'patients', 'staff_schedule', 'maintenance'];
        if (nurseModules.includes(mod.code)) {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = sp.code.includes('view');
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      } else if (r.code === 'technician') {
        // Technician: patients, maintenance
        const techModules = ['patients', 'maintenance', 'maintenance_notifications'];
        if (techModules.includes(mod.code)) {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = sp.code.includes('view') || sp.code.includes('edit');
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      } else if (r.code === 'manager') {
        // Manager: overview, appointments, patients, staff, schedule, branches, services, finance
        const mgrModules = ['overview', 'appointments', 'patients', 'staff', 'staff_schedule', 'branches', 'services', 'finance'];
        if (mgrModules.includes(mod.code)) {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = true;
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      } else {
        // Custom roles: default to view overview & appointments
        if (mod.code === 'overview' || mod.code === 'appointments') {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = sp.code.includes('view');
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      }

      matrix[r.code][mod.code] = {
        enabled: isEnabled,
        subPermissions: subPerms,
      };
    });
  });

  return matrix;
};

// Listeners for store changes
type Listener = () => void;
const listeners = new Set<Listener>();

export const rolePermissionStore = {
  getRoles(): SystemRoleItem[] {
    const saved = localStorage.getItem(STORAGE_KEY_ROLES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Error parsing stored roles', e);
      }
    }
    return DEFAULT_ROLES;
  },

  getModules(): SystemModuleItem[] {
    return SYSTEM_MODULES;
  },

  getMatrix(): MatrixState {
    const roles = this.getRoles();
    const saved = localStorage.getItem(STORAGE_KEY_MATRIX);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure all roles and modules exist in parsed matrix
        roles.forEach((r) => {
          if (!parsed[r.code]) {
            parsed[r.code] = {};
          }
          SYSTEM_MODULES.forEach((m) => {
            if (!parsed[r.code][m.code]) {
              const subPerms: Record<string, boolean> = {};
              m.subPermissions.forEach((sp) => {
                subPerms[sp.code] = r.code === 'owner';
              });
              parsed[r.code][m.code] = {
                enabled: r.code === 'owner',
                subPermissions: subPerms,
              };
            }
          });
        });
        return parsed;
      } catch (e) {
        console.error('Error parsing stored matrix', e);
      }
    }
    return buildDefaultMatrix(roles);
  },

  addRole(name: string, description?: string): SystemRoleItem {
    const roles = this.getRoles();
    const cleanName = name.trim();
    const code = cleanName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || `role_${Date.now()}`;

    const newRole: SystemRoleItem = {
      id: `role_${Date.now()}`,
      code,
      name: cleanName,
      subtitle: description || '(Chức vụ mới)',
      iconName: 'UserCheck',
      isSystem: false,
    };

    const nextRoles = [...roles, newRole];
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(nextRoles));

    // Initialize matrix for new role
    const matrix = this.getMatrix();
    matrix[code] = {};
    SYSTEM_MODULES.forEach((mod) => {
      const subPerms: Record<string, boolean> = {};
      // Default: overview view enabled
      const isEnabled = mod.code === 'overview';
      mod.subPermissions.forEach((sp) => {
        subPerms[sp.code] = mod.code === 'overview' && sp.code.includes('view');
      });
      matrix[code][mod.code] = {
        enabled: isEnabled,
        subPermissions: subPerms,
      };
    });

    localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(matrix));

    // Try persisting to backend asynchronously
    try {
      apiClient.post('/roles', { name: cleanName, description }).catch(() => {});
    } catch {}

    this.notify();
    return newRole;
  },

  saveMatrix(newMatrix: MatrixState) {
    localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(newMatrix));

    // Convert to flat codes map for backend sync
    const backendPayload: Record<string, string[]> = {};
    Object.entries(newMatrix).forEach(([roleCode, moduleMap]) => {
      const codes: string[] = [];
      Object.entries(moduleMap).forEach(([modCode, state]) => {
        if (state.enabled) {
          codes.push(modCode);
          Object.entries(state.subPermissions).forEach(([spCode, val]) => {
            if (val) codes.push(spCode);
          });
        }
      });
      backendPayload[roleCode] = codes;
    });

    try {
      apiClient.put('/roles/matrix', { matrix: backendPayload }).catch(() => {});
    } catch {}

    this.notify();
  },

  // Check if a path is allowed for a user role
  isModuleAllowedForRole(roleNameOrCode?: string, path?: string): boolean {
    if (!path) return true;
    const matrix = this.getMatrix();
    const roles = this.getRoles();

    // Owner / SUPER_ADMIN or ADMIN always sees everything
    if (!roleNameOrCode || roleNameOrCode === 'SUPER_ADMIN' || roleNameOrCode === 'ADMIN' || roleNameOrCode === 'owner' || roleNameOrCode === 'Chủ phòng khám') {
      return true;
    }

    // Match role code
    const matchedRole = roles.find(
      (r) =>
        r.code.toLowerCase() === roleNameOrCode.toLowerCase() ||
        r.name.toLowerCase() === roleNameOrCode.toLowerCase()
    );

    const roleCode = matchedRole ? matchedRole.code : roleNameOrCode.toLowerCase();

    // Match module by path
    const matchedModule = SYSTEM_MODULES.find((m) => m.path === path);
    if (!matchedModule) return true; // If not in restricted modules list, permit

    const roleState = matrix[roleCode]?.[matchedModule.code];
    if (!roleState) return true; // Default fallback to visible

    return Boolean(roleState.enabled);
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notify() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in store listener', err);
      }
    });
  },
};
