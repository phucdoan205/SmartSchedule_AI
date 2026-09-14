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
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { branchesApi, servicesApi, staffApi, appointmentsApi } from '../../../services/api';

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
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('09:00');

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientNote, setPatientNote] = useState('');

  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadInitialData = async () => {
      try {
        setIsLoadingData(true);
        const [branchesData, servicesData, doctorsData] = await Promise.all([
          branchesApi.getAll(),
          servicesApi.getAll(),
          staffApi.getDoctors(),
        ]);

        setBranches(branchesData);
        setServices(servicesData);
        setDoctors(doctorsData);

        if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0].id);
        }
        if (initialServiceId) {
          setSelectedService(initialServiceId);
        } else if (servicesData.length > 0) {
          setSelectedService(servicesData[0].id);
        }
        if (initialDoctorId) {
          setSelectedDoctor(initialDoctorId);
        } else if (doctorsData.length > 0) {
          setSelectedDoctor(doctorsData[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu đặt lịch:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [isOpen, initialDoctorId, initialServiceId]);

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

  const timeSlots = ['08:00', '08:45', '09:30', '10:15', '14:00', '14:45', '15:30', '16:15'];

  const selectedDoctorObj = doctors.find((d) => d.id === selectedDoctor);
  const selectedServiceObj = services.find((s) => s.id === selectedService);
  const selectedBranchObj = branches.find((b) => b.id === selectedBranch);

  return (
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">2. Ngày Khám:</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">3. Khung Giờ Khám Trống:</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBookingTime(t)}
                    className={`py-1 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                      bookingTime === t
                        ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
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

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Số Điện Thoại Nhận Mã QR Lịch Hẹn <span className="text-rose-500">*</span>:
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
                ? 'Xác Nhận Đặt Lịch (AI)'
                : 'Tiếp Theo'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </Modal>
  );
};
