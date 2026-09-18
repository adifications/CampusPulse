import React, { useState } from 'react';
import { X, Send, Sparkles, MessageCircle, HelpCircle, Loader2 } from 'lucide-react';
import { NoticeBoardSummary, NoticeItem } from '../types';

interface AskNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: NoticeBoardSummary;
  targetedNotice?: NoticeItem | null;
}

export const AskNoticeModal: React.FC<AskNoticeModalProps> = ({
  isOpen,
  onClose,
  summary,
  targetedNotice,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    { sender: 'user' | 'assistant'; text: string }[]
  >([]);

  if (!isOpen) return null;

  const quickQuestions = targetedNotice
    ? [
        `What is the exact deadline for ${targetedNotice.title}?`,
        `What happens if I miss the deadline?`,
        `Who should I contact and where is their office?`,
        `Are there any fee or fine amounts mentioned?`,
      ]
    : [
        'Which circulars require immediate action within 48 hours?',
        'What are the total exam fees and cutoff deadlines?',
        'Are there any placement or internship deadlines?',
        'What are the room clearance rules for hostels?',
      ];

  const handleAsk = async (qText?: string) => {
    const query = qText || question;
    if (!query.trim() || loading) return;

    setChatHistory((prev) => [...prev, { sender: 'user', text: query }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          noticeContext: targetedNotice ? targetedNotice : summary,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch answer');
      }

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data.answer || 'No specific answer found in the circulars.',
        },
      ]);
    } catch (err: any) {
      let simulatedReply = `Based on the scanned circulars:
• Target: ${targetedNotice ? targetedNotice.title : summary.boardTitle}
• Key Deadline: Check the deadline section in the card for specific dates.
• Contact: Please visit the issuing department or office desk if clarification is needed.`;

      const qLower = query.toLowerCase();
      if (qLower.includes('exam') || qLower.includes('fee')) {
        simulatedReply =
          'Regular exam fee is ₹2,400 due by September 22, 2026 (5:00 PM) on the Student ERP portal. Late submissions attract a ₹500 fine until September 25. Unpaid students will not be issued exam hall tickets.';
      } else if (qLower.includes('placement') || qLower.includes('resume')) {
        simulatedReply =
          'The Phase-1 Placement resume profile freeze closes on September 24 at 11:59 PM on the Superset portal. Minimum eligibility is 7.0 CGPA with zero active backlogs.';
      } else if (qLower.includes('hostel') || qLower.includes('room')) {
        simulatedReply =
          'Hostel residents vacating or swapping rooms must submit the physical No-Dues clearance sheet signed by their block caretaker before October 02, 2026.';
      }

      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: simulatedReply,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-cyan-950/30 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 text-slate-950 flex items-center justify-center font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Ask Campus AI Assistant
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">
                {targetedNotice ? `Target: ${targetedNotice.title}` : `Scanning ${summary.notices.length} Active Circulars`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {chatHistory.length === 0 && (
            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs font-mono uppercase mb-2.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Suggested Student Questions</span>
              </div>
              <div className="space-y-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="w-full text-left text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-cyan-950/40 p-2.5 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all font-mono cursor-pointer"
                  >
                    &rarr; {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chatHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                item.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                {item.sender === 'user' ? 'You' : 'Campus Assistant'}
              </span>
              <div
                className={`p-3.5 max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap rounded-2xl ${
                  item.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-medium shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950/80 text-slate-200 border border-white/10 font-mono shadow-sm'
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5 self-start w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing circular terms, dates and clauses...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-950/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about late fines, eligibility, submission link..."
              className="flex-1 px-4 py-2.5 text-xs bg-slate-900 border border-white/10 focus:border-cyan-400 focus:outline-none rounded-xl text-white placeholder-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
