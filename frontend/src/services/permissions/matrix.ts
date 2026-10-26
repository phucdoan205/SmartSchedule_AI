import type { SystemRoleItem, MatrixState } from './types';
import { SYSTEM_MODULES } from './modules';

export const STORAGE_KEY_ROLES = 'smartschedule_system_roles';
export const STORAGE_KEY_MATRIX = 'smartschedule_rbac_matrix';

// Initial default matrix
export const buildDefaultMatrix = (roles: SystemRoleItem[]): MatrixState => {
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
