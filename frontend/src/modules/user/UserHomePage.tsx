import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  Star,
  Users,
  Award,
  Building,
} from 'lucide-react';
import { MOCK_DOCTORS, MOCK_SERVICES, MOCK_BRANCHES } from '../../services/mockData';
import heroImg from '../../assets/hero.png';

interface UserHomePageProps {
  onOpenBookingWizard?: () => void;
}

export const UserHomePage: React.FC<UserHomePageProps> = ({ onOpenBookingWizard }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-sky-900 via-slate-900 to-slate-900 text-white pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Ứng Dụng Thuật Toán AI Đặt Lịch Khám Đột Phá</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Khám Răng Hàm Mặt <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">Đúng Giờ Hẹn 100%</span> Cùng SmartSchedule AI
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Hệ thống quản lý đặt lịch thông minh giúp loại bỏ hoàn toàn thời gian chờ đợi tại phòng khám, tự động gợi ý bác sĩ giỏi nhất theo từng triệu chứng.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onOpenBookingWizard}
                className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/30 transition-all flex items-center gap-2.5 hover:scale-105"
              >
                <Calendar className="w-5 h-5" />
                <span>Trải Nghiệm Đặt Lịch AI (30 Giây)</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/ai-consultation')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span>AI Tư Vấn Triệu Chứng</span>
              </button>
            </div>

            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 text-xs">
              <div>
                <p className="text-xl font-extrabold text-teal-400">99.4%</p>
                <p className="text-slate-400 text-[11px]">Đúng khung giờ hẹn</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-sky-400">15.000+</p>
                <p className="text-slate-400 text-[11px]">Bệnh nhân tin dùng</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-amber-400">4.9/5 ⭐</p>
                <p className="text-slate-400 text-[11px]">Đánh giá chất lượng</p>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl bg-gradient-to-tr from-slate-800 to-sky-950 p-2">
              <img src={heroImg} alt="SmartSchedule Clinic" className="w-full h-80 sm:h-96 object-cover rounded-2xl" />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Xác Nhận Tức Thì Sau 5s</p>
                    <p className="text-[10px] text-slate-400">Tự động gửi SMS & QR Code vào máy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            TẠI SAO CHỌN SMARTSCHEDULE AI
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">Ưu Thế Đột Phá Khám Chữa Bệnh Thông Minh</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Không Còn Thời Gian Chờ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Thuật toán AI tự động sắp xếp khoảng trống khám hợp lý, đảm bảo bạn được bác sĩ đón tiếp ngay khi tới phòng khám.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Phác Đồ Chẩn Đoán AI</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống phân tích triệu chứng ban đầu và gợi ý bác sĩ chuyên khoa phù hợp nhất với tình trạng răng miệng.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Hồ Sơ EMR Bảo Mật</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lưu trữ toa thuốc, lịch sử khám và sơ đồ răng điện tử an toàn, dễ dàng tra cứu mọi lúc trên ứng dụng.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Gói Dịch Vụ Khám Nổi Bật</h2>
            <p className="text-xs text-slate-500 mt-1">Bảng giá công khai minh bạch, chất lượng chuẩn quốc tế</p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            Xem tất cả dịch vụ <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {MOCK_SERVICES.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">{s.code}</span>
                <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                <p className="text-xs text-slate-500">Chuyên khoa: {s.category} • {s.durationMinutes} phút</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-extrabold text-teal-600">{s.price.toLocaleString('vi-VN')} VNĐ</span>
                <button
                  type="button"
                  onClick={onOpenBookingWizard}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                >
                  Đặt Lịch Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Doctor Showcase */}
      <section className="bg-slate-100/70 py-12 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Đội Ngũ Bác Sĩ Chuyên Khoa</h2>
              <p className="text-xs text-slate-500 mt-1">Các chuyên gia hàng đầu với trên 10 năm kinh nghiệm điều trị</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Xem tất cả bác sĩ <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_DOCTORS.slice(0, 4).map((d) => (
              <div key={d.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-3">
                <img src={d.avatar} alt={d.name} className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-sky-400 p-0.5 shadow-sm" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.specialty}</p>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {d.rating} ({d.totalAppointments}+ ca)
                </div>
                <button
                  type="button"
                  onClick={onOpenBookingWizard}
                  className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors"
                >
                  Đặt Lịch Với Bác Sĩ
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Callout AI Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" /> Tính Năng AI Tư Vấn 24/7
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold">Bạn Chưa Rõ Triệu Chứng Răng Miệng Của Mình?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Hãy trải nghiệm trợ lý AI chẩn đoán thông minh để nhận phác đồ tham khảo và chọn đúng bác sĩ chuyên khoa!
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/ai-consultation')}
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-2xl shadow-lg transition-all shrink-0"
          >
            Trải Nghiệm AI Tư Vấn Ngay
          </button>
        </div>
      </section>
    </div>
  );
};
