import React from 'react';
import { Star, Calendar, Phone, Mail, Award, Clock } from 'lucide-react';
import type { DoctorStaff } from '../../types/admin';
import { StatusBadge } from './StatusBadge';

interface DoctorCardProps {
  doctor: DoctorStaff;
  onViewDetail?: (doctor: DoctorStaff) => void;
  onAssignShift?: (doctor: DoctorStaff) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onViewDetail,
  onAssignShift,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header avatar & info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-100 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1">
              <StatusBadge status={doctor.status} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md uppercase">
                {doctor.code}
              </span>
              <div className="flex items-center text-amber-500 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                {doctor.rating}
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-800 truncate mt-1">{doctor.name}</h4>
            <p className="text-xs font-semibold text-teal-600 truncate">{doctor.specialty}</p>
            <p className="text-[11px] text-slate-400 truncate">{doctor.department} • {doctor.branch}</p>
          </div>
        </div>

        {/* Doctor Stats & Contact */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Award className="w-3.5 h-3.5 text-sky-500" />
            <span>{doctor.totalAppointments} Lượt khám</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>Chuyên khoa I</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] col-span-2">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{doctor.phone}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] col-span-2 truncate">
            <Mail className="w-3 h-3 text-slate-400" />
            <span className="truncate">{doctor.email}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewDetail && onViewDetail(doctor)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors text-center"
        >
          Hồ sơ chi tiết
        </button>
        <button
          type="button"
          onClick={() => onAssignShift && onAssignShift(doctor)}
          className="py-2 px-3 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition-colors flex items-center gap-1"
        >
          <Calendar className="w-3.5 h-3.5" />
          Tạo ca
        </button>
      </div>
    </div>
  );
};
