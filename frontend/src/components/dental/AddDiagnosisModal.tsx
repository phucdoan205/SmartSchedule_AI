import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { ToothCondition } from './DentalChart';
import { PlusCircle, Sparkles } from 'lucide-react';
import { toast } from '../../context/ToastContext';

interface AddDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultToothNumber?: number;
  onSave: (toothNumber: number, condition: ToothCondition, note: string) => void;
}

export const AddDiagnosisModal: React.FC<AddDiagnosisModalProps> = ({
  isOpen,
  onClose,
  defaultToothNumber = 46,
  onSave,
}) => {
  const [selectedNumber, setSelectedNumber] = useState<number>(defaultToothNumber);
  const [condition, setCondition] = useState<ToothCondition>('implant');
  const [note, setNote] = useState('Cấy trụ Straumann SLA Ø4.1x10mm - Khảo sát lành thương tốt');
  const [doctor, setDoctor] = useState('BS. CKII Lê Văn Hùng');

  const conditionOptions: { id: ToothCondition; label: string; desc: string; color: string }[] = [
    { id: 'implant', label: 'Cấy ghép Implant (Cyan)', desc: 'Chỉ định hoặc đã cấy ghép trụ Implant', color: 'bg-cyan-500' },
    { id: 'crown', label: 'Bọc răng sứ (Xanh dương)', desc: 'Phục hình răng sứ thẩm mỹ / veneer', color: 'bg-sky-500' },
    { id: 'decay', label: 'Sâu răng (Vàng)', desc: 'Phát hiện lỗ sâu bề mặt hoặc sâu ngà răng', color: 'bg-amber-400' },
    { id: 'extracted', label: 'Đã nhổ (Xám)', desc: 'Răng đã phẫu thuật nhổ / mất răng', color: 'bg-slate-500' },
    { id: 'healthy', label: 'Khỏe mạnh / Bình thường', desc: 'Răng tự nhiên bình thường', color: 'bg-emerald-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedNumber, condition, note);
    toast(`Đã lưu chẩn đoán & chỉ định cho Răng #${selectedNumber} thành công!`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm chẩn đoán & Chỉ định điều trị răng"
      subtitle="Cập nhật trực tiếp vào Sơ đồ răng điện tử (Dental EMR)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-extrabold text-slate-700">Vị trí răng (FDI / Universal)</label>
            <select
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
            >
              <optgroup label="Hàm Trên (Upper Jaw)">
                {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map((num) => (
                  <option key={num} value={num}>
                    Răng #{num}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Hàm Dưới (Lower Jaw)">
                {[48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38].map((num) => (
                  <option key={num} value={num}>
                    Răng #{num}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-extrabold text-slate-700">Bác sĩ thực hiện chẩn đoán</label>
            <input
              type="text"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Condition Selector */}
        <div className="space-y-2">
          <label className="font-extrabold text-slate-700">Tình trạng răng / Chỉ định can thiệp</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {conditionOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  condition === opt.id
                    ? 'border-sky-500 bg-sky-50/60 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="toothCondition"
                  value={opt.id}
                  checked={condition === opt.id}
                  onChange={() => setCondition(opt.id)}
                  className="mt-0.5 accent-sky-600"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-extrabold text-slate-900">
                    <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1">
          <label className="font-extrabold text-slate-700">Ghi chú lâm sàng & Kế hoạch điều trị</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden resize-none"
            placeholder="Mô tả chi tiết tổn thương, vật liệu sử dụng, kế hoạch tích hợp xương..."
          />
        </div>

        {/* AI Insight Box */}
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3 text-teal-800">
          <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
          <p className="text-[11px] font-medium leading-relaxed">
            <span className="font-bold">AI Assistant:</span> Dữ liệu răng được đồng bộ trực tiếp vào hồ sơ lâm sàng và tự động cập nhật cảnh báo tương tác thuốc cho bệnh nhân.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 font-bold text-slate-600 hover:text-slate-900 text-center"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 font-extrabold text-white hover:bg-slate-800 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Lưu chẩn đoán
          </button>
        </div>
      </form>
    </Modal>
  );
};
