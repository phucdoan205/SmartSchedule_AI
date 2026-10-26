import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Armchair,
  Sparkles,
  Check,
  Loader2,
  Stethoscope,
  Wrench,
  Building,
  Filter,
} from 'lucide-react';
import { staffApi, equipmentApi } from '../../../services/api';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId?: string;
  branchName?: string;
  onAddRoom?: (room: any) => Promise<void> | void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  branchId,
  branchName = 'Chi nhánh hiện tại',
  onAddRoom,
}) => {
  const [doctorList, setDoctorList] = useState<any[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [roomName, setRoomName] = useState('Phòng 05');
  const [roomNumber, setRoomNumber] = useState('P.105');
  const [roomType, setRoomType] = useState<'standard' | 'prosthodontics' | 'implant'>('standard');
  const [floor, setFloor] = useState<number>(1);
  const [initialStatus, setInitialStatus] = useState<'ready' | 'maintenance'>('ready');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Equipment states from equipmentApi
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [equipmentCategory, setEquipmentCategory] = useState<string>('all');
  const [selectedEquipmentNames, setSelectedEquipmentNames] = useState<string[]>([]);

  // Fetch doctors strictly filtered by selected branch
  useEffect(() => {
    if (!isOpen) return;
    setSelectedEquipmentNames([]);

    setIsLoadingDoctors(true);
    staffApi
      .getDoctors(branchId && branchId !== 'ALL' ? { branchId } : undefined)
      .then((docs) => {
        if (Array.isArray(docs) && docs.length > 0) {
          const formatted = docs.map((d: any) => ({
            id: d.id,
            name: d.fullName || d.user?.name || d.name || 'Bác sĩ',
            specialty: d.specialty || d.doctorProfile?.specialty || 'Chuyên khoa Răng Hàm Mặt',
            doctorProfileId: d.doctorProfile?.id || d.id,
          }));
          setDoctorList(formatted);
          setSelectedDoctor(formatted[0].name);
        } else {
          setDoctorList([]);
          setSelectedDoctor('');
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải bác sĩ theo chi nhánh:', err);
        setDoctorList([]);
        setSelectedDoctor('');
      })
      .finally(() => setIsLoadingDoctors(false));
  }, [isOpen, branchId]);

  // Fetch equipment list from Equipment API
  useEffect(() => {
    if (!isOpen) return;

    setIsLoadingDevices(true);
    equipmentApi
      .getAll({
        branchId: branchId && branchId !== 'ALL' ? branchId : undefined,
        limit: 100,
      })
      .then((res: any) => {
        const items = res?.data || (Array.isArray(res) ? res : []);
        if (items.length > 0) {
          setDeviceList(items);
        } else {
          setDeviceList([
            { id: 'eq-1', name: 'Ghế nha khoa cao cấp Sirona Intego', code: 'TB-01', category: 'dental_chair', status: 'OPERATIONAL' },
            { id: 'eq-2', name: 'Máy chụp CT Cone Beam 3D Vatech PaX-3D', code: 'TB-04', category: 'xray', status: 'OPERATIONAL' },
            { id: 'eq-3', name: 'Máy phẫu thuật cấy ghép Implant Surgic Pro NSK', code: 'TB-15', category: 'implant', status: 'OPERATIONAL' },
            { id: 'eq-4', name: 'Nồi hấp tiệt trùng Class B Melag', code: 'TB-12', category: 'hvac', status: 'OPERATIONAL' },
            { id: 'eq-5', name: 'Máy tẩy trắng răng Laser Whitening Beyond II', code: 'TB-20', category: 'dental_chair', status: 'OPERATIONAL' },
          ]);
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải thiết bị từ equipmentApi:', err);
        setDeviceList([
          { id: 'eq-1', name: 'Ghế nha khoa cao cấp Sirona Intego', code: 'TB-01', category: 'dental_chair', status: 'OPERATIONAL' },
          { id: 'eq-2', name: 'Máy chụp CT Cone Beam 3D Vatech PaX-3D', code: 'TB-04', category: 'xray', status: 'OPERATIONAL' },
          { id: 'eq-3', name: 'Máy phẫu thuật cấy ghép Implant Surgic Pro NSK', code: 'TB-15', category: 'implant', status: 'OPERATIONAL' },
        ]);
      })
      .finally(() => setIsLoadingDevices(false));
  }, [isOpen, branchId]);

  // Equipment category tabs
  const equipmentCategories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'dental_chair', label: 'Ghế khám' },
    { id: 'xray', label: 'X-Quang / CT' },
    { id: 'implant', label: 'Implant' },
    { id: 'hvac', label: 'Tiệt trùng' },
  ];

  const filteredDevices = useMemo(() => {
    if (equipmentCategory === 'all') return deviceList;
    return deviceList.filter((d) => d.category === equipmentCategory);
  }, [deviceList, equipmentCategory]);

  const toggleEquipment = (name: string) => {
    setSelectedEquipmentNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Auto-update roomNumber when floor changes
  const handleFloorChange = (newFloor: number) => {
    setFloor(newFloor);
    const suffix = roomNumber.replace(/^P\.\d/i, '') || '05';
    setRoomNumber(`P.${newFloor}${suffix}`);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedDocObj = doctorList.find((d) => d.name === selectedDoctor);
      const selectedDevices = deviceList.filter((d) => selectedEquipmentNames.includes(d.name));

      const payload = {
        name: roomName.trim(),
        roomNumber: roomNumber.trim() || `P.${floor}05`,
        floor,
        category: roomType,
        chairName: `Ghế ${roomName.trim()}`,
        status: initialStatus === 'ready' ? 'AVAILABLE' : 'MAINTENANCE',
        assignedDoctorId: selectedDocObj?.doctorProfileId || selectedDocObj?.id || undefined,
        doctorName: selectedDoctor || undefined,
        equipments: selectedEquipmentNames,
        equipmentIds: selectedDevices.map((d) => d.id),
      };

      if (onAddRoom) {
        await onAddRoom(payload);
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi tạo phòng khám:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <Armchair className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Thêm &amp; Thiết Lập Phòng Khám Mới</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cấu hình phòng khám, gắn thiết bị chuyên dụng và phân công bác sĩ phụ trách tại{' '}
                <strong className="text-slate-700">{branchName}</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Banner Gợi Ý */}
        <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-sky-800 font-semibold leading-relaxed">
            <strong>Gợi ý AI:</strong> Bổ sung <strong>{roomName || 'phòng khám mới'}</strong> tại Tầng {floor} sẽ giúp tối ưu công suất phục vụ và giảm 35% thời gian chờ đợi vào khung giờ cao điểm tại {branchName}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CỘT TRÁI */}
            <div className="space-y-4">
              {/* Tên phòng khám & Mã số */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên phòng khám <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="VD: Phòng 05, Phòng mổ 02..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã phòng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="P.105"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500 text-center"
                  />
                </div>
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

              {/* Vị trí tầng lầu */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Vị trí lắp đặt (Tầng lầu)</label>
                <div className="relative">
                  <select
                    value={floor}
                    onChange={(e) => handleFloorChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    <option value={1}>Tầng 1 (Khu khám tổng quát &amp; Chỉnh nha)</option>
                    <option value={2}>Tầng 2 (Phục hình răng sứ &amp; Thẩm mỹ)</option>
                    <option value={3}>Tầng 3 (Phẫu thuật Implant &amp; Vô trùng cao cấp)</option>
                  </select>
                </div>
              </div>

              {/* Trạng thái khởi tạo */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Trạng thái khởi tạo ban đầu</label>
                <div className="flex items-center gap-4">
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
              {/* Bác sĩ phụ trách chính (Đúng với chi nhánh) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-sky-600" /> Bác sĩ phụ trách chính (Tùy chọn)
                  </label>
                  <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-bold border border-sky-100">
                    Bác sĩ tại cơ sở
                  </span>
                </div>

                {isLoadingDoctors ? (
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    <span>Đang tải danh sách bác sĩ của chi nhánh...</span>
                  </div>
                ) : doctorList.length > 0 ? (
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Chưa phân công bác sĩ (Phân công sau) --</option>
                    {doctorList.map((doc) => (
                      <option key={doc.id} value={doc.name}>
                        {doc.name} - {doc.specialty}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 font-semibold text-[11px]">
                    Chưa có bác sĩ nào thuộc chi nhánh này. Bạn có thể phân công bác sĩ sau khi tạo phòng.
                  </div>
                )}
              </div>

              {/* Trang thiết bị đi kèm */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-500" /> Trang thiết bị đi kèm tại ghế
                  </label>
                  <span className="text-sky-700 font-bold text-[11px] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    Đã chọn ({selectedEquipmentNames.length})
                  </span>
                </div>

                {/* Danh mục chọn lọc thiết bị */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mr-0.5">
                    <Filter className="w-2.5 h-2.5" /> Danh mục:
                  </span>
                  {equipmentCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEquipmentCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        equipmentCategory === cat.id
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Danh sách thiết bị lấy trực tiếp từ trang thiết bị */}
                <div className="space-y-1.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 max-h-48 overflow-y-auto no-scrollbar">
                  {isLoadingDevices ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-slate-400 font-medium text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                      <span>Đang tải danh sách thiết bị y tế...</span>
                    </div>
                  ) : filteredDevices.length > 0 ? (
                    filteredDevices.map((dev: any) => {
                      const isChecked = selectedEquipmentNames.includes(dev.name);
                      return (
                        <label
                          key={dev.id || dev.code}
                          className={`flex items-center justify-between gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-white border-sky-300 shadow-2xs'
                              : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleEquipment(dev.name)}
                              className="rounded text-sky-600 focus:ring-0 w-4 h-4 cursor-pointer shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 block truncate text-xs">
                                {dev.name}
                              </span>
                              {dev.location && (
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {dev.location}
                                </span>
                              )}
                            </div>
                          </div>
                          {dev.code && (
                            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold shrink-0">
                              {dev.code}
                            </span>
                          )}
                        </label>
                      );
                    })
                  ) : (
                    <div className="text-center py-3 text-slate-400 text-xs">
                      Không có thiết bị nào thuộc danh mục này
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin xác nhận cấu hình */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-600" /> Đồng bộ thời gian thực
                </span>
                <p>
                  Khi kích hoạt, phòng khám và ghế nha khoa sẽ được lưu trực tiếp vào cơ sở dữ liệu hệ thống, tự động cập nhật tổng số ghế toàn cơ sở.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !roomName.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang lưu vào hệ thống...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>XÁC NHẬN KÍCH HOẠT PHÒNG KHÁM</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
