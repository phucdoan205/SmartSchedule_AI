import React, { useState, useEffect } from 'react';
import { Clock, Search, Check, Calendar, Image as ImageIcon } from 'lucide-react';
import { servicesApi } from '../../services/api';
import { Tabs, type TabItem } from '../../components/common/Tabs';

interface UserPricingPageProps {
  onOpenBookingWizard?: (serviceId?: string) => void;
}

interface ServiceItemData {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  durationMinutes: number;
  description?: string;
  imageUrl?: string;
}

export const UserPricingPage: React.FC<UserPricingPageProps> = ({ onOpenBookingWizard }) => {
  const [services, setServices] = useState<ServiceItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await servicesApi.getAll();
        setServices(
          data.map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category?.name || 'Nha khoa',
            price: Number(item.standardPrice),
            durationMinutes: item.durationMinutes || 60,
            description: item.description,
            imageUrl: item.imageUrl,
          })),
        );
      } catch (err) {
        console.error('Lỗi khi tải bảng giá dịch vụ:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Dịch Vụ' },
    { id: 'Implant', label: 'Cấy Ghép Implant' },
    { id: 'Răng sứ', label: 'Răng Sứ Thẩm Mỹ' },
    { id: 'Tổng quát', label: 'Nha Khoa Tổng Quát' },
  ];

  const filteredServices = services.filter((s) => {
    const matchesTab = activeTab === 'all' || s.category.toLowerCase().includes(activeTab.toLowerCase());
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
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

      {/* Loading state */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Đang tải bảng giá dịch vụ thực tế từ hệ thống...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs space-y-2">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-600">Không tìm thấy dịch vụ phù hợp</p>
        </div>
      ) : (
        /* Price Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Image banner from Cloudinary */}
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {s.imageUrl ? (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                    <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                    <span>Chưa có ảnh</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 text-[10px] font-bold text-teal-800 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-teal-200 shadow-2xs">
                  {s.code}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">{s.category}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.durationMinutes} phút
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{s.name}</h3>
                  {s.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{s.description}</p>
                  )}

                  <ul className="space-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500" /> Bác sĩ chuyên khoa trực tiếp khám
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500" /> Tự động xếp lịch ưu tiên AI
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500" /> Bao gồm vật tư y tế vô trùng
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-400 font-medium">Giá niêm yết:</span>
                    <span className="text-lg font-extrabold text-teal-600">
                      {s.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBookingWizard?.(s.id)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" /> Đặt Lịch Ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
