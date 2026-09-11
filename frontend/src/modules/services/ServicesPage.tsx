import React, { useState } from 'react';
import {
  Plus,
  Shield,
  CreditCard,
  Sparkles,
  Search,
} from 'lucide-react';
import { AddServiceModal } from './AddServiceModal';
import { MOCK_DOCTORS } from '../../services/mockData';

interface DetailedServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  deposit?: number;
  warranty?: string;
  durationMinutes: number;
  doctors: string[];
  isActive: boolean;
  aiRecommended?: boolean;
}

export const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [services, setServices] = useState<DetailedServiceItem[]>([
    {
      id: 'srv-imp-1',
      name: 'Trụ Straumann SLA (Thụy Sỹ)',
      category: 'Cấy ghép Implant',
      price: 43000000,
      deposit: 5000000,
      warranty: 'Trọn đời',
      durationMinutes: 60,
      doctors: ['BS. Nguyễn Thị An', 'BS.CKI Nguyễn Văn Tuấn'],
      isActive: true,
      aiRecommended: true,
    },
    {
      id: 'srv-imp-2',
      name: 'All on 4 Trụ Hiossen (Mỹ)',
      category: 'Cấy ghép Implant',
      price: 180000000,
      deposit: 10000000,
      warranty: '15 năm',
      durationMinutes: 180,
      doctors: ['BS.CKI Nguyễn Văn Tuấn'],
      isActive: true,
      aiRecommended: true,
    },
    {
      id: 'srv-por-1',
      name: 'Sứ toàn phần Cercon HT (Đức)',
      category: 'Răng sứ thẩm mỹ',
      price: 6000000,
      deposit: 500000,
      warranty: '10 năm',
      durationMinutes: 60,
      doctors: ['BS. Nguyễn Thị An', 'BS. Trần Đức Cường'],
      isActive: true,
      aiRecommended: true,
    },
    {
      id: 'srv-por-2',
      name: 'Sứ toàn phần Emax (Thụy Sĩ)',
      category: 'Răng sứ thẩm mỹ',
      price: 7000000,
      deposit: 500000,
      warranty: '10 năm',
      durationMinutes: 60,
      doctors: ['BS. Nguyễn Thị An'],
      isActive: true,
      aiRecommended: false,
    },
    {
      id: 'srv-den-1',
      name: 'Hàm khung kim loại Titan liên kết',
      category: 'Mini hàm tháo lắp',
      price: 12000000,
      deposit: 2000000,
      warranty: '5 năm',
      durationMinutes: 45,
      doctors: ['BS. Trần Đức Cường'],
      isActive: true,
      aiRecommended: false,
    },
    {
      id: 'srv-pro-1',
      name: 'Ghép xương nhân tạo & Nâng xoang kín',
      category: 'Thủ thuật đi kèm',
      price: 15000000,
      deposit: 2000000,
      warranty: 'Theo chỉ định',
      durationMinutes: 60,
      doctors: ['BS.CKI Nguyễn Văn Tuấn'],
      isActive: true,
      aiRecommended: true,
    },
  ]);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'Cấy ghép Implant', label: 'Cấy ghép Implant' },
    { id: 'Răng sứ thẩm mỹ', label: 'Răng sứ thẩm mỹ' },
    { id: 'Mini hàm tháo lắp', label: 'Mini hàm tháo lắp' },
    { id: 'Thủ thuật đi kèm', label: 'Thủ thuật đi kèm' },
  ];

  const handleToggleActive = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleAddService = (newService: any) => {
    setServices((prev) => [
      {
        id: newService.id,
        name: newService.name,
        category: newService.category,
        price: newService.price,
        deposit: newService.deposit,
        warranty: newService.warranty,
        durationMinutes: newService.durationMinutes,
        doctors: newService.doctors || ['BS. Nguyễn Thị An'],
        isActive: true,
        aiRecommended: newService.aiRecommended,
      },
      ...prev,
    ]);
  };

  // Group services by category
  const filteredServices = services.filter((s) => {
    const matchesCategory = activeTab === 'all' || s.category === activeTab;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedCategories = Array.from(new Set(filteredServices.map((s) => s.category)));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar (Khớp Ảnh "giao diện trang dịch vụ & bảng giá.png") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Dịch vụ &amp; Bảng giá
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            Cấu hình chi tiết các gói dịch vụ, giá cả và bác sĩ phụ trách.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm dịch vụ
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-0">
        <div className="flex items-center gap-6 text-xs font-extrabold overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`pb-3 border-b-2 transition-all whitespace-nowrap ${
                activeTab === cat.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative pb-2 sm:pb-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm dịch vụ..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Services List Grouped by Category */}
      <div className="space-y-6">
        {groupedCategories.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400 text-xs">
            Không tìm thấy dịch vụ nào phù hợp.
          </div>
        ) : (
          groupedCategories.map((catName) => {
            const catServices = filteredServices.filter((s) => s.category === catName);

            return (
              <div
                key={catName}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden"
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
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
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
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-center">
                        {/* Doctor Avatars */}
                        <div className="flex items-center -space-x-2">
                          {service.doctors.map((docName, idx) => {
                            const doctorObj = MOCK_DOCTORS.find((d) => d.name === docName);
                            return (
                              <div
                                key={idx}
                                title={docName}
                                className="w-8 h-8 rounded-full border-2 border-white bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-[10px] shadow-xs overflow-hidden"
                              >
                                {doctorObj?.avatar ? (
                                  <img
                                    src={doctorObj.avatar}
                                    alt={docName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  docName.charAt(3) || 'BS'
                                )}
                              </div>
                            );
                          })}
                        </div>

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

      {/* Modal Thêm Dịch Vụ Nha Khoa & Cấu Hình Bảng Giá (Khớp 100% Ảnh Của User) */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddService={handleAddService}
      />
    </div>
  );
};
