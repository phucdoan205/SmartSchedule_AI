import React, { useState } from 'react';
import { FinancialOverviewView } from './FinancialOverviewView';
import { BranchFinanceDetailView } from './BranchFinanceDetailView';
import { ExportReportModal } from './ExportReportModal';
import { VietQrReconciliationModal } from './VietQrReconciliationModal';
import { useBranch } from '../../context/BranchContext';

export const FinancePage: React.FC = () => {
  const { selectedBranchId: headerBranchId, selectedBranch } = useBranch();
  const [view, setView] = useState<'overview' | 'branch_detail'>('overview');
  const [detailedBranchId, setDetailedBranchId] = useState<string>('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVietQrModalOpen, setIsVietQrModalOpen] = useState(false);

  const handleSelectBranch = (branchId: string) => {
    setDetailedBranchId(branchId);
    setView('branch_detail');
  };

  const activeBranchId = detailedBranchId || (headerBranchId !== 'ALL' ? headerBranchId : '');

  const branchNameDisplay =
    selectedBranch?.name || (view === 'overview' ? 'Tất cả chi nhánh (Toàn hệ thống)' : 'Chi nhánh đang chọn');

  return (
    <div className="space-y-6">
      {view === 'overview' ? (
        <FinancialOverviewView
          onSelectBranch={handleSelectBranch}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />
      ) : (
        <BranchFinanceDetailView
          branchId={activeBranchId}
          onBack={() => setView('overview')}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenVietQrModal={() => setIsVietQrModalOpen(true)}
        />
      )}

      {/* Modal Xuất Báo Cáo */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        branchName={branchNameDisplay}
      />

      {/* Modal Đối Soát VietQR */}
      <VietQrReconciliationModal
        isOpen={isVietQrModalOpen}
        onClose={() => setIsVietQrModalOpen(false)}
        branchName={branchNameDisplay}
      />
    </div>
  );
};
