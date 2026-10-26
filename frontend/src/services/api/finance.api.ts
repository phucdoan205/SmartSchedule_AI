import { apiClient } from './client';

export const financeApi = {
  getOverview: async (branchId?: string, month?: string) => {
    const params: any = {};
    if (branchId && branchId !== 'ALL') params.branchId = branchId;
    if (month) params.month = month;
    const res = await apiClient.get('/finance/overview', { params });
    return res.data;
  },
  getTransactions: async (params?: { branchId?: string; search?: string; page?: number; limit?: number }) => {
    const cleanParams: any = { ...params };
    if (cleanParams.branchId === 'ALL') delete cleanParams.branchId;
    const res = await apiClient.get('/finance/transactions', { params: cleanParams });
    return res.data;
  },
  getInvoices: async (paramsOrBranchId?: any, status?: string) => {
    const params: any = typeof paramsOrBranchId === 'string'
      ? { branchId: paramsOrBranchId !== 'ALL' ? paramsOrBranchId : undefined, status }
      : { ...paramsOrBranchId };
    if (params.branchId === 'ALL') delete params.branchId;
    const res = await apiClient.get('/finance/invoices', { params });
    return res.data;
  },
  createInvoice: async (data: any) => {
    const res = await apiClient.post('/finance/invoices', data);
    return res.data;
  },
  createReceipt: async (data: {
    patientId: string;
    amount: number;
    description?: string;
    paymentMethod?: string;
    collector?: string;
  }) => {
    const res = await apiClient.post('/finance/receipt', data);
    return res.data;
  },
};
