import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Flame,
  Clock,
  RotateCw,
  GitFork,
} from 'lucide-react';
import { GameChallenge } from '../../types';

interface LevelPedagogicalCardProps {
  levelId: number;
  currentChallenge: GameChallenge;
  activeQueue: (string | number)[];
  capacity: number;
  isPeeking: boolean;
  frontValue: string | number | null;
  rearValue: string | number | null;
}

export const LevelPedagogicalCard: React.FC<LevelPedagogicalCardProps> = ({
  levelId,
  currentChallenge,
  activeQueue,
  capacity,
  isPeeking,
  frontValue,
  rearValue,
}) => {
  // Only render for levels 1, 2, and 3
  if (levelId > 3) return null;

  const isOverflowChallenge =
    currentChallenge.mode === 'overflow' ||
    currentChallenge.id === 'l1-c7' ||
    currentChallenge.id === 'l1-c8' ||
    currentChallenge.question.includes('OVERFLOW');

  const isUnderflowChallenge =
    currentChallenge.mode === 'underflow' ||
    currentChallenge.id === 'l1-c9' ||
    currentChallenge.id === 'l1-c10' ||
    currentChallenge.question.includes('UNDERFLOW');

  const isDequeueChallenge =
    currentChallenge.mode === 'dequeue' ||
    currentChallenge.id === 'l1-c4' ||
    currentChallenge.id === 'l1-c5' ||
    currentChallenge.id === 'l1-c6';

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 space-y-3">
      {/* ========================================================================= */}
      {/* LEVEL 1: QUEUE OPERATIONS & BOUNDARY GUARDS */}
      {/* ========================================================================= */}
      {levelId === 1 && (
        <div className="space-y-3">
          {/* Subview A: OVERFLOW CAPACITY GUARD */}
          {isOverflowChallenge && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                    01
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Defensive Boundary Guard: Capacity &amp; Queue Overflow
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                  Fixed Capacity: {capacity} Slots Max
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Queue Saturation Monitor</span>
                    <span className="font-mono text-[10px] text-amber-500 font-bold">
                      {activeQueue.length >= capacity ? '🚨 SATURATED' : 'AVAILABLE'}
                    </span>
                  </div>
                  <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-100">
                    {activeQueue.length} / {capacity} Occupied ({Math.round((activeQueue.length / capacity) * 100)}%)
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        activeQueue.length >= capacity ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      animate={{ width: `${Math.min(100, (activeQueue.length / capacity) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    When active size reaches maximum capacity, attempting ENQUEUE triggers Queue Overflow.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Defensive Guardrail Invariant</span>
                  </div>
                  <pre className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">
{`if (isFull()) {
  throw new QueueOverflowException();
}`}
                  </pre>
                  <p className="text-[10px] text-slate-400">
                    Production systems reject writes when buffer is full to prevent memory corruption.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subview B: UNDERFLOW EMPTY GUARD */}
          {isUnderflowChallenge && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold font-mono">
                    01
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Defensive Boundary Guard: Empty Station &amp; Queue Underflow
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                  {activeQueue.length === 0 ? '🚨 QUEUE EMPTY (SIZE 0)' : `${activeQueue.length} In Line`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Queue Pointers State</span>
                    <span className="font-mono text-[10px] text-rose-500 font-bold">
                      {activeQueue.length === 0 ? 'RESET' : 'ACTIVE'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div>FRONT: <strong>{activeQueue.length > 0 ? activeQueue[0] : 'null (-1)'}</strong></div>
                    <div>REAR: <strong>{activeQueue.length > 0 ? activeQueue[activeQueue.length - 1] : 'null (-1)'}</strong></div>
                    <div>SIZE: <strong>{activeQueue.length} / {capacity}</strong></div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    When all riders board, pointers reset. No element exists for DEQUEUE or PEEK.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Defensive Underflow Invariant</span>
                  </div>
                  <pre className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">
{`if (isEmpty()) {
  throw new QueueUnderflowException();
}`}
                  </pre>
                  <p className="text-[10px] text-slate-400">
                    Calling DEQUEUE on an empty queue triggers Underflow, preventing null dereference errors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subview C: DEQUEUE LIFECYCLE */}
          {isDequeueChallenge && !isOverflowChallenge && !isUnderflowChallenge && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold font-mono">
                    01
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    FIFO Dequeue Lifecycle: Earliest Arrival Boards First
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Order In == Order Out
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>DEQUEUE (Exit from FRONT)</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    Boarding next:{' '}
                    <strong className="text-blue-700 dark:text-blue-300">
                      {frontValue !== null ? `Visitor [${frontValue}]` : 'None'}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    DEQUEUE always extracts the visitor at FRONT (index 0). It never removes from the middle or rear.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Queue Advancement Invariant</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    Next in line:{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {activeQueue.length > 1 ? `Visitor [${activeQueue[1]}]` : 'None'}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    When the front visitor departs, the second visitor automatically advances to become the new FRONT.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Subview D: DEFAULT ENQUEUE & POINTER ANATOMY */}
          {!isOverflowChallenge && !isUnderflowChallenge && !isDequeueChallenge && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    01
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Pointer Anatomy: FRONT Gate, REAR Entry &amp; FIFO Invariant
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                  FIFO: First In, First Out
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    <span>FRONT (Index 0)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800">
                      EXIT GATE
                    </span>
                  </div>
                  <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-100">
                    {frontValue !== null ? `Visitor [${frontValue}]` : 'Empty (None)'}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Earliest arrival. Next in line to be served by DEQUEUE.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    <span>REAR (Index {activeQueue.length > 0 ? activeQueue.length - 1 : 0})</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
                      ENTRY GATE
                    </span>
                  </div>
                  <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-100">
                    {rearValue !== null ? `Visitor [${rearValue}]` : 'Empty (None)'}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    Latest arrival. New elements always append here via ENQUEUE.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>SIZE / CAPACITY</span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {Math.round((activeQueue.length / capacity) * 100)}% Full
                    </span>
                  </div>
                  <div className="text-base font-mono font-bold text-slate-800 dark:text-slate-100">
                    {activeQueue.length} / {capacity} Slots
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                      animate={{ width: `${(activeQueue.length / capacity) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: OPERATION TRACING & PIPELINE PREDICTION */}
      {/* ========================================================================= */}
      {levelId === 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">
                02
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Mental Pipeline Trace: Compound Enqueue/Dequeue Invariants
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>FIFO Pipeline Invariant</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Execution Sequence Analysis
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Step {currentChallenge.challengeNumber || 1} / 4
                </span>
              </div>
              <div className="text-[11px] font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded text-slate-700 dark:text-slate-300 space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400">1. ENQUEUE A → [A]</div>
                <div className="text-emerald-600 dark:text-emerald-400">2. ENQUEUE B → [A, B]</div>
                <div className="text-blue-600 dark:text-blue-400">3. DEQUEUE   → A exits, [B] stays</div>
                <div className="text-emerald-600 dark:text-emerald-400">4. ENQUEUE C → [B, C]</div>
                <div className="text-blue-600 dark:text-blue-400">5. DEQUEUE   → B exits, [C] stays</div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Trace departures step-by-step: earliest arrival at FRONT always exits next.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>State Tracking Ledger</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                  <span>Current Active Queue:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    [{activeQueue.join(', ') || 'EMPTY'}]
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                  <span>Departure Order:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    A → B (FIFO Order)
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                  <span>Remaining in Line:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    Visitor [C]
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                FIFO ensures departure order mirrors arrival order regardless of interleaving frequency.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: ADVANCED QUEUE ARCHITECTURES */}
      {/* ========================================================================= */}
      {levelId === 3 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                03
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Advanced Queue Architectures: Multi-Queue &amp; Circular Modulo Wraparound
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <RotateCw className="w-3 h-3 text-amber-500" />
              <span>(rear + 1) % MAX</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <GitFork className="w-3.5 h-3.5 text-blue-500" />
                <span>Multi-Queue Dispatch Hub</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Separate lines for 🎢 Rollercoaster, 🍔 Snack Bar, and 🚑 Emergency Fast-Pass. Each line enforces its own isolated FRONT and REAR pointers.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                <RotateCw className="w-3.5 h-3.5 text-amber-500" />
                <span>Circular Ring Buffer Modulo</span>
              </div>
              <pre className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-slate-800 dark:text-slate-200 overflow-x-auto">
{`rear = (rear + 1) % MAX; // wraps 4 → 0
isFull = (rear + 1) % MAX === front;`}
              </pre>
              <p className="text-[10px] text-slate-400 leading-tight">
                Eliminates false overflow by recycling front slots vacated by departures without array shifting.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
