import React from 'react';
import { Sparkles, Cpu, CheckCircle2, Zap, RefreshCw } from 'lucide-react';
import { MOCK_AI_INSIGHTS } from '../../services/mockData';
import { AiInsightCard } from '../../components/common/AiInsightCard';

export const AiInsightsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 ai-glow" /> AI SmartSchedule Insights & Optimization Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">Trung tâm trí tuệ nhân tạo dự báo lưu lượng bệnh nhân và tự động phân ca trực</p>
        </div>

        <button type="button" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> Phân tích lại toàn hệ thống
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MOCK_AI_INSIGHTS.map((item) => (
          <AiInsightCard key={item.id} insight={item} />
        ))}
      </div>
    </div>
  );
};
