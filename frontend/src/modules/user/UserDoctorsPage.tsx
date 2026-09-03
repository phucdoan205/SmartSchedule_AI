import React, { useState } from 'react';
import { Search, Filter, Star, Calendar, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { MOCK_DOCTORS, MOCK_BRANCHES } from '../../services/mockData';

interface UserDoctorsPageProps {
  onOpenBookingWizard?: (doctorId?: string) => void;
}

export const UserDoctorsPage: React.FC<UserDoctorsPageProps> = ({ onOpenBookingWizard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredDoctors = MOCK_DOCTORS.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || d.branch === selectedBranch;
    const matchesSpecialty = selectedSpecialty === 'All' || d.specialty.includes(selectedSpecialty);
    return matchesSearch && matchesBranch && matchesSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
          ĐỘI NGŨ CHUYÊN GIA
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Đội Ngũ Bác Sĩ & Chuyên Gia Y Khoa</h1>
        <p className="text-xs text-slate-500">
          Hội tụ các Tiến sĩ, Thạc sĩ, Bác sĩ CKII giàu kinh nghiệm trong lĩnh vực Răng Hàm Mặt và Tim mạch
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bác sĩ, chuyên khoa..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
            <Filter className="w-3.5 h-3.5 text-sky-600" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold text-slate-700"
            >
              <option value="All">Tất cả chi nhánh</option>
              {MOCK_BRANCHES.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="bg-transparent focus:outline-none font-semibold text-slate-700"
            >
              <option value="All">Tất cả chuyên khoa</option>
              <option value="Răng Hàm Mặt">Răng Hàm Mặt</option>
              <option value="Tim Mạch">Tim Mạch</option>
              <option value="Nhi Khoa">Nhi Khoa</option>
              <option value="Da Liễu">Da Liễu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((d) => (
          <div
            key={d.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={d.avatar}
                  alt={d.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 p-0.5 shadow-sm shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                  <p className="text-xs font-semibold text-sky-600 mt-0.5">{d.specialty}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {d.branch}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-[11px] text-slate-600 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Kinh nghiệm & Ca khám:</span>
                  <span className="font-bold text-slate-800">{d.totalAppointments}+ ca khám thành công</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Đánh giá từ bệnh nhân:</span>
                  <span className="font-bold text-amber-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {d.rating} / 5.0
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenBookingWizard?.(d.id)}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Đặt Lịch Với Bác Sĩ
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
