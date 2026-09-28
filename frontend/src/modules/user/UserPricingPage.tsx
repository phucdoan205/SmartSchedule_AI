import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Search, Check, Calendar, Image as ImageIcon } from 'lucide-react';
import { servicesApi } from '../../services/api';
import { Tabs, type TabItem } from '../../components/common/Tabs';
import { MOCK_SERVICES } from '../../services/mockData';

interface UserPricingPageProps {
  onOpenBookingWizard?: (serviceId?: string) => void;
}

interface ServiceItemData {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  deposit?: number;
  warranty?: string;
  durationMinutes: number;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export const UserPricingPage: React.FC<UserPricingPageProps> = ({ onOpenBookingWizard }) => {
  const [services, setServices] = useState<ServiceItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await servicesApi.getAll({ isActive: true });
      if (Array.isArray(data) && data.length > 0) {
        const activeOnly = data
          .filter((item: any) => item.isActive !== false)
          .map((item: any) => ({
            id: item.id,
            code: item.code,
            name: item.name,
            category: item.category?.name || 'Nha khoa',
            price: Number(item.standardPrice),
            deposit: item.deposit ? Number(item.deposit) : undefined,
            warranty: item.warranty || undefined,
            durationMinutes: item.durationMinutes || 60,
            description: item.description,
            imageUrl: item.imageUrl,
            isActive: item.isActive !== false,
          }));
        setServices(activeOnly);
      } else {
        // Fallback to mock data (active items only)
        const activeMocks = MOCK_SERVICES.filter((m) => m.isActive !== false).map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          category: m.category,
          price: m.price,
          deposit: m.deposit,
          warranty: m.warranty,
          durationMinutes: m.durationMinutes,
          description: m.description,
          imageUrl: m.imageUrl,
          isActive: true,
        }));
        setServices(activeMocks);
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng giá dịch vụ:', err);
      const activeMocks = MOCK_SERVICES.filter((m) => m.isActive !== false).map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        category: m.category,
        price: m.price,
        deposit: m.deposit,
        warranty: m.warranty,
        durationMinutes: m.durationMinutes,
        description: m.description,
        imageUrl: m.imageUrl,
        isActive: true,
      }));
      setServices(activeMocks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();

    const handleSync = () => {
      fetchServices();
    };
    window.addEventListener('services_updated', handleSync);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'SERVICES_UPDATED') {
          fetchServices();
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('services_updated', handleSync);
      if (channel) channel.close();
    };
  }, [fetchServices]);

  const tabs: TabItem[] = [
    { id: 'all', label: 'Tất Cả Dịch Vụ' },
    { id: 'Cấy ghép Implant đơn lẻ', label: 'Implant Đơn Lẻ' },
    { id: 'Cấy ghép Implant toàn hàm', label: 'Implant All-on-4 / All-on-6' },
    { id: 'Răng sứ thẩm mỹ', label: 'Răng Sứ Thẩm Mỹ' },
    { id: 'Chỉnh nha & Niềng răng', label: 'Chỉnh Nha & Niềng Răng' },
    { id: 'Mini hàm tháo lắp', label: 'Mini Hàm Tháo Lắp' },
    { id: 'Thủ thuật đi kèm', label: 'Thủ Thuật Đi Kèm' },
    { id: 'Nha khoa thẩm mỹ & Tổng quát', label: 'Nha Khoa Tổng Quát' },
  ];

  const filteredServices = services.filter((s) => {
    const matchesTab = activeTab === 'all' || s.category.toLowerCase().includes(activeTab.toLowerCase());
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          MINH BẠCH BẢNG GIÁ 100%
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Bảng Giá Dịch Vụ Niêm Yết</h1>
        <p className="text-xs text-slate-500">
          Cam kết không phát sinh chi phí phụ ngoài bảng giá đã được niêm yết công khai tại các cơ sở
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
            placeholder="Tìm tên gói khám hoặc mã kỹ thuật (DV-IMP-01)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:outline-none focus:border-teal-500 transition-colors"
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
          <span className="text-3xl">🦷</span>
          <p className="font-bold text-slate-700">Chưa có dịch vụ nào trong phân khúc này</p>
          <p className="text-slate-400">Vui lòng chọn danh mục khác hoặc tìm kiếm từ khóa</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Thumbnail: Image or Dental Icon Box */}
              <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {s.imageUrl && s.imageUrl.trim() !== '' ? (
                  <img
                    src={s.imageUrl}
                    alt={s.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-3xl mb-1 shadow-2xs">
                      🦷
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{s.category}</span>
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
                      <Check className="w-3.5 h-3.5 text-teal-500" /> Bác sĩ chuyên khoa trực tiếp khám &amp; điều trị
                    </li>
                    {s.warranty && (
                      <li className="flex items-center gap-1.5 font-semibold text-teal-700">
                        <Check className="w-3.5 h-3.5 text-teal-500" /> Bảo hành: {s.warranty}
                      </li>
                    )}
                    <li className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-500" /> Đạt chuẩn vô trùng y tế phòng mổ
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
