import React, { useState } from 'react';
import { CheckCircle2, Award, Zap, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';
import { soundEffects } from '../../services/sound';

export const InteractiveQueueSummary: React.FC = () => {
  const [checkedRules, setCheckedRules] = useState<number[]>([0, 1]);

  const rules = [
    {
      title: '1. The Golden FIFO Principle',
      desc: 'Elements are added at REAR and removed from FRONT. The first element enqueued is always the first element dequeued.',
      tag: 'CORE INVARIANT',
    },
    {
      title: '2. Circular Queue Modulo Arithmetic',
      desc: 'Always advance pointers via: next = (current + 1) % capacity. Full condition is: (rear + 1) % capacity == front.',
      tag: 'FORMULA',
    },
    {
      title: '3. Precondition Safety Checks',
      desc: 'Never dequeue or peek without checking isEmpty() first (avoids Underflow). Never enqueue into static arrays without isFull() check (avoids Overflow).',
      tag: 'SAFETY RULE',
    },
    {
      title: '4. BFS Traversal Rule',
      desc: 'Breadth-First Search (BFS) in trees and graphs strictly relies on a FIFO Queue to ensure all nodes at distance D are visited before distance D+1.',
      tag: 'ALGORITHMS',
    },
    {
      title: '5. Dynamic Linked List Queue Requires Two Pointers',
      desc: 'To achieve O(1) time for both Enqueue and Dequeue, you must keep both a HEAD (Front) pointer and a TAIL (Rear) pointer.',
      tag: 'POINTER RULE',
    },
    {
      title: '6. Priority Queue != FIFO',
      desc: 'In a Priority Queue, elements are dequeued based on priority value (highest priority first), typically backed by a Binary Heap in O(log N).',
      tag: 'VARIANT',
    },
  ];

  const toggleCheck = (idx: number) => {
    soundEffects.playClick();
    if (checkedRules.includes(idx)) {
      setCheckedRules(checkedRules.filter((i) => i !== idx));
    } else {
      setCheckedRules([...checkedRules, idx]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Essential Queue Memory Checklist</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-900/40">
              INTERVIEW &amp; EXAM CHEAT SHEET
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click each rule to mark it mastered as you prepare for interviews and problem solving.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
          Mastered: {checkedRules.length} / {rules.length} Rules
        </div>
      </div>

      {/* Interactive Rules Checklist */}
      <div className="space-y-2.5">
        {rules.map((rule, idx) => {
          const isDone = checkedRules.includes(idx);
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                isDone
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                isDone
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
              }`}>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold font-mono ${
                    isDone ? 'text-emerald-900 dark:text-emerald-200 line-through opacity-80' : 'text-slate-900 dark:text-white'
                  }`}>
                    {rule.title}
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono uppercase">
                    {rule.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
