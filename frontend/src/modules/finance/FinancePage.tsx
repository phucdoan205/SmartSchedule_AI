import React, { useState } from 'react';
import { FinancialOverviewView } from './FinancialOverviewView';
import { BranchFinanceDetailView } from './BranchFinanceDetailView';
import { ExportReportModal } from './ExportReportModal';
import { VietQrReconciliationModal } from './VietQrReconciliationModal';

export const FinancePage: React.FC = () => {
  const [view, setView] = useState<'overview' | 'branch_detail'>('overview');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('b-bienhoa');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVietQrModalOpen, setIsVietQrModalOpen] = useState(false);

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    setView('branch_detail');
  };

  const branchNameDisplay =
    selectedBranchId === 'b-bienhoa'
      ? 'Chi nhánh Biên Hòa (CN01 - Trụ sở chính)'
      : selectedBranchId === 'b-quan1'
      ? 'Chi nhánh Quận 1 (CN02 - Chi nhánh VIP)'
      : 'Chi nhánh Long Thành (CN03)';

  return (
    <div className="space-y-6">
      {view === 'overview' ? (
        <FinancialOverviewView
          onSelectBranch={handleSelectBranch}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />
      ) : (
        <BranchFinanceDetailView
          branchId={selectedBranchId}
          onBack={() => setView('overview')}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onOpenVietQrModal={() => setIsVietQrModalOpen(true)}
        />
      )}

      {/* Modal Xuất Báo Cáo */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        branchName={view === 'overview' ? 'Tất cả chi nhánh (3 cơ sở)' : branchNameDisplay}
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
