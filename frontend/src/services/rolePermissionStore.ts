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
      { id: 'p_apt_exp', code: 'appointments_export', name: 'Xuất danh sách lịch hẹn Excel/CSV' },
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
      { id: 'p_stf_exp', code: 'staff_export', name: 'Xuất danh sách nhân sự ra file Excel' },
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
      { id: 'p_sch_edit', code: 'schedule_edit', name: 'Phân ca, xếp lịch & điều phối nhân sự' },
      { id: 'p_sch_exp', code: 'schedule_export', name: 'Xuất bảng phân ca làm việc ra file Excel' },
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
      { id: 'p_sal_edit', code: 'salary_edit', name: 'Điều chỉnh phụ cấp, thưởng & tỷ lệ hoa hồng' },
      { id: 'p_sal_manage', code: 'salary_manage', name: 'Chốt bảng lương tháng & duyệt toàn viện' },
      { id: 'p_sal_exp', code: 'salary_export', name: 'Xuất bảng tổng hợp lương Excel/PDF' },
    ],
  },
  {
    id: 'mod_staff_leave',
    code: 'staff_leave',
    name: 'Module: Đăng ký nghỉ phép',
    path: '/admin/staff/leave',
    iconName: 'FileSpreadsheet',
    subPermissions: [
      { id: 'p_lve_view', code: 'leave_view', name: 'Xem & Tạo đơn xin nghỉ cá nhân' },
      { id: 'p_lve_all', code: 'leave_view_all', name: 'Xem lịch sử đơn nghỉ phép toàn phòng khám' },
      { id: 'p_lve_appr', code: 'leave_approve', name: 'Phê duyệt / Từ chối đơn nghỉ phép của nhân sự' },
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
      { id: 'p_br_filter', code: 'branches_filter', name: 'Lọc dữ liệu theo chi nhánh (Bộ lọc chi nhánh trên thanh điều hướng)' },
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
      { id: 'p_srv_create', code: 'services_create', name: 'Thêm mới dịch vụ nha khoa' },
      { id: 'p_srv_edit', code: 'services_edit', name: 'Chỉnh sửa thông tin & hình ảnh dịch vụ' },
      { id: 'p_srv_toggle', code: 'services_toggle', name: 'Bật/Tắt công tắc áp dụng (Ẩn/Hiện dịch vụ trên trang chủ & người dùng)' },
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
      { id: 'p_eq_view', code: 'equipment_view', name: 'Xem danh mục ghế máy & trang thiết bị y tế' },
      { id: 'p_eq_create', code: 'equipment_create', name: 'Thêm mới thiết bị máy móc vào hệ thống' },
      { id: 'p_eq_schedule', code: 'equipment_schedule', name: 'Lên lịch bảo dưỡng & kiểm định thiết bị' },
      { id: 'p_eq_edit', code: 'equipment_edit', name: 'Chỉnh sửa thông tin & cập nhật trạng thái máy' },
      { id: 'p_eq_export', code: 'equipment_export', name: 'Xuất biên bản kiểm định & hồ sơ kỹ thuật' },
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
      { id: 'p_not_create', code: 'notifications_create', name: 'Báo sự cố khẩn cấp & Tạo lệnh yêu cầu kỹ thuật' },
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
      { id: 'p_ai_exp', code: 'ai_export', name: 'Xuất báo cáo phân tích xu hướng AI' },
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
      { id: 'p_aud_exp', code: 'audit_export', name: 'Xuất báo cáo nhật ký kiểm toán Excel' },
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
        // Doctor: overview, appointments, patients, schedule, leave, services, ai_insights
        const doctorModules = ['overview', 'appointments', 'patients', 'staff_schedule', 'staff_leave', 'services', 'ai_insights'];
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
      } else if (r.code === 'ke_toan' || r.code === 'accountant' || r.name.toLowerCase().includes('kế toán')) {
        // Kế toán: overview, staff, staff_schedule, staff_salary, staff_leave, finance, branches
        const acctModules = ['overview', 'staff', 'staff_schedule', 'staff_salary', 'staff_leave', 'finance', 'branches'];
        if (acctModules.includes(mod.code)) {
          isEnabled = true;
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = true;
          });
        } else {
          mod.subPermissions.forEach((sp) => {
            subPerms[sp.code] = false;
          });
        }
      } else if (r.code === 'manager') {
        // Manager: overview, appointments, patients, staff, schedule, branches, services, finance, leave
        const mgrModules = ['overview', 'appointments', 'patients', 'staff', 'staff_schedule', 'staff_leave', 'branches', 'services', 'finance'];
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
            } else {
              if (!parsed[r.code][m.code].subPermissions) {
                parsed[r.code][m.code].subPermissions = {};
              }
              m.subPermissions.forEach((sp) => {
                if (parsed[r.code][m.code].subPermissions[sp.code] === undefined) {
                  parsed[r.code][m.code].subPermissions[sp.code] =
                    r.code === 'owner' || Boolean(parsed[r.code][m.code].enabled);
                }
              });
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

  async syncFromBackend(): Promise<SystemRoleItem[]> {
    try {
      const res = await apiClient.get('/roles');
      const dbRoles: Array<{ id: string; name: string; description?: string; permissions?: string[] }> =
        Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      if (dbRoles.length === 0) return this.getRoles();

      const defaultRoleMap: Record<string, string> = {
        'SUPER_ADMIN': 'owner',
        'DOCTOR': 'doctor',
        'RECEPTIONIST': 'receptionist',
        'NURSE': 'nurse',
        'TECHNICIAN': 'technician',
        'Kế Toán': 'ke_toan',
        'BRANCH_MANAGER': 'manager',
      };

      const systemRoles = DEFAULT_ROLES.map((defRole) => {
        const foundDb = dbRoles.find(
          (dr) =>
            dr.name === defRole.name ||
            defaultRoleMap[dr.name] === defRole.code ||
            dr.name.toLowerCase() === defRole.name.toLowerCase(),
        );
        if (foundDb) {
          return {
            ...defRole,
            id: foundDb.id,
            subtitle: foundDb.description || defRole.subtitle,
          };
        }
        return defRole;
      });

      const customDbRoles: SystemRoleItem[] = [];
      dbRoles.forEach((dr) => {
        if (!dr.name || dr.name.toUpperCase() === 'PATIENT') return;
        const isDefault =
          Object.keys(defaultRoleMap).includes(dr.name) ||
          systemRoles.some((sr) => sr.id === dr.id || sr.name.toLowerCase() === dr.name.toLowerCase());

        if (!isDefault) {
          const code =
            dr.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, '') || `role_${dr.id.slice(0, 6)}`;

          customDbRoles.push({
            id: dr.id,
            code,
            name: dr.name,
            subtitle: dr.description || 'Chức vụ mới',
            iconName: dr.name.toLowerCase().includes('kế toán') ? 'DollarSign' : 'UserCheck',
            isSystem: false,
          });
        }
      });

      const nextRoles = [...systemRoles, ...customDbRoles];
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(nextRoles));

      // Reconstruct matrix directly from database permissions
      const currentMatrix = this.getMatrix();
      dbRoles.forEach((dr) => {
        const matchedSystemRole = nextRoles.find(
          (r) => r.id === dr.id || r.name.toLowerCase() === dr.name.toLowerCase(),
        );
        if (!matchedSystemRole) return;
        const roleCode = matchedSystemRole.code;

        if (Array.isArray(dr.permissions) && dr.permissions.length > 0) {
          if (!currentMatrix[roleCode]) currentMatrix[roleCode] = {};
          SYSTEM_MODULES.forEach((mod) => {
            const hasModule =
              dr.permissions!.includes(mod.code) ||
              mod.subPermissions.some((sp) => dr.permissions!.includes(sp.code));
            const subPerms: Record<string, boolean> = {};
            mod.subPermissions.forEach((sp) => {
              subPerms[sp.code] =
                dr.permissions!.includes(sp.code) || (hasModule && dr.name === 'SUPER_ADMIN');
            });
            currentMatrix[roleCode][mod.code] = {
              enabled: hasModule || dr.name === 'SUPER_ADMIN',
              subPermissions: subPerms,
            };
          });
        }
      });

      localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(currentMatrix));
      this.notify();
      return nextRoles;
    } catch (e) {
      console.warn('Could not sync roles from backend:', e);
      return this.getRoles();
    }
  },

  async addRole(name: string, description?: string): Promise<SystemRoleItem> {
    const roles = this.getRoles();
    const cleanName = name.trim();
    const code =
      cleanName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '') || `role_${Date.now()}`;

    // Call backend API to persist into PostgreSQL DB
    let createdServerId = `role_${Date.now()}`;
    try {
      const res = await apiClient.post('/roles', {
        name: cleanName,
        description: description?.trim(),
      });
      if (res.data?.data?.id || res.data?.id) {
        createdServerId = res.data?.data?.id || res.data?.id;
      }
    } catch (err) {
      console.warn('Lỗi gọi API lưu vai trò vào CSDL:', err);
    }

    const newRole: SystemRoleItem = {
      id: createdServerId,
      code,
      name: cleanName,
      subtitle: description?.trim() || '(Chức vụ mới)',
      iconName: cleanName.toLowerCase().includes('kế toán') ? 'DollarSign' : 'UserCheck',
      isSystem: false,
    };

    const nextRoles = [...roles, newRole];
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(nextRoles));

    // Initialize matrix for new role
    const matrix = this.getMatrix();
    matrix[code] = {};
    SYSTEM_MODULES.forEach((mod) => {
      const subPerms: Record<string, boolean> = {};
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
    this.saveMatrix(matrix);

    this.notify();
    return newRole;
  },

  async updateRole(idOrCode: string, name: string, description?: string): Promise<SystemRoleItem> {
    const roles = this.getRoles();
    const cleanName = name.trim();
    const targetIdx = roles.findIndex((r) => r.id === idOrCode || r.code === idOrCode);
    if (targetIdx === -1) {
      throw new Error('Không tìm thấy vai trò cần cập nhật');
    }

    const currentRole = roles[targetIdx];
    const updateTargetId = currentRole.id || currentRole.code;

    let serverUpdated: any = null;
    try {
      const res = await apiClient.patch(`/roles/${updateTargetId}`, {
        name: cleanName,
        description: description?.trim(),
      });
      serverUpdated = res.data?.data || res.data;
    } catch (err: any) {
      console.error('Lỗi cập nhật vai trò trên máy chủ:', err);
    }

    const updatedRole: SystemRoleItem = {
      ...currentRole,
      id: serverUpdated?.id || currentRole.id,
      name: cleanName,
      subtitle: description?.trim() || currentRole.subtitle,
    };

    const nextRoles = [...roles];
    nextRoles[targetIdx] = updatedRole;
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(nextRoles));

    this.notify();
    return updatedRole;
  },

  async deleteRole(idOrCode: string): Promise<void> {
    const roles = this.getRoles();
    const target = roles.find((r) => r.id === idOrCode || r.code === idOrCode);
    if (!target) {
      throw new Error('Không tìm thấy chức vụ cần xóa');
    }

    if (target.code === 'owner') {
      throw new Error('Không thể xóa quyền Chủ phòng khám hệ thống');
    }

    const deleteTargetId = target.id || target.code;

    // Call backend API
    await apiClient.delete(`/roles/${deleteTargetId}`);

    // Remove from roles list
    const nextRoles = roles.filter((r) => r.id !== target.id && r.code !== target.code);
    localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(nextRoles));

    // Remove from matrix
    const matrix = this.getMatrix();
    delete matrix[target.code];
    localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(matrix));

    this.notify();
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
  // Check if a path is allowed for a user role
  isModuleAllowedForRole(roleNameOrCode?: string, path?: string, user?: any): boolean {
    if (!path) return true;
    const matrix = this.getMatrix();
    const roles = this.getRoles();

    const effectiveCode = (user ? this.getUserRoleCode(user) : '') || roleNameOrCode || '';
    if (!effectiveCode) return false;

    // Owner / SUPER_ADMIN or ADMIN always sees everything
    const lower = effectiveCode.toLowerCase();
    if (
      lower === 'owner' ||
      lower === 'super_admin' ||
      lower === 'admin' ||
      lower === 'chủ phòng khám' ||
      user?.email === 'admin@smartschedule.ai'
    ) {
      return true;
    }

    // Match role code
    const matchedRole = roles.find(
      (r) =>
        r.id === effectiveCode ||
        r.code.toLowerCase() === lower ||
        r.name.toLowerCase() === lower,
    );

    const roleCode = matchedRole ? matchedRole.code : lower;

    // Match module by path
    const matchedModule = SYSTEM_MODULES.find((m) => m.path === path);
    if (!matchedModule) return true; // If not in restricted modules list, permit

    const roleState = matrix[roleCode]?.[matchedModule.code];
    if (roleState !== undefined) {
      return Boolean(roleState.enabled);
    }

    // Fallback: check user.permissions if available
    if (user?.permissions && Array.isArray(user.permissions)) {
      return (
        user.permissions.includes(matchedModule.code) ||
        matchedModule.subPermissions.some((sp) => user.permissions.includes(sp.code))
      );
    }

    return false;
  },

  getFirstAllowedPathForRole(roleNameOrCode?: string, user?: any): string {
    const effectiveCode = (user ? this.getUserRoleCode(user) : '') || roleNameOrCode || '';
    const lower = effectiveCode.toLowerCase();
    if (
      lower === 'owner' ||
      lower === 'super_admin' ||
      lower === 'admin' ||
      lower === 'chủ phòng khám' ||
      user?.email === 'admin@smartschedule.ai'
    ) {
      return '/admin/overview';
    }

    for (const mod of SYSTEM_MODULES) {
      if (this.isModuleAllowedForRole(effectiveCode, mod.path, user)) {
        return mod.path;
      }
    }
    return '/admin/overview';
  },

  hasSubPermission(roleNameOrCode?: string, subPermCode?: string, user?: any): boolean {
    if (!subPermCode) return false;
    const effectiveCode = (user ? this.getUserRoleCode(user) : '') || roleNameOrCode || '';
    if (!effectiveCode) return false;

    const lower = effectiveCode.toLowerCase();
    if (
      lower === 'owner' ||
      lower === 'super_admin' ||
      lower === 'admin' ||
      lower === 'chủ phòng khám' ||
      user?.email === 'admin@smartschedule.ai'
    ) {
      return true;
    }

    if (user?.permissions && Array.isArray(user.permissions)) {
      if (user.permissions.includes(subPermCode)) return true;
    }

    const matrix = this.getMatrix();
    const roles = this.getRoles();

    const matchedRole = roles.find(
      (r) =>
        r.id === effectiveCode ||
        r.code.toLowerCase() === lower ||
        r.name.toLowerCase() === lower,
    );
    const roleCode = matchedRole ? matchedRole.code : lower;

    const roleState = matrix[roleCode];
    if (!roleState) return false;

    for (const modCode of Object.keys(roleState)) {
      const mod = roleState[modCode];
      if (mod.subPermissions && mod.subPermissions[subPermCode] !== undefined) {
        return Boolean(mod.subPermissions[subPermCode]);
      }
    }

    return false;
  },

  getUserRoleCode(user?: any): string {
    if (!user) return '';
    const roles: string[] = Array.isArray(user.roles) ? user.roles : [];
    const email = (user.email || '').toLowerCase().trim();

    // 1. Explicit owner / Super Admin
    if (
      email === 'admin@smartschedule.ai' ||
      roles.includes('SUPER_ADMIN') ||
      roles.includes('ADMIN') ||
      roles.includes('owner') ||
      roles.includes('Chủ phòng khám')
    ) {
      return 'owner';
    }

    // 2. Kế toán
    if (
      roles.includes('Kế Toán') ||
      roles.includes('ke_toan') ||
      roles.includes('ACCOUNTANT') ||
      roles.includes('Kế toán') ||
      email === 'dinh@gmail.com'
    ) {
      return 'ke_toan';
    }

    // 3. Bác sĩ
    if (
      roles.includes('DOCTOR') ||
      roles.includes('doctor') ||
      roles.includes('Bác sĩ chuyên khoa') ||
      roles.includes('Bác sĩ chuyên môn')
    ) {
      return 'doctor';
    }

    // 4. Lễ tân
    if (
      roles.includes('RECEPTIONIST') ||
      roles.includes('receptionist') ||
      roles.includes('Lễ tân') ||
      roles.includes('Lễ tân phòng khám')
    ) {
      return 'receptionist';
    }

    // 5. Điều dưỡng
    if (
      roles.includes('NURSE') ||
      roles.includes('nurse') ||
      roles.includes('Điều dưỡng viên') ||
      roles.includes('Điều dưỡng & Phụ tá nha khoa') ||
      roles.includes('Điều dưỡng & Phụ tá')
    ) {
      return 'nurse';
    }

    // 6. Kỹ thuật viên
    if (
      roles.includes('TECHNICIAN') ||
      roles.includes('technician') ||
      roles.includes('Kỹ thuật viên') ||
      roles.includes('Kỹ thuật viên xét nghiệm') ||
      roles.includes('Kỹ thuật viên phòng mổ & Lab')
    ) {
      return 'technician';
    }

    // 7. Quản lý chi nhánh
    if (
      roles.includes('BRANCH_MANAGER') ||
      roles.includes('manager') ||
      roles.includes('Quản lý chi nhánh') ||
      roles.includes('Giám đốc / Quản lý chi nhánh')
    ) {
      return 'manager';
    }

    // 8. Custom dynamic roles from matrix
    const sysRoles = this.getRoles();
    for (const r of roles) {
      const found = sysRoles.find(
        (sr) =>
          sr.code.toLowerCase() === r.toLowerCase() ||
          sr.name.toLowerCase() === r.toLowerCase(),
      );
      if (found) return found.code;
    }

    return roles[0] || '';
  },

  canFilterBranches(roleNameOrCode?: string): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') {
      return true;
    }
    return this.hasSubPermission(roleNameOrCode, 'branches_filter');
  },

  canEditServices(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') {
      return true;
    }
    return this.hasSubPermission(roleNameOrCode, 'services_edit', user) || this.hasSubPermission(roleNameOrCode, 'services_create', user);
  },

  canToggleServices(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') {
      return true;
    }
    return this.hasSubPermission(roleNameOrCode, 'services_toggle', user) || this.hasSubPermission(roleNameOrCode, 'services_edit', user);
  },

  canViewAllLeaves(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') {
      return true;
    }
    return this.hasSubPermission(roleNameOrCode, 'leave_view_all', user) || this.hasSubPermission(roleNameOrCode, 'leave_approve', user);
  },

  canApproveLeave(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') {
      return true;
    }
    return this.hasSubPermission(roleNameOrCode, 'leave_approve', user);
  },

  canManagePayroll(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') {
      return true;
    }
    return this.hasSubPermission(roleNameOrCode, 'salary_manage', user) || this.hasSubPermission(roleNameOrCode, 'salary_edit', user);
  },

  canCreateAppointment(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'appointments_create', user);
  },

  canEditAppointment(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'appointments_edit', user);
  },

  canExportAppointments(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'appointments_export', user) || this.hasSubPermission(roleNameOrCode, 'appointments_view', user);
  },

  canCreatePatient(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'patients_create', user);
  },

  canEditPatient(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'patients_edit', user);
  },

  canUpdateDentalChart(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'patients_dental_chart', user);
  },

  canCreateStaff(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'staff_create', user);
  },

  canEditStaff(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'staff_edit', user);
  },

  canDeleteStaff(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'staff_delete', user);
  },

  canExportStaff(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'staff_export', user) || this.hasSubPermission(roleNameOrCode, 'staff_view', user);
  },

  canEditSchedule(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'schedule_edit', user);
  },

  canExportSchedule(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'schedule_export', user) || this.hasSubPermission(roleNameOrCode, 'schedule_view', user);
  },

  canEditSalary(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'salary_edit', user);
  },

  canExportSalary(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'salary_export', user) || this.hasSubPermission(roleNameOrCode, 'salary_view', user);
  },

  canEditBranches(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'branches_edit', user);
  },

  canCreateService(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'services_create', user);
  },

  canCreateReceipt(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'finance_receipt', user);
  },

  canExportFinance(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'finance_export', user) || this.hasSubPermission(roleNameOrCode, 'finance_view', user);
  },

  canConfigureAi(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'ai_configure', user);
  },

  canExportAi(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'ai_export', user) || this.hasSubPermission(roleNameOrCode, 'ai_view', user);
  },

  canExportAuditLogs(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'audit_export', user) || this.hasSubPermission(roleNameOrCode, 'audit_view', user);
  },

  canEditSettings(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'settings_edit', user);
  },

  canCreateEquipment(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'equipment_create', user);
  },

  canScheduleEquipment(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'equipment_schedule', user);
  },

  canEditEquipment(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'equipment_edit', user);
  },

  canExportEquipment(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'equipment_export', user);
  },

  canCreateUrgentReport(roleNameOrCode?: string, user?: any): boolean {
    if (!roleNameOrCode) return false;
    const lower = roleNameOrCode.toLowerCase();
    if (lower === 'owner' || lower === 'super_admin' || lower === 'admin' || lower === 'chủ phòng khám') return true;
    return this.hasSubPermission(roleNameOrCode, 'notifications_create', user);
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

/**
 * Kiểm tra linh hoạt xem một tài khoản có thuộc vai trò nhân sự / quản trị hay không.
 * Nếu tài khoản có bất kỳ vai trò nào trong hệ thống (khác PATIENT thuần túy), coi như là nhân sự.
 */
export const isStaffRole = (roles?: string[], employeeCode?: string): boolean => {
  if (employeeCode) {
    const empUpper = employeeCode.trim().toUpperCase();
    if (empUpper.startsWith('NV') || empUpper.includes('ADMIN')) {
      return true;
    }
  }
  if (!roles || !Array.isArray(roles) || roles.length === 0) return false;
  const nonPatientRoles = roles.filter((r) => {
    const upper = (r || '').trim().toUpperCase();
    return (
      upper !== 'PATIENT' &&
      upper !== 'USER' &&
      upper !== 'CUSTOMER' &&
      upper !== 'KHÁCH HÀNG' &&
      upper !== 'BỆNH NHÂN'
    );
  });
  return nonPatientRoles.length > 0;
};


