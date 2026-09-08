import React, { useState } from 'react';
import { Network, Layers, GitFork, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const InteractiveQueueDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('fifo');

  const nodesInfo: Record<string, { title: string; subtitle: string; formula: string; rules: string[] }> = {
    fifo: {
      title: 'FIFO Core Principle',
      subtitle: 'First In, First Out',
      formula: 'arrival_order === departure_order',
      rules: [
        'Elements enter at REAR (back).',
        'Elements leave from FRONT (head).',
        'Strictly fair sequential processing.',
      ],
    },
    linear: {
      title: 'Linear Array Queue',
      subtitle: 'Fixed Buffer Implementation',
      formula: 'isFull: rear == capacity - 1',
      rules: [
        'Simple to implement with static array.',
        'Flaw: False Overflow when front moves right.',
        'Requires shifting O(N) or circular wrapping.',
      ],
    },
    circular: {
      title: 'Circular Queue (Ring Buffer)',
      subtitle: 'Modulo Arithmetic Wraparound',
      formula: 'rear = (rear + 1) % capacity',
      rules: [
        'Reuses freed space at index 0..front.',
        'Full check: (rear + 1) % capacity == front.',
        'Guarantees true O(1) without element shifting.',
      ],
    },
    linkedlist: {
      title: 'Linked List Queue',
      subtitle: 'Dynamic Pointer Chain',
      formula: 'rear.next = newNode; rear = newNode;',
      rules: [
        'FRONT tracks Head, REAR tracks Tail.',
        'Zero capacity limits (no overflow risk).',
        'Both Enqueue and Dequeue run in O(1) time.',
      ],
    },
    deque: {
      title: 'Deque (Double-Ended Queue)',
      subtitle: 'Dual Open-Ended Data Structure',
      formula: 'insert/delete at BOTH front and rear',
      rules: [
        'Can function as both LIFO Stack and FIFO Queue.',
        'Used in sliding window maximum problems.',
        'Four primary operations in O(1).',
      ],
    },
    bfs: {
      title: 'BFS & Graph Algorithms',
      subtitle: 'Level-Order Graph Traversal',
      formula: 'while(!q.empty()) { u = q.pop(); visit(u); q.push(nbrs); }',
      rules: [
        'Guarantees shortest path in unweighted graphs.',
        'Processes distance d before distance d+1.',
        'Stack = DFS, Queue = BFS.',
      ],
    },
  };

  const active = nodesInfo[selectedNode] || nodesInfo.fifo;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Entire Queue Architecture in One Interactive Map</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              UNIFIED CONCEPT MAP
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any component node in the visual map below to inspect its formulas and invariant rules.
          </p>
        </div>
      </div>

      {/* Interactive Node Graph */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { id: 'fifo', label: '1. FIFO Principle', icon: Zap, color: 'border-blue-500 text-blue-600' },
          { id: 'linear', label: '2. Linear Queue', icon: Layers, color: 'border-slate-400 text-slate-600' },
          { id: 'circular', label: '3. Circular Queue', icon: ShieldCheck, color: 'border-emerald-500 text-emerald-600' },
          { id: 'linkedlist', label: '4. Linked List Queue', icon: GitFork, color: 'border-indigo-500 text-indigo-600' },
          { id: 'deque', label: '5. Deque (Double-Ended)', icon: Network, color: 'border-violet-500 text-violet-600' },
          { id: 'bfs', label: '6. BFS Engine', icon: Zap, color: 'border-amber-500 text-amber-600' },
        ].map((node) => {
          const isSelected = selectedNode === node.id;
          const Icon = node.icon;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node.id)}
              className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${node.color}`} />
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {node.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Node Details */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
              {active.title}
            </h5>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {active.subtitle}
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            {active.formula}
          </span>
        </div>

        <ul className="space-y-1.5 pt-1">
          {active.rules.map((rule, idx) => (
            <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
