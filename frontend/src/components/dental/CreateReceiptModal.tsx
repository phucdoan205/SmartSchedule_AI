import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Lock,
  Mail,
  Printer,
  QrCode,
  User,
  ExternalLink,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';

export interface ReceiptData {
  patientName: string;
  patientId: string;
  amount: number;
  description: string;
  paymentMethod: string;
  collector: string;
  isEvatEnabled: boolean;
  customerType: string;
  taxCode: string;
  buyerName: string;
  buyerAddress: string;
  buyerEmail: string;
  vatRate: string;
  sendZns: boolean;
}

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  patientId?: string;
  defaultAmount?: number;
  defaultDescription?: string;
  onOpenPreview: (data: ReceiptData) => void;
  onConfirmSuccess?: (data: ReceiptData) => void;
}

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Nguyễn Văn An',
  patientId = '#BN-2026-104',
  defaultAmount = 13000000,
  defaultDescription = 'Thanh toán Đợt 2 - Niềng răng Invisalign',
  onOpenPreview,
  onConfirmSuccess,
}) => {
  const [description, setDescription] = useState(defaultDescription);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [paymentMethod, setPaymentMethod] = useState('VietQR');
  const [collector, setCollector] = useState('Dr. Lê Văn Hùng');

  // e-VAT State
  const [isEvatEnabled, setIsEvatEnabled] = useState(true);
  const [customerType, setCustomerType] = useState('Cá nhân');
  const [taxCode, setTaxCode] = useState('');
  const [buyerName, setBuyerName] = useState(patientName);
  const [buyerAddress, setBuyerAddress] = useState('Quận 1, TP. HCM');
  const [buyerEmail, setBuyerEmail] = useState('nguyenvanan.58@email.com');
  const [sendZns, setSendZns] = useState(true);

  if (!isOpen) return null;

  const formatNumberInput = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setAmount(rawVal ? parseInt(rawVal, 10) : 0);
  };

  const currentReceiptData: ReceiptData = {
    patientName,
    patientId,
    amount,
    description,
    paymentMethod,
    collector,
    isEvatEnabled,
    customerType,
    taxCode,
    buyerName,
    buyerAddress,
    buyerEmail,
    vatRate: '0% VAT - Dịch vụ y tế',
    sendZns,
  };

  const handlePreview = () => {
    onOpenPreview(currentReceiptData);
  };

  const handleConfirm = () => {
    if (onConfirmSuccess) {
      onConfirmSuccess(currentReceiptData);
    }
    toast(`Đã xác nhận thu ${amount.toLocaleString('vi-VN')} VNĐ và phát hành hóa đơn thành công!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-200 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Lập Phiếu Thu & Xuất Hóa Đơn Điện Tử (e-VAT)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Xác nhận thanh toán và phát hành hóa đơn đỏ cho khách hàng theo chuẩn cơ quan thuế.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - 2 Columns */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          {/* Left Column: Thông tin thanh toán */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span className="flex items-center justify-center w-5 h-5 rounded bg-sky-100 text-sky-600">
                <CreditCard className="w-3.5 h-3.5" />
              </span>
              <span>Thông tin thanh toán</span>
            </div>

            {/* Patient Card */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center tracking-wider shadow-xs">
                  NA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{patientName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{patientId}</p>
                </div>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
              >
                HỒ SƠ KH
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                Nội dung thu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700">
                Số tiền thanh toán (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-400">đ</span>
                <input
                  type="text"
                  value={formatNumberInput(amount)}
                  onChange={handleAmountChange}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 py-2 text-right text-base font-black text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Payment Method & Collector in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Phương thức</label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3 flex items-center text-sky-600">
                    <QrCode className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-7 py-2 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all cursor-pointer"
                  >
                    <option value="VietQR">VietQR</option>
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản</option>
                    <option value="Quẹt thẻ POS">Quẹt thẻ POS</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700">Người thu</label>
                <div className="relative flex items-center">
                  <span className="pointer-events-none absolute left-3 flex items-center text-slate-500">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <select
                    value={collector}
                    onChange={(e) => setCollector(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-7 py-2 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all cursor-pointer"
                  >
                    <option value="Dr. Lê Văn Hùng">Dr. Lê Văn Hùng</option>
                    <option value="Dr. Trần Đức">Dr. Trần Đức</option>
                    <option value="Thu ngân quầy 1">Thu ngân quầy 1</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Transaction Summary Box */}
            <div className="rounded-xl bg-slate-900 p-4 text-white shadow-md space-y-2 mt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                TỔNG KẾT GIAO DỊCH
              </p>
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span>Tổng tiền dịch vụ:</span>
                <span>{amount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span>Thuế GTGT (0%):</span>
                <span>0 đ</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-white">Tổng tiền thanh toán:</span>
                <span className="text-base font-black text-white">{amount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          {/* Right Column: Phát hành Hóa đơn điện tử */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex items-center justify-center w-5 h-5 rounded bg-sky-100 text-sky-600">
                  <Building2 className="w-3.5 h-3.5" />
                </span>
                <span>Phát hành Hóa đơn điện tử</span>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEvatEnabled(!isEvatEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEvatEnabled ? 'bg-sky-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isEvatEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-[11px] font-black text-sky-700">
                  {isEvatEnabled ? 'BẬT (ON)' : 'TẮT'}
                </span>
              </div>
            </div>

            {/* Invoicing Details Form */}
            <div
              className={`space-y-3.5 rounded-2xl border border-sky-100 bg-[#f0f7fd]/70 p-4 transition-all duration-200 ${
                !isEvatEnabled ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              {/* Customer Type & Tax ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Loại khách hàng</label>
                  <div className="relative">
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-sky-500 pr-8 transition-all cursor-pointer"
                    >
                      <option value="Cá nhân">Cá nhân</option>
                      <option value="Doanh nghiệp">Doanh nghiệp</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">Mã số thuế (Tùy chọn)</label>
                  <input
                    type="text"
                    value={taxCode}
                    onChange={(e) => setTaxCode(e.target.value)}
                    placeholder="Nhập MST (nếu có)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* Buyer Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Tên người mua / Đơn vị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Địa chỉ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition-all"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Email nhận hóa đơn <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500 transition-all"
                  />
                </div>
              </div>

              {/* VAT Rate */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Thuế suất VAT <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value="0% VAT - Dịch vụ y tế"
                    disabled
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700 pr-8 cursor-not-allowed"
                  />
                  <Lock className="absolute right-3 w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight mt-1 italic">
                  Theo Thông tư 219/2013/TT-BTC, dịch vụ khám chữa bệnh nha khoa thuộc đối tượng không chịu thuế GTGT.
                </p>
              </div>
            </div>

            {/* Checkbox Zalo ZNS */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={sendZns}
                onChange={(e) => setSendZns(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 accent-sky-600 cursor-pointer"
              />
              <span className="text-[11px] font-medium text-slate-600 leading-relaxed">
                Đồng thời gửi tin nhắn xác nhận thanh toán kèm link hóa đơn qua{' '}
                <span className="font-bold text-sky-700 underline decoration-sky-300">Zalo ZNS</span>.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-white flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors text-center"
          >
            Hủy bỏ
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-xl transition-all shadow-2xs active:scale-98 text-center"
            >
              <Printer className="w-4 h-4 text-sky-600" />
              <span>In phiếu thu nhiệt</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm tracking-wide uppercase active:scale-98 text-center"
            >
              XÁC NHẬN THU TIỀN & PHÁT HÀNH HÓA ĐƠN VAT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
