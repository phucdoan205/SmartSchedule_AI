import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';

// Admin Modules
import { OverviewPage } from '../modules/overview/OverviewPage';
import { StaffListPage } from '../modules/staff/StaffListPage';
import { DoctorDetailPage } from '../modules/staff/DoctorDetailPage';
import { StaffSchedulePage } from '../modules/staff/StaffSchedulePage';
import { StaffSalaryPage } from '../modules/staff/StaffSalaryPage';
import { LeaveRegisterPage } from '../modules/staff/LeaveRegisterPage';
import { SmartSchedulePage } from '../modules/appointments/SmartSchedulePage';
import { PatientsPage } from '../modules/patients/PatientsPage';
import { BranchesPage } from '../modules/branches/BranchesPage';
import { ServicesPage } from '../modules/services/ServicesPage';
import { FinancePage } from '../modules/finance/FinancePage';
import { MaintenancePage } from '../modules/maintenance/MaintenancePage';
import { MaintenanceNotificationsPage } from '../modules/maintenance/MaintenanceNotificationsPage';
import { AiInsightsPage } from '../modules/ai-insights/AiInsightsPage';
import { AuditLogsPage } from '../modules/audit-logs/AuditLogsPage';
import { SettingsPage } from '../modules/settings/SettingsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Default redirect to Admin Dashboard Overview */}
      <Route path="/" element={<Navigate to="/admin/overview" replace />} />

      {/* Admin Section */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />

        {/* Doctor & Staff Sub-Modules (4 Sub-functions) */}
        <Route path="staff" element={<StaffListPage />} />
        <Route path="staff/:id" element={<DoctorDetailPage />} />
        <Route path="staff/schedule" element={<StaffSchedulePage />} />
        <Route path="staff/salary" element={<StaffSalaryPage />} />
        <Route path="staff/leave" element={<LeaveRegisterPage />} />

        {/* Operation & Management Modules */}
        <Route path="appointments" element={<SmartSchedulePage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="finance" element={<FinancePage />} />

        {/* Maintenance Sub-Modules (2 Sub-functions) */}
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="maintenance/notifications" element={<MaintenanceNotificationsPage />} />

        <Route path="ai-insights" element={<AiInsightsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin/overview" replace />} />
    </Routes>
  );
};
