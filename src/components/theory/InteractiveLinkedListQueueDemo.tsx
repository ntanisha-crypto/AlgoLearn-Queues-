import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, RotateCcw, ArrowRight, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface ListNode {
  id: number;
  val: number;
}

export const InteractiveLinkedListQueueDemo: React.FC = () => {
  const [nodes, setNodes] = useState<ListNode[]>([
    { id: 1, val: 10 },
    { id: 2, val: 20 },
    { id: 3, val: 30 },
  ]);
  const [nextId, setNextId] = useState<number>(4);
  const [nextVal, setNextVal] = useState<number>(40);
  const [log, setLog] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' }>({
    text: 'Linked List Queue: FRONT tracks head node, REAR tracks tail node. Both O(1).',
    type: 'info',
  });

  const handleEnqueue = () => {
    if (nodes.length >= 6) {
      soundEffects.playError();
      setLog({
        text: 'Canvas display limit reached (6 nodes). In actual memory, linked list has NO capacity limit!',
        type: 'warning',
      });
      return;
    }

    soundEffects.playPush();
    const newNode: ListNode = { id: nextId, val: nextVal };
    setNodes((prev) => [...prev, newNode]);
    setNextId((prev) => prev + 1);
    setNextVal((prev) => prev + 10);
    setLog({
      text: `✅ ENQUEUE(${nextVal}): Created node [${nextVal}], linked to rear.next, moved REAR pointer. O(1) time.`,
      type: 'success',
    });
  };

  const handleDequeue = () => {
    if (nodes.length === 0) {
      soundEffects.playError();
      setLog({
        text: '❌ UNDERFLOW: Queue is empty. No nodes to remove.',
        type: 'error',
      });
      return;
    }

    soundEffects.playPop();
    const removed = nodes[0];
    setNodes((prev) => prev.slice(1));
    setLog({
      text: `✅ DEQUEUE(): Removed FRONT node [${removed.val}], moved FRONT to front.next. Memory freed in O(1).`,
      type: 'warning',
    });
  };

  const handleReset = () => {
    soundEffects.playReset();
    setNodes([
      { id: 1, val: 10 },
      { id: 2, val: 20 },
      { id: 3, val: 30 },
    ]);
    setNextId(4);
    setNextVal(40);
    setLog({
      text: 'Linked list queue reset.',
      type: 'info',
    });
  };

  const isEmpty = nodes.length === 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Linked List Queue Architecture</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              DYNAMIC O(1)
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            FRONT points to Head (deletion), REAR points to Tail (insertion). No fixed size limit.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Nodes: <strong>{nodes.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold">
            Dynamic Memory
          </span>
        </div>
      </div>

      {/* Nodes visualizer */}
      <div className="my-6 p-6 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto custom-scrollbar flex items-center justify-center min-h-[140px]">
        {isEmpty ? (
          <div className="text-xs font-mono text-slate-400 italic py-4">
            Queue is empty (FRONT = NULL, REAR = NULL). Click [Enqueue Node] to allocate a node.
          </div>
        ) : (
          <div className="flex items-center gap-2 py-3 px-2">
            <AnimatePresence mode="popLayout">
              {nodes.map((node, index) => {
                const isFront = index === 0;
                const isRear = index === nodes.length - 1;

                return (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.6, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -30 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className="flex items-center shrink-0"
                  >
                    <div className="relative flex flex-col items-center shrink-0">
                      {/* Pointer Badges */}
                      <div className="h-5 flex items-center mb-1 text-[10px] font-mono font-bold">
                        {isFront && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                            FRONT
                          </span>
                        )}
                      </div>

                      {/* Node Box [ Data | Next ] */}
                      <div className="flex rounded-xl border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-x-2 divide-blue-100 dark:divide-blue-900/60">
                        <div className="px-3.5 py-2.5 text-center text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white bg-blue-50/50 dark:bg-blue-950/30 min-w-[44px]">
                          {node.val}
                        </div>
                        <div className="px-2 py-2.5 text-center text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                          •
                        </div>
                      </div>

                      {/* Bottom Rear Badge */}
                      <div className="h-5 flex items-center mt-1 text-[10px] font-mono font-bold">
                        {isRear && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                            REAR
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow to Next Node or NULL */}
                    {index < nodes.length - 1 ? (
                      <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mx-0.5" />
                    ) : (
                      <div className="flex items-center gap-1 shrink-0 ml-1 text-xs font-mono font-bold text-slate-400">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>NULL</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Log */}
      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 mb-5 ${
        log.type === 'error'
          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
          : log.type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
          : log.type === 'warning'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200'
          : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-200'
      }`}>
        {log.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />}
        {log.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
        {log.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />}
        {log.type === 'info' && <Sparkles className="w-4 h-4 shrink-0 text-blue-600" />}
        <span className="font-medium">{log.text}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnqueue}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Enqueue Node ({nextVal})</span>
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
            <span>Dequeue Node (Head)</span>
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
