import React, { useState } from 'react';
import { Eye, EyeOff, MapPin, ExternalLink } from 'lucide-react';
import { NoticeItem } from '../types';

interface NoticeBoardViewerProps {
  imageUrl?: string;
  notices: NoticeItem[];
  selectedNoticeId: string | null;
  onSelectNotice: (id: string) => void;
}

export const NoticeBoardViewer: React.FC<NoticeBoardViewerProps> = ({
  imageUrl,
  notices,
  selectedNoticeId,
  onSelectNotice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className="bg-stone-50 border border-stone-300 p-3 sm:p-4 mb-6 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-mono font-bold text-stone-900">
            Source Physical Board Photo ({notices.length} circulars pinned)
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-xs font-mono font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          {isExpanded ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-stone-500" />
              <span>Hide Board Photo</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              <span>Inspect Original Corkboard Photo</span>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-stone-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Visual Image with Overlaid Bounding Box Pin Highlights */}
            <div className="lg:col-span-8 relative bg-stone-950 border border-stone-300 overflow-hidden flex items-center justify-center min-h-[280px]">
              <img
                src={imageUrl}
                alt="Source Campus Notice Board"
                className="w-full max-h-[380px] object-contain select-none"
              />

              {notices.map((notice, idx) => {
                const isSelected = selectedNoticeId === notice.id;
                const box = notice.noticePositionOnBoard?.estimatedBoundingBox;
                if (!box) return null;

                const topPercent = (box.ymin / 1000) * 100;
                const leftPercent = (box.xmin / 1000) * 100;
                const heightPercent = ((box.ymax - box.ymin) / 1000) * 100;
                const widthPercent = ((box.xmax - box.xmin) / 1000) * 100;

                return (
                  <div
                    key={notice.id}
                    onClick={() => onSelectNotice(notice.id)}
                    style={{
                      top: `${topPercent}%`,
                      left: `${leftPercent}%`,
                      height: `${heightPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    className={`absolute border-2 transition-all cursor-pointer flex flex-col justify-start p-1 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/25 z-20 ring-2 ring-amber-400'
                        : notice.importance === 'CRITICAL'
                        ? 'border-red-500 bg-red-500/15 hover:bg-red-500/30'
                        : 'border-stone-200/80 bg-stone-900/20 hover:bg-stone-900/40'
                    }`}
                  >
                    <span
                      className={`text-[9px] font-mono px-1 py-0.2 self-start font-bold ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950'
                          : notice.importance === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : 'bg-stone-900 text-white'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Pinned Circulars List */}
            <div className="lg:col-span-4 space-y-2 max-h-[380px] overflow-y-auto">
              <span className="text-[11px] font-mono uppercase font-bold text-stone-500 block mb-1">
                Click pin to scroll to circular:
              </span>
              {notices.map((notice, idx) => {
                const isSelected = selectedNoticeId === notice.id;
                return (
                  <div
                    key={notice.id}
                    onClick={() => onSelectNotice(notice.id)}
                    className={`p-2.5 border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-stone-500 mb-0.5">
                      <span className="font-bold text-stone-900">Notice #{idx + 1}</span>
                      <span className={notice.importance === 'CRITICAL' ? 'text-red-700 font-bold' : ''}>
                        {notice.importance}
                      </span>
                    </div>
                    <h5 className="font-bold text-stone-900 line-clamp-1">{notice.title}</h5>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {notice.department}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
