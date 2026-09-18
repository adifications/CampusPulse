import React from 'react';
import { Calendar, Clock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { NoticeItem } from '../types';
import { formatDeadlineRelative, generateCalendarUrl } from '../utils/helpers';

interface DeadlineTimelineProps {
  notices: NoticeItem[];
  onSelectNotice: (id: string) => void;
}

interface FlattenedDeadline {
  noticeId: string;
  noticeTitle: string;
  category: string;
  importance: string;
  date: string;
  time?: string;
  description: string;
  isStrictCutoff?: boolean;
  penaltyIfMissed?: string;
}

export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({
  notices,
  onSelectNotice,
}) => {
  // Flatten and sort all deadlines
  const allDeadlines: FlattenedDeadline[] = [];
  notices.forEach((n) => {
    n.deadlines.forEach((d) => {
      allDeadlines.push({
        noticeId: n.id,
        noticeTitle: n.title,
        category: n.category,
        importance: n.importance,
        date: d.date,
        time: d.time,
        description: d.description,
        isStrictCutoff: d.isStrictCutoff,
        penaltyIfMissed: d.penaltyIfMissed,
      });
    });
  });

  allDeadlines.sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateA - dateB;
  });

  if (allDeadlines.length === 0) {
    return (
      <div className="bg-white border border-stone-300 p-8 text-center text-stone-500 font-mono text-xs">
        No active deadlines detected in these circulars.
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-300 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
        <div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>Campus Deadline Master Timeline</span>
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Chronological aggregation of all deadlines across the notice board
          </p>
        </div>
        <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-2.5 py-1 border border-stone-300">
          {allDeadlines.length} Upcoming Cutoff{allDeadlines.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative border-l-2 border-stone-200 ml-4 sm:ml-6 space-y-6">
        {allDeadlines.map((item, idx) => {
          const isCritical = item.importance === 'CRITICAL';
          return (
            <div key={idx} className="relative pl-6 sm:pl-8 group">
              {/* Timeline Pin Node */}
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                  isCritical
                    ? 'bg-red-600 border-red-200 ring-4 ring-red-100'
                    : 'bg-stone-900 border-stone-200'
                }`}
              />

              <div
                className={`p-4 border transition-all ${
                  isCritical
                    ? 'border-red-300 bg-red-50/50 hover:bg-red-50'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-stone-900">
                      {item.date} {item.time ? `• ${item.time}` : ''}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 border ${
                        isCritical
                          ? 'bg-red-600 text-white border-red-700'
                          : 'bg-stone-200 text-stone-800 border-stone-300'
                      }`}
                    >
                      {formatDeadlineRelative(item.date)}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-stone-500">
                    [{item.category}]
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 mt-1">
                  {item.description}
                </h4>

                <div className="text-xs text-stone-600 mt-1 flex items-center gap-1">
                  <span>From: </span>
                  <button
                    type="button"
                    onClick={() => onSelectNotice(item.noticeId)}
                    className="font-semibold text-stone-900 underline hover:text-amber-800 cursor-pointer"
                  >
                    {item.noticeTitle}
                  </button>
                </div>

                {item.penaltyIfMissed && (
                  <div className="mt-2 text-xs font-medium text-red-700 bg-red-100/70 p-1.5 border border-red-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Penalty if missed: {item.penaltyIfMissed}</span>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs font-mono">
                  <a
                    href={generateCalendarUrl({ date: item.date, description: item.description }, item.noticeTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1"
                  >
                    <span>+ Sync with Calendar</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onSelectNotice(item.noticeId)}
                    className="text-stone-700 hover:text-stone-950 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Jump to full circular</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
