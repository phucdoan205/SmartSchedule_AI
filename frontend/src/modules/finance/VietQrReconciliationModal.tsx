import React from 'react';
import {
  X,
  CheckCircle2,
  QrCode,
  Download,
  Check,
} from 'lucide-react';

interface VietQrReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
}

export const VietQrReconciliationModal: React.FC<VietQrReconciliationModalProps> = ({
  isOpen,
  onClose,
  branchName = 'Chi nhánh Biên Hòa',
}) => {
  if (!isOpen) return null;

  const transactions = [
    {
      id: 'VQR-9901',
      time: '16:15',
      patient: 'Nguyễn Văn An (#BN-104)',
      billCode: '#HD-8956',
      amount: '13.000.000đ',
      bank: 'Vietcombank',
      status: 'Matched',
    },
    {
      id: 'VQR-9902',
      time: '11:00',
      patient: 'Lê Văn Hoàng (#BN-115)',
      billCode: '#HD-8954',
      amount: '25.000.000đ',
      bank: 'MB Bank',
      status: 'Matched',
    },
    {
      id: 'VQR-9903',
      time: '08:30',
      patient: 'Phạm Đức Minh (#BN-120)',
      billCode: '#HD-8952',
      amount: '1.800.000đ',
      bank: 'Techcombank',
      status: 'Matched',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 text-xs max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Đối Soát Giao Dịch VietQR Động Hôm Nay
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Khớp tự động thông báo biến động số dư ngân hàng và phiếu thu tại {branchName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              TỔNG TIỀN QR
            </span>
            <span className="text-base font-extrabold text-slate-900">39.800.000đ</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider block">
              KHỚP 100%
            </span>
            <span className="text-base font-extrabold text-emerald-800">3/3 giao dịch</span>
          </div>

          <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
            <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-wider block">
              LỆCH SỐ DƯ
            </span>
            <span className="text-base font-extrabold text-sky-900">0 VNĐ</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs min-w-[560px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">MÃ GD</th>
                <th className="py-2.5 px-3">GIỜ</th>
                <th className="py-2.5 px-3">BỆNH NHÂN &amp; HÓA ĐƠN</th>
                <th className="py-2.5 px-3">SỐ TIỀN</th>
                <th className="py-2.5 px-3">NGÂN HÀNG</th>
                <th className="py-2.5 px-3 text-right">ĐỐI SOÁT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-sky-700">{tx.id}</td>
                  <td className="py-3 px-3 text-slate-500 font-medium">{tx.time}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{tx.patient}</span>
                    <span className="text-[10px] text-slate-400">{tx.billCode}</span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-slate-900">{tx.amount}</td>
                  <td className="py-3 px-3 text-slate-600">{tx.bank}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Khớp lệnh
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Tải biên bản đối soát
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
