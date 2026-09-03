import React, { useState } from 'react';
import {
  Sparkles,
  MoreVertical,
  Calendar,
  Download,
  AlertTriangle,
  Smile,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  BellRing,
  PieChart,
} from 'lucide-react';

export const AiInsightsPage: React.FC = () => {
  const [toggleOptimization, setToggleOptimization] = useState(true);

  // Bar height data for 7 days (T2 - CN)
  const trafficData = [
    { day: 'T2', height: '40%', active: false },
    { day: 'T3', height: '22%', active: true }, // Highlighted off-peak day
    { day: 'T4', height: '65%', active: false },
    { day: 'T5', height: '50%', active: false },
    { day: 'T6', height: '80%', active: false },
    { day: 'T7', height: '95%', active: false },
    { day: 'CN', height: '85%', active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-extrabold uppercase tracking-wider border border-sky-200">
              ⚡ AI INSIGHTS HUB
            </span>
            <span className="text-slate-400 text-[11px]">Cập nhật: Vừa xong</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Trung tâm phân tích & Tối ưu AI
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích dữ liệu vận hành thời gian thực để đưa ra quyết định thông minh, giảm rủi ro và tăng cường trải nghiệm bệnh nhân.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Tháng này</span>
          </div>

          <button
            type="button"
            onClick={() => alert('Đã xuất báo cáo phân tích AI (.PDF)!')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide) - Panel 1: Off-Peak Forecast & Optimization */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-sky-600" /> Dự Báo Giờ Vắng & Tối Ưu Công Suất
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Dự báo lưu lượng khách hàng 7 ngày tới</p>
              </div>

              <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Bar Chart Visual */}
            <div className="pt-4 pb-2 px-2">
              <div className="h-44 border-b border-slate-100 flex items-end justify-between gap-4 relative">
                {/* Y-Axis scale lines */}
                <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none">
                  <div className="border-b border-slate-100/80 w-full flex justify-between"><span>100%</span></div>
                  <div className="border-b border-slate-100/80 w-full flex justify-between"><span>75%</span></div>
                  <div className="border-b border-slate-100/80 w-full flex justify-between"><span>50%</span></div>
                  <div className="border-b border-slate-100/80 w-full flex justify-between"><span>25%</span></div>
                  <div className="w-full flex justify-between"><span>0%</span></div>
                </div>

                {/* Bars */}
                {trafficData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10">
                    <div
                      style={{ height: d.height }}
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                        d.active
                          ? 'bg-rose-500 shadow-md shadow-rose-500/30'
                          : 'bg-sky-500/80 hover:bg-sky-600'
                      }`}
                    />
                    <span className={`text-xs font-bold mt-2 ${d.active ? 'text-rose-600 underline' : 'text-slate-500'}`}>
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendation Banner Inside Panel 1 */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI KHUYẾN NGHỊ TỐI ƯU</span>
              </div>
              <p className="font-extrabold text-slate-900 text-xs">
                Tự động giảm 15% gói Răng sứ Katana vào khung 09:00 - 12:00 Thứ Ba
              </p>
              <p className="text-[11px] text-emerald-700">Dự kiến tăng 45% tỷ lệ lấp đầy khung giờ vắng.</p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={toggleOptimization}
                onChange={(e) => setToggleOptimization(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>
        </div>

        {/* Right Column Top - Panel 2: No-Show Risk Gauge */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Rủi ro No-Show
              </h3>
              <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Gauge Meter Visual */}
            <div className="text-center py-2 space-y-2">
              <div className="relative w-40 h-20 mx-auto flex items-end justify-center overflow-hidden">
                <div className="w-40 h-40 rounded-full border-[14px] border-slate-100 border-t-rose-500 border-r-rose-500 border-l-amber-400 transform -rotate-45" />
                <div className="absolute bottom-0 text-center">
                  <span className="text-2xl font-extrabold text-slate-900">78%</span>
                </div>
              </div>
              <p className="text-xs font-bold text-rose-600">Nguy cơ bùng lịch cao (Hôm nay)</p>
            </div>
          </div>

          {/* Warning Alert Box */}
          <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200/80 space-y-1">
            <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Cảnh báo: 2 ca hẹn có nguy cơ hủy &gt; 75%</span>
            </p>
            <p className="text-[11px] text-rose-700 pl-5">Đã tự động yêu cầu cọc VietQR 2.000.000đ</p>
          </div>
        </div>

        {/* Left Column Bottom - Panel 3: Smart Regimen Recommendations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" /> Gợi Ý Phác Đồ Thông Minh
              </h3>
            </div>
            <div className="px-3 py-1 bg-sky-50 rounded-xl border border-sky-200 text-xs font-bold text-sky-800">
              Tỷ lệ chấp nhận: <span className="text-sky-600">41.2%</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  BN
                </div>
                <div>
                  <p className="font-bold text-slate-800">Khách chọn Implant Straumann</p>
                  <p className="text-[11px] text-sky-600 font-semibold mt-0.5">➔ AI gợi ý thêm: Ghép xương & Nâng xoang</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  NT
                </div>
                <div>
                  <p className="font-bold text-slate-800">Khách chọn Tẩy trắng răng</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">➔ AI gợi ý: Gói chăm sóc nướu (Đã từ chối)</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-800 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  LM
                </div>
                <div>
                  <p className="font-bold text-slate-800">Khách chọn Niềng răng Invisalign</p>
                  <p className="text-[11px] text-amber-600 font-semibold mt-0.5">➔ AI gợi ý thêm: Nhổ răng khôn (Chờ xác nhận)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <button type="button" className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
              Xem toàn bộ lịch sử gợi ý <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column Bottom - Panel 4: Sentiment Analysis */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Smile className="w-5 h-5 text-teal-600" /> Phân Tích Cảm Xúc
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">7 ngày qua</span>
            </div>

            {/* Donut Chart Visual */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="relative w-28 h-28 rounded-full border-[10px] border-emerald-500 flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <span className="text-lg font-extrabold text-slate-900">4.8</span>
                  <span className="text-[10px] text-slate-400 block">/ 5.0</span>
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hài lòng</span>
                  <span className="font-extrabold text-slate-800">91%</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Trung tính</span>
                  <span className="font-extrabold text-slate-800">6%</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Tiêu cực</span>
                  <span className="font-extrabold text-slate-800">3%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Alert Box */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border-l-4 border-amber-500 space-y-1">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cảnh báo đánh giá tiêu cực về thời gian chờ</span>
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
              Đã kích hoạt kịch bản Zalo xin lỗi và tặng voucher cạo vôi răng cho KH Trần Văn A.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
