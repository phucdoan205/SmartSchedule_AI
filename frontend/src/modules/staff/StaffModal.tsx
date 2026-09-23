import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../components/common/Modal';
import { User, Phone, Mail, Award, Building, Save, Camera, Loader2 } from 'lucide-react';
import doctorImg1 from '../../assets/bacsi.jpg';
import { toast } from '../../context/ToastContext';
import { rolePermissionStore, type SystemRoleItem } from '../../services/rolePermissionStore';
import { useBranch } from '../../context/BranchContext';
import { staffApi, uploadApi } from '../../services/api';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (staffData: any) => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave }) => {
  const { branches, selectedBranchId } = useBranch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roles, setRoles] = useState<SystemRoleItem[]>(() => rolePermissionStore.getRoles());
  const [name, setName] = useState('');
  const [role, setRole] = useState(roles[1]?.name || 'Bác sĩ chuyên khoa');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branchId, setBranchId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [salaryBase, setSalaryBase] = useState(25000000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when roles update in SettingsPage
  useEffect(() => {
    const unsubscribe = rolePermissionStore.subscribe(() => {
      const currentRoles = rolePermissionStore.getRoles();
      setRoles(currentRoles);
      if (!currentRoles.some((r) => r.name === role)) {
        setRole(currentRoles[0]?.name || 'Bác sĩ chuyên khoa');
      }
    });
    return unsubscribe;
  }, [role]);

  // When modal opens, refresh roles & default branch
  useEffect(() => {
    if (isOpen) {
      const currentRoles = rolePermissionStore.getRoles();
      setRoles(currentRoles);
      if (!role) {
        setRole(currentRoles[1]?.name || currentRoles[0]?.name || 'Bác sĩ chuyên khoa');
      }
      if (branches && branches.length > 0) {
        const defaultB = (selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : branches[0].id;
        setBranchId(defaultB);
      }
    }
  }, [isOpen, branches, selectedBranchId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      toast('Đang tải ảnh lên Cloudinary...', 'info');
      const res = await uploadApi.uploadImage(file, 'doctors');
      if (res?.url) {
        setAvatarUrl(res.url);
        toast('Đã tải ảnh lên Cloudinary thành công!', 'success');
      }
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
      toast('Tải ảnh thất bại: ' + (err?.response?.data?.message || err.message || 'Lỗi mạng'), 'error');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId && branches.length > 0) {
      toast('Vui lòng chọn chi nhánh công tác', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const chosenBranch = branches.find((b) => b.id === branchId) || branches[0];
      const empCode = `NV${Math.floor(100 + Math.random() * 900)}`;

      // Map role to backend enum
      let roleName = 'DOCTOR';
      const lowerRole = role.toLowerCase();
      if (lowerRole.includes('điều dưỡng') || lowerRole.includes('phụ tá')) roleName = 'NURSE';
      else if (lowerRole.includes('kỹ thuật')) roleName = 'TECHNICIAN';
      else if (lowerRole.includes('lễ tân') || lowerRole.includes('tiếp tân')) roleName = 'RECEPTIONIST';
      else if (lowerRole.includes('quản lý')) roleName = 'BRANCH_MANAGER';

      const userEmail = email.trim() || `nv${Date.now()}@smartschedule.ai`;
      const finalAvatar = avatarUrl || doctorImg1;

      await staffApi.createStaff({
        employeeCode: empCode,
        fullName: name.trim(),
        email: userEmail,
        phone: phone.trim(),
        branchId: chosenBranch?.id || branchId,
        roleName,
        avatarUrl: finalAvatar,
        specialty: specialty.trim() || role,
        experienceYears: 5,
        bio: `Nhân sự chuyên môn tại ${chosenBranch?.name || 'phòng khám'}.`,
      });

      const newStaff = {
        id: `doc-${Date.now()}`,
        code: empCode,
        employeeCode: empCode,
        name: name.trim(),
        fullName: name.trim(),
        avatar: finalAvatar,
        avatarUrl: finalAvatar,
        role,
        specialty: specialty.trim() || role,
        department: `Khoa ${specialty.trim() || role}`,
        branch: chosenBranch?.name || 'Chi nhánh Biên Hòa',
        branchId: chosenBranch?.id || branchId,
        phone: phone.trim(),
        email: userEmail,
        status: 'Active',
        rating: 5.0,
        totalAppointments: 0,
        salaryBase,
        allowance: 3000000,
        commission: 0,
        commissionRate: 15,
      };

      if (onSave) {
        onSave(newStaff);
      }

      toast(`Đã thêm nhân sự mới: ${name} (${role}) vào ${chosenBranch?.name || 'chi nhánh'} thành công!`, 'success');
      onClose();
    } catch (err: any) {
      console.error('Error creating staff:', err);
      toast(err.response?.data?.message || 'Lỗi khi lưu nhân sự vào hệ thống', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Nhân Sự / Bác Sĩ Mới"
      subtitle="Nhập đầy đủ thông tin để tạo hồ sơ bác sĩ hoặc cán bộ y tế vào hệ thống"
      maxWidth="lg"
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors text-center cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isSubmitting || isUploadingAvatar}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Tạo Hồ Sơ Nhân Sự</span>
              </>
            )}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Avatar Upload (Cloudinary) */}
        <div className="flex items-center gap-4 p-3 bg-slate-50/70 border border-slate-200/70 rounded-2xl">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-sky-100 flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-sky-600" />
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white">
                <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-800">Ảnh đại diện nhân sự (Cloudinary)</p>
            <p className="text-[11px] text-slate-400">Tải ảnh thẻ hoặc chân dung bác sĩ để hiển thị trên hệ thống</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Camera className="w-3 h-3 text-sky-600" />
              {avatarUrl ? 'Thay đổi ảnh Cloudinary' : 'Tải ảnh lên Cloudinary'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-semibold text-slate-800"
            >
              {roles.map((r) => (
                <option key={r.code} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-slate-50/50 font-medium text-slate-800"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
