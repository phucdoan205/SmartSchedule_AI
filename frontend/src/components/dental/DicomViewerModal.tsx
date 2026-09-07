import React, { useState, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Ruler,
  Maximize2,
  Minimize2,
  Download,
  Layers,
  Activity,
  RefreshCw,
} from 'lucide-react';
import xrayImg from '../../assets/x-quang.png';

interface DicomViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilmTitle?: string;
  initialFilmType?: string;
  initialDate?: string;
  patientName?: string;
  patientId?: string;
}

export const DicomViewerModal: React.FC<DicomViewerModalProps> = ({
  isOpen,
  onClose,
  initialFilmTitle = 'Khảo sát mật độ xương hàm dưới vùng răng 46',
  initialFilmType = 'CT Cone Beam 3D',
  initialDate = '10/10/2026',
  patientName = 'Nguyễn Văn An',
  patientId = 'BN-2026-104',
}) => {
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showMetadata] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setRotation(0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`relative flex flex-col w-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all ${
          isFullscreen ? 'h-screen w-screen rounded-none' : 'max-w-6xl max-h-[92vh] h-[850px]'
        }`}
      >
        {/* Top Medical Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/90 px-5 py-3 select-none">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-wide text-white uppercase">
                  Trình xem phim 3D DICOM Chuyên Sâu
                </h2>
                <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-extrabold text-teal-300 border border-teal-500/30">
                  {initialFilmType}
                </span>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                  FOV 12x10cm
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {patientName} • Mã BN: <span className="text-slate-200 font-semibold">{patientId}</span> • Ngày chụp: {initialDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 border border-transparent hover:border-rose-800/40 transition-colors"
              title="Đóng trình xem"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-900/50 px-5 py-2 select-none text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" /> Phóng to
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" /> Thu nhỏ
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">
              {Math.round(zoom * 100)}%
            </span>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Xoay 90°"
            >
              <RotateCw className="w-3.5 h-3.5" /> Xoay
            </button>

            <button
              type="button"
              onClick={() => setInvert(!invert)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
                invert
                  ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Đảo âm bản / dương bản"
            >
              <Layers className="w-3.5 h-3.5" /> Âm bản
            </button>

            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors ${
                showMeasurements
                  ? 'border-sky-500/50 bg-sky-500/20 text-sky-300'
                  : 'border-slate-800 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title="Thước đo mật độ xương"
            >
              <Ruler className="w-3.5 h-3.5" /> Thước đo AI
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              title="Khôi phục mặc định"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Sáng</span>
              <input
                type="range"
                min="50"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-16 sm:w-20 accent-sky-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Contrast className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-400">Tương phản</span>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-16 sm:w-20 accent-sky-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Main Viewport */}
        <div className="relative flex-1 bg-[#05070a] overflow-hidden flex items-center justify-center">
          {/* Medical Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Film Image with Filters applied */}
          <div
            className="relative flex items-center justify-center transition-transform duration-100 ease-out cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : 'invert(0)'}`,
            }}
          >
            <img
              src={xrayImg}
              alt="Dental Panoramic / CT Cone Beam X-Ray"
              className="max-h-[580px] max-w-full object-contain rounded select-none shadow-2xl pointer-events-none"
            />

            {/* Simulated Measurement Annotation on Tooth 46 */}
            {showMeasurements && (
              <div
                className="absolute left-[38%] top-[55%] pointer-events-none"
                style={{
                  filter: invert ? 'invert(1)' : 'none',
                }}
              >
                {/* Virtual caliper measurement */}
                <div className="relative border-l-2 border-r-2 border-teal-400 h-14 w-8 flex flex-col justify-between items-center animate-pulse">
                  <div className="w-full h-0.5 bg-teal-400" />
                  <div className="bg-teal-950/90 text-teal-300 font-mono text-[9px] px-1 py-0.5 rounded border border-teal-500/60 shadow whitespace-nowrap">
                    11.5 mm
                  </div>
                  <div className="w-full h-0.5 bg-teal-400" />
                </div>
                <div className="mt-1 bg-slate-900/90 text-teal-400 font-sans text-[10px] font-bold px-1.5 py-0.5 rounded border border-teal-500/40 shadow-lg whitespace-nowrap">
                  Vùng xương cắm #46: Đủ điều kiện
                </div>
              </div>
            )}
          </div>

          {/* Medical Corner Overlays */}
          {showMetadata && (
            <>
              {/* Top-Left: Patient & Acquisition Info */}
              <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 shadow-lg">
                <p className="font-sans font-bold text-white text-xs">{patientName}</p>
                <p>ID: {patientId} • Nam, 58T</p>
                <p>DOB: 1985-04-12</p>
                <p className="text-teal-400 font-semibold">Chẩn đoán: Cấy ghép Implant #46</p>
              </div>

              {/* Top-Right: Equipment & Exposure Specs */}
              <div className="absolute top-4 right-4 pointer-events-none bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 text-right space-y-1 shadow-lg">
                <p className="font-sans font-bold text-white text-xs">Vatech Pax-i3D Smart</p>
                <p>90.0 kVp • 10.0 mA</p>
                <p>Exposure: 14.5 sec • Voxel: 0.2 mm</p>
                <p className="text-sky-400">Date: {initialDate} 09:24 AM</p>
              </div>

              {/* Bottom-Left: Anatomical Landmark indicators */}
              <div className="absolute bottom-4 left-4 pointer-events-none bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  Mật độ xương D2
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Khoảng cách ống TK răng dưới: 4.2mm
                </span>
              </div>

              {/* Bottom-Right: Quick Scale */}
              <div className="absolute bottom-4 right-4 pointer-events-none bg-slate-900/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
                <div className="w-16 h-1 border-b-2 border-l-2 border-r-2 border-white" />
                <span>20 mm</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 bg-slate-900/90 px-5 py-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-medium text-slate-300">{initialFilmTitle}</span>
            <span>•</span>
            <span>Chụp bởi: BS. CKII Lê Văn Hùng</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = xrayImg;
                link.download = `DICOM_${patientId}_${initialDate.replace(/\//g, '-')}.png`;
                link.click();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Tải file DICOM (DCM/PNG)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-sky-600 px-4 py-1.5 font-bold text-white hover:bg-sky-500 transition-colors"
            >
              Hoàn tất xem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
