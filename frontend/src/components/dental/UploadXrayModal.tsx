import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { UploadCloud, CheckCircle2, Sparkles, FileImage, X } from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { uploadApi } from '../../services/api';

interface UploadXrayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onUploadSuccess?: (imageUrl: string, filmType: string, notes: string) => void;
}

export const UploadXrayModal: React.FC<UploadXrayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onUploadSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [filmType, setFilmType] = useState('CT Cone Beam 3D');
  const [toothArea, setToothArea] = useState('Vùng răng 46');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Preview for image files
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl('');
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast('Vui lòng chọn file phim X-quang trước khi tải lên!', 'error');
      return;
    }

    try {
      setIsUploading(true);

      // Upload thật lên Cloudinary
      const result = await uploadApi.uploadImage(selectedFile, 'xrays');
      const imageUrl = result.url;

      setIsUploading(false);
      setIsDone(true);

      setTimeout(() => {
        setIsDone(false);
        toast(`Đã tải lên thành công phim chụp X-quang (${filmType}) và phân tích AI!`);

        // Reset state
        setSelectedFile(null);
        setPreviewUrl('');
        setNotes('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        onClose();
        if (onSuccess) onSuccess();
        if (onUploadSuccess) onUploadSuccess(imageUrl, filmType, notes || toothArea);
      }, 800);
    } catch (err) {
      console.error('Lỗi khi tải lên phim X-quang:', err);
      toast('Có lỗi xảy ra khi tải lên phim X-quang. Vui lòng thử lại!', 'error');
      setIsUploading(false);
    }
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
        {selectedFile ? (
          <div className="relative rounded-2xl border-2 border-solid border-sky-300 bg-sky-50/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-sky-200 text-sky-600 shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <FileImage className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{selectedFile.name}</p>
                <p className="text-slate-500 text-[11px]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Không rõ định dạng'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Xóa file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Xem trước phim X-quang"
                className="mt-3 w-full max-h-40 object-contain rounded-xl border border-sky-100 bg-slate-900"
              />
            )}
          </div>
        ) : (
          <div
            className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-sky-500 hover:bg-sky-50/30 transition-all cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropzoneDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-sky-600 mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="font-extrabold text-slate-900">
              Kéo và thả file phim chụp vào đây, hoặc <span className="text-sky-600 underline">chọn tệp</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Hỗ trợ DICOM 3.0, JPEG, PNG, TIFF độ phân giải cao lên đến 150MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.dcm,.dicom"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

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
            Hệ thống AI sẽ tự động phân tích mật độ xương và dựng hình 3D sau khi tải lên. Ảnh được lưu trên Cloudinary.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 font-bold text-slate-600 hover:text-slate-900 text-center"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isUploading || isDone || !selectedFile}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 font-extrabold text-white hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang tải lên Cloudinary...</span>
              </>
            ) : isDone ? (
              <span className="flex items-center justify-center gap-1 text-emerald-300">
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
