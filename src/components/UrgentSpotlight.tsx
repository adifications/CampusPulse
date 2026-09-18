import React from 'react';
import { AlertOctagon, Calendar, ExternalLink, ArrowRight, Clock } from 'lucide-react';
import { NoticeItem } from '../types';
import { formatDeadlineRelative, generateCalendarUrl } from '../utils/helpers';

interface UrgentSpotlightProps {
  criticalNotice: NoticeItem;
  onViewNotice: (id: string) => void;
  onAskAboutNotice: (notice: NoticeItem) => void;
}

export const UrgentSpotlight: React.FC<UrgentSpotlightProps> = ({
  criticalNotice,
  onViewNotice,
  onAskAboutNotice,
}) => {
  const primaryDeadline = criticalNotice.deadlines[0];

  return (
    <div className="bg-red-50/90 border-2 border-red-600 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-red-200">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          <span className="text-xs font-mono uppercase font-black text-red-900 tracking-wider">
            CRITICAL DEADLINE SPOTLIGHT
          </span>
          <span className="text-xs font-mono text-red-700 bg-red-200 px-2 py-0.5 font-bold">
            {criticalNotice.category}
          </span>
        </div>

        {primaryDeadline && (
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-red-950 bg-red-100 px-2.5 py-1 border border-red-300 self-start sm:self-auto">
            <Clock className="w-3.5 h-3.5 text-red-700" />
            <span>Due {formatDeadlineRelative(primaryDeadline.date)} ({primaryDeadline.date})</span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-stone-950 tracking-tight leading-snug">
            {criticalNotice.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-800 font-medium mt-1 leading-relaxed max-w-2xl">
            {criticalNotice.whyItMatters}
          </p>

          {criticalNotice.feesAndFines?.hasFee && (
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="font-bold text-stone-950 bg-white px-2 py-0.5 border border-red-200">
                Fee: {criticalNotice.feesAndFines.amount}
              </span>
              {criticalNotice.feesAndFines.lateFine && (
                <span className="text-red-700 font-bold">
                  ⚠️ Late Fine: {criticalNotice.feesAndFines.lateFine}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {primaryDeadline && (
            <a
              href={generateCalendarUrl(primaryDeadline, criticalNotice.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 text-xs font-bold bg-white hover:bg-stone-50 border border-stone-300 text-stone-900 flex items-center gap-1.5 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 text-red-700" />
              <span>Add to Calendar</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => onViewNotice(criticalNotice.id)}
            className="px-4 py-2 text-xs font-bold bg-stone-950 hover:bg-stone-800 text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
