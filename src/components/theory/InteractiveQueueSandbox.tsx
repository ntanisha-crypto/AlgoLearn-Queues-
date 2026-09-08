import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Eye, RotateCcw, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface InteractiveQueueSandboxProps {
  initialItems?: number[];
  capacity?: number;
  highlightMode?: 'none' | 'enqueue' | 'dequeue' | 'peek';
}

export const InteractiveQueueSandbox: React.FC<InteractiveQueueSandboxProps> = ({
  initialItems = [10, 20, 30],
  capacity = 5,
  highlightMode = 'none',
}) => {
  const [items, setItems] = useState<number[]>(initialItems);
  const [inputValue, setInputValue] = useState<number>(40);
  const [message, setMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' }>({
    text: `Initial queue ready with ${initialItems.length} elements. Try ENQUEUE, DEQUEUE, or PEEK.`,
    type: 'info',
  });
  const [highlightFront, setHighlightFront] = useState(false);
  const [highlightRear, setHighlightRear] = useState(false);

  const handleEnqueue = () => {
    if (items.length >= capacity) {
      soundEffects.playError();
      setMessage({
        text: `❌ QUEUE OVERFLOW: Capacity limit (${capacity}) reached! Cannot enqueue ${inputValue}.`,
        type: 'error',
      });
      return;
    }

    soundEffects.playPush();
    const newItems = [...items, inputValue];
    setItems(newItems);
    setHighlightRear(true);
    setTimeout(() => setHighlightRear(false), 1200);
    setMessage({
      text: `✅ ENQUEUE(${inputValue}): Added at REAR (Index ${newItems.length - 1}). Size is now ${newItems.length}.`,
      type: 'success',
    });
    setInputValue((prev) => prev + 10);
  };

  const handleDequeue = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setMessage({
        text: `❌ QUEUE UNDERFLOW: The queue is empty (Size 0)! Cannot dequeue an element.`,
        type: 'error',
      });
      return;
    }

    soundEffects.playPop();
    const dequeuedVal = items[0];
    const newItems = items.slice(1);
    setItems(newItems);
    setMessage({
      text: `✅ DEQUEUE() returned ${dequeuedVal}: Removed from FRONT. ${newItems.length > 0 ? `New FRONT is ${newItems[0]}.` : 'Queue is now empty.'}`,
      type: 'warning',
    });
  };

  const handlePeek = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setMessage({
        text: `❌ QUEUE EMPTY: Cannot peek FRONT on an empty queue.`,
        type: 'error',
      });
      return;
    }

    soundEffects.playPeek();
    setHighlightFront(true);
    setTimeout(() => setHighlightFront(false), 1500);
    setMessage({
      text: `🔍 PEEK(): FRONT element is ${items[0]} (Index 0). Queue remains unchanged.`,
      type: 'info',
    });
  };

  const handleReset = () => {
    soundEffects.playReset();
    setItems(initialItems);
    setInputValue(40);
    setMessage({
      text: '🔄 Queue reset to initial state.',
      type: 'info',
    });
  };

  const isFull = items.length >= capacity;
  const isEmpty = items.length === 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Top Header & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Interactive Queue Sandbox</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              FIFO PLAYGROUND
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test Enqueue at REAR, Dequeue from FRONT, and handle Overflow / Underflow.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Size: <strong>{items.length}</strong>/{capacity}
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            isEmpty
              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            isEmpty: {isEmpty ? 'true' : 'false'}
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold ${
            isFull
              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            isFull: {isFull ? 'true' : 'false'}
          </span>
        </div>
      </div>

      {/* Main Queue Visualizer Area */}
      <div className="py-8 px-2 sm:px-6 my-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[170px]">
        {/* Pointer Direction Badges */}
        <div className="flex items-center justify-between w-full max-w-lg mb-3 px-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="text-base">←</span>
            <span className="uppercase tracking-wider text-[11px]">FRONT (Exit / Dequeue)</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="uppercase tracking-wider text-[11px]">REAR (Entry / Enqueue)</span>
            <span className="text-base">←</span>
          </div>
        </div>

        {/* Horizontal Queue Chamber */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto custom-scrollbar w-full py-2">
          {isEmpty ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 font-mono text-xs italic">
              Queue is empty. Click [Enqueue] to add elements at REAR.
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AnimatePresence mode="popLayout">
                {items.map((val, idx) => {
                  const isFrontItem = idx === 0;
                  const isRearItem = idx === items.length - 1;
                  const isFrontHighlighted = isFrontItem && (highlightFront || highlightMode === 'peek' || highlightMode === 'dequeue');
                  const isRearHighlighted = isRearItem && (highlightRear || highlightMode === 'enqueue');

                  return (
                    <motion.div
                      key={`${val}-${idx}`}
                      layout
                      initial={{ opacity: 0, scale: 0.6, x: 50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.5, x: -50 }}
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 flex flex-col items-center justify-center font-mono font-bold text-base sm:text-lg shadow-sm shrink-0 transition-colors ${
                        isFrontHighlighted
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 ring-2 ring-rose-400/40'
                          : isRearHighlighted
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-200 ring-2 ring-emerald-400/40'
                          : 'border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                      }`}
                    >
                      {/* Top indicator badge */}
                      {isFrontItem && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-600 text-white shadow-xs uppercase">
                          FRONT
                        </span>
                      )}
                      {isRearItem && (
                        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-600 text-white shadow-xs uppercase">
                          REAR
                        </span>
                      )}

                      <span>{val}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                        [{idx}]
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Capacity visual slots */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-mono text-slate-400">
          <span>Capacity: {items.length}/{capacity} slots used</span>
        </div>
      </div>

      {/* Real-time Status / Event Log */}
      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 mb-5 ${
        message.type === 'error'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
          : message.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
          : message.type === 'warning'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
          : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
      }`}>
        {message.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
        {message.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
        {message.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />}
        {message.type === 'info' && <Info className="w-4 h-4 shrink-0 text-blue-600" />}
        <span className="font-medium">{message.text}</span>
      </div>

      {/* Controls Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Enqueue Control */}
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="w-16 px-2 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              disabled={isFull}
            />
            <button
              onClick={handleEnqueue}
              disabled={isFull}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isFull
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Enqueue (REAR)</span>
            </button>
          </div>

          {/* Dequeue Control */}
          <button
            onClick={handleDequeue}
            disabled={isEmpty}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isEmpty
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
            }`}
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Dequeue (FRONT)</span>
          </button>

          {/* Peek Control */}
          <button
            onClick={handlePeek}
            disabled={isEmpty}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isEmpty
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Peek FRONT</span>
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
