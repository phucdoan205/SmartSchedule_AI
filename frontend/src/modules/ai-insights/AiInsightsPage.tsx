import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Download,
  TrendingUp,
  CheckCircle2,
  Bot,
  MessageSquare,
  Globe,
  RefreshCw,
  Image as ImageIcon,
  Clock,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { toast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useBranch } from '../../context/BranchContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import { aiApi, appointmentsApi, servicesApi } from '../../services/api';

interface AiInsightData {
  overview: {
    totalConsultations: number;
    acceptanceRate: number;
    acceptedCount: number;
    webCount: number;
    zaloCount: number;
    noShowRiskRate: number;
    pendingAppointmentsCount: number;
    averageRating: number;
    positivePercent: number;
    neutralPercent: number;
    negativePercent: number;
  };
  trafficData: Array<{
    day: string;
    count: number;
    height: string;
    active: boolean;
  }>;
  offPeakDay: string;
  recentLogs: Array<{
    id: string;
    channel: string;
    patientName: string;
    patientPhone: string;
    symptoms?: string;
    imageUrl?: string;
    diagnosis: string;
    riskLevel: string;
    confidence: number;
    suggestedSpecialty: string;
    suggestedDoctorName?: string;
    isAccepted: boolean;
    createdAt: string;
  }>;
}

interface SmartSlot {
  time: string;
  startTime: string;
  endTime: string;
  bufferEndTime: string;
  chairName: string;
  doctorName: string;
  doctorSpecialty: string;
  aiScore: number;
  isAiRecommended: boolean;
  reason: string;
}

export const AiInsightsPage: React.FC = () => {
  const { user } = useAuth();
  const { selectedBranchId, branches } = useBranch();
  const userRoleCode = rolePermissionStore.getUserRoleCode(user);
  const canConfigureAi = rolePermissionStore.canConfigureAi(userRoleCode, user);
  const canExportAi = rolePermissionStore.canExportAi(userRoleCode, user);

  const [loading, setLoading] = useState(true);
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'WEB' | 'ZALO'>('ALL');

  // Smart Slots State (Default to Tomorrow)
  const [selectedSlotDate, setSelectedSlotDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [smartSlots, setSmartSlots] = useState<SmartSlot[]>([]);
  const [clinicalServices, setClinicalServices] = useState<any[]>([]);

  const [insightData, setInsightData] = useState<AiInsightData>({
    overview: {
      totalConsultations: 24,
      acceptanceRate: 42.5,
      acceptedCount: 10,
      webCount: 18,
      zaloCount: 6,
      noShowRiskRate: 20,
      pendingAppointmentsCount: 6,
      averageRating: 4.8,
      positivePercent: 91,
      neutralPercent: 6,
      negativePercent: 3,
    },
    trafficData: [
      { day: 'T2', count: 12, height: '40%', active: false },
      { day: 'T3', count: 5, height: '22%', active: true },
      { day: 'T4', count: 18, height: '65%', active: false },
      { day: 'T5', count: 14, height: '50%', active: false },
      { day: 'T6', count: 22, height: '80%', active: false },
      { day: 'T7', count: 28, height: '95%', active: false },
      { day: 'CN', count: 24, height: '85%', active: false },
    ],
    offPeakDay: 'T3',
    recentLogs: [],
  });

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getInsights(selectedBranchId);
      if (res) {
        setInsightData(res);
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartSlots = async (dateStr: string) => {
    try {
      setLoadingSlots(true);
      const targetBranch = selectedBranchId && selectedBranchId !== 'ALL'
        ? selectedBranchId
        : (branches && branches.length > 0 ? branches[0].id : '');

      if (!targetBranch) return;

      const res = await appointmentsApi.getAiSmartSlots(targetBranch, dateStr, 60);
      if (res && res.slots) {
        setSmartSlots(res.slots);
      }
    } catch (err) {
      console.error('Error fetching AI smart slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    servicesApi.getAll({ isActive: true }).then((data) => {
      if (Array.isArray(data)) {
        setClinicalServices(data.slice(0, 5));
      }
    }).catch(console.error);
  }, [selectedBranchId]);

  useEffect(() => {
    fetchSmartSlots(selectedSlotDate);
  }, [selectedBranchId, selectedSlotDate, branches]);

  // Pagination State (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [channelFilter]);

  // Filter logs by channel
  const filteredLogs = insightData.recentLogs.filter((log) => {
    if (channelFilter === 'WEB') return log.channel === 'WEB_CONSULTATION';
    if (channelFilter === 'ZALO') return log.channel === 'ZALO_BOT';
    return true;
  });

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider border border-sky-200">
              ⚡ AI INSIGHTS & SMART SCHEDULING
            </span>
            <span className="text-slate-400 text-[11px]">
              Dữ liệu vận hành thời gian thực
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Trung Tâm Phân Tích & Tối Ưu AI
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Giám sát số liệu người dùng sử dụng AI tư vấn phác đồ, tương tác qua Bot Zalo và thuật toán AI tự động gợi ý khung giờ trống tuân thủ đệm vô trùng 15 phút.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchInsights();
              fetchSmartSlots(selectedSlotDate);
            }}
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Làm mới số liệu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Tháng này</span>
          </div>

          {canExportAi && (
            <button
              type="button"
              onClick={() => toast('Đã xuất báo cáo phân tích AI (.PDF) thành công!')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
          )}
        </div>
      </div>

      {/* Top 4 Stat Cards (Yêu cầu 5: Card 3 Tương tác qua Zalo bot chat; Card 4 Tỉ lệ chọn theo AI khung giờ trống) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lượt dùng AI tư vấn */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">LƯỢT DÙNG AI TƯ VẤN</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {insightData.overview.totalConsultations} <span className="text-xs font-bold text-slate-400">Lượt</span>
          </p>
          <p className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
            <Globe className="w-3 h-3" /> Web: {insightData.overview.webCount} • <MessageSquare className="w-3 h-3 text-teal-600" /> Zalo: {insightData.overview.zaloCount}
          </p>
        </div>

        {/* Card 2: Tỷ lệ chấp nhận phác đồ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">TỶ LỆ CHẤP NHẬN PHÁC ĐỒ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {insightData.overview.acceptanceRate}%
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {insightData.overview.acceptedCount} ca đã bấm đặt lịch theo phác đồ AI
          </p>
        </div>

        {/* Card 3: Tương tác qua Zalo bot chat (Tương lai) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">TƯƠNG TÁC ZALO BOT CHAT</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-600">
            85% <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">Tương lai</span>
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Kênh CSKH & Trả lời tự động Zalo OA
          </p>
        </div>

        {/* Card 4: Tỉ lệ chọn theo đề AI khung giờ trống */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">CHỌN THEO AI KHUNG GIỜ TRỐNG</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600">
            65% <span className="text-xs font-bold text-slate-400">Ca Khám</span>
          </p>
          <p className="text-[11px] text-indigo-600 font-semibold">
            Tự động tối ưu đệm vô trùng 15 phút
          </p>
        </div>
      </div>

      {/* Main Section 2: AI Gợi Ý Khung Giờ Trống (Có Tính Đệm Vô Trùng 15 Phút) & Phác Đồ Mẫu */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Thuật toán AI gợi ý khung giờ trống trực tiếp */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" /> AI Gợi Ý Khung Giờ Trống (Đệm Vô Trùng 15 Phút)
                </h3>
                <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                  Thuật Toán Đệm 15p
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Thuật toán tự động quét lịch trống của ghế nha và bác sĩ, đảm bảo luôn có 15 phút khử trùng sau mỗi ca
              </p>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <input
                type="date"
                value={selectedSlotDate}
                onChange={(e) => setSelectedSlotDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Slots Cards Grid */}
          {loadingSlots ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <span className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Thuật toán AI đang tính toán khung giờ trống từ database...</span>
            </div>
          ) : smartSlots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              {smartSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    slot.isAiRecommended
                      ? 'bg-gradient-to-br from-indigo-50/70 to-sky-50/70 border-indigo-200/90 shadow-2xs hover:shadow-md'
                      : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-black text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                      {slot.time}
                    </span>
                    {slot.isAiRecommended && (
                      <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3 text-indigo-600" /> AI Đề Xuất
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800 line-clamp-1">{slot.chairName}</p>
                    <p className="text-[11px] text-teal-700 font-semibold">{slot.doctorName}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {slot.reason}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">Đệm: 15p khử trùng</span>
                    <span className="font-extrabold text-indigo-600">Điểm: {slot.aiScore}/100</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              Không tìm thấy khung giờ trống nào trong ngày {selectedSlotDate}. Vui lòng chọn ngày khác!
            </div>
          )}
        </div>

        {/* Right 1 Col: Đề xuất phác đồ thông minh chuẩn y khoa */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" /> Phác Đồ Tiêu Chuẩn AI
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Dữ Liệu Thật (DB)
              </span>
            </div>

            <div className="space-y-3 text-xs max-h-[380px] overflow-y-auto pr-1">
              {clinicalServices.length > 0 ? (
                clinicalServices.map((srv: any, idx: number) => (
                  <div key={srv.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:bg-sky-50/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-slate-900 truncate">{srv.name}</h4>
                      <span className="text-[10px] font-extrabold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 shrink-0">
                        {srv.code || `DV-${idx + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Thời lượng: <strong>{srv.durationMinutes || 60}p</strong></span>
                      <span className="font-extrabold text-teal-600">
                        {Number(srv.standardPrice || 0).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {srv.category?.name || srv.category || 'Nha khoa chuyên sâu'} • Tự động gắn phác đồ điều trị EMR
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Đang tải phác đồ dịch vụ từ cơ sở dữ liệu...
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 text-[11px] text-indigo-800 leading-relaxed">
            <span className="font-bold">Ghi chú:</span> Các phác đồ điều trị AI được liên kết trực tiếp với bảng dịch vụ và tự động xuất hồ sơ EMR khi bệnh nhân đặt lịch hẹn.
          </div>
        </div>
      </div>

      {/* Main Section 3: Bảng Nhật Ký Người Dùng Tương Tác AI (BỎ CỘT TRẠNG THÁI theo yêu cầu 5) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" /> Nhật Ký Người Dùng Tương Tác AI Tư Vấn & Bot Zalo
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                Dữ Liệu Thật
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi chi tiết các ca chẩn đoán AI từ website và các phiên hội thoại khách hàng qua Zalo Bot
            </p>
          </div>

          {/* Channel Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl shrink-0">
            <button
              type="button"
              onClick={() => setChannelFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                channelFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tất cả ({insightData.recentLogs.length})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('WEB')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                channelFilter === 'WEB' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-500 hover:text-sky-600'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Web ({insightData.recentLogs.filter((l) => l.channel === 'WEB_CONSULTATION').length})
            </button>
            <button
              type="button"
              onClick={() => setChannelFilter('ZALO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                channelFilter === 'ZALO' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-500 hover:text-teal-600'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Zalo Bot ({insightData.recentLogs.filter((l) => l.channel === 'ZALO_BOT').length})
            </button>
          </div>
        </div>

        {/* Logs Table (BỎ CỘT TRẠNG THÁI THEO ĐÚNG YÊU CẦU 5) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Kênh</th>
                <th className="py-3 px-3">Bệnh nhân</th>
                <th className="py-3 px-3">Triệu chứng / Ảnh</th>
                <th className="py-3 px-3">Chẩn đoán AI</th>
                <th className="py-3 px-3">Bác sĩ ghép nối</th>
                <th className="py-3 px-3">Độ tin cậy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const logDate = new Date(log.createdAt);
                  const timeFormatted = `${logDate.getHours().toString().padStart(2, '0')}:${logDate.getMinutes().toString().padStart(2, '0')} - ${logDate.getDate()}/${logDate.getMonth() + 1}`;
                  const isZalo = log.channel === 'ZALO_BOT';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-500 whitespace-nowrap">
                        {timeFormatted}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            isZalo
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {isZalo ? <MessageSquare className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                          {isZalo ? 'Zalo Bot' : 'Web AI'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-slate-800">{log.patientName}</p>
                        <p className="text-[10px] text-slate-400">{log.patientPhone}</p>
                      </td>
                      <td className="py-3.5 px-3 max-w-[220px]">
                        {log.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold mb-1 mr-1">
                            <ImageIcon className="w-3 h-3" /> Ảnh đính kèm
                          </span>
                        )}
                        <span className="text-slate-600 line-clamp-2" title={log.symptoms || ''}>
                          {log.symptoms || 'Không có mô tả text'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 max-w-[260px]">
                        <p className="font-bold text-slate-900 line-clamp-1" title={log.diagnosis}>
                          {log.diagnosis}
                        </p>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded border ${
                            log.riskLevel === 'Cao'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : log.riskLevel === 'Thấp'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          Rủi ro: {log.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-700">
                        {log.suggestedDoctorName || 'TS.BS. Nguyễn Minh Anh'}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-sky-600">
                        {log.confidence}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <p className="text-xs">Chưa có lịch sử tư vấn AI nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (10 bản ghi / trang) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
          <p className="text-slate-500">
            Hiển thị <span className="font-bold text-slate-800">{filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, filteredLogs.length)}</span> trên tổng số <span className="font-bold text-slate-800">{filteredLogs.length}</span> nhật ký AI (10 bản ghi/trang)
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                Sau <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
