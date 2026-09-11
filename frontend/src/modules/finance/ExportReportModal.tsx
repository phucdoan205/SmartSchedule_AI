import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Building2,
  Check,
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  branchName = 'Tất cả chi nhánh (3 cơ sở)',
}) => {
  const [format, setFormat] = useState<'excel' | 'pdf'>('excel');
  const [reportType, setReportType] = useState('doanh-thu');
  const [month, setMonth] = useState('2026-08');
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 text-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Xuất Báo Cáo Tài Chính Kế Toán</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Dữ liệu chuẩn định dạng hạch toán kế toán và đối soát ngân hàng
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

        <form onSubmit={handleExport} className="space-y-4">
          {/* Cơ sở báo cáo */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                PHẠM VI BÁO CÁO
              </span>
              <span className="font-extrabold text-slate-900 text-xs">{branchName}</span>
            </div>
          </div>

          {/* Loại báo cáo */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Loại Báo Cáo Kế Toán</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 text-xs"
            >
              <option value="doanh-thu">Báo cáo doanh thu &amp; dòng tiền thực thu</option>
              <option value="cong-no">Báo cáo công nợ &amp; tiến độ thanh toán đợt</option>
              <option value="chi-phi">Báo cáo chi phí Labo &amp; vật tư tiêu hao</option>
              <option value="vietqr">Bảng đối soát giao dịch VietQR / POS ngân hàng</option>
            </select>
          </div>

          {/* Kỳ báo cáo */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kỳ Hạch Toán</label>
            <div className="relative">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 text-xs"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Định dạng file */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Định Dạng File Xuất</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('excel')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all border flex items-center justify-center gap-2 ${
                  format === 'excel'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs transition-all border flex items-center justify-center gap-2 ${
                  format === 'pdf'
                    ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>📄 PDF Ký Số</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isExporting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang kết xuất...</span>
                </>
              ) : isSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Đã tải xuống</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải File Báo Cáo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
