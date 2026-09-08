import React, { useState } from 'react';
import { Clock, Database, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export const InteractiveQueueComplexityTable: React.FC = () => {
  const [selectedOperation, setSelectedOperation] = useState<'all' | 'enqueue' | 'dequeue' | 'peek'>('all');

  const rows = [
    {
      type: 'Circular Queue (Array)',
      badge: 'RECOMMENDED FOR FIXED SIZE',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      enqueue: 'O(1)',
      dequeue: 'O(1)',
      peek: 'O(1)',
      search: 'O(N)',
      space: 'O(N)',
      notes: 'No false overflow; modulo arithmetic wraps pointers. Perfect cache locality.',
    },
    {
      type: 'Linked List Queue',
      badge: 'RECOMMENDED FOR DYNAMIC SIZE',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      enqueue: 'O(1)',
      dequeue: 'O(1)',
      peek: 'O(1)',
      search: 'O(N)',
      space: 'O(N)',
      notes: 'Grows dynamically without capacity limits. Slightly higher pointer overhead.',
    },
    {
      type: 'Linear Queue (Array)',
      badge: 'NAIVE IMPLEMENTATION',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      enqueue: 'O(1)',
      dequeue: 'O(1) or O(N)*',
      peek: 'O(1)',
      search: 'O(N)',
      space: 'O(N)',
      notes: '*O(1) causes false overflow without shifting; shifting elements costs O(N).',
    },
    {
      type: 'Double-Ended Queue (Deque)',
      badge: 'BIDIRECTIONAL ACCESS',
      badgeColor: 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-800',
      enqueue: 'O(1)',
      dequeue: 'O(1)',
      peek: 'O(1)',
      search: 'O(N)',
      space: 'O(N)',
      notes: 'Both ends insert/delete in O(1). Can emulate both Stack and Queue.',
    },
    {
      type: 'Priority Queue (Binary Heap)',
      badge: 'ORDER BY PRIORITY',
      badgeColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      enqueue: 'O(log N)',
      dequeue: 'O(log N)',
      peek: 'O(1)',
      search: 'O(N)',
      space: 'O(N)',
      notes: 'Maintains heap invariant. Extracts min/max in O(log N) rather than FIFO.',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Queue Complexity Matrix</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              TIME &amp; SPACE
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare asymptotic complexities across all major Queue implementation paradigms.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedOperation('all')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              selectedOperation === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedOperation('enqueue')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              selectedOperation === 'enqueue'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Enqueue
          </button>
          <button
            onClick={() => setSelectedOperation('dequeue')}
            className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              selectedOperation === 'dequeue'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Dequeue
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4 font-bold">IMPLEMENTATION</th>
              <th className={`py-3 px-3 font-bold ${selectedOperation === 'enqueue' ? 'text-blue-600 dark:text-blue-400' : ''}`}>ENQUEUE</th>
              <th className={`py-3 px-3 font-bold ${selectedOperation === 'dequeue' ? 'text-blue-600 dark:text-blue-400' : ''}`}>DEQUEUE</th>
              <th className="py-3 px-3 font-bold">PEEK</th>
              <th className="py-3 px-3 font-bold">SEARCH</th>
              <th className="py-3 px-3 font-bold">SPACE</th>
              <th className="py-3 px-4 font-bold">ARCHITECTURAL TRADEOFF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 dark:text-white font-mono">{r.type}</div>
                  <span className={`inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </td>
                <td className={`py-3 px-3 font-mono font-bold ${r.enqueue === 'O(1)' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {r.enqueue}
                </td>
                <td className={`py-3 px-3 font-mono font-bold ${r.dequeue === 'O(1)' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {r.dequeue}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {r.peek}
                </td>
                <td className="py-3 px-3 font-mono text-slate-500">
                  {r.search}
                </td>
                <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {r.space}
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 leading-normal max-w-xs">
                  {r.notes}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary note */}
      <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900 dark:text-white">Core Takeaway: </span>
          Both <strong>Circular Queue (Array)</strong> and <strong>Linked List Queue</strong> guarantee <strong>O(1) Enqueue</strong> and <strong>O(1) Dequeue</strong>. Use Circular Queue when capacity is known in advance to maximize CPU cache locality. Use Linked List Queue when size is unpredictable.
        </div>
      </div>
    </div>
  );
};
