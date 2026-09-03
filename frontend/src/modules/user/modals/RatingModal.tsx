import React, { useState } from 'react';
import { Star, Send, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../components/common/Modal';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  serviceName?: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  doctorName = 'TS.BS. Nguyễn Minh Anh',
  serviceName = 'Khám Răng Hàm Mặt Chuyên Sâu',
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title={submitted ? 'Cảm Ơn Đánh Giá Của Bạn!' : 'Đánh Giá Chất Lượng Dịch Vụ & Bác Sĩ'}
      subtitle={submitted ? 'Ý kiến của bạn giúp SmartSchedule AI cải thiện chất lượng phục vụ' : `${doctorName} • ${serviceName}`}
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="text-center py-2">
            <p className="font-semibold text-slate-700 mb-2">Mức độ hài lòng của bạn về ca khám:</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-amber-600 mt-1 block">
              {rating === 5 ? 'Rất tuyệt vời (5/5 ⭐)' : rating === 4 ? 'Hài lòng (4/5 ⭐)' : 'Bình thường (3/5 ⭐)'}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ý Kiến Đóng Góp / Nhận Xét (Tùy chọn):</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bác sĩ khám nhẹ nhàng, tư vấn tận tâm..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 font-semibold text-slate-600 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Gửi Đánh Giá
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-6 space-y-4 text-xs">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-bold text-slate-800 text-sm">Đã ghi nhận đánh giá thành công!</p>
          <button
            type="button"
            onClick={handleCloseModal}
            className="px-6 py-2 bg-sky-600 text-white font-bold rounded-xl text-xs"
          >
            Đóng
          </button>
        </div>
      )}
    </Modal>
  );
};
