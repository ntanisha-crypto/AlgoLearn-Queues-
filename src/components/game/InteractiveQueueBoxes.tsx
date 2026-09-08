import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  LogOut,
  LogIn,
  Eye,
  Plus,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { StackItem } from '../../types';
import { soundEffects } from '../../services/sound';

interface InteractiveQueueBoxesProps {
  items: StackItem[];
  capacity: number;
  peekValue?: number | string | null;
  peekIndex?: number | null;
  isPeekActive?: boolean;
  onEnqueue?: (value: number | string) => void;
  onDequeue?: () => void;
  onPeekFront?: () => void;
  onClearQueue?: () => void;
  onDropItem?: (value: number | string) => void;
  statusLabel?: string;
  allowDirectActions?: boolean;
}

export const InteractiveQueueBoxes: React.FC<InteractiveQueueBoxesProps> = ({
  items,
  capacity,
  peekValue = null,
  peekIndex = null,
  isPeekActive = false,
  onEnqueue,
  onDequeue,
  onPeekFront,
  onClearQueue,
  onDropItem,
  statusLabel = 'QUEUE STATUS',
  allowDirectActions = true,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [quickValueInput, setQuickValueInput] = useState<string>('');
  const [isAddingInline, setIsAddingInline] = useState<boolean>(false);

  const frontIndex = items.length > 0 ? 0 : -1;
  const rearIndex = items.length > 0 ? items.length - 1 : -1;
  const frontItem = items.length > 0 ? items[0] : null;
  const rearItem = items.length > 0 ? items[items.length - 1] : null;

  const isFull = items.length >= capacity;
  const isEmpty = items.length === 0;

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle Drop on Queue
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (data && onDropItem) {
      try {
        const parsed = JSON.parse(data);
        onDropItem(parsed.value !== undefined ? parsed.value : parsed);
      } catch {
        onDropItem(data);
      }
    }
  };

  const handleInlineEnqueue = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickValueInput.trim()) {
      // Default auto-increment or random value
      const defaultVal = (items.length + 1) * 10;
      onEnqueue?.(defaultVal);
    } else {
      const parsedVal = isNaN(Number(quickValueInput)) ? quickValueInput.trim() : Number(quickValueInput);
      onEnqueue?.(parsedVal);
    }
    setQuickValueInput('');
    setIsAddingInline(false);
  };

  return (
    <div className="space-y-4">
      {/* ─── CARD HEADER: QUEUE / STACK STATUS (Matches exact layout) ─── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {statusLabel}
          </span>
          <span
            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border flex items-center gap-1 transition-colors ${
              isEmpty
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : isFull
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            {isEmpty
              ? 'Empty (0 items)'
              : isFull
              ? `Full (${items.length}/${capacity})`
              : `Active (${items.length} items)`}
          </span>
        </div>

        {/* Capacity Fraction & Mini Progress Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            {items.length} / {capacity}
          </span>
          <div className="w-16 sm:w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : items.length / capacity > 0.75
                  ? 'bg-amber-500'
                  : 'bg-blue-600 dark:bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (items.length / capacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── DYNAMIC POINTER HEADER SUMMARY ─── */}
      <div className="flex items-center justify-between text-xs px-1">
        {/* Dynamic FRONT indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wide text-rose-600 dark:text-rose-400 font-mono text-[11px]">
            FRONT Pointer:
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
            {frontIndex !== -1 ? `Index [0] → Value: ${frontItem?.value}` : 'NULL (-1)'}
          </span>
        </div>

        {/* Dynamic REAR indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
            REAR Pointer:
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            {rearIndex !== -1 ? `Index [${rearIndex}] → Value: ${rearItem?.value}` : 'NULL (-1)'}
          </span>
        </div>
      </div>

      {/* ─── MAIN INTERACTIVE QUEUE BOXES CONTAINER ─── */}
      <div
        id="queue-boxes-workspace"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 transition-all overflow-hidden"
      >
        {/* Direction Flow Banners: Left (Dequeue Exit) & Right (Enqueue Entry) */}
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 pb-2 px-1 border-b border-slate-200/60 dark:border-slate-800/80 mb-4">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>DEQUEUE (Exit)</span>
          </div>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">
            Sequential FIFO Queue Track
          </span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <span>ENQUEUE (Entry)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Box Track: Row of Slots [0 .. Capacity - 1] */}
        <div className="overflow-x-auto pb-4 pt-8 custom-scrollbar">
          <div className="flex items-end gap-2.5 min-w-max px-2">
            {Array.from({ length: capacity }).map((_, idx) => {
              const isOccupied = idx < items.length;
              const item = items[idx];
              const isFront = idx === 0 && items.length > 0;
              const isRear = idx === items.length - 1 && items.length > 0;
              const isSingleItem = items.length === 1 && idx === 0;
              const isNextSlot = idx === items.length;
              const isPeeked = Boolean(
                (isPeekActive || peekValue !== null || (peekIndex !== undefined && peekIndex !== null)) &&
                isOccupied &&
                (
                  (peekIndex !== undefined && peekIndex !== null && peekIndex === idx) ||
                  (peekIndex === null && isFront && (peekValue === null || String(item?.value) === String(peekValue))) ||
                  (peekIndex === null && isRear && String(item?.value) === String(peekValue)) ||
                  (peekValue !== null && String(item?.value) === String(peekValue) && (isFront || isRear))
                )
              );

              return (
                <div
                  key={`slot-${idx}`}
                  className="relative flex flex-col items-center"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* ───────────────────────────────────────────────────────────── */}
                  {/* DYNAMIC POINTERS POSITIONED RIGHT OVER THE BOXES               */}
                  {/* ───────────────────────────────────────────────────────────── */}
                  <div className="h-9 flex items-center justify-center mb-1">
                    <AnimatePresence mode="wait">
                      {isPeeked ? (
                        <motion.div
                          key={`peek-ptr-${idx}`}
                          layout
                          initial={{ opacity: 0, y: -6, scale: 0.85 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.85 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="flex flex-col items-center select-none z-20"
                        >
                          <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white font-mono font-black text-[9px] tracking-tight shadow-md whitespace-nowrap flex items-center gap-1 ring-2 ring-blue-300 dark:ring-blue-800">
                            <Eye className="w-3 h-3 text-blue-200 animate-pulse" />
                            <span>PEEKING {isFront ? 'FRONT' : isRear ? 'REAR' : 'ITEM'}</span>
                          </div>
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 -mt-0.5 animate-bounce" />
                        </motion.div>
                      ) : isSingleItem ? (
                        <motion.div
                          key={`single-ptr-${idx}`}
                          layout
                          initial={{ opacity: 0, y: -8, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="flex flex-col items-center select-none"
                        >
                          <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-600 via-purple-600 to-emerald-600 text-white font-mono font-black text-[9px] tracking-tight shadow-sm whitespace-nowrap flex items-center gap-1 ring-2 ring-purple-300 dark:ring-purple-900">
                            <span>FRONT &amp; REAR</span>
                          </div>
                          <ArrowDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 -mt-0.5 animate-bounce" />
                        </motion.div>
                      ) : isFront ? (
                        <motion.div
                          key={`front-ptr-${idx}`}
                          layout
                          initial={{ opacity: 0, y: -8, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="flex flex-col items-center select-none"
                        >
                          <div className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono font-black text-[10px] tracking-tight shadow-sm whitespace-nowrap flex items-center gap-1 ring-2 ring-rose-300 dark:ring-rose-900">
                            <LogOut className="w-2.5 h-2.5" />
                            <span>FRONT</span>
                          </div>
                          <ArrowDown className="w-3.5 h-3.5 text-rose-500 -mt-0.5 animate-bounce" />
                        </motion.div>
                      ) : isRear ? (
                        <motion.div
                          key={`rear-ptr-${idx}`}
                          layout
                          initial={{ opacity: 0, y: -8, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.8 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          className="flex flex-col items-center select-none"
                        >
                          <div className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono font-black text-[10px] tracking-tight shadow-sm whitespace-nowrap flex items-center gap-1 ring-2 ring-emerald-300 dark:ring-emerald-900">
                            <LogIn className="w-2.5 h-2.5" />
                            <span>REAR</span>
                          </div>
                          <ArrowDown className="w-3.5 h-3.5 text-emerald-500 -mt-0.5 animate-bounce" />
                        </motion.div>
                      ) : isEmpty && idx === 0 ? (
                        <div className="flex flex-col items-center opacity-60">
                          <span className="text-[8px] font-mono font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">
                            FRONT: NULL
                          </span>
                        </div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {/* ───────────────────────────────────────────────────────────── */}
                  {/* THE BOX ELEMENT                                                */}
                  {/* ───────────────────────────────────────────────────────────── */}
                  <motion.div
                    layout
                    initial={false}
                    animate={{
                      scale: isPeeked ? 1.05 : 1,
                      opacity: 1,
                      y: isPeeked ? -3 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                    draggable={isFront}
                    onDragStart={(e) => {
                      if (!isFront) {
                        e.preventDefault();
                        return;
                      }
                      e.dataTransfer.setData(
                        'text/plain',
                        JSON.stringify({ type: 'DEQUEUE', value: item?.value })
                      );
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    className={`relative w-20 h-24 sm:w-22 sm:h-26 rounded-2xl border-2 flex flex-col justify-between p-2 font-mono transition-all select-none ${
                      isPeeked
                        ? 'border-blue-600 dark:border-blue-400 bg-blue-50/95 dark:bg-blue-950/90 text-blue-950 dark:text-blue-100 ring-4 ring-blue-400/50 dark:ring-blue-500/50 shadow-lg shadow-blue-500/25 z-10'
                        : isFront
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 ring-2 ring-rose-300/60 dark:ring-rose-900 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md'
                        : isRear
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-300/60 dark:ring-emerald-900 shadow-sm'
                        : isOccupied
                        ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs'
                        : isNextSlot
                        ? 'border-2 border-dashed border-blue-400 dark:border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:border-blue-500 cursor-pointer'
                        : 'border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/20 text-slate-400 dark:text-slate-600'
                    }`}
                    onClick={() => {
                      if (isFront && allowDirectActions) {
                        soundEffects.playClick();
                        onPeekFront?.();
                      } else if (isNextSlot && allowDirectActions) {
                        setIsAddingInline(true);
                      }
                    }}
                  >
                    {/* Box Header: Slot Index & Mini Role Tag */}
                    <div className="w-full flex items-center justify-between text-[10px] font-bold">
                      <span
                        className={`px-1 py-0.2 rounded font-mono ${
                          isOccupied
                            ? isPeeked
                              ? 'text-blue-700 dark:text-blue-300 font-black'
                              : 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      >
                        [{idx}]
                      </span>

                      {isPeeked ? (
                        <span className="text-[8px] uppercase px-1.5 py-0.2 rounded bg-blue-600 text-white font-extrabold flex items-center gap-0.5 shadow-xs">
                          <Eye className="w-2.5 h-2.5" /> PEEK
                        </span>
                      ) : isFront ? (
                        <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 font-extrabold">
                          FRONT
                        </span>
                      ) : isRear && !isFront ? (
                        <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-extrabold">
                          REAR
                        </span>
                      ) : !isOccupied && isNextSlot ? (
                        <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                          NEXT
                        </span>
                      ) : null}
                    </div>

                    {/* Box Center: Numeric Value or Empty Slot Prompt */}
                    <div className="text-center my-auto">
                      {isOccupied ? (
                        <span className={`text-xl sm:text-2xl font-black tracking-tight font-mono block ${isPeeked ? 'text-blue-700 dark:text-blue-300 scale-105 transition-transform' : ''}`}>
                          {item.value}
                        </span>
                      ) : isNextSlot ? (
                        <div className="flex flex-col items-center justify-center py-1">
                          <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold mt-1 text-blue-600 dark:text-blue-400">
                            Enqueue
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-slate-300 dark:text-slate-700 block">
                          —
                        </span>
                      )}
                    </div>

                    {/* Box Footer: Status label */}
                    <div className="text-[9px] font-bold tracking-tight text-center w-full">
                      {isPeeked ? (
                        <span className="flex items-center justify-center gap-1 text-blue-700 dark:text-blue-300 font-black text-[10px]">
                          <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" /> PEEKED
                        </span>
                      ) : isFront ? (
                        <span className="text-rose-600 dark:text-rose-400">Exit Next</span>
                      ) : isRear ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Last In</span>
                      ) : isOccupied ? (
                        <span className="text-slate-400 font-normal">Waiting</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 font-normal">Free</span>
                      )}
                    </div>
                  </motion.div>

                  {/* Flow arrow between consecutive boxes */}
                  {idx < capacity - 1 && (
                    <div className="absolute -right-2 top-[calc(50%+16px)] -translate-y-1/2 text-slate-300 dark:text-slate-700 font-mono text-xs select-none pointer-events-none">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── INLINE QUICK ENQUEUE DRAWER (WHEN CLICKING NEXT AVAILABLE BOX) ─── */}
        <AnimatePresence>
          {isAddingInline && !isFull && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2 flex-wrap"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  Enqueue into Slot [{items.length}] (REAR):
                </span>
                <input
                  type="text"
                  placeholder="e.g. 70"
                  value={quickValueInput}
                  onChange={(e) => setQuickValueInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInlineEnqueue();
                  }}
                  autoFocus
                  className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleInlineEnqueue()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  + Enqueue
                </button>
                <button
                  onClick={() => setIsAddingInline(false)}
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── DIRECT QUICK ACTION TOOLBAR ON QUEUE ─── */}
      {allowDirectActions && (
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          {/* Left: Direct Dequeue & Peek Front */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onDequeue?.();
              }}
              disabled={isEmpty}
              title="Remove element from FRONT (Index 0)"
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Dequeue FRONT {frontItem ? `[${frontItem.value}]` : ''}</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onPeekFront?.();
              }}
              disabled={isEmpty}
              title="Inspect FRONT element without removing"
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Peek FRONT</span>
            </button>
          </div>

          {/* Right: Quick Enqueue Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextVal = items.length > 0 ? (Number(rearItem?.value) || 0) + 10 : 10;
                onEnqueue?.(nextVal);
              }}
              disabled={isFull}
              title="Quick enqueue next value at REAR"
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>+ Enqueue at REAR</span>
            </button>

            {onClearQueue && (
              <button
                onClick={onClearQueue}
                disabled={isEmpty}
                title="Clear all elements from queue"
                className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── FIFO QUEUE TELEMETRY FOOTER ─── */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-300 font-bold">FRONT:</span>
          <span className="text-rose-600 dark:text-rose-400 font-black">
            {frontIndex !== -1 ? `queue[0] (${frontItem?.value})` : 'NULL'}
          </span>
          <span className="text-slate-400">|</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-300 font-bold">REAR:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">
            {rearIndex !== -1 ? `queue[${rearIndex}] (${rearItem?.value})` : 'NULL'}
          </span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>FIFO Principle: First item enqueued is the first item dequeued.</span>
        </div>
      </div>
    </div>
  );
};
