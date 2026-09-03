import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Clock, Star, FileText, Activity, Stethoscope, ChevronRight } from 'lucide-react';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { RatingModal } from './modals/RatingModal';
import { StatusBadge } from '../../components/common/StatusBadge';

export const UserProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState('TS.BS. Nguyễn Minh Anh');

  const tabs: TabItem[] = [
    { id: 'history', label: 'Lịch Sử Khám Bệnh' },
    { id: 'info', label: 'Thông Tin Cá Nhân' },
    { id: 'dental', label: 'Sơ Đồ Răng Điện Tử (EMR)' },
  ];

  const medicalHistory = [
    {
      id: 'APT-1003',
      date: '2026-09-01',
      doctor: 'TS.BS. Nguyễn Minh Anh',
      service: 'Khám Răng Hàm Mặt & Tẩy Trắng Răng Laser',
      branch: 'Cơ sở Quận 1',
      status: 'Completed',
      diagnosis: 'Thương tổn sâu ngà răng R26, đã trám hoàn tất',
      cost: 2500000,
    },
    {
      id: 'APT-0988',
      date: '2026-08-15',
      doctor: 'BS. CKII. Tran Thi Thu Huong',
      service: 'Nhổ Răng Khôn Sóng Âm Piezotome',
      branch: 'Cơ sở Thủ Đức',
      status: 'Completed',
      diagnosis: 'Nhổ răng khôn mọc lệch 45 độ R38, lành thương tốt',
      cost: 3200000,
    },
  ];

  const openRating = (docName: string) => {
    setSelectedDocName(docName);
    setIsRatingModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
          NV
        </div>

        <div className="space-y-1 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Nguyễn Văn An</h1>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Bệnh Nhân Thân Thiết (VIP)
            </span>
          </div>
          <p className="text-xs text-slate-500">Mã bệnh nhân: <strong>BN-889021</strong> • SĐT: <strong>0912.345.678</strong></p>
          <p className="text-[11px] text-slate-400">Email: nguyenvanan@gmail.com • Địa chỉ: Quận 1, TP.HCM</p>
        </div>

        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-center text-xs">
          <div>
            <p className="text-lg font-extrabold text-sky-600">8 ca</p>
            <p className="text-[10px] text-slate-400">Đã khám thành công</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-teal-600">100%</p>
            <p className="text-[10px] text-slate-400">Đúng giờ hẹn AI</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Lịch Sử Các Ca Khám & Điều Trị:</h3>

          <div className="space-y-4">
            {medicalHistory.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                      {item.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{item.service}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status as any} />
                    <button
                      type="button"
                      onClick={() => openRating(item.doctor)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Đánh Giá Ca Khám
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 text-[11px]">Bác sĩ phụ trách:</p>
                    <p className="font-bold text-slate-800 mt-0.5">{item.doctor}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Ngày khám & Cơ sở:</p>
                    <p className="font-bold text-slate-800 mt-0.5">{item.date} • {item.branch}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[11px]">Chi phí thanh toán:</p>
                    <p className="font-extrabold text-teal-600 mt-0.5">{item.cost.toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                  <strong>Chẩn đoán bác sĩ:</strong> {item.diagnosis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Chi Tiết Hồ Sơ Cá Nhân:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400">Họ và tên:</p>
              <p className="font-bold text-slate-800">Nguyễn Văn An</p>
            </div>
            <div>
              <p className="text-slate-400">Số điện thoại:</p>
              <p className="font-bold text-slate-800">0912.345.678</p>
            </div>
            <div>
              <p className="text-slate-400">Ngày sinh:</p>
              <p className="font-bold text-slate-800">15/08/1992</p>
            </div>
            <div>
              <p className="text-slate-400">Giới tính:</p>
              <p className="font-bold text-slate-800">Nam</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dental' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Sơ Đồ Răng Điện Tử (Dental EMR Chart):</h3>
          <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-3 border border-slate-200">
            <Activity className="w-10 h-10 text-sky-600 mx-auto" />
            <p className="font-bold text-slate-800">Sơ đồ răng 32 răng đã cập nhật ngày 01/09/2026</p>
            <p className="text-[11px] text-slate-500">Tất cả thông tin răng trám, nhổ & chỉnh nha đã được lưu đồng bộ trực tiếp với bác sĩ điều trị.</p>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        doctorName={selectedDocName}
      />
    </div>
  );
};
