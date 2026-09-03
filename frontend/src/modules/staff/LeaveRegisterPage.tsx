import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, Calendar, FileText, Save } from 'lucide-react';
import { MOCK_LEAVE_REQUESTS } from '../../services/mockData';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import type { LeaveRequest } from '../../types/admin';

export const LeaveRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [staffName, setStaffName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'Annual' | 'Sick' | 'Personal'>('Annual');

  const handleApprove = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));
  };

  const handleReject = (id: string) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)));
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: LeaveRequest = {
      id: `leave-${Date.now()}`,
      staffId: 'doc-1',
      staffName: staffName || 'BS. Nguyễn Minh Anh',
      avatar: MOCK_LEAVE_REQUESTS[0].avatar,
      role: 'Bác sĩ chuyên khoa',
      startDate,
      endDate,
      reason,
      type,
      status: 'Pending',
      createdAt: 'Vừa xong',
    };
    setRequests([newReq, ...requests]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/staff')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại Quản lý Bác sĩ & Nhân sự
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý & Đăng Ký Nghỉ Phép</h2>
          <p className="text-xs text-slate-500 mt-1">Phê duyệt đơn xin nghỉ ca, nghỉ phép năm của y bác sĩ</p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Tạo đơn nghỉ phép mới
        </button>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
          Danh Sách Đơn Xin Nghỉ Phép Chờ Phê Duyệt
        </div>
        <div className="divide-y divide-slate-100">
          {requests.map((req) => (
            <div key={req.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img src={req.avatar} alt={req.staffName} className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{req.staffName}</h4>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {req.role}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{req.reason}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" /> Từ {req.startDate} đến {req.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Tạo lúc: {req.createdAt}
                    </span>
                  </div>
                </div>
              </div>

              {req.status === 'Pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Từ chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(req.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Duyệt đơn
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal create leave */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Đơn Xin Nghỉ Phép Mới"
        subtitle="Điền lý do và khoảng thời gian nghỉ ca để AI tính toán tự động xếp ca bù"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreateRequest}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Gửi đơn xin nghỉ
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tên Bác sĩ / Nhân sự:</label>
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              placeholder="Nhập tên bác sĩ xin nghỉ"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Từ ngày:</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Đến ngày:</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Loại nghỉ phép:</label>
            <select
              value={type}
              onChange={(e: any) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            >
              <option value="Annual">Nghỉ phép năm</option>
              <option value="Sick">Nghỉ ốm đau / Y tế</option>
              <option value="Personal">Nghỉ việc riêng</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lý do nghỉ:</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
