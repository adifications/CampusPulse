import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Share2 } from 'lucide-react';
import { NoticeBoardSummary } from '../types';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: NoticeBoardSummary;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.urgentBroadcastMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-emerald-950/20 p-6 sm:p-7">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Class Representative Broadcast Digest
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Formatted for instant forwarding to student WhatsApp groups, Telegram batches, and Discord announcement channels.
        </p>

        {/* Formatted Text Box */}
        <div className="bg-slate-950/80 text-emerald-300 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap rounded-xl border border-white/5 max-h-[360px] overflow-y-auto select-all">
          {summary.urgentBroadcastMessage}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            {summary.notices.length} notices condensed
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-5 py-2 text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950 font-bold" /> : <Copy className="w-4 h-4 text-slate-950 font-bold" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Digest'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
