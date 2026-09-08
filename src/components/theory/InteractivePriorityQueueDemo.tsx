import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, RotateCcw, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface PriorityItem {
  id: number;
  label: string;
  priority: 1 | 2 | 3; // 1 = Critical/High, 2 = Medium, 3 = Low
}

export const InteractivePriorityQueueDemo: React.FC = () => {
  const [items, setItems] = useState<PriorityItem[]>([
    { id: 1, label: 'Routine Checkup', priority: 3 },
    { id: 2, label: 'Sprained Ankle', priority: 2 },
  ]);
  const [selectedTask, setSelectedTask] = useState<'critical' | 'medium' | 'low'>('critical');
  const [status, setStatus] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' }>({
    text: 'Priority Queue (Min-Heap / ER Triage): Priority 1 items are dequeued BEFORE Priority 3!',
    type: 'info',
  });

  const handleEnqueue = () => {
    soundEffects.playPush();
    let newItem: PriorityItem;
    if (selectedTask === 'critical') {
      newItem = {
        id: Date.now(),
        label: 'Cardiac Trauma',
        priority: 1,
      };
    } else if (selectedTask === 'medium') {
      newItem = {
        id: Date.now(),
        label: 'Deep Cut / Stitches',
        priority: 2,
      };
    } else {
      newItem = {
        id: Date.now(),
        label: 'Pharmacy Pickup',
        priority: 3,
      };
    }

    // Insert and sort by priority (1 is highest priority)
    const newItems = [...items, newItem].sort((a, b) => a.priority - b.priority);
    setItems(newItems);
    setStatus({
      text: `✅ ENQUEUED "${newItem.label}" with Priority ${newItem.priority}! ${newItem.priority === 1 ? '★ Moved to FRONT ahead of lower priority items!' : ''}`,
      type: 'success',
    });
  };

  const handleDequeue = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setStatus({ text: '❌ UNDERFLOW: Priority queue is empty.', type: 'error' });
      return;
    }
    soundEffects.playPop();
    const served = items[0];
    setItems(items.slice(1));
    setStatus({
      text: `✅ DEQUEUED "${served.label}" (Priority ${served.priority}) from FRONT!`,
      type: 'warning',
    });
  };

  const handleReset = () => {
    soundEffects.playReset();
    setItems([
      { id: 1, label: 'Routine Checkup', priority: 3 },
      { id: 2, label: 'Sprained Ankle', priority: 2 },
    ]);
    setStatus({ text: 'Priority Queue reset to initial state.', type: 'info' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Priority Queue (ER Triage Simulation)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold border border-rose-200/60 dark:border-rose-900/40">
              PRIORITY OVER ORDER
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Highest priority elements (P1) skip ahead of lower priority elements (P2, P3).
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
            P1 = Critical
          </span>
          <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
            P2 = Medium
          </span>
          <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
            P3 = Low
          </span>
        </div>
      </div>

      {/* Triage line */}
      <div className="my-6 p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-2 mb-3 text-xs font-bold text-slate-500">
          <span className="text-rose-600 dark:text-rose-400">Next to be Treated (FRONT)</span>
          <span className="text-slate-400">Waiting Area</span>
        </div>

        <div className="flex items-center justify-start gap-3 min-h-[90px] w-full overflow-x-auto custom-scrollbar py-2">
          {items.length === 0 ? (
            <div className="text-xs font-mono text-slate-400 italic py-4 w-full text-center">
              No patients waiting in queue.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((item, idx) => {
                const isP1 = item.priority === 1;
                const isP2 = item.priority === 2;
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -40 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center font-mono shadow-xs shrink-0 w-36 text-center ${
                      isP1
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                        : isP2
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full mb-1 text-white bg-slate-800 dark:bg-slate-700">
                      P{item.priority} {idx === 0 ? '• FRONT' : ''}
                    </span>
                    <span className="text-xs font-bold truncate max-w-[130px]">{item.label}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 mb-5 ${
        status.type === 'error'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
          : status.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
          : status.type === 'warning'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
          : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
      }`}>
        {status.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
        {status.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
        {status.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />}
        {status.type === 'info' && <ShieldAlert className="w-4 h-4 shrink-0 text-blue-600" />}
        <span className="font-medium">{status.text}</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="critical">🚨 P1: Cardiac Trauma (Critical)</option>
            <option value="medium">🩹 P2: Deep Cut (Medium)</option>
            <option value="low">📋 P3: Pharmacy Pickup (Low)</option>
          </select>

          <button
            onClick={handleEnqueue}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enqueue Patient</span>
          </button>

          <button
            onClick={handleDequeue}
            disabled={items.length === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Treat Front Patient</span>
          </button>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
