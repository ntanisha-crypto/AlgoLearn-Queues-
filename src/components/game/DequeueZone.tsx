import React, { useState } from 'react';
import { LogOut, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DequeueZoneProps {
  frontElementValue: number | string | null;
  onDequeueSuccess: (value: number | string) => void;
  onDequeueInvalid: (attemptedValue: number | string) => void;
  isGuidedSolveActive?: boolean;
  disabled?: boolean;
}

export const DequeueZone: React.FC<DequeueZoneProps> = ({
  frontElementValue,
  onDequeueSuccess,
  onDequeueInvalid,
  isGuidedSolveActive = false,
  disabled = false,
}) => {
  const [dragState, setDragState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [justDequeued, setJustDequeued] = useState<number | string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || frontElementValue === null) return;

    try {
      e.dataTransfer.dropEffect = 'move';
      setDragState('valid');
    } catch {
      setDragState('valid');
    }
  };

  const handleDragLeave = () => {
    setDragState('idle');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragState('idle');
    if (disabled || frontElementValue === null) return;

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      const droppedVal = parsed.value !== undefined ? parsed.value : parsed;

      if (String(droppedVal) === String(frontElementValue)) {
        setJustDequeued(droppedVal);
        setTimeout(() => setJustDequeued(null), 1200);
        onDequeueSuccess(droppedVal);
      } else {
        onDequeueInvalid(droppedVal);
      }
    } catch {
      if (String(data) === String(frontElementValue)) {
        setJustDequeued(data);
        setTimeout(() => setJustDequeued(null), 1200);
        onDequeueSuccess(data);
      } else {
        onDequeueInvalid(data);
      }
    }
  };

  const handleClickDequeue = () => {
    if (disabled || frontElementValue === null) return;
    setJustDequeued(frontElementValue);
    setTimeout(() => setJustDequeued(null), 1200);
    onDequeueSuccess(frontElementValue);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3">
      {/* Visual Dequeue Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full min-h-[160px] sm:min-h-[220px] rounded-3xl border-3 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ${
          disabled
            ? 'opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40'
            : dragState === 'valid'
            ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/80 ring-4 ring-emerald-200 dark:ring-emerald-900 scale-102'
            : dragState === 'invalid'
            ? 'border-red-500 bg-red-50/90 dark:bg-red-950/80 ring-4 ring-red-200 dark:ring-red-900'
            : isGuidedSolveActive
            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/60 ring-4 ring-blue-200 dark:ring-blue-900 animate-pulse'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <AnimatePresence>
          {justDequeued !== null ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <span className="text-sm font-mono font-black">
                DEQUEUED [{justDequeued}]
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                FIFO Service Removal Executed!
              </span>
            </motion.div>
          ) : dragState === 'valid' ? (
            <div className="flex flex-col items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-sm font-extrabold uppercase tracking-wide">
                ✓ DROP FRONT HERE
              </span>
              <span className="text-xs font-mono font-bold">
                Target Element [{frontElementValue}]
              </span>
            </div>
          ) : dragState === 'invalid' ? (
            <div className="flex flex-col items-center gap-2 text-red-700 dark:text-red-300 font-bold">
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center justify-center shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-sm font-extrabold uppercase tracking-wide">
                ✕ FRONT ONLY
              </span>
              <span className="text-xs font-semibold">
                Cannot remove non-front elements in FIFO
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs border border-blue-200 dark:border-blue-800">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  DEQUEUE ZONE
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {frontElementValue !== null
                    ? 'Drag FRONT element here or click below'
                    : 'Queue is Empty'}
                </span>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Accessible Click-to-Dequeue Action Button */}
      {frontElementValue !== null && !disabled && (
        <button
          onClick={handleClickDequeue}
          className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Click to DEQUEUE Front [{frontElementValue}]</span>
        </button>
      )}
    </div>
  );
};
