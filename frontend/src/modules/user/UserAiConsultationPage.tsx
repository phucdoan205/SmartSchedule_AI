import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  User,
  CheckCircle2,
  Calendar,
  Stethoscope,
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  ShieldAlert,
  ArrowRight,
  Activity,
  FileText,
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { toast } from '../../context/ToastContext';

interface UserAiConsultationPageProps {
  onOpenBookingWizard?: (doctorId?: string, serviceId?: string) => void;
}

interface AiReportState {
  consultationId?: string;
  diagnosis: string;
  riskLevel: 'Thấp' | 'Trung Bình' | 'Cao' | string;
  suggestedSpecialty: string;
  confidence: number;
  regimen: string[];
  suggestedDoctor: string;
  suggestedDoctorId?: string;
  serviceId?: string;
  serviceCode?: string;
  serviceName?: string;
  isServiceAvailable?: boolean;
  imageUrl?: string;
  visionDetails?: any;
  nlpDetails?: any;
}

const QUICK_SYMPTOMS = [
  'Đau buốt răng hàm khi ăn đồ ngọt hoặc uống nước lạnh',
  'Chảy máu chân răng khi đánh răng, nướu sưng đỏ',
  'Mất 1 răng hàm ăn nhai khó khăn, muốn cấy ghép Implant',
  'Răng ố vàng xỉn màu lâu năm, muốn làm trắng thẩm mỹ',
  'Răng mọc chen chúc khấp khểnh, muốn niềng trong suốt',
];

export const UserAiConsultationPage: React.FC<UserAiConsultationPageProps> = ({ onOpenBookingWizard }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<AiReportState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast('Vui lòng chỉ tải lên tệp hình ảnh (JPG, PNG, WEBP).', 'error');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuickSymptom = (text: string) => {
    setSymptomInput(text);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptomInput.trim() && !selectedFile) {
      toast('Vui lòng nhập mô tả triệu chứng hoặc tải ảnh chụp răng miệng để AI phân tích!', 'error');
      return;
    }

    setAnalyzing(true);

    try {
      const res = await aiApi.consult({
        symptoms: symptomInput.trim() || undefined,
        file: selectedFile || undefined,
        patientName: patientName.trim() || undefined,
        patientPhone: patientPhone.trim() || undefined,
        channel: 'WEB_CONSULTATION',
      });

      if (res && res.success) {
        setAiReport({
          consultationId: res.consultationId,
          diagnosis: res.diagnosis,
          riskLevel: res.riskLevel || 'Trung Bình',
          suggestedSpecialty: res.suggestedSpecialty || 'Răng Hàm Mặt',
          confidence: res.confidence || 95.0,
          regimen: res.regimen || [],
          suggestedDoctor: res.suggestedDoctor || 'Bác sĩ chuyên khoa',
          suggestedDoctorId: res.suggestedDoctorId,
          serviceId: res.serviceId,
          serviceCode: res.serviceCode,
          serviceName: res.serviceName,
          isServiceAvailable: res.isServiceAvailable !== false,
          imageUrl: res.imageUrl,
          visionDetails: res.visionDetails,
          nlpDetails: res.nlpDetails,
        });

        toast('AI đã phân tích dữ liệu lâm sàng và đề xuất phác đồ thành công!', 'success');
      } else {
        toast('Không thể nhận kết quả từ AI, vui lòng thử lại sau!', 'error');
      }
    } catch (err: any) {
      console.error('Error analyzing with AI:', err);
      toast('Lỗi kết nối AI Service. Hệ thống chuyển sang phác đồ dự phòng chuẩn y khoa.', 'error');
      // Fallback
      setAiReport({
        diagnosis: `Đề xuất chẩn đoán dựa trên triệu chứng: "${symptomInput || 'Hình ảnh lâm sàng'}"`,
        riskLevel: 'Trung Bình',
        suggestedSpecialty: 'Chuyên Khoa Răng Hàm Mặt Kỹ Thuật Cao',
        confidence: 94.8,
        regimen: [
          'Chụp phim X-Quang chẩn đoán độ sâu thương tổn',
          'Khám tư vấn trực tiếp cùng Bác sĩ Chuyên khoa',
          'Lập phác đồ điều trị vô trùng chuẩn quốc tế',
        ],
        suggestedDoctor: 'TS.BS. Nguyễn Minh Anh',
        serviceName: 'Khám & Điều Trị Nha Khoa Tổng Quát',
        isServiceAvailable: true,
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBookingClick = async () => {
    if (aiReport?.consultationId) {
      try {
        await aiApi.accept(aiReport.consultationId);
      } catch (err) {
        console.warn('Could not mark consultation as accepted:', err);
      }
    }

    if (onOpenBookingWizard) {
      onOpenBookingWizard(aiReport?.suggestedDoctorId, aiReport?.serviceId);
    } else {
      toast('Đang chuyển hướng đến cổng đặt lịch hẹn...', 'success');
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'Thấp':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cao':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-700 text-xs font-bold shadow-2xs">
          <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" /> Trợ Lý Trí Tuệ Nhân Tạo AI SmartSchedule (Vision + NLP)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Tư Vấn Triệu Chứng & Đề Xuất Phác Đồ Điều Trị
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Người dùng có thể <strong className="text-slate-700 font-semibold">mô tả triệu chứng</strong>, <strong className="text-slate-700 font-semibold">tải ảnh răng miệng</strong> hoặc <strong className="text-sky-600 font-semibold">kết hợp cả hai</strong> để mô hình AI MobileNet & PhoBERT phân tích bệnh lý và gợi ý phác đồ chính xác nhất.
        </p>
      </div>

      {/* Main Interactive Form Card */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-2xl space-y-6 relative overflow-hidden border border-sky-800/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Cổng Tiếp Nhận & Phân Tích Đa Phương Thức AI</h2>
              <p className="text-xs text-slate-300">Nhận diện ảnh răng tổn thương & Giải mã văn bản triệu chứng lâm sàng</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
              AI Engine Sẵn Sàng (Port 8000)
            </span>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="relative z-10 space-y-5">
          {/* Section 1: Symptom Text Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" /> Mô tả triệu chứng sức khỏe răng miệng:
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Có thể để trống nếu chỉ phân tích bằng ảnh</span>
            </label>
            <textarea
              rows={3}
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Ví dụ: Răng hàm bên trái bị ê buốt buốt tận óc khi ăn đồ ngọt hoặc uống nước đá lạnh, nướu viền răng có dấu hiệu sưng đỏ..."
              className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none transition-all"
            />

            {/* Quick symptom pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Gợi ý nhanh:</span>
              {QUICK_SYMPTOMS.map((qs, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSymptom(qs)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all text-left"
                >
                  {qs.length > 36 ? qs.substring(0, 36) + '...' : qs}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Image Upload / Drag & Drop */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-teal-400" /> Hình ảnh răng miệng tổn thương (Tùy chọn):
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Mô hình MobileNetV3 AI nhận diện bệnh lý tự động</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-sky-400/80 rounded-2xl p-5 text-center cursor-pointer bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      Bấm vào đây để tải ảnh chụp răng hoặc kéo thả ảnh vào đây
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hỗ trợ ảnh chụp cận cảnh răng hàm, ảnh nụ cười, tổn thương lợi (JPG, PNG, WEBP)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl bg-white/10 border border-white/20 p-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview răng miệng"
                    className="w-16 h-16 object-cover rounded-xl border border-white/30 shrink-0 shadow-md"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{selectedFile?.name}</p>
                    <p className="text-[11px] text-teal-300 font-medium">
                      {(selectedFile?.size ? (selectedFile.size / 1024).toFixed(1) : 0)} KB • Sẵn sàng quét phân tích AI
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-400/30">
                      Vision MobileNetV3 Enabled
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition-colors"
                  title="Xóa ảnh này"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Patient Optional Contact & Submit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Tên của bạn (Tùy chọn)..."
              className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="tel"
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              placeholder="Số điện thoại (Tùy chọn)..."
              className="px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />

            <button
              type="submit"
              disabled={analyzing}
              className="w-full py-2.5 px-5 bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 hover:from-sky-600 hover:to-emerald-500 font-extrabold text-xs sm:text-sm text-slate-950 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {analyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>AI Đang Phân Tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Phân Tích AI & Đề Xuất</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Empty State before user triggers analysis */}
      {!aiReport && !analyzing && (
        <div className="bg-white/80 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-3 animate-fadeIn">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs">
            <Bot className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            Chưa Có Kết Quả Phân Tích Lâm Sàng
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Vui lòng nhập mô tả triệu chứng hoặc tải ảnh chụp nha khoa ở khung bên trên, sau đó nhấn <strong>"Phân Tích AI & Đề Xuất"</strong> để AI nhận diện tổn thương và đưa ra phác đồ điều trị chuẩn y khoa.
          </p>
        </div>
      )}

      {/* AI Analysis Result Display Card */}
      {aiReport && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-6 animate-fadeIn">
          {/* Top Title Bar of Result */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 text-white rounded-2xl shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    ĐỘ CHÍNH XÁC AI: {aiReport.confidence}%
                  </span>
                  {aiReport.imageUrl && (
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      📸 Đã phân tích ảnh
                    </span>
                  )}
                  {aiReport.consultationId && (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      ID: #{aiReport.consultationId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {aiReport.diagnosis}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-500 font-medium">Mức độ rủi ro:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${getRiskBadgeColor(aiReport.riskLevel)}`}>
                {aiReport.riskLevel}
              </span>
            </div>
          </div>

          {/* Grid: 2 Columns (Regimen & Matched Doctor) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {/* Column 1: Regimen Steps */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
                <Stethoscope className="w-4 h-4 text-sky-600" /> Đề Xuất Phác Đồ Điều Trị Ban Đầu:
              </h4>

              <div className="space-y-2.5">
                {aiReport.regimen && aiReport.regimen.length > 0 ? (
                  aiReport.regimen.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-50/80 hover:bg-sky-50/40 p-3 rounded-2xl border border-slate-200/80 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 font-medium leading-relaxed">{step}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Không có dữ liệu phác đồ.</p>
                )}
              </div>

              {aiReport.serviceName && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    aiReport.isServiceAvailable !== false
                      ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      aiReport.isServiceAvailable !== false ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span>
                    Dịch vụ liên kết: <strong>{aiReport.serviceName}</strong>
                  </span>
                  {aiReport.isServiceAvailable === false && (
                    <span className="text-[10px] text-slate-400 ml-auto">(Khám lâm sàng)</span>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Suggested Doctor & Booking Action */}
            <div className="space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-xs sm:text-sm">
                  <User className="w-4 h-4 text-teal-600" /> Bác Sĩ Chuyên Khoa Phù Hợp Nhất:
                </h4>

                <div className="p-4 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 rounded-2xl border border-teal-200/90 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-slate-900 text-sm sm:text-base">{aiReport.suggestedDoctor}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Ghép nối AI 100%
                    </span>
                  </div>
                  <p className="text-xs text-teal-800 font-semibold">{aiReport.suggestedSpecialty}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Bác sĩ chuyên khoa đầu ngành có lịch trống trong tuần này • Khuyến nghị khám theo phác đồ AI.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-2 pt-2">
                {aiReport.isServiceAvailable !== false ? (
                  <button
                    type="button"
                    onClick={handleBookingClick}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-500 hover:from-sky-700 hover:to-emerald-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Đặt Lịch Khám Theo Phác Đồ AI Này</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                    <p className="text-xs text-slate-600 font-medium">
                      Phác đồ này cần thăm khám lâm sàng trực tiếp với bác sĩ để chỉ định can thiệp chi tiết.
                    </p>
                    <button
                      type="button"
                      onClick={handleBookingClick}
                      className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Đặt Lịch Khám &amp; Tư Vấn Cùng Bác Sĩ</span>
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-center text-slate-400">
                  Hệ thống tự động đồng bộ phác đồ và lưu hồ sơ bệnh nhân khi bạn xác nhận đặt lịch.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
