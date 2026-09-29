import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  MapPin,
  Maximize2,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Receipt,
  Sparkles,
  CalendarDays,
  Clock,
  TrendingUp,
  FileDown,
  QrCode,
  Printer,
  Banknote,
} from 'lucide-react';
import defaultAvatar from '../../assets/bacsi.jpg';
import xrayFallback from '../../assets/x-quang.png';
import { Modal } from '../../components/common/Modal';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { DentalChart } from '../../components/dental/DentalChart';
import { XrayLibrary, type XrayFilmItem } from '../../components/dental/XrayLibrary';
import { DicomViewerModal } from '../../components/dental/DicomViewerModal';
import { AddDiagnosisModal } from '../../components/dental/AddDiagnosisModal';
import { UploadXrayModal } from '../../components/dental/UploadXrayModal';
import { CreateReceiptModal, type ReceiptData } from '../../components/dental/CreateReceiptModal';
import { ReceiptPreviewModal } from '../../components/dental/ReceiptPreviewModal';
import { PatientEditModal } from './PatientEditModal';
import { patientsApi, financeApi } from '../../services/api';

const formatCurrency = (value: number) => `${Math.round(value).toLocaleString('vi-VN')}đ`;

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // Modals
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isPreviewReceiptOpen, setIsPreviewReceiptOpen] = useState(false);
  const [currentReceiptData, setCurrentReceiptData] = useState<ReceiptData | undefined>(undefined);
  const [isDicomOpen, setIsDicomOpen] = useState(false);
  const [selectedFilmForDicom, setSelectedFilmForDicom] = useState<{
    title: string;
    type: string;
    date: string;
  } | undefined>(undefined);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [selectedToothForDiagnosis, setSelectedToothForDiagnosis] = useState<number>(11);
  const [isUploadXrayOpen, setIsUploadXrayOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Next payment form state
  const [nextPaymentAmount, setNextPaymentAmount] = useState<number>(0);
  const [nextPaymentMethod, setNextPaymentMethod] = useState<string>('VIETQR');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Load real patient data
  const loadPatientData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await patientsApi.getById(id);
      setPatient(data);
    } catch (err: any) {
      console.error('Lỗi khi tải chi tiết bệnh nhân:', err);
      setError('Không tìm thấy thông tin bệnh nhân hoặc có lỗi xảy ra.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Extract DOB & address
  const dob = useMemo(() => {
    if (!patient) return '';
    if (patient.medicalAlerts) {
      const match = patient.medicalAlerts.match(/DOB:(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    return patient.birthYear ? `${patient.birthYear}-01-01` : 'Chưa cập nhật';
  }, [patient]);

  const age = useMemo(() => {
    if (!patient) return 0;
    if (dob && dob !== 'Chưa cập nhật') {
      const y = parseInt(dob.split('-')[0], 10);
      if (!isNaN(y)) return new Date().getFullYear() - y;
    }
    if (patient.birthYear) return new Date().getFullYear() - patient.birthYear;
    return 30;
  }, [patient, dob]);

  const address = useMemo(() => {
    if (!patient) return 'Chưa cập nhật';
    if (patient.medicalAlerts && patient.medicalAlerts.includes('Address:')) {
      const match = patient.medicalAlerts.match(/Address:([^|]+)/);
      if (match) return match[1].trim();
    }
    return 'TP. Hồ Chí Minh';
  }, [patient]);

  const primaryDoctor = useMemo(() => {
    return patient?.appointments?.[0]?.doctor?.fullName || 'Chưa phân công';
  }, [patient]);

  const latestTreatment = useMemo(() => {
    if (patient?.treatmentPlans?.[0]?.planName) {
      return patient.treatmentPlans[0].planName;
    }
    if (patient?.appointments?.[0]?.services?.[0]?.service?.name) {
      return patient.appointments[0].services[0].service.name;
    }
    return 'Theo dõi định kỳ';
  }, [patient]);

  // Financial calculations
  const invoices = useMemo(() => patient?.invoices || [], [patient]);
  const totalCost = useMemo(() => {
    const invTotal = invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount || 0), 0);
    if (invTotal > 0) return invTotal;
    // Estimate from appointments if no invoice yet
    const apptTotal = (patient?.appointments || []).reduce(
      (sum: number, a: any) =>
        sum + (a.services || []).reduce((sSum: number, s: any) => sSum + Number(s.price || 0), 0),
      0,
    );
    return apptTotal;
  }, [invoices, patient]);

  const paidAmount = useMemo(() => {
    return invoices.reduce(
      (sum: number, inv: any) =>
        sum + (inv.payments || []).reduce((pSum: number, p: any) => pSum + Number(p.amountPaid || 0), 0),
      0,
    );
  }, [invoices]);

  const currentDebt = useMemo(() => {
    return Math.max(0, totalCost - paidAmount);
  }, [totalCost, paidAmount]);

  const paidPercent = useMemo(() => {
    return totalCost > 0 ? Math.round((paidAmount / totalCost) * 100) : 0;
  }, [totalCost, paidAmount]);

  useEffect(() => {
    if (currentDebt > 0) {
      setNextPaymentAmount(currentDebt);
    } else {
      setNextPaymentAmount(500000);
    }
  }, [currentDebt]);

  // Real timeline items
  const timeline = useMemo(() => {
    if (patient?.treatmentPlans && patient.treatmentPlans.length > 0 && patient.treatmentPlans[0].steps?.length > 0) {
      return patient.treatmentPlans[0].steps.map((st: any) => ({
        title: st.stepName,
        description: `Lộ trình kế hoạch điều trị. Trạng thái: ${st.status}`,
        date: st.targetDate ? new Date(st.targetDate).toLocaleDateString('vi-VN') : 'Dự kiến',
        time: '',
        status: st.status === 'DONE' ? 'done' : st.status === 'IN_PROGRESS' ? 'active' : 'next',
      }));
    }
    if (patient?.appointments && patient.appointments.length > 0) {
      return patient.appointments.map((a: any) => {
        const srvNames = a.services?.map((s: any) => s.service?.name).filter(Boolean).join(', ') || 'Khám điều trị chuyên khoa';
        const dName = a.doctor?.fullName || 'BS. Chuyên khoa';
        const cName = a.chair?.name || 'Phòng khám';
        const isDone = a.status === 'COMPLETED';
        const isActive = a.status === 'IN_PROGRESS' || a.status === 'CONFIRMED';
        return {
          title: srvNames,
          description: `BS: ${dName} • ${cName}. ${a.notes ? `Ghi chú: ${a.notes}` : ''}`,
          date: new Date(a.startTime).toLocaleDateString('vi-VN'),
          time: new Date(a.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          status: (isDone ? 'done' : isActive ? 'active' : 'next') as 'done' | 'active' | 'next',
        };
      });
    }
    return [];
  }, [patient]);

  // Real patient X-rays
  const patientXrayFilms = useMemo<XrayFilmItem[]>(() => {
    if (!patient?.medicalRecords) return [];
    const list: XrayFilmItem[] = [];
    patient.medicalRecords.forEach((mr: any, rIdx: number) => {
      if (mr.xrayImageUrls && mr.xrayImageUrls.length > 0) {
        mr.xrayImageUrls.forEach((url: string, imgIdx: number) => {
          list.push({
            id: `xray-${mr.id}-${imgIdx}`,
            type: 'CT Cone Beam 3D',
            title: mr.diagnosis || `Chẩn đoán hình ảnh kỹ thuật số #${rIdx + 1}`,
            date: new Date(mr.performedAt).toLocaleDateString('vi-VN'),
            doctor: primaryDoctor,
            thumbnail: url,
            description: mr.treatmentGiven || 'Lưu trữ hình ảnh trong hồ sơ EMR bệnh nhân.',
            badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
          });
        });
      }
    });
    return list;
  }, [patient, primaryDoctor]);

  // Real filtered appointments
  const filteredAppointments = useMemo(() => {
    const list = patient?.appointments || [];
    if (appointmentFilter === 'upcoming') {
      return list.filter((a: any) => ['CONFIRMED', 'PENDING', 'IN_PROGRESS'].includes(a.status));
    }
    if (appointmentFilter === 'completed') {
      return list.filter((a: any) => a.status === 'COMPLETED');
    }
    if (appointmentFilter === 'cancelled') {
      return list.filter((a: any) => a.status === 'CANCELLED');
    }
    return list;
  }, [patient, appointmentFilter]);

  const appointmentCounts = useMemo(() => {
    const list = patient?.appointments || [];
    return {
      all: list.length,
      upcoming: list.filter((a: any) => ['CONFIRMED', 'PENDING', 'IN_PROGRESS'].includes(a.status)).length,
      completed: list.filter((a: any) => a.status === 'COMPLETED').length,
      cancelled: list.filter((a: any) => a.status === 'CANCELLED').length,
    };
  }, [patient]);

  // Handle next payment submit
  const handleNextPaymentSubmit = async () => {
    if (!patient || nextPaymentAmount <= 0) return;
    try {
      setIsSubmittingPayment(true);
      await financeApi.createReceipt({
        patientId: patient.id,
        amount: nextPaymentAmount,
        description: `Thu viện phí đợt tiếp theo - ${patient.fullName}`,
        paymentMethod: nextPaymentMethod,
        collector: primaryDoctor !== 'Chưa phân công' ? primaryDoctor : 'Thu ngân chi nhánh',
      });
      await loadPatientData();
      alert('Tạo phiếu thu & thanh toán thành công!');
    } catch (err) {
      console.error('Lỗi khi thu tiền:', err);
      alert('Có lỗi xảy ra khi tạo phiếu thu!');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Tổng quan phác đồ điều trị' },
    { id: 'dental', label: 'Sơ đồ răng & Phim X-quang' },
    { id: 'history', label: 'Lịch sử cuộc hẹn' },
    { id: 'billing', label: 'Thanh toán & Công nợ' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
        <p className="text-xs font-bold text-slate-500">Đang đồng bộ hồ sơ bệnh án điện tử...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-base font-bold text-slate-800">{error || 'Không tìm thấy hồ sơ bệnh nhân'}</p>
        <button
          type="button"
          onClick={() => navigate('/admin/patients')}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách khách hàng
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/admin/patients')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Khách hàng & Bệnh án
          </button>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>Khách hàng & Bệnh án</span>
            <span>/</span>
            <span className="text-slate-900">
              Chi tiết hồ sơ {patient.fullName} ({patient.patientCode || patient.id})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            type="button"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            type="button"
            onClick={() => window.print()}
          >
            <Download className="w-3.5 h-3.5" /> In hồ sơ bệnh án (PDF)
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
            type="button"
            onClick={() => navigate('/admin/appointments')}
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Đặt lịch hẹn mới
          </button>
        </div>
      </div>

      {/* Patient Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={patient.avatarUrl || defaultAvatar}
                alt={patient.fullName}
                className="h-20 w-20 rounded-2xl border-4 border-sky-50 object-cover shadow-sm"
                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
              />
              <span className="absolute -bottom-1 -right-1 rounded-md bg-sky-700 px-1.5 py-0.5 text-[9px] font-black text-white">
                VIP
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{patient.fullName}</h1>
                <span className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">
                  {patient.patientCode || patient.id}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {age} tuổi • {patient.gender || 'Nam'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {patient.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {patient.email || 'Chưa cập nhật email'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {address}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
                  {latestTreatment}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">
                  Độ uy tín AI: 98%
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 md:min-w-[340px]">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-400">Bác sĩ phụ trách</p>
              <p className="mt-1 font-extrabold text-slate-900">{primaryDoctor}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-400">Ngày sinh</p>
              <p className="mt-1 font-extrabold text-slate-900">{dob}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-400">Số lần khám</p>
              <p className="mt-1 font-extrabold text-slate-900">{patient.appointments?.length ?? 0} lần</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {/* Phác đồ điều trị */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {patient.treatmentPlans?.[0]?.planName || `Lộ trình điều trị: ${latestTreatment}`}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Tiến trình các buổi hẹn và phác đồ can thiệp lâm sàng</p>
                </div>
                <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {timeline.length > 0 ? (
                <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
                  {timeline.map((item: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span
                        className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          item.status === 'active'
                            ? 'bg-sky-600 ring-4 ring-sky-100'
                            : item.status === 'done'
                            ? 'bg-sky-600'
                            : 'bg-slate-300'
                        }`}
                      />
                      <div className={item.status === 'active' ? 'rounded-xl border border-sky-100 bg-sky-50 p-4' : ''}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-900">{item.title}</h3>
                            <p className="mt-1 text-xs font-medium text-slate-500">{item.description}</p>
                          </div>
                          <span
                            className={`shrink-0 text-[11px] font-bold ${
                              item.status === 'active' ? 'rounded bg-sky-700 px-2 py-1 text-white' : 'text-slate-500'
                            }`}
                          >
                            {item.time ? `${item.time} ${item.date}` : item.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-500">Chưa có phác đồ điều trị hoặc lịch hẹn cho bệnh nhân này.</p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/appointments')}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 cursor-pointer"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Tạo lịch hẹn đầu tiên
                  </button>
                </div>
              )}
            </section>

            {/* Phim X-quang gần đây */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <FileText className="w-4 h-4 text-sky-600" /> Phim X-Quang Gần Đây
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('dental')}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  Xem tất cả &gt;
                </button>
              </div>

              {patientXrayFilms.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {patientXrayFilms.slice(0, 3).map((film) => (
                    <div
                      key={film.id}
                      onClick={() => {
                        setSelectedFilmForDicom({
                          title: film.title,
                          type: film.type,
                          date: film.date,
                        });
                        setIsDicomOpen(true);
                      }}
                      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 hover:border-sky-300 hover:shadow-md transition-all duration-150"
                    >
                      <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-200">
                        <img
                          src={film.thumbnail || xrayFallback}
                          alt={film.title}
                          className="h-full w-full object-cover opacity-90 transition-transform duration-200 group-hover:scale-105 group-hover:opacity-100"
                        />
                        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 backdrop-blur-xs">
                          <Eye className="w-2.5 h-2.5" /> 3D View
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <h3 className="text-xs font-black text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                          {film.title}
                        </h3>
                        <div className="mt-0.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
                          <span>{film.date}</span>
                          <span className="font-bold text-sky-700">{film.doctor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                  <p className="text-xs font-semibold text-slate-500">Chưa có phim X-quang nào được lưu trữ cho bệnh nhân này.</p>
                  <button
                    type="button"
                    onClick={() => setIsUploadXrayOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 cursor-pointer"
                  >
                    Tải phim X-quang lên ngay
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-5">
            <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-teal-800">Trợ lý AI Đồng hành</h2>
                  <p className="text-[11px] font-semibold text-teal-600">Dự đoán & Khuyến nghị</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-teal-100 bg-white p-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold">
                    <span>Khả năng lành thương nướu</span>
                    <span className="text-teal-700">94%</span>
                  </div>
                  <div className="mb-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full w-[94%] rounded-full bg-teal-500" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    Hồ sơ ghi nhận quá trình hồi phục tốt, không có dấu hiệu viêm nha chu bất thường.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-900">
                    <MessageSquareText className="w-4 h-4 text-sky-600" /> Zalo ZNS Tự động
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">
                    Đã đồng bộ thông báo lịch khám và hướng dẫn chăm sóc sau điều trị qua Zalo cho SĐT {patient.phone}.
                  </p>
                </div>
              </div>
            </section>

            {/* Chi phí điều trị */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-extrabold text-slate-900">Tổng hợp chi phí</h2>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tổng chi phí điều trị</span>
                  <span className="text-base text-slate-900">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đã thanh toán ({paidPercent}%)</span>
                  <span className="text-emerald-600">-{formatCurrency(paidAmount)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="text-slate-500">Công nợ hiện tại</span>
                  <span className="text-base text-rose-600">{formatCurrency(currentDebt)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentReceiptData({
                    patientName: patient.fullName,
                    patientId: patient.patientCode || patient.id,
                    amount: currentDebt > 0 ? currentDebt : 500000,
                    description: `Thanh toán chi phí điều trị - ${patient.fullName}`,
                    paymentMethod: 'VietQR',
                    collector: primaryDoctor !== 'Chưa phân công' ? primaryDoctor : 'Thu ngân chi nhánh',
                    isEvatEnabled: true,
                    customerType: 'Cá nhân',
                    taxCode: '',
                    buyerName: patient.fullName,
                    buyerAddress: address,
                    buyerEmail: patient.email || '',
                    vatRate: '0% VAT - Dịch vụ y tế',
                    sendZns: true,
                  });
                  setIsReceiptOpen(true);
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer active:scale-98"
              >
                <Receipt className="w-4 h-4" /> Lập phiếu thu mới
              </button>
            </section>
          </aside>
        </div>
      )}

      {/* Tab 2: Sơ đồ răng & Phim X-quang */}
      {activeTab === 'dental' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            <DentalChart
              patientName={patient.fullName}
              patientId={patient.patientCode || patient.id}
              dentalCharts={patient.dentalCharts}
              onAddDiagnosis={(toothNum) => {
                setSelectedToothForDiagnosis(toothNum || 11);
                setIsDiagnosisOpen(true);
              }}
              onUpdateCondition={async (toothNum, cond) => {
                try {
                  await patientsApi.updateDentalChart(patient.id, toothNum, cond);
                } catch (err) {
                  console.error('Lỗi khi cập nhật sơ đồ răng:', err);
                }
              }}
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            <XrayLibrary
              films={patientXrayFilms}
              onOpenDicomViewer={(film) => {
                if (film) {
                  setSelectedFilmForDicom({
                    title: film.title,
                    type: film.type,
                    date: film.date,
                  });
                }
                setIsDicomOpen(true);
              }}
              onOpenUploadModal={() => setIsUploadXrayOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Lịch sử cuộc hẹn */}
      {activeTab === 'history' && (
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tổng số lần đến khám</p>
                <p className="mt-1 text-xl font-black text-slate-900">{patient.appointments?.length ?? 0} lượt</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Đúng giờ</p>
                <p className="mt-1 text-xl font-black text-slate-900">100%</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-teal-800 uppercase tracking-wide">Điểm uy tín AI</p>
                <p className="mt-1 text-xl font-black text-teal-900">98%</p>
              </div>
            </div>
          </div>

          {/* Appointment list table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Filter buttons */}
            <div className="flex items-center gap-2 border-b border-slate-100 p-4 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAppointmentFilter('all')}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors whitespace-nowrap ${
                  appointmentFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả trạng thái ({appointmentCounts.all})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('upcoming')}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors whitespace-nowrap ${
                  appointmentFilter === 'upcoming'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Sắp tới ({appointmentCounts.upcoming})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('completed')}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors whitespace-nowrap ${
                  appointmentFilter === 'completed'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Đã hoàn tất ({appointmentCounts.completed})
              </button>
              <button
                type="button"
                onClick={() => setAppointmentFilter('cancelled')}
                className={`rounded-full px-4 py-2 text-[13px] font-bold transition-colors whitespace-nowrap ${
                  appointmentFilter === 'cancelled'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Đã dời / hủy ({appointmentCounts.cancelled})
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Mã hẹn</th>
                    <th className="px-5 py-4">Ngày & Giờ khám</th>
                    <th className="px-5 py-4">Dịch vụ điều trị</th>
                    <th className="px-5 py-4">Bác sĩ & Ghế khám</th>
                    <th className="px-5 py-4">Tiền cọc</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((a: any) => {
                      const srvName = a.services?.map((s: any) => s.service?.name).join(', ') || 'Khám tổng quát';
                      const deposit = (a.services || []).reduce((sum: number, s: any) => sum + Number(s.service?.deposit || 0), 0);
                      const timeStr = new Date(a.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                      const dateStr = new Date(a.startTime).toLocaleDateString('vi-VN');

                      return (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-bold text-sky-700">{a.appointmentCode}</td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{timeStr}</div>
                            <div className="text-[11px] font-semibold text-slate-500">{dateStr}</div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">{srvName}</td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">{a.doctor?.fullName || 'BS. Chuyên khoa'}</div>
                            <div className="text-[11px] font-medium text-slate-500">{a.chair?.name || 'Ghế khám'}</div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">
                            {deposit > 0 ? formatCurrency(deposit) : 'Miễn phí / Trả sau'}
                          </td>
                          <td className="px-5 py-4">
                            {a.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                Đã hoàn thành
                              </span>
                            ) : a.status === 'IN_PROGRESS' ? (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                Đang khám
                              </span>
                            ) : a.status === 'CANCELLED' ? (
                              <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                                Đã hủy
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-700">
                                Đã xác nhận
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => navigate('/admin/appointments')}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">
                        Không có lịch hẹn nào phù hợp trạng thái này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileDown className="h-4 w-4" /> Xuất lịch sử khám (Excel/PDF)
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tab 4: Thanh toán & Công nợ */}
      {activeTab === 'billing' && (
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-100">
                <Receipt className="h-16 w-16" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">Tổng chi phí điều trị gói</p>
                  <Receipt className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(totalCost)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Đã thu (Cọc VietQR + Các đợt)</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <TrendingUp className="h-3 w-3" /> {paidPercent}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(paidAmount)}</p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Công nợ còn lại phải thu</p>
                <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                  {currentDebt > 0 ? 'Chờ thanh toán các đợt tiếp' : 'Đã tất toán'}
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-orange-500">{formatCurrency(currentDebt)}</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            {/* Left Column: Transactions */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h3 className="text-base font-extrabold text-slate-900">Danh sách phiếu thu & Lịch sử giao dịch</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Mã HĐ / Ngày</th>
                      <th className="px-5 py-4">Nội dung</th>
                      <th className="px-5 py-4 text-right">Số tiền</th>
                      <th className="px-5 py-4 text-center">Hình thức / Trạng thái</th>
                      <th className="px-5 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.length > 0 ? (
                      invoices.map((inv: any) => {
                        const dateStr = new Date(inv.createdAt).toLocaleDateString('vi-VN');
                        const srvStr = inv.items?.map((i: any) => i.service?.name).join(', ') || 'Dịch vụ nha khoa';
                        const firstPayment = inv.payments?.[0];
                        const methodStr = firstPayment?.paymentMethod || 'VietQR';

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="font-bold text-slate-900">{inv.invoiceCode}</div>
                              <div className="text-[11px] font-medium text-slate-500">{dateStr}</div>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-700">{srvStr}</td>
                            <td className="px-5 py-4 text-right font-black text-slate-900">
                              {formatCurrency(Number(inv.totalAmount))}
                            </td>
                            <td className="px-5 py-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                                  {methodStr === 'POS' ? (
                                    <CreditCard className="h-3.5 w-3.5" />
                                  ) : methodStr === 'CASH' ? (
                                    <Banknote className="h-3.5 w-3.5" />
                                  ) : (
                                    <QrCode className="h-3.5 w-3.5" />
                                  )}
                                  {methodStr === 'POS'
                                    ? 'Quẹt thẻ POS'
                                    : methodStr === 'CASH'
                                    ? 'Tiền mặt'
                                    : 'Chuyển khoản VietQR'}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  {inv.status === 'PAID' ? 'Đã quyết toán' : 'Chưa thanh toán'}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentReceiptData({
                                    patientName: patient.fullName,
                                    patientId: patient.patientCode || patient.id,
                                    amount: Number(inv.totalAmount),
                                    description: srvStr,
                                    paymentMethod: methodStr,
                                    collector: primaryDoctor,
                                    isEvatEnabled: true,
                                    customerType: 'Cá nhân',
                                    taxCode: '',
                                    buyerName: patient.fullName,
                                    buyerAddress: address,
                                    buyerEmail: patient.email || '',
                                    vatRate: '0% VAT - Dịch vụ y tế',
                                    sendZns: true,
                                  });
                                  setIsPreviewReceiptOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" /> Bill K80
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                          Chưa có hóa đơn hoặc phiếu thu nào được tạo cho bệnh nhân này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Collect Payment */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900">Thu tiền đợt thanh toán tiếp theo</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Số tiền thu</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={nextPaymentAmount}
                      onChange={(e) => setNextPaymentAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-black text-slate-900 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">VNĐ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Hình thức thanh toán</label>
                  <div className="space-y-2">
                    <label
                      onClick={() => setNextPaymentMethod('VIETQR')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        nextPaymentMethod === 'VIETQR' ? 'border-sky-500 bg-sky-50/40 text-sky-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <QrCode className="w-4 h-4 text-sky-600" />
                        <div>
                          <p>Chuyển khoản VietQR</p>
                          <p className="text-[10px] text-slate-400 font-medium">Tạo mã động</p>
                        </div>
                      </div>
                      <input type="radio" checked={nextPaymentMethod === 'VIETQR'} onChange={() => {}} />
                    </label>

                    <label
                      onClick={() => setNextPaymentMethod('CASH')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        nextPaymentMethod === 'CASH' ? 'border-sky-500 bg-sky-50/40 text-sky-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Tiền mặt</span>
                      </div>
                      <input type="radio" checked={nextPaymentMethod === 'CASH'} onChange={() => {}} />
                    </label>

                    <label
                      onClick={() => setNextPaymentMethod('POS')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        nextPaymentMethod === 'POS' ? 'border-sky-500 bg-sky-50/40 text-sky-900' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span>Quẹt thẻ POS</span>
                      </div>
                      <input type="radio" checked={nextPaymentMethod === 'POS'} onChange={() => {}} />
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmittingPayment || nextPaymentAmount <= 0}
                  onClick={handleNextPaymentSubmit}
                  className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Receipt className="h-4 w-4" />
                  {isSubmittingPayment ? 'Đang ghi nhận...' : 'Tạo phiếu thu & Xuất hóa đơn VAT'}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal Lập Phiếu Thu & Xuất Hóa Đơn VAT */}
      <CreateReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        patientName={patient.fullName}
        patientId={patient.patientCode || patient.id}
        defaultAmount={currentReceiptData?.amount || 500000}
        defaultDescription={currentReceiptData?.description || `Phiếu thu - ${patient.fullName}`}
        onOpenPreview={(data) => {
          setCurrentReceiptData(data);
          setIsReceiptOpen(false);
          setIsPreviewReceiptOpen(true);
        }}
        onConfirmSuccess={async (data) => {
          try {
            await financeApi.createReceipt({
              patientId: patient.id,
              amount: data.amount,
              description: data.description,
              paymentMethod: data.paymentMethod,
              collector: data.collector,
            });
            await loadPatientData();
          } catch (e) {
            console.error('Lỗi lưu phiếu thu:', e);
          }
          setIsReceiptOpen(false);
        }}
      />

      {/* Modal Xem Trước Phiếu Thu Nhiệt K80 */}
      <ReceiptPreviewModal
        isOpen={isPreviewReceiptOpen}
        onClose={() => setIsPreviewReceiptOpen(false)}
        onBackToEdit={() => {
          setIsPreviewReceiptOpen(false);
          setIsReceiptOpen(true);
        }}
        receiptData={currentReceiptData}
      />

      {/* DICOM 3D Viewer Modal */}
      <DicomViewerModal
        isOpen={isDicomOpen}
        onClose={() => setIsDicomOpen(false)}
        initialFilmTitle={selectedFilmForDicom?.title}
        initialFilmType={selectedFilmForDicom?.type}
        initialDate={selectedFilmForDicom?.date}
        patientName={patient.fullName}
        patientId={patient.patientCode || patient.id}
      />

      {/* Add Diagnosis Modal */}
      <AddDiagnosisModal
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        defaultToothNumber={selectedToothForDiagnosis}
        onSave={async (toothNum, condition, note) => {
          try {
            await patientsApi.updateDentalChart(patient.id, toothNum, condition, note);
            await loadPatientData();
          } catch (err) {
            console.error('Lỗi khi lưu chẩn đoán răng:', err);
          }
        }}
      />

      {/* Upload X-Ray Modal */}
      <UploadXrayModal
        isOpen={isUploadXrayOpen}
        onClose={() => setIsUploadXrayOpen(false)}
        onUploadSuccess={async (imageUrl, filmType, notes) => {
          try {
            await patientsApi.addMedicalRecord(patient.id, {
              diagnosis: filmType || 'Phim chụp X-quang kỹ thuật số',
              treatmentGiven: notes || 'Khảo sát giải phẫu',
              xrayImageUrls: [imageUrl],
            });
            await loadPatientData();
          } catch (err) {
            console.error('Lỗi khi lưu phim X-quang:', err);
          }
          setIsUploadXrayOpen(false);
        }}
      />

      {/* Patient Edit Modal */}
      <PatientEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          loadPatientData();
        }}
        patient={{
          id: patient.id,
          patientCode: patient.patientCode || patient.id,
          name: patient.fullName,
          phone: patient.phone,
          email: patient.email || '',
          gender: patient.gender || 'Nam',
          dob: dob,
          age: age,
          address: address,
          doctor: primaryDoctor,
          treatment: latestTreatment,
          aiTrust: 98,
          avatarUrl: patient.avatarUrl || '',
        }}
      />
    </div>
  );
};
