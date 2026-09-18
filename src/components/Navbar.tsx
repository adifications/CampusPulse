import React from 'react';
import { Camera, ChevronDown, Sparkles, Building2, ShieldAlert, Layers } from 'lucide-react';
import { UserProfile, COLLEGE_DEPARTMENTS } from '../types';

interface NavbarProps {
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
  feedMode: 'my-dept' | 'all-campus' | 'critical';
  onToggleFeedMode: (mode: 'my-dept' | 'all-campus' | 'critical') => void;
  myFeedCount: number;
  totalCount: number;
  criticalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  userProfile,
  onOpenProfile,
  onOpenScanner,
  feedMode,
  onToggleFeedMode,
  myFeedCount,
  totalCount,
  criticalCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-2xl text-white border-b border-white/10 shadow-2xl shadow-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Campus Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            CP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black tracking-tight text-base sm:text-lg text-white">
                CAMPUS<span className="text-cyan-400">PULSE</span>
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold">
                Smart Notice AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono">
              Academic Hub • {userProfile.department} Portal
            </p>
          </div>
        </div>

        {/* Center: Feed Cleanser Mode Tabs */}
        {totalCount > 0 && (
          <div className="hidden lg:flex items-center bg-slate-900/80 border border-white/10 rounded-xl p-1 text-xs font-mono backdrop-blur-md">
            <button
              type="button"
              onClick={() => onToggleFeedMode('my-dept')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                feedMode === 'my-dept'
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Shows only notices for your branch + college-wide circulars"
            >
              <span>My Feed ({userProfile.department})</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${feedMode === 'my-dept' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {myFeedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFeedMode('all-campus')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                feedMode === 'all-campus'
                  ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Shows circulars across all 7 departments"
            >
              <span>All Campus</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${feedMode === 'all-campus' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {totalCount}
              </span>
            </button>

            {criticalCount > 0 && (
              <button
                type="button"
                onClick={() => onToggleFeedMode('critical')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  feedMode === 'critical'
                    ? 'bg-red-500 text-white font-bold shadow-md shadow-red-500/30'
                    : 'text-red-400 hover:text-red-300'
                }`}
                title="Filter to critical cutoff circulars"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Urgent ({criticalCount})</span>
              </button>
            )}
          </div>
        )}

        {/* Right: Student Profile & Google Lens Scanner Action */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Department / Student Profile Trigger */}
          <button
            type="button"
            onClick={onOpenProfile}
            id="student-profile-trigger"
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-850 text-slate-200 text-xs border border-white/10 hover:border-white/20 rounded-xl transition-all cursor-pointer backdrop-blur-md"
            title="Change your branch (CS, ECE, EEE, MECH, CIVIL, MCA, MTECH)"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="font-bold text-white max-w-[80px] sm:max-w-none truncate">
              {userProfile.name || 'Student'}
            </span>
            <span className="text-cyan-400 font-mono font-bold">
              [{userProfile.department}]
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Google Lens Scanner CTA Button */}
          <button
            type="button"
            onClick={onOpenScanner}
            id="scan-notice-btn"
            className="relative flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-95"
            title="Open Google Lens Ultra-HD Camera Scanner"
          >
            <Camera className="w-4 h-4 text-slate-950 font-bold" />
            <span className="hidden sm:inline">Google Lens Scan</span>
            <span className="sm:hidden">Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
