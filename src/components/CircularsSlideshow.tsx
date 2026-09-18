import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
  Pause,
  Play,
  Hourglass,
} from 'lucide-react';
import { NoticeItem, UserProfile } from '../types';
import { formatExpiryRemaining } from '../utils/storage';

interface CircularsSlideshowProps {
  circulars: NoticeItem[];
  onSelectCircular: (id: string) => void;
  userProfile?: UserProfile;
}

export const CircularsSlideshow: React.FC<CircularsSlideshowProps> = ({
  circulars,
  onSelectCircular,
  userProfile,
}) => {
  // If there's nothing, skip it as requested!
  if (!circulars || circulars.length === 0) {
    return null;
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-slide from right to left every 4.5 seconds
  useEffect(() => {
    if (isPlaying && !isHovered && circulars.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % circulars.length);
      }, 4500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, circulars.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? circulars.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % circulars.length);
  };

  const activeCircular = circulars[currentIndex] || circulars[0];
  const primaryDeadline = activeCircular.deadlines?.[0];

  const getPriorityTheme = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          glow: 'shadow-[0_0_35px_rgba(239,68,68,0.22)] border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900/80 to-slate-900/90',
          badge: 'bg-red-500/20 text-red-300 border-red-500/40',
          accent: 'text-red-400',
          indicator: 'bg-red-500',
        };
      case 'HIGH':
        return {
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.18)] border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900/90',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          accent: 'text-amber-400',
          indicator: 'bg-amber-500',
        };
      default:
        return {
          glow: 'shadow-[0_0_30px_rgba(6,182,212,0.15)] border-cyan-500/30 bg-gradient-to-r from-cyan-950/25 via-slate-900/80 to-slate-900/90',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          accent: 'text-cyan-400',
          indicator: 'bg-cyan-400',
        };
    }
  };

  const theme = getPriorityTheme(activeCircular.importance);

  return (
    <div
      className="mb-8 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slideshow Top HUD */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Circulars Carousel</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
            {currentIndex + 1} of {circulars.length}
          </span>
        </div>

        {/* Controls: Play/Pause, Prev, Next */}
        <div className="flex items-center space-x-2">
          {circulars.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
                title={isPlaying ? 'Pause Auto-Scroll' : 'Play Auto-Scroll'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-cyan-400" />}
              </button>
              <button
                type="button"
                onClick={handlePrev}
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Previous Circular"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Next Circular"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Glassmorphic Slide Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all duration-500 ${theme.glow}`}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

        <div className="p-5 sm:p-7">
          {/* Tags & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold border ${theme.badge}`}
              >
                {activeCircular.importance} PRIORITY
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80">
                {activeCircular.category}
              </span>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-700/40">
                {activeCircular.department}
              </span>
            </div>

            {/* Auto-Expiry Pill */}
            <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded-full border border-white/5">
              <Hourglass className="w-3 h-3 text-amber-400" />
              <span>{formatExpiryRemaining(activeCircular.expiresAt)}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
              {activeCircular.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed line-clamp-2">
              {activeCircular.oneLineTLDR || activeCircular.whyItMatters}
            </p>
          </div>

          {/* Bottom Bar: Key Deadline + View Details CTA */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {primaryDeadline ? (
              <div className="flex items-center space-x-2 text-xs font-mono">
                <Clock className={`w-4 h-4 ${theme.accent}`} />
                <span className="text-slate-300">Cutoff:</span>
                <span className="font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-white/10">
                  {primaryDeadline.date} {primaryDeadline.time || ''}
                </span>
                {primaryDeadline.description && (
                  <span className="text-slate-400 hidden md:inline truncate max-w-xs">
                    — {primaryDeadline.description}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs font-mono text-slate-400">
                Issued by {activeCircular.department}
              </div>
            )}

            <button
              type="button"
              onClick={() => onSelectCircular(activeCircular.id)}
              className="self-start sm:self-auto px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
            >
              <span>View Full Highlights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Pagination Dots */}
        {circulars.length > 1 && (
          <div className="px-5 pb-3 flex items-center justify-center space-x-1.5">
            {circulars.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
