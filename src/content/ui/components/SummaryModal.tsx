import React, { useState } from 'react';
import { summarizeText } from '@/utils/summarizer';
import { speak, stop as stopSpeaking, isSpeaking } from '@/utils/speech';

interface SummaryModalProps {
  originalText: string;
  onClose: () => void;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ originalText, onClose }) => {
  const [summary] = useState(() => summarizeText(originalText));
  const [copied, setCopied] = useState(false);
  const [reading, setReading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRead = async () => {
    if (reading) {
      stopSpeaking();
      setReading(false);
    } else {
      setReading(true);
      await speak(summary, { 
        enabled: true,
        clickToRead: false,
        speed: 1.0, 
        voiceURI: '', 
        highlightColor: '#fef08a' 
      }, undefined); // No element to highlight
      setReading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-pulse-soft"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-primary-500/10 to-accent-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Summary</h3>
              <p className="text-xs text-white/50">Key points from selection</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <p className="text-white/90 leading-relaxed text-base font-medium">
            {summary}
          </p>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/40 font-mono">
            <span>Original: {originalText.length} chars</span>
            <span>Summary: {summary.length} chars ({Math.round((summary.length / originalText.length) * 100)}%)</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-800/50 border-t border-white/5 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-700/50 hover:bg-surface-700 text-white font-medium transition-all hover:scale-[1.02]"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleRead}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] shadow-lg
              ${reading 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-primary-500 hover:bg-primary-400 text-white shadow-primary-500/25'
              }`}
          >
            {reading ? (
              <>
                <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span>Stop</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
