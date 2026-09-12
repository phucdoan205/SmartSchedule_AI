import React, { useState } from 'react';
import {
  X,
  Plus,
  Clock,
  HelpCircle,
  Sparkles,
  UploadCloud,
  Check,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';

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
  const [price, setPrice] = useState('6.000.000đ');
  const [deposit, setDeposit] = useState('500.000đ');
  const [duration, setDuration] = useState('60 phút');

  // Selected Doctors tags
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([
    'BS. Nguyễn Thị An',
    'BS. Trần Đức Cường',
  ]);
  const [doctorSelectVal, setDoctorSelectVal] = useState('');

  // Branches applied
  const [branchesApplied, setBranchesApplied] = useState({
    bienHoa: true,
    quan1: true,
  });

  // AI & Display toggles
  const [aiRecommendation, setAiRecommendation] = useState(true);
  const [publicDisplay, setPublicDisplay] = useState(true);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddService) {
      onAddService({
        id: `srv-${Date.now()}`,
        code: `DV-${Math.floor(100 + Math.random() * 900)}`,
        name: serviceName || 'Sứ toàn phần Cercon HT (Đức)',
        category,
        price: parseInt(price.replace(/\D/g, '')) || 6000000,
        deposit: parseInt(deposit.replace(/\D/g, '')) || 500000,
        durationMinutes: parseInt(duration.replace(/\D/g, '')) || 60,
        warranty,
        description,
        doctors: selectedDoctors,
        status: 'Active',
        aiRecommended: aiRecommendation,
        isPublic: publicDisplay,
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
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
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

        {/* Form Content - 2 Columns */}
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI */}
            <div className="space-y-4">
              {/* Tên dịch vụ nha khoa */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {/* Nhóm danh mục dịch vụ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nhóm danh mục dịch vụ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="Răng sứ thẩm mỹ">Răng sứ thẩm mỹ</option>
                  <option value="Cấy ghép Implant">Cấy ghép Implant</option>
                  <option value="Mini hàm tháo lắp">Mini hàm tháo lắp</option>
                  <option value="Thủ thuật đi kèm">Thủ thuật đi kèm</option>
                  <option value="Chỉnh nha & Niềng răng">Chỉnh nha &amp; Niềng răng</option>
                  <option value="Điều trị tổng quát">Điều trị tổng quát</option>
                </select>
              </div>

              {/* Mô tả ngắn & Lợi ích lâm sàng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả ngắn &amp; Lợi ích lâm sàng</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập mô tả chi tiết về dịch vụ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-sky-500 transition-colors text-xs resize-none"
                />
              </div>

              {/* Thời hạn bảo hành chính hãng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời hạn bảo hành chính hãng</label>
                <select
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                >
                  <option value="Bảo hành 10 năm">Bảo hành 10 năm</option>
                  <option value="Bảo hành 5 năm">Bảo hành 5 năm</option>
                  <option value="Bảo hành 7 năm">Bảo hành 7 năm</option>
                  <option value="Bảo hành 15 năm">Bảo hành 15 năm</option>
                  <option value="Trọn đời">Trọn đời</option>
                  <option value="Không áp dụng">Không áp dụng</option>
                </select>
              </div>

              {/* Ảnh minh họa dịch vụ (Upload Dropzone) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh minh họa dịch vụ</label>
                <div className="p-5 bg-white border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-colors group">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 group-hover:bg-sky-50 text-slate-500 group-hover:text-sky-600 flex items-center justify-center transition-colors">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-xs group-hover:text-sky-600 transition-colors">
                      Kéo thả ảnh vào đây hoặc click để tải lên
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, tối đa 5MB. Tỷ lệ 4:3 (Khuyến nghị 800×600px)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-4">
              {/* Đơn giá niêm yết & Tiền cọc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đơn giá niêm yết (VND) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="6.000.000đ"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-extrabold text-slate-900 text-right focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Tiền cọc qua VietQR</span>
                    <span title="Tiền cọc yêu cầu bệnh nhân thanh toán trước để giữ chỗ qua cổng VietQR">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                    </span>
                  </label>
                  <input
                    type="text"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="500.000đ"
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

              {/* Bác sĩ chuyên khoa phụ trách (Multi-tag input) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bác sĩ chuyên khoa phụ trách</label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl space-y-2 focus-within:border-sky-500 transition-colors">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedDoctors.map((doc) => (
                      <span
                        key={doc}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-lg"
                      >
                        {doc}
                        <button
                          type="button"
                          onClick={() => handleRemoveDoctor(doc)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <select
                      value={doctorSelectVal}
                      onChange={(e) => handleAddDoctor(e.target.value)}
                      className="w-full bg-transparent text-slate-500 text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="">Thêm bác sĩ...</option>
                      {MOCK_DOCTORS.map((doc) => (
                        <option key={doc.id} value={doc.name}>
                          {doc.name} - {doc.specialty}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Chi nhánh áp dụng */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Chi nhánh áp dụng</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={branchesApplied.bienHoa}
                      onChange={(e) =>
                        setBranchesApplied({ ...branchesApplied, bienHoa: e.target.checked })
                      }
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span>Chi nhánh Biên Hòa (Trụ sở chính)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={branchesApplied.quan1}
                      onChange={(e) =>
                        setBranchesApplied({ ...branchesApplied, quan1: e.target.checked })
                      }
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span>Chi nhánh Quận 1 (Hồ Chí Minh)</span>
                  </label>
                </div>
              </div>

              {/* AI & Trạng thái hiển thị (Card nền xanh nhạt) */}
              <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl space-y-3.5">
                {/* Row 1: AI Đề xuất */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" /> AI Đề xuất Dịch Vụ
                    </span>
                    <p className="text-[11px] text-slate-500">Tự động gợi ý cho khách hàng tiềm năng</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                    <input
                      type="checkbox"
                      checked={aiRecommendation}
                      onChange={(e) => setAiRecommendation(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                  </label>
                </div>

                {/* Row 2: Trạng thái hiển thị */}
                <div className="flex items-center justify-between pt-2 border-t border-sky-100">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-slate-900 text-xs block">
                      Trạng thái hiển thị
                    </span>
                    <p className="text-[11px] text-slate-500">Hiển thị công khai trên cổng đặt lịch</p>
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
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors shadow-xs text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-sky-500 hover:bg-sky-50 text-sky-600 font-bold rounded-xl transition-colors text-center"
              >
                Lưu nháp
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> LƯU &amp; CÔNG BỐ DỊCH VỤ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
