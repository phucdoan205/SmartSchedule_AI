import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { User, Phone, Mail, Award, Building, Save } from 'lucide-react';
import doctorImg1 from '../../assets/bacsi.jpg';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (staffData: any) => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Doctor');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('Cơ sở Quận 1');
  const [salaryBase, setSalaryBase] = useState(25000000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        id: `doc-${Date.now()}`,
        code: `BS${Math.floor(100 + Math.random() * 900)}`,
        name,
        avatar: doctorImg1,
        role,
        specialty,
        department: `Khoa ${specialty || 'Nội'}`,
        branch,
        phone,
        email,
        status: 'Active',
        rating: 5.0,
        totalAppointments: 0,
        salaryBase,
        allowance: 3000000,
        commission: 0,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Nhân Sự / Bác Sĩ Mới"
      subtitle="Nhập đầy đủ thông tin để tạo hồ sơ bác sĩ hoặc cán bộ y tế vào hệ thống"
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Tạo Hồ Sơ Nhân Sự
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-600" /> Họ & Tên bác sĩ / nhân sự:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TS.BS. Nguyễn Văn A"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-sky-600" /> Vai trò / Chức danh:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            >
              <option value="Doctor">Bác sĩ chuyên khoa</option>
              <option value="Nurse">Điều dưỡng viên</option>
              <option value="Receptionist">Lễ tân phòng khám</option>
              <option value="Technician">Kỹ thuật viên xét nghiệm</option>
              <option value="Manager">Quản lý chi nhánh</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-sky-600" /> Chuyên khoa:
            </label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Tim mạch, Răng hàm mặt, Da liễu..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-sky-600" /> Chi nhánh công tác:
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            >
              <option value="Cơ sở Quận 1">Cơ sở Quận 1 (Trung tâm)</option>
              <option value="Cơ sở Phú Mỹ Hưng">Cơ sở Phú Mỹ Hưng (Q7)</option>
              <option value="Cơ sở Thủ Đức">Cơ sở TP. Thủ Đức</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-sky-600" /> Số điện thoại:
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0903.xxx.xxx"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-sky-600" /> Email liên hệ:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bacsi@smartschedule.ai"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Mức lương cơ bản (VNĐ):</label>
          <input
            type="number"
            value={salaryBase}
            onChange={(e) => setSalaryBase(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium"
          />
        </div>
      </form>
    </Modal>
  );
};
