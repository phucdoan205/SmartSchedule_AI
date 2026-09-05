import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarPlus,
  CreditCard,
  Download,
  Edit,
  FileText,
  Mail,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Phone,
  Receipt,
  Sparkles,
} from 'lucide-react';
import patientAvatar from '../../assets/bacsi.jpg';
import { Modal } from '../../components/common/Modal';
import { Tabs, type TabItem } from '../../components/common/Tabs';

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
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50" type="button">
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
                <h2 className="inline-flex items-center gap-2 text-base font-extrabold text-slate-900"><FileText className="w-4 h-4 text-sky-600" /> Phim X-Quang Gần Đây</h2>
                <button type="button" className="text-xs font-bold text-sky-700 hover:text-sky-900">Xem tất cả</button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {['CT Conebeam', 'Panorama', 'Răng 46'].map((label, index) => (
                  <div key={label} className="h-28 rounded-xl border border-slate-200 bg-slate-900 p-3 text-white shadow-sm">
                    <div className="h-full rounded-lg border border-slate-700 bg-[radial-gradient(circle_at_35%_40%,#e2e8f0_0,transparent_24%),linear-gradient(135deg,#0f172a,#334155)] opacity-90" />
                    <p className="mt-2 text-[11px] font-bold text-slate-600">{label} • 0{index + 1}/09/2026</p>
                  </div>
                ))}
              </div>
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
                onClick={() => setIsReceiptOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-700 hover:bg-emerald-100"
              >
                <Receipt className="w-4 h-4" /> Lập phiếu thu mới
              </button>
            </section>
          </aside>
        </div>
      )}

      {activeTab === 'dental' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">Sơ đồ răng & Phim X-quang</h2>
          <div className="grid grid-cols-8 gap-2 text-center text-xs font-black text-slate-700">
            {Array.from({ length: 32 }, (_, index) => (
              <div key={index} className={`rounded-xl border p-3 ${index === 21 ? 'border-sky-300 bg-sky-50 text-sky-700' : 'border-slate-200 bg-slate-50'}`}>{index + 1}</div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">Lịch sử cuộc hẹn</h2>
          <div className="space-y-3">
            {timeline.slice(0, 3).map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
                <div><p className="font-extrabold text-slate-900">{item.title}</p><p className="mt-1 font-medium text-slate-500">{item.description}</p></div>
                <span className="font-bold text-slate-500">{item.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'billing' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-slate-900">Thanh toán & Công nợ</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">Tổng điều trị</p><p className="mt-1 text-xl font-black text-slate-900">{formatCurrency(patient.totalCost)}</p></div>
            <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">Đã thanh toán</p><p className="mt-1 text-xl font-black text-emerald-700">{formatCurrency(patient.paid)}</p></div>
            <div className="rounded-xl bg-rose-50 p-4"><p className="text-xs font-bold text-rose-700">Còn nợ</p><p className="mt-1 text-xl font-black text-rose-700">{formatCurrency(patient.currentDebt)}</p></div>
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

      <Modal isOpen={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} title="Lập phiếu thu bệnh nhân" subtitle="Thanh toán công nợ điều trị Implant" maxWidth="lg">
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-extrabold text-slate-900">{patient.name} • {patient.id}</p>
            <p className="mt-1 font-medium text-slate-500">Công nợ hiện tại: {formatCurrency(patient.currentDebt)}</p>
          </div>
          <label className="space-y-1 font-bold text-slate-700">Số tiền thu<input defaultValue={formatCurrency(patient.currentDebt)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-black text-emerald-700" /></label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={() => setIsReceiptOpen(false)} className="px-4 py-2 font-bold text-slate-600">Hủy</button><button type="button" onClick={() => setIsReceiptOpen(false)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white"><CreditCard className="w-4 h-4" /> Xác nhận thu</button></div>
        </div>
      </Modal>
    </div>
  );
};
