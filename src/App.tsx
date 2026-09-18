import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScanInputSection } from './components/ScanInputSection';
import { BoardSummaryBanner } from './components/BoardSummaryBanner';
import { CircularsSlideshow } from './components/CircularsSlideshow';
import { NoticeCard } from './components/NoticeCard';
import { BroadcastModal } from './components/BroadcastModal';
import { AskNoticeModal } from './components/AskNoticeModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { DEMO_SAMPLES } from './data/samples';
import { DemoSample, NoticeBoardSummary, NoticeItem, UserProfile } from './types';
import {
  loadSavedCirculars,
  saveNewCirculars,
  removeCircularById,
} from './utils/storage';
import {
  AlertTriangle,
  RefreshCw,
  Camera,
  Upload,
  Sparkles,
  Layers,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
} from 'lucide-react';

const PROFILE_STORAGE_KEY = 'campuspulse_student_profile';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Student',
  department: 'CS',
  year: '3rd Year',
  isHosteller: true,
};

export default function App() {
  // Student Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.department === 'CSE') parsed.department = 'CS';
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PROFILE;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // START FRESH: Load persistent saved circulars from browser storage (auto-prunes expired notices > 2 weeks or past deadlines)
  const [savedCirculars, setSavedCirculars] = useState<NoticeItem[]>(() => {
    return loadSavedCirculars();
  });

  // Views & UI states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerInitialTab, setScannerInitialTab] = useState<'camera' | 'upload' | 'samples'>('upload');
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  // Feed Mode: 'my-dept' (Default, cleansed), 'all-campus', or 'critical'
  const [feedMode, setFeedMode] = useState<'my-dept' | 'all-campus' | 'critical'>('my-dept');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(() => userProfile.department || 'CS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [targetedNoticeForAsk, setTargetedNoticeForAsk] = useState<NoticeItem | null>(null);

  // Scanning state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScanParams, setLastScanParams] = useState<{
    base64Image: string;
    mimeType: string;
    scanMode: 'multi' | 'single';
  } | null>(null);

  // Keep selectedDeptFilter in sync with profile when in my-dept mode
  useEffect(() => {
    if (feedMode === 'my-dept') {
      setSelectedDeptFilter(userProfile.department);
    } else if (feedMode === 'all-campus') {
      setSelectedDeptFilter('ALL');
    }
  }, [feedMode, userProfile.department]);

  // Save profile updates
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (feedMode === 'my-dept') {
      setSelectedDeptFilter(newProfile.department);
    }
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Optional: load demo if user explicitly clicks sample in empty state
  const handleLoadSample = (sample: DemoSample) => {
    const updated = saveNewCirculars(sample.simulatedData.notices);
    setSavedCirculars(updated);
    setIsScannerOpen(false);
    setErrorMessage(null);
  };

  // Clear all circulars manually
  const handleClearAllCirculars = () => {
    if (window.confirm('Are you sure you want to clear all circulars from this browser?')) {
      try {
        localStorage.removeItem('campuspulse_circulars_v2');
      } catch (e) {
        console.error(e);
      }
      setSavedCirculars([]);
    }
  };

  // Delete an individual circular manually (normal user removal)
  const handleDeleteNotice = (id: string) => {
    const updated = removeCircularById(id);
    setSavedCirculars(updated);
  };

  const handleScanImage = async (
    base64Image: string,
    mimeType: string,
    scanMode: 'multi' | 'single'
  ) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setLastScanParams({ base64Image, mimeType, scanMode });
    setAnalysisStep('Google Lens engine: Segmenting canvas & isolating pinned circulars...');

    try {
      const stepTimer1 = setTimeout(() => {
        setAnalysisStep('Detecting circular boundaries & reading department letterheads...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setAnalysisStep('Connecting to AI Vision Engine (auto-failover enabled for high demand)...');
      }, 2500);

      const stepTimer3 = setTimeout(() => {
        setAnalysisStep('Extracting exam fees, strict deadlines & penalty schedules...');
      }, 5000);

      const stepTimer4 = setTimeout(() => {
        setAnalysisStep('Translating academic clauses into student-friendly bulleted highlights...');
      }, 7500);

      const response = await fetch('/api/summarize-notice-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType,
          scanMode,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      clearTimeout(stepTimer4);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        let rawError = errJson.error || `Server responded with status ${response.status}`;

        try {
          if (typeof rawError === 'string' && rawError.trim().startsWith('{')) {
            const parsed = JSON.parse(rawError);
            if (parsed?.error?.message) {
              rawError = parsed.error.message;
            }
          }
        } catch {
          // ignore
        }

        if (
          rawError.toLowerCase().includes('high demand') ||
          rawError.toLowerCase().includes('503') ||
          rawError.toLowerCase().includes('unavailable')
        ) {
          throw new Error(
            'The AI vision model experienced a temporary demand spike. Our server has cycled to backup models. Click "Retry Scan" to process your image.'
          );
        }

        throw new Error(rawError);
      }

      const resData = await response.json();
      if (!resData.data || !Array.isArray(resData.data.notices)) {
        throw new Error('Invalid response structure received from notice board analyzer.');
      }

      // SAVE IN WEBSITE PERSISTENTLY (removed only after 2 weeks or cutoff or user delete)
      const updatedCirculars = saveNewCirculars(resData.data.notices);
      setSavedCirculars(updatedCirculars);

      setSelectedNoticeId(null);
      setIsScannerOpen(false);
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMessage(
        err.message || 'Failed to process image. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleOpenAskForNotice = (notice: NoticeItem) => {
    setTargetedNoticeForAsk(notice);
    setIsAskModalOpen(true);
  };

  const handleOpenGeneralAsk = () => {
    setTargetedNoticeForAsk(null);
    setIsAskModalOpen(true);
  };

  // Check if notice is relevant to a specific department (or college-wide)
  const isNoticeRelevantToDept = (notice: NoticeItem, dept: string): boolean => {
    if (!notice.relevantDepartments || notice.relevantDepartments.length === 0) {
      return true; // default to general
    }
    if (notice.relevantDepartments.includes('ALL')) {
      return true; // college-wide announcement
    }
    const target = dept.toUpperCase();
    return notice.relevantDepartments.some((d) => {
      const norm = d.toUpperCase();
      if (norm === target) return true;
      if ((target === 'CS' || target === 'CSE') && (norm === 'CS' || norm === 'CSE')) return true;
      return false;
    });
  };

  // Filter notices based on feedMode, selected department filter, and search query
  const myDeptNotices = savedCirculars.filter((n) =>
    isNoticeRelevantToDept(n, userProfile.department)
  );

  const displayedNotices = savedCirculars.filter((notice) => {
    // 1. Critical mode filter
    if (feedMode === 'critical' && notice.importance !== 'CRITICAL') {
      return false;
    }

    // 2. Department filter
    if (selectedDeptFilter !== 'ALL') {
      if (!isNoticeRelevantToDept(notice, selectedDeptFilter)) {
        return false;
      }
    } else if (feedMode === 'my-dept') {
      if (!isNoticeRelevantToDept(notice, userProfile.department)) {
        return false;
      }
    }

    // 3. Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = notice.title.toLowerCase().includes(q);
      const matchDept = notice.department.toLowerCase().includes(q);
      const matchWhy = notice.whyItMatters.toLowerCase().includes(q);
      const matchBullets = notice.bulletPoints?.some((b) => b.toLowerCase().includes(q));
      return matchTitle || matchDept || matchWhy || matchBullets;
    }

    return true;
  });

  // SORT STRICTLY ACCORDING TO PRIORITY (CRITICAL -> HIGH -> NORMAL -> LOW)
  const sortedNotices = [...displayedNotices].sort((a, b) => {
    const priorityRank: Record<string, number> = {
      CRITICAL: 1,
      HIGH: 2,
      NORMAL: 3,
      LOW: 4,
    };
    return (priorityRank[a.importance] || 5) - (priorityRank[b.importance] || 5);
  });

  const criticalCount = savedCirculars.filter((n) => n.importance === 'CRITICAL').length;

  const handleSelectNoticeFromViewer = (id: string) => {
    setSelectedNoticeId(id);
    const element = document.getElementById(`notice-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSelectDeptFilter = (deptCode: string) => {
    setSelectedDeptFilter(deptCode);
    if (deptCode === 'ALL') {
      setFeedMode('all-campus');
    } else if (deptCode.toUpperCase() === userProfile.department.toUpperCase()) {
      setFeedMode('my-dept');
    }
  };

  const handleSelectFeedMode = (mode: 'my-dept' | 'all-campus' | 'critical') => {
    setFeedMode(mode);
    if (mode === 'my-dept') {
      setSelectedDeptFilter(userProfile.department);
    } else if (mode === 'all-campus') {
      setSelectedDeptFilter('ALL');
    }
  };

  // Synthesized summary object for modal helpers
  const synthesizedSummary: NoticeBoardSummary = {
    boardTitle: 'Campus Notice Stream',
    scanTimestamp: new Date().toISOString(),
    totalNoticesFound: savedCirculars.length,
    criticalCount,
    highCount: savedCirculars.filter((n) => n.importance === 'HIGH').length,
    notices: savedCirculars,
    urgentBroadcastMessage: savedCirculars
      .filter((n) => n.importance === 'CRITICAL' || n.importance === 'HIGH')
      .map((n) => `• ${n.title} (${n.department}): ${n.oneLineTLDR}`)
      .join('\n'),
    executiveSummary: `Currently tracking ${savedCirculars.length} active campus circulars.`,
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-cyan-400 selection:text-slate-950 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[130px] pointer-events-none" />
      <div className="fixed top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <Navbar
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenScanner={() => {
          if (!isScannerOpen) setScannerInitialTab('upload');
          setIsScannerOpen(!isScannerOpen);
        }}
        feedMode={feedMode}
        onToggleFeedMode={handleSelectFeedMode}
        myFeedCount={myDeptNotices.length}
        totalCount={savedCirculars.length}
        criticalCount={criticalCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Error notification with immediate Retry action */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs sm:text-sm text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono uppercase block text-red-300 tracking-wide text-xs">
                  Scan Processing Note
                </span>
                <span className="text-red-200/90 leading-relaxed">{errorMessage}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {lastScanParams && (
                <button
                  type="button"
                  onClick={() =>
                    handleScanImage(
                      lastScanParams.base64Image,
                      lastScanParams.mimeType,
                      lastScanParams.scanMode
                    )
                  }
                  className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer rounded-xl"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Scan
                </button>
              )}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-2.5 py-1.5 text-xs font-mono font-bold uppercase text-red-300 hover:text-white underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Google Lens Camera & Document Scanner Section */}
        {isScannerOpen && (
          <ScanInputSection
            onScanImage={handleScanImage}
            onLoadDemo={handleLoadSample}
            isLoading={isAnalyzing}
            onClose={() => setIsScannerOpen(false)}
            initialTab={scannerInitialTab}
          />
        )}

        {/* AI Analyzing Status HUD */}
        {isAnalyzing && (
          <div className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 mb-6 text-center shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl">
            <div className="inline-flex p-3 bg-cyan-500/10 rounded-full mb-3 border border-cyan-500/30">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Analyzing Circular with Multimodal Vision AI
            </h3>
            <p className="text-xs font-mono text-cyan-300 mt-2 max-w-md mx-auto">
              {analysisStep || 'Segmenting notices, parsing deadlines, and filtering by department...'}
            </p>
          </div>
        )}

        {/* Top Control Banner & 7-Department Switcher */}
        <BoardSummaryBanner
          userProfile={userProfile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          feedMode={feedMode}
          onSelectFeedMode={handleSelectFeedMode}
          selectedDeptFilter={selectedDeptFilter}
          onSelectDeptFilter={handleSelectDeptFilter}
          myFeedCount={myDeptNotices.length}
          totalCount={savedCirculars.length}
          criticalCount={criticalCount}
          onOpenBroadcast={() => setIsBroadcastModalOpen(true)}
          onOpenAskModal={handleOpenGeneralAsk}
          onOpenScanner={() => {
            setScannerInitialTab('upload');
            setIsScannerOpen(true);
          }}
          onClearAllCirculars={savedCirculars.length > 0 ? handleClearAllCirculars : undefined}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* SLIDESHOW (RIGHT TO LEFT) OF ALL AVAILABLE CIRCULARS (SKIPPED IF NOTHING!) */}
        <CircularsSlideshow
          circulars={displayedNotices}
          onSelectCircular={handleSelectNoticeFromViewer}
          userProfile={userProfile}
        />

        {/* BELOW THE SLIDESHOW: ALL CIRCULAR DETAILS ACCORDING TO PRIORITY */}
        {savedCirculars.length > 0 ? (
          <div>
            {/* Feed Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase font-bold text-slate-200">
                  {selectedDeptFilter !== 'ALL'
                    ? `Notices for ${selectedDeptFilter} & University-Wide Circulars`
                    : feedMode === 'critical'
                    ? 'Critical Urgency Circulars Only'
                    : 'All Campus Notices (7 Departments)'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-white/10 font-bold">
                  {sortedNotices.length} active
                </span>
              </div>

              {selectedDeptFilter !== 'ALL' && savedCirculars.length > sortedNotices.length && (
                <button
                  type="button"
                  onClick={() => handleSelectDeptFilter('ALL')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                >
                  +{savedCirculars.length - sortedNotices.length} other branch circulars hidden (View All)
                </button>
              )}
            </div>

            {/* List of clean, student-friendly notice cards ordered by priority */}
            {sortedNotices.length > 0 ? (
              <div className="space-y-4">
                {sortedNotices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    userProfile={userProfile}
                    isSelected={selectedNoticeId === notice.id}
                    onAskAboutNotice={handleOpenAskForNotice}
                    onDeleteNotice={handleDeleteNotice}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-white/10 p-10 text-center rounded-2xl backdrop-blur-xl">
                <p className="text-sm font-bold text-slate-200">
                  No circulars match your current filter.
                </p>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Try clearing the search query or switching to "All Departments".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectDeptFilter('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 text-xs font-black cursor-pointer rounded-xl shadow-lg"
                >
                  Show All Active Circulars ({savedCirculars.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          /* START FRESH EMPTY STATE: Clean, modern glassmorphic landing for when no circulars are entered yet */
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 text-center shadow-2xl shadow-slate-950/60 my-6">
            {/* Ambient subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-cyan-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-lg mx-auto">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <Camera className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                No Circulars Added Yet
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Take a photo of an official college notice or upload an image. The AI will extract deadlines, exam fees, and student highlights, saving them in your browser for 2 weeks or until cutoff.
              </p>

              {/* Primary Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setScannerInitialTab('camera');
                    setIsScannerOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan with Google Lens</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScannerInitialTab('upload');
                    setIsScannerOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Upload Image</span>
                </button>
              </div>

              {/* Subtle Testing Sample Link */}
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
                <span>Want to test immediately?</span>
                <button
                  type="button"
                  onClick={() => handleLoadSample(DEMO_SAMPLES[0])}
                  className="text-cyan-400 hover:text-cyan-300 underline font-bold cursor-pointer"
                >
                  Load Demo Board Sample
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Glass Footer */}
      <footer className="mt-auto border-t border-white/10 bg-slate-950/70 backdrop-blur-xl py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">CampusPulse</span>
            <span>•</span>
            <span>Smart Notice Board Summarizer with Local Browser Retention</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setScannerInitialTab('upload');
                setIsScannerOpen(true);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
            >
              Add Circular
            </button>
            <span>•</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-slate-300 hover:text-white underline cursor-pointer"
            >
              My Branch Profile
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveProfile}
      />

      <BroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        summary={synthesizedSummary}
      />

      <AskNoticeModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        summary={synthesizedSummary}
        targetedNotice={targetedNoticeForAsk}
      />
    </div>
  );
}
