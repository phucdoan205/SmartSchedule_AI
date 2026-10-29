import React, { useState, useEffect, useMemo } from 'react';
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
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Stethoscope,
  Search,
  Filter,
  Lock,
  Maximize2,
  ZoomIn,
  Download,
  Smartphone,
  X,
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

  // Filters for Services & Doctors
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [doctorFilterMode, setDoctorFilterMode] = useState<'branch' | 'all'>('branch');

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
  const [isZaloQrZoomOpen, setIsZaloQrZoomOpen] = useState(false);
  const [copiedZaloMsg, setCopiedZaloMsg] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const zaloBotUrl =
    (import.meta as any).env?.VITE_ZALO_BOT_URL ||
    'https://bot.zaloplatforms.com/groups/invite/bot.iSTtYWvM';

  const handleCopyZaloMsg = (msg: string) => {
    navigator.clipboard.writeText(msg);
    setCopiedZaloMsg(true);
    toast('Đã sao chép tin nhắn mẫu! Bạn hãy dán vào chat Zalo nhé.', 'success');
    setTimeout(() => setCopiedZaloMsg(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(zaloBotUrl);
    setCopiedLink(true);
    toast('Đã sao chép liên kết mời Zalo Bot!', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadQr = async () => {
    try {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=3&data=${encodeURIComponent(
        zaloBotUrl,
      )}`;
      const response = await fetch(qrApiUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR-Zalo-Bot-Nha-Khoa-Fruit.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Đã tải mã QR về máy! Bạn có thể vào Zalo -> Quét mã -> Chọn ảnh từ thư viện để kết nối.', 'success');
    } catch {
      toast('Không thể tải tự động. Bạn có thể nhấn giữ vào mã QR để lưu ảnh nhé!', 'info');
    }
  };

  const formatAppCode = (code?: string) => {
    if (!code) return '#LH-2026';
    return code.startsWith('#') ? code : `#${code}`;
  };

  const handleOpenZalo = () => {
    const msg = `Xác nhận lịch hẹn ${formatAppCode(createdAppointment?.appointmentCode)} - SĐT: ${patientPhone}`;
    navigator.clipboard.writeText(msg).catch(() => {});
    setCopiedZaloMsg(true);
    toast('Đã sao chép tin nhắn mẫu! Đang mở Zalo để kết nối...', 'success');
    window.open(zaloBotUrl, '_blank');
  };

  // Load initial clinic branches, services and real doctors
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

        // Filter: Only real doctors (role DOCTOR), excluding technicians & receptionists
        const realDoctors = Array.isArray(doctorsData)
          ? doctorsData.filter(
              (d: any) =>
                !d.name?.startsWith('KTV') &&
                !d.name?.startsWith('LT') &&
                !d.code?.startsWith('KTV') &&
                !d.code?.startsWith('LT'),
            )
          : [];

        setBranches(branchesData);
        setServices(activeServices);
        setDoctors(realDoctors);

        // Always reset step to 1 and clear errors on opening
        setStep(1);
        setBookingError(null);
        setCreatedAppointment(null);
        setSelectedCategory('Tất cả');
        setServiceSearch('');

        if (initialDoctorId) {
          setSelectedDoctor(initialDoctorId);
          const doc = realDoctors.find((d: any) => d.id === initialDoctorId);
          if (doc?.branchId) {
            setSelectedBranch(doc.branchId);
          } else if (branchesData.length > 0 && !selectedBranch) {
            setSelectedBranch(branchesData[0].id);
          }
        } else {
          if (branchesData.length > 0 && !selectedBranch) {
            setSelectedBranch(branchesData[0].id);
          }
          if (realDoctors.length > 0 && !selectedDoctor) {
            setSelectedDoctor(realDoctors[0].id);
          }
        }

        if (initialServiceId && activeServices.some((s: any) => s.id === initialServiceId)) {
          setSelectedService(initialServiceId);
        } else if (activeServices.length > 0 && !selectedService) {
          setSelectedService(activeServices[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu đặt lịch:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [isOpen, initialDoctorId, initialServiceId]);

  // Synchronize when initial props change while open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setBookingError(null);
      setCreatedAppointment(null);
      setSelectedCategory('Tất cả');
      setServiceSearch('');

      if (initialServiceId) {
        setSelectedService(initialServiceId);
      }
      if (initialDoctorId) {
        setSelectedDoctor(initialDoctorId);
        const doc = doctors.find((d: any) => d.id === initialDoctorId);
        if (doc?.branchId) {
          setSelectedBranch(doc.branchId);
        }
      }
    }
  }, [isOpen, initialServiceId, initialDoctorId]);

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    services.forEach((s) => {
      const name = s.category?.name || (typeof s.category === 'string' ? s.category : null);
      if (name) catSet.add(name);
    });
    return ['Tất cả', ...Array.from(catSet)];
  }, [services]);

  // Filtered services by category and search keyword
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const catName = s.category?.name || (typeof s.category === 'string' ? s.category : '');
      const matchCat =
        selectedCategory === 'Tất cả' ||
        catName.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchSearch =
        !serviceSearch.trim() ||
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(serviceSearch.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, serviceSearch]);

  // Doctors sorted to prioritize doctors belonging to the selected branch
  const sortedDoctors = useMemo(() => {
    if (!selectedBranch) return doctors;
    return [...doctors].sort((a, b) => {
      const aMatch = a.branchId === selectedBranch ? 1 : 0;
      const bMatch = b.branchId === selectedBranch ? 1 : 0;
      return bMatch - aMatch;
    });
  }, [doctors, selectedBranch]);

  // Doctors strictly working at the selected branch
  const branchDoctors = useMemo(() => {
    if (!selectedBranch) return doctors;
    return doctors.filter((d) => d.branchId === selectedBranch);
  }, [doctors, selectedBranch]);

  // Doctors to display in Step 2 based on doctorFilterMode
  const displayedDoctors = useMemo(() => {
    if (doctorFilterMode === 'branch' && branchDoctors.length > 0) {
      return branchDoctors;
    }
    return sortedDoctors;
  }, [doctorFilterMode, branchDoctors, sortedDoctors]);

  // Handle selecting doctor: if doctor is from another branch, automatically switch branch
  const handleSelectDoctor = (doc: any) => {
    setSelectedDoctor(doc.id);
    if (doc.branchId && doc.branchId !== selectedBranch) {
      setSelectedBranch(doc.branchId);
      const targetBranch = branches.find((b) => b.id === doc.branchId);
      toast(
        `Đã tự động chuyển cơ sở sang "${targetBranch?.name || 'Chi nhánh của bác sĩ'}" theo nơi công tác của ${doc.name}!`,
        'info',
      );
    }
  };

  // When branch changes, auto select first doctor of that branch if possible
  useEffect(() => {
    if (!selectedBranch || sortedDoctors.length === 0) return;
    const doctorInBranch = sortedDoctors.find((d) => d.branchId === selectedBranch);
    if (doctorInBranch && selectedDoctorObj?.branchId !== selectedBranch) {
      setSelectedDoctor(doctorInBranch.id);
    }
  }, [selectedBranch]);

  // Fetch real-time available slots for selected doctor, branch, and date
  useEffect(() => {
    if (!selectedBranch || !bookingDate || !selectedDoctor) return;

    const fetchDoctorSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlotConflict(null);
        const selectedServiceObj = services.find((s) => s.id === selectedService);
        const duration = selectedServiceObj?.durationMinutes || 45;

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
        setBookingError('Vui lòng chọn cơ sở phòng khám và gói dịch vụ');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedDoctor || !bookingDate || !bookingTime) {
        setBookingError('Vui lòng chọn bác sĩ phụ trách và khung giờ khám');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!patientName.trim() || !patientPhone.trim()) {
        setBookingError('Vui lòng điền họ tên và số điện thoại liên hệ');
        return;
      }

      try {
        setIsSubmitting(true);
        const selectedServiceObj = services.find((s) => s.id === selectedService);
        const duration = selectedServiceObj?.durationMinutes || 45;
        const startTimeStr = `${bookingDate}T${bookingTime}:00+07:00`;

        // Use the chair matched by smart slots, or let backend auto-fallback to free chair
        const matchedSlot = smartSlots.find((s) => s.time === bookingTime && s.isAvailable);
        let targetChairId = matchedSlot?.chairId;

        if (!targetChairId) {
          const branchDetail = await branchesApi.getById(selectedBranch).catch(() => null);
          const allChairs = branchDetail?.rooms?.flatMap((r: any) => r.chairs) || [];
          const freeChair = allChairs.find((c: any) => c.status === 'AVAILABLE') || allChairs[0];
          targetChairId = freeChair ? freeChair.id : undefined;
        }

        const appointment = await appointmentsApi.book({
          patientName,
          patientPhone,
          gender: patientGender,
          branchId: selectedBranch,
          doctorId: selectedDoctor,
          chairId: targetChairId,
          serviceIds: [selectedService],
          startTime: startTimeStr,
          durationMinutes: duration,
          notes: patientNote,
          isAiRecommended: true,
        });

        setCreatedAppointment(appointment);
        setStep(4);
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || 'Đã có xung đột lịch khám hoặc lỗi hệ thống';
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
        maxWidth="xl"
        title={step === 4 ? 'Đặt Lịch Thành Công!' : 'Đặt Lịch Khám Thông Minh AI'}
        subtitle={
          step === 4
            ? 'Mã hẹn của bạn đã được ghi nhận vào hệ thống SmartSchedule AI'
            : `Bước ${step} / 3: ${
                step === 1
                  ? 'Chọn cơ sở & dịch vụ điều trị'
                  : step === 2
                  ? 'Chọn bác sĩ & thời gian khám'
                  : 'Xác nhận thông tin bệnh nhân'
              }`
        }
      >
        {/* Stepper Progress Bar */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3 text-xs">
            <div
              className={`flex items-center gap-2 font-bold transition-all ${
                step >= 1 ? 'text-teal-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-black shadow-xs ${
                  step >= 1 ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                1
              </span>
              <span>Dịch vụ &amp; Cơ sở</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div
              className={`flex items-center gap-2 font-bold transition-all ${
                step >= 2 ? 'text-teal-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-black shadow-xs ${
                  step >= 2 ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                2
              </span>
              <span>Bác sĩ &amp; Giờ khám</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <div
              className={`flex items-center gap-2 font-bold transition-all ${
                step >= 3 ? 'text-teal-700' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-black shadow-xs ${
                  step >= 3 ? 'bg-teal-600' : 'bg-slate-300'
                }`}
              >
                3
              </span>
              <span>Xác nhận đặt hẹn</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {bookingError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{bookingError}</span>
          </div>
        )}

        {/* Step 1: Cơ sở & Dịch vụ */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            {isLoadingData ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <span className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang tải danh sách cơ sở và bảng giá dịch vụ...</span>
              </div>
            ) : (
              <>
                {/* 1. Chọn Cơ Sở */}
                <div>
                  <label className="block font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>1. Chọn Chi Nhánh Phòng Khám:</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {branches.map((b) => {
                      const isSelected = selectedBranch === b.id;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBranch(b.id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50/80 shadow-xs ring-1 ring-teal-400 text-teal-900 font-bold'
                              : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50/60 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs line-clamp-1">{b.name}</span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 ml-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                              {b.address}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Chọn Gói Dịch Vụ */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>2. Chọn Gói Dịch Vụ Điều Trị:</span>
                    </label>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Tìm tên hoặc mã dịch vụ..."
                        className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Filter Tabs */}
                  {categories.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
                      {categories.map((cat) => {
                        const isCatSelected = selectedCategory === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                              isCatSelected
                                ? 'bg-teal-600 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Services List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredServices.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        Không tìm thấy dịch vụ phù hợp trong danh mục này.
                      </div>
                    ) : (
                      filteredServices.map((s) => {
                        const isSelected = selectedService === s.id;
                        return (
                          <div
                            key={s.id}
                            onClick={() => setSelectedService(s.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50/70 shadow-xs ring-1 ring-teal-400'
                                : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-teal-600 bg-teal-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {s.code && (
                                    <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                      {s.code}
                                    </span>
                                  )}
                                  <p className="font-bold text-xs text-slate-800 truncate">
                                    {s.name}
                                  </p>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>⏱️ {s.durationMinutes || 45} phút</span>
                                  <span>•</span>
                                  <span className="truncate">
                                    {s.category?.name || s.category || 'Nha khoa'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <span className="font-black text-teal-700 text-xs shrink-0 whitespace-nowrap">
                              {Number(s.standardPrice || 0).toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Bác sĩ & Khung giờ */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            {/* 1. Chọn Bác Sĩ */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <label className="block font-bold text-slate-800">1. Chọn Bác Sĩ Đảm Nhiệm:</label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold shrink-0">
                  <button
                    type="button"
                    onClick={() => setDoctorFilterMode('branch')}
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      doctorFilterMode === 'branch'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Bác sĩ tại cơ sở ({branchDoctors.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorFilterMode('all')}
                    className={`px-2.5 py-0.5 rounded-md transition-all cursor-pointer ${
                      doctorFilterMode === 'all'
                        ? 'bg-white text-teal-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tất cả bác sĩ ({doctors.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-44 overflow-y-auto pr-1">
                {displayedDoctors.map((d) => {
                  const isSelected = selectedDoctor === d.id;
                  const isDoctorAtCurrentBranch = d.branchId === selectedBranch;

                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectDoctor(d)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/80 shadow-xs ring-1 ring-teal-400 text-teal-900 font-bold'
                          : 'border-slate-200 hover:border-teal-200 hover:bg-slate-50/50 text-slate-700'
                      }`}
                    >
                      <img
                        src={d.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'}
                        alt={d.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-xs truncate">{d.name}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                              isDoctorAtCurrentBranch
                                ? 'text-teal-700 bg-teal-50 border-teal-200'
                                : 'text-slate-500 bg-slate-100 border-slate-200'
                            }`}
                          >
                            {isDoctorAtCurrentBranch ? 'Tại cơ sở' : d.branch || 'Khác cơ sở'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{d.specialty}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Chọn Ngày & Khung Giờ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 border-t border-slate-100">
              {/* Ngày khám */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>2. Ngày Khám:</span>
                  <span className="text-[10px] text-teal-700 font-semibold">Tự động gợi ý từ ngày mai</span>
                </label>
                <input
                  type="date"
                  min={tomorrowDateStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Đã kích hoạt tự động đệm khử trùng 15 phút giữa các ca khám.
                </p>
              </div>

              {/* Khung giờ trống */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-800">3. Khung Giờ Khám Trống:</label>
                  <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    Đệm vô trùng 15p
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang kiểm tra lịch trống &amp; đệm vô trùng...</span>
                  </div>
                ) : smartSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {smartSlots.map((t: any) => {
                      const isSelected = bookingTime === t.time && t.isAvailable;
                      const isBlocked = !t.isAvailable;

                      return (
                        <button
                          key={t.time}
                          type="button"
                          onClick={() => {
                            if (isBlocked) {
                              const msg =
                                t.conflictReason ||
                                `Khung giờ ${t.time} đã có lịch hoặc đang trong thời gian đệm khử trùng vô trùng 15 phút. Vui lòng chọn khung giờ khác!`;
                              setSelectedSlotConflict(msg);
                              toast(msg, 'error');
                            } else {
                              setBookingTime(t.time);
                              setSelectedSlotConflict(null);
                            }
                          }}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all flex items-center justify-between gap-1 cursor-pointer ${
                            isBlocked
                              ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/40'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {isBlocked && <Lock className="w-2.5 h-2.5 text-slate-400" />}
                            <span>{t.time}</span>
                          </span>

                          {t.isAiRecommended && !isBlocked && (
                            <span
                              className={`text-[8px] font-black px-1 py-0.2 rounded ${
                                isSelected
                                  ? 'bg-white/25 text-white'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              ✨ AI
                            </span>
                          )}

                          {isBlocked && (
                            <span className="text-[8px] font-bold text-rose-500">Kín</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    Không có khung giờ trống nào cho ngày này. Vui lòng chọn ngày khác!
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

        {/* Step 3: Thông tin bệnh nhân & Xác nhận */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            {/* AI Summary Card */}
            <div className="p-3 bg-teal-50/80 rounded-2xl border border-teal-200 space-y-1 text-[11px]">
              <p className="font-bold text-teal-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Tóm tắt lịch hẹn được AI tối ưu:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-600 mt-1">
                <p>• Cơ sở: <strong>{selectedBranchObj?.name}</strong></p>
                <p>• Dịch vụ: <strong>{selectedServiceObj?.name}</strong></p>
                <p>• Bác sĩ: <strong>{selectedDoctorObj?.name}</strong></p>
                <p>
                  • Thời gian: <strong>{bookingDate} lúc {bookingTime}</strong> (Đã kèm đệm vô trùng 15p)
                </p>
              </div>
            </div>

            {/* Patient Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Họ và Tên Bệnh Nhân <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => {
                    setPatientName(e.target.value);
                    if (bookingError) setBookingError(null);
                  }}
                  placeholder="VD: Nguyễn Văn An"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
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
                    onChange={(e) => {
                      setPatientPhone(e.target.value);
                      if (bookingError) setBookingError(null);
                    }}
                    placeholder="VD: 0912345678"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Giới Tính:</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Đặt lịch thành công & Zalo Bot */}
        {step === 4 && (
          <div className="text-center py-4 space-y-4 text-xs">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                MÃ LỊCH HẸN: {createdAppointment?.appointmentCode || 'LH-2026'}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">Đặt Lịch Khám Thành Công!</h3>
              <p className="text-slate-500 text-[11px] mt-0.5 max-w-sm mx-auto">
                Hệ thống SmartSchedule AI đã kích hoạt đệm vô trùng 15 phút và chuẩn bị phòng khám.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1 text-[11px]">
              <p className="font-bold text-slate-800">Thông tin chi tiết ca khám:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-600">
                <p>• Bệnh nhân: <strong>{createdAppointment?.patient?.fullName || patientName}</strong></p>
                <p>• Bác sĩ: <strong>{selectedDoctorObj?.name}</strong></p>
                <p>• Số điện thoại: <strong>{createdAppointment?.patient?.phone || patientPhone}</strong></p>
                <p>
                  • Mã Check-in Kiosk: <strong className="font-mono text-teal-700">{createdAppointment?.qrPassCode}</strong>
                </p>
              </div>

              {Number(selectedServiceObj?.deposit || 0) > 0 && (
                <div className="p-2.5 mt-2 bg-teal-50 rounded-xl border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-teal-700 uppercase block">Tiền cọc giữ chỗ VietQR</span>
                    <span className="text-xs font-black text-teal-900">
                      {Number(selectedServiceObj?.deposit || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVietQrOpen(true)}
                    className="w-full sm:w-auto px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Quét VietQR BIDV
                  </button>
                </div>
              )}
            </div>

            {/* Zalo Bot Automated Reminders */}
            <div className="p-3.5 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-sky-50/90 rounded-2xl border border-blue-200 text-left space-y-2.5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0068FF] text-white flex items-center justify-center shrink-0 shadow-xs font-black text-xs tracking-tighter">
                  Zalo
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-slate-900">
                      Kích Hoạt Nhận Tin Nhắn Nhắc Lịch Zalo (24h &amp; 1h Trước Giờ Khám)
                    </h4>
                    <span className="bg-blue-100 text-[#0068FF] text-[9px] px-2 py-0.2 rounded-full font-extrabold uppercase">
                      Tự động
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Mở app Zalo quét mã QR hoặc bấm nút bên dưới để gửi tin nhắn kích hoạt lưu tài khoản Zalo nhận thông báo.
                  </p>
                </div>
              </div>

              {/* Suggested Message with 1-Click Copy */}
              <div className="bg-white p-2 rounded-xl border border-blue-100 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span className="text-slate-600">Nội dung tin nhắn mẫu:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyZaloMsg(
                        `Xác nhận lịch hẹn ${formatAppCode(createdAppointment?.appointmentCode)} - SĐT: ${patientPhone}`,
                      )
                    }
                    className="inline-flex items-center gap-1 text-[#0068FF] hover:text-blue-800 font-bold cursor-pointer"
                  >
                    {copiedZaloMsg ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[10px] font-bold text-slate-800 bg-slate-50 p-1.5 rounded-lg border border-slate-200 select-all">
                  Xác nhận lịch hẹn {formatAppCode(createdAppointment?.appointmentCode)} - SĐT: {patientPhone}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-0.5">
                <div className="flex items-center gap-2.5 bg-white p-1.5 rounded-xl border border-blue-100 w-full sm:w-auto shadow-2xs">
                  <div
                    onClick={() => setIsZaloQrZoomOpen(true)}
                    className="relative cursor-pointer shrink-0 group/qr"
                    title="Bấm để phóng to mã QR"
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=2&data=${encodeURIComponent(
                        zaloBotUrl,
                      )}`}
                      alt="Zalo Bot QR Code"
                      className="w-12 h-12 rounded-lg border border-slate-200 shrink-0 transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover/qr:opacity-100 rounded-lg flex items-center justify-center transition-opacity text-white">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-slate-800">Quét mã QR</p>
                      <button
                        type="button"
                        onClick={() => setIsZaloQrZoomOpen(true)}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#0068FF] rounded text-[9px] font-bold cursor-pointer transition-colors"
                        title="Phóng to để quét cho dễ"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                        Phóng to
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Mở app Zalo quét mã</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenZalo}
                  className="w-full sm:flex-1 py-2.5 px-3 bg-[#0068FF] hover:bg-[#0052cc] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Mở Zalo &amp; Gửi Tin Kích Hoạt</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Hoàn Tất &amp; Đóng
            </button>
          </div>
        )}

        {/* Footer Modal Actions for Steps 1-3 */}
        {step < 4 && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>
                {isSubmitting
                  ? 'Đang xử lý...'
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

      {/* Modal Phóng To Mã QR Zalo Bot */}
      {isZaloQrZoomOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-scaleUp my-auto border border-slate-100 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0068FF] text-white flex items-center justify-center shrink-0 font-black text-xs shadow-sm">
                  Zalo
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Mã QR Zalo Bot Nha Khoa Fruit
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0068FF] border border-blue-200">
                      24/7
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Quét để kết nối nhận thông báo và nhắc lịch tự động
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsZaloQrZoomOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50/60 via-slate-50 to-indigo-50/40 rounded-2xl border border-blue-100 shadow-2xs">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=3&data=${encodeURIComponent(
                    zaloBotUrl,
                  )}`}
                  alt="Mã QR Zalo Bot Nha Khoa Fruit"
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-xl select-none"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-[11px]">
                  Bot Nha Khoa Fruit • Kênh kích hoạt chính thức
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center text-[11px]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Lưu ảnh QR về máy</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0068FF] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center text-[11px]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Đã chép link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép link bot</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggested Message with 1-Click Copy in Modal */}
            <div className="bg-white p-2.5 rounded-xl border border-blue-100 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                <span className="text-slate-600">Tin nhắn mẫu để gửi cho Bot:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyZaloMsg(
                      `Xác nhận lịch hẹn ${formatAppCode(createdAppointment?.appointmentCode)} - SĐT: ${patientPhone}`,
                    )
                  }
                  className="inline-flex items-center gap-1 text-[#0068FF] hover:text-blue-800 font-bold cursor-pointer"
                >
                  {copiedZaloMsg ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-[10.5px] font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 select-all">
                Xác nhận lịch hẹn {formatAppCode(createdAppointment?.appointmentCode)} - SĐT: {patientPhone}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#0068FF]" /> 3 cách kết nối nhanh trên Zalo:
              </p>
              <div className="space-y-1 pl-1 text-[10.5px] leading-relaxed">
                <p>
                  <strong>1. Quét trực tiếp:</strong> Mở app Zalo; Bấm icon quét QR ở góc trên; Hướng camera vào mã trên.
                </p>
                <p>
                  <strong>2. Khi đang dùng điện thoại:</strong> Bấm nút <strong>"Lưu ảnh QR về máy"</strong>; Mở Zalo quét mã; Chọn ảnh vừa lưu từ thư viện.
                </p>
                <p>
                  <strong>3. Tìm kiếm trong Zalo:</strong> Vào Zalo tìm: <strong>Bot Nha Khoa Fruit</strong> (hoặc <span className="font-mono">bot.iSTtYWvM</span>).
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenZalo}
                className="flex-1 py-2.5 px-3 bg-[#0068FF] hover:bg-[#0052cc] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mở Zalo Ngay</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
              <button
                type="button"
                onClick={() => setIsZaloQrZoomOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
