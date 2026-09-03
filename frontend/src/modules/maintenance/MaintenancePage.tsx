import React from 'react';
import { Wrench, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const MaintenancePage: React.FC = () => {
  const devices = [
    { name: 'Máy Siêu Âm Tim 4D Doppler #01', location: 'Phòng 201 - Q1', status: 'Active', nextMaintenance: '15/10/2026' },
    { name: 'Ghế Phẫu Thuật Nha Khoa Laser #03', location: 'Phòng 105 - Q1', status: 'Warning', nextMaintenance: '05/09/2026' },
    { name: 'Máy Chụp X-Quang Kỹ Thuật Số', location: 'Phòng Cảnh 2 - Thủ Đức', status: 'Active', nextMaintenance: '20/11/2026' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Quản Lý Bảo Trì & Thiết Bị Y Tế</h2>
        <p className="text-xs text-slate-500 mt-1">Theo dõi tình trạng kỹ thuật máy móc y tế và lịch kiểm định định kỳ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((dev, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
                <Wrench className="w-5 h-5" />
              </div>
              <StatusBadge status={dev.status} />
            </div>

            <h4 className="text-sm font-bold text-slate-800">{dev.name}</h4>
            <p className="text-xs text-slate-500">{dev.location}</p>
            <p className="text-[11px] font-semibold text-sky-600 pt-2 border-t border-slate-100">
              Hạn bảo trì tiếp theo: {dev.nextMaintenance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
