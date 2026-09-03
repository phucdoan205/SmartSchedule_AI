import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// User Portal Modules & Layout
import { UserLayout } from '../components/layout/UserLayout';
import { UserHomePage } from '../modules/user/UserHomePage';
import { UserDoctorsPage } from '../modules/user/UserDoctorsPage';
import { UserPricingPage } from '../modules/user/UserPricingPage';
import { UserAiConsultationPage } from '../modules/user/UserAiConsultationPage';
import { UserLookupPage } from '../modules/user/UserLookupPage';
import { UserProfilePage } from '../modules/user/UserProfilePage';
import { AiBookingWizardModal } from '../modules/user/modals/AiBookingWizardModal';

// Auth Portal Modules
import { LoginPage } from '../modules/auth/LoginPage';
import { RegisterPage } from '../modules/auth/RegisterPage';
import { ForgotPasswordPage } from '../modules/auth/ForgotPasswordPage';
import { VerifyOtpPage } from '../modules/auth/VerifyOtpPage';
import { ResetPasswordPage } from '../modules/auth/ResetPasswordPage';

// Admin Portal Modules & Layout
import { AdminLayout } from '../components/layout/AdminLayout';
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
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<string | undefined>(undefined);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string | undefined>(undefined);

  const handleOpenBookingWizard = (doctorId?: string, serviceId?: string) => {
    setSelectedDoctorForBooking(doctorId);
    setSelectedServiceForBooking(serviceId);
    setIsBookingWizardOpen(true);
  };

  return (
    <>
      <Routes>
        {/* User Portal Section */}
        <Route path="/" element={<UserLayout onOpenBookingWizard={() => handleOpenBookingWizard()} />}>
          <Route index element={<UserHomePage onOpenBookingWizard={() => handleOpenBookingWizard()} />} />
          <Route path="doctors" element={<UserDoctorsPage onOpenBookingWizard={(docId) => handleOpenBookingWizard(docId)} />} />
          <Route path="pricing" element={<UserPricingPage onOpenBookingWizard={(srvId) => handleOpenBookingWizard(undefined, srvId)} />} />
          <Route path="ai-consultation" element={<UserAiConsultationPage onOpenBookingWizard={(docId) => handleOpenBookingWizard(docId)} />} />
          <Route path="lookup" element={<UserLookupPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Auth Section */}
        <Route path="/auth">
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="verify-otp" element={<VerifyOtpPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Admin Portal Section */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />

          {/* Doctor & Staff Sub-Modules */}
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

          {/* Maintenance Sub-Modules */}
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="maintenance/notifications" element={<MaintenanceNotificationsPage />} />

          <Route path="ai-insights" element={<AiInsightsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global AI Booking Wizard Stepper Modal */}
      <AiBookingWizardModal
        isOpen={isBookingWizardOpen}
        onClose={() => setIsBookingWizardOpen(false)}
        initialDoctorId={selectedDoctorForBooking}
        initialServiceId={selectedServiceForBooking}
      />
    </>
  );
};
