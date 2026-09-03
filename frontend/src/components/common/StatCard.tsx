import React from 'react';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isIncrease?: boolean;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  change,
  isIncrease = true,
  icon: Icon,
  iconBgColor = 'bg-sky-50',
  iconTextColor = 'text-sky-600',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3.5 rounded-xl ${iconBgColor} ${iconTextColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(change || subtext) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                isIncrease
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isIncrease ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {change}
            </span>
          )}
          {subtext && <span className="text-slate-400 font-medium">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
