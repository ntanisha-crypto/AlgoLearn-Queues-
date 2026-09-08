import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw, ArrowRight, CheckCircle2, Network, Sparkles } from 'lucide-react';
import { soundEffects } from '../../services/sound';

export const InteractiveQueueBfsDemo: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  const steps = [
    {
      action: 'Initialize BFS at root node A',
      queue: ['A'],
      visited: [],
      current: null,
      explanation: 'Enqueue starting node A. Queue holds nodes waiting to have their neighbors explored.',
    },
    {
      action: 'Dequeue A, visit it, enqueue neighbors B and C',
      queue: ['B', 'C'],
      visited: ['A'],
      current: 'A',
      explanation: 'Level 0 complete! A is visited. B and C (Level 1) enter the back of the queue.',
    },
    {
      action: 'Dequeue B, visit it, enqueue neighbors D and E',
      queue: ['C', 'D', 'E'],
      visited: ['A', 'B'],
      current: 'B',
      explanation: 'B is processed. D and E (Level 2) are enqueued behind C. C is still next at FRONT!',
    },
    {
      action: 'Dequeue C, visit it, enqueue neighbor F',
      queue: ['D', 'E', 'F'],
      visited: ['A', 'B', 'C'],
      current: 'C',
      explanation: 'Level 1 complete! Both B and C visited before any Level 2 nodes are dequeued.',
    },
    {
      action: 'Dequeue D, visit it',
      queue: ['E', 'F'],
      visited: ['A', 'B', 'C', 'D'],
      current: 'D',
      explanation: 'D has no unvisited children. Next in queue is E.',
    },
    {
      action: 'Dequeue E, visit it',
      queue: ['F'],
      visited: ['A', 'B', 'C', 'D', 'E'],
      current: 'E',
      explanation: 'E has no unvisited children. Next in queue is F.',
    },
    {
      action: 'Dequeue F, visit it. Queue empty → BFS Complete!',
      queue: [],
      visited: ['A', 'B', 'C', 'D', 'E', 'F'],
      current: 'F',
      explanation: '★ All nodes visited in exact breadth/level order: [A] → [B, C] → [D, E, F]!',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      soundEffects.playClick();
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      soundEffects.playClick();
      setStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    soundEffects.playReset();
    setStep(0);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>BFS (Breadth-First Search) Queue Engine</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              LEVEL-ORDER TRAVERSAL
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Why BFS mandates a Queue: FIFO ensures parents are processed before their children.
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50">
          Step {step + 1} of {steps.length}
        </div>
      </div>

      {/* Main visualization grid */}
      <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tree Node Graph */}
        <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-3">
            Target Graph Structure
          </span>

          <div className="space-y-4 flex flex-col items-center">
            {/* Level 0: A */}
            <div className="flex justify-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 font-mono transition-colors ${
                  currentStep.visited.includes('A')
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : currentStep.queue.includes('A')
                    ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                }`}
              >
                A
              </div>
            </div>

            {/* Level 1: B, C */}
            <div className="flex gap-16 justify-center">
              {['B', 'C'].map((node) => (
                <div
                  key={node}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 font-mono transition-colors ${
                    currentStep.visited.includes(node)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : currentStep.queue.includes(node)
                      ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {node}
                </div>
              ))}
            </div>

            {/* Level 2: D, E, F */}
            <div className="flex gap-8 justify-center">
              {['D', 'E', 'F'].map((node) => (
                <div
                  key={node}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 font-mono transition-colors ${
                    currentStep.visited.includes(node)
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : currentStep.queue.includes(node)
                      ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {node}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-5 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> Visited
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" /> In Queue
            </span>
          </div>
        </div>

        {/* Live Queue & Visited Output */}
        <div className="p-5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Live Queue Box */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>FIFO Queue State</span>
                <span className="text-[10px] font-mono text-slate-400">FRONT → REAR</span>
              </div>
              <div className="min-h-[48px] p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                {currentStep.queue.length === 0 ? (
                  <span className="text-xs font-mono text-slate-400 italic px-2">
                    Queue is empty
                  </span>
                ) : (
                  currentStep.queue.map((node, i) => (
                    <div
                      key={node}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                        i === 0
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <span>{node}</span>
                      {i === 0 && <span className="text-[9px] uppercase font-sans">Front</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Visited Order */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Visited Order</span>
                <span className="text-[10px] font-mono text-emerald-600">Level-by-Level</span>
              </div>
              <div className="min-h-[48px] p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 flex-wrap">
                {currentStep.visited.length === 0 ? (
                  <span className="text-xs font-mono text-slate-400 italic px-2">
                    None yet
                  </span>
                ) : (
                  currentStep.visited.map((v) => (
                    <span
                      key={v}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold"
                    >
                      {v}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-3 mt-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
            <strong>Action:</strong> {currentStep.action}.
            <p className="mt-1 text-[11px] text-blue-800/80 dark:text-blue-300/80">
              {currentStep.explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset BFS</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={step === steps.length - 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs active:scale-95"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
