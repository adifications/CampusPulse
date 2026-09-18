import React, { useState } from 'react';
import {
  Calendar,
  AlertOctagon,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  Users,
  MessageCircleQuestion,
  Share2,
  Trash2,
  Hourglass,
  Clock,
  Sparkles,
} from 'lucide-react';
import { NoticeItem, UserProfile } from '../types';
import { generateCalendarUrl, formatDeadlineRelative } from '../utils/helpers';
import { formatExpiryRemaining } from '../utils/storage';

interface NoticeCardProps {
  notice: NoticeItem;
  userProfile?: UserProfile;
  isSelected?: boolean;
  onAskAboutNotice: (notice: NoticeItem) => void;
  onDeleteNotice?: (id: string) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  userProfile,
  isSelected,
  onAskAboutNotice,
  onDeleteNotice,
}) => {
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Check department matching
  const isCollegeWide =
    !notice.relevantDepartments ||
    notice.relevantDepartments.includes('ALL') ||
    notice.relevantDepartments.length === 0;

  const isUserDeptMatch =
    userProfile &&
    notice.relevantDepartments &&
    notice.relevantDepartments.some(
      (d) =>
        d.toUpperCase() === userProfile.department.toUpperCase() ||
        ((userProfile.department.toUpperCase() === 'CS' || userProfile.department.toUpperCase() === 'CSE') &&
          (d.toUpperCase() === 'CS' || d.toUpperCase() === 'CSE'))
    );

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopyNoticeDigest = () => {
    const text = `📢 *${notice.title}* (${notice.category})
📌 *Why it matters*: ${notice.whyItMatters}

⏳ *Deadlines*:
${notice.deadlines.map((d) => `• ${d.description}: ${d.date} ${d.time || ''}`).join('\n')}

Issued by: ${notice.department}`;

    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Glassmorphic priority styles
  const getCardTheme = () => {
    switch (notice.importance) {
      case 'CRITICAL':
        return {
          cardBorder: isSelected
            ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] ring-1 ring-red-500/50'
            : 'border-red-500/30 hover:border-red-500/60 shadow-lg shadow-red-950/20',
          leftStripe: 'border-l-4 border-l-red-500',
          pill: 'bg-red-500/20 text-red-300 border border-red-500/40',
          gradientBg: 'from-red-950/20 via-slate-900/60 to-slate-900/80',
        };
      case 'HIGH':
        return {
          cardBorder: isSelected
            ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
            : 'border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-950/20',
          leftStripe: 'border-l-4 border-l-amber-500',
          pill: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
          gradientBg: 'from-amber-950/15 via-slate-900/60 to-slate-900/80',
        };
      default:
        return {
          cardBorder: isSelected
            ? 'border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/50'
            : 'border-white/10 hover:border-white/20 shadow-lg shadow-slate-950/40',
          leftStripe: 'border-l-4 border-l-cyan-500/60',
          pill: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
          gradientBg: 'from-slate-900/60 via-slate-900/70 to-slate-900/80',
        };
    }
  };

  const theme = getCardTheme();

  return (
    <article
      id={`notice-${notice.id}`}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${theme.gradientBg} backdrop-blur-xl border ${theme.cardBorder} ${theme.leftStripe} p-5 sm:p-6 transition-all duration-300`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Pill */}
          <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold tracking-wider ${theme.pill}`}>
            {notice.importance} PRIORITY
          </span>

          {/* Department Scope Pill */}
          {isCollegeWide ? (
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
              🏛️ College-Wide
            </span>
          ) : isUserDeptMatch ? (
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              🎯 Your Branch ({userProfile?.department})
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
              Branch: {notice.relevantDepartments?.join(', ')}
            </span>
          )}

          {/* Category */}
          <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-800/60 text-slate-300 border border-white/5 font-medium">
            {notice.category}
          </span>
        </div>

        {/* Expiry Pill & Quick Action Bar */}
        <div className="flex items-center space-x-2">
          {/* Auto-Expiry info */}
          <div
            className="flex items-center space-x-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-full border border-white/5"
            title={notice.expiryNote || 'Circular retention status'}
          >
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span>{formatExpiryRemaining(notice.expiresAt)}</span>
          </div>

          {/* Share */}
          <button
            type="button"
            onClick={handleCopyNoticeDigest}
            className="text-[11px] font-mono text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center gap-1 cursor-pointer transition-colors"
            title="Copy WhatsApp digest"
          >
            <Share2 className="w-3 h-3" />
            <span>{copiedNotice ? 'Copied' : 'Share'}</span>
          </button>

          {/* Ask AI */}
          <button
            type="button"
            onClick={() => onAskAboutNotice(notice)}
            className="text-[11px] font-mono text-cyan-200 hover:text-white px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 flex items-center gap-1 cursor-pointer font-bold transition-colors"
            title="Ask AI questions about this circular"
          >
            <MessageCircleQuestion className="w-3 h-3 text-cyan-400" />
            <span>Ask AI</span>
          </button>

          {/* Manual Delete / Dismiss Button */}
          {onDeleteNotice && (
            <button
              type="button"
              onClick={() => onDeleteNotice(notice.id)}
              className="text-[11px] font-mono text-red-400 hover:text-red-200 hover:bg-red-950/50 p-1.5 rounded-lg border border-transparent hover:border-red-500/30 flex items-center transition-colors cursor-pointer"
              title="Remove this circular"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Title & Department */}
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
          {notice.title}
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          {notice.department}
          {notice.referenceNumber && <span> • Ref: {notice.referenceNumber}</span>}
          {notice.issueDate && <span> • Issued: {notice.issueDate}</span>}
        </p>
      </div>

      {/* Why It Matters / TLDR Callout */}
      <div className="bg-slate-950/50 rounded-xl p-3.5 border border-white/5 mb-4">
        <div className="flex items-start gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 font-mono uppercase text-[11px] block">
              Core Impact / What You Need to Know:
            </span>
            <p className="text-slate-200 font-medium leading-relaxed mt-0.5">
              {notice.whyItMatters}
            </p>
          </div>
        </div>
      </div>

      {/* Student-Friendly Bulleted Highlights */}
      <div className="mb-4">
        <h4 className="text-[11px] font-mono uppercase font-bold text-slate-400 mb-2 tracking-wider">
          Bulleted Highlights
        </h4>
        <ul className="space-y-1.5">
          {notice.bulletPoints.map((point, idx) => (
            <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-2 mr-2.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deadlines Strip */}
      {notice.deadlines && notice.deadlines.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deadlines & Cutoffs</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {notice.deadlines.map((dl, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-white/5 text-xs font-mono"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{dl.date}</span>
                    {dl.time && <span className="text-slate-400 font-normal">{dl.time}</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {dl.description}
                  </div>
                </div>

                <a
                  href={generateCalendarUrl(dl, notice.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors"
                  title="Add to Google Calendar"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Calendar</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Checklist (Actionable Student Items) */}
      {notice.actionItems && notice.actionItems.length > 0 && (
        <div className="mb-3">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-2 tracking-wider">
            Student Action Checklist
          </span>
          <div className="space-y-1.5">
            {notice.actionItems.map((action, idx) => {
              const isChecked = completedActions[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through opacity-70'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/10 text-slate-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 leading-snug">
                    <span>{action.text}</span>
                    {action.deadline && (
                      <span className="block text-[10px] font-mono text-amber-400 mt-0.5">
                        Due: {action.deadline}
                      </span>
                    )}
                  </div>
                  {action.linkOrVenue && (
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20 shrink-0">
                      {action.linkOrVenue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expandable Official Clause Details */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>{isExpanded ? 'Hide Official Clause & Contact' : 'Show Official Circular Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {notice.feesAndFines?.hasFee && (
          <span className="text-xs font-mono text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
            Fee: {notice.feesAndFines.amount}
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-3 text-xs text-slate-300 font-mono">
          {notice.officialTitle && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Official Title:</span>
              <p className="text-slate-300">{notice.officialTitle}</p>
            </div>
          )}

          {notice.targetAudience && notice.targetAudience.length > 0 && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Target Audience:</span>
              <p className="text-slate-300">{notice.targetAudience.join(', ')}</p>
            </div>
          )}

          {notice.contactPerson && (
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Contact / Authority:</span>
              <p className="text-slate-300">
                {notice.contactPerson.name} {notice.contactPerson.office ? `• ${notice.contactPerson.office}` : ''}{' '}
                {notice.contactPerson.emailOrPhone ? `• ${notice.contactPerson.emailOrPhone}` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
