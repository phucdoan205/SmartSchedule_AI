import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Trash2,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Layers,
  Globe,
} from 'lucide-react';

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: any;
  onSave?: (updatedBranch: any) => void;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen,
  onClose,
  branch,
  onSave,
}) => {
  const [branchType, setBranchType] = useState<'headquarters' | 'standard' | 'satellite'>('headquarters');
  const [name, setName] = useState(branch?.name ? `${branch.name} (Trụ sở chính)` : 'Chi nhánh Biên Hòa (Trụ sở chính)');
  const [address, setAddress] = useState(branch?.address || '123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai');
  const [hotline, setHotline] = useState(branch?.phone || '0236 6555 555');
  const [email, setEmail] = useState('bienhoa@vietanhduc.vn');
  
  // Working hours
  const [weekdayOpen, setWeekdayOpen] = useState('08:00');
  const [weekdayClose, setWeekdayClose] = useState('20:00');
  const [sundayOpen, setSundayOpen] = useState('08:00');
  const [sundayClose, setSundayClose] = useState('17:00');

  // Scale & facilities
  const [areaScale, setAreaScale] = useState('450m² (3 Tầng lầu)');
  const [dentalChairs, setDentalChairs] = useState(branch?.roomCount || 8);
  const [totalStaff, setTotalStaff] = useState(branch?.doctorCount ? branch.doctorCount + 2 : 18);

  // Floor space allocation
  const [floors, setFloors] = useState<string[]>([
    'Khu tiếp đón & 3 Ghế khám tổng quát / Cạo vôi răng',
    'Khu phục hình răng sứ & Phòng chụp X-quang CT Cone Beam',
    '2 Phòng phẫu thuật vô trùng Cấy ghép Implant & Ghép xương',
  ]);

  // Operational status
  const [status, setStatus] = useState<'active' | 'maintenance' | 'closed'>('active');
  const [onlineBooking, setOnlineBooking] = useState(true);

  if (!isOpen) return null;

  const handleAddFloor = () => {
    setFloors([...floors, 'Không gian phòng khám mở rộng']);
  };

  const handleRemoveFloor = (index: number) => {
    setFloors(floors.filter((_, idx) => idx !== index));
  };

  const handleUpdateFloor = (index: number, val: string) => {
    const updated = [...floors];
    updated[index] = val;
    setFloors(updated);
  };

  const handleReset = () => {
    setName('Chi nhánh Biên Hòa (Trụ sở chính)');
    setAddress('123 Đường ABC, Phường Tam Hiệp, TP. Biên Hòa, Đồng Nai');
    setHotline('0236 6555 555');
    setEmail('bienhoa@vietanhduc.vn');
    setDentalChairs(8);
    setTotalStaff(18);
    setAreaScale('450m² (3 Tầng lầu)');
    setStatus('active');
    setOnlineBooking(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        ...branch,
        name,
        address,
        phone: hotline,
        email,
        roomCount: dentalChairs,
        doctorCount: totalStaff,
        status: status === 'active' ? 'Active' : 'Maintenance',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Chỉnh Sửa Thông Tin Chi Nhánh</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật địa chỉ liên hệ, giờ tiếp nhận bệnh nhân và quy mô phòng khám cho {name}.
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
            {/* CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <MapPin className="w-4 h-4 text-sky-600" /> Thông Tin Liên Hệ
              </h4>

              {/* Tên cơ sở */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên cơ sở</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="Nhập tên cơ sở chi nhánh"
                  required
                />
              </div>

              {/* Phân loại */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Phân loại</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBranchType('headquarters')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      branchType === 'headquarters'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Trụ sở chính
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranchType('standard')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      branchType === 'standard'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Chi nhánh tiêu chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setBranchType('satellite')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border ${
                      branchType === 'satellite'
                        ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Phòng khám vệ tinh
                  </button>
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Nhập địa chỉ cơ sở"
                    required
                  />
                </div>
              </div>

              {/* Hotline & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hotline</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={hotline}
                      onChange={(e) => setHotline(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                      placeholder="0236 6555 555"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                      placeholder="email@vietanhduc.vn"
                    />
                  </div>
                </div>
              </div>

              {/* Khung giờ mở cửa */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
                <span className="font-extrabold text-slate-700 flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Khung giờ mở cửa
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between gap-1 bg-white p-2 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-600">T2 - T7</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={weekdayOpen}
                        onChange={(e) => setWeekdayOpen(e.target.value)}
                        className="w-12 text-center py-0.5 border border-slate-200 rounded font-bold"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        value={weekdayClose}
                        onChange={(e) => setWeekdayClose(e.target.value)}
                        className="w-12 text-center py-0.5 border border-slate-200 rounded font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 bg-white p-2 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-600">Chủ Nhật</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={sundayOpen}
                        onChange={(e) => setSundayOpen(e.target.value)}
                        className="w-12 text-center py-0.5 border border-slate-200 rounded font-bold"
                      />
                      <span>-</span>
                      <input
                        type="text"
                        value={sundayClose}
                        onChange={(e) => setSundayClose(e.target.value)}
                        className="w-12 text-center py-0.5 border border-slate-200 rounded font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: QUY MÔ & CƠ SỞ VẬT CHẤT */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <Layers className="w-4 h-4 text-sky-600" /> Quy Mô &amp; Cơ Sở Vật Chất
              </h4>

              {/* Diện tích & Kết cấu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Diện tích &amp; Kết cấu</label>
                <input
                  type="text"
                  value={areaScale}
                  onChange={(e) => setAreaScale(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  placeholder="VD: 450m² (3 Tầng lầu)"
                />
              </div>

              {/* Số ghế & Tổng nhân sự stepper */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Số ghế nha khoa</span>
                  <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setDentalChairs(Math.max(1, dentalChairs - 1))}
                      className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-extrabold text-slate-900">{dentalChairs}</span>
                    <button
                      type="button"
                      onClick={() => setDentalChairs(dentalChairs + 1)}
                      className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Tổng nhân sự</span>
                  <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setTotalStaff(Math.max(1, totalStaff - 1))}
                      className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-base font-extrabold text-slate-900">{totalStaff}</span>
                    <button
                      type="button"
                      onClick={() => setTotalStaff(totalStaff + 1)}
                      className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Phân bổ không gian (Theo tầng) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Phân bổ không gian (Theo tầng)</label>
                  <button
                    type="button"
                    onClick={handleAddFloor}
                    className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Thêm tầng
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {floors.map((floor, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                        T{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={floor}
                        onChange={(e) => handleUpdateFloor(idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 text-[11px] focus:outline-none focus:border-sky-500"
                      />
                      {floors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFloor(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Trạng thái vận hành */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Trạng thái vận hành</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('active')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border flex items-center justify-center gap-1 ${
                      status === 'active'
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> Đang hoạt động
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('maintenance')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border flex items-center justify-center gap-1 ${
                      status === 'maintenance'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Bảo trì tạm thời
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('closed')}
                    className={`py-2 px-2 rounded-xl font-extrabold text-[11px] transition-all border flex items-center justify-center gap-1 ${
                      status === 'closed'
                        ? 'bg-slate-800 text-white border-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Đóng cửa
                  </button>
                </div>
              </div>

              {/* Toggle Đặt lịch hẹn trực tuyến */}
              <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-600" /> Đặt lịch hẹn trực tuyến
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Cho phép bệnh nhân đặt lịch hẹn trực tuyến tại chi nhánh này
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                  <input
                    type="checkbox"
                    checked={onlineBooking}
                    onChange={(e) => setOnlineBooking(e.target.checked)}
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
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center"
            >
              Hủy bỏ
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Đặt lại mặc định
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> LƯU THAY ĐỔI
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
