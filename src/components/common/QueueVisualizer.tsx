import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, AlertCircle, Eye, LogIn, LogOut, Sparkles } from 'lucide-react';
import { StackItem } from '../../types';

export interface QueueVisualizerItem {
  id: string;
  value: number | string;
  color?: string;
  addedAt?: number;
}

interface QueueVisualizerProps {
  items: (StackItem | QueueVisualizerItem | string | number)[];
  capacity: number;
  peekValue?: number | string | null;
  isPeekActive?: boolean;
  highlightFront?: boolean;
  highlightRear?: boolean;
  overflowWarning?: boolean;
  underflowWarning?: boolean;
  onDropItem?: (value: number | string) => void;
  onDequeueFront?: () => void;
  onInvalidDequeueAttempt?: (value: number | string) => void;
  onElementClick?: (value: number | string, index: number) => void;
  allowDragDequeue?: boolean;
  customEmptyMessage?: string;
  bunkerLabel?: string;
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({
  items,
  capacity,
  peekValue = null,
  isPeekActive = false,
  highlightFront = false,
  highlightRear = false,
  overflowWarning = false,
  underflowWarning = false,
  onDropItem,
  onDequeueFront,
  onInvalidDequeueAttempt,
  onElementClick,
  allowDragDequeue = true,
  customEmptyMessage,
  bunkerLabel = 'BUNKER QUEUE',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inspectedIndex, setInspectedIndex] = React.useState<number | null>(null);
  const [isDraggingFront, setIsDraggingFront] = React.useState<boolean>(false);
  const [isOverExitChute, setIsOverExitChute] = React.useState<boolean>(false);

  const normalizedItems = items.map((item, idx) => {
    if (typeof item === 'object' && item !== null && 'value' in item) {
      return {
        id: (item as any).id || `q-item-${idx}-${(item as any).value}`,
        value: (item as any).value,
        color: (item as any).color,
      };
    }
    return {
      id: `q-item-${idx}-${item}`,
      value: item,
    };
  });

  const frontItem = normalizedItems.length > 0 ? normalizedItems[0] : null;

  // Outer container drop handler: if an element is dragged OUT of the queue box and dropped outside
  const handleOuterContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleOuterContainerDrop = (e: React.DragEvent) => {
    // If dropped inside the queue chamber itself (#queue-drop-target), let the chamber handler take it
    const isTargetChamber = (e.target as HTMLElement)?.closest('#queue-drop-target');
    if (isTargetChamber) return;

    e.preventDefault();
    setIsDraggingFront(false);
    setIsOverExitChute(false);

    const raw = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'DEQUEUE') {
        // Dragged FRONT element out of the box and dropped outside -> DEQUEUE!
        onDequeueFront?.();
        return;
      }
      if (parsed.type === 'DEQUEUE_INVALID') {
        onInvalidDequeueAttempt?.(parsed.value);
        return;
      }
    } catch {
      // Fallback
      if (raw === String(frontItem?.value)) {
        onDequeueFront?.();
      }
    }
  };

  const handleChamberDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleChamberDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (data && onDropItem) {
      try {
        const parsed = JSON.parse(data);
        // If someone dropped a DEQUEUE item back into the chamber, do nothing
        if (parsed.type === 'DEQUEUE' || parsed.type === 'DEQUEUE_INVALID') {
          return;
        }
        onDropItem(parsed.value !== undefined ? parsed.value : parsed);
      } catch {
        onDropItem(data);
      }
    }
  };

  const isFull = normalizedItems.length >= capacity;
  const isEmpty = normalizedItems.length === 0;

  return (
    <div
      onDragOver={handleOuterContainerDragOver}
      onDrop={handleOuterContainerDrop}
      className={`flex flex-col items-center w-full max-w-2xl mx-auto space-y-3 relative p-2 rounded-3xl transition-all duration-200 ${
        isDraggingFront
          ? 'ring-2 ring-rose-400/50 bg-rose-50/10 dark:bg-rose-950/10'
          : ''
      }`}
    >
      {/* Active Drag-Out Floating Guidance Pill */}
      <AnimatePresence>
        {isDraggingFront && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 animate-pulse"
          >
            <LogOut className="w-4 h-4" />
            <span>Drop anywhere outside the queue box or onto the Exit Chute to DEQUEUE {frontItem ? `[${frontItem.value}]` : ''}!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Status & Capacity */}
      <div className="w-full flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {bunkerLabel}
          </span>
          {overflowWarning || isFull ? (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-full border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              {overflowWarning ? '🚨 OVERFLOW' : `Full (${capacity}/${capacity})`}
            </span>
          ) : underflowWarning || isEmpty ? (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              {underflowWarning ? '🚨 UNDERFLOW' : `Empty (0/${capacity})`}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
              Active ({normalizedItems.length} in queue)
            </span>
          )}
        </div>

        {/* Capacity Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
            Queue Size: {normalizedItems.length} / {capacity}
          </span>
          <div className="w-20 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full transition-all duration-300 ${
                isFull ? 'bg-rose-500' : 'bg-blue-600 dark:bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (normalizedItems.length / capacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pointer Indicators (FRONT & REAR) */}
      <div className="w-full flex items-center justify-between px-2 text-xs font-bold">
        {/* FRONT Pointer */}
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
          <LogOut className="w-4 h-4" />
          <span className="uppercase tracking-wider text-[11px]">
            FRONT {normalizedItems.length > 0 ? `[${normalizedItems[0].value}]` : '(Empty)'}
          </span>
          <span className="text-sm font-mono">→</span>
        </div>

        {/* REAR Pointer */}
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <span className="text-sm font-mono">←</span>
          <span className="uppercase tracking-wider text-[11px]">
            REAR {normalizedItems.length > 0 ? `[${normalizedItems[normalizedItems.length - 1].value}]` : '(Empty)'}
          </span>
          <LogIn className="w-4 h-4" />
        </div>
      </div>

      {/* Queue Arena Layout: Left Exit Chute + Main Queue Chamber */}
      <div className="w-full flex flex-col sm:flex-row items-stretch gap-2.5">
        {/* Dedicated Dequeue Exit Chute / Drop Bay */}
        <div
          id="dequeue-exit-chute"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setIsOverExitChute(true);
          }}
          onDragLeave={() => setIsOverExitChute(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsOverExitChute(false);
            setIsDraggingFront(false);
            const raw = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (parsed.type === 'DEQUEUE_INVALID') {
                  onInvalidDequeueAttempt?.(parsed.value);
                  return;
                }
              } catch {}
            }
            onDequeueFront?.();
          }}
          onClick={() => onDequeueFront?.()}
          title="Drag the FRONT element here or click to DEQUEUE"
          className={`shrink-0 w-full sm:w-28 rounded-2xl border-2 border-dashed p-3 flex sm:flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer select-none ${
            isOverExitChute
              ? 'border-rose-500 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 ring-4 ring-rose-300 dark:ring-rose-800 scale-102 shadow-md'
              : isDraggingFront
              ? 'border-rose-400 dark:border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 animate-pulse'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:border-rose-400 hover:text-rose-600 dark:hover:border-rose-600'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left sm:text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Exit Chute
            </span>
            <span className="text-[9px] font-medium leading-tight">
              {frontItem ? `Drop [${frontItem.value}] here to delete` : 'Empty (Underflow)'}
            </span>
          </div>
        </div>

        {/* Main Horizontal Queue Chamber */}
        <div
          id="queue-drop-target"
          onDragOver={handleChamberDragOver}
          onDrop={handleChamberDrop}
          className={`flex-1 min-h-[170px] rounded-2xl border-2 transition-all p-3.5 flex flex-col justify-center relative overflow-hidden ${
            overflowWarning
              ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 dark:bg-rose-950/20 ring-4 ring-rose-200 dark:ring-rose-900/50'
              : underflowWarning
              ? 'border-amber-400 dark:border-amber-600 bg-amber-50/20 dark:bg-amber-950/20 ring-4 ring-amber-200 dark:ring-amber-900/50'
              : isFull
              ? 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
          }`}
        >
          {/* Visual Pipeline Flow Header */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
            <span className="text-rose-600 dark:text-rose-400 font-bold">← FRONT Exit Bay</span>
            <span className="font-semibold text-slate-500">Pipeline: Front[0] → Rear[{Math.max(0, normalizedItems.length - 1)}]</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">REAR Entry (Enqueue) →</span>
          </div>

        {isEmpty ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-1.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50">
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              QUEUE IS EMPTY
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {customEmptyMessage || 'Use ENQUEUE to add survivors at the REAR.'}
            </p>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="flex items-center justify-center gap-3 overflow-x-auto py-3 px-2 custom-scrollbar"
          >
            <AnimatePresence mode="popLayout">
              {normalizedItems.map((item, index) => {
                const isFront = index === 0;
                const isRear = index === normalizedItems.length - 1;
                const isPeeked =
                  (isPeekActive || peekValue !== null) &&
                  isFront &&
                  (peekValue === null || String(item.value) === String(peekValue));
                const isInspected = inspectedIndex === index;

                return (
                  <motion.div
                    key={item.id || `q-item-${index}-${item.value}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={
                      isPeeked
                        ? {
                            opacity: 1,
                            scale: [1, 1.05, 1],
                            x: 0,
                            transition: {
                              scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
                              type: 'spring',
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : {
                            opacity: 1,
                            scale: isInspected ? 1.05 : 1,
                            x: 0,
                          }
                    }
                    exit={{ opacity: 0, scale: 0.5, x: -60, transition: { duration: 0.25 } }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    className="flex items-center gap-3 shrink-0"
                  >
                    <div
                      draggable={allowDragDequeue}
                      onClick={() => {
                        setInspectedIndex((prev) => (prev === index ? null : index));
                        onElementClick?.(item.value, index);
                      }}
                      onDragStart={(e) => {
                        if (isFront) {
                          setIsDraggingFront(true);
                          e.dataTransfer.setData(
                            'text/plain',
                            JSON.stringify({ type: 'DEQUEUE', value: item.value })
                          );
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ type: 'DEQUEUE', value: item.value })
                          );
                          e.dataTransfer.effectAllowed = 'move';
                        } else {
                          e.dataTransfer.setData(
                            'text/plain',
                            JSON.stringify({ type: 'DEQUEUE_INVALID', value: item.value, index })
                          );
                          e.dataTransfer.setData(
                            'application/json',
                            JSON.stringify({ type: 'DEQUEUE_INVALID', value: item.value, index })
                          );
                          e.dataTransfer.effectAllowed = 'move';
                        }
                      }}
                      onDragEnd={() => {
                        setIsDraggingFront(false);
                      }}
                      className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-between p-2 font-mono shadow-xs shrink-0 transition-all select-none cursor-pointer ${
                        isPeeked
                          ? 'border-blue-600 dark:border-blue-400 bg-blue-50/95 dark:bg-blue-950/90 text-blue-950 dark:text-blue-100 ring-4 ring-blue-400/50 dark:ring-blue-500/50 shadow-lg shadow-blue-500/25 z-10'
                          : isInspected
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 ring-3 ring-amber-300 dark:ring-amber-700 z-10'
                          : isFront || highlightFront
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 ring-2 ring-rose-200 dark:ring-rose-900 cursor-grab active:cursor-grabbing hover:scale-105 shadow-xs'
                          : isRear || highlightRear
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-200 dark:ring-emerald-900'
                          : 'border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-blue-400'
                      }`}
                    >
                      {/* Top Label Tag */}
                      <div className="w-full flex items-center justify-between text-[10px] font-bold">
                        <span className="opacity-60">[{index}]</span>
                        {isFront && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-extrabold">
                            FRONT
                          </span>
                        )}
                        {isRear && !isFront && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-extrabold">
                            REAR
                          </span>
                        )}
                      </div>

                      {/* Main Survivor Value */}
                      <div className="text-xl sm:text-2xl font-black tracking-tight text-center my-auto">
                        {item.value}
                      </div>

                      {/* Bottom Status / Peek Indicator */}
                      <div className="text-[9px] font-bold tracking-tight text-center w-full">
                        {isPeeked ? (
                          <span className="flex items-center justify-center gap-0.5 text-amber-700 dark:text-amber-300 font-black">
                            <Eye className="w-2.5 h-2.5" /> PEEK
                          </span>
                        ) : isFront ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-0.5">
                            <LogOut className="w-2.5 h-2.5" /> Drag Out
                          </span>
                        ) : isRear ? (
                          <span className="text-emerald-600 dark:text-emerald-400">Last In</span>
                        ) : (
                          <span className="text-slate-400 font-normal">Waiting</span>
                        )}
                      </div>
                    </div>

                    {/* Flow arrow between queue nodes */}
                    {index < normalizedItems.length - 1 && (
                      <div className="text-slate-300 dark:text-slate-700 font-mono text-sm shrink-0 select-none">
                        →
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Memory Slot Grid (Underneath) */}
        <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-400 mr-1 uppercase">Array Slots:</span>
          {Array.from({ length: capacity }).map((_, slotIdx) => {
            const isFilled = slotIdx < normalizedItems.length;
            const slotVal = isFilled ? normalizedItems[slotIdx].value : null;
            return (
              <div
                key={`slot-${slotIdx}`}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                  slotIdx === 0 && isFilled
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    : slotIdx === normalizedItems.length - 1 && isFilled
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : isFilled
                    ? 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-400 bg-transparent'
                }`}
              >
                [{slotIdx}]: {isFilled ? slotVal : 'empty'}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* Footer Helper Note */}
      <div className="w-full flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          FRONT: First In exits first
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          REAR: New arrivals enter last
        </span>
      </div>
    </div>
  );
};
