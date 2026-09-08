import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const QueueHeroDiagram: React.FC = () => {
  const elements = [
    { value: 10, index: 0, isFront: true, isRear: false },
    { value: 20, index: 1, isFront: false, isRear: false },
    { value: 30, index: 2, isFront: false, isRear: false },
    { value: 40, index: 3, isFront: false, isRear: true },
  ];

  return (
    <div
      id="queue-hero-diagram"
      className="flex flex-col items-center justify-center w-full max-w-xl mx-auto py-2 select-none"
    >
      {/* Top Main Row: Clear Queue Icon + ONE Arrow + Horizontal Array */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
        {/* ─── 1. Left: Clear and Effective Queue Data Structure Icon ─── */}
        <div className="shrink-0 flex items-center justify-center">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex flex-col items-center justify-center text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 border border-blue-400/40 p-2"
            title="Queue Data Structure (FIFO)"
          >
            {/* Visual Queue Pipeline Icon with items moving right to left */}
            <svg
              className="w-9 h-9 sm:w-11 sm:h-11 text-white"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Upper Rail */}
              <path
                d="M 6 12 L 34 12"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Lower Rail */}
              <path
                d="M 6 28 L 34 28"
                stroke="white"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              {/* Queue Items inside rails */}
              <rect x="9" y="15" width="5.5" height="10" rx="1.5" fill="white" />
              <rect x="17.2" y="15" width="5.5" height="10" rx="1.5" fill="white" fillOpacity="0.85" />
              <rect x="25.5" y="15" width="5.5" height="10" rx="1.5" fill="white" fillOpacity="0.7" />
              {/* Left departure arrow */}
              <path
                d="M 5 20 L 2 20 M 4 17.5 L 1.5 20 L 4 22.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-blue-100 mt-0.5">
              QUEUE
            </span>
          </div>
        </div>

        {/* ─── 2. Middle: Exactly ONE Clean Arrow Mark ─── */}
        <div className="shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg
            className="w-10 sm:w-14 h-8 overflow-visible"
            viewBox="0 0 48 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Single clean connecting arrow line */}
            <path
              d="M 4 12 L 38 12"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Single arrow head */}
            <path
              d="M 30 5 L 39 12 L 30 19"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ─── 3. Right: Queue in the form of an Array with Light Blue Shade ─── */}
        <div className="flex flex-col items-center shrink-0">
          {/* Pointer Indicators Row (FRONT ↓ and REAR ↓) */}
          <div className="grid grid-cols-4 gap-0 w-48 sm:w-64 mb-1">
            {elements.map((item) => (
              <div key={item.index} className="flex flex-col items-center justify-end h-9">
                {item.isFront && (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[11px] sm:text-xs font-bold tracking-wider text-slate-900 dark:text-slate-100 uppercase font-sans leading-none">
                      FRONT
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 leading-none mt-0.5">
                      ↓
                    </span>
                  </div>
                )}
                {item.isRear && (
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[11px] sm:text-xs font-bold tracking-wider text-slate-900 dark:text-slate-100 uppercase font-sans leading-none">
                      REAR
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 leading-none mt-0.5">
                      ↓
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Array Container: Distinct Light Blue Shade inside with crisp Blue Border */}
          <div className="flex w-48 sm:w-64 rounded-2xl sm:rounded-3xl border-2 border-sky-500 dark:border-sky-400 bg-sky-100/90 dark:bg-sky-950/80 shadow-md shadow-sky-500/15 divide-x-2 divide-sky-300 dark:divide-sky-800 overflow-hidden">
            {elements.map((item) => (
              <div
                key={item.index}
                className={`flex-1 h-12 sm:h-14 flex items-center justify-center text-base sm:text-xl font-bold font-sans select-none transition-colors ${
                  item.isFront
                    ? 'bg-sky-200/90 dark:bg-sky-900/70 text-sky-950 dark:text-sky-100'
                    : item.isRear
                    ? 'bg-sky-200/70 dark:bg-sky-900/60 text-sky-950 dark:text-sky-100'
                    : 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200'
                }`}
              >
                {item.value}
              </div>
            ))}
          </div>

          {/* Array Indices Row: [0]  [1]  [2]  [3] */}
          <div className="grid grid-cols-4 gap-0 w-48 sm:w-64 mt-1.5">
            {elements.map((item) => (
              <div
                key={item.index}
                className="text-center font-mono text-[11px] sm:text-xs font-bold text-sky-700 dark:text-sky-400"
              >
                [{item.index}]
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom Flow Explanatory Bar (Dequeue ← | FIFO | → Enqueue) ─── */}
      <div className="flex items-center justify-between w-full max-w-sm sm:max-w-md mt-4 px-2 pt-2.5 border-t border-slate-200/80 dark:border-slate-800 text-[11px] sm:text-xs font-mono">
        <div className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Dequeue (Exit)</span>
        </div>

        <span className="text-slate-400 dark:text-slate-500 font-semibold">
          FIFO Order
        </span>

        <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
          <span>Enqueue (Entry)</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};


