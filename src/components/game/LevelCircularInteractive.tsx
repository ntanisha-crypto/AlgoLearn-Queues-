import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  ArrowRight,
  ArrowDownToLine,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface LevelCircularInteractiveProps {
  onNotifyAction?: (actionText: string) => void;
}

export const LevelCircularInteractive: React.FC<LevelCircularInteractiveProps> = ({
  onNotifyAction,
}) => {
  const CAPACITY = 5;
  const [slots, setSlots] = useState<(string | null)[]>(['A', 'B', 'C', null, null]);
  const [front, setFront] = useState<number>(0);
  const [rear, setRear] = useState<number>(2);
  const [count, setCount] = useState<number>(3);
  const [nextSurvivor, setNextSurvivor] = useState<string>('D');
  const [lastFormula, setLastFormula] = useState<string>(
    'Initial State: front = 0, rear = 2, count = 3 / 5'
  );
  const [wraparoundTriggered, setWraparoundTriggered] = useState<boolean>(false);

  const isFull = count === CAPACITY;
  const isEmpty = count === 0;

  // Handle Enqueue into circular slot
  const handleCircularEnqueue = () => {
    if (isFull) {
      soundEffects.playError();
      onNotifyAction?.('Circular Queue is 100% Full! All 5 slots occupied.');
      return;
    }

    soundEffects.playPush();
    const newRear = (rear + 1) % CAPACITY;
    const isWrap = rear === CAPACITY - 1 && newRear === 0;
    const newSlots = [...slots];
    newSlots[newRear] = nextSurvivor;

    setSlots(newSlots);
    setRear(newRear);
    setCount(count + 1);
    setWraparoundTriggered(isWrap);

    const formula = `rear = (${rear} + 1) % ${CAPACITY} = ${newRear}${
      isWrap ? ' ↺ WRAPPED AROUND TO INDEX 0!' : ''
    }`;
    setLastFormula(formula);

    // Increment next survivor letter
    const nextCode = nextSurvivor.charCodeAt(0) + 1;
    setNextSurvivor(String.fromCharCode(nextCode > 90 ? 65 : nextCode));

    onNotifyAction?.(
      `Enqueued [${nextSurvivor}] at Slot [${newRear}]. ${
        isWrap ? 'Space at Slot 0 was successfully recycled!' : ''
      }`
    );
  };

  // Handle Dequeue from circular slot
  const handleCircularDequeue = () => {
    if (isEmpty) {
      soundEffects.playError();
      onNotifyAction?.('Circular Queue is Empty! No elements to dequeue.');
      return;
    }

    soundEffects.playPop();
    const removedItem = slots[front];
    const newSlots = [...slots];
    newSlots[front] = null;

    const newFront = (front + 1) % CAPACITY;
    const isWrap = front === CAPACITY - 1 && newFront === 0;

    setSlots(newSlots);
    setFront(newFront);
    setCount(count - 1);

    const formula = `front = (${front} + 1) % ${CAPACITY} = ${newFront}${
      isWrap ? ' ↺ FRONT WRAPPED TO 0!' : ''
    }`;
    setLastFormula(formula);

    onNotifyAction?.(
      `Dequeued [${removedItem}] from Slot [${front}]. Slot is now freed for reuse!`
    );
  };

  // Reset demo
  const handleReset = () => {
    soundEffects.playReset();
    setSlots(['A', 'B', 'C', null, null]);
    setFront(0);
    setRear(2);
    setCount(3);
    setNextSurvivor('D');
    setLastFormula('Reset: front = 0, rear = 2, count = 3 / 5');
    setWraparoundTriggered(false);
  };

  // Polar coordinate math for 5 slots
  const radius = 95; // radius in px
  const center = 130; // center coordinate

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200/90 dark:border-indigo-900/60 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
            07
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Interactive Circular Queue (Ring Buffer)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-900/40">
                (rear + 1) % MAX
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Solves the "false full" problem of linear queues by recycling freed memory slots.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-2.5 py-1 text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Ring</span>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Circular Ring Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!isFull) {
                handleCircularEnqueue();
              }
            }}
            className="relative w-[260px] h-[260px] flex items-center justify-center rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            title="Drop survivor token or Enqueue button here to Enqueue (or click below)"
          >
            {/* Outer Circular Track */}
            <div className="absolute inset-4 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 animate-[spin_60s_linear_infinite]" />

            {/* Inner Center Hub */}
            <div className="absolute z-10 w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-2 shadow-xs pointer-events-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                RING BUFFER
              </span>
              <span className="text-base font-mono font-black text-indigo-600 dark:text-indigo-400">
                {count} / {CAPACITY}
              </span>
              <span className="text-[8px] font-mono text-indigo-500 dark:text-indigo-400 font-bold">
                Drop / Click
              </span>
            </div>

            {/* 5 Circular Slots arranged in a ring */}
            {slots.map((item, idx) => {
              // Calculate angle: 5 items => 72 degrees each, starting at top (-90 deg)
              const angleDeg = -90 + idx * 72;
              const angleRad = (angleDeg * Math.PI) / 180;
              const x = center + radius * Math.cos(angleRad) - 24; // 24 = half of 48px slot width
              const y = center + radius * Math.sin(angleRad) - 24;

              const isFront = idx === front && count > 0;
              const isRear = idx === rear && count > 0;

              return (
                <div
                  key={`circ-slot-${idx}`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  className="absolute z-20"
                >
                  <motion.div
                    draggable={isFront}
                    onDragStart={(e) => {
                      if (isFront) {
                        e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'CIRCULAR_DEQUEUE', value: item }));
                        e.dataTransfer.effectAllowed = 'move';
                      }
                    }}
                    animate={{
                      scale: isFront || isRear ? 1.05 : 1,
                    }}
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all relative shadow-xs select-none ${
                      item !== null
                        ? isFront
                          ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-300 dark:ring-blue-800 cursor-grab active:cursor-grabbing'
                          : isRear
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 text-indigo-900 dark:text-indigo-100 ring-2 ring-indigo-300 dark:ring-indigo-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-100'
                        : 'bg-white/80 dark:bg-slate-900/80 border-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-mono font-black">
                      {item !== null ? item : '-'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      [{idx}]
                    </span>

                    {/* FRONT indicator badge */}
                    {isFront && (
                      <span className="absolute -top-3 -left-2 text-[9px] font-mono font-bold bg-blue-600 text-white px-1 py-0.2 rounded shadow-xs">
                        FRONT
                      </span>
                    )}

                    {/* REAR indicator badge */}
                    {isRear && (
                      <span className="absolute -bottom-3 -right-2 text-[9px] font-mono font-bold bg-indigo-600 text-white px-1 py-0.2 rounded shadow-xs">
                        REAR
                      </span>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Wraparound Banner */}
          {wraparoundTriggered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-lg border border-indigo-300 dark:border-indigo-800 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>↺ Modulo Wraparound Active: Slot [0] recycled!</span>
            </motion.div>
          )}
        </div>

        {/* Right: Interactive Controls & Modulo Formula */}
        <div className="lg:col-span-6 space-y-3">
          {/* Real-time Math Formula Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Live Modulo Pointer Calculation
              </span>
              <span className="text-[10px] font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                MAX = 5
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-950/80">
              {lastFormula}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              When index reaches 4, <code className="text-indigo-600 font-bold">(4 + 1) % 5 = 0</code>. The queue wraps around clockwise to reuse freed slots!
            </p>
          </div>

          {/* Interactive Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              draggable={!isFull}
              onDragStart={(e) => {
                if (!isFull) {
                  e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'CIRCULAR_ENQUEUE', value: nextSurvivor }));
                  e.dataTransfer.effectAllowed = 'copy';
                }
              }}
              onClick={handleCircularEnqueue}
              disabled={isFull}
              className={`p-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-95 shadow-xs select-none ${
                isFull
                  ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-500/20 cursor-grab active:cursor-grabbing'
              }`}
              title="Click to enqueue, or drag into the Circular Ring above"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>ENQUEUE [{nextSurvivor}] AT REAR</span>
              <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-white/20 text-white ml-0.5">
                Drag / Click
              </span>
            </button>

            <button
              onClick={handleCircularDequeue}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (!isEmpty) {
                  handleCircularDequeue();
                }
              }}
              disabled={isEmpty}
              className={`p-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer active:scale-95 shadow-xs ${
                isEmpty
                  ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-400'
              }`}
              title="Click to dequeue, or drop the FRONT slot item here"
            >
              <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>DEQUEUE FRONT [{slots[front] || '-'}]</span>
              <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 ml-0.5">
                Drop Target / Click
              </span>
            </button>
          </div>

          {/* Educational Note */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/70 dark:border-amber-900/50 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Linear Queue Flaw:</strong> Once elements leave index 0 and 1, a linear array cannot reuse them unless you shift all elements left (costing O(N) time). Circular queues achieve continuous reuse in O(1) time!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
