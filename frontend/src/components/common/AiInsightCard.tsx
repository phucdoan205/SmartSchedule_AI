import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { AiInsightItem } from '../../types/admin';

interface AiInsightCardProps {
  insight: AiInsightItem;
  onApplyAction?: (insight: AiInsightItem) => void;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ insight, onApplyAction }) => {
  const getImpactBadge = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
      {/* Decorative background circle glow */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl group-hover:bg-sky-500/30 transition-all duration-300" />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 ai-glow">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              AI SmartSchedule Assist
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">{insight.title}</h4>
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getImpactBadge(insight.impactLevel)}`}>
          Ưu tiên: {insight.impactLevel}
        </span>
      </div>

      <p className="text-xs text-slate-300 mt-3 relative z-10 leading-relaxed">
        {insight.description}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between relative z-10 text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
          {insight.category}
        </span>

        <button
          type="button"
          onClick={() => onApplyAction && onApplyAction(insight)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-semibold transition-colors shadow-sm"
        >
          {insight.suggestedAction}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
