import React, { useState } from 'react';
import {
  Maximize2,
  Upload,
  Eye,
} from 'lucide-react';
import xrayImg from '../../assets/x-quang.png';

export interface XrayFilmItem {
  id: string;
  type: 'CT Cone Beam 3D' | 'Phim Panorama' | 'Periapical';
  title: string;
  date: string;
  doctor: string;
  thumbnail: string;
  description?: string;
  badgeClass: string;
}

const SAMPLE_XRAYS: XrayFilmItem[] = [
  {
    id: 'xray-1',
    type: 'CT Cone Beam 3D',
    title: 'Khảo sát mật độ xương hàm dưới vùng răng 46',
    date: '10/10/2026',
    doctor: 'BS. CKII Lê Văn Hùng',
    thumbnail: xrayImg,
    description: 'Chỉ số D2, đủ thể tích xương vỏ để cấy ghép trụ Straumann SLA Ø4.1.',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
  },
  {
    id: 'xray-2',
    type: 'Phim Panorama',
    title: 'Kiểm tra vị trí cắm trụ Implant',
    date: '15/10/2026',
    doctor: 'BS. CKII Lê Văn Hùng',
    thumbnail: xrayImg,
    description: 'Trụ cắm đúng trục giải phẫu, cách ống thần kinh răng dưới an toàn 4.2mm.',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  {
    id: 'xray-3',
    type: 'Periapical',
    title: 'Chụp cận chóp răng 46 kiểm tra tích hợp xương',
    date: '03/09/2026',
    doctor: 'TS.BS. Nguyễn Minh Anh',
    thumbnail: xrayImg,
    description: 'Hình ảnh bè xương mới bám chặt quanh ren trụ, không thấu quang tiêu xương.',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
];

interface XrayLibraryProps {
  onOpenDicomViewer: (film?: XrayFilmItem) => void;
  onOpenUploadModal: () => void;
}

export const XrayLibrary: React.FC<XrayLibraryProps> = ({
  onOpenDicomViewer,
  onOpenUploadModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'Phim Panorama' | 'CT Cone Beam 3D' | 'Periapical'>('all');

  const filterTabs = [
    { id: 'all', label: 'Tất cả phim' },
    { id: 'Phim Panorama', label: 'Phim Panorama' },
    { id: 'CT Cone Beam 3D', label: 'CT Cone Beam 3D' },
    { id: 'Periapical', label: 'Periapical' },
  ] as const;

  const filteredFilms =
    filter === 'all'
      ? SAMPLE_XRAYS
      : SAMPLE_XRAYS.filter((film) => film.type === filter);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Thư viện Phim X-quang
          </h2>
          <p className="text-xs font-semibold text-slate-400">
            Quản lý và chẩn đoán hình ảnh kỹ thuật số
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-150 whitespace-nowrap shrink-0 ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* X-Ray Cards List */}
        <div className="space-y-3">
          {filteredFilms.map((film) => (
            <div
              key={film.id}
              onClick={() => onOpenDicomViewer(film)}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 hover:border-sky-300 hover:shadow-md transition-all duration-150 flex flex-col sm:flex-row gap-3.5"
            >
              {/* Thumbnail with simulated monitor/viewer bezel */}
              <div className="relative h-28 sm:h-20 w-full sm:w-28 shrink-0 overflow-hidden rounded-lg border border-slate-300 bg-slate-950 shadow-inner">
                <img
                  src={film.thumbnail}
                  alt={film.title}
                  className="h-full w-full object-cover opacity-90 transition-transform duration-200 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                <span className="absolute bottom-1 right-1 flex items-center gap-1 rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-sky-300 backdrop-blur-xs">
                  <Eye className="w-2.5 h-2.5" /> Xem 3D
                </span>
              </div>

              {/* Info Column */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold border ${film.badgeClass}`}
                    >
                      {film.type}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                      {film.date}
                    </span>
                  </div>

                  <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-tight">
                    {film.title}
                  </h3>
                </div>

                <p className="text-[11px] font-medium text-slate-500 truncate">
                  BS: {film.doctor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons matching Image 2 */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onOpenDicomViewer()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-50 border border-sky-100 px-4 py-2.5 text-xs font-extrabold text-sky-700 hover:bg-sky-100 hover:border-sky-200 transition-colors shadow-xs"
        >
          <Maximize2 className="w-4 h-4 text-sky-600" /> Mở trình phóng to 3D DICOM
        </button>

        <button
          type="button"
          onClick={onOpenUploadModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
        >
          <Upload className="w-4 h-4 text-slate-600" /> Tải lên phim chụp mới
        </button>
      </div>
    </div>
  );
};
