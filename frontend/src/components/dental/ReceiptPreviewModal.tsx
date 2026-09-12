import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Printer,
  FileDown,
  ArrowLeft,
  Smartphone,
  Check,
} from 'lucide-react';
import type { ReceiptData } from './CreateReceiptModal';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToEdit: () => void;
  receiptData?: ReceiptData;
  onPrintSuccess?: () => void;
}

// Full dynamic Vietnamese number to words algorithm
export function convertNumberToVietnameseWords(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return 'Không đồng';

  const defaultExactMap: Record<number, string> = {
    13000000: 'Mười ba triệu đồng chẵn',
    1500000: 'Một triệu năm trăm nghìn đồng chẵn',
    500000: 'Năm trăm nghìn đồng chẵn',
    34500000: 'Ba mươi tư triệu năm trăm nghìn đồng chẵn',
    45000000: 'Bốn mươi lăm triệu đồng chẵn',
    32000000: 'Ba mươi hai triệu đồng chẵn',
    48000000: 'Bốn mươi tám triệu đồng chẵn',
    2500000: 'Hai triệu năm trăm nghìn đồng chẵn',
  };
  if (defaultExactMap[amount]) return defaultExactMap[amount];

  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readThreeDigits(n: number, isHighestGroup: boolean): string {
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const u = n % 10;
    if (h === 0 && t === 0 && u === 0) return '';
    let res = '';
    if (!isHighestGroup || h > 0) {
      res += digits[h] + ' trăm ';
    }
    if (t === 0 && u !== 0) {
      if (!isHighestGroup || h > 0) res += 'lẻ ';
    } else if (t === 1) {
      res += 'mười ';
    } else if (t > 1) {
      res += digits[t] + ' mươi ';
    }
    if (u === 1) {
      if (t > 1) res += 'mốt';
      else res += digits[u];
    } else if (u === 5 && t > 0) {
      res += 'lăm';
    } else if (u === 4 && t > 1) {
      res += 'tư';
    } else if (u > 0) {
      res += digits[u];
    }
    return res.trim();
  }

  let temp = Math.abs(Math.round(amount));
  const groups: number[] = [];
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const gStr = readThreeDigits(g, i === groups.length - 1);
      words += (words ? ' ' : '') + gStr + ' ' + units[i];
    }
  }
  words = words.trim();
  if (!words) return 'Không đồng';
  words = words.charAt(0).toUpperCase() + words.slice(1);
  return `${words} đồng chẵn`;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  onBackToEdit,
  receiptData,
  onPrintSuccess,
}) => {
  const [selectedPrinter, setSelectedPrinter] = useState('Máy in bill Xprinter K80 (Quầy 1)');
  const [paperSize, setPaperSize] = useState<'K80' | 'K58' | 'A5'>('K80');
  const [copies, setCopies] = useState(1);
  const [includeQr, setIncludeQr] = useState(true);
  const [includeDoctorNote, setIncludeDoctorNote] = useState(false);
  const [sendZnsCopy, setSendZnsCopy] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccessToast, setPrintSuccessToast] = useState(false);
  const receiptSlipRef = useRef<HTMLDivElement>(null);

  const patientName = receiptData?.patientName || 'Nguyễn Văn An';
  const patientId = receiptData?.patientId || 'BN-104';
  const cleanPatientId = patientId.replace(/^#/, '');
  const amount = receiptData?.amount ?? 13000000;
  const description = receiptData?.description || 'Thanh toán Đợt 2 - Niềng răng Invisalign';
  const paymentMethod = receiptData?.paymentMethod || 'VietQR';
  const collector = receiptData?.collector || 'Dr. Lê Văn Hùng';

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setPrintSuccessToast(true);
      setTimeout(() => {
        setPrintSuccessToast(false);
        if (onPrintSuccess) onPrintSuccess();
        onClose();
      }, 1400);
    }, 900);
  };

  const handleDownloadPdf = () => {
    // Native print trigger styled for thermal/A5 PDF saving
    window.print();
  };

  // Keyboard shortcuts: Enter to print, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrint, onClose]);

  if (!isOpen) return null;

  // Paper width styles based on selected size
  const paperWidthClass =
    paperSize === 'K80'
      ? 'max-w-[320px]'
      : paperSize === 'K58'
      ? 'max-w-[250px] text-[10px]'
      : 'max-w-[420px] text-[12px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      {/* Printable styles for clean paper output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-printable, #thermal-receipt-printable * {
            visibility: visible !important;
          }
          #thermal-receipt-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-200 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Xem Trước Phiếu Thu Nhiệt ({paperSize})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Kiểm tra thông tin chi tiết trước khi xuất lệnh in ra máy in nhiệt tại quầy thu ngân.
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
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
          {/* Left Column: Simulated Thermal Receipt */}
          <div className="lg:col-span-6 bg-[#f0f4f9] rounded-2xl p-6 flex justify-center items-start overflow-hidden relative min-h-[460px]">
            {/* The Thermal Paper Container */}
            <div
              id="thermal-receipt-printable"
              ref={receiptSlipRef}
              className={`bg-white text-slate-800 w-full ${paperWidthClass} shadow-md rounded-xs py-4 px-5 font-mono text-[11px] leading-relaxed select-none relative transition-all duration-300`}
            >
              {/* Paper Top Saw-tooth Serration Cut Pattern */}
              <div className="absolute top-0 left-0 right-0 h-2 overflow-hidden flex text-slate-200 pointer-events-none">
                <svg className="w-full h-2" preserveAspectRatio="none" viewBox="0 0 240 8" fill="currentColor">
                  <path d="M0,8 L5,0 L10,8 L15,0 L20,8 L25,0 L30,8 L35,0 L40,8 L45,0 L50,8 L55,0 L60,8 L65,0 L70,8 L75,0 L80,8 L85,0 L90,8 L95,0 L100,8 L105,0 L110,8 L115,0 L120,8 L125,0 L130,8 L135,0 L140,8 L145,0 L150,8 L155,0 L160,8 L165,0 L170,8 L175,0 L180,8 L185,0 L190,8 L195,0 L200,8 L205,0 L210,8 L215,0 L220,8 L225,0 L230,8 L235,0 L240,8 Z" />
                </svg>
              </div>

              {/* Clinic Header */}
              <div className="text-center pt-2 pb-1.5">
                <h3 className="font-extrabold text-[12px] uppercase text-slate-900 tracking-tight leading-snug">
                  BỆNH VIỆN RĂNG HÀM MẶT VIỆT ANH ĐỨC
                </h3>
                <p className="text-[9.5px] text-slate-600 mt-0.5">123 Phạm Văn Thuận, Biên Hòa</p>
                <p className="text-[9.5px] text-slate-600">Hotline: 1900 xxxx</p>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-300 my-2.5"></div>

              {/* Receipt Title */}
              <div className="text-center">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                  PHIẾU THU TIỀN ĐIỀU TRỊ
                </h4>
                <div className="flex justify-between items-center text-[9.5px] text-slate-600 mt-1 font-sans">
                  <span>#PT-2026-8956</span>
                  <span>22/08/2026 14:30</span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-300 my-2.5"></div>

              {/* Customer & Doctor */}
              <div className="space-y-1 text-[10px]">
                <div className="flex">
                  <span className="w-22 shrink-0 text-slate-600">Khách hàng:</span>
                  <span className="font-bold text-slate-900 truncate">
                    {patientName} ({cleanPatientId})
                  </span>
                </div>
                <div className="flex">
                  <span className="w-22 shrink-0 text-slate-600">Bác sĩ:</span>
                  <span className="font-bold text-slate-900 truncate">
                    Trần Đức / {collector.replace('Dr. ', '')}
                  </span>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-300 my-2.5"></div>

              {/* Table Header */}
              <div className="flex justify-between text-[10px] font-bold text-slate-600 pb-1">
                <span>Nội dung</span>
                <span className="text-right">T.Tiền</span>
              </div>

              {/* Table Row */}
              <div className="flex justify-between text-[10.5px] items-start gap-2 py-1">
                <span className="font-medium text-slate-800 leading-tight flex-1">
                  {description}
                </span>
                <span className="font-bold text-slate-900 whitespace-nowrap text-right">
                  {amount.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {includeDoctorNote && (
                <div className="mt-1.5 p-1.5 bg-slate-50 border border-dashed border-slate-200 rounded text-[9.5px] text-slate-600 italic">
                  Ghi chú BS: Tái khám định kỳ sau 3 tuần để siết mắc cài.
                </div>
              )}

              {/* Dashed Separator */}
              <div className="border-t border-dashed border-slate-300 my-2.5"></div>

              {/* Total Summary */}
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-xs uppercase text-slate-900">TỔNG CỘNG:</span>
                  <span className="font-black text-sm text-slate-900">
                    {amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <p className="text-[9.5px] italic text-slate-600 text-left leading-tight">
                  ({convertNumberToVietnameseWords(amount)})
                </p>
                <div className="flex justify-between text-[10px] pt-1">
                  <span className="text-slate-600">Hình thức:</span>
                  <span className="font-semibold text-slate-800">
                    {paymentMethod === 'VietQR' ? 'Chuyển khoản VietQR' : paymentMethod}
                  </span>
                </div>
              </div>

              {/* QR Code Section */}
              {includeQr && (
                <div className="my-3 text-center flex flex-col items-center">
                  <div className="w-24 h-24 bg-[#eaecf0] rounded-lg p-1.5 flex items-center justify-center shadow-2xs">
                    {/* Stylized QR representation exactly matching reference mockup */}
                    <div className="w-full h-full bg-slate-100 rounded flex flex-col justify-between p-1 relative border border-slate-300/80">
                      <div className="flex justify-between items-start">
                        <div className="w-4 h-4 border-2 border-slate-800 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-slate-800"></div>
                        </div>
                        <div className="w-4 h-4 border-2 border-slate-800 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="flex justify-center items-center py-0.5">
                        <div className="w-6 h-6 border border-slate-700 bg-white flex items-center justify-center rounded-xs shadow-2xs">
                          <span className="text-[7px] font-black text-sky-800 tracking-tighter">QR</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-4 h-4 border-2 border-slate-800 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-slate-800"></div>
                        </div>
                        <div className="flex gap-0.5 items-end">
                          <div className="w-1 h-2 bg-slate-800"></div>
                          <div className="w-1.5 h-3 bg-slate-800"></div>
                          <div className="w-1 h-1.5 bg-slate-800"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Thank you message */}
              <div className="text-center text-[9.5px] italic text-slate-600 pt-1 pb-1 leading-normal">
                <p>Xin cảm ơn Quý khách!</p>
                <p>Chúc Quý khách nhiều sức khỏe.</p>
              </div>

              {/* Paper Bottom Saw-tooth Serration Cut Pattern */}
              <div className="absolute bottom-0 left-0 right-0 h-2 overflow-hidden flex text-slate-200 pointer-events-none">
                <svg className="w-full h-2 rotate-180" preserveAspectRatio="none" viewBox="0 0 240 8" fill="currentColor">
                  <path d="M0,8 L5,0 L10,8 L15,0 L20,8 L25,0 L30,8 L35,0 L40,8 L45,0 L50,8 L55,0 L60,8 L65,0 L70,8 L75,0 L80,8 L85,0 L90,8 L95,0 L100,8 L105,0 L110,8 L115,0 L120,8 L125,0 L130,8 L135,0 L140,8 L145,0 L150,8 L155,0 L160,8 L165,0 L170,8 L175,0 L180,8 L185,0 L190,8 L195,0 L200,8 L205,0 L210,8 L215,0 L220,8 L225,0 L230,8 L235,0 L240,8 Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: Print Configuration & Delivery */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Cấu hình in Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Cấu hình in</h3>

                {/* Chọn máy in */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Chọn máy in</label>
                  <div className="relative">
                    <select
                      value={selectedPrinter}
                      onChange={(e) => setSelectedPrinter(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 pr-8 cursor-pointer transition-all"
                    >
                      <option value="Máy in bill Xprinter K80 (Quầy 1)">
                        Máy in bill Xprinter K80 (Quầy 1)
                      </option>
                      <option value="Máy in bill Epson TM-T82 (Quầy 2)">
                        Máy in bill Epson TM-T82 (Quầy 2)
                      </option>
                      <option value="Máy in văn phòng Canon LBP 2900 (A5)">
                        Máy in văn phòng Canon LBP 2900 (A5)
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Khổ giấy */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Khổ giấy</label>
                  <div className="flex gap-2">
                    {(['K80', 'K58', 'A5'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPaperSize(size)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                          paperSize === size
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Số lượng bản in & Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-start">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600">Số lượng bản in</label>
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setCopies(Math.max(1, copies - 1))}
                        className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-100 font-black text-sm transition-colors cursor-pointer active:bg-slate-200"
                      >
                        —
                      </button>
                      <span className="px-4 py-1.5 font-bold text-xs text-slate-800 min-w-9 text-center select-none">
                        {copies}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCopies(copies + 1)}
                        className="px-3.5 py-1.5 text-slate-500 hover:bg-slate-100 font-black text-sm transition-colors cursor-pointer active:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Option checkboxes */}
                  <div className="space-y-2.5 pt-1 select-none">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeQr}
                        onChange={(e) => setIncludeQr(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 accent-teal-700 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        In kèm mã QR thanh toán
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDoctorNote}
                        onChange={(e) => setIncludeDoctorNote(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700 accent-teal-700 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700">
                        In ghi chú của Bác sĩ
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Card Gửi bản sao điện tử */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Gửi bản sao điện tử</h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Tự động gửi phiếu thu qua Zalo ZNS cho KH
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSendZnsCopy(!sendZnsCopy)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    sendZnsCopy ? 'bg-sky-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      sendZnsCopy ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {printSuccessToast && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold animate-fadeIn shadow-xs">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã gửi lệnh in thành công đến {selectedPrinter}!</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-100 text-center"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại chỉnh sửa</span>
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-xl transition-all shadow-2xs active:scale-98 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-teal-600" />
              <span>Tải file PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm tracking-wide uppercase disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'ĐANG IN...' : 'IN PHIẾU THU NGAY (ENTER)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
