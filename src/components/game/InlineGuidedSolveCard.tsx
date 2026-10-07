import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GameChallenge, GameLevelConfig } from '../../types';
import { soundEffects } from '../../services/sound';

export interface InlineGuidedSolveCardProps {
  challenge: GameChallenge;
  level: GameLevelConfig;
  currentQueue: (string | number)[];
  onClose: () => void;
  onFinish: () => void;
  onUpdateQueuePreview?: (previewQueue: (string | number)[]) => void;
}

interface StepData {
  stepNumber: number;
  totalSteps: number;
  actionPill: string;
  operationBadge: string;
  frontOrTopBadge: string;
  countBadge: string;
  actionIntentTitle: string;
  actionIntentBody: string;
  resultTitle: string;
  resultBody: string;
  conceptText: string;
  resultingQueue: (string | number)[];
}

export const InlineGuidedSolveCard: React.FC<InlineGuidedSolveCardProps> = ({
  challenge,
  level,
  currentQueue,
  onClose,
  onFinish,
  onUpdateQueuePreview,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const capacity = challenge.capacity || 5;
  const initial = challenge.initialStack || [];
  const target = challenge.targetStack || [];
  const targetVal = challenge.targetValue !== undefined ? challenge.targetValue : challenge.availableElements?.[0] || 'X';

  const isStack =
    (level.title && level.title.toLowerCase().includes('stack')) ||
    challenge.mode === 'pop' ||
    challenge.mode === 'push';
  const structureName = isStack ? 'stack' : 'queue';

  // Construct steps based on challenge characteristics
  const steps: StepData[] = React.useMemo(() => {
    switch (challenge.mode) {
      case 'pop': {
        const removed = initial.length > 0 ? initial[initial.length - 1] : targetVal;
        const nextQueue = target.length > 0 ? [...target] : initial.slice(0, -1);
        const newTop = nextQueue.length > 0 ? nextQueue[nextQueue.length - 1] : 'EMPTY';
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ POP ${removed}`,
            operationBadge: `POP ${removed}`,
            frontOrTopBadge: `TOP: ${newTop}`,
            countBadge: `${nextQueue.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Now we need to remove the TOP element. The POP operation always removes the element at TOP. The current TOP is ${removed}.`,
            resultTitle: '2. REAL STACK RESULT',
            resultBody: `${removed} has been removed. ${newTop} is now the TOP element.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'This demonstrates LIFO: Last In, First Out. Only the element at the top can be accessed or removed directly.',
            resultingQueue: nextQueue,
          },
        ];
      }

      case 'push': {
        const nextQueue = target.length > 0 ? [...target] : [...initial, targetVal];
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ PUSH ${targetVal}`,
            operationBadge: `PUSH ${targetVal}`,
            frontOrTopBadge: `TOP: ${targetVal}`,
            countBadge: `${nextQueue.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Now we need to add the new element to the TOP. The PUSH operation always inserts the arriving element at TOP. We are pushing [${targetVal}].`,
            resultTitle: '2. REAL STACK RESULT',
            resultBody: `[${targetVal}] has been pushed onto TOP. [${targetVal}] is now the TOP element.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'This demonstrates LIFO: Last In, First Out. New elements are pushed onto the top of the stack.',
            resultingQueue: nextQueue,
          },
        ];
      }

      case 'enqueue': {
        const nextQueue = target.length > 0 ? [...target] : [...initial, targetVal];
        const prevFront = initial.length > 0 ? initial[0] : targetVal;
        const newRear = targetVal;
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ ENQUEUE ${targetVal}`,
            operationBadge: `ENQUEUE ${targetVal}`,
            frontOrTopBadge: `FRONT: ${prevFront}`,
            countBadge: `${nextQueue.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Now we need to add the new element to the REAR. The ENQUEUE operation always inserts the arriving element at the REAR pointer. We are enqueuing [${targetVal}].`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `[${targetVal}] has been enqueued at REAR. FRONT remains [${prevFront}]. Queue size is now ${nextQueue.length} / ${capacity}.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'This demonstrates FIFO: First In, First Out. Arriving elements join at the back (REAR), while departures leave from the front (FRONT).',
            resultingQueue: nextQueue,
          },
        ];
      }

      case 'dequeue': {
        const removed = initial.length > 0 ? initial[0] : 'ELEMENT';
        const nextQueue = target.length > 0 ? [...target] : initial.slice(1);
        const newFront = nextQueue.length > 0 ? nextQueue[0] : 'EMPTY';
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ DEQUEUE ${removed}`,
            operationBadge: `DEQUEUE ${removed}`,
            frontOrTopBadge: `FRONT: ${newFront}`,
            countBadge: `${nextQueue.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Now we need to remove the FRONT element. The DEQUEUE operation always removes the earliest arrival currently at FRONT. The current FRONT is [${removed}].`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `[${removed}] has been removed. [${newFront}] is now the FRONT element. Queue size is now ${nextQueue.length} / ${capacity}.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'This demonstrates FIFO: First In, First Out. Only the element at the FRONT can be accessed or removed directly.',
            resultingQueue: nextQueue,
          },
        ];
      }

      case 'peek':
      case 'identify_front': {
        const frontVal = initial.length > 0 ? initial[0] : targetVal;
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ PEEK FRONT [${frontVal}]`,
            operationBadge: `FRONT: ${frontVal}`,
            frontOrTopBadge: `FRONT: ${frontVal}`,
            countBadge: `${initial.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Now we need to inspect the FRONT element. Under FIFO, the earliest arrival always sits at index 0 (FRONT pointer). The current FRONT is [${frontVal}].`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `Survivor [${frontVal}] is confirmed at the FRONT pointer. Queue contents remain unchanged (${initial.length} items).`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'PEEK provides O(1) constant-time access to inspect the next element to be served without modifying the queue.',
            resultingQueue: [...initial],
          },
        ];
      }

      case 'identify_rear': {
        const rearVal = initial.length > 0 ? initial[initial.length - 1] : targetVal;
        const frontVal = initial.length > 0 ? initial[0] : rearVal;
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ IDENTIFY REAR [${rearVal}]`,
            operationBadge: `REAR: ${rearVal}`,
            frontOrTopBadge: `FRONT: ${frontVal}`,
            countBadge: `${initial.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Now we need to identify where new elements enter. In a Queue, arrivals always enter at the REAR pointer. The newest arrival is [${rearVal}].`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `Survivor [${rearVal}] is identified at the REAR pointer (index [${Math.max(0, initial.length - 1)}]).`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'The REAR pointer tracks the newest addition, ensuring subsequent elements preserve chronological order.',
            resultingQueue: [...initial],
          },
        ];
      }

      case 'overflow': {
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ TEST OVERFLOW GUARD`,
            operationBadge: `OVERFLOW TEST`,
            frontOrTopBadge: `CAPACITY: ${capacity}`,
            countBadge: `${initial.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `The queue has reached maximum capacity (${capacity}/${capacity}). We attempt to enqueue another element to verify the boundary guardrail.`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `QueueOverflowException caught safely! No memory overwrite occurred; buffer invariants are preserved.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'Boundary guardrails like isFull() prevent buffer overruns and protect program memory from corruption.',
            resultingQueue: [...initial],
          },
        ];
      }

      case 'underflow': {
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ TEST UNDERFLOW GUARD`,
            operationBadge: `UNDERFLOW TEST`,
            frontOrTopBadge: `FRONT: NONE`,
            countBadge: `0 / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `The queue is empty (0 elements). We attempt to DEQUEUE from the empty line to verify the defensive underflow guardrail.`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `QueueUnderflowException caught safely! The system defends against reading or removing from an empty container.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'isEmpty() defensive checks prevent null-pointer dereferences and runtime crashes when containers are empty.',
            resultingQueue: [],
          },
        ];
      }

      case 'choice':
      default: {
        const correctChoice = challenge.choices?.find((c) => c.isCorrect);
        const correctLabel = correctChoice ? correctChoice.label : String(targetVal);
        const frontVal = initial.length > 0 ? initial[0] : 'NONE';
        return [
          {
            stepNumber: 1,
            totalSteps: 1,
            actionPill: `→ ANALYZE PRINCIPLES`,
            operationBadge: `CORRECT ANSWER`,
            frontOrTopBadge: `FRONT: ${frontVal}`,
            countBadge: `${initial.length} / ${capacity}`,
            actionIntentTitle: '1. ACTION & INTENT',
            actionIntentBody: `Analyze the core question: "${challenge.question}". We apply foundational FIFO rules.`,
            resultTitle: '2. REAL QUEUE RESULT',
            resultBody: `The correct answer is: "${correctLabel}". Verified against Queue invariants.`,
            conceptText:
              challenge.feedback?.lifoReason ||
              'Queues enforce strict FIFO (First In, First Out) order across all operations.',
            resultingQueue: target.length > 0 ? [...target] : [...initial],
          },
        ];
      }
    }
  }, [challenge, capacity, initial, target, targetVal]);

  const activeStep = steps[currentStepIndex] || steps[0];

  // Whenever step changes, update the real queue preview below
  useEffect(() => {
    if (onUpdateQueuePreview && activeStep) {
      onUpdateQueuePreview(activeStep.resultingQueue);
    }
  }, [activeStep, onUpdateQueuePreview]);

  const handleNextOrFinish = () => {
    soundEffects.playSuccess();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrevStep = () => {
    soundEffects.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="rounded-3xl border-2 border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in zoom-in-98 duration-200">
      {/* ─── 1. TOP HEADER & CONTROLS ─── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lightbulb className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
                GUIDED SOLVE
              </span>
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 uppercase tracking-wider">
                INTERACTIVE WALKTHROUGH
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              The game automatically performs each operation on the real {structureName}
            </p>
          </div>
        </div>

        {/* Right side: Step badge and Exit button */}
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-700">
            STEP {activeStep.stepNumber} / {activeStep.totalSteps}
          </span>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
            title="Exit Guided Solve"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* ─── 2. ACTIVE STEP OPERATION BUTTON ─── */}
      <div className="pt-1">
        <span className="bg-amber-50 dark:bg-amber-950/60 border border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-200 font-black text-xs px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 shadow-2xs">
          {activeStep.actionPill}
        </span>
      </div>

      {/* ─── 3. OPERATION BADGES ROW ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-purple-600 text-white font-black text-xs px-3 py-1 rounded-xl shadow-xs">
          {activeStep.operationBadge}
        </span>
        <span className="bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs px-2.5 py-1 rounded-xl border border-blue-100 dark:border-slate-700">
          {activeStep.frontOrTopBadge}
        </span>
        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs px-2.5 py-1 rounded-xl flex items-center gap-1">
          <Layers className="w-3 h-3 text-slate-500" />
          <span>{activeStep.countBadge}</span>
        </span>
      </div>

      {/* ─── 4. TWO SIDE-BY-SIDE CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Action & Intent */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 shrink-0" />
            <span>{activeStep.actionIntentTitle}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
            {activeStep.actionIntentBody}
          </p>
        </div>

        {/* Card 2: Real Queue Result */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{activeStep.resultTitle}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
            {activeStep.resultBody}
          </p>
        </div>
      </div>

      {/* ─── 5. CONCEPT CALLOUT BANNER ─── */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 sm:p-4 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5 leading-relaxed">
        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p>
          <span className="font-black text-amber-950 dark:text-amber-100 mr-1.5">
            CONCEPT:
          </span>
          {activeStep.conceptText}
        </p>
      </div>

      {/* ─── 6. BOTTOM CONTROLS & STATUS ─── */}
      <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>
            Operation executed on real {structureName} below. Click FINISH to proceed.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentStepIndex > 0 && (
            <button
              onClick={handlePrevStep}
              className="px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          <button
            onClick={handleNextOrFinish}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm uppercase shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span>
              {currentStepIndex === steps.length - 1 ? 'FINISH' : 'NEXT STEP'}
            </span>
            <span>→</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
