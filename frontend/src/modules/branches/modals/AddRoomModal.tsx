import React, { useState } from 'react';
import {
  X,
  Armchair,
  Sparkles,
  Check,
} from 'lucide-react';
import { MOCK_DOCTORS } from '../../../services/mockData';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchName?: string;
  onAddRoom?: (room: any) => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  branchName = 'Chi nhánh Biên Hòa',
  onAddRoom,
}) => {
  const [roomName, setRoomName] = useState('Ghế 05');
  const [roomType, setRoomType] = useState<'standard' | 'prosthodontics' | 'implant'>('standard');
  const [floor, setFloor] = useState('Tầng 1 (Khu khám tổng)');
  const [subRoom, setSubRoom] = useState('Phòng 102');
  const [initialStatus, setInitialStatus] = useState<'ready' | 'maintenance'>('ready');
  const [selectedDoctor, setSelectedDoctor] = useState(MOCK_DOCTORS[2]?.name || 'BS. Trần Đức Cường');

  // Equipment checklist
  const [equipments, setEquipments] = useState({
    ultrasonicScaler: true,
    curingLight: true,
    xrayPeriapical: true,
    implantSurgicPro: false,
  });

  const [webBooking, setWebBooking] = useState(true);
  const [sterilizeInterval, setSterilizeInterval] = useState('15 phút');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddRoom) {
      onAddRoom({
        id: `r-${Date.now()}`,
        name: roomName,
        floor: `${floor} - ${subRoom}`,
        status: initialStatus === 'ready' ? 'Ready' : 'Maintenance',
        statusLabel: initialStatus === 'ready' ? 'Sẵn sàng' : 'Bảo trì / Thay lọc',
        doctorName: selectedDoctor,
        webBookingEnabled: webBooking,
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
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Thêm &amp; Thiết Lập Phòng Khám Mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình mã phòng, vị trí tầng lầu, gắn thiết bị chuyên dụng và phân công bác sĩ phụ trách tại {branchName}.
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

        {/* AI Banner Gợi Ý */}
        <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-sky-800 font-semibold leading-relaxed">
            <strong>Gợi ý AI:</strong> Bổ sung {roomName} tại Tầng 1 sẽ giúp giảm 35% thời gian chờ đợi vào khung giờ cao điểm (09:00 - 11:30) cho dịch vụ Khám tổng quát &amp; Vệ sinh răng.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI */}
            <div className="space-y-4">
              {/* Tên / Mã phòng khám */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên / Mã phòng khám <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="VD: Ghế 05, Phòng mổ 02..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Phân loại phòng & Chức năng */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Phân loại phòng &amp; Chức năng</label>

                <div
                  onClick={() => setRoomType('standard')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    roomType === 'standard'
                      ? 'bg-sky-50/50 border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        roomType === 'standard' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                      }`}
                    >
                      {roomType === 'standard' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">Phòng khám tiêu chuẩn / Cạo vôi</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Trang bị cơ bản cho các dịch vụ tổng quát hàng ngày.</p>
                  </div>
                </div>

                <div
                  onClick={() => setRoomType('prosthodontics')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    roomType === 'prosthodontics'
                      ? 'bg-sky-50/50 border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        roomType === 'prosthodontics' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                      }`}
                    >
                      {roomType === 'prosthodontics' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">Phòng phục hình Răng sứ / Chỉnh nha</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Kèm máy quét dấu hàm 3D và phụ kiện phục hình.</p>
                  </div>
                </div>

                <div
                  onClick={() => setRoomType('implant')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    roomType === 'implant'
                      ? 'bg-sky-50/50 border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        roomType === 'implant' ? 'border-sky-600 bg-sky-600' : 'border-slate-300'
                      }`}
                    >
                      {roomType === 'implant' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">Phòng mổ vô trùng Implant &amp; Tiểu phẫu</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Chuẩn áp lực dương, vô trùng tuyệt đối.</p>
                  </div>
                </div>
              </div>

              {/* Vị trí lắp đặt */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vị trí lắp đặt (Tầng / Khu vực)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="Tầng 1 (Khu khám tổng)">Tầng 1 (Khu khám tổng)</option>
                    <option value="Tầng 2 (Phục hình sứ)">Tầng 2 (Phục hình sứ)</option>
                    <option value="Tầng 3 (Phẫu thuật Implant)">Tầng 3 (Phẫu thuật Implant)</option>
                  </select>
                  <select
                    value={subRoom}
                    onChange={(e) => setSubRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="Phòng 101">Phòng 101</option>
                    <option value="Phòng 102">Phòng 102</option>
                    <option value="Phòng 201">Phòng 201</option>
                    <option value="Phòng 301">Phòng 301</option>
                  </select>
                </div>
              </div>

              {/* Trạng thái khởi tạo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Trạng thái khởi tạo ban đầu</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="initStatus"
                      checked={initialStatus === 'ready'}
                      onChange={() => setInitialStatus('ready')}
                      className="text-emerald-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Sẵn sàng hoạt động (Ready)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="initStatus"
                      checked={initialStatus === 'maintenance'}
                      onChange={() => setInitialStatus('maintenance')}
                      className="text-amber-600 focus:ring-0"
                    />
                    <span className="font-bold text-slate-800">Bảo trì / Đang lắp đặt</span>
                  </label>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-4">
              {/* Bác sĩ phụ trách chính */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Bác sĩ phụ trách chính (Tùy chọn)</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                >
                  {MOCK_DOCTORS.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.specialty})
                    </option>
                  ))}
                </select>
              </div>

              {/* Trang thiết bị đi kèm */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Danh sách trang thiết bị đi kèm tại ghế</label>
                  <button type="button" className="text-sky-600 hover:text-sky-700 font-bold text-[11px]">
                    Quản lý thiết bị
                  </button>
                </div>

                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equipments.ultrasonicScaler}
                      onChange={(e) => setEquipments({ ...equipments, ultrasonicScaler: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Máy lấy cao răng siêu âm Satelec</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equipments.curingLight}
                      onChange={(e) => setEquipments({ ...equipments, curingLight: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Đèn quang trùng hợp trám răng</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equipments.xrayPeriapical}
                      onChange={(e) => setEquipments({ ...equipments, xrayPeriapical: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Máy chụp X-quang cận chóp tại ghế</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={equipments.implantSurgicPro}
                      onChange={(e) => setEquipments({ ...equipments, implantSurgicPro: e.target.checked })}
                      className="rounded text-sky-600 focus:ring-0 w-4 h-4"
                    />
                    <span className="font-bold text-slate-800">Máy phẫu thuật cấy ghép Implant Surgic Pro</span>
                  </label>
                </div>
              </div>

              {/* Cấu hình đặt lịch trực tuyến */}
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  CẤU HÌNH ĐẶT LỊCH TRỰC TUYẾN
                </span>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-slate-900 text-xs">Cho phép đặt lịch Web (Online Booking)</h5>
                    <p className="text-[10px] text-slate-500">Bệnh nhân có thể tự chọn phòng này trên portal.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={webBooking}
                      onChange={(e) => setWebBooking(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-sky-100">
                  <span className="font-bold text-slate-700">Thời gian nghỉ khử trùng giữa 2 ca</span>
                  <select
                    value={sterilizeInterval}
                    onChange={(e) => setSterilizeInterval(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none w-full sm:w-auto"
                  >
                    <option value="15 phút">15 phút</option>
                    <option value="20 phút">20 phút</option>
                    <option value="30 phút">30 phút</option>
                  </select>
                </div>
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
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors text-center"
              >
                Lưu nháp
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> XÁC NHẬN KÍCH HOẠT PHÒNG KHÁM
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
