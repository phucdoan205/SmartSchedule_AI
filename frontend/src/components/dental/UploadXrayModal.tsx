import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { UploadCloud, CheckCircle2, Sparkles } from 'lucide-react';

interface UploadXrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UploadXrayModal: React.FC<UploadXrayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [filmType, setFilmType] = useState('CT Cone Beam 3D');
  const [toothArea, setToothArea] = useState('Vùng răng 46');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1000);
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tải lên phim chụp X-quang mới"
      subtitle="Hỗ trợ chuẩn DICOM (.dcm), Panorama, CT Cone Beam (.png, .jpg)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Dropzone */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-sky-500 hover:bg-sky-50/30 transition-all cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-sky-600 mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="font-extrabold text-slate-900">
            Kéo và thả file phim chụp vào đây, hoặc <span className="text-sky-600 underline">chọn tệp</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Hỗ trợ DICOM 3.0, JPEG, PNG, TIFF độ phân giải cao lên đến 150MB
          </p>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-700">Loại phim X-quang</label>
            <select
              value={filmType}
              onChange={(e) => setFilmType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
            >
              <option value="CT Cone Beam 3D">CT Cone Beam 3D (CBCT)</option>
              <option value="Phim Panorama">Phim Toàn Cảnh Panorama</option>
              <option value="Periapical">Phim Cận Chóp (Periapical)</option>
              <option value="Cephalometric">Phim Sọ Nghiêng Cephalometric</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700">Vị trí cung hàm / Răng</label>
            <input
              type="text"
              value={toothArea}
              onChange={(e) => setToothArea(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
              placeholder="VD: Toàn hàm, Vùng răng 46..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-extrabold text-slate-700">Mục đích chụp & Ghi chú</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden resize-none"
            placeholder="VD: Khảo sát chiều cao sống hàm trước khi đặt trụ Implant..."
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-sky-50 border border-sky-100 p-3 text-sky-800">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <p className="text-[11px] font-medium">
            Hệ thống AI sẽ tự động phân tích mật độ xương và dựng hình 3D sau khi tải lên.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isUploading || isDone}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 font-extrabold text-white hover:bg-slate-800 shadow-sm disabled:opacity-50"
          >
            {isUploading ? (
              <span>Đang tải lên & Phân tích AI...</span>
            ) : isDone ? (
              <span className="flex items-center gap-1 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> Hoàn tất
              </span>
            ) : (
              <span>Tải lên & Lưu hồ sơ</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
