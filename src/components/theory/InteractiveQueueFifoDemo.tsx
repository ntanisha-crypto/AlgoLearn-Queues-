import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, ArrowRight, Check, Sparkles, User, Ticket } from 'lucide-react';
import { soundEffects } from '../../services/sound';

export const InteractiveQueueFifoDemo: React.FC = () => {
  const [step, setStep] = useState<number>(0);

  const stepsData = [
    {
      title: 'Initial State: Ticket Counter Empty',
      action: 'No customers in line',
      items: [],
      served: null,
      note: 'Queue is empty. FRONT and REAR are both unassigned (-1).',
      badge: 'EMPTY LINE',
      type: 'info',
    },
    {
      title: 'Step 1: Customer Alice (10) Arrives',
      action: 'Alice enters at REAR',
      items: [{ name: 'Alice', id: 10, color: 'bg-blue-600' }],
      served: null,
      note: 'Alice is FIRST IN. FRONT points to Alice; REAR also points to Alice.',
      badge: 'FIRST IN ★',
      type: 'entry',
    },
    {
      title: 'Step 2: Customer Bob (20) Arrives',
      action: 'Bob enters behind Alice at REAR',
      items: [
        { name: 'Alice', id: 10, color: 'bg-blue-600' },
        { name: 'Bob', id: 20, color: 'bg-indigo-600' },
      ],
      served: null,
      note: 'Bob stands behind Alice. FRONT is still Alice; REAR now points to Bob.',
      badge: 'SECOND IN',
      type: 'entry',
    },
    {
      title: 'Step 3: Customer Charlie (30) Arrives',
      action: 'Charlie joins the line at REAR',
      items: [
        { name: 'Alice', id: 10, color: 'bg-blue-600' },
        { name: 'Bob', id: 20, color: 'bg-indigo-600' },
        { name: 'Charlie', id: 30, color: 'bg-violet-600' },
      ],
      served: null,
      note: 'Charlie is the LAST IN. FRONT is Alice; REAR is Charlie.',
      badge: 'LAST IN',
      type: 'entry',
    },
    {
      title: 'Step 4: Ticket Counter Serves Alice!',
      action: 'Alice was First In → Alice is FIRST OUT!',
      items: [
        { name: 'Bob', id: 20, color: 'bg-indigo-600' },
        { name: 'Charlie', id: 30, color: 'bg-violet-600' },
      ],
      served: { name: 'Alice', id: 10, note: 'First customer served!' },
      note: '★ FIFO PROVEN: Alice entered first, so Alice gets her ticket first. Bob is now the new FRONT.',
      badge: 'FIRST OUT ★',
      type: 'exit',
    },
    {
      title: 'Step 5: Ticket Counter Serves Bob!',
      action: 'Bob entered second → Bob is Second Out',
      items: [{ name: 'Charlie', id: 30, color: 'bg-violet-600' }],
      served: { name: 'Bob', id: 20, note: 'Second customer served!' },
      note: 'Bob gets his ticket and exits. Charlie advances to FRONT.',
      badge: 'SECOND OUT',
      type: 'exit',
    },
    {
      title: 'Step 6: Ticket Counter Serves Charlie!',
      action: 'Charlie entered last → Charlie is Served Last',
      items: [],
      served: { name: 'Charlie', id: 30, note: 'Final customer served!' },
      note: 'All customers served in EXACT order of arrival. Queue is now empty.',
      badge: 'LAST OUT',
      type: 'exit',
    },
  ];

  const current = stepsData[step];

  const handleNext = () => {
    if (step < stepsData.length - 1) {
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>FIFO Lifecycle Visualizer</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              FIRST IN, FIRST OUT
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step through how elements maintain strict arrival order from entry (REAR) to exit (FRONT).
          </p>
        </div>

        <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900/50">
          Step {step + 1} of {stepsData.length}
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="my-6 p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
        {/* Ticket Counter / Exit Window Graphic */}
        <div className="w-full max-w-md flex items-center justify-between px-4 py-2 mb-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <Ticket className="w-4 h-4" />
            <span>Service Window (FRONT)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Exit Way</span>
        </div>

        {/* The Line / Queue visual */}
        <div className="flex items-center justify-center gap-3 min-h-[90px] w-full max-w-lg py-2">
          {current.items.length === 0 ? (
            <div className="text-xs font-mono text-slate-400 italic py-4">
              Line is empty. No one waiting.
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AnimatePresence mode="popLayout">
                {current.items.map((person, idx) => (
                  <motion.div
                    key={person.name}
                    layout
                    initial={{ opacity: 0, scale: 0.7, x: 40 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -50 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="relative flex flex-col items-center"
                  >
                    {idx === 0 && (
                      <span className="absolute -top-5 text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">
                        FRONT
                      </span>
                    )}
                    {idx === current.items.length - 1 && (
                      <span className="absolute -bottom-5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                        REAR
                      </span>
                    )}

                    <div className={`w-16 h-16 rounded-2xl ${person.color} text-white flex flex-col items-center justify-center shadow-md`}>
                      <User className="w-6 h-6 stroke-[2.2]" />
                      <span className="text-[10px] font-bold mt-0.5">{person.name}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Served Person Notification */}
        {current.served && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Served: {current.served.name} (Value: {current.served.id}) — {current.served.note}</span>
          </motion.div>
        )}
      </div>

      {/* Explanatory Step Card */}
      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {current.title}
          </h5>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
            {current.badge}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {current.note}
        </p>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              step === 0
                ? 'opacity-40 border-slate-200 dark:border-slate-700 cursor-not-allowed text-slate-400'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={step === stepsData.length - 1}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              step === stepsData.length - 1
                ? 'opacity-40 bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs active:scale-95'
            }`}
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
