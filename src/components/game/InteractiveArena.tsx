import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Move,
  GripVertical,
  ArrowDownToLine,
  FolderPlus,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface InteractiveArenaProps {
  items: (string | number)[];
  capacity?: number;
  availableElements: (string | number)[];
  simulatorBadgeLabel?: string;
  subtitle?: string;
  onEnqueue: (value: string | number) => void;
  onDequeue: (value?: string | number) => void;
  onSelectElement: (value: string | number) => void;
  onInvalidAction?: (reason: string) => void;
  highlightFront?: boolean;
  highlightRear?: boolean;
  selectedElementValue?: string | number | null;
}

// Module-level fallback to guarantee data transfer across all browser iframes
let activeDragPayload: {
  source: 'palette' | 'queue';
  value: string | number;
  index?: number;
} | null = null;

export const InteractiveArena: React.FC<InteractiveArenaProps> = ({
  items,
  capacity = 5,
  availableElements,
  simulatorBadgeLabel = 'Execution Trace Simulator',
  subtitle = 'Drag elements to FRONT or REAR to build the queue.',
  onEnqueue,
  onDequeue,
  onSelectElement,
  onInvalidAction,
  selectedElementValue = null,
}) => {
  const [isFrontDropHovered, setIsFrontDropHovered] = useState<boolean>(false);
  const [isRearDropHovered, setIsRearDropHovered] = useState<boolean>(false);
  const [isRearSlotHovered, setIsRearSlotHovered] = useState<boolean>(false);
  const [dragSource, setDragSource] = useState<'palette' | 'queue' | null>(null);

  const isEmpty = items.length === 0;
  const isFull = items.length >= capacity;
  const frontItem = items.length > 0 ? items[0] : null;
  const rearItem = items.length > 0 ? items[items.length - 1] : null;

  // ─────────────────────────────────────────────────────────────────────────
  // DRAG START: From Palette (New arrival for REAR insertion)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDragStartPalette = (e: React.DragEvent, val: string | number) => {
    activeDragPayload = { source: 'palette', value: val };
    setDragSource('palette');
    e.dataTransfer.setData('text/plain', String(val));
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ source: 'palette', value: val })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DRAG START: From Queue (Only FRONT element allowed for DEQUEUE)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDragStartQueue = (e: React.DragEvent, val: string | number, idx: number) => {
    if (idx !== 0) {
      e.preventDefault();
      soundEffects.playError();
      onInvalidAction?.(
        `FIFO Restriction: Cannot dequeue [${val}]. Only the FRONT element at position 0 may depart!`
      );
      return;
    }

    activeDragPayload = { source: 'queue', value: val, index: idx };
    setDragSource('queue');
    e.dataTransfer.setData('text/plain', String(val));
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ source: 'queue', value: val, index: idx })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    activeDragPayload = null;
    setDragSource(null);
    setIsFrontDropHovered(false);
    setIsRearDropHovered(false);
    setIsRearSlotHovered(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DROP: FRONT DEQUEUE DROP ZONE (Left Column)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDropOnFront = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFrontDropHovered(false);

    const payload = activeDragPayload;
    activeDragPayload = null;
    setDragSource(null);

    // If dragged from the palette
    if (payload?.source === 'palette') {
      soundEffects.playError();
      onInvalidAction?.(
        'FIFO Restriction: Elements CANNOT enter through the FRONT! In a Queue, new elements strictly arrive at the REAR pointer.'
      );
      return;
    }

    // If dragged from queue index 0
    if (payload?.source === 'queue' && payload.index === 0) {
      onDequeue(payload.value);
      return;
    }

    // If dropped with plain text or queue has items
    if (items.length > 0) {
      onDequeue(frontItem!);
    } else {
      soundEffects.playError();
      onInvalidAction?.('Queue is empty! There is no element at the FRONT to dequeue.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DROP: REAR ENQUEUE DROP ZONE (Right Column)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDropOnRear = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRearDropHovered(false);

    const payload = activeDragPayload;
    activeDragPayload = null;
    setDragSource(null);

    // If dragged from queue
    if (payload?.source === 'queue') {
      soundEffects.playError();
      onInvalidAction?.(
        'Cannot re-enqueue an existing queue element. Elements only move forward towards the FRONT.'
      );
      return;
    }

    if (payload?.source === 'palette') {
      onEnqueue(payload.value);
      return;
    }

    // Fallback if dataTransfer json
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.value !== undefined) {
          onEnqueue(parsed.value);
          return;
        }
      }
    } catch {}

    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      onEnqueue(text);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DROP: REAR SLOT (Next available empty slot in the queue)
  // "element should insert only when the element is dragged near the rear or dropped at the rear option"
  // ─────────────────────────────────────────────────────────────────────────
  const handleDropOnRearSlot = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRearSlotHovered(false);

    const payload = activeDragPayload;
    activeDragPayload = null;
    setDragSource(null);

    if (payload?.source === 'queue') {
      soundEffects.playError();
      onInvalidAction?.('Cannot move an existing queue element back into the rear slot.');
      return;
    }

    if (payload?.source === 'palette') {
      onEnqueue(payload.value);
      return;
    }

    const text = e.dataTransfer.getData('text/plain');
    if (text) onEnqueue(text);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DROP: INVALID QUEUE REGIONS (Middle or occupied slots)
  // ─────────────────────────────────────────────────────────────────────────
  const handleDropOnInvalidQueueSlot = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    const payload = activeDragPayload;
    activeDragPayload = null;
    setDragSource(null);

    soundEffects.playError();
    if (payload?.source === 'palette') {
      onInvalidAction?.(
        `FIFO Violation: Cannot insert at slot [${slotIdx}]! In a Queue, elements can strictly ONLY enter at the REAR pointer (drop at the REAR option).`
      );
    } else if (payload?.source === 'queue') {
      onInvalidAction?.(
        'FIFO Violation: Queue elements cannot be rearranged in place! Departures strictly exit through the FRONT.'
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-6">
      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Left: Move icon, Title, Badge, Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Move className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                INTERACTIVE ARENA
              </span>
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                {simulatorBadgeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: QUEUE STATUS, Empty/Active badge, Capacity Fraction & Mini Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            QUEUE STATUS
          </span>

          <span
            className={`text-xs font-semibold px-3 py-0.5 rounded-full border transition-colors ${
              isEmpty
                ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : isFull
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
            }`}
          >
            {isEmpty
              ? 'Empty (0 items)'
              : isFull
              ? `Full (${items.length}/${capacity})`
              : `Active (${items.length} items)`}
          </span>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
              {items.length} / {capacity}
            </span>
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (items.length / capacity) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── PALETTE OF AVAILABLE ELEMENTS ─── */}
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          {availableElements && availableElements.length > 0 ? (
            availableElements.map((val, idx) => {
              const isSelected = String(selectedElementValue) === String(val);
              return (
                <div
                  key={`${val}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStartPalette(e, val)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectElement(val);
                  }}
                  className={`w-28 sm:w-32 h-14 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing select-none flex items-center justify-center gap-3 px-4 shadow-2xs hover:shadow-md hover:scale-102 ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-300 dark:ring-indigo-800'
                      : 'border-indigo-200/90 dark:border-indigo-700/80 bg-gradient-to-b from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-950/30'
                  }`}
                  title={`Drag [${val}] to REAR to enqueue, or click`}
                >
                  <GripVertical className="w-4 h-4 text-indigo-300 dark:text-indigo-500 shrink-0" />
                  <span className="font-mono font-black text-xl text-blue-700 dark:text-blue-300">
                    {val}
                  </span>
                </div>
              );
            })
          ) : (
            [10, 20, 30, 40].map((val) => (
              <div
                key={val}
                draggable
                onDragStart={(e) => handleDragStartPalette(e, val)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  soundEffects.playClick();
                  onSelectElement(val);
                }}
                className="w-28 sm:w-32 h-14 rounded-xl border-2 border-indigo-200/90 dark:border-indigo-700/80 bg-gradient-to-b from-white to-indigo-50/50 dark:from-slate-800 dark:to-indigo-950/30 flex items-center justify-center gap-3 px-4 shadow-2xs hover:shadow-md hover:scale-102 cursor-grab active:cursor-grabbing select-none"
              >
                <GripVertical className="w-4 h-4 text-indigo-300 dark:text-indigo-500 shrink-0" />
                <span className="font-mono font-black text-xl text-blue-700 dark:text-blue-300">
                  {val}
                </span>
              </div>
            ))
          )}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Drag an element to the <strong className="text-purple-600 dark:text-purple-400 font-bold">REAR</strong> option to insert (enqueue)
        </p>
      </div>

      {/* ─── 3-ZONE INTERACTIVE ARENA: FRONT DROP | QUEUE (5 SLOTS) | REAR DROP ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_180px] gap-4 items-stretch pt-1">
        {/* ─── LEFT: FRONT DEQUEUE DROP ZONE ─── */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setIsFrontDropHovered(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsFrontDropHovered(true);
          }}
          onDragLeave={() => setIsFrontDropHovered(false)}
          onDrop={handleDropOnFront}
          onClick={() => {
            if (items.length > 0) {
              soundEffects.playClick();
              onDequeue(frontItem!);
            } else {
              soundEffects.playError();
              onInvalidAction?.('The queue is empty! No element at the FRONT to dequeue.');
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[160px] ${
            isFrontDropHovered
              ? 'border-blue-600 bg-blue-100/70 dark:bg-blue-900/50 scale-102 shadow-lg ring-4 ring-blue-300 dark:ring-blue-800'
              : dragSource === 'queue'
              ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 animate-pulse'
              : 'border-blue-400 dark:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
          }`}
          title="Drag the FRONT element here to DEQUEUE (Remove from queue)"
        >
          <span className="font-black text-xs sm:text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            FRONT
          </span>
          <span className="text-blue-500 text-lg font-bold my-0.5 leading-none">
            ↓
          </span>
          <ArrowDownToLine className="w-7 h-7 text-blue-600 dark:text-blue-400 my-1" />
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            <span>Drop here to</span>
            <strong className="block font-black text-blue-600 dark:text-blue-400 text-xs sm:text-sm tracking-wide">
              DEQUEUE
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              (Remove from Front)
            </span>
          </div>
        </div>

        {/* ─── CENTER: SOLID CONTAINER WITH "QUEUE" BADGE & 5 SLOTS ─── */}
        <div className="relative border-2 border-indigo-500 dark:border-indigo-600 rounded-2xl p-4 sm:p-6 pt-7 sm:pt-8 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 min-h-[160px]">
          {/* Top Centered Pill Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-7 py-0.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-xs tracking-widest uppercase shadow-md select-none">
            QUEUE
          </div>

          {/* Row of 5 Slots */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3.5 w-full flex-wrap">
            {Array.from({ length: capacity }).map((_, idx) => {
              const isOccupied = idx < items.length;
              const val = isOccupied ? items[idx] : null;
              const isFront = isOccupied && idx === 0;
              const isRear = isOccupied && idx === items.length - 1;
              const isNextRearSlot = !isOccupied && idx === items.length;

              // Empty slot that is NOT the next rear slot (middle/future empty slots)
              if (!isOccupied && !isNextRearSlot) {
                return (
                  <div
                    key={`slot-${idx}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'none';
                    }}
                    onDrop={(e) => handleDropOnInvalidQueueSlot(e, idx)}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl border-2 border-dashed border-blue-200 dark:border-slate-700 bg-blue-50/20 dark:bg-slate-800/20 flex items-center justify-center transition-all select-none opacity-60"
                  />
                );
              }

              // Next REAR insertion slot in the queue: accepts drop near rear
              if (isNextRearSlot) {
                return (
                  <div
                    key={`rear-slot-${idx}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                      setIsRearSlotHovered(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsRearSlotHovered(true);
                    }}
                    onDragLeave={() => setIsRearSlotHovered(false)}
                    onDrop={handleDropOnRearSlot}
                    className={`w-14 h-14 sm:w-18 sm:h-18 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all select-none cursor-pointer ${
                      isRearSlotHovered
                        ? 'border-purple-600 bg-purple-100/60 dark:bg-purple-900/50 scale-105 ring-2 ring-purple-400'
                        : dragSource === 'palette'
                        ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 animate-pulse'
                        : 'border-blue-200 dark:border-slate-700 bg-blue-50/20 dark:bg-slate-800/20 hover:border-purple-300'
                    }`}
                    title="Drop here to ENQUEUE at REAR"
                  >
                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-tight">
                      REAR
                    </span>
                    <span className="text-[8px] text-slate-400">
                      [Slot {idx}]
                    </span>
                  </div>
                );
              }

              // Occupied slot
              return (
                <motion.div
                  key={`occupied-${idx}-${val}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  draggable={isFront}
                  onDragStart={(e) => handleDragStartQueue(e, val!, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => {
                    // Prevent dropping on existing items
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'none';
                  }}
                  onDrop={(e) => handleDropOnInvalidQueueSlot(e, idx)}
                  onClick={() => {
                    soundEffects.playClick();
                    onSelectElement(val!);
                  }}
                  className={`relative w-14 h-14 sm:w-18 sm:h-18 rounded-xl border-2 font-mono font-black text-lg sm:text-xl flex flex-col items-center justify-center shadow-xs transition-all select-none ${
                    isFront
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-200 ring-2 ring-blue-300 dark:ring-blue-800 cursor-grab active:cursor-grabbing hover:scale-105'
                      : isRear
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-200 cursor-pointer'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer'
                  }`}
                  title={
                    isFront
                      ? `[${val}] at FRONT - Drag to FRONT option to DEQUEUE, or click`
                      : isRear
                      ? `[${val}] at REAR`
                      : `[${val}] index ${idx}`
                  }
                >
                  <span>{val}</span>
                  {isFront && (
                    <span className="text-[8px] font-sans font-black uppercase tracking-tight text-blue-600 dark:text-blue-400 absolute bottom-1 flex items-center gap-0.5">
                      <ArrowLeft className="w-2.5 h-2.5" /> FRONT
                    </span>
                  )}
                  {isRear && !isFront && (
                    <span className="text-[8px] font-sans font-black uppercase tracking-tight text-purple-600 dark:text-purple-400 absolute bottom-1">
                      REAR
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT: REAR ENQUEUE DROP ZONE ─── */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            setIsRearDropHovered(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsRearDropHovered(true);
          }}
          onDragLeave={() => setIsRearDropHovered(false)}
          onDrop={handleDropOnRear}
          onClick={() => {
            if (availableElements && availableElements.length > 0) {
              soundEffects.playClick();
              onEnqueue(availableElements[0]);
            } else {
              soundEffects.playClick();
              onEnqueue(items.length > 0 ? (Number(rearItem) || 0) + 10 : 10);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none min-h-[160px] ${
            isRearDropHovered
              ? 'border-purple-600 bg-purple-100/70 dark:bg-purple-900/50 scale-102 shadow-lg ring-4 ring-purple-300 dark:ring-purple-800'
              : dragSource === 'palette'
              ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 animate-pulse'
              : 'border-purple-400 dark:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30'
          }`}
          title="Drag element from palette here to ENQUEUE at REAR"
        >
          <span className="font-black text-xs sm:text-sm text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            REAR
          </span>
          <span className="text-purple-500 text-lg font-bold my-0.5 leading-none">
            ↓
          </span>
          <FolderPlus className="w-7 h-7 text-purple-600 dark:text-purple-400 my-1" />
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            <span>Drop here to</span>
            <strong className="block font-black text-purple-600 dark:text-purple-400 text-xs sm:text-sm tracking-wide">
              ENQUEUE
            </strong>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              (Add at Rear)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
