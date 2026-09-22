import React, { useState } from 'react';
import { Search, Calendar, Clock, MapPin, CheckCircle2, User, Phone, AlertCircle, XCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { appointmentsApi } from '../../services/api';

export const UserLookupPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    try {
      setIsSearching(true);
      const all = await appointmentsApi.getAll();
      const matched = all.filter(
        (a: any) =>
          (a.patient?.phone && a.patient.phone.includes(searchInput)) ||
          (a.appointmentCode && a.appointmentCode.toLowerCase().includes(searchInput.toLowerCase())) ||
          (a.patient?.fullName && a.patient.fullName.toLowerCase().includes(searchInput.toLowerCase())),
      );

      setSearchResult(
        matched.map((m: any) => ({
          id: m.appointmentCode,
          patientName: m.patient?.fullName || 'Bệnh nhân',
          patientPhone: m.patient?.phone || '',
          doctorName: m.doctor?.fullName || 'Bác sĩ chuyên khoa',
          doctorId: m.doctorId,
          service: m.services?.[0]?.service?.name || 'Khám nha khoa',
          branch: m.branch?.name || 'Phòng khám',
          dateTime: new Date(m.startTime).toLocaleString('vi-VN', {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
          status: m.status === 'CONFIRMED' ? 'Confirmed' : m.status === 'COMPLETED' ? 'Completed' : 'Pending',
          aiScore: m.isAiRecommended ? 98 : 90,
          aiNote: 'Kiểm soát đệm vô trùng 15 phút',
          qrPassCode: m.qrPassCode,
        })),
      );
    } catch (err) {
      console.error('Lỗi khi tra cứu lịch hẹn:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
          TRA CỨU TRỰC TUYẾN
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Tra Cứu Lịch Hẹn Khám Bệnh</h1>
        <p className="text-xs text-slate-500">
          Nhập số điện thoại đã đăng ký hoặc mã đặt lịch (VD: #LH-2026...) để xem trạng thái cuộc hẹn
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập Số điện thoại (VD: 0901234567) hoặc Mã lịch hẹn..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSearching ? 'Đang Tra Cứu...' : 'Tra Cứu Ngay'}
        </button>
      </form>

      {/* Results Display */}
      {searchResult !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Tìm thấy <strong>{searchResult.length}</strong> kết quả phù hợp</span>
          </div>

          {searchResult.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Không tìm thấy thông tin lịch hẹn</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Vui lòng kiểm tra lại số điện thoại hoặc mã hẹn đã nhập đúng chưa.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResult.map((a) => (
                <div
                  key={a.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                        {a.id}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      Mã QR Kiosk: <strong className="font-mono text-teal-600">{a.qrPassCode}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-[11px] text-slate-400">Bệnh nhân</p>
                      <p className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {a.patientName}
                      </p>
                      <p className="text-[11px] text-slate-500">{a.patientPhone}</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">Dịch vụ & Bác sĩ</p>
                      <p className="font-bold text-slate-800 mt-0.5">{a.service}</p>
                      <p className="text-[11px] text-sky-600 font-semibold">{a.doctorName}</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400">Thời gian & Địa điểm</p>
                      <p className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" /> {a.dateTime}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {a.branch}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
