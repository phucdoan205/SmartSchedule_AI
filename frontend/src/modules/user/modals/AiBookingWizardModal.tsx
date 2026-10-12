import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { VietQrPaymentModal } from '../../../components/dental/VietQrPaymentModal';
import { branchesApi, servicesApi, staffApi, appointmentsApi } from '../../../services/api';
import { toast } from '../../../context/ToastContext';

interface AiBookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: string;
  initialServiceId?: string;
}

export const AiBookingWizardModal: React.FC<AiBookingWizardModalProps> = ({
  isOpen,
  onClose,
  initialDoctorId,
  initialServiceId,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Dynamic Data from Backend API
  const [branches, setBranches] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Form State
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  const tomorrowDateStr = (() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  })();
  const [bookingDate, setBookingDate] = useState(tomorrowDateStr);
  const [bookingTime, setBookingTime] = useState('09:30');

  // Real-time Smart Slots State
  const [smartSlots, setSmartSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotConflict, setSelectedSlotConflict] = useState<string | null>(null);

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [patientNote, setPatientNote] = useState('');

  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVietQrOpen, setIsVietQrOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        const [branchesData, servicesData, doctorsData] = await Promise.all([
          branchesApi.getAll(),
          servicesApi.getAll({ isActive: true }),
          staffApi.getDoctors(),
        ]);

        const activeServices = Array.isArray(servicesData)
          ? servicesData.filter((s: any) => s.isActive !== false)
          : [];

        const realDoctors = Array.isArray(doctorsData)
          ? doctorsData.filter((d: any) => !d.name?.startsWith('KTV') && !d.name?.startsWith('LT'))
          : [];

        setBranches(branchesData);
        setServices(activeServices);
        setDoctors(realDoctors);

        if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0].id);
        }
        if (initialServiceId && activeServices.some((s: any) => s.id === initialServiceId)) {
          setSelectedService(initialServiceId);
        } else if (activeServices.length > 0) {
          setSelectedService(activeServices[0].id);
        }
        if (initialDoctorId) {
          setSelectedDoctor(initialDoctorId);
        } else if (realDoctors.length > 0) {
          setSelectedDoctor(realDoctors[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu đặt lịch:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [isOpen, initialDoctorId, initialServiceId]);

  // Fetch real-time available slots for selected doctor and date (with 15m sterilization buffer)
  useEffect(() => {
    if (!selectedBranch || !bookingDate || !selectedDoctor) return;

    const fetchDoctorSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlotConflict(null);
        const selectedServiceObj = services.find((s) => s.id === selectedService);
        const duration = selectedServiceObj?.durationMinutes || 60;

        const res = await appointmentsApi.getAiSmartSlots(
          selectedBranch,
          bookingDate,
          duration,
          selectedDoctor,
        );

        if (res && res.slots && Array.isArray(res.slots)) {
          setSmartSlots(res.slots);

          // If current bookingTime is not available or not set, pick first available slot
          const currentValid = res.slots.find((s: any) => s.time === bookingTime && s.isAvailable);
          if (!currentValid) {
            const firstAvailable = res.slots.find((s: any) => s.isAvailable);
            if (firstAvailable) {
              setBookingTime(firstAvailable.time);
            } else {
              setBookingTime('');
            }
          }
        }
      } catch (err) {
        console.error('Lỗi tải khung giờ trống của bác sĩ:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchDoctorSlots();
  }, [selectedBranch, selectedDoctor, bookingDate, selectedService]);

  const handleNext = async () => {
    setBookingError(null);
    if (step === 1) {
      if (!selectedBranch || !selectedService) {
        setBookingError('Vui lòng chọn cơ sở chi nhánh và gói dịch vụ khám');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedDoctor || !bookingDate || !bookingTime) {
        setBookingError('Vui lòng chọn bác sĩ phụ trách và khung giờ hẹn');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!patientName.trim() || !patientPhone.trim()) {
        setBookingError('Vui lòng điền họ tên và số điện thoại của bạn');
        return;
      }

      try {
        setIsSubmitting(true);
        // Find branch details to select a chair
        const branchDetail = await branchesApi.getById(selectedBranch);
        const allChairs = branchDetail.rooms?.flatMap((r: any) => r.chairs) || [];
        const availableChair = allChairs.find((c: any) => c.status === 'AVAILABLE') || allChairs[0];

        const selectedServiceObj = services.find((s) => s.id === selectedService);
        const duration = selectedServiceObj?.durationMinutes || 60;
        const startTimeStr = `${bookingDate}T${bookingTime}:00+07:00`;

        const appointment = await appointmentsApi.book({
          patientName,
          patientPhone,
          gender: patientGender,
          branchId: selectedBranch,
          doctorId: selectedDoctor,
          chairId: availableChair ? availableChair.id : 'chair-bh-01',
          serviceIds: [selectedService],
          startTime: startTimeStr,
          durationMinutes: duration,
          notes: patientNote,
          isAiRecommended: true,
        });

        setCreatedAppointment(appointment);
        setStep(4);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Đã có xung đột lịch khám hoặc lỗi hệ thống';
        setBookingError(msg);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    setBookingError(null);
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setBookingError(null);
    onClose();
  };

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctor);
  const selectedServiceObj = services.find((s) => s.id === selectedService);
  const selectedBranchObj = branches.find((b) => b.id === selectedBranch);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleResetAndClose}
      title={step === 4 ? 'Đặt Lịch Thành Công!' : 'Trải Nghiệm Đặt Lịch Khám Thông Minh AI (30 Giây)'}
      subtitle={
        step === 4
          ? 'Mã hẹn của bạn đã được ghi nhận vào hệ thống SmartSchedule AI'
          : `Bước ${step} / 3: ${
              step === 1 ? 'Chọn dịch vụ & cơ sở' : step === 2 ? 'Chọn bác sĩ & khung giờ' : 'Thông tin bệnh nhân'
            }`
      }
    >
      {/* Stepper Progress Bar */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 text-xs">
          <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-sky-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= 1 ? 'bg-sky-600' : 'bg-slate-300'}`}>1</span>
            <span>Dịch vụ &amp; Cơ sở</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-sky-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= 2 ? 'bg-sky-600' : 'bg-slate-300'}`}>2</span>
            <span>Bác sĩ &amp; Giờ</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-sky-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= 3 ? 'bg-sky-600' : 'bg-slate-300'}`}>3</span>
            <span>Xác nhận AI</span>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {bookingError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Step 1 Content */}
      {step === 1 && (
        <div className="space-y-4 text-xs">
          {isLoadingData ? (
            <div className="py-8 text-center text-slate-400">Đang tải danh sách cơ sở và dịch vụ...</div>
          ) : (
            <>
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">1. Chọn Chi Nhánh Phòng Khám:</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {branches.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBranch(b.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedBranch === b.id
                          ? 'border-sky-500 bg-sky-50/70 shadow-xs font-bold text-sky-800'
                          : 'border-slate-200 hover:border-sky-200 text-slate-700'
                      }`}
                    >
                      <p className="font-bold text-xs">{b.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">{b.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">2. Chọn Gói Dịch Vụ Khám:</label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedService === s.id
                          ? 'border-teal-500 bg-teal-50/70 shadow-xs font-bold text-teal-900'
                          : 'border-slate-200 hover:border-teal-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {s.imageUrl && (
                          <img src={s.imageUrl} alt={s.name} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          {s.code && (
                            <span className="text-[10px] font-bold text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200">
                              {s.code}
                            </span>
                          )}
                          <p className="font-bold text-xs mt-1 text-slate-800">{s.name}</p>
                          <span className="text-[10px] text-slate-500">
                            {s.durationMinutes} phút • {s.category?.name || s.category}
                          </span>
                        </div>
                      </div>
                      <span className="font-extrabold text-teal-600 text-xs">
                        {Number(s.standardPrice).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 2 Content */}
      {step === 2 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">1. Chọn Bác Sĩ Đảm Nhiệm:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
              {doctors.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDoctor(d.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedDoctor === d.id
                      ? 'border-sky-500 bg-sky-50/70 shadow-xs text-sky-900 font-bold'
                      : 'border-slate-200 hover:border-sky-200 text-slate-700'
                  }`}
                >
                  <img src={d.avatar} alt={d.name} className="w-10 h-10 rounded-full object-cover border" />
                  <div>
                    <p className="font-bold text-xs">{d.name}</p>
                    <p className="text-[10px] text-slate-500">{d.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>2. Ngày Khám:</span>
                <span className="text-[10px] text-sky-600 font-semibold">(Mặc định từ ngày mai)</span>
              </label>
              <input
                type="date"
                min={tomorrowDateStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Lịch hẹn đặt trước tối thiểu 1 ngày để hệ thống chuẩn bị đệm vô trùng 15 phút.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-800">3. Khung Giờ Khám Trống:</label>
                <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Đệm vô trùng 15p
                </span>
              </div>

              {loadingSlots ? (
                <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span>Đang quét lịch trống & đệm vô trùng...</span>
                </div>
              ) : smartSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {smartSlots.map((t: any) => {
                    const isSelected = bookingTime === t.time && t.isAvailable;
                    const isBlocked = !t.isAvailable;

                    return (
                      <button
                        key={t.time}
                        type="button"
                        onClick={() => {
                          if (isBlocked) {
                            const msg = t.conflictReason || `Bác sĩ ${selectedDoctorObj?.name || ''} đã bận hoặc đang trong 15 phút đệm khử trùng vô trùng lúc ${t.time}. Vui lòng chọn khung giờ khác hoặc đổi bác sĩ!`;
                            setSelectedSlotConflict(msg);
                            toast(msg, 'error');
                          } else {
                            setBookingTime(t.time);
                            setSelectedSlotConflict(null);
                          }
                        }}
                        title={
                          isBlocked
                            ? t.conflictReason || 'Đã có lịch hoặc trong 15 phút đệm vô trùng'
                            : t.isAiRecommended
                            ? 'AI Đề xuất: Khung giờ tối ưu công suất và đệm vô trùng'
                            : 'Khung giờ trống'
                        }
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center justify-between gap-1 cursor-pointer ${
                          isBlocked
                            ? 'bg-slate-100/90 border-dashed border-rose-200 text-slate-400 opacity-50 line-through hover:bg-rose-50 hover:border-rose-300'
                            : isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50/50'
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {isBlocked && <span className="no-underline text-rose-500 font-bold">🔒</span>}
                          <span>{t.time}</span>
                        </span>

                        {t.isAiRecommended && !isBlocked && (
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}>
                            ✨ AI Đề xuất
                          </span>
                        )}

                        {isBlocked && (
                          <span className="text-[9px] font-bold text-rose-500 no-underline">
                            Trùng/Đệm
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Không có khung giờ nào còn trống cho bác sĩ này. Vui lòng chọn ngày khác hoặc đổi bác sĩ!
                </div>
              )}

              {/* Inline warning when clicking on a blocked slot */}
              {selectedSlotConflict && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 font-semibold flex items-center gap-1.5 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{selectedSlotConflict}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3 Content */}
      {step === 3 && (
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1 text-[11px]">
            <p className="font-bold text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Tóm tắt lịch hẹn được AI tối ưu:
            </p>
            <p className="text-slate-600">• Cơ sở: <strong>{selectedBranchObj?.name}</strong></p>
            <p className="text-slate-600">• Dịch vụ: <strong>{selectedServiceObj?.name}</strong></p>
            <p className="text-slate-600">• Bác sĩ: <strong>{selectedDoctorObj?.name}</strong></p>
            <p className="text-slate-600">• Thời gian: <strong>{bookingDate} lúc {bookingTime}</strong> (Đã kèm đệm vô trùng 15p)</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Họ và Tên Bệnh Nhân <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="VD: Nguyễn Văn An"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Số Điện Thoại Nhận Mã QR <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="VD: 0912345678"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Giới Tính:</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-700"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Ghi Chú Triệu Chứng (Nếu có):</label>
              <textarea
                rows={2}
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="VD: Răng hàm ê buốt khi ăn đồ lạnh..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4 Content (Success Screen) */}
      {step === 4 && (
        <div className="text-center py-4 space-y-4 text-xs">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              MÃ LỊCH HẸN: {createdAppointment?.appointmentCode || 'LH-2026'}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-2">Đặt Lịch Khám Thành Công!</h3>
            <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
              Hệ thống SmartSchedule AI đã lưu lịch khám và kích hoạt đệm vô trùng 15 phút.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-800">Thông tin chi tiết:</p>
            <p className="text-slate-600">• Bệnh nhân: <strong>{createdAppointment?.patient?.fullName || patientName}</strong></p>
            <p className="text-slate-600">• Số điện thoại: <strong>{createdAppointment?.patient?.phone || patientPhone}</strong></p>
            <p className="text-slate-600">• Bác sĩ: <strong>{selectedDoctorObj?.name}</strong></p>
            <p className="text-slate-600">• Mã QR Check-in Kiosk: <strong className="font-mono text-teal-700">{createdAppointment?.qrPassCode}</strong></p>
            {Number(selectedServiceObj?.deposit || 0) > 0 && (
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-teal-700 uppercase block">Tiền cọc giữ chỗ VietQR</span>
                  <span className="text-sm font-black text-teal-900">
                    {Number(selectedServiceObj?.deposit || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVietQrOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" /> Quét VietQR BIDV
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
          >
            Hoàn Tất &amp; Đóng
          </button>
        </div>
      )}

      {/* Footer Modal Actions for Steps 1-3 */}
      {step < 4 && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? 'Đang xử lý đặt lịch...'
                : step === 3
                ? 'Xác Nhận Đặt Lịch'
                : 'Tiếp Theo'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </Modal>

    <VietQrPaymentModal
      isOpen={isVietQrOpen}
      onClose={() => setIsVietQrOpen(false)}
      amount={Number(selectedServiceObj?.deposit || 10000)}
      description={`COC LICH HEN ${createdAppointment?.appointmentCode || 'LH-2026'}`}
      patientName={createdAppointment?.patient?.fullName || patientName}
      patientCode={createdAppointment?.appointmentCode}
    />
  </>
  );
};
