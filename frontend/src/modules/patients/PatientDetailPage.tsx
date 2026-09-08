import React, { useMemo, useState } from 'react';
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
  Wallet,
  QrCode,
  Clock3,
  Printer,
} from 'lucide-react';
import patientAvatar from '../../assets/bacsi.jpg';
import xrayImg from '../../assets/x-quang.png';
import { Modal } from '../../components/common/Modal';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { DentalChart } from '../../components/dental/DentalChart';
import { XrayLibrary } from '../../components/dental/XrayLibrary';
import { DicomViewerModal } from '../../components/dental/DicomViewerModal';
import { AddDiagnosisModal } from '../../components/dental/AddDiagnosisModal';
import { UploadXrayModal } from '../../components/dental/UploadXrayModal';
import { CreateReceiptModal, type ReceiptData } from '../../components/dental/CreateReceiptModal';
import { ReceiptPreviewModal } from '../../components/dental/ReceiptPreviewModal';
import { PatientEditModal } from './PatientEditModal';

interface PatientDetail {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  age: number;
  address: string;
  doctor: string;
  treatment: string;
  aiTrust: number;
  paid: number;
  totalCost: number;
  currentDebt: number;
}

interface TimelineItem {
  title: string;
  description: string;
  date: string;
  status: 'done' | 'active' | 'next';
  time?: string;
}

const PATIENTS: PatientDetail[] = [
  {
    id: 'BN-8801',
    name: 'Nguyễn Văn An',
    phone: '0912.345.678',
    email: 'nguyenvanan.58@gmail.com',
    gender: 'Nam',
    dob: '1985-04-12',
    age: 58,
    address: 'Quận 1, TP. HCM',
    doctor: 'TS.BS. Nguyễn Minh Anh',
    treatment: 'Cấy Implant',
    aiTrust: 97,
    paid: 35000000,
    totalCost: 48000000,
    currentDebt: 13000000,
  },
  {
    id: 'BN-8802',
    name: 'Trần Thị Mai',
    phone: '0988.777.666',
    email: 'tranthimai.32@gmail.com',
    gender: 'Nữ',
    dob: '1992-08-25',
    age: 34,
    address: 'Quận Bình Thạnh, TP. HCM',
    doctor: 'BS. CKII. Trần Thị Thu Hương',
    treatment: 'Phục hình sứ',
    aiTrust: 94,
    paid: 18000000,
    totalCost: 26000000,
    currentDebt: 8000000,
  },
];

const timeline: TimelineItem[] = [
  {
    title: 'Khám, tư vấn & Chụp phim CT Conebeam',
    description: 'BS. Lê Văn Hùng thực hiện. Bệnh nhân đủ điều kiện cấy ghép.',
    date: '10/10/2026',
    status: 'done',
  },
  {
    title: 'Phẫu thuật cắm trụ Implant',
    description: 'Cắm 1 trụ Straumann SLA vị trí răng 46.',
    date: '15/10/2026',
    status: 'done',
  },
  {
    title: 'Cắt chỉ & Tái khám kiểm tra trụ (Hôm nay)',
    description: 'Mô nướu lành thương tốt, chuẩn bị lấy dấu phục hình.',
    date: '14:30',
    time: '14:30',
    status: 'active',
  },
  {
    title: 'Phục hình răng sứ trên Implant',
    description: 'Dự kiến sau 3 tháng tích hợp xương.',
    date: 'Dự kiến T1/2027',
    status: 'next',
  },
];


const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}đ`;

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
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
  const [selectedToothForDiagnosis, setSelectedToothForDiagnosis] = useState<number>(46);
  const [isUploadXrayOpen, setIsUploadXrayOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const patient = useMemo(() => PATIENTS.find((item) => item.id === id) || PATIENTS[0], [id]);
  const paidPercent = Math.round((patient.paid / patient.totalCost) * 100);

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Tổng quan phác đồ điều trị' },
    { id: 'dental', label: 'Sơ đồ răng & Phim X-quang' },
    { id: 'history', label: 'Lịch sử cuộc hẹn' },
    { id: 'billing', label: 'Thanh toán & Công nợ' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/admin/patients')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-700"
          >
            <ArrowLeft className="w-4 h-4" /> Khách hàng & Bệnh án
          </button>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>Khách hàng & Bệnh án</span>
            <span>/</span>
            <span className="text-slate-900">Chi tiết hồ sơ {patient.name} ({patient.id})</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            type="button"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" type="button">
            <Download className="w-3.5 h-3.5" /> In hồ sơ bệnh án (PDF)
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
            type="button"
            onClick={() => setIsScheduleOpen(true)}
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Đặt lịch hẹn mới
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img src={patientAvatar} alt={patient.name} className="h-20 w-20 rounded-2xl border-4 border-sky-50 object-cover shadow-sm" />
              <span className="absolute -bottom-1 -right-1 rounded-md bg-sky-700 px-1.5 py-0.5 text-[9px] font-black text-white">VIP</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{patient.name}</h1>
                <span className="rounded-md bg-sky-50 px-2 py-1 text-[10px] font-black text-sky-700">{patient.id}</span>
                <span className="text-xs font-bold text-slate-500">{patient.age} tuổi • {patient.gender}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {patient.phone}</span>
                <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {patient.email}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {patient.address}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">Đang cấy Implant</span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">Độ uy tín AI: {patient.aiTrust}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 md:min-w-[340px]">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-400">Bác sĩ phụ trách</p>
              <p className="mt-1 font-extrabold text-slate-900">{patient.doctor}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-400">Ngày sinh</p>
              <p className="mt-1 font-extrabold text-slate-900">{patient.dob}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="font-bold text-slate-400">Số lần khám</p>
              <p className="mt-1 font-extrabold text-slate-900">5 lần</p>
            </div>
          </div>
        </div>
      </section>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-extrabold text-slate-900">Phác đồ: Cấy 1 trụ Implant Straumann SLA</h2>
                <button type="button" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
              <div className="relative space-y-6 pl-6 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-slate-200">
                {timeline.map((item) => (
                  <div key={item.title} className="relative">
                    <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${item.status === 'active' ? 'bg-sky-600 ring-4 ring-sky-100' : item.status === 'done' ? 'bg-sky-600' : 'bg-slate-300'}`} />
                    <div className={item.status === 'active' ? 'rounded-xl border border-sky-100 bg-sky-50 p-4' : ''}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-900">{item.title}</h3>
                          <p className="mt-1 text-xs font-medium text-slate-500">{item.description}</p>
                        </div>
                        <span className={`shrink-0 text-[11px] font-bold ${item.status === 'active' ? 'rounded bg-sky-700 px-2 py-1 text-white' : 'text-slate-500'}`}>{item.date}</span>
                      </div>
                      {item.status === 'active' && (
                        <button type="button" className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">
                          Cập nhật tiến độ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <FileText className="w-4 h-4 text-sky-600" /> Phim X-Quang Gần Đây
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('dental')}
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                >
                  Xem tất cả &gt;
                </button>
              </div>

              {/* Real X-Ray Cards using asset image */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* 1. Panorex */}
                <div
                  onClick={() => {
                    setSelectedFilmForDicom({
                      title: 'Phim Panorex Toàn Cảnh',
                      type: 'Phim Panorama',
                      date: '10/10/2026',
                    });
                    setIsDicomOpen(true);
                  }}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 hover:border-sky-300 hover:shadow-md transition-all duration-150"
                >
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-200">
                    <img
                      src={xrayImg}
                      alt="Phim Panorex"
                      className="h-full w-full object-cover opacity-90 transition-transform duration-200 group-hover:scale-105 group-hover:opacity-100"
                    />
                    <span className="absolute top-2 right-2 rounded-md bg-cyan-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                      Mới nhất
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-300 backdrop-blur-xs">
                      <Eye className="w-2.5 h-2.5" /> 3D View
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                      Phim Panorex
                    </h3>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>10/10/2026</span>
                    <span className="font-bold text-sky-700">BS. Hùng</span>
                  </div>
                </div>

                {/* 2. Phim Cận chóp Răng 46 */}
                <div
                  onClick={() => {
                    setSelectedFilmForDicom({
                      title: 'Phim Cận chóp kiểm tra răng 46',
                      type: 'Periapical',
                      date: '15/10/2026',
                    });
                    setIsDicomOpen(true);
                  }}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-2.5 hover:border-sky-300 hover:shadow-md transition-all duration-150"
                >
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-200">
                    <img
                      src={xrayImg}
                      alt="Phim Cận chóp"
                      className="h-full w-full object-cover scale-125 object-[38%_60%] opacity-90 transition-transform duration-200 group-hover:scale-135 group-hover:opacity-100"
                    />
                    <span className="absolute top-2 right-2 rounded-md bg-teal-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                      Đã phân tích
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-teal-300 backdrop-blur-xs">
                      <Eye className="w-2.5 h-2.5" /> Khảo sát
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 group-hover:text-sky-700 transition-colors">
                      Phim Cận chóp
                    </h3>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] font-medium text-slate-500">
                    <span>15/10/2026</span>
                    <span className="font-bold text-teal-700">Răng 46</span>
                  </div>
                </div>

                {/* 3. CT Cone Beam 3D */}
                <div
                  onClick={() => {
                    setSelectedFilmForDicom({
                      title: 'Khảo sát mật độ xương hàm dưới vùng răng 46',
                      type: 'CT Cone Beam 3D',
                      date: '05/10/2026',
                    });
                    setIsDicomOpen(true);
                  }}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-slate-900 p-2.5 hover:border-sky-400 hover:shadow-md transition-all duration-150 text-white"
                >
                  <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <img
                      src={xrayImg}
                      alt="CT Cone Beam"
                      className="h-full w-full object-cover opacity-60 transition-transform duration-200 group-hover:scale-110 group-hover:opacity-80"
                    />
                    <div className="absolute inset-0 bg-radial from-transparent to-slate-950/80 pointer-events-none" />
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-400 shadow-lg group-hover:scale-110 transition-transform">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                      <span className="mt-1 text-[10px] font-black tracking-wider text-sky-300 uppercase">
                        3D DICOM
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-black text-white group-hover:text-sky-300 transition-colors">
                      CT Cone Beam
                    </h3>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>05/10/2026</span>
                    <span className="font-bold text-slate-300">Tiền phẫu</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Mở trình xem phim 3D chuyên sâu */}
              <button
                type="button"
                onClick={() => {
                  setSelectedFilmForDicom({
                    title: 'Khảo sát mật độ xương hàm dưới vùng răng 46',
                    type: 'CT Cone Beam 3D',
                    date: '10/10/2026',
                  });
                  setIsDicomOpen(true);
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-700 py-2.5 text-xs font-extrabold text-white hover:bg-sky-800 transition-colors shadow-xs"
              >
                <Maximize2 className="w-4 h-4" /> Mở trình xem phim 3D chuyên sâu
              </button>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700"><Sparkles className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-base font-extrabold text-teal-800">Trợ lý AI Đồng hành</h2>
                  <p className="text-[11px] font-semibold text-teal-600">Dự đoán & Khuyến nghị</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-teal-100 bg-white p-3">
                  <div className="mb-1 flex items-center justify-between text-[11px] font-bold"><span>Khả năng lành thương nướu</span><span className="text-teal-700">94%</span></div>
                  <div className="mb-2 h-2 rounded-full bg-slate-100"><div className="h-full w-[94%] rounded-full bg-teal-500" /></div>
                  <p className="text-[11px] font-medium text-slate-500">Tốc độ hồi phục nhanh hơn trung bình. Không ghi nhận dấu hiệu viêm nhiễm qua đánh giá hình ảnh mới nhất.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-900"><MessageSquareText className="w-4 h-4 text-sky-600" /> Zalo ZNS Tự động</h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">Đã gửi tin nhắn nhắc lịch hẹn hôm nay lúc 08:00 AM. Bệnh nhân đã xác nhận.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-extrabold text-slate-900">Tổng hợp chi phí</h2>
              <div className="space-y-3 text-xs font-bold">
                <div className="flex justify-between"><span className="text-slate-500">Tổng chi phí điều trị</span><span className="text-base text-slate-900">{formatCurrency(patient.totalCost)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Đã thanh toán ({paidPercent}%)</span><span className="text-emerald-600">-{formatCurrency(patient.paid)}</span></div>
                <div className="border-t border-slate-100 pt-3 flex justify-between"><span className="text-slate-500">Công nợ hiện tại</span><span className="text-base text-rose-600">{formatCurrency(patient.currentDebt)}</span></div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentReceiptData({
                    patientName: patient.name,
                    patientId: patient.id,
                    amount: patient.currentDebt || 13000000,
                    description: `Thanh toán công nợ điều trị - ${patient.treatment}`,
                    paymentMethod: 'VietQR',
                    collector: 'Dr. Lê Văn Hùng',
                    isEvatEnabled: true,
                    customerType: 'Cá nhân',
                    taxCode: '',
                    buyerName: patient.name,
                    buyerAddress: patient.address,
                    buyerEmail: patient.email,
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

      {activeTab === 'dental' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          {/* Left Column: Sơ đồ răng giải phẫu 32 răng */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            <DentalChart
              patientName={patient.name}
              patientId={patient.id}
              onAddDiagnosis={(toothNum) => {
                setSelectedToothForDiagnosis(toothNum || 46);
                setIsDiagnosisOpen(true);
              }}
            />
          </div>

          {/* Right Column: Thư viện Phim X-quang */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            <XrayLibrary
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

      {activeTab === 'history' && (
        <section className="space-y-5">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tổng số lần đến khám</p>
                <p className="mt-1 text-xl font-black text-slate-900">6 lượt</p>
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
                <p className="mt-1 text-xl font-black text-teal-900">97%</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Filters */}
            <div className="flex items-center gap-2 border-b border-slate-100 p-4">
              <button className="rounded-full bg-slate-800 px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-slate-700 transition-colors">Tất cả trạng thái</button>
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">Sắp tới (1)</button>
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">Đã hoàn tất (4)</button>
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 transition-colors">Đã dời lịch (1)</button>
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
                    <th className="px-5 py-4">Tiền cọc VietQR</th>
                    <th className="px-5 py-4">Trạng thái</th>
                    <th className="px-5 py-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">#LH-2026-901</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-rose-600">14:30</div>
                      <div className="text-[11px] font-semibold text-slate-500">Hôm nay</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Cắt chỉ & Tái khám</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">BS. Lê Văn Hùng</div>
                      <div className="text-[11px] font-medium text-slate-500">Ghế 03</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Đã cọc 500k</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-700">Đã xác nhận</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-5 w-5" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">#LH-2026-842</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">09:00</div>
                      <div className="text-[11px] font-semibold text-slate-500">15/10/2026</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Phẫu thuật Implant</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">BS. Lê Văn Hùng</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Đã thanh toán đủ</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Đã hoàn thành</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-5 w-5" /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">#LH-2026-790</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">08:30</div>
                      <div className="text-[11px] font-semibold text-slate-500">10/10/2026</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Khám tổng quát & CT 3D</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">BS. Lê Văn Hùng</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Miễn phí</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Đã hoàn thành</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-5 w-5" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 p-4">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                <FileDown className="h-4 w-4" /> Xuất lịch sử khám (Excel/PDF)
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'billing' && (
        <section className="space-y-5">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
              <div className="absolute right-4 top-4 text-slate-100"><Receipt className="h-16 w-16" /></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-500">Tổng chi phí điều trị gói</p>
                  <button className="text-slate-400 hover:text-slate-600"><Receipt className="h-4 w-4" /></button>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900">{formatCurrency(patient.totalCost)}</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Đã thu (Cọc VietQR + Đợt 1)</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <TrendingUp className="h-3 w-3" /> 73%
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600">{formatCurrency(patient.paid)}</p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">Công nợ còn lại phải thu</p>
                <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                  Thu khi lắp mão sứ hoàn tất
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-orange-500">{formatCurrency(patient.currentDebt)}</p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            {/* Left Column: Transactions */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <h3 className="text-base font-extrabold text-slate-900">Danh sách phiếu thu & Lịch sử giao dịch</h3>
                <button className="text-xs font-bold text-sky-600 hover:text-sky-700">Xem tất cả</button>
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
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">#HĐ-8901</div>
                        <div className="text-[11px] font-medium text-slate-500">10/10/2026</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">Cọc giữ chỗ qua VietQR</td>
                      <td className="px-5 py-4 text-right font-black text-slate-900">500.000đ</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            <QrCode className="h-3.5 w-3.5" /> Chuyển khoản VietQR
                          </span>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Đã quyết toán
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentReceiptData({
                              patientName: patient.name,
                              patientId: patient.id,
                              amount: 500000,
                              description: 'Cọc giữ chỗ qua VietQR',
                              paymentMethod: 'VietQR',
                              collector: 'Dr. Lê Văn Hùng',
                              isEvatEnabled: true,
                              customerType: 'Cá nhân',
                              taxCode: '',
                              buyerName: patient.name,
                              buyerAddress: patient.address,
                              buyerEmail: patient.email,
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
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">#HĐ-8955</div>
                        <div className="text-[11px] font-medium text-slate-500">15/10/2026</div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">Thanh toán Đợt 1 (Phẫu thuật cấy trụ)</td>
                      <td className="px-5 py-4 text-right font-black text-slate-900">34.500.000đ</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                            <CreditCard className="h-3.5 w-3.5" /> Quẹt thẻ POS
                          </span>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Đã quyết toán
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentReceiptData({
                              patientName: patient.name,
                              patientId: patient.id,
                              amount: 34500000,
                              description: 'Thanh toán Đợt 1 (Phẫu thuật cấy trụ)',
                              paymentMethod: 'Quẹt thẻ POS',
                              collector: 'Dr. Lê Văn Hùng',
                              isEvatEnabled: true,
                              customerType: 'Cá nhân',
                              taxCode: '',
                              buyerName: patient.name,
                              buyerAddress: patient.address,
                              buyerEmail: patient.email,
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
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">#HĐ-9102</div>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-500">
                          <Clock3 className="h-3 w-3" /> Dự kiến 01/2027
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">Thanh toán Đợt 2 (Lắp mão sứ Cercon)</td>
                      <td className="px-5 py-4 text-right font-black text-slate-900">13.000.000đ</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-semibold text-slate-500">Chờ xử lý</span>
                          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                            Chưa thanh toán
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentReceiptData({
                              patientName: patient.name,
                              patientId: patient.id,
                              amount: 13000000,
                              description: 'Thanh toán Đợt 2 (Lắp mão sứ Cercon)',
                              paymentMethod: 'VietQR',
                              collector: 'Dr. Lê Văn Hùng',
                              isEvatEnabled: true,
                              customerType: 'Cá nhân',
                              taxCode: '',
                              buyerName: patient.name,
                              buyerAddress: patient.address,
                              buyerEmail: patient.email,
                              vatRate: '0% VAT - Dịch vụ y tế',
                              sendZns: true,
                            });
                            setIsReceiptOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" /> Thu tiền
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Collect Payment */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm self-start">
              <h3 className="mb-4 text-base font-extrabold text-slate-900">Thu tiền đợt thanh toán tiếp theo</h3>
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Số tiền thu</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="13.000.000" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right font-black text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">đ</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700">Hình thức thanh toán</label>
                  
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border-2 border-sky-500 bg-sky-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full border-4 border-sky-500 bg-white"></div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Chuyển khoản VietQR</p>
                        <p className="text-[11px] font-semibold text-sky-700">Tạo mã động</p>
                      </div>
                    </div>
                    <QrCode className="h-5 w-5 text-sky-600" />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border-2 border-slate-300 bg-white"></div>
                      <p className="text-sm font-bold text-slate-700">Tiền mặt</p>
                    </div>
                    <Wallet className="h-5 w-5 text-slate-400" />
                  </label>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border-2 border-slate-300 bg-white"></div>
                      <p className="text-sm font-bold text-slate-700">Quẹt thẻ POS</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentReceiptData({
                      patientName: patient.name,
                      patientId: patient.id,
                      amount: 13000000,
                      description: 'Thanh toán Đợt 2 - Niềng răng Invisalign',
                      paymentMethod: 'VietQR',
                      collector: 'Dr. Lê Văn Hùng',
                      isEvatEnabled: true,
                      customerType: 'Cá nhân',
                      taxCode: '',
                      buyerName: patient.name,
                      buyerAddress: patient.address,
                      buyerEmail: patient.email,
                      vatRate: '0% VAT - Dịch vụ y tế',
                      sendZns: true,
                    });
                    setIsReceiptOpen(true);
                  }}
                  className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Receipt className="h-4 w-4" /> Tạo phiếu thu & Xuất hóa đơn VAT
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Đặt lịch hẹn mới" subtitle={`Bệnh nhân ${patient.name}`} maxWidth="lg">
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1 font-bold text-slate-700">Ngày hẹn<input type="date" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" /></label>
            <label className="space-y-1 font-bold text-slate-700">Giờ hẹn<input type="time" defaultValue="14:30" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" /></label>
          </div>
          <label className="space-y-1 font-bold text-slate-700">Nội dung<textarea defaultValue="Cắt chỉ & tái khám kiểm tra trụ Implant" className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" /></label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => setIsScheduleOpen(false)} className="px-4 py-2 font-bold text-slate-600">Hủy</button><button type="button" onClick={() => setIsScheduleOpen(false)} className="rounded-xl bg-slate-900 px-4 py-2 font-bold text-white">Lưu lịch hẹn</button></div>
        </div>
      </Modal>

      {/* Modal Lập Phiếu Thu & Xuất Hóa Đơn VAT */}
      <CreateReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        patientName={patient.name}
        patientId={patient.id}
        defaultAmount={currentReceiptData?.amount || 13000000}
        defaultDescription={currentReceiptData?.description || 'Thanh toán Đợt 2 - Niềng răng Invisalign'}
        onOpenPreview={(data) => {
          setCurrentReceiptData(data);
          setIsReceiptOpen(false);
          setIsPreviewReceiptOpen(true);
        }}
        onConfirmSuccess={(data) => {
          console.log('Thanh toán thành công:', data);
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
        patientName={patient.name}
        patientId={patient.id}
      />

      {/* Add Diagnosis Modal */}
      <AddDiagnosisModal
        isOpen={isDiagnosisOpen}
        onClose={() => setIsDiagnosisOpen(false)}
        defaultToothNumber={selectedToothForDiagnosis}
        onSave={(toothNum, condition, note) => {
          console.log('Saved diagnosis:', toothNum, condition, note);
        }}
      />

      {/* Upload X-Ray Modal */}
      <UploadXrayModal
        isOpen={isUploadXrayOpen}
        onClose={() => setIsUploadXrayOpen(false)}
      />

      {/* Patient Edit Modal */}
      <PatientEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        patient={patient}
      />
    </div>
  );
};
