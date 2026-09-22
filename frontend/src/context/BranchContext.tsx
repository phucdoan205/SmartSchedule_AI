import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { branchesApi } from '../services/api';

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  imageUrl?: string;
  isActive: boolean;
  roomCount?: number;
  chairCount?: number;
  doctorCount?: number;
}

interface BranchContextType {
  branches: BranchItem[];
  selectedBranchId: string;
  selectedBranch: BranchItem | null;
  setSelectedBranchId: (id: string) => void;
  refreshBranches: () => Promise<void>;
  isLoading: boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string>(() => {
    return localStorage.getItem('selected_branch_id') || 'ALL';
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshBranches = useCallback(async () => {
    try {
      const data = await branchesApi.getAll();
      if (Array.isArray(data)) {
        setBranches(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách chi nhánh:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  const setSelectedBranchId = (id: string) => {
    setSelectedBranchIdState(id);
    localStorage.setItem('selected_branch_id', id);
  };

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId,
        selectedBranch,
        setSelectedBranchId,
        refreshBranches,
        isLoading,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
