import React, { useState, useEffect } from 'react';
import {
  X,
  Stethoscope,
  Check,
  Loader2,
  Building,
} from 'lucide-react';
import { staffApi } from '../../../services/api';
import { toast } from '../../../context/ToastContext';

interface ChangeDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  branchId?: string;
  branchName?: string;
  onConfirmChange?: (newDoctorName: string, doctorId?: string) => void;
}

export const ChangeDoctorModal: React.FC<ChangeDoctorModalProps> = ({
  isOpen,
  onClose,
  room,
  branchId,
  branchName = 'Chi nhánh hiện tại',
  onConfirmChange,
}) => {
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [handoverNote, setHandoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    staffApi
      .getDoctors(branchId && branchId !== 'ALL' ? { branchId } : undefined)
      .then((docs) => {
        if (Array.isArray(docs) && docs.length > 0) {
          const formatted = docs.map((d: any) => ({
            id: d.id,
            name: d.fullName || d.user?.name || d.name || 'Bác sĩ',
            specialty: d.specialty || d.doctorProfile?.specialty || 'Chuyên khoa Răng Hàm Mặt',
            avatar: d.avatar || d.avatarUrl || d.user?.avatarUrl,
            code: d.code || d.employeeCode || '',
          }));
          setDoctorsList(formatted);

          // Find first doctor that is NOT the current room doctor
          const otherDoc = formatted.find((d) => d.name !== room?.doctorName);
          if (otherDoc) {
            setSelectedDoctorId(otherDoc.id);
          } else if (formatted.length > 0) {
            setSelectedDoctorId(formatted[0].id);
          }
        } else {
          setDoctorsList([]);
          setSelectedDoctorId('');
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải bác sĩ chi nhánh:', err);
        setDoctorsList([]);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, branchId, room?.doctorName]);

  if (!isOpen || !room) return null;

  const currentDoctorName = room.doctorName || 'Chưa phân công bác sĩ';
  const currentDoctorObj = doctorsList.find((d) => d.name === room.doctorName);
  const newDoctor = doctorsList.find((d) => d.id === selectedDoctorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor) return;

    setIsSubmitting(true);
    const docName = newDoctor.name;
    if (onConfirmChange) {
      onConfirmChange(docName, newDoctor.id);
    }
    toast(`Đã thay đổi bác sĩ phụ trách ${room.name} thành ${docName}!`, 'success');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-scaleUp my-auto border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">
              Thay Đổi Bác Sĩ Phụ Trách Phòng Khám
            </h3>
            <p className="text-xs text-slate-500">
              Cập nhật phân công bác sĩ điều trị chính cho{' '}
              <strong className="text-slate-700">{room.name}</strong> - {room.floor} ({branchName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Thông tin Bác sĩ hiện tại */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm shrink-0">
                <Stethoscope className="w-5 h-5 text-sky-700" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  BÁC SĨ HIỆN TẠI PHỤ TRÁCH
                </span>
                <h4 className="font-extrabold text-slate-900 text-xs mt-0.5">
                  {currentDoctorName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {currentDoctorObj?.specialty || (room.doctorName ? 'Bác sĩ chuyên khoa tại cơ sở' : 'Phòng khám chưa có bác sĩ thường trực')}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shrink-0">
              {branchName}
            </span>
          </div>

          {/* Chọn Bác sĩ phụ trách mới (Lọc đúng danh sách bác sĩ thuộc chi nhánh) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-600" /> Chọn bác sĩ phụ trách mới
              </label>
              <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                Bác sĩ thuộc chi nhánh ({doctorsList.length})
              </span>
            </div>

            {isLoading ? (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span>Đang tải danh sách bác sĩ tại cơ sở...</span>
              </div>
            ) : doctorsList.length > 0 ? (
              <div className="p-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-3 shadow-2xs">
                {newDoctor?.avatar ? (
                  <img
                    src={newDoctor.avatar}
                    alt={newDoctor.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {(newDoctor?.name || 'BS').charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer text-xs"
                  >
                    {doctorsList.map((doc) => {
                      const isCurrent = doc.name === room.doctorName;
                      return (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} - {doc.specialty} {isCurrent ? '(Hiện tại)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {newDoctor?.specialty || 'Chuyên khoa Răng Hàm Mặt'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 text-[11px] font-semibold">
                Chi nhánh này hiện chưa có bác sĩ nào khác được phân bổ.
              </div>
            )}
          </div>

          {/* Ghi chú bàn giao (Tùy chọn) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ghi chú phân công / bàn giao (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={handoverNote}
              onChange={(e) => setHandoverNote(e.target.value)}
              placeholder="Nhập lý do đổi bác sĩ (ví dụ: Thay ca trực, tăng cường chuyên môn cấy ghép, đổi lịch khám...)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-sky-500 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedDoctorId || doctorsList.length === 0}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>XÁC NHẬN ĐỔI BÁC SĨ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
