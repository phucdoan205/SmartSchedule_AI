import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  Check,
  Sparkles,
  Shield,
  CreditCard,
  Clock,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { uploadApi } from '../../services/api';
import {
  CLOUDINARY_ALLON4,
  CLOUDINARY_ORTHO,
  CLOUDINARY_PORCELAIN,
  CLOUDINARY_IMPLANT,
} from '../../services/mockData';

export interface DetailedServiceItem {
  id: string;
  code?: string;
  name: string;
  category: string;
  categoryId?: string;
  price: number;
  deposit?: number;
  warranty?: string;
  durationMinutes: number;
  doctors?: string[];
  isActive: boolean;
  aiRecommended?: boolean;
  imageUrl?: string;
  description?: string;
}

interface EditServiceModalProps {
  isOpen: boolean;
  service: DetailedServiceItem | null;
  onClose: () => void;
  onSave: (id: string, updatedData: any) => Promise<void> | void;
}

const CATEGORY_OPTIONS = [
  'Cấy ghép Implant đơn lẻ',
  'Cấy ghép Implant toàn hàm (All-on-4 / All-on-6)',
  'Răng sứ thẩm mỹ',
  'Chỉnh nha & Niềng răng',
  'Mini hàm tháo lắp',
  'Thủ thuật đi kèm',
  'Nha khoa thẩm mỹ & Tổng quát',
];

const PRESET_IMAGES = [
  { label: 'All on 4/6', url: CLOUDINARY_ALLON4, desc: 'Implant toàn hàm' },
  { label: 'Chỉnh nha 3M', url: CLOUDINARY_ORTHO, desc: 'Mắc cài & Invisalign' },
  { label: 'Răng sứ & Veneer', url: CLOUDINARY_PORCELAIN, desc: 'Cercon & Emax' },
  { label: 'Implant đơn lẻ', url: CLOUDINARY_IMPLANT, desc: 'Straumann & Osstem' },
];

export const EditServiceModal: React.FC<EditServiceModalProps> = ({
  isOpen,
  service,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [priceStr, setPriceStr] = useState('');
  const [depositStr, setDepositStr] = useState('');
  const [duration, setDuration] = useState(60);
  const [warranty, setWarranty] = useState('');
  const [description, setDescription] = useState('');
  const [isAiRecommended, setIsAiRecommended] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Image Switch state: True = upload/has image; False = no image allowed, default to icon
  const [hasImage, setHasImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setCode(service.code || '');
      setCategory(service.category || CATEGORY_OPTIONS[0]);
      setPriceStr(service.price ? service.price.toLocaleString('vi-VN') : '0');
      setDepositStr(service.deposit ? service.deposit.toLocaleString('vi-VN') : '0');
      setDuration(service.durationMinutes || 60);
      setWarranty(service.warranty || '');
      setDescription(service.description || '');
      setIsAiRecommended(Boolean(service.aiRecommended));
      setIsActive(service.isActive !== false);

      // Check whether service currently has an image
      if (service.imageUrl && service.imageUrl.trim() !== '') {
        setHasImage(true);
        setImageUrl(service.imageUrl);
      } else {
        setHasImage(false);
        setImageUrl('');
      }
      setErrorMsg(null);
    }
  }, [service, isOpen]);

  if (!isOpen || !service) return null;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10);
    setPriceStr(isNaN(num) ? '' : num.toLocaleString('vi-VN'));
  };

  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10);
    setDepositStr(isNaN(num) ? '' : num.toLocaleString('vi-VN'));
  };

  const handleToggleHasImage = () => {
    const nextState = !hasImage;
    setHasImage(nextState);
    if (!nextState) {
      // If toggled off, clear image so default becomes "no image"
      setImageUrl('');
    } else if (!imageUrl) {
      // If toggled on and no image exists, default to preset 1
      setImageUrl(CLOUDINARY_PORCELAIN);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setErrorMsg(null);
      const res = await uploadApi.uploadImage(file, 'services');
      if (res && res.url) {
        setImageUrl(res.url);
      }
    } catch (err: any) {
      console.error('Lỗi tải ảnh lên Cloudinary:', err);
      // Fallback to FileReader base64 if Cloudinary fails or offline
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImageUrl(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setErrorMsg('Không thể tải ảnh lên. Vui lòng thử lại.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên dịch vụ');
      return;
    }

    const priceNum = parseInt(priceStr.replace(/\D/g, ''), 10) || 0;
    const depositNum = parseInt(depositStr.replace(/\D/g, ''), 10) || 0;

    try {
      setIsSaving(true);
      setErrorMsg(null);

      const finalImageUrl = hasImage && imageUrl.trim() !== '' ? imageUrl.trim() : null;

      await onSave(service.id, {
        name: name.trim(),
        code: code.trim(),
        category,
        standardPrice: priceNum,
        deposit: depositNum,
        durationMinutes: duration,
        warranty: warranty.trim() || null,
        description: description.trim() || null,
        imageUrl: finalImageUrl,
        isAiRecommended,
        isActive,
      });

      onClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu dịch vụ:', err);
      setErrorMsg(err.message || 'Không thể lưu dịch vụ, vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 font-extrabold text-lg">
              ✏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Chỉnh Sửa Dịch Vụ &amp; Bảng Giá
                </h2>
                {service.code && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 text-[10px] font-extrabold border border-sky-400/30">
                    {service.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật định mức giá, chính sách bảo hành và hình ảnh đại diện dịch vụ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500" /> 1. Thông Tin Dịch Vụ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Tên dịch vụ nha khoa *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Cấy ghép 1 trụ Implant Straumann SLA..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700">Mã kỹ thuật *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="DV-IMP-01"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Danh mục phân khúc lâm sàng *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Định giá & Chính sách */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" /> 2. Định Giá &amp; Bảo Hành
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  🏷️ Giá niêm yết (VNĐ) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={priceStr}
                    onChange={handlePriceChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-teal-700 focus:outline-none focus:border-teal-500"
                    placeholder="43.000.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    đ
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Tiền đặt cọc (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={depositStr}
                    onChange={handleDepositChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-sky-500"
                    placeholder="5.000.000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    đ
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Thời lượng (phút)
                </label>
                <input
                  type="number"
                  min="10"
                  max="480"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" /> Cam kết bảo hành
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                placeholder="Ví dụ: Trụ Trọn đời • Răng Lava 15 năm..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Mô tả chi tiết kỹ thuật</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả tóm tắt kỹ thuật lâm sàng, chỉ định và vật liệu sử dụng..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Section 3: CÔNG TẮC HÌNH ẢNH DỊCH VỤ (REQUIREMENT 3) */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-600" />
                  <span>Hình Ảnh Đại Diện Dịch Vụ</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bật công tắc để tải ảnh lên. Tắt đi nếu muốn dịch vụ mặc định không có ảnh (hiển thị biểu tượng nha khoa).
                </p>
              </div>

              {/* Switch Quản Lý Ảnh */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                    hasImage
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {hasImage ? 'Đang bật ảnh' : 'Không có ảnh'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasImage}
                    onChange={handleToggleHasImage}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                </label>
              </div>
            </div>

            {/* When Switch hasImage is ON: Upload & Choose Image */}
            {hasImage ? (
              <div className="space-y-3.5 p-4 rounded-2xl bg-sky-50/50 border border-sky-100 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Image Preview Box */}
                  <div className="w-full aspect-video sm:aspect-square rounded-2xl bg-slate-100 border-2 border-dashed border-sky-300 overflow-hidden relative flex items-center justify-center group shadow-xs">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Xem trước ảnh dịch vụ"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold shadow hover:bg-slate-100 cursor-pointer"
                            title="Đổi ảnh khác"
                          >
                            Đổi ảnh
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="p-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow hover:bg-rose-700 cursor-pointer"
                            title="Xóa ảnh hiện tại"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1 text-sky-400" />
                        <span className="text-[10px] font-bold text-slate-500">Chưa chọn ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="sm:col-span-2 space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>{isUploading ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
                      </button>

                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Hoặc chọn nhanh từ kho ảnh mẫu:</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => setImageUrl(preset.url)}
                            className={`px-2.5 py-1.5 rounded-lg text-left text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-between ${
                              imageUrl === preset.url
                                ? 'bg-sky-100/90 border-sky-400 text-sky-900 shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{preset.label}</span>
                            {imageUrl === preset.url && <Check className="w-3 h-3 text-sky-700 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // When Switch hasImage is OFF: Informative disabled state
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-slate-600 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-bold text-sm">
                  🦷
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-extrabold text-slate-800">
                    Chế độ không ảnh (Mặc định biểu tượng chuyên khoa)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Dịch vụ này sẽ hiển thị sạch sẽ với biểu tượng nha khoa tinh tế trên bảng giá và trang người dùng. Không phát sinh ảnh rỗng hay lỗi tải ảnh.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Trạng thái hiển thị & AI */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 3. Trạng Thái Vận Hành &amp; AI
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Active Toggle (Requirement 4) */}
              <label className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div>
                  <p className="text-xs font-extrabold text-slate-900">
                    {isActive ? 'Đang áp dụng công khai' : 'Tạm ẩn dịch vụ (Tạm dừng)'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {isActive
                      ? 'Hiển thị trên trang chủ và cho phép đặt lịch'
                      : 'Ẩn khỏi trang chủ & người dùng cho đến khi bật lại'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
              </label>

              {/* AI Recommendation */}
              <label className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-colors">
                <div>
                  <p className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Đề xuất nổi bật
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    Ưu tiên hiển thị trên banner dịch vụ nổi bật
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isAiRecommended}
                  onChange={(e) => setIsAiRecommended(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-extrabold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
