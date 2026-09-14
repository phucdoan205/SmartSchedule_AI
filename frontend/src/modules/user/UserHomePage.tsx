import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
} from 'lucide-react';
import { servicesApi, staffApi } from '../../services/api';
import heroImg from '../../assets/hero.png';

interface UserHomePageProps {
  onOpenBookingWizard?: (serviceId?: string) => void;
}

export const UserHomePage: React.FC<UserHomePageProps> = ({ onOpenBookingWizard }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [servicesData, doctorsData] = await Promise.all([
          servicesApi.getAll(),
          staffApi.getDoctors(),
        ]);
        setServices(servicesData);
        setDoctors(doctorsData);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-16 pb-10 sm:pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-sky-900 via-slate-900 to-slate-900 text-white pt-8 sm:pt-12 pb-12 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Ứng Dụng Thuật Toán AI Đặt Lịch Khám Đột Phá</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Khám Răng Hàm Mặt <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-300">Đúng Giờ Hẹn 100%</span> Cùng SmartSchedule AI
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Hệ thống quản lý đặt lịch thông minh giúp loại bỏ hoàn toàn thời gian chờ đợi tại phòng khám, tự động gợi ý bác sĩ giỏi nhất theo từng triệu chứng.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onOpenBookingWizard?.()}
                className="px-5 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-sky-500 to-teal-400 hover:from-sky-600 hover:to-teal-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2.5 hover:scale-105 cursor-pointer"
              >
                <Calendar className="w-5 h-5" /> Đặt Lịch Khám Nhanh (1 Phút)
              </button>

              <button
                type="button"
                onClick={() => navigate('/ai-consultation')}
                className="px-5 py-3 sm:px-6 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" /> Trợ Lý AI Tư Vấn
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-slate-700/60 text-xs">
              <div>
                <p className="text-xl sm:text-2xl font-black text-sky-400">99.4%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Khám đúng giờ hẹn</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-teal-400">15 Phút</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Khử trùng vô trùng</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-amber-400">4.9/5</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Đánh giá hài lòng</p>
              </div>
            </div>
          </div>

          {/* Hero Banner Visual */}
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md lg:max-w-lg aspect-4/3 rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative bg-slate-800">
              <img
                src={heroImg}
                alt="Bệnh Viện Răng Hàm Mặt"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                <div className="space-y-1 text-white">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/30 text-teal-300 text-xs font-bold backdrop-blur-xs">
                    <ShieldCheck className="w-4 h-4 text-teal-300" /> Tiêu chuẩn Vô Trùng Khắt Khe
                  </div>
                  <p className="text-base font-extrabold">Hệ Thống Phòng Mổ &amp; Ghế Nha Chuẩn Quốc Tế</p>
                  <p className="text-xs text-slate-300">Đồng Nai • TP. Hồ Chí Minh • Thủ Đức</p>
                </div>
              </div>
            </div>
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
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            Xem tất cả dịch vụ <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200 text-xs">
            <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Đang tải dữ liệu dịch vụ...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="h-40 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                      <ImageIcon className="w-6 h-6 text-slate-300 mb-1" />
                      <span>Chưa có ảnh</span>
                    </div>
                  )}
                  {s.code && (
                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold text-sky-800 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-sky-200 shadow-2xs">
                      {s.code}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{s.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {s.category?.name || 'Nha khoa'} • {s.durationMinutes} phút
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-teal-600">
                      {Number(s.standardPrice).toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenBookingWizard?.(s.id)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      Đặt Lịch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
            >
              Xem tất cả bác sĩ <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {doctors.map((d) => (
              <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-center space-y-3">
                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto border-2 border-sky-400 p-0.5 shadow-sm bg-slate-100 flex items-center justify-center">
                  {d.avatar ? (
                    <img src={d.avatar} alt={d.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Stethoscope className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{d.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.specialty}</p>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {d.rating} ({d.totalAppointments || 0} ca)
                </div>
                <button
                  type="button"
                  onClick={() => onOpenBookingWizard?.()}
                  className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-colors cursor-pointer"
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
        <div className="bg-gradient-to-r from-sky-900 to-indigo-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
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
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs rounded-2xl shadow-lg transition-all shrink-0 cursor-pointer"
          >
            Trải Nghiệm AI Tư Vấn Ngay
          </button>
        </div>
      </section>
    </div>
  );
};
