import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Shield,
  CreditCard,
  Sparkles,
  Search,
  Image as ImageIcon,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AddServiceModal } from './AddServiceModal';
import { EditServiceModal, type DetailedServiceItem } from './EditServiceModal';
import { servicesApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { rolePermissionStore } from '../../services/rolePermissionStore';
import { toast } from '../../context/ToastContext';
import { MOCK_SERVICES } from '../../services/mockData';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const currentRole = user?.roles?.[0] || 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<DetailedServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<DetailedServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Permission checks
  const canEdit = rolePermissionStore.canEditServices(currentRole);
  const canToggle = rolePermissionStore.canToggleServices(currentRole);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await servicesApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
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
          isActive: item.isActive !== false,
          aiRecommended: Boolean(item.isAiRecommended),
          imageUrl: item.imageUrl,
          description: item.description,
        }));
        setServices(mapped);
      } else {
        // Fallback to rich mock services
        const fallbackList: DetailedServiceItem[] = MOCK_SERVICES.map((m) => ({
          id: m.id,
          code: m.code,
          name: m.name,
          category: m.category,
          price: m.price,
          deposit: m.deposit,
          warranty: m.warranty,
          durationMinutes: m.durationMinutes,
          isActive: m.isActive !== false,
          aiRecommended: m.isAiRecommended,
          imageUrl: m.imageUrl,
          description: m.description,
        }));
        setServices(fallbackList);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách dịch vụ:', err);
      // Fallback on error
      const fallbackList: DetailedServiceItem[] = MOCK_SERVICES.map((m) => ({
        id: m.id,
        code: m.code,
        name: m.name,
        category: m.category,
        price: m.price,
        deposit: m.deposit,
        warranty: m.warranty,
        durationMinutes: m.durationMinutes,
        isActive: m.isActive !== false,
        aiRecommended: m.isAiRecommended,
        imageUrl: m.imageUrl,
        description: m.description,
      }));
      setServices(fallbackList);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();

    // Listen to cross-module sync events
    const handleSync = () => {
      loadServices();
    };

    window.addEventListener('services_updated', handleSync);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'SERVICES_UPDATED') {
          loadServices();
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('services_updated', handleSync);
      if (channel) channel.close();
    };
  }, [loadServices]);

  // Quick filter pills matching actual clinical sub-services
  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Cấy ghép Implant đơn lẻ', label: 'Cấy ghép Implant đơn lẻ' },
    { id: 'Cấy ghép Implant toàn hàm', label: 'Implant All-on-4 / All-on-6' },
    { id: 'Răng sứ thẩm mỹ', label: 'Răng sứ thẩm mỹ' },
    { id: 'Chỉnh nha & Niềng răng', label: 'Chỉnh nha & Niềng răng' },
    { id: 'Mini hàm tháo lắp', label: 'Mini hàm tháo lắp' },
    { id: 'Thủ thuật đi kèm', label: 'Thủ thuật đi kèm' },
    { id: 'Nha khoa thẩm mỹ & Tổng quát', label: 'Nha khoa tổng quát' },
  ];

  // Broadcast sync helper
  const notifyServicesChanged = () => {
    window.dispatchEvent(new CustomEvent('services_updated'));
    try {
      const channel = new BroadcastChannel('smartschedule_sync');
      channel.postMessage({ type: 'SERVICES_UPDATED' });
      channel.close();
    } catch {}
  };

  // Toggle "Đang áp dụng" (isActive) switch
  const handleToggleActive = async (id: string) => {
    if (!canToggle) {
      toast('Bạn không có quyền bật/tắt trạng thái áp dụng dịch vụ.', 'error');
      return;
    }

    const current = services.find((s) => s.id === id);
    if (!current) return;

    const nextActive = !current.isActive;

    // Optimistic update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: nextActive } : s)),
    );

    try {
      await servicesApi.update(id, { isActive: nextActive });
      notifyServicesChanged();
      toast(
        nextActive
          ? `Đã kích hoạt dịch vụ "${current.name}" (Hiển thị trang chủ & đặt lịch)`
          : `Đã tạm ẩn dịch vụ "${current.name}" khỏi trang khách hàng`,
        nextActive ? 'success' : 'info',
      );
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      // Revert optimistic update
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: current.isActive } : s)),
      );
      toast('Lỗi cập nhật trạng thái dịch vụ trên máy chủ.', 'error');
    }
  };

  // Add new service
  const handleAddService = async (newService: any) => {
    try {
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
      notifyServicesChanged();
      toast('Đã thêm mới dịch vụ nha khoa thành công!', 'success');
    } catch (err) {
      console.error('Lỗi khi tạo dịch vụ mới:', err);
      toast('Không thể thêm dịch vụ mới, vui lòng kiểm tra lại.', 'error');
    }
  };

  // Save edited service
  const handleSaveEditedService = async (id: string, updatedData: any) => {
    try {
      // Find categoryId if changed
      const cats = await servicesApi.getCategories();
      const matchedCat = cats.find((c: any) => c.name === updatedData.category);

      const payload: any = {
        name: updatedData.name,
        code: updatedData.code,
        standardPrice: updatedData.standardPrice,
        deposit: updatedData.deposit,
        durationMinutes: updatedData.durationMinutes,
        warranty: updatedData.warranty,
        description: updatedData.description,
        imageUrl: updatedData.imageUrl,
        isAiRecommended: updatedData.isAiRecommended,
        isActive: updatedData.isActive,
      };

      if (matchedCat) {
        payload.categoryId = matchedCat.id;
      }

      await servicesApi.update(id, payload);

      // Local optimistic update
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                ...payload,
                price: updatedData.standardPrice,
                category: updatedData.category || s.category,
              }
            : s,
        ),
      );

      notifyServicesChanged();
      toast('Đã cập nhật thông tin và hình ảnh dịch vụ thành công!', 'success');
    } catch (err: any) {
      console.error('Lỗi lưu chỉnh sửa dịch vụ:', err);
      toast('Lỗi khi lưu chỉnh sửa dịch vụ lên hệ thống.', 'error');
      throw err;
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="text-2xl">🦷</span> Bảng Giá Dịch Vụ &amp; Phân Khúc Lâm Sàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Quản lý danh mục kỹ thuật, bảng giá niêm yết, chính sách bảo hành và cấu hình ảnh Cloudinary
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm Dịch Vụ Mới
          </button>
        )}
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
            Đang tải dữ liệu bảng giá dịch vụ từ hệ thống...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 text-sm space-y-2">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600">Chưa có dịch vụ nào trong phân khúc này</p>
            <p className="text-xs text-slate-400">
              Bạn có thể bấm "Thêm Dịch Vụ Mới" ở góc trên để tạo dịch vụ và tải ảnh lên
            </p>
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
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        !service.isActive
                          ? 'bg-slate-50/70 opacity-80'
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Thumbnail: Real image OR clean fallback icon if no image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                          {service.imageUrl && service.imageUrl.trim() !== '' ? (
                            <img
                              src={service.imageUrl}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center justify-center text-[10px] p-2 text-center">
                              <span className="text-xl sm:text-2xl mb-0.5">🦷</span>
                              <span className="text-[9px] font-bold text-slate-400">Không ảnh</span>
                            </div>
                          )}
                          {!service.isActive && (
                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-white text-[9px] font-bold">
                              Tạm ẩn
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {service.code && (
                              <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-extrabold rounded border border-sky-200">
                                {service.code}
                              </span>
                            )}
                            <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                              {service.name}
                            </h3>
                            {service.aiRecommended && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-emerald-600" /> AI Đề xuất
                              </span>
                            )}
                            {!service.isActive && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-200 flex items-center gap-1">
                                <EyeOff className="w-3 h-3 text-amber-600" /> Ẩn khỏi khách hàng
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

                            {service.deposit && service.deposit > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-slate-400" /> Cọc: {service.deposit.toLocaleString('vi-VN')}đ
                                </span>
                              </>
                            )}
                          </div>

                          {service.description && (
                            <p className="text-[11px] text-slate-500 max-w-2xl line-clamp-1">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions, Edit Icon & Active Switch */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        {/* Edit Button (Requirement 3) */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => setEditingService(service)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Chỉnh sửa thông tin và hình ảnh dịch vụ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chỉnh sửa</span>
                          </button>
                        )}

                        {/* Status Switch (Requirement 4) */}
                        <div className="flex items-center gap-2 font-bold text-[11px] text-slate-600">
                          <span className={service.isActive ? 'text-emerald-700' : 'text-slate-400'}>
                            {service.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={service.isActive}
                              onChange={() => handleToggleActive(service.id)}
                              disabled={!canToggle}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600 peer-disabled:opacity-50" />
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

      {/* Modal Thêm Dịch Vụ Mới */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddService={handleAddService}
      />

      {/* Modal Chỉnh Sửa Dịch Vụ & Hình Ảnh (Requirement 3) */}
      <EditServiceModal
        isOpen={Boolean(editingService)}
        service={editingService}
        onClose={() => setEditingService(null)}
        onSave={handleSaveEditedService}
      />
    </div>
  );
};
