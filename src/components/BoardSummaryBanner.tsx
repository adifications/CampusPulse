import React from 'react';
import {
  Sparkles,
  Share2,
  Calendar,
  Search,
  Building2,
  ShieldAlert,
  GraduationCap,
  Plus,
  Trash2,
} from 'lucide-react';
import { NoticeBoardSummary, UserProfile, COLLEGE_DEPARTMENTS } from '../types';

interface BoardSummaryBannerProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  feedMode: 'my-dept' | 'all-campus' | 'critical';
  onSelectFeedMode: (mode: 'my-dept' | 'all-campus' | 'critical') => void;
  selectedDeptFilter: string; // 'ALL' or 'CS', 'MECH', etc.
  onSelectDeptFilter: (deptCode: string) => void;
  myFeedCount: number;
  totalCount: number;
  criticalCount: number;
  onOpenBroadcast: () => void;
  onOpenAskModal: () => void;
  onOpenScanner: () => void;
  onClearAllCirculars?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const BoardSummaryBanner: React.FC<BoardSummaryBannerProps> = ({
  userProfile,
  onOpenProfile,
  feedMode,
  onSelectFeedMode,
  selectedDeptFilter,
  onSelectDeptFilter,
  myFeedCount,
  totalCount,
  criticalCount,
  onOpenBroadcast,
  onOpenAskModal,
  onOpenScanner,
  onClearAllCirculars,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-slate-950/50 p-5 sm:p-7 mb-6">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Top Greeting & Personalization Status */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome, {userProfile.name || 'Student'}
            </h1>
            <button
              type="button"
              onClick={onOpenProfile}
              className="text-xs font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1.5 transition-all"
              title="Click to edit profile"
            >
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{userProfile.department} Branch</span>
              <span className="text-[10px] text-cyan-400/80 font-normal">({userProfile.year || '3rd Year'})</span>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Campus circulars are saved locally and automatically removed after two weeks or after cutoff deadlines.
          </p>
        </div>

        {/* Quick Utility CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950 font-bold" />
            <span>Add Circular</span>
          </button>

          {totalCount > 0 && (
            <>
              <button
                type="button"
                onClick={onOpenBroadcast}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-white/10 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                title="Generate formatted WhatsApp digest for batch groups"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Class Digest</span>
              </button>

              <button
                type="button"
                onClick={onOpenAskModal}
                className="px-3 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ask AI</span>
              </button>
            </>
          )}

          {totalCount > 0 && onClearAllCirculars && (
            <button
              type="button"
              onClick={onClearAllCirculars}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-500/30 text-xs font-mono flex items-center gap-1 transition-all cursor-pointer"
              title="Clear all saved circulars"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* College Department Switcher Bar (7 Departments) */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter by Department (7 Branches)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Active: {selectedDeptFilter === 'ALL' ? 'All College Branches' : `${selectedDeptFilter} Only + University Wide`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onSelectDeptFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border ${
              selectedDeptFilter === 'ALL'
                ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                : 'bg-slate-800/60 text-slate-300 border-white/5 hover:border-white/20 hover:bg-slate-800'
            }`}
          >
            All Departments
          </button>

          {COLLEGE_DEPARTMENTS.map((dept) => {
            const isUserDept = userProfile.department.toUpperCase() === dept.code.toUpperCase();
            const isSelected = selectedDeptFilter.toUpperCase() === dept.code.toUpperCase();
            return (
              <button
                key={dept.code}
                type="button"
                onClick={() => onSelectDeptFilter(dept.code)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                    : isUserDept
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-slate-800/60 text-slate-300 border-white/5 hover:border-white/20 hover:bg-slate-800'
                }`}
                title={`${dept.fullName} (${dept.tagline})`}
              >
                <span>{dept.code}</span>
                {isUserDept && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-black">
                    You
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Filters & Search Bar */}
      {totalCount > 0 && (
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-white/10">
          {/* Main Feed Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectFeedMode('my-dept')}
              className={`px-3.5 py-1.5 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                feedMode === 'my-dept'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-slate-800/70 text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span>🎯 My Branch ({myFeedCount})</span>
            </button>

            {criticalCount > 0 && (
              <button
                type="button"
                onClick={() => onSelectFeedMode('critical')}
                className={`px-3.5 py-1.5 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                  feedMode === 'critical'
                    ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/30'
                    : 'bg-slate-800/70 text-red-400 border-white/5 hover:border-red-500/30'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>🚨 Critical Cutoffs ({criticalCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectFeedMode('all-campus')}
              className={`px-3.5 py-1.5 text-xs font-bold font-mono rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                feedMode === 'all-campus'
                  ? 'bg-white text-slate-950 border-white shadow-md'
                  : 'bg-slate-800/70 text-slate-300 border-white/5 hover:border-white/20'
              }`}
            >
              <span>🏛️ All Campus ({totalCount})</span>
            </button>
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search fees, dates, rules..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/60 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-xl text-white placeholder-slate-500 font-mono transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
};
