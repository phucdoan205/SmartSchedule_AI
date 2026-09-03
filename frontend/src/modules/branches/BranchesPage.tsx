import React, { useState } from 'react';
import { Building2, MapPin, Phone, Users, Stethoscope, Plus, RefreshCw, ArrowRightLeft, Settings } from 'lucide-react';
import { MOCK_BRANCHES } from '../../services/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const BranchesPage: React.FC = () => {
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isTransferStaffOpen, setIsTransferStaffOpen] = useState(false);

  // Form states
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [roomName, setRoomName] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Chi Nhánh & Phòng Khám</h2>
          <p className="text-xs text-slate-500 mt-1">Danh sách chi nhánh, điều chuyển bác sĩ và phân bổ phòng khám</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTransferStaffOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-600" /> Điều chuyển nhân sự
          </button>
          <button
            type="button"
            onClick={() => setIsAddRoomOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-600" /> Thêm phòng khám
          </button>
          <button
            type="button"
            onClick={() => setIsAddBranchOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Thêm chi nhánh mới
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MOCK_BRANCHES.map((b) => (
          <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              <StatusBadge status={b.status} />
            </div>

            <h3 className="text-base font-bold text-slate-900">{b.name}</h3>

            <p className="text-xs text-slate-500 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              {b.address}
            </p>

            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>{b.doctorCount} Bác sĩ</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>{b.roomCount} Phòng khám</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Chi Nhánh */}
      <Modal
        isOpen={isAddBranchOpen}
        onClose={() => setIsAddBranchOpen(false)}
        title="Thêm Chi Nhánh Phòng Khám Mới"
        subtitle="Khởi tạo cơ sở chi nhánh mới trong hệ thống SmartSchedule AI"
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsAddBranchOpen(false); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên Chi Nhánh:</label>
            <input
              type="text"
              required
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="VD: Chi nhánh Quận 2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Địa Chỉ Chi Nhánh:</label>
            <input
              type="text"
              required
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
              placeholder="VD: 123 Đường Song Hành, An Phú, Q2"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddBranchOpen(false)} className="px-4 py-2 font-semibold text-slate-600">Hủy</button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl">Thêm Chi Nhánh</button>
          </div>
        </form>
      </Modal>

      {/* Modal Thêm Phòng Khám */}
      <Modal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        title="Thêm Phòng Khám Vào Chi Nhánh"
        subtitle="Bổ sung phòng phẫu thuật, phòng khám răng hoặc chụp X-Quang"
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsAddRoomOpen(false); }} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên Phòng Khám Mới:</label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="VD: Phòng Khám Răng Hàm Mặt #3"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddRoomOpen(false)} className="px-4 py-2 font-semibold text-slate-600">Hủy</button>
            <button type="submit" className="px-4 py-2 font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl">Thêm Phòng Khám</button>
          </div>
        </form>
      </Modal>

      {/* Modal Điều Chuyển Nhân Sự */}
      <Modal
        isOpen={isTransferStaffOpen}
        onClose={() => setIsTransferStaffOpen(false)}
        title="Điều Chuyển Bác Sĩ & Nhân Sự Giữa Các Chi Nhánh"
        subtitle="Chuyển bác sĩ trực hoặc hỗ trợ ca khám giữa các cơ sở phòng khám"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chọn Bác Sĩ / Nhân Viên:</label>
            <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 font-medium">
              <option>TS.BS. Nguyễn Minh Anh (Tim Mạch)</option>
              <option>BS. CKII. Trần Thị Thu Hương (Nha Khoa)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chuyển Từ Chi Nhánh:</label>
            <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
              <option>Chi nhánh Quận 1 (Trung tâm)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Đến Chi Nhánh Mới:</label>
            <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
              <option>Chi nhánh Quận 7 (Phú Mỹ Hưng)</option>
              <option>Chi nhánh TP. Thủ Đức</option>
            </select>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button type="button" onClick={() => setIsTransferStaffOpen(false)} className="px-4 py-2 font-semibold text-slate-600">Hủy</button>
            <button type="button" onClick={() => setIsTransferStaffOpen(false)} className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl">Xác Nhận Điều Chuyển</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
