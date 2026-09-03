import React, { useState } from 'react';
import { Search, Calendar, Clock, MapPin, CheckCircle2, User, Phone, AlertCircle, XCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MOCK_APPOINTMENTS } from '../../services/mockData';

export const UserLookupPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('0912.345.678');
  const [searchResult, setSearchResult] = useState<typeof MOCK_APPOINTMENTS | null>(MOCK_APPOINTMENTS);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const matched = MOCK_APPOINTMENTS.filter(
      (a) =>
        a.patientPhone.includes(searchInput) ||
        a.id.toLowerCase().includes(searchInput.toLowerCase()) ||
        a.patientName.toLowerCase().includes(searchInput.toLowerCase())
    );
    setSearchResult(matched.length > 0 ? matched : []);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
          TRA CỨU TRỰC TUYẾN
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Tra Cứu Lịch Hẹn Khám Bệnh</h1>
        <p className="text-xs text-slate-500">
          Nhập số điện thoại đã đăng ký hoặc mã đặt lịch (VD: APT-1001) để xem trạng thái cuộc hẹn
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập Số điện thoại (VD: 0912345678) hoặc Mã hẹn..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-semibold"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          Tra Cứu Ngay
        </button>
      </form>

      {/* Results Display */}
      {searchResult !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Kết quả tìm kiếm ({searchResult.length} lịch hẹn):</span>
          </div>

          {searchResult.length > 0 ? (
            <div className="space-y-4">
              {searchResult.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                        {apt.id}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{apt.service}</h3>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 text-[11px]">Bệnh nhân:</p>
                      <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {apt.patientName} ({apt.patientPhone})
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-[11px]">Bác sĩ đảm nhiệm:</p>
                      <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-teal-600" /> {apt.doctorName}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-400 text-[11px]">Thời gian & Địa điểm:</p>
                      <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" /> {apt.dateTime}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" /> {apt.branch}
                      </p>
                    </div>
                  </div>

                  {apt.aiNote && (
                    <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-[11px] text-sky-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>{apt.aiNote} (Độ ưu tiên AI: {apt.aiScore}%)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 text-xs text-slate-500">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="font-bold text-slate-800">Không tìm thấy lịch hẹn trùng khớp!</p>
              <p>Vui lòng kiểm tra lại số điện thoại hoặc mã đặt lịch.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
