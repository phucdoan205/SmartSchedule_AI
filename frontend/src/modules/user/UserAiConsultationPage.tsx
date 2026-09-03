import React, { useState } from 'react';
import { Sparkles, Bot, Send, User, CheckCircle2, Calendar, Stethoscope, ArrowRight, ShieldAlert } from 'lucide-react';
import { MOCK_DOCTORS } from '../../services/mockData';

interface UserAiConsultationPageProps {
  onOpenBookingWizard?: (doctorId?: string) => void;
}

export const UserAiConsultationPage: React.FC<UserAiConsultationPageProps> = ({ onOpenBookingWizard }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<{
    diagnosis: string;
    riskLevel: 'Thấp' | 'Trung Bình' | 'Cao';
    suggestedSpecialty: string;
    confidence: number;
    regimen: string[];
    suggestedDoctor: string;
  } | null>({
    diagnosis: 'Có dấu hiệu sâu răng ngà nông & việm lợi nhẹ răng hàm số 6',
    riskLevel: 'Trung Bình',
    suggestedSpecialty: 'Răng Hàm Mặt - Nha Khoa Tổng Quát',
    confidence: 96.5,
    regimen: [
      'Khám lâm sàng & chụp X-Quang răng toàn panorama',
      'Làm sạch vôi răng và điều trị viêm nướu',
      'Trám ngà răng thẩm mỹ bằng Composite kỹ thuật số',
    ],
    suggestedDoctor: MOCK_DOCTORS[1].name,
  });

  const handleAnalyzeSymptom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;

    setAnalyzing(true);
    setTimeout(() => {
      setAiReport({
        diagnosis: `Đề xuất chẩn đoán dựa trên triệu chứng: "${symptomInput}"`,
        riskLevel: 'Trung Bình',
        suggestedSpecialty: 'Chuyên Khoa Răng Hàm Mặt Kỹ Thuật Cao',
        confidence: 98.2,
        regimen: [
          'Chụp phim X-Quang chẩn đoán độ sâu thương tổn',
          'Khám tư vấn trực tiếp cùng Bác sĩ Chuyên khoa II',
          'Tối ưu thời gian điều trị chỉ trong 1 buổi hẹn',
        ],
        suggestedDoctor: MOCK_DOCTORS[0].name,
      });
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-indigo-600" /> Trợ Lý Trí Tuệ Nhân Tạo AI SmartSchedule
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">AI Tư Vấn Triệu Chứng & Đề Xuất Phác Đồ</h1>
        <p className="text-xs text-slate-500">
          Nhập tình trạng sức khỏe răng miệng để AI phân tích và tự động ghép nối với bác sĩ có chuyên môn phù hợp nhất
        </p>
      </div>

      {/* Interactive Input Form */}
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-400/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Mô tả triệu chứng sức khỏe của bạn:</h3>
            <p className="text-[11px] text-slate-400">VD: Đau buốt khi uống nước lạnh, ê răng hàm dưới, chảy máu nướu...</p>
          </div>
        </div>

        <form onSubmit={handleAnalyzeSymptom} className="flex gap-2">
          <input
            type="text"
            value={symptomInput}
            onChange={(e) => setSymptomInput(e.target.value)}
            placeholder="Nhập triệu chứng tại đây (ví dụ: Răng hàm bên trái bị ê buốt khi ăn đồ ngọt)..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            type="submit"
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-1.5 shrink-0"
          >
            {analyzing ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI Đang Phân Tích...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Phân Tích AI
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Analysis Result Display */}
      {aiReport && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-md space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  ĐỘ CHÍNH XÁC AI: {aiReport.confidence}%
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{aiReport.diagnosis}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Mức độ rủi ro:</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {aiReport.riskLevel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-sky-600" /> Đề Xuất Phác Đồ Điều Trị Ban Đầu:
              </h4>
              <ul className="space-y-2">
                {aiReport.regimen.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-700 font-medium">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-4 h-4 text-teal-600" /> Bác Sĩ Chuyên Khoa Phù Hợp Nhất:
              </h4>
              <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 space-y-2">
                <p className="font-bold text-slate-800 text-sm">{aiReport.suggestedDoctor}</p>
                <p className="text-[11px] text-teal-800">{aiReport.suggestedSpecialty}</p>
                <p className="text-[10px] text-slate-500">Bác sĩ có lịch trống ca sáng 09:00 - Phù hợp phác đồ AI</p>
              </div>

              <button
                type="button"
                onClick={() => onOpenBookingWizard?.()}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Đặt Lịch Khám Theo Phác Đồ AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
