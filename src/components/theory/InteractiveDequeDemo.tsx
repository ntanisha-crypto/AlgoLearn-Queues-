import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, RotateCcw, ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { soundEffects } from '../../services/sound';

export const InteractiveDequeDemo: React.FC = () => {
  const [items, setItems] = useState<number[]>([20, 30, 40]);
  const [valFront, setValFront] = useState<number>(10);
  const [valRear, setValRear] = useState<number>(50);
  const [status, setStatus] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' }>({
    text: 'Deque (Double-Ended Queue): Insert or delete from FRONT or REAR at will.',
    type: 'info',
  });

  const MAX_CAPACITY = 6;
  const isFull = items.length >= MAX_CAPACITY;
  const isEmpty = items.length === 0;

  const handleInsertFront = () => {
    if (isFull) {
      soundEffects.playError();
      setStatus({ text: '❌ DEQUE OVERFLOW: Capacity limit reached.', type: 'error' });
      return;
    }
    soundEffects.playPush();
    setItems([valFront, ...items]);
    setStatus({
      text: `✅ insertFront(${valFront}): Added to FRONT. Can emulate push in a stack!`,
      type: 'success',
    });
    setValFront((prev) => prev - 5);
  };

  const handleInsertRear = () => {
    if (isFull) {
      soundEffects.playError();
      setStatus({ text: '❌ DEQUE OVERFLOW: Capacity limit reached.', type: 'error' });
      return;
    }
    soundEffects.playPush();
    setItems([...items, valRear]);
    setStatus({
      text: `✅ insertRear(${valRear}): Added to REAR. Standard queue enqueue behavior!`,
      type: 'success',
    });
    setValRear((prev) => prev + 5);
  };

  const handleDeleteFront = () => {
    if (isEmpty) {
      soundEffects.playError();
      setStatus({ text: '❌ DEQUE UNDERFLOW: Deque is empty.', type: 'error' });
      return;
    }
    soundEffects.playPop();
    const removed = items[0];
    setItems(items.slice(1));
    setStatus({
      text: `✅ deleteFront(): Removed ${removed} from FRONT. Standard queue dequeue behavior!`,
      type: 'warning',
    });
  };

  const handleDeleteRear = () => {
    if (isEmpty) {
      soundEffects.playError();
      setStatus({ text: '❌ DEQUE UNDERFLOW: Deque is empty.', type: 'error' });
      return;
    }
    soundEffects.playPop();
    const removed = items[items.length - 1];
    setItems(items.slice(0, -1));
    setStatus({
      text: `✅ deleteRear(): Removed ${removed} from REAR. Can emulate pop in a stack!`,
      type: 'warning',
    });
  };

  const handleReset = () => {
    soundEffects.playReset();
    setItems([20, 30, 40]);
    setValFront(10);
    setValRear(50);
    setStatus({ text: 'Deque reset to initial 3 items.', type: 'info' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Deque: Double-Ended Operations</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              STACK + QUEUE HYBRID
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            4 fundamental operations: insertFront, insertRear, deleteFront, deleteRear.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
          Items: {items.length}/{MAX_CAPACITY}
        </div>
      </div>

      {/* Visual representation */}
      <div className="my-6 p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-lg mb-2 text-xs font-bold text-slate-500">
          <span className="text-rose-600 dark:text-rose-400">← FRONT (In / Out)</span>
          <span className="text-emerald-600 dark:text-emerald-400">(In / Out) REAR →</span>
        </div>

        <div className="flex items-center justify-center gap-2 min-h-[90px] w-full max-w-lg py-2 overflow-x-auto custom-scrollbar">
          {isEmpty ? (
            <div className="text-xs font-mono text-slate-400 italic py-4">
              Deque is empty. Use Front or Rear insert controls below.
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {items.map((val, idx) => (
                <motion.div
                  key={`${val}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.6, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0 relative"
                >
                  {idx === 0 && (
                    <span className="absolute -top-2.5 text-[8px] font-extrabold px-1 rounded bg-rose-600 text-white uppercase">
                      FRONT
                    </span>
                  )}
                  {idx === items.length - 1 && (
                    <span className="absolute -bottom-2.5 text-[8px] font-extrabold px-1 rounded bg-emerald-600 text-white uppercase">
                      REAR
                    </span>
                  )}
                  <span>{val}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Status */}
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
        {status.type === 'info' && <ArrowLeftRight className="w-4 h-4 shrink-0 text-blue-600" />}
        <span className="font-medium">{status.text}</span>
      </div>

      {/* 4 Control buttons grouped by Front and Rear */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Front Controls */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">FRONT</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInsertFront}
              disabled={isFull}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer shadow-xs"
            >
              + Insert ({valFront})
            </button>
            <button
              onClick={handleDeleteFront}
              disabled={isEmpty}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 cursor-pointer shadow-xs"
            >
              − Delete
            </button>
          </div>
        </div>

        {/* Rear Controls */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">REAR</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleInsertRear}
              disabled={isFull}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 cursor-pointer shadow-xs"
            >
              + Insert ({valRear})
            </button>
            <button
              onClick={handleDeleteRear}
              disabled={isEmpty}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 cursor-pointer shadow-xs"
            >
              − Delete
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Deque</span>
        </button>
      </div>
    </div>
  );
};
