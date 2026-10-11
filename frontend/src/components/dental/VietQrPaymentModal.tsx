import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  CheckCircle2,
  Building2,
  CreditCard,
  User,
  DollarSign,
  FileText,
  ExternalLink,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface VietQrPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  patientName?: string;
  patientCode?: string;
  onPaymentSuccess?: () => void;
}

export const VietQrPaymentModal: React.FC<VietQrPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  patientName,
  patientCode,
  onPaymentSuccess,
}) => {
  const [isCopiedField, setIsCopiedField] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const BANK_INFO = {
    bankName: 'BIDV - Ngân hàng TMCP Đầu tư & Phát triển Việt Nam',
    branch: 'Chi nhánh Đồng Nai - PGD Đồng Khởi',
    accountNumber: '6701616583',
    accountName: 'DOAN VAN PHUC',
    bankBin: '970418',
  };

  // Clean description for VietQR (no accents or special characters for optimal banking app auto-filling)
  const transferContent = description || `KHAM ${patientCode || 'SMART'}`;

  // VietQR Dynamic URL (Napas 247 standard with BIDV)
  const qrUrl = `https://img.vietqr.io/image/BIDV-${BANK_INFO.accountNumber}-compact2.png?amount=${Math.round(
    amount,
  )}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(
    BANK_INFO.accountName,
  )}`;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedField(fieldName);
    toast(`Đã sao chép ${fieldName} vào bộ nhớ tạm!`);
    setTimeout(() => setIsCopiedField(null), 2000);
  };

  const handleConfirm = () => {
    setIsConfirming(true);
    setTimeout(() => {
      setIsConfirming(false);
      toast('Xác nhận thanh toán chuyển khoản VietQR thành công!');
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 text-xs max-h-[94vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Thanh Toán Chuyển Khoản VietQR 24/7
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Napas 247
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Quét mã QR bằng App Ngân hàng hoặc Ví điện tử để chuyển tiền tự động
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Left Column: QR Code Frame */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-b from-slate-50 to-teal-50/30 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="relative bg-white p-2 rounded-2xl border border-slate-200 shadow-md">
              <img
                src={qrUrl}
                alt="VietQR Chuyển khoản BIDV"
                className="w-48 h-auto object-contain rounded-xl select-none"
                onError={(e) => {
                  // Fallback if network blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="mt-2 text-center">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block">
                  Quét mã BIDV tự động điền tiền
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-3 font-medium">
              Hỗ trợ <strong className="text-slate-700">mọi Ngân hàng &amp; Ví MoMo, ZaloPay</strong>
            </p>
          </div>

          {/* Right Column: Bank Details & Quick-Copy */}
          <div className="md:col-span-7 space-y-3">
            {/* Bank Card Info */}
            <div className="p-3 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-teal-200">NGÂN HÀNG THỤ HƯỞNG</span>
                <span className="font-bold text-xs bg-teal-700/60 px-2 py-0.5 rounded-md text-white border border-teal-500/40">
                  BIDV
                </span>
              </div>
              <p className="font-extrabold text-sm text-white">BIDV - Chi nhánh Đồng Nai</p>
              <p className="text-[11px] text-teal-200">Phòng giao dịch Đồng Khởi</p>
            </div>

            {/* Field: Số tài khoản */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Số tài khoản</span>
                <span className="text-sm font-black font-mono text-slate-900 tracking-wider">
                  {BANK_INFO.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(BANK_INFO.accountNumber, 'Số tài khoản')}
                className="px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-700 font-bold text-[11px] rounded-lg border border-slate-200 hover:border-teal-300 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {isCopiedField === 'Số tài khoản' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{isCopiedField === 'Số tài khoản' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Field: Chủ tài khoản */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Chủ tài khoản</span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {BANK_INFO.accountName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(BANK_INFO.accountName, 'Tên chủ tài khoản')}
                className="px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-700 font-bold text-[11px] rounded-lg border border-slate-200 hover:border-teal-300 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {isCopiedField === 'Tên chủ tài khoản' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{isCopiedField === 'Tên chủ tài khoản' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Field: Số tiền */}
            <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Số tiền thanh toán</span>
                <span className="text-base font-black text-emerald-800">
                  {amount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(amount.toString(), 'Số tiền')}
                className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg border border-emerald-300 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {isCopiedField === 'Số tiền' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{isCopiedField === 'Số tiền' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>

            {/* Field: Nội dung chuyển khoản */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="pr-2 overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Nội dung chuyển khoản</span>
                <span className="text-[11px] font-bold font-mono text-slate-800 truncate block max-w-[220px]">
                  {transferContent}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(transferContent, 'Nội dung chuyển khoản')}
                className="px-2.5 py-1.5 bg-white hover:bg-teal-50 text-teal-700 font-bold text-[11px] rounded-lg border border-slate-200 hover:border-teal-300 transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
              >
                {isCopiedField === 'Nội dung chuyển khoản' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{isCopiedField === 'Nội dung chuyển khoản' ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[11px] text-slate-500 font-medium text-center sm:text-left flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            Giao dịch mã hóa an toàn qua cổng chuyển tiền Napas 247
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng / Hủy
            </button>
            <button
              type="button"
              disabled={isConfirming}
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isConfirming ? 'Đang kiểm tra...' : 'Xác Nhận Đã Chuyển Khoản'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
