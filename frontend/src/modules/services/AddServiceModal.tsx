import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Clock,
  HelpCircle,
  UploadCloud,
  Check,
  Building2,
  Stethoscope,
} from 'lucide-react';
import { staffApi, branchesApi, uploadApi } from '../../services/api';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddService?: (newService: any) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onAddService,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('Răng sứ thẩm mỹ');
  const [description, setDescription] = useState('');
  const [warranty, setWarranty] = useState('Bảo hành 10 năm');
  const [price, setPrice] = useState('35.000đ');
  const [deposit, setDeposit] = useState('7.000đ');
  const [duration, setDuration] = useState('60 phút');
  const [hasImage, setHasImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic real data
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [doctorSelectVal, setDoctorSelectVal] = useState('');
  const [selectedBranchIds, setSelectedBranchIds] = useState<Record<string, boolean>>({});

  // Display toggle
  const [publicDisplay, setPublicDisplay] = useState(true);

  // Fetch real doctors and branches from database on open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    Promise.all([
      staffApi.getDoctors().catch(() => []),
      branchesApi.getAll().catch(() => []),
    ]).then(([doctorsData, branchesData]) => {
      if (!isMounted) return;

      const doctorsList = Array.isArray(doctorsData) ? doctorsData : [];
      const branchesList = Array.isArray(branchesData) ? branchesData : [];

      setAvailableDoctors(doctorsList);
      setAvailableBranches(branchesList);

      // Pre-select first real doctor if available and none selected yet
      if (doctorsList.length > 0 && selectedDoctors.length === 0) {
        setSelectedDoctors([doctorsList[0].name || doctorsList[0].fullName || 'BS. Chuyên khoa']);
      }

      // Pre-select all real branches
      const branchMap: Record<string, boolean> = {};
      branchesList.forEach((b: any) => {
        branchMap[b.id] = true;
      });
      setSelectedBranchIds(branchMap);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemoveDoctor = (docName: string) => {
    setSelectedDoctors(selectedDoctors.filter((d) => d !== docName));
  };

  const handleAddDoctor = (docName: string) => {
    if (docName && !selectedDoctors.includes(docName)) {
      setSelectedDoctors([...selectedDoctors, docName]);
    }
    setDoctorSelectVal('');
  };

  const toggleBranch = (branchId: string) => {
    setSelectedBranchIds((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = await uploadApi.uploadImage(file, 'services');
      if (res && res.url) {
        setImageUrl(res.url);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddService) {
      onAddService({
        id: `srv-${Date.now()}`,
        code: `DV-${Math.floor(100 + Math.random() * 900)}`,
        name: serviceName || 'Dịch vụ nha khoa',
        category,
        price: parseInt(price.replace(/\D/g, ''), 10) || 35000,
        deposit: parseInt(deposit.replace(/\D/g, ''), 10) || 7000,
        durationMinutes: parseInt(duration.replace(/\D/g, ''), 10) || 60,
        warranty,
        description,
        doctors: selectedDoctors,
        status: 'Active',
        isAiRecommended: false,
        isPublic: publicDisplay,
        imageUrl: hasImage && imageUrl.trim() ? imageUrl.trim() : null,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-slate-900 border border-sky-100 flex items-center justify-center shrink-0">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Thêm Dịch Vụ Nha Khoa &amp; Cấu Hình Bảng Giá
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập tên dịch vụ, đơn giá niêm yết, tiền cọc giữ chỗ, thời gian thực hiện và phân công bác sĩ chuyên khoa
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột 1: Thông tin cơ bản */}
            <div className="space-y-4">
              {/* Tên dịch vụ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên dịch vụ nha khoa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ví dụ: Sứ toàn phần Cercon HT (Đức)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              {/* Nhóm danh mục dịch vụ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhóm danh mục dịch vụ</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Cấy ghép Implant đơn lẻ">Cấy ghép Implant đơn lẻ</option>
                    <option value="Cấy ghép Implant toàn hàm">Cấy ghép Implant toàn hàm (All-on-4 / All-on-6)</option>
                    <option value="Răng sứ thẩm mỹ">Răng sứ thẩm mỹ</option>
                    <option value="Chỉnh nha & Niềng răng">Chỉnh nha &amp; Niềng răng</option>
                    <option value="Mini hàm tháo lắp">Mini hàm tháo lắp</option>
                    <option value="Thủ thuật đi kèm">Thủ thuật đi kèm</option>
                    <option value="Nha khoa thẩm mỹ & Tổng quát">Nha khoa thẩm mỹ &amp; Tổng quát</option>
                  </select>
                </div>
              </div>

              {/* Mô tả ngắn */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn &amp; Lợi ích lâm sàng</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết về dịch vụ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-normal text-slate-800 focus:outline-none focus:border-sky-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              {/* Thời hạn bảo hành chính hãng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời hạn bảo hành chính hãng</label>
                <select
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Bảo hành 1 tháng">Bảo hành 1 tháng</option>
                  <option value="Bảo hành 1 năm">Bảo hành 1 năm</option>
                  <option value="Bảo hành 2 năm">Bảo hành 2 năm</option>
                  <option value="Bảo hành 5 năm">Bảo hành 5 năm</option>
                  <option value="Bảo hành 7 năm">Bảo hành 7 năm</option>
                  <option value="Bảo hành 10 năm">Bảo hành 10 năm</option>
                  <option value="Bảo hành 12 năm">Bảo hành 12 năm</option>
                  <option value="Bảo hành 15 năm">Bảo hành 15 năm</option>
                  <option value="Trụ Trọn đời • Răng Lava 15 năm">Trụ Trọn đời • Răng Lava 15 năm</option>
                  <option value="Trọn gói điều trị">Trọn gói điều trị</option>
                </select>
              </div>

              {/* Switch Có/Không ảnh minh họa */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-slate-800 block text-xs">Ảnh minh họa dịch vụ</label>
                    <p className="text-[11px] text-slate-500">
                      {hasImage ? 'Tải ảnh từ máy tính lên Cloudinary' : 'Không có ảnh (hiển thị biểu tượng nha khoa)'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasImage}
                      onChange={(e) => setHasImage(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                  </label>
                </div>

                {hasImage && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {imageUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={imageUrl}
                          alt="Minh họa"
                          className="h-28 w-auto rounded-xl object-cover border border-slate-200 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer py-3 hover:bg-sky-50/50 rounded-xl transition-colors"
                      >
                        <UploadCloud className="w-8 h-8 text-sky-600 mx-auto mb-1.5" />
                        <span className="text-xs font-bold text-sky-600 block">
                          {isUploading ? 'Đang tải lên Cloudinary...' : 'Nhấp để chọn ảnh tải lên'}
                        </span>
                        <span className="text-[10px] text-slate-400">Hỗ trợ JPG, PNG, WEBP tối đa 5MB</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cột 2: Cấu hình giá, Bác sĩ & Chi nhánh */}
            <div className="space-y-4">
              {/* Đơn giá niêm yết & Tiền cọc */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đơn giá niêm yết (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="35.000đ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-right focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tiền cọc qua VietQR</span>
                    <span title="Tiền cọc yêu cầu bệnh nhân thanh toán trước để giữ chỗ qua cổng VietQR">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                    </span>
                  </label>
                  <input
                    type="text"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="7.000đ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-right focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              {/* Thời lượng thực hiện tiêu chuẩn */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời lượng thực hiện tiêu chuẩn</label>
                <div className="relative">
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="60 phút"
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Bác sĩ chuyên khoa phụ trách (DỮ LIỆU THẬT) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                  Bác sĩ chuyên khoa phụ trách
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 focus-within:border-sky-500 transition-colors">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedDoctors.map((doc) => (
                      <span
                        key={doc}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 font-bold text-xs rounded-lg"
                      >
                        {doc}
                        <button
                          type="button"
                          onClick={() => handleRemoveDoctor(doc)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {selectedDoctors.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">Chưa chọn bác sĩ phụ trách</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <select
                      value={doctorSelectVal}
                      onChange={(e) => handleAddDoctor(e.target.value)}
                      className="w-full bg-transparent text-slate-600 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">+ Thêm bác sĩ chuyên khoa...</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.name || doc.fullName}>
                          {doc.name || doc.fullName} {doc.specialty ? `- ${doc.specialty}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Chi nhánh áp dụng (DỮ LIỆU THẬT) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                  Chi nhánh áp dụng
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {availableBranches.map((branch) => (
                    <label key={branch.id} className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={!!selectedBranchIds[branch.id]}
                        onChange={() => toggleBranch(branch.id)}
                        className="rounded text-sky-600 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span>{branch.name}</span>
                    </label>
                  ))}
                  {availableBranches.length === 0 && (
                    <p className="text-slate-400 text-[11px]">Đang tải danh sách chi nhánh...</p>
                  )}
                </div>
              </div>

              {/* Trạng thái hiển thị (ĐÃ LOẠI BỎ AI ĐỀ XUẤT) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 text-xs block">
                      Trạng thái hiển thị
                    </span>
                    <p className="text-[11px] text-slate-500">Hiển thị công khai trên cổng đặt lịch của khách hàng</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input
                      type="checkbox"
                      checked={publicDisplay}
                      onChange={(e) => setPublicDisplay(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shadow-xs text-center cursor-pointer"
            >
              Hủy bỏ
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl transition-colors text-center cursor-pointer"
              >
                Lưu nháp
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>LƯU &amp; CÔNG BỐ DỊCH VỤ</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
