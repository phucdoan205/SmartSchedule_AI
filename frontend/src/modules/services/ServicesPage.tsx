import React, { useState, useEffect } from 'react';
import {
  Plus,
  Shield,
  CreditCard,
  Sparkles,
  Search,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { AddServiceModal } from './AddServiceModal';
import { servicesApi } from '../../services/api';

interface DetailedServiceItem {
  id: string;
  code?: string;
  name: string;
  category: string;
  categoryId?: string;
  price: number;
  deposit?: number;
  warranty?: string;
  durationMinutes: number;
  doctors: string[];
  isActive: boolean;
  aiRecommended?: boolean;
  imageUrl?: string;
  description?: string;
}

export const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<DetailedServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await servicesApi.getAll();
      const mapped: DetailedServiceItem[] = data.map((item: any) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category?.name || 'Nha khoa',
        categoryId: item.categoryId,
        price: Number(item.standardPrice),
        deposit: item.deposit ? Number(item.deposit) : undefined,
        warranty: item.warranty || undefined,
        durationMinutes: item.durationMinutes || 60,
        doctors: ['BS. Nguyễn Thị An', 'TS.BS. Nguyễn Minh Anh'],
        isActive: item.isActive,
        aiRecommended: item.isAiRecommended,
        imageUrl: item.imageUrl,
        description: item.description,
      }));
      setServices(mapped);
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Cấy ghép Implant', label: 'Cấy ghép Implant' },
    { id: 'Răng sứ thẩm mỹ', label: 'Răng sứ thẩm mỹ' },
    { id: 'Nha khoa thẩm mỹ & Tổng quát', label: 'Nha khoa tổng quát' },
    { id: 'Mini hàm tháo lắp', label: 'Mini hàm tháo lắp' },
    { id: 'Thủ thuật đi kèm', label: 'Thủ thuật đi kèm' },
  ];

  const handleToggleActive = async (id: string) => {
    const current = services.find((s) => s.id === id);
    if (!current) return;
    try {
      await servicesApi.update(id, { isActive: !current.isActive });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
      );
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    }
  };

  const handleAddService = async (newService: any) => {
    try {
      // Find categoryId from category name or fallback
      const cats = await servicesApi.getCategories();
      let matchedCat = cats.find((c: any) => c.name === newService.category);
      if (!matchedCat && cats.length > 0) {
        matchedCat = cats[0];
      }

      await servicesApi.create({
        categoryId: matchedCat ? matchedCat.id : undefined,
        code: newService.code || `DV-${Math.floor(100 + Math.random() * 900)}`,
        name: newService.name,
        standardPrice: newService.price,
        deposit: newService.deposit,
        warranty: newService.warranty,
        durationMinutes: newService.durationMinutes,
        description: newService.description,
        imageUrl: newService.imageUrl,
        isAiRecommended: newService.aiRecommended,
      });

      await loadServices();
    } catch (err) {
      console.error('Lỗi khi tạo dịch vụ mới:', err);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesTab = activeTab === 'all' || s.category.includes(activeTab);
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupedCategories = Array.from(
    new Set(filteredServices.map((s) => s.category)),
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>🦷</span> Bảng Giá Dịch Vụ &amp; Phân Khúc Lâm Sàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Quản lý danh mục kỹ thuật, định giá niêm yết, chính sách bảo hành và tích hợp ảnh Cloudinary
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm Dịch Vụ Mới
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm dịch vụ, mã kỹ thuật..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Service Groups */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 text-sm">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Đang tải dữ liệu dịch vụ từ máy chủ...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 text-sm space-y-2">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">Chưa có dịch vụ nào trong phân khúc này</p>
            <p className="text-xs text-slate-400">Bạn có thể bấm "Thêm Dịch Vụ Mới" ở góc trên để tạo dịch vụ và tải ảnh lên</p>
          </div>
        ) : (
          groupedCategories.map((catName) => {
            const catServices = filteredServices.filter((s) => s.category === catName);
            if (catServices.length === 0) return null;

            return (
              <div
                key={catName}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Group Header */}
                <div className="p-4 sm:p-5 bg-sky-50/40 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="text-sky-600">🦷</span> Nhóm {catName}
                    </span>
                  </div>

                  <span className="px-2.5 py-1 bg-sky-100/70 text-sky-800 font-extrabold text-[10px] rounded-lg tracking-wider uppercase">
                    {catServices.length} DỊCH VỤ
                  </span>
                </div>

                {/* Service Rows */}
                <div className="divide-y divide-slate-100 text-xs">
                  {catServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {service.imageUrl ? (
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center justify-center text-[10px]">
                              <ImageIcon className="w-5 h-5 text-slate-300 mb-0.5" />
                              Chưa có ảnh
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {service.code && (
                              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded border border-sky-200">
                                {service.code}
                              </span>
                            )}
                            <h3 className="font-extrabold text-slate-900 text-sm">{service.name}</h3>
                            {service.aiRecommended && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> AI Đề xuất
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-slate-500 font-semibold text-[11px] flex-wrap">
                            <span className="flex items-center gap-1 text-slate-900 font-bold">
                              🏷️ Giá: <strong className="text-teal-700">{service.price.toLocaleString('vi-VN')}đ</strong>
                            </span>

                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3 text-slate-400" /> {service.durationMinutes} phút
                            </span>

                            {service.warranty && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-slate-400" /> Bảo hành: {service.warranty}
                                </span>
                              </>
                            )}

                            {service.deposit && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-slate-400" /> Cọc: {service.deposit.toLocaleString('vi-VN')}đ
                                </span>
                              </>
                            )}
                          </div>

                          {service.description && (
                            <p className="text-[11px] text-slate-500 max-w-xl line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions & Switch */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        {/* Status Switch */}
                        <div className="flex items-center gap-2 font-bold text-[11px] text-slate-600">
                          <span>{service.isActive ? 'Đang áp dụng' : 'Tạm dừng'}</span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={service.isActive}
                              onChange={() => handleToggleActive(service.id)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600" />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Thêm Dịch Vụ */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddService={handleAddService}
      />
    </div>
  );
};
