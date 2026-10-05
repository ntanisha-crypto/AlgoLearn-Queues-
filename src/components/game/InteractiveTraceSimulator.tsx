import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, ArrowDownToLine, ArrowUpRight, CheckCircle2, Sparkles, FastForward } from 'lucide-react';
import { soundEffects } from '../../services/sound';

export interface TraceStep {
  stepNumber: number;
  operation: 'ENQUEUE' | 'DEQUEUE';
  value?: string | number;
  explanation: string;
  resultingQueue: (string | number)[];
  removedItem?: string | number;
}

interface InteractiveTraceSimulatorProps {
  challengeId: string;
}

const TRACE_DATA_BY_CHALLENGE: Record<string, TraceStep[]> = {
  'l2-c1': [
    {
      stepNumber: 1,
      operation: 'ENQUEUE',
      value: 'A',
      explanation: 'Visitor [A] enters the queue at REAR.',
      resultingQueue: ['A'],
    },
    {
      stepNumber: 2,
      operation: 'ENQUEUE',
      value: 'B',
      explanation: 'Visitor [B] enters at REAR behind [A].',
      resultingQueue: ['A', 'B'],
    },
    {
      stepNumber: 3,
      operation: 'DEQUEUE',
      value: 'A',
      explanation: 'DEQUEUE extracts the FRONT element [A]! [B] advances to FRONT.',
      resultingQueue: ['B'],
      removedItem: 'A',
    },
    {
      stepNumber: 4,
      operation: 'ENQUEUE',
      value: 'C',
      explanation: 'Visitor [C] enters at REAR behind [B].',
      resultingQueue: ['B', 'C'],
    },
    {
      stepNumber: 5,
      operation: 'DEQUEUE',
      value: 'B',
      explanation: 'DEQUEUE extracts the FRONT element [B]! Only [C] remains.',
      resultingQueue: ['C'],
      removedItem: 'B',
    },
  ],
  'l2-c2': [
    {
      stepNumber: 1,
      operation: 'ENQUEUE',
      value: 'A',
      explanation: 'Enqueue [A] at REAR.',
      resultingQueue: ['A'],
    },
    {
      stepNumber: 2,
      operation: 'ENQUEUE',
      value: 'B',
      explanation: 'Enqueue [B] at REAR.',
      resultingQueue: ['A', 'B'],
    },
    {
      stepNumber: 3,
      operation: 'DEQUEUE',
      value: 'A',
      explanation: 'Dequeue removes FRONT [A].',
      resultingQueue: ['B'],
      removedItem: 'A',
    },
    {
      stepNumber: 4,
      operation: 'ENQUEUE',
      value: 'C',
      explanation: 'Enqueue [C] at REAR.',
      resultingQueue: ['B', 'C'],
    },
    {
      stepNumber: 5,
      operation: 'DEQUEUE',
      value: 'B',
      explanation: 'Dequeue removes FRONT [B].',
      resultingQueue: ['C'],
      removedItem: 'B',
    },
  ],
  'l2-c3': [
    {
      stepNumber: 1,
      operation: 'ENQUEUE',
      value: '10',
      explanation: 'Ticket [10] enters at REAR.',
      resultingQueue: ['10'],
    },
    {
      stepNumber: 2,
      operation: 'ENQUEUE',
      value: '20',
      explanation: 'Ticket [20] enters at REAR behind [10].',
      resultingQueue: ['10', '20'],
    },
    {
      stepNumber: 3,
      operation: 'DEQUEUE',
      value: '10',
      explanation: 'DEQUEUE removes ticket [10] from FRONT. [20] becomes FRONT.',
      resultingQueue: ['20'],
      removedItem: '10',
    },
    {
      stepNumber: 4,
      operation: 'ENQUEUE',
      value: '30',
      explanation: 'Ticket [30] enters at REAR.',
      resultingQueue: ['20', '30'],
    },
    {
      stepNumber: 5,
      operation: 'ENQUEUE',
      value: '40',
      explanation: 'Ticket [40] enters at REAR.',
      resultingQueue: ['20', '30', '40'],
    },
    {
      stepNumber: 6,
      operation: 'DEQUEUE',
      value: '20',
      explanation: 'DEQUEUE removes ticket [20] from FRONT! Ticket [30] is now at FRONT.',
      resultingQueue: ['30', '40'],
      removedItem: '20',
    },
  ],
  'l2-c4': [
    {
      stepNumber: 1,
      operation: 'ENQUEUE',
      value: 'X',
      explanation: 'Start empty []. Enqueue [X] at REAR.',
      resultingQueue: ['X'],
    },
    {
      stepNumber: 2,
      operation: 'ENQUEUE',
      value: 'Y',
      explanation: 'Enqueue [Y] at REAR behind [X].',
      resultingQueue: ['X', 'Y'],
    },
    {
      stepNumber: 3,
      operation: 'ENQUEUE',
      value: 'Z',
      explanation: 'Enqueue [Z] at REAR behind [Y].',
      resultingQueue: ['X', 'Y', 'Z'],
    },
    {
      stepNumber: 4,
      operation: 'DEQUEUE',
      value: 'X',
      explanation: 'DEQUEUE removes FRONT [X]. Queue is now [Y, Z].',
      resultingQueue: ['Y', 'Z'],
      removedItem: 'X',
    },
    {
      stepNumber: 5,
      operation: 'ENQUEUE',
      value: 'W',
      explanation: 'Enqueue [W] at REAR. Queue now holds 3 riders: [Y, Z, W].',
      resultingQueue: ['Y', 'Z', 'W'],
    },
  ],
};

export const InteractiveTraceSimulator: React.FC<InteractiveTraceSimulatorProps> = ({
  challengeId,
}) => {
  const steps = TRACE_DATA_BY_CHALLENGE[challengeId] || TRACE_DATA_BY_CHALLENGE['l2-c1'];
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [removedHistory, setRemovedHistory] = useState<(string | number)[]>([]);

  const currentStep = steps[currentStepIdx];
  const isAtStart = currentStepIdx === 0;
  const isAtEnd = currentStepIdx === steps.length - 1;

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      soundEffects.playClick();
      const nextIdx = currentStepIdx + 1;
      const nextStep = steps[nextIdx];
      setCurrentStepIdx(nextIdx);
      if (nextStep.removedItem) {
        setRemovedHistory((prev) => [...prev, nextStep.removedItem!]);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      soundEffects.playClick();
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      // Rebuild removed history up to prevIdx
      const rebuilt: (string | number)[] = [];
      for (let i = 0; i <= prevIdx; i++) {
        if (steps[i].removedItem) {
          rebuilt.push(steps[i].removedItem!);
        }
      }
      setRemovedHistory(rebuilt);
    }
  };

  const handleReset = () => {
    soundEffects.playClick();
    setCurrentStepIdx(0);
    setRemovedHistory(steps[0].removedItem ? [steps[0].removedItem] : []);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-300 dark:border-indigo-700/80 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black shadow-2xs">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                Interactive Execution Trace Simulator
              </span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold">
                Step {currentStepIdx + 1} of {steps.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Step through the operations to see how the queue state changes in real time!
            </p>
          </div>
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevStep}
            disabled={isAtStart}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={isAtEnd}
            className="px-3 py-1.5 rounded-lg border border-indigo-400 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            title="Reset Simulator to Step 1"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step Pills Timeline */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {steps.map((st, idx) => {
          const isActive = idx === currentStepIdx;
          const isPast = idx < currentStepIdx;
          return (
            <button
              key={idx}
              onClick={() => {
                soundEffects.playClick();
                setCurrentStepIdx(idx);
                const rebuilt: (string | number)[] = [];
                for (let i = 0; i <= idx; i++) {
                  if (steps[i].removedItem) rebuilt.push(steps[i].removedItem!);
                }
                setRemovedHistory(rebuilt);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition-all cursor-pointer border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200 dark:ring-indigo-900 scale-102'
                  : isPast
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {st.operation === 'ENQUEUE' ? `+ Enq [${st.value}]` : `- Deq`}
            </button>
          );
        })}
      </div>

      {/* Current Step Instruction Banner */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentStep.operation === 'ENQUEUE' ? (
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Step {currentStep.stepNumber}: {currentStep.operation} {currentStep.value ? `[${currentStep.value}]` : ''}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {currentStep.explanation}
            </p>
          </div>
        </div>

        {currentStep.removedItem && (
          <div className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold font-mono shrink-0">
            Removed: [{currentStep.removedItem}]
          </div>
        )}
      </div>

      {/* Dynamic Mini Queue Representation */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500">
          <span className="text-rose-600 dark:text-rose-400">FRONT (Position 0)</span>
          <span>CURRENT QUEUE IN MEMORY</span>
          <span className="text-emerald-600 dark:text-emerald-400">REAR (Newest)</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 min-h-[70px] p-2 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          {currentStep.resultingQueue.length === 0 ? (
            <span className="text-xs font-mono text-slate-400">Empty Queue []</span>
          ) : (
            currentStep.resultingQueue.map((item, idx) => {
              const isFront = idx === 0;
              const isRear = idx === currentStep.resultingQueue.length - 1;
              return (
                <motion.div
                  key={`${item}-${idx}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`w-14 h-14 rounded-xl border-2 font-mono font-black text-base flex flex-col items-center justify-center shadow-xs transition-colors ${
                    isFront
                      ? 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/70 dark:text-rose-200 ring-2 ring-rose-200 dark:ring-rose-900'
                      : isRear
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 ring-2 ring-emerald-200 dark:ring-emerald-900'
                      : 'border-slate-300 bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  <span>{item}</span>
                  <span className="text-[9px] font-normal opacity-70">
                    {isFront ? 'FRONT' : isRear ? 'REAR' : `idx ${idx}`}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Removed Elements Tracker */}
        {removedHistory.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs font-mono">
            <span className="font-bold text-slate-500">Dequeued so far:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {removedHistory.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-800"
                >
                  {idx > 0 ? '→ ' : ''}[{item}]
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
