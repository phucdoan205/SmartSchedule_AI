import React from 'react';
import { Settings, Shield, Bell, Database, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cấu Hình Hệ Thống & Cài Đặt Chung</h2>
        <p className="text-xs text-slate-500 mt-1">Thiết lập các thông số phân ca AI, gửi SMS nhắc hẹn và bảo mật hệ thống</p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Settings className="w-4 h-4 text-sky-600" /> Thiết Lập Thuật Toán AI SmartSchedule
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Tự động ưu tiên xếp ca bác sĩ theo điểm đánh giá</p>
              <p className="text-slate-500">Cho phép AI phân bổ ca khám ưu tiên bác sĩ có rating từ 4.8 điểm trở lên</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-sky-600" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-bold text-slate-800">Cảnh báo trùng ca trực realtime</p>
              <p className="text-slate-500">Hiển thị thông báo khẩn cấp khi phát hiện 2 bác sĩ xếp trùng 1 phòng khám</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-sky-600" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button type="button" className="px-5 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs flex items-center gap-1.5">
            <Save className="w-4 h-4" /> Lưu Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );
};
