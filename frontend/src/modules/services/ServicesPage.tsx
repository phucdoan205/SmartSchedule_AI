import React, { useState } from 'react';
import { Receipt, Plus, Clock, Tag, Save } from 'lucide-react';
import { MOCK_SERVICES } from '../../services/mockData';
import { DataTable, type Column } from '../../components/common/DataTable';
import type { ServiceItem } from '../../types/admin';
import { Modal } from '../../components/common/Modal';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>(MOCK_SERVICES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form input states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Nha Khoa');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      code: `DV-${Math.floor(100 + Math.random() * 900)}`,
      name,
      category,
      price: parseInt(price) || 500000,
      durationMinutes: parseInt(duration) || 30,
      status: 'Active',
    };
    setServices([newService, ...services]);
    setIsModalOpen(false);
  };

  const columns: Column<ServiceItem>[] = [
    {
      header: 'MÃ DỊCH VỤ',
      cell: (row) => <span className="font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-xs">{row.code}</span>,
    },
    { header: 'TÊN DỊCH VỤ KHÁM', accessorKey: 'name' },
    { header: 'CHUYÊN KHOA', accessorKey: 'category' },
    {
      header: 'BẢNG GIÁ NIÊM YẾT',
      cell: (row) => <span className="font-bold text-teal-600">{row.price.toLocaleString('vi-VN')} VNĐ</span>,
    },
    {
      header: 'THỜI GIAN KHÁM',
      cell: (row) => (
        <span className="flex items-center gap-1 font-medium text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> {row.durationMinutes} phút
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Danh Mục Dịch Vụ & Bảng Giá Niêm Yết</h2>
          <p className="text-xs text-slate-500 mt-1">Bảng giá gói khám bệnh và dịch vụ kỹ thuật y tế</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm dịch vụ mới
        </button>
      </div>

      <DataTable data={services} columns={columns} searchPlaceholder="Tìm mã gói khám, tên dịch vụ..." />

      {/* Modal Thêm Dịch Vụ Mới */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm Dịch Vụ Khám Bệnh Mới"
        subtitle="Bổ sung gói dịch vụ và bảng giá niêm yết trên hệ thống"
      >
        <form onSubmit={handleCreateService} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên Dịch Vụ Khám:</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Trám răng thẩm mỹ Laser"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chuyên Khoa / Danh Mục:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <option value="Nha Khoa">Nha Khoa Răng Hàm Mặt</option>
                <option value="Tim Mạch">Tim Mạch & Chẩn Đoán</option>
                <option value="Tổng Quát">Khám Tổng Quát</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thời Gian Khám (phút):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Giá Niêm Yết (VNĐ):</label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 500000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-teal-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-semibold text-slate-600 rounded-xl">
              Hủy
            </button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl flex items-center gap-1">
              <Save className="w-3.5 h-3.5" /> Lưu Dịch Vụ
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
