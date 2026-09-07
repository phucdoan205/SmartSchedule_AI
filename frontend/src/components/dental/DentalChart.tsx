import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export type ToothCondition = 'healthy' | 'implant' | 'crown' | 'decay' | 'extracted';

export interface ToothInfo {
  number: number;
  jaw: 'upper' | 'lower';
  side: 'right' | 'left';
  type: 'molar' | 'premolar' | 'canine' | 'incisor';
  nameVi: string;
  condition: ToothCondition;
  conditionNote?: string;
  date?: string;
  doctor?: string;
}

// Initial state matching design mock (Image 2)
export const DEFAULT_TEETH_DATA: Record<number, ToothInfo> = {
  // Upper Right (18 - 11)
  18: { number: 18, jaw: 'upper', side: 'right', type: 'molar', nameVi: 'Răng khôn hàm trên phải', condition: 'healthy' },
  17: { number: 17, jaw: 'upper', side: 'right', type: 'molar', nameVi: 'Răng hàm lớn 2 hàm trên phải', condition: 'healthy' },
  16: { number: 16, jaw: 'upper', side: 'right', type: 'molar', nameVi: 'Răng hàm lớn 1 hàm trên phải', condition: 'healthy' },
  15: { number: 15, jaw: 'upper', side: 'right', type: 'premolar', nameVi: 'Răng hàm nhỏ 2 hàm trên phải', condition: 'healthy' },
  14: { number: 14, jaw: 'upper', side: 'right', type: 'premolar', nameVi: 'Răng hàm nhỏ 1 hàm trên phải', condition: 'healthy' },
  13: { number: 13, jaw: 'upper', side: 'right', type: 'canine', nameVi: 'Răng nanh hàm trên phải', condition: 'healthy' },
  12: { number: 12, jaw: 'upper', side: 'right', type: 'incisor', nameVi: 'Răng cửa bên hàm trên phải', condition: 'healthy' },
  11: {
    number: 11,
    jaw: 'upper',
    side: 'right',
    type: 'incisor',
    nameVi: 'Răng cửa giữa hàm trên phải',
    condition: 'crown',
    conditionNote: 'Bọc răng toàn sứ Cercon HT - Khớp cắn chuẩn',
    date: '10/08/2026',
    doctor: 'BS. CKII Lê Văn Hùng',
  },

  // Upper Left (21 - 28)
  21: {
    number: 21,
    jaw: 'upper',
    side: 'left',
    type: 'incisor',
    nameVi: 'Răng cửa giữa hàm trên trái',
    condition: 'crown',
    conditionNote: 'Bọc răng toàn sứ Cercon HT - Khớp cắn chuẩn',
    date: '10/08/2026',
    doctor: 'BS. CKII Lê Văn Hùng',
  },
  22: { number: 22, jaw: 'upper', side: 'left', type: 'incisor', nameVi: 'Răng cửa bên hàm trên trái', condition: 'healthy' },
  23: { number: 23, jaw: 'upper', side: 'left', type: 'canine', nameVi: 'Răng nanh hàm trên trái', condition: 'healthy' },
  24: { number: 24, jaw: 'upper', side: 'left', type: 'premolar', nameVi: 'Răng hàm nhỏ 1 hàm trên trái', condition: 'healthy' },
  25: { number: 25, jaw: 'upper', side: 'left', type: 'premolar', nameVi: 'Răng hàm nhỏ 2 hàm trên trái', condition: 'healthy' },
  26: { number: 26, jaw: 'upper', side: 'left', type: 'molar', nameVi: 'Răng hàm lớn 1 hàm trên trái', condition: 'healthy' },
  27: { number: 27, jaw: 'upper', side: 'left', type: 'molar', nameVi: 'Răng hàm lớn 2 hàm trên trái', condition: 'healthy' },
  28: { number: 28, jaw: 'upper', side: 'left', type: 'molar', nameVi: 'Răng khôn hàm trên trái', condition: 'healthy' },

  // Lower Right (48 - 41)
  48: { number: 48, jaw: 'lower', side: 'right', type: 'molar', nameVi: 'Răng khôn hàm dưới phải', condition: 'healthy' },
  47: { number: 47, jaw: 'lower', side: 'right', type: 'molar', nameVi: 'Răng hàm lớn 2 hàm dưới phải', condition: 'healthy' },
  46: {
    number: 46,
    jaw: 'lower',
    side: 'right',
    type: 'molar',
    nameVi: 'Răng hàm lớn 1 hàm dưới phải',
    condition: 'implant',
    conditionNote: 'Cấy 1 trụ Straumann SLA Ø4.1x10mm - Đang tích hợp xương tốt',
    date: '15/10/2026',
    doctor: 'BS. CKII Lê Văn Hùng',
  },
  45: { number: 45, jaw: 'lower', side: 'right', type: 'premolar', nameVi: 'Răng hàm nhỏ 2 hàm dưới phải', condition: 'healthy' },
  44: { number: 44, jaw: 'lower', side: 'right', type: 'premolar', nameVi: 'Răng hàm nhỏ 1 hàm dưới phải', condition: 'healthy' },
  43: { number: 43, jaw: 'lower', side: 'right', type: 'canine', nameVi: 'Răng nanh hàm dưới phải', condition: 'healthy' },
  42: { number: 42, jaw: 'lower', side: 'right', type: 'incisor', nameVi: 'Răng cửa bên hàm dưới phải', condition: 'healthy' },
  41: { number: 41, jaw: 'lower', side: 'right', type: 'incisor', nameVi: 'Răng cửa giữa hàm dưới phải', condition: 'healthy' },

  // Lower Left (31 - 38)
  31: { number: 31, jaw: 'lower', side: 'left', type: 'incisor', nameVi: 'Răng cửa giữa hàm dưới trái', condition: 'healthy' },
  32: { number: 32, jaw: 'lower', side: 'left', type: 'incisor', nameVi: 'Răng cửa bên hàm dưới trái', condition: 'healthy' },
  33: { number: 33, jaw: 'lower', side: 'left', type: 'canine', nameVi: 'Răng nanh hàm dưới trái', condition: 'healthy' },
  34: { number: 34, jaw: 'lower', side: 'left', type: 'premolar', nameVi: 'Răng hàm nhỏ 1 hàm dưới trái', condition: 'healthy' },
  35: { number: 35, jaw: 'lower', side: 'left', type: 'premolar', nameVi: 'Răng hàm nhỏ 2 hàm dưới trái', condition: 'healthy' },
  36: { number: 36, jaw: 'lower', side: 'left', type: 'molar', nameVi: 'Răng hàm lớn 1 hàm dưới trái', condition: 'healthy' },
  37: { number: 37, jaw: 'lower', side: 'left', type: 'molar', nameVi: 'Răng hàm lớn 2 hàm dưới trái', condition: 'healthy' },
  38: {
    number: 38,
    jaw: 'lower',
    side: 'left',
    type: 'molar',
    nameVi: 'Răng khôn hàm dưới trái',
    condition: 'extracted',
    conditionNote: 'Đã nhổ tiểu phẫu do mọc lệch ngầm 90 độ',
    date: '02/09/2026',
    doctor: 'BS. Nguyễn Minh Anh',
  },
};

interface DentalChartProps {
  onAddDiagnosis?: (toothNumber?: number) => void;
  patientName?: string;
  patientId?: string;
}

export const DentalChart: React.FC<DentalChartProps> = ({
  onAddDiagnosis,
  patientName = 'Nguyễn Văn An',
  patientId = 'BN-2026-104',
}) => {
  const [teeth, setTeeth] = useState<Record<number, ToothInfo>>(DEFAULT_TEETH_DATA);
  const [selectedTooth, setSelectedTooth] = useState<ToothInfo>(DEFAULT_TEETH_DATA[46]);

  const handleUpdateCondition = (toothNumber: number, newCond: ToothCondition) => {
    setTeeth((prev) => {
      const target = prev[toothNumber];
      if (!target) return prev;
      const updated = {
        ...target,
        condition: newCond,
        conditionNote:
          newCond === 'healthy'
            ? 'Răng khỏe mạnh bình thường'
            : newCond === 'implant'
            ? 'Cấy ghép trụ Implant - Đang tích hợp xương'
            : newCond === 'crown'
            ? 'Bọc răng toàn sứ Cercon HT thẩm mỹ'
            : newCond === 'decay'
            ? 'Phát hiện lỗ sâu ngà răng, chỉ định trám composite'
            : 'Đã phẫu thuật nhổ an toàn',
      };
      setSelectedTooth(updated);
      return { ...prev, [toothNumber]: updated };
    });
  };

  // Tooth layout definition according to FDI / Universal system
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const getConditionColor = (cond: ToothCondition) => {
    switch (cond) {
      case 'implant':
        return {
          badge: 'bg-rose-500 text-white border-rose-600',
          fill: '#ecfeff',
          stroke: '#06b6d4',
          rootFill: '#0891b2',
          text: 'Cyan (Implant)',
          pillClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'crown':
        return {
          badge: 'bg-sky-100 text-sky-700 border-sky-300',
          fill: '#eff6ff',
          stroke: '#3b82f6',
          rootFill: '#60a5fa',
          text: 'Xanh dương (Răng sứ)',
          pillClass: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'decay':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          fill: '#fefce8',
          stroke: '#f59e0b',
          rootFill: '#fbbf24',
          text: 'Vàng (Sâu răng)',
          pillClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'extracted':
        return {
          badge: 'bg-slate-700 text-white border-slate-800',
          fill: '#f1f5f9',
          stroke: '#94a3b8',
          rootFill: '#cbd5e1',
          text: 'Xám (Đã nhổ)',
          pillClass: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      default:
        return {
          badge: 'bg-white text-slate-700 border-slate-200',
          fill: '#ffffff',
          stroke: '#cbd5e1',
          rootFill: '#f1f5f9',
          text: 'Bình thường',
          pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
    }
  };

  // Render anatomical tooth SVG
  const renderToothGraphic = (tooth: ToothInfo) => {
    const isUpper = tooth.jaw === 'upper';
    const isSelected = selectedTooth?.number === tooth.number;
    const styleInfo = getConditionColor(tooth.condition);

    // Anatomical dimensions based on tooth type
    let rootPath = '';
    let crownPath = '';
    let rootScrew = null;

    if (isUpper) {
      // Roots point UP, crown points DOWN
      if (tooth.type === 'molar') {
        // 3 roots for upper molars
        rootPath = 'M 6,32 C 6,12 8,2 10,2 C 12,2 13,14 14,24 C 15,14 16,2 18,2 C 20,2 22,12 22,32 Z';
        crownPath = 'M 4,32 C 3,42 5,50 14,50 C 23,50 25,42 24,32 Z';
      } else if (tooth.type === 'premolar') {
        // 2 roots
        rootPath = 'M 7,32 C 7,16 9,4 12,4 C 15,4 16,16 16,32 C 16,16 18,4 20,4 C 22,4 22,18 21,32 Z';
        crownPath = 'M 5,32 C 4,42 6,48 14,48 C 22,48 24,42 23,32 Z';
      } else if (tooth.type === 'canine') {
        // Single long root, pointed crown
        rootPath = 'M 8,30 C 8,14 13,2 14,2 C 15,2 20,14 20,30 Z';
        crownPath = 'M 6,30 C 5,40 10,50 14,52 C 18,50 23,40 22,30 Z';
      } else {
        // Incisor: flat root, spade crown
        rootPath = 'M 9,30 C 9,14 13,4 14,4 C 15,4 19,14 19,30 Z';
        crownPath = 'M 5,30 C 5,42 6,48 14,48 C 22,48 23,42 23,30 Z';
      }
    } else {
      // Lower jaw: crown points UP, roots point DOWN
      if (tooth.type === 'molar') {
        // 2 roots for lower molars
        crownPath = 'M 4,20 C 3,10 5,2 14,2 C 23,2 25,10 24,20 Z';
        rootPath = 'M 6,20 C 6,38 9,50 11,50 C 13,50 13,36 14,26 C 15,36 15,50 17,50 C 19,50 22,38 22,20 Z';
      } else if (tooth.type === 'premolar') {
        crownPath = 'M 5,20 C 4,10 6,4 14,4 C 22,4 24,10 23,20 Z';
        rootPath = 'M 8,20 C 8,36 12,48 14,48 C 16,48 20,36 20,20 Z';
      } else if (tooth.type === 'canine') {
        crownPath = 'M 6,22 C 5,12 10,2 14,0 C 18,2 23,12 22,22 Z';
        rootPath = 'M 8,22 C 8,38 13,50 14,50 C 15,50 20,38 20,22 Z';
      } else {
        crownPath = 'M 6,22 C 6,10 7,4 14,4 C 21,4 22,10 22,22 Z';
        rootPath = 'M 9,22 C 9,38 13,48 14,48 C 15,48 19,38 19,22 Z';
      }
    }

    // Special implant titanium screw rendering on root for #46
    if (tooth.condition === 'implant') {
      rootScrew = (
        <g stroke="#0891b2" strokeWidth="1.2">
          <line x1="9" y1="28" x2="19" y2="28" />
          <line x1="9" y1="33" x2="19" y2="33" />
          <line x1="10" y1="38" x2="18" y2="38" />
          <line x1="11" y1="43" x2="17" y2="43" />
        </g>
      );
    }

    return (
      <button
        key={tooth.number}
        type="button"
        onClick={() => setSelectedTooth(tooth)}
        className={`group relative flex flex-col items-center justify-between p-0.5 sm:p-1 rounded-xl transition-all duration-150 flex-1 min-w-0 max-w-10 ${
          isSelected
            ? 'ring-2 ring-sky-500 bg-sky-50/50 shadow-sm scale-105 z-10'
            : 'hover:bg-slate-50 hover:scale-105'
        }`}
        title={`Răng ${tooth.number}: ${tooth.nameVi}`}
      >
        {/* Label for Upper jaw teeth: above graphic */}
        {isUpper && (
          <div className="mb-1 flex items-center justify-center min-h-6">
            {tooth.number === 11 || tooth.number === 21 ? (
              <span className="inline-flex h-5 min-w-5 sm:h-6 sm:min-w-6 items-center justify-center rounded-md border border-sky-400 bg-sky-100 px-1 text-[10px] sm:text-[11px] font-black text-sky-800 shadow-sm">
                {tooth.number}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                {tooth.number}
              </span>
            )}
          </div>
        )}

        {/* Anatomical SVG */}
        <div className="relative h-12 sm:h-14 w-6 sm:w-7 flex items-center justify-center">
          <svg viewBox="0 0 28 54" className="h-full w-full overflow-visible drop-shadow-xs">
            {/* Root */}
            <path
              d={rootPath}
              fill={tooth.condition === 'extracted' ? '#f1f5f9' : styleInfo.fill}
              stroke={tooth.condition === 'extracted' ? '#cbd5e1' : styleInfo.stroke}
              strokeWidth="1.4"
              strokeDasharray={tooth.condition === 'extracted' ? '2 2' : 'none'}
            />
            {rootScrew}

            {/* Crown */}
            <path
              d={crownPath}
              fill={
                tooth.condition === 'crown'
                  ? '#bae6fd'
                  : tooth.condition === 'implant'
                  ? '#a5f3fc'
                  : tooth.condition === 'decay'
                  ? '#fde68a'
                  : tooth.condition === 'extracted'
                  ? '#e2e8f0'
                  : '#ffffff'
              }
              stroke={styleInfo.stroke}
              strokeWidth="1.6"
              strokeDasharray={tooth.condition === 'extracted' ? '2 2' : 'none'}
            />

            {/* Occlusal fissure lines on molars */}
            {(tooth.type === 'molar' || tooth.type === 'premolar') && tooth.condition !== 'extracted' && (
              <path
                d={isUpper ? 'M 10,40 Q 14,44 18,40 M 14,35 L 14,45' : 'M 10,12 Q 14,8 18,12 M 14,7 L 14,17'}
                fill="none"
                stroke={tooth.condition === 'decay' ? '#b45309' : '#cbd5e1'}
                strokeWidth="1"
              />
            )}

            {/* Extracted Cross Marker */}
            {tooth.condition === 'extracted' && (
              <g stroke="#64748b" strokeWidth="2">
                <line x1="6" y1="12" x2="22" y2="42" />
                <line x1="22" y1="12" x2="6" y2="42" />
              </g>
            )}
          </svg>
        </div>

        {/* Label for Lower jaw teeth: below graphic */}
        {!isUpper && (
          <div className="mt-1 flex items-center justify-center min-h-6">
            {tooth.number === 46 ? (
              <span className="inline-flex h-5 min-w-5 sm:h-6 sm:min-w-6 items-center justify-center rounded-md border border-rose-600 bg-rose-500 px-1 text-[10px] sm:text-[11px] font-black text-white shadow-sm">
                46
              </span>
            ) : tooth.number === 38 ? (
              <span className="inline-flex h-5 min-w-5 sm:h-6 sm:min-w-6 items-center justify-center rounded-md border border-slate-700 bg-slate-700 px-1 text-[10px] sm:text-[11px] font-black text-white shadow-sm">
                38
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                {tooth.number}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Top Card Title & Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Sơ đồ răng giải phẫu 32 răng
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            Universal Numbering System & FDI Notation
          </p>
        </div>

        <button
          type="button"
          onClick={() => onAddDiagnosis && onAddDiagnosis(selectedTooth?.number)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-slate-600" /> Thêm chẩn đoán
        </button>
      </div>

      {/* Main Dental Chart Frame */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/40 p-3 sm:p-5 select-none relative overflow-hidden">
        {/* Subtle Watermark Record Title */}
        <div className="text-center pb-2">
          <p className="text-[11px] font-semibold text-slate-400">
            Sơ đồ răng & Phim X-quang • {patientName} ({patientId})
          </p>
        </div>

        {/* HÀM TRÊN LABEL */}
        <div className="text-center my-1.5">
          <span className="text-xs font-black tracking-widest text-slate-700 uppercase bg-slate-100/80 px-4 py-1 rounded-full border border-slate-200/60">
            HÀM TRÊN
          </span>
        </div>

        {/* UPPER ARCH (18..11 | 21..28) */}
        <div className="my-2 overflow-x-auto py-1">
          <div className="flex items-center justify-between gap-0.5 sm:gap-1.5 w-full min-w-[540px]">
            {/* Quadrant 1 (Right): 18 down to 11 */}
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 flex-1">
              {upperRight.map((num) => renderToothGraphic(teeth[num]))}
            </div>

            {/* Center Midline Divider */}
            <div className="h-14 w-px bg-slate-300 mx-1 opacity-70 shrink-0" />

            {/* Quadrant 2 (Left): 21 up to 28 */}
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 flex-1">
              {upperLeft.map((num) => renderToothGraphic(teeth[num]))}
            </div>
          </div>
        </div>

        {/* CENTER HORIZONTAL ARCH DIVIDER */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="w-full border-t border-dashed border-slate-300" />
          <span className="absolute bg-white px-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Đường cắn khớp trung tâm (Bite Plane)
          </span>
        </div>

        {/* LOWER ARCH (48..41 | 31..38) */}
        <div className="my-2 overflow-x-auto py-1">
          <div className="flex items-center justify-between gap-0.5 sm:gap-1.5 w-full min-w-[540px]">
            {/* Quadrant 4 (Right): 48 down to 41 */}
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 flex-1">
              {lowerRight.map((num) => renderToothGraphic(teeth[num]))}
            </div>

            {/* Center Midline Divider */}
            <div className="h-14 w-px bg-slate-300 mx-1 opacity-70 shrink-0" />

            {/* Quadrant 3 (Left): 31 up to 38 */}
            <div className="flex items-center justify-between gap-0.5 sm:gap-1 flex-1">
              {lowerLeft.map((num) => renderToothGraphic(teeth[num]))}
            </div>
          </div>
        </div>

        {/* HÀM DƯỚI LABEL */}
        <div className="text-center my-1.5">
          <span className="text-xs font-black tracking-widest text-slate-700 uppercase bg-slate-100/80 px-4 py-1 rounded-full border border-slate-200/60">
            HÀM DƯỚI
          </span>
        </div>
      </div>

      {/* COLOR LEGEND BAR */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-bold text-slate-600 border-t border-slate-100">
        <div className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-cyan-400 ring-2 ring-cyan-100" />
          <span>Cyan (Implant)</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-sky-500 ring-2 ring-sky-100" />
          <span>Xanh dương (Răng sứ)</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-amber-400 ring-2 ring-amber-100" />
          <span>Vàng (Sâu răng)</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-slate-400 ring-2 ring-slate-100" />
          <span>Xám (Đã nhổ)</span>
        </div>
      </div>

      {/* SELECTED TOOTH CLINICAL DETAIL CARD */}
      {selectedTooth && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                  #{selectedTooth.number}
                </span>
                <h4 className="text-xs font-black text-slate-900">{selectedTooth.nameVi}</h4>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${
                    getConditionColor(selectedTooth.condition).pillClass
                  }`}
                >
                  {getConditionColor(selectedTooth.condition).text}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600">
                {selectedTooth.conditionNote || 'Răng khỏe mạnh, không phát hiện sâu hay tổn thương tủy.'}
              </p>

              {/* Quick condition selector */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span className="text-[10px] font-bold text-slate-400">Đổi trạng thái:</span>
                <button
                  type="button"
                  onClick={() => handleUpdateCondition(selectedTooth.number, 'implant')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    selectedTooth.condition === 'implant' ? 'bg-cyan-500 text-white border-cyan-600' : 'bg-white text-slate-600 hover:bg-cyan-50'
                  }`}
                >
                  Implant
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCondition(selectedTooth.number, 'crown')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    selectedTooth.condition === 'crown' ? 'bg-sky-500 text-white border-sky-600' : 'bg-white text-slate-600 hover:bg-sky-50'
                  }`}
                >
                  Răng sứ
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCondition(selectedTooth.number, 'decay')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    selectedTooth.condition === 'decay' ? 'bg-amber-400 text-slate-900 border-amber-500' : 'bg-white text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  Sâu răng
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCondition(selectedTooth.number, 'extracted')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    selectedTooth.condition === 'extracted' ? 'bg-slate-700 text-white border-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Đã nhổ
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCondition(selectedTooth.number, 'healthy')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold border transition-colors ${
                    selectedTooth.condition === 'healthy' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-white text-slate-600 hover:bg-emerald-50'
                  }`}
                >
                  Bình thường
                </button>
              </div>
            </div>

            {selectedTooth.doctor && (
              <div className="text-right text-[11px] text-slate-500 shrink-0">
                <p className="font-bold text-slate-700">{selectedTooth.doctor}</p>
                <p>{selectedTooth.date}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
