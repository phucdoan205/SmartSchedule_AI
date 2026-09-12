import React, { useState } from 'react';
import {
  X,
  Building2,
  Camera,
  Phone,
  Mail,
  Clock,
  Plus,
  Minus,
  Check,
  Sparkles,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../../services/mockData';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBranch?: (branch: any) => void;
}

export const AddBranchModal: React.FC<AddBranchModalProps> = ({
  isOpen,
  onClose,
  onAddBranch,
}) => {
  const [name, setName] = useState('Chi nhánh Bình Dương - Thủ Dầu Một');
  const [code, setCode] = useState('CN-BD04');
  const [branchType, setBranchType] = useState<'headquarters' | 'standard' | 'satellite'>('standard');
  const [province, setProvince] = useState('Tỉnh Bình Dương');
  const [district, setDistrict] = useState('TP. Thủ Dầu Một');
  const [streetAddress, setStreetAddress] = useState('Đại lộ Bình Dương, Phường Phú Hòa');
  const [hotline, setHotline] = useState('0908 123 456');
  const [email, setEmail] = useState('binhduong@vietanhduc.vn');
  const [selectedDirector, setSelectedDirector] = useState(MOCK_DOCTORS[0]?.name || 'BS.CKI Nguyễn Văn Tuấn');
  const [standardChairs, setStandardChairs] = useState(4);
  const [implantRooms, setImplantRooms] = useState(2);
  const [operationalStatus, setOperationalStatus] = useState<'active' | 'upcoming'>('upcoming');
  const [syncToMainSystem, setSyncToMainSystem] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddBranch) {
      onAddBranch({
        id: `b-${Date.now()}`,
        name,
        code,
        address: `${streetAddress}, ${district}, ${province}`,
        phone: hotline,
        email,
        roomCount: standardChairs + implantRooms,
        doctorCount: 8,
        status: operationalStatus === 'active' ? 'Active' : 'Upcoming',
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
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Thiết Lập &amp; Thêm Chi Nhánh Mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình thông tin địa điểm, phân bổ quy mô ghế khám ban đầu và chỉ định giám đốc cơ sở phụ trách.
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

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI */}
            <div className="space-y-4">
              {/* Ảnh đại diện cơ sở */}
              <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-2xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Ảnh đại diện cơ sở</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Kích thước khuyến nghị: 1200×800px (Tối đa 5MB)</p>
                  <button type="button" className="text-sky-600 hover:text-sky-700 font-bold text-xs mt-1 block">
                    Tải ảnh lên
                  </button>
                </div>
              </div>

              {/* Tên & Mã chi nhánh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên chi nhánh / Cơ sở <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Chi nhánh Bình Dương..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã chi nhánh</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CN-BD04"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phân loại cơ sở */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Phân loại cơ sở</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBranchType('headquarters')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      branchType === 'headquarters'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Trụ sở chính
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranchType('standard')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border flex items-center justify-center gap-1 ${
                      branchType === 'standard'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" /> Chi nhánh tiêu chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranchType('satellite')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      branchType === 'satellite'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Phòng khám vệ tinh
                  </button>
                </div>
              </div>

              {/* Thông tin liên hệ & Địa chỉ */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Thông tin liên hệ &amp; Địa chỉ</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="Tỉnh Bình Dương">Tỉnh Bình Dương</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Tỉnh Đồng Nai">Tỉnh Đồng Nai</option>
                  </select>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="TP. Thủ Dầu Một">TP. Thủ Dầu Một</option>
                    <option value="TP. Thuận An">TP. Thuận An</option>
                    <option value="TP. Dĩ An">TP. Dĩ An</option>
                    <option value="Quận 1">Quận 1</option>
                  </select>
                </div>

                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Số nhà, Tên đường, Phường/Xã..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Hotline & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    placeholder="Hotline 090..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email contact@..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-4">
              {/* Giám đốc cơ sở / Bác sĩ trưởng */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Giám đốc cơ sở / Bác sĩ trưởng</label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-xs">
                      👨‍⚕️
                    </div>
                    <div>
                      <select
                        value={selectedDirector}
                        onChange={(e) => setSelectedDirector(e.target.value)}
                        className="font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer text-xs"
                      >
                        {MOCK_DOCTORS.map((doc) => (
                          <option key={doc.id} value={doc.name}>
                            {doc.name} - {doc.specialty}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500">Chuyên khoa Răng Hàm Mặt</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUY MÔ CƠ SỞ VẬT CHẤT */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  QUY MÔ CƠ SỞ VẬT CHẤT
                </span>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    🪑 Số ghế nha khoa tiêu chuẩn
                  </span>
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => setStandardChairs(Math.max(1, standardChairs - 1))}
                      className="w-6 h-6 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-slate-900">{standardChairs}</span>
                    <button
                      type="button"
                      onClick={() => setStandardChairs(standardChairs + 1)}
                      className="w-6 h-6 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    🏥 Số phòng phẫu thuật Implant vô trùng
                  </span>
                  <div className="flex items-center bg-white rounded-xl border border-slate-200 px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => setImplantRooms(Math.max(0, implantRooms - 1))}
                      className="w-6 h-6 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-slate-900">{implantRooms}</span>
                    <button
                      type="button"
                      onClick={() => setImplantRooms(implantRooms + 1)}
                      className="w-6 h-6 hover:bg-slate-100 rounded text-slate-600 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Trạng thái vận hành */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Trạng thái vận hành</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOperationalStatus('active')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-[11px] transition-all border ${
                      operationalStatus === 'active'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Đang hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperationalStatus('upcoming')}
                    className={`py-2 px-3 rounded-xl font-extrabold text-[11px] transition-all border ${
                      operationalStatus === 'upcoming'
                        ? 'bg-sky-50 border-sky-500 text-sky-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Sắp khai trương / Đang hoàn thiện
                  </button>
                </div>
              </div>

              {/* Giờ làm việc tiêu chuẩn */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Giờ làm việc tiêu chuẩn</span>
                    <span className="text-[11px] text-slate-500">Thứ 2 - CN: 08:00 - 20:00</span>
                  </div>
                </div>
                <button type="button" className="text-sky-600 hover:text-sky-700 font-bold text-xs">
                  Chỉnh sửa
                </button>
              </div>

              {/* AI Dự Báo Box */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Dự báo:
                </div>
                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                  Với quy mô {standardChairs + implantRooms} ghế/phòng mổ, cơ sở dự kiến tiếp nhận tối đa{' '}
                  { (standardChairs + implantRooms) * 6 } lượt khám/ngày và cần tối thiểu 10 nhân sự (6 Bác sĩ, 4 Điều dưỡng) để đạt hiệu suất 85%.
                </p>
              </div>

              {/* Toggle Đồng bộ */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-700 text-xs">Đồng bộ đặt lịch lên hệ thống tổng</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToMainSystem}
                    onChange={(e) => setSyncToMainSystem(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors text-center"
              >
                Lưu nháp cấu hình
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> XÁC NHẬN THÊM CHI NHÁNH
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
