import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, AlertCircle, Eye, LogIn, LogOut, Trash2, Sparkles } from 'lucide-react';
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
  onDequeueFront?: (value?: number | string) => void;
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
  const [isDraggingOverChamber, setIsDraggingOverChamber] = React.useState<boolean>(false);

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
    e.stopPropagation();
    setIsDraggingFront(false);
    setIsOverExitChute(false);

    const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed.type === 'DEQUEUE') {
        // Dragged FRONT element out of the box and dropped outside -> DEQUEUE!
        onDequeueFront?.(parsed.value);
        return;
      }
      if (parsed.type === 'DEQUEUE_INVALID') {
        onInvalidDequeueAttempt?.(parsed.value);
        return;
      }
      if (parsed.type === 'ENQUEUE' || parsed.type === 'PUSH') {
        onDropItem?.(parsed.value !== undefined ? parsed.value : parsed);
        return;
      }
    } catch {
      // Fallback
      if (raw === String(frontItem?.value)) {
        onDequeueFront?.(raw);
      } else if (onDropItem) {
        onDropItem(raw);
      }
    }
  };

  const handleChamberDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOverChamber) {
      setIsDraggingOverChamber(true);
    }
  };

  const handleChamberDragLeave = (e: React.DragEvent) => {
    // Only reset if actually leaving the chamber
    const currentTarget = e.currentTarget as HTMLElement;
    if (!currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOverChamber(false);
    }
  };

  const handleChamberDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverChamber(false);
    const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'DEQUEUE') {
          onDequeueFront?.(parsed.value);
          return;
        }
        if (parsed.type === 'DEQUEUE_INVALID') {
          onInvalidDequeueAttempt?.(parsed.value);
          return;
        }
        if (onDropItem) {
          onDropItem(parsed.value !== undefined ? parsed.value : parsed);
        }
      } catch {
        if (onDropItem) {
          onDropItem(data);
        }
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
          ? 'ring-2 ring-indigo-400/50 bg-indigo-50/10 dark:bg-indigo-950/10'
          : ''
      }`}
    >
      {/* Active Drag-Out Floating Guidance Pill (Fixed overlay so layout never shifts) */}
      <AnimatePresence>
        {isDraggingFront && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute -top-7 left-2 right-2 z-30 flex items-center justify-center gap-2 py-1.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 pointer-events-none"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>Drop onto the Exit Chute / Trash Bay (or release outside) to DEQUEUE {frontItem ? `[${frontItem.value}]` : ''}!</span>
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
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full border border-slate-300 dark:border-slate-700 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              {overflowWarning ? 'BUFFER FULL' : `Full (${capacity}/${capacity})`}
            </span>
          ) : underflowWarning || isEmpty ? (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1 font-mono">
              <AlertCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              {underflowWarning ? 'EMPTY' : `Empty (0/${capacity})`}
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 font-mono">
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
              className="h-full transition-all duration-300 bg-blue-600 dark:bg-blue-500"
              style={{ width: `${Math.min(100, (normalizedItems.length / capacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pointer Indicators (FRONT & REAR) */}
      <div className="w-full flex items-center justify-between px-2 text-xs font-bold">
        {/* FRONT Pointer */}
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
          <Trash2 className="w-4 h-4" />
          <span className="uppercase tracking-wider text-[11px]">
            FRONT {normalizedItems.length > 0 ? `[${normalizedItems[0].value}]` : '(Empty)'}
          </span>
          <span className="text-sm font-mono">→</span>
        </div>

        {/* REAR Pointer */}
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
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
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            if (!isOverExitChute) setIsOverExitChute(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isOverExitChute) setIsOverExitChute(true);
          }}
          onDragLeave={(e) => {
            const currentTarget = e.currentTarget as HTMLElement;
            if (!currentTarget.contains(e.relatedTarget as Node)) {
              setIsOverExitChute(false);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOverExitChute(false);
            setIsDraggingFront(false);
            const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
            if (raw) {
              try {
                const parsed = JSON.parse(raw);
                if (parsed.type === 'DEQUEUE_INVALID') {
                  onInvalidDequeueAttempt?.(parsed.value);
                  return;
                }
                onDequeueFront?.(parsed.value);
                return;
              } catch {}
            }
            onDequeueFront?.(raw);
          }}
          onClick={() => onDequeueFront?.()}
          title="Drag the FRONT element here or click to DEQUEUE"
          className={`shrink-0 w-full sm:w-32 rounded-2xl border-2 border-dashed p-3 flex sm:flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer select-none ${
            isOverExitChute
              ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/80 text-indigo-900 dark:text-indigo-100 ring-4 ring-indigo-300 dark:ring-indigo-700 scale-105 shadow-xl'
              : isDraggingFront
              ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-200 ring-4 ring-indigo-200 dark:ring-indigo-800'
              : highlightFront
              ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-200 dark:ring-indigo-900'
              : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-500'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 pointer-events-none shadow-2xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left sm:text-center pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              {isOverExitChute ? 'RELEASE TO DEQUEUE' : 'EXIT / DISPATCH'}
            </span>
            <span className="text-[9px] font-bold leading-tight text-slate-600 dark:text-slate-300">
              {frontItem ? `Drop [${frontItem.value}] to depart` : 'Empty Queue'}
            </span>
          </div>
        </div>

        {/* Main Horizontal Queue Chamber */}
        <div
          id="queue-drop-target"
          onDragOver={handleChamberDragOver}
          onDragLeave={handleChamberDragLeave}
          onDrop={handleChamberDrop}
          className={`flex-1 min-h-[170px] rounded-2xl border-2 transition-all p-3.5 flex flex-col justify-center relative overflow-hidden ${
            isDraggingOverChamber
              ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 ring-4 ring-blue-300 dark:ring-blue-800 scale-[1.008] shadow-lg'
              : overflowWarning
              ? 'border-slate-400 dark:border-slate-600 bg-slate-100/40 dark:bg-slate-800/40 ring-4 ring-slate-200 dark:ring-slate-700'
              : underflowWarning
              ? 'border-blue-400 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/20 ring-4 ring-blue-200 dark:ring-blue-900/50'
              : isFull
              ? 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30'
          }`}
        >
          {/* Visual Pipeline Flow Header */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 px-1">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">← FRONT Exit Bay</span>
            <span className="font-semibold text-slate-500">Pipeline: Front[0] → Rear[{Math.max(0, normalizedItems.length - 1)}]</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">REAR Entry (Enqueue) →</span>
          </div>

        {isEmpty ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              if (!isDraggingOverChamber) setIsDraggingOverChamber(true);
            }}
            onDrop={handleChamberDrop}
            className={`py-8 text-center flex flex-col items-center justify-center space-y-1.5 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              isDraggingOverChamber
                ? 'border-blue-500 bg-blue-100/80 dark:bg-blue-950/70 ring-4 ring-blue-300 dark:ring-blue-700'
                : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:border-blue-400'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              QUEUE IS EMPTY
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {customEmptyMessage || 'Drag and drop or select an element to ENQUEUE at REAR.'}
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
                          ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-950 dark:text-indigo-100 ring-4 ring-indigo-400/50 dark:ring-indigo-500/50 shadow-lg shadow-indigo-500/25 z-10'
                          : isInspected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/80 text-blue-950 dark:text-blue-100 ring-3 ring-blue-300 dark:ring-blue-700 z-10'
                          : isFront || highlightFront
                          ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-200 dark:ring-indigo-900 cursor-grab active:cursor-grabbing hover:scale-105 shadow-xs'
                          : isRear || highlightRear
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-950 dark:text-blue-100 ring-2 ring-blue-200 dark:ring-blue-900'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-blue-400'
                      }`}
                    >
                      {/* Top Label Tag */}
                      <div className="w-full flex items-center justify-between text-[10px] font-bold">
                        <span className="opacity-60">[{index}]</span>
                        {isFront && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-extrabold">
                            FRONT
                          </span>
                        )}
                        {isRear && !isFront && (
                          <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-extrabold">
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
                          <span className="flex items-center justify-center gap-0.5 text-indigo-700 dark:text-indigo-300 font-black">
                            <Eye className="w-2.5 h-2.5" /> PEEK
                          </span>
                        ) : isFront ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-0.5">
                            <LogOut className="w-2.5 h-2.5" /> Drag Out
                          </span>
                        ) : isRear ? (
                          <span className="text-blue-600 dark:text-blue-400">Last In</span>
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
              {/* If queue is not full, show next REAR insertion target slot */}
              {!isFull && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';
                    if (!isDraggingOverChamber) setIsDraggingOverChamber(true);
                  }}
                  onDrop={handleChamberDrop}
                  className="flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  {normalizedItems.length > 0 && (
                    <div className="text-blue-400 font-mono text-sm shrink-0 select-none">
                      →
                    </div>
                  )}
                  <div
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-between p-2 font-mono text-center transition-all select-none ${
                      isDraggingOverChamber
                        ? 'border-blue-500 bg-blue-100/90 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 ring-4 ring-blue-300 dark:ring-blue-700 scale-105 shadow-md'
                        : 'border-blue-300/80 dark:border-blue-700/60 bg-blue-50/30 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50/60'
                    }`}
                  >
                    <div className="w-full flex items-center justify-center text-[9px] font-black uppercase text-blue-600 dark:text-blue-400">
                      REAR
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center my-auto">
                      <LogIn className="w-4 h-4" />
                    </div>
                    <div className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Drop Target
                    </div>
                  </div>
                </div>
              )}
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
                    ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                    : slotIdx === normalizedItems.length - 1 && isFilled
                    ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
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
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          FRONT: First In exits first
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
          REAR: New arrivals enter last
        </span>
      </div>
    </div>
  );
};
