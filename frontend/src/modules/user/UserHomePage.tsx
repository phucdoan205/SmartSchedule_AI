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
  const [publicReviews, setPublicReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPublicReviews = () => {
    try {
      let visMap: Record<string, boolean> = {};
      const savedVis = localStorage.getItem('public_reviews_visibility');
      if (savedVis) {
        try {
          visMap = JSON.parse(savedVis);
        } catch (e) {}
      }

      const defaultReviews = [
        {
          id: 'rev-NV001-1',
          initials: 'TL',
          patient: 'Lê Trần Tiến Luật',
          patientCode: '#BN-2026-088',
          date: '25/09/2026',
          rating: 5,
          service: 'Tẩy Trắng Răng Chuyên Sâu Công Nghệ Laser Whitening',
          comment: 'Bác sĩ BS. Nguyễn Thị An làm rất nhẹ nhàng, không hề bị ê buốt. Form răng thiết kế tự nhiên và khớp cắn ăn nhai rất thoải mái. Cảm ơn bác sĩ nhiều!',
          verified: true,
          branch: 'Chi nhánh Biên Hòa (Trụ sở chính)',
          doctorName: 'BS. Nguyễn Thị An',
          doctorSpecialty: 'Phục hình Răng sứ & Thẩm mỹ',
        },
        {
          id: 'rev-NV001-2',
          initials: 'VT',
          patient: 'Nguyen Van Test',
          patientCode: '#BN-2026-087',
          date: '24/09/2026',
          rating: 5,
          service: 'Bọc 2 răng sứ Cercon (Đức)',
          comment: 'Rất hài lòng với màu răng sứ BS. Nguyễn Thị An tư vấn, nhìn y hệt răng thật. Bác sĩ dặn dò chu đáo sau khi lắp răng.',
          verified: true,
          branch: 'Chi nhánh Biên Hòa (Trụ sở chính)',
          doctorName: 'BS. Nguyễn Thị An',
          doctorSpecialty: 'Phục hình Răng sứ & Thẩm mỹ',
        },
        {
          id: 'rev-NV001-3',
          initials: 'TH',
          patient: 'Tran Van Hen',
          patientCode: '#BN-2026-085',
          date: '23/09/2026',
          rating: 5,
          service: 'Mặt dán Veneer Emax',
          comment: 'Bác sĩ điều trị rất cẩn thận, giải thích rõ ràng từng bước trước khi làm. Rất an tâm khi được bác sĩ trực tiếp thăm khám!',
          verified: true,
          branch: 'Chi nhánh Biên Hòa (Trụ sở chính)',
          doctorName: 'BS. Nguyễn Thị An',
          doctorSpecialty: 'Phục hình Răng sứ & Thẩm mỹ',
        },
        {
          id: 'rev-NV002-1',
          initials: 'HA',
          patient: 'Hoàng Anh Tuấn',
          patientCode: '#BN-2026-092',
          date: '22/09/2026',
          rating: 5,
          service: 'Cấy ghép Implant Straumann',
          comment: 'TS.BS. Nguyễn Minh Anh cấy trụ Implant cực kỳ chuẩn xác và không hề đau như mình tưởng tượng. Cơ sở vật chất vô trùng rất chuyên nghiệp!',
          verified: true,
          branch: 'Chi nhánh Quận 1 (TP.HCM)',
          doctorName: 'TS.BS. Nguyễn Minh Anh',
          doctorSpecialty: 'Cấy ghép Implant & Tiểu phẫu',
        },
      ];

      let storedReviews: any[] = defaultReviews;
      const rawStored = localStorage.getItem('public_patient_reviews');
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge with defaults so we don't lose reviews
            const map = new Map<string, any>();
            defaultReviews.forEach((r) => map.set(r.id, r));
            parsed.forEach((r) => map.set(r.id, r));
            storedReviews = Array.from(map.values());
          }
        } catch (e) {}
      }

      // Filter by visibility map
      const active = storedReviews.filter((r) => visMap[r.id] !== false && r.showOnWeb !== false);
      setPublicReviews(active);
    } catch (e) {
      console.warn('Lỗi khi tải đánh giá công khai:', e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [servicesData, doctorsData] = await Promise.all([
          servicesApi.getAll({ isActive: true }),
          staffApi.getDoctors(),
        ]);
        const activeOnly = Array.isArray(servicesData)
          ? servicesData.filter((s: any) => s.isActive !== false)
          : [];
        setServices(activeOnly);
        setDoctors(doctorsData || []);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang chủ:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    loadPublicReviews();

    // Listen to real-time service update events
    const handleSync = () => {
      fetchData();
      loadPublicReviews();
    };
    window.addEventListener('services_updated', handleSync);
    window.addEventListener('storage', handleSync);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('smartschedule_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'SERVICES_UPDATED') {
          fetchData();
        }
        if (event.data?.type === 'REVIEWS_UPDATED') {
          loadPublicReviews();
        }
      };
    } catch {}

    return () => {
      window.removeEventListener('services_updated', handleSync);
      window.removeEventListener('storage', handleSync);
      if (channel) channel.close();
    };
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
                    <div className="flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl mb-1 shadow-2xs">
                        🦷
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Dịch vụ nha khoa</span>
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

      {/* Patient Reviews Section */}
      {publicReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Đánh Giá Thực Tế Từ Khách Hàng</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Cảm Nhận Bệnh Nhân Sau Điều Trị
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Những chia sẻ chân thực về sự nhẹ nhàng, không đau, chuẩn phác đồ và thái độ tận tâm của đội ngũ bác sĩ SmartSchedule AI
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200 px-3.5 py-2 rounded-2xl shrink-0">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black text-slate-800">4.9 / 5.0</span>
              <span className="text-[11px] text-slate-500 font-medium">({publicReviews.length} đánh giá công khai)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Header: Patient & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-200">
                        {rev.initials || 'KH'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{rev.patient}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                          <span className="text-[10px] text-sky-600 font-semibold">{rev.patientCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Service tag */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700">
                    <span className="text-sky-600 font-bold">Dịch vụ:</span>
                    <span className="truncate max-w-[220px]">{rev.service}</span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Footer: Doctor & Clinic verification */}
                <div className="pt-3.5 mt-3.5 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Bác sĩ phụ trách:</span>
                    <span className="font-bold text-slate-800">{rev.doctorName || 'BS. Chuyên khoa'}</span>
                  </div>
                  {rev.verified && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Đã xác thực điều trị tại {rev.branch || 'Biên Hòa'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
