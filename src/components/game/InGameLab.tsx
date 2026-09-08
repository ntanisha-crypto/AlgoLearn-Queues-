import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical,
  Plus,
  Minus,
  Sparkles,
  RotateCcw,
  ArrowRight,
  ArrowDownToLine,
  Eye,
  Shuffle,
  Trash2,
  Sliders,
  Layers,
  Binary,
  Code,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowLeft,
  Zap,
  Play,
  Copy,
  ArrowUpDown,
  History,
  ShieldAlert,
  LogIn,
  LogOut,
  Cpu,
  Printer,
} from 'lucide-react';
import { StackItem, OperationLog, UserProgress } from '../../types';
import { QueueVisualizer } from '../common/QueueVisualizer';
import { InteractiveQueueBoxes } from './InteractiveQueueBoxes';
import { DequeueZone } from './DequeueZone';
import { soundEffects } from '../../services/sound';

interface InGameLabProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress | ((prev: UserProgress) => UserProgress)) => void;
  onBackToGame?: () => void;
  onSelectLevel?: (levelId: number) => void;
  hideHeader?: boolean;
}

const PRESET_CAPACITIES = [4, 6, 8, 12, 16, 20];
const QUICK_ELEMENT_CHIPS = [10, 20, 30, 42, 50, 75, 99, 100];

export const InGameLab: React.FC<InGameLabProps> = ({
  progress,
  onUpdateProgress,
  onBackToGame,
  onSelectLevel,
  hideHeader = false,
}) => {
  // Queue items (ordered index 0 = FRONT, last index = REAR)
  const [items, setItems] = useState<StackItem[]>([
    { id: 'lab-init-1', value: 10, addedAt: Date.now() - 6000 },
    { id: 'lab-init-2', value: 20, addedAt: Date.now() - 5000 },
    { id: 'lab-init-3', value: 30, addedAt: Date.now() - 4000 },
    { id: 'lab-init-4', value: 40, addedAt: Date.now() - 3000 },
    { id: 'lab-init-5', value: 50, addedAt: Date.now() - 2000 },
    { id: 'lab-init-6', value: 60, addedAt: Date.now() - 1000 },
  ]);

  // Capacity & sizing (range 2 to 20)
  const [capacity, setCapacity] = useState<number>(8);
  const [customInputValue, setCustomInputValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    index?: number;
    depthFromFront?: number;
    message?: string;
  } | null>(null);

  // Peek highlight
  const [peekedValue, setPeekedValue] = useState<number | string | null>(null);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);

  // Visualizer representation mode
  const [visualMode, setVisualMode] = useState<'canister' | 'array' | 'experiments'>('canister');
  const [activeExperiment, setActiveExperiment] = useState<'overflow' | 'underflow' | 'fifo' | 'scheduler' | 'spooler'>('overflow');

  // Interactive feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    type: 'info',
    title: 'In-Game Lab Active',
    message: 'Welcome to the In-Game Queue Experimentation Lab! Adjust capacity, perform operations, and test FIFO queue behaviors.',
  });

  // Operation history logs
  const [history, setHistory] = useState<OperationLog[]>([
    {
      id: 'log-init',
      operation: 'CLEAR',
      success: true,
      message: 'Queue initialized with [10, 20, 30] (Capacity: 8)',
      timestamp: new Date(),
      stackSnapshot: [10, 20, 30],
    },
  ]);

  // FIFO experiment sequence state
  const [fifoQueue, setFifoQueue] = useState<string[]>(['Patient A', 'Patient B', 'Patient C', 'Patient D']);
  const [fifoServed, setFifoServed] = useState<string[]>([]);

  // CPU Round-Robin Scheduler experiment state
  const [cpuQueue, setCpuQueue] = useState<{ pid: string; time: number }[]>([
    { pid: 'P1', time: 6 },
    { pid: 'P2', time: 4 },
    { pid: 'P3', time: 8 },
    { pid: 'P4', time: 3 },
  ]);
  const [currentCpuProcess, setCurrentCpuProcess] = useState<string | null>(null);
  const [cpuCompleted, setCpuCompleted] = useState<string[]>([]);

  // Print Spooler experiment state
  const [spoolerQueue, setSpoolerQueue] = useState<string[]>([
    'Quarterly_Report.pdf',
    'HighRes_Design.png',
    'Employee_Roster.xlsx',
  ]);
  const [activePrintingJob, setActivePrintingJob] = useState<string | null>(null);
  const [printedJobs, setPrintedJobs] = useState<string[]>([]);

  // Log recorder helper
  const addLog = (
    operation: OperationLog['operation'],
    success: boolean,
    message: string,
    val?: number | string
  ) => {
    const newItems = operation === 'DEQUEUE' && success ? items.slice(1) : items;
    const newLog: OperationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      operation,
      value: val,
      success,
      message,
      timestamp: new Date(),
      stackSnapshot: newItems.map((it) => it.value),
    };
    setHistory((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  // ==========================================
  // CAPACITY / SIZING HANDLERS
  // ==========================================
  const handleSetCapacity = (newCap: number) => {
    soundEffects.playClick();
    const clamped = Math.max(2, Math.min(20, newCap));
    if (clamped < items.length) {
      // Safe truncation with warning
      setFeedback({
        type: 'warning',
        title: '⚠️ Capacity Decreased Below Current Size',
        message: `Capacity changed to ${clamped}. Current queue had ${items.length} items. Rear elements safely truncated to fit new capacity.`,
      });
      setItems((prev) => prev.slice(0, clamped));
      addLog('RESIZE', true, `Decreased capacity to ${clamped} (truncated rear elements)`);
    } else {
      setFeedback({
        type: 'info',
        title: '📏 Queue Capacity Updated',
        message: `Capacity adjusted to ${clamped} slots. Free slots remaining: ${clamped - items.length}.`,
      });
      addLog('RESIZE', true, `Adjusted capacity to ${clamped}`);
    }
    setCapacity(clamped);
  };

  // ==========================================
  // ENQUEUE OPERATION (Adds to REAR)
  // ==========================================
  const handleEnqueue = (valToEnqueue: number | string) => {
    if (valToEnqueue === '' || valToEnqueue === undefined || valToEnqueue === null) {
      soundEffects.playError();
      setFeedback({
        type: 'warning',
        title: 'Empty Value',
        message: 'Please enter or select a value to enqueue into the queue.',
      });
      return;
    }

    if (items.length >= capacity) {
      soundEffects.playError();
      setFeedback({
        type: 'error',
        title: '⚠️ Queue Overflow Condition!',
        message: `Cannot ENQUEUE [${valToEnqueue}]. Current size (${items.length}) equals maximum capacity (${capacity}). Queues cannot exceed allocated space without resizing.`,
      });
      addLog('ENQUEUE', false, `Queue Overflow! Failed to enqueue [${valToEnqueue}] at max capacity (${capacity})`, valToEnqueue);
      return;
    }

    soundEffects.playPush();
    const newItem: StackItem = {
      id: `lab-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      value: valToEnqueue,
      addedAt: Date.now(),
    };

    setItems((prev) => [...prev, newItem]);
    setPeekedValue(null);
    setPeekIndex(null);
    setSearchResult(null);

    setFeedback({
      type: 'success',
      title: `✅ ENQUEUE(${valToEnqueue}) Executed`,
      message: `Enqueued [${valToEnqueue}] at the REAR of the queue (Index [${items.length}]). REAR pointer shifted.`,
    });
    addLog('ENQUEUE', true, `Enqueued [${valToEnqueue}] at rear (index ${items.length})`, valToEnqueue);
  };

  // ==========================================
  // DEQUEUE OPERATION (Removes from FRONT)
  // ==========================================
  const handleDequeue = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setFeedback({
        type: 'error',
        title: '⚠️ Queue Underflow Condition!',
        message: 'Cannot DEQUEUE from an empty queue! Attempting to remove elements when size is 0 produces Queue Underflow.',
      });
      addLog('DEQUEUE', false, 'Queue Underflow! Attempted to dequeue from empty queue');
      return;
    }

    soundEffects.playPop();
    const dequeuedItem = items[0];
    setItems((prev) => prev.slice(1));
    setPeekedValue(null);
    setPeekIndex(null);
    setSearchResult(null);

    setFeedback({
      type: 'success',
      title: `✅ DEQUEUE() Executed: [${dequeuedItem.value}]`,
      message: `Removed frontmost element [${dequeuedItem.value}] from index [0]. Queue follows FIFO: oldest arrival exits first.`,
    });
    addLog('DEQUEUE', true, `Dequeued [${dequeuedItem.value}] from front (index 0)`, dequeuedItem.value);
  };

  // ==========================================
  // PEEK FRONT OPERATION
  // ==========================================
  const handlePeekFront = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setFeedback({
        type: 'warning',
        title: 'Queue is Empty',
        message: 'PEEK FRONT returns null because there are no elements in the queue.',
      });
      addLog('PEEK_FRONT', false, 'PEEK FRONT failed on empty queue');
      return;
    }

    soundEffects.playPeek();
    const front = items[0];
    setPeekedValue(front.value);
    setPeekIndex(0);
    setFeedback({
      type: 'info',
      title: `👁️ PEEK FRONT Element: [${front.value}]`,
      message: `Inspected FRONT item [${front.value}] at index [0]. Queue remains completely unmodified (O(1) time complexity).`,
    });
    addLog('PEEK_FRONT', true, `Peeked front value: [${front.value}]`, front.value);
  };

  // ==========================================
  // PEEK REAR OPERATION
  // ==========================================
  const handlePeekRear = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setFeedback({
        type: 'warning',
        title: 'Queue is Empty',
        message: 'PEEK REAR returns null because there are no elements in the queue.',
      });
      addLog('PEEK_REAR', false, 'PEEK REAR failed on empty queue');
      return;
    }

    soundEffects.playPeek();
    const rear = items[items.length - 1];
    setPeekedValue(rear.value);
    setPeekIndex(items.length - 1);
    setFeedback({
      type: 'info',
      title: `👁️ PEEK REAR Element: [${rear.value}]`,
      message: `Inspected REAR item [${rear.value}] at index [${items.length - 1}]. Most recently enqueued arrival.`,
    });
    addLog('PEEK_REAR', true, `Peeked rear value: [${rear.value}]`, rear.value);
  };

  // ==========================================
  // DUPLICATE REAR (DUP)
  // ==========================================
  const handleDuplicateRear = () => {
    if (items.length === 0) {
      soundEffects.playError();
      setFeedback({
        type: 'warning',
        title: 'Cannot Duplicate',
        message: 'Queue is empty. Enqueue an element first to duplicate it.',
      });
      return;
    }
    if (items.length >= capacity) {
      soundEffects.playError();
      setFeedback({
        type: 'error',
        title: 'Queue Overflow on DUP',
        message: `Cannot duplicate rear item: Queue is already at maximum capacity (${capacity}).`,
      });
      return;
    }

    soundEffects.playPush();
    const rearVal = items[items.length - 1].value;
    const newItem: StackItem = {
      id: `lab-dup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      value: rearVal,
      addedAt: Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
    setFeedback({
      type: 'success',
      title: `🔄 DUP REAR Executed: [${rearVal}]`,
      message: `Duplicated rear element [${rearVal}] and enqueued an identical copy at the REAR.`,
    });
    addLog('ENQUEUE', true, `Duplicated rear item [${rearVal}]`, rearVal);
  };

  // ==========================================
  // SWAP FRONT TWO
  // ==========================================
  const handleSwapFrontTwo = () => {
    if (items.length < 2) {
      soundEffects.playError();
      setFeedback({
        type: 'warning',
        title: 'Cannot Swap',
        message: 'Queue must contain at least 2 elements to perform a SWAP operation.',
      });
      return;
    }

    soundEffects.playClick();
    setItems((prev) => {
      const copy = [...prev];
      const temp = copy[0];
      copy[0] = copy[1];
      copy[1] = temp;
      return copy;
    });

    const firstVal = items[1].value;
    const secondVal = items[0].value;

    setFeedback({
      type: 'success',
      title: `🔀 SWAP FRONT TWO Executed`,
      message: `Exchanged front elements. New FRONT is now [${firstVal}], followed by [${secondVal}].`,
    });
    addLog('SWAP', true, `Swapped front two items: [${secondVal}] <-> [${firstVal}]`);
  };

  // ==========================================
  // CYCLE / ROTATE QUEUE (Round-Robin)
  // ==========================================
  const handleRotateQueue = () => {
    if (items.length <= 1) {
      soundEffects.playClick();
      setFeedback({
        type: 'info',
        title: 'Rotate Unchanged',
        message: 'Queue has 1 or 0 elements; cycling results in the identical queue.',
      });
      return;
    }

    soundEffects.playClick();
    let rotatedVal: number | string = '';
    setItems((prev) => {
      const copy = [...prev];
      const front = copy.shift()!;
      rotatedVal = front.value;
      copy.push(front);
      return copy;
    });
    setFeedback({
      type: 'info',
      title: '🔁 Queue Cycled (Round-Robin)',
      message: `Dequeued [${rotatedVal}] from FRONT and immediately enqueued it back to the REAR.`,
    });
    addLog('CYCLE', true, `Cycled front element [${rotatedVal}] to rear`);
  };

  // ==========================================
  // REVERSE QUEUE
  // ==========================================
  const handleReverseQueue = () => {
    if (items.length <= 1) {
      soundEffects.playClick();
      setFeedback({
        type: 'info',
        title: 'Reverse Unchanged',
        message: 'Queue has 1 or 0 elements; reversing results in the identical order.',
      });
      return;
    }

    soundEffects.playSuccess();
    setItems((prev) => [...prev].reverse());
    setFeedback({
      type: 'success',
      title: `🔃 Queue Reversal Executed`,
      message: `Inverted the queue order. The previous REAR is now at the FRONT.`,
    });
    addLog('REVERSE', true, `Reversed entire queue ordering`);
  };

  // ==========================================
  // SORT QUEUE
  // ==========================================
  const handleSortQueue = (ascending: boolean = true) => {
    if (items.length <= 1) return;
    soundEffects.playSuccess();
    setItems((prev) => {
      const copy = [...prev];
      copy.sort((a, b) => {
        const numA = Number(a.value);
        const numB = Number(b.value);
        if (!isNaN(numA) && !isNaN(numB)) {
          return ascending ? numA - numB : numB - numA;
        }
        return ascending
          ? String(a.value).localeCompare(String(b.value))
          : String(b.value).localeCompare(String(a.value));
      });
      return copy;
    });

    setFeedback({
      type: 'success',
      title: `📊 Queue Sorted (${ascending ? 'Ascending' : 'Descending'})`,
      message: `Sorted queue elements while maintaining FIFO entry/exit boundaries.`,
    });
    addLog('SORT', true, `Sorted queue ${ascending ? 'Ascending' : 'Descending'}`);
  };

  // ==========================================
  // SEARCH QUEUE
  // ==========================================
  const handleSearchValue = () => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      return;
    }

    const queryNum = Number(searchQuery);
    let foundIndex = -1;

    for (let i = 0; i < items.length; i++) {
      if (!isNaN(queryNum) && Number(items[i].value) === queryNum) {
        foundIndex = i;
        break;
      } else if (String(items[i].value).toLowerCase() === searchQuery.toLowerCase()) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex !== -1) {
      soundEffects.playSuccess();
      const depthFromFront = foundIndex;
      setSearchResult({
        found: true,
        index: foundIndex,
        depthFromFront,
        message: `Value [${searchQuery}] found at index [${foundIndex}] (${depthFromFront === 0 ? 'at FRONT (next to be served)' : `${depthFromFront} dequeues away from FRONT`}).`,
      });
      setFeedback({
        type: 'success',
        title: `🔍 Element Found: [${searchQuery}]`,
        message: `Element is at index [${foundIndex}]. In FIFO order, ${depthFromFront} dequeue operation${depthFromFront === 1 ? '' : 's'} precede it.`,
      });
      addLog('SEARCH', true, `Searched for [${searchQuery}]: Found at index ${foundIndex}`, searchQuery);
    } else {
      soundEffects.playError();
      setSearchResult({
        found: false,
        message: `Value [${searchQuery}] was not found in the queue.`,
      });
      setFeedback({
        type: 'warning',
        title: `🔍 Element Not Found`,
        message: `Value [${searchQuery}] does not exist in the current queue.`,
      });
      addLog('SEARCH', false, `Searched for [${searchQuery}]: Not found`, searchQuery);
    }
  };

  // ==========================================
  // BATCH GENERATORS
  // ==========================================
  const handleBatchEnqueue = (preset: 'seq' | 'fib' | 'random' | 'fill') => {
    soundEffects.playSuccess();
    let valuesToAdd: number[] = [];

    if (preset === 'seq') {
      valuesToAdd = [10, 20, 30, 40];
    } else if (preset === 'fib') {
      valuesToAdd = [1, 2, 3, 5, 8];
    } else if (preset === 'random') {
      valuesToAdd = [
        Math.floor(Math.random() * 90) + 10,
        Math.floor(Math.random() * 90) + 10,
        Math.floor(Math.random() * 90) + 10,
      ];
    } else if (preset === 'fill') {
      const needed = capacity - items.length;
      if (needed <= 0) {
        setFeedback({
          type: 'warning',
          title: 'Already Full',
          message: `Queue is already at full capacity (${capacity}/${capacity}).`,
        });
        return;
      }
      for (let i = 0; i < needed; i++) {
        valuesToAdd.push((items.length + i + 1) * 10);
      }
    }

    const availableSlots = capacity - items.length;
    const canAdd = valuesToAdd.slice(0, availableSlots);

    if (canAdd.length === 0) {
      setFeedback({
        type: 'error',
        title: 'Queue Capacity Full',
        message: 'Cannot batch enqueue: No available slots remaining. Increase capacity first.',
      });
      return;
    }

    const newItems: StackItem[] = canAdd.map((val, idx) => ({
      id: `batch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      value: val,
      addedAt: Date.now() + idx,
    }));

    setItems((prev) => [...prev, ...newItems]);
    setFeedback({
      type: 'success',
      title: `⚡ Batch Enqueued ${canAdd.length} Element${canAdd.length > 1 ? 's' : ''}`,
      message: `Enqueued [${canAdd.join(', ')}] at the REAR of the queue.`,
    });
    addLog('BATCH_ENQUEUE', true, `Batch enqueued [${canAdd.join(', ')}]`);
  };

  // Clear Queue
  const handleClearQueue = () => {
    soundEffects.playClick();
    setItems([]);
    setPeekedValue(null);
    setSearchResult(null);
    setFeedback({
      type: 'info',
      title: '🗑️ Queue Cleared',
      message: 'All elements removed. Queue is now empty (Size: 0).',
    });
    addLog('CLEAR', true, 'Cleared all elements from queue');
  };

  // Queue Pointer Helpers
  const frontItem = items.length > 0 ? items[0] : null;
  const frontValue = frontItem ? frontItem.value : null;
  const rearItem = items.length > 0 ? items[items.length - 1] : null;
  const rearValue = rearItem ? rearItem.value : null;
  const isFull = items.length >= capacity;
  const isEmpty = items.length === 0;
  const fullnessPercent = Math.round((items.length / capacity) * 100);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ========================================== */}
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      {/* ========================================== */}
      {!hideHeader && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Interactive Lab
              </span>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                • In-Game Sandbox & Experiment Ground
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <FlaskConical className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Queue Experimentation Lab
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Experiment freely: dynamically resize capacity, enqueue custom data at the REAR, test FIFO boundaries, and run algorithms.
            </p>
          </div>

          {/* Back to Challenge Mode Action Button */}
          {onBackToGame && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onBackToGame}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Challenges</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* 2. DYNAMIC SIZING & CAPACITY CONTROL BAR */}
      {/* ========================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Dynamic Queue Capacity & Sizing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Increase or decrease queue capacity to test overflow barriers and buffer allocation.
              </p>
            </div>
          </div>

          {/* Quick Capacity Display */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Current Sizing:</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 font-mono font-black text-xs text-blue-700 dark:text-blue-300">
              <span>{items.length} Enqueued</span>
              <span className="text-blue-400">/</span>
              <span>{capacity} Max Slots</span>
            </div>
          </div>
        </div>

        {/* Capacity Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Stepper Buttons & Range Slider */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Capacity Range (2 to 20 slots)</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-black">
                {capacity} Slots
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSetCapacity(capacity - 1)}
                disabled={capacity <= 2}
                title="Decrease Capacity (-1)"
                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-black transition-all cursor-pointer active:scale-90 shrink-0"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="range"
                min={2}
                max={20}
                value={capacity}
                onChange={(e) => handleSetCapacity(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />

              <button
                onClick={() => handleSetCapacity(capacity + 1)}
                disabled={capacity >= 20}
                title="Increase Capacity (+1)"
                className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-black transition-all cursor-pointer active:scale-90 shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="md:col-span-5 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Size Presets:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {PRESET_CAPACITIES.map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleSetCapacity(cap)}
                  className={`px-3 py-1 rounded-xl text-xs font-black font-mono transition-all cursor-pointer ${
                    capacity === cap
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Visual Capacity Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-500">Utilization Bar:</span>
            <div className="flex items-center gap-2">
              {isFull && (
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/80 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Queue Full (Overflow Guard Active)
                </span>
              )}
              {isEmpty && (
                <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  Empty Queue
                </span>
              )}
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {fullnessPercent}% Loaded ({capacity - items.length} free)
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5">
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ width: `${Math.min(100, (items.length / capacity) * 100)}%` }}
              className={`h-full rounded-full transition-colors ${
                isFull
                  ? 'bg-red-500 dark:bg-red-600'
                  : items.length / capacity > 0.75
                  ? 'bg-amber-500 dark:bg-amber-600'
                  : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600'
              }`}
            />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. OPERATIONS & EXPERIMENT DECK */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Queue Diagram / Visualizer or Memory Representation (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVisualMode('canister')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'canister'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Canister View</span>
              </button>

              <button
                onClick={() => setVisualMode('array')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'array'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Binary className="w-3.5 h-3.5" />
                <span>Array Memory</span>
              </button>

              <button
                onClick={() => setVisualMode('experiments')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  visualMode === 'experiments'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Guided Labs</span>
              </button>
            </div>

            {/* Clear Button */}
            <button
              onClick={handleClearQueue}
              disabled={isEmpty}
              title="Clear Queue"
              className="px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>

          {/* Tab 1: Interactive Queue Boxes Visualizer with Dynamic FRONT & REAR Pointers */}
          {visualMode === 'canister' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative">
                <InteractiveQueueBoxes
                  items={items}
                  capacity={capacity}
                  peekValue={peekedValue}
                  peekIndex={peekIndex}
                  isPeekActive={peekedValue !== null}
                  onEnqueue={handleEnqueue}
                  onDequeue={handleDequeue}
                  onPeekFront={handlePeekFront}
                  onClearQueue={handleClearQueue}
                  onDropItem={(val) => handleEnqueue(val)}
                  statusLabel="QUEUE STATUS"
                />
              </div>

              {/* Interactive FIFO Dequeue Zone */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    FIFO DEQUEUE ZONE (SERVICE EXIT)
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Drag the front block here or click Dequeue
                  </span>
                </div>
                <DequeueZone
                  frontElementValue={frontValue}
                  onDequeueSuccess={handleDequeue}
                  onDequeueInvalid={() => {
                    soundEffects.playError();
                    setFeedback({
                      type: 'error',
                      title: 'Non-Front Access Prohibited',
                      message: 'Only the FRONT element can be dragged into the Dequeue Zone (FIFO).',
                    });
                  }}
                  disabled={isEmpty}
                />
              </div>
            </div>
          )}

          {/* Tab 2: Array Memory Contiguous Representation */}
          {visualMode === 'array' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Binary className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Contiguous Array Memory Buffer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Static or dynamic buffer allocated in RAM with indices [0..Capacity-1].
                </p>
              </div>

              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  {Array.from({ length: capacity }).map((_, idx) => {
                    const item = items[idx];
                    const isFront = idx === 0 && items.length > 0;
                    const isRear = idx === items.length - 1 && items.length > 0;
                    const isAllocated = idx < items.length;
                    const isPeeked =
                      isAllocated &&
                      ((peekIndex !== null && peekIndex === idx) ||
                        (peekedValue !== null && String(item?.value) === String(peekedValue) && (isFront || isRear)));

                    return (
                      <div
                        key={idx}
                        className={`w-18 flex flex-col items-center rounded-2xl p-2.5 border transition-all ${
                          isPeeked
                            ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-300 dark:ring-blue-600 shadow-lg scale-105 z-10'
                            : isFront
                            ? 'bg-rose-500 text-white border-rose-400 ring-2 ring-rose-300 dark:ring-rose-900 shadow-md scale-105'
                            : isRear
                            ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-300 dark:ring-emerald-900 shadow-md scale-105'
                            : isAllocated
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700'
                            : 'bg-slate-50 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700 border-dashed border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Pointer Indicator */}
                        <span className="text-[9px] font-mono font-bold tracking-tight h-4 text-center">
                          {isPeeked
                            ? '👁️ PEEK'
                            : isFront && isRear
                            ? 'FRONT/REAR'
                            : isFront
                            ? 'FRONT (H)'
                            : isRear
                            ? 'REAR (T)'
                            : ''}
                        </span>

                        {/* Element Value */}
                        <span className="text-base font-mono font-black my-1">
                          {isAllocated ? item.value : '—'}
                        </span>

                        {/* Slot Index */}
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md mt-1 ${
                            isPeeked
                              ? 'bg-blue-700 text-blue-100 font-bold'
                              : isFront
                              ? 'bg-rose-600 text-rose-100'
                              : isRear
                              ? 'bg-emerald-700 text-emerald-100'
                              : isAllocated
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-transparent text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          [{idx}]
                        </span>

                        {/* Hex Memory Address */}
                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                          0x{((idx * 4) + 0x1000).toString(16).toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Memory Legend & Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Front Pointer</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {items.length > 0 ? 'Index [0]' : 'NULL (-1)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Rear Pointer</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {items.length > 0 ? `Index [${items.length - 1}]` : 'NULL (-1)'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Allocated RAM</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {capacity * 4} Bytes
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">FIFO Integrity</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    100% Guarded
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Guided Real-World Experiments */}
          {visualMode === 'experiments' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Interactive Real-World Simulations
                </h3>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setActiveExperiment('overflow')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeExperiment === 'overflow'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Overflow Test
                  </button>
                  <button
                    onClick={() => setActiveExperiment('underflow')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeExperiment === 'underflow'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Underflow Test
                  </button>
                  <button
                    onClick={() => setActiveExperiment('fifo')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeExperiment === 'fifo'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    FIFO Sequence
                  </button>
                  <button
                    onClick={() => setActiveExperiment('scheduler')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeExperiment === 'scheduler'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    CPU Scheduler
                  </button>
                  <button
                    onClick={() => setActiveExperiment('spooler')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeExperiment === 'spooler'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Print Spooler
                  </button>
                </div>
              </div>

              {/* Experiment 1: Overflow Test */}
              {activeExperiment === 'overflow' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Experiment: Queue Overflow Trigger</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    A Queue Overflow occurs when an algorithm calls <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold">enqueue()</code> on a queue that is already at maximum capacity.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        handleSetCapacity(3);
                        setItems([
                          { id: '1', value: 10, addedAt: 1 },
                          { id: '2', value: 20, addedAt: 2 },
                          { id: '3', value: 30, addedAt: 3 },
                        ]);
                        setFeedback({
                          type: 'warning',
                          title: 'Queue Filled to Capacity (3/3)',
                          message: 'Click [+ ENQUEUE(99)] below to trigger the Queue Overflow exception guard.',
                        });
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Setup 3/3 Full Queue
                    </button>
                    <button
                      onClick={() => handleEnqueue(99)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-xl text-slate-800 dark:text-white transition-all cursor-pointer"
                    >
                      Attempt Enqueue(99)
                    </button>
                  </div>
                </div>
              )}

              {/* Experiment 2: Underflow Test */}
              {activeExperiment === 'underflow' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Experiment: Queue Underflow Trigger</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    A Queue Underflow occurs when an algorithm calls <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold">dequeue()</code> on an empty queue (Size: 0).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        handleClearQueue();
                        setFeedback({
                          type: 'warning',
                          title: 'Queue Cleared to 0',
                          message: 'Click [Attempt DEQUEUE()] to observe underflow safety handling.',
                        });
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Empty the Queue
                    </button>
                    <button
                      onClick={handleDequeue}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-xl text-slate-800 dark:text-white transition-all cursor-pointer"
                    >
                      Attempt DEQUEUE()
                    </button>
                  </div>
                </div>
              )}

              {/* Experiment 3: FIFO Sequence Preservation */}
              {activeExperiment === 'fifo' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                      <ArrowRight className="w-4 h-4" />
                      <span>Experiment: FIFO Sequence Arrival Preservation</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">
                      Waiting: {fifoQueue.length} | Served: {fifoServed.length}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Unlike stacks which invert order, queues guarantee that elements leave in the exact chronological arrival order: First In, First Out (FIFO).
                  </p>

                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Queue:</span>
                    {fifoQueue.length === 0 ? (
                      <span className="text-slate-400 italic">All arrivals served!</span>
                    ) : (
                      fifoQueue.map((item, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 rounded-lg font-mono font-bold text-xs border ${
                            idx === 0
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {idx === 0 ? '👉 ' : ''}{item}
                        </span>
                      ))
                    )}
                  </div>

                  {fifoServed.length > 0 && (
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      Served in order: [{fifoServed.join(' → ')}]
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setFifoQueue(['Patient A', 'Patient B', 'Patient C', 'Patient D']);
                        setFifoServed([]);
                        soundEffects.playClick();
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-xl text-slate-800 dark:text-white transition-all cursor-pointer"
                    >
                      Reset Queue
                    </button>
                    <button
                      onClick={() => {
                        if (fifoQueue.length === 0) return;
                        const next = fifoQueue[0];
                        setFifoQueue((prev) => prev.slice(1));
                        setFifoServed((prev) => [...prev, next]);
                        soundEffects.playPop();
                      }}
                      disabled={fifoQueue.length === 0}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Serve Next (Dequeue)
                    </button>
                  </div>
                </div>
              )}

              {/* Experiment 4: Round-Robin CPU Scheduler */}
              {activeExperiment === 'scheduler' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                      <Cpu className="w-4 h-4" />
                      <span>Experiment: Round-Robin CPU Task Queue</span>
                    </div>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      Quantum = 3ms
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Operating systems use circular queue semantics: the FRONT task executes for 3ms. If unfinished, it is dequeued and placed at the REAR!
                  </p>

                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {cpuQueue.length === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        All processes finished! CPU Idle.
                      </span>
                    ) : (
                      cpuQueue.map((proc, idx) => (
                        <div
                          key={proc.pid}
                          className={`p-2 rounded-xl border font-mono flex flex-col items-center ${
                            idx === 0
                              ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-300'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <span className="font-black text-xs">{proc.pid}</span>
                          <span className="text-[10px] opacity-70">{proc.time}ms left</span>
                        </div>
                      ))
                    )}
                  </div>

                  {currentCpuProcess && (
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                      {currentCpuProcess}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (cpuQueue.length === 0) return;
                        const current = cpuQueue[0];
                        const remaining = current.time - 3;
                        soundEffects.playClick();

                        if (remaining <= 0) {
                          setCpuQueue((prev) => prev.slice(1));
                          setCpuCompleted((prev) => [...prev, current.pid]);
                          setCurrentCpuProcess(`Process ${current.pid} finished execution (0ms left) and exited CPU.`);
                        } else {
                          setCpuQueue((prev) => [...prev.slice(1), { pid: current.pid, time: remaining }]);
                          setCurrentCpuProcess(`Process ${current.pid} ran 3ms (${remaining}ms remaining). Cycled to REAR of queue.`);
                        }
                      }}
                      disabled={cpuQueue.length === 0}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Run 3ms Quantum (Cycle)
                    </button>
                    <button
                      onClick={() => {
                        setCpuQueue([
                          { pid: 'P1', time: 6 },
                          { pid: 'P2', time: 4 },
                          { pid: 'P3', time: 8 },
                          { pid: 'P4', time: 3 },
                        ]);
                        setCurrentCpuProcess(null);
                        setCpuCompleted([]);
                      }}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold rounded-xl text-slate-800 dark:text-white transition-all cursor-pointer"
                    >
                      Reset Tasks
                    </button>
                  </div>
                </div>
              )}

              {/* Experiment 5: Print Spooler Buffer */}
              {activeExperiment === 'spooler' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <Printer className="w-4 h-4" />
                      <span>Experiment: Printer Spooler Buffer</span>
                    </div>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {spoolerQueue.length} jobs in buffer
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Spool buffers decouple fast document creators from slow physical hardware: print requests queue at the REAR and print sequentially from the FRONT.
                  </p>

                  <div className="space-y-1.5">
                    {spoolerQueue.map((job, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          {job}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {idx === 0 ? 'Next to Print (FRONT)' : `Position #${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (spoolerQueue.length === 0) return;
                        const printed = spoolerQueue[0];
                        setSpoolerQueue((prev) => prev.slice(1));
                        setPrintedJobs((prev) => [...prev, printed]);
                        soundEffects.playSuccess();
                      }}
                      disabled={spoolerQueue.length === 0}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Print Next Job (Dequeue)
                    </button>
                    <button
                      onClick={() => {
                        const newJob = `Doc_${Math.floor(Math.random() * 900) + 100}.pdf`;
                        setSpoolerQueue((prev) => [...prev, newJob]);
                        soundEffects.playPush();
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all cursor-pointer"
                    >
                      + Enqueue New Document
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Operations Command Deck & Live Trace (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Operation Deck Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Operations Command Deck
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Execute core and algorithmic queue operations.
              </p>
            </div>

            {/* 1. Custom Value ENQUEUE Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Enqueue Custom Value:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 42 or 'A'"
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customInputValue.trim()) {
                      handleEnqueue(
                        isNaN(Number(customInputValue)) ? customInputValue.trim() : Number(customInputValue)
                      );
                      setCustomInputValue('');
                    }
                  }}
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-xs sm:text-sm outline-hidden focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={() => {
                    if (customInputValue.trim()) {
                      handleEnqueue(
                        isNaN(Number(customInputValue)) ? customInputValue.trim() : Number(customInputValue)
                      );
                      setCustomInputValue('');
                    }
                  }}
                  disabled={!customInputValue.trim()}
                  className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ENQUEUE</span>
                </button>
              </div>

              {/* Quick Number Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Chips:</span>
                {QUICK_ELEMENT_CHIPS.map((num) => (
                  <button
                    key={num}
                    onClick={() => handleEnqueue(num)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950/70 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Core ADT Buttons Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleDequeue}
                disabled={isEmpty}
                className="p-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>DEQUEUE FRONT</span>
              </button>

              <button
                onClick={handlePeekFront}
                disabled={isEmpty}
                className="p-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
              >
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>PEEK FRONT</span>
              </button>
            </div>

            {/* 3. Advanced Queue Operations Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Extended Queue Algorithms:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  onClick={handlePeekRear}
                  disabled={isEmpty}
                  title="Inspect rear element"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PEEK REAR</span>
                </button>

                <button
                  onClick={handleRotateQueue}
                  disabled={items.length <= 1}
                  title="Round-robin cycle: Dequeue from front, enqueue to rear"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>CYCLE</span>
                </button>

                <button
                  onClick={handleSwapFrontTwo}
                  disabled={items.length < 2}
                  title="Swap front two elements"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>SWAP FRONT</span>
                </button>

                <button
                  onClick={handleReverseQueue}
                  disabled={items.length <= 1}
                  title="Reverse queue order"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>REVERSE</span>
                </button>

                <button
                  onClick={() => handleSortQueue(true)}
                  disabled={items.length <= 1}
                  title="Sort elements in ascending order"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>SORT ↑</span>
                </button>

                <button
                  onClick={handleDuplicateRear}
                  disabled={isEmpty || isFull}
                  title="Duplicate rear element"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>DUP REAR</span>
                </button>
              </div>
            </div>

            {/* 4. Batch Generators */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Batch Generators:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleBatchEnqueue('seq')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                >
                  + [10..40]
                </button>
                <button
                  onClick={() => handleBatchEnqueue('fib')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                >
                  + Fibonacci
                </button>
                <button
                  onClick={() => handleBatchEnqueue('random')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                >
                  🎲 3 Random
                </button>
                <button
                  onClick={() => handleBatchEnqueue('fill')}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                >
                  ⚡ Fill Max
                </button>
              </div>
            </div>

            {/* 5. Search Element */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Search Element Position:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search value..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchValue();
                  }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchValue}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Search
                </button>
              </div>

              {searchResult && (
                <div
                  className={`p-2 rounded-xl text-xs font-bold ${
                    searchResult.found
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {searchResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Diagnostics & Feedback Card */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              feedback.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                : feedback.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                {feedback.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {feedback.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider">{feedback.title}</h4>
                <p className="text-xs leading-relaxed opacity-90">{feedback.message}</p>
              </div>
            </div>
          </div>

          {/* Operation History Trace Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Live Operation Trace
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                {history.length} events
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black shrink-0 ${
                        log.operation === 'ENQUEUE' || log.operation === 'PUSH'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : log.operation === 'DEQUEUE' || log.operation === 'POP'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : log.operation === 'PEEK' || log.operation === 'PEEK_FRONT' || log.operation === 'PEEK_REAR'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {log.operation}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">
                      {log.message}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    [{log.stackSnapshot.join(',') || 'Ø'}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
