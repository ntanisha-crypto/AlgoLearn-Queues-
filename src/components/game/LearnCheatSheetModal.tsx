import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, ArrowDown, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

interface LearnCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearnCheatSheetModal: React.FC<LearnCheatSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close cheat sheet"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Quick Reference
                </span>
                <span className="text-xs font-mono text-slate-400">Queue Cheatsheet</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                QUEUE CHEAT SHEET
              </h2>
            </div>
          </div>

          {/* Core Hierarchy: QUEUE -> FIFO -> First In -> First Out */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/60 text-center space-y-2">
            <div className="flex flex-col items-center justify-center gap-1 font-mono font-black text-sm text-blue-900 dark:text-blue-200">
              <div className="px-4 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 shadow-2xs">
                QUEUE
              </div>
              <ArrowDown className="w-4 h-4 text-blue-500" />
              <div className="px-4 py-1.5 rounded-xl bg-blue-600 text-white shadow-2xs">
                FIFO
              </div>
              <ArrowDown className="w-4 h-4 text-blue-500" />
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans tracking-wide">
                First In → First Out
              </div>
            </div>
          </div>

          {/* Quick Operations Table / Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
            {/* ENQUEUE */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-black text-emerald-700 dark:text-emerald-400 block">
                  ENQUEUE
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                  → Add at <strong>REAR</strong>
                </span>
              </div>
            </div>

            {/* DEQUEUE */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-black text-rose-700 dark:text-rose-400 block">
                  DEQUEUE
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                  → Remove from <strong>FRONT</strong>
                </span>
              </div>
            </div>

            {/* PEEK */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-black text-amber-700 dark:text-amber-400 block">
                  PEEK
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                  → View <strong>FRONT</strong> (no removal)
                </span>
              </div>
            </div>

            {/* FRONT / REAR */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              <div>
                <span className="font-black text-blue-700 dark:text-blue-400 block">
                  FRONT & REAR
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                  FRONT = First, REAR = Last
                </span>
              </div>
            </div>

            {/* OVERFLOW */}
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-black text-amber-800 dark:text-amber-300 block">
                  OVERFLOW
                </span>
                <span className="text-[11px] text-amber-900/80 dark:text-amber-200/80 font-sans">
                  → Insert when <strong>FULL</strong>
                </span>
              </div>
            </div>

            {/* UNDERFLOW */}
            <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-black text-rose-800 dark:text-rose-300 block">
                  UNDERFLOW
                </span>
                <span className="text-[11px] text-rose-900/80 dark:text-rose-200/80 font-sans">
                  → Remove when <strong>EMPTY</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              GOT IT • RETURN TO GAME
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
