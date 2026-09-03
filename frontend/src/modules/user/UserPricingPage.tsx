import React, { useState } from 'react';
import { Clock, Search, Check, Shield, Calendar, ArrowRight } from 'lucide-react';
import { MOCK_SERVICES } from '../../services/mockData';
import { Tabs, type TabItem } from '../../components/common/Tabs';

interface UserPricingPageProps {
  onOpenBookingWizard?: (serviceId?: string) => void;
}

export const UserPricingPage: React.FC<UserPricingPageProps> = ({ onOpenBookingWizard }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Gói Khám' },
    { id: 'Nha Khoa', label: 'Nha Khoa Răng Hàm Mặt' },
    { id: 'Khoa Nội', label: 'Nội Tim Mạch & Tổng Quát' },
    { id: 'Chẩn Đán Hình Ảnh', label: 'Chẩn Đoán Hình Ảnh (X-Quang/Doppler)' },
  ];

  const filteredServices = MOCK_SERVICES.filter((s) => {
    const matchesTab = activeTab === 'all' || s.category.includes(activeTab);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          MINH BẠCH BẢNG GIÁ
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Bảng Giá Dịch Vụ Niêm Yết</h1>
        <p className="text-xs text-slate-500">
          Cam kết không phát sinh chi phí phụ ngoài bảng giá đã được niêm yết công khai
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên gói khám hoặc mã dịch vụ..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none"
          />
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Price Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                  {s.code}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.durationMinutes} phút
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
              <p className="text-xs text-slate-500">Chuyên khoa: {s.category}</p>

              <ul className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Bác sĩ chuyên khoa trực tiếp khám</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Tự động xếp lịch ưu tiên AI</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Bao gồm vật tư y tế vô trùng</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Giá niêm yết:</span>
                <span className="text-lg font-extrabold text-teal-600">{s.price.toLocaleString('vi-VN')} VNĐ</span>
              </div>

              <button
                type="button"
                onClick={() => onOpenBookingWizard?.(s.id)}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" /> Đặt Lịch Ngay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
