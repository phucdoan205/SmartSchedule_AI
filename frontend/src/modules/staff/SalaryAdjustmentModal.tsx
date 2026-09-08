import React, { useState } from 'react';
import { X, Sliders, DollarSign, Plus, Minus, AlertCircle, Save } from 'lucide-react';

export interface SalaryAdjustmentData {
  staffId: string;
  type: 'bonus' | 'allowance' | 'penalty' | 'advance';
  amount: number;
  reason: string;
}

interface SalaryAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: {
    id: string;
    code: string;
    name: string;
    role?: string;
    avatar?: string;
    totalAmount?: number;
  } | null;
  onSave: (data: SalaryAdjustmentData) => void;
}

export const SalaryAdjustmentModal: React.FC<SalaryAdjustmentModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave,
}) => {
  const [type, setType] = useState<'bonus' | 'allowance' | 'penalty' | 'advance'>('bonus');
  const [amount, setAmount] = useState<number | string>(1000000);
  const [reason, setReason] = useState('');

  if (!isOpen || !staff) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do điều chỉnh lương thưởng!');
      return;
    }

    onSave({
      staffId: staff.id,
      type,
      amount: Number(amount) || 0,
      reason,
    });
    onClose();
  };

  const adjustmentTypes = [
    { id: 'bonus', label: 'Thưởng nóng / Hiệu suất', sign: '+', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'allowance', label: 'Phụ cấp trách nhiệm / Ca đêm', sign: '+', color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'penalty', label: 'Khấu trừ vi phạm quy chế', sign: '-', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'advance', label: 'Khấu trừ tạm ứng kỳ trước', sign: '-', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ] as const;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal
      >
        <div
          className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-100"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: 'modalSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Điều Chỉnh Thưởng / Phạt Lương
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {staff.name} ({staff.code})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Type selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Loại điều chỉnh
              </label>
              <div className="grid grid-cols-2 gap-2">
                {adjustmentTypes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      type === item.id
                        ? `${item.color} font-bold ring-2 ring-sky-400 shadow-2xs`
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-sm font-black">{item.sign}</div>
                    <div className="text-[11px] mt-0.5">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Số tiền điều chỉnh (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 pr-12 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-400"
                  placeholder="1.000.000"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  VNĐ
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lý do điều chỉnh / Căn cứ chứng từ <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-400 resize-none placeholder:text-slate-400"
                placeholder="Ví dụ: Thưởng vượt chỉ tiêu doanh thu Implant tháng 8; Hỗ trợ ca trực đêm cấp cứu..."
                required
              />
            </div>

            {/* AI notice */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
              <span>
                Khoản điều chỉnh này sẽ được lưu vào lịch sử phiếu lương và tự động cập nhật vào Tổng thực lĩnh của nhân sự.
              </span>
            </div>

            {/* Footer */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu điều chỉnh</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
