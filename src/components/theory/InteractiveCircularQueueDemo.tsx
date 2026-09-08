import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus, RotateCcw, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { soundEffects } from '../../services/sound';

export const InteractiveCircularQueueDemo: React.FC = () => {
  const SIZE = 6;
  const [arr, setArr] = useState<(number | null)[]>([10, 20, 30, null, null, null]);
  const [front, setFront] = useState<number>(0);
  const [rear, setRear] = useState<number>(2);
  const [count, setCount] = useState<number>(3);
  const [nextVal, setNextVal] = useState<number>(40);
  const [mathFormula, setMathFormula] = useState<string>('Initial state: front = 0, rear = 2, count = 3');
  const [status, setStatus] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' }>({
    text: 'Circular Queue initialized. Notice how rear wraps around using modulo operator % 6.',
    type: 'info',
  });

  const isFull = count === SIZE;
  const isEmpty = count === 0;

  const handleEnqueue = () => {
    if (isFull) {
      soundEffects.playError();
      setStatus({
        text: `❌ CIRCULAR QUEUE OVERFLOW: All ${SIZE} slots are occupied (count = ${SIZE}).`,
        type: 'error',
      });
      return;
    }

    soundEffects.playPush();
    const newRear = (rear + 1) % SIZE;
    const newArr = [...arr];
    newArr[newRear] = nextVal;
    setArr(newArr);
    setRear(newRear);
    setCount(count + 1);

    const wrapped = newRear === 0 && rear === SIZE - 1;
    setMathFormula(
      `rear = (${rear} + 1) % ${SIZE} = ${newRear}${wrapped ? ' ↺ WRAPPED TO INDEX 0!' : ''}`
    );
    setStatus({
      text: `✅ ENQUEUE(${nextVal}): Placed at index ${newRear}. ${wrapped ? '★ Space reused from previously dequeued slots!' : ''}`,
      type: 'success',
    });
    setNextVal((prev) => prev + 10);
  };

  const handleDequeue = () => {
    if (isEmpty) {
      soundEffects.playError();
      setStatus({
        text: '❌ CIRCULAR QUEUE UNDERFLOW: Queue is empty.',
        type: 'error',
      });
      return;
    }

    soundEffects.playPop();
    const removedVal = arr[front];
    const newArr = [...arr];
    newArr[front] = null;
    setArr(newArr);

    const newFront = (front + 1) % SIZE;
    setFront(newFront);
    setCount(count - 1);

    const wrapped = newFront === 0 && front === SIZE - 1;
    setMathFormula(
      `front = (${front} + 1) % ${SIZE} = ${newFront}${wrapped ? ' ↺ FRONT WRAPPED TO 0!' : ''}`
    );
    setStatus({
      text: `✅ DEQUEUE(): Removed ${removedVal} from index ${front}. Slot ${front} is now free for reuse!`,
      type: 'warning',
    });
  };

  const handleReset = () => {
    soundEffects.playReset();
    setArr([10, 20, 30, null, null, null]);
    setFront(0);
    setRear(2);
    setCount(3);
    setNextVal(40);
    setMathFormula('Initial state: front = 0, rear = 2, count = 3');
    setStatus({
      text: 'Circular queue reset to default.',
      type: 'info',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Circular Queue &amp; Modulo Wrap-Around</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              (index + 1) % SIZE
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Solves the linear queue &ldquo;False Overflow&rdquo; flaw by wrapping pointers back to index 0.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Count: <strong>{count}</strong>/{SIZE}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
            Front: {front}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
            Rear: {rear}
          </span>
        </div>
      </div>

      {/* Ring / Array Representation */}
      <div className="my-6 p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        {/* Modulo formula readout */}
        <div className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold mb-5 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
          <span>{mathFormula}</span>
        </div>

        {/* Circular array cells */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 w-full max-w-xl">
          {arr.map((val, idx) => {
            const isFront = idx === front && count > 0;
            const isRear = idx === rear && count > 0;
            const isOccupied = val !== null;

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Pointer tags */}
                <div className="h-5 flex items-center text-[10px] font-mono font-bold">
                  {isFront && (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center">
                      F↓
                    </span>
                  )}
                </div>

                {/* Box */}
                <motion.div
                  layout
                  className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center font-mono font-bold text-sm sm:text-base transition-colors relative shadow-xs ${
                    isOccupied
                      ? 'border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-400'
                  } ${isFront ? 'ring-2 ring-rose-500/40' : ''} ${isRear ? 'ring-2 ring-emerald-500/40' : ''}`}
                >
                  <span>{val !== null ? val : '—'}</span>
                  <span className="text-[9px] text-slate-400 font-normal">[{idx}]</span>
                </motion.div>

                {/* Bottom rear tag */}
                <div className="h-5 flex items-center text-[10px] font-mono font-bold">
                  {isRear && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                      ↑R
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>F = FRONT (delete here)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>R = REAR (insert here)</span>
          </div>
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
        {status.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 text-blue-600" />}
        <span className="font-medium">{status.text}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
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
            <span>Enqueue ({nextVal})</span>
          </button>

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
            <span>Dequeue</span>
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
