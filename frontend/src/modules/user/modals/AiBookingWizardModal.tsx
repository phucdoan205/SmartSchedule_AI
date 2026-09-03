import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles, User, Phone, MapPin, Stethoscope, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { MOCK_DOCTORS, MOCK_SERVICES, MOCK_BRANCHES } from '../../../services/mockData';

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

  // Form State
  const [selectedBranch, setSelectedBranch] = useState(MOCK_BRANCHES[0].id);
  const [selectedService, setSelectedService] = useState(initialServiceId || MOCK_SERVICES[0].id);
  const [selectedDoctor, setSelectedDoctor] = useState(initialDoctorId || MOCK_DOCTORS[0].id);
  const [bookingDate, setBookingDate] = useState('2026-09-05');
  const [bookingTime, setBookingTime] = useState('09:00');

  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientNote, setPatientNote] = useState('');

  const [createdAppointmentCode, setCreatedAppointmentCode] = useState('');

  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as any);
    } else {
      // Step 3 -> Confirm
      const code = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedAppointmentCode(code);
      setStep(4); // Success step
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as any);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    onClose();
  };

  const timeSlots = ['08:00', '08:45', '09:30', '10:15', '14:00', '14:45', '15:30', '16:15'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={step === 4 ? 'Đặt Lịch Thành Công!' : 'Trải Nghiệm Đặt Lịch Khám Thông Minh AI (30 Giây)'}
      subtitle={step === 4 ? 'Mã hẹn của bạn đã được ghi nhận vào hệ thống SmartSchedule AI' : `Bước ${step} / 3: ${step === 1 ? 'Chọn dịch vụ & cơ sở' : step === 2 ? 'Chọn bác sĩ & khung giờ' : 'Thông tin bệnh nhân'}`}
    >
      {/* Stepper Progress Bar */}
      {step < 4 && (
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 text-xs">
          <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-sky-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= 1 ? 'bg-sky-600' : 'bg-slate-300'}`}>1</span>
            <span>Dịch vụ & Cơ sở</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-sky-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= 2 ? 'bg-sky-600' : 'bg-slate-300'}`}>2</span>
            <span>Bác sĩ & Giờ</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-sky-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${step >= 3 ? 'bg-sky-600' : 'bg-slate-300'}`}>3</span>
            <span>Xác nhận AI</span>
          </div>
        </div>
      )}

      {/* Step 1 Content */}
      {step === 1 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">1. Chọn Chi Nhánh Phòng Khám:</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {MOCK_BRANCHES.map((b) => (
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
              {MOCK_SERVICES.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedService === s.id
                      ? 'border-teal-500 bg-teal-50/70 shadow-xs font-bold text-teal-900'
                      : 'border-slate-200 hover:border-teal-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-600 bg-white px-2 py-0.5 rounded border border-teal-200">{s.code}</span>
                    <p className="font-bold text-xs mt-1 text-slate-800">{s.name}</p>
                    <span className="text-[10px] text-slate-500">{s.durationMinutes} phút • {s.category}</span>
                  </div>
                  <span className="font-extrabold text-teal-600 text-xs">{s.price.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Content */}
      {step === 2 && (
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">1. Chọn Bác Sĩ Đảm Nhiệm:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
              {MOCK_DOCTORS.map((d) => (
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
                      bookingTime === t ? 'bg-sky-600 text-white border-sky-600 shadow-2xs' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
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
          <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-100 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-900">Thuật toán AI SmartSchedule Đã Tối Ưu Lịch!</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">Điểm tối ưu: <strong>99.4%</strong> • Thời gian chờ dự kiến dưới 3 phút.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Họ & Tên Bệnh Nhân:</label>
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
              <label className="block font-bold text-slate-800 mb-1">Số Điện Thoại Đăng Ký:</label>
              <input
                type="text"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="VD: 0912.345.678"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Ghi Chú Triệu Chứng (Nếu có):</label>
              <textarea
                rows={2}
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="VD: Đau răng hàm trên bên trái khi ăn lạnh..."
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
            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              Mã Lịch Hẹn: {createdAppointmentCode}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-2">Đặt Lịch Khám Thành Công!</h3>
            <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
              Hệ thống đã gửi xác nhận SMS tới số điện thoại <strong>{patientPhone || '0912.xxx.xxx'}</strong>. Vui lòng đến đúng khung giờ hẹn.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1.5 text-[11px]">
            <p className="font-bold text-slate-800">Thông tin khám bệnh:</p>
            <p className="text-slate-600">• Bệnh nhân: <strong>{patientName || 'Nguyễn Văn An'}</strong></p>
            <p className="text-slate-600">• Thời gian: <strong>{bookingDate} lúc {bookingTime}</strong></p>
            <p className="text-slate-600">• Bác sĩ phụ trách: <strong>TS.BS. Nguyễn Minh Anh</strong></p>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Hoàn Tất & Về Trang Chủ
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
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
          >
            <span>{step === 3 ? 'Xác Nhận Đặt Lịch (AI)' : 'Tiếp Theo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </Modal>
  );
};
