import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowDown,
  X,
  Play,
  HelpCircle,
  Eye,
  AlertTriangle,
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import { GuidedSolveStep, GameLevelConfig } from '../../types';
import { MASTER_GUIDED_STEPS, LEVEL_GUIDED_STEPS } from '../../data/guidedSolveData';
import { GAME_LEVELS } from '../../data/gameData';
import { soundEffects } from '../../services/sound';

interface GuidedSolveModalProps {
  isOpen: boolean;
  level?: GameLevelConfig;
  levelId?: number;
  onClose: () => void;
  onTryLevel: (levelId: number) => void;
  onBackToLevels?: () => void;
}

export const GuidedSolveModal: React.FC<GuidedSolveModalProps> = ({
  isOpen,
  level,
  levelId,
  onClose,
  onTryLevel,
  onBackToLevels,
}) => {
  // Mode toggle: 'level-guide' (specific to active level) or 'master-guide' (10-step master DSA curriculum)
  const [guideMode, setGuideMode] = useState<'level-guide' | 'master-guide'>('level-guide');

  // Step indices
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Safely resolve the level object
  const resolvedLevel: GameLevelConfig =
    level ||
    GAME_LEVELS.find((l) => l.id === levelId) ||
    GAME_LEVELS[0];

  // Active step set
  const levelSteps = LEVEL_GUIDED_STEPS[resolvedLevel.id] || MASTER_GUIDED_STEPS;
  const activeSteps: GuidedSolveStep[] = guideMode === 'master-guide' ? MASTER_GUIDED_STEPS : levelSteps;
  const currentStep: GuidedSolveStep = activeSteps[currentStepIndex] || activeSteps[0];
  const totalSteps = activeSteps.length;

  // Live interactive stack state for this step
  const [liveStack, setLiveStack] = useState<(number | string)[]>([]);
  const [capacity, setCapacity] = useState<number>(5);
  const [actionPerformed, setActionPerformed] = useState<boolean>(false);
  const [stepFeedback, setStepFeedback] = useState<{
    status: 'correct' | 'incorrect' | null;
    title: string;
    explanation: string;
    actionResult?: string;
  } | null>(null);

  // Selected multiple choice answer
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Progressive Hint Level (0: none, 1: Hint 1, 2: Hint 2, 3: Hint 3)
  const [hintStage, setHintStage] = useState<number>(0);

  // Display Output Animation State
  const [displayedItems, setDisplayedItems] = useState<(number | string)[]>([]);

  // Overflow / Underflow Animation Trigger
  const [warningAnimation, setWarningAnimation] = useState<'overflow' | 'underflow' | null>(null);

  // Completion State (Finished all steps in walkthrough)
  const [isWalkthroughComplete, setIsWalkthroughComplete] = useState<boolean>(false);

  // Initialize step whenever active step or modal changes
  const initStep = (step: GuidedSolveStep) => {
    if (!step) return;
    setLiveStack([...step.stackState.items]);
    setCapacity(step.stackState.capacity || 5);
    setActionPerformed(false);
    setStepFeedback(null);
    setSelectedChoiceId(null);
    setHintStage(0);
    setDisplayedItems([]);
    setWarningAnimation(null);
  };

    useEffect(() => {
    if (isOpen && currentStep) {
      initStep(currentStep);
      setIsWalkthroughComplete(false);
    }
  }, [isOpen, currentStepIndex, guideMode, resolvedLevel.id]);

  if (!isOpen) return null;

  // Active queue calculations
  const frontIndex = liveStack.length > 0 ? 0 : -1;
  const rearIndex = liveStack.length > 0 ? liveStack.length - 1 : -1;
  const frontVal = frontIndex >= 0 ? liveStack[frontIndex] : null;
  const rearVal = rearIndex >= 0 ? liveStack[rearIndex] : null;

  // =========================================================================
  // INTERACTION HANDLERS
  // =========================================================================

  // 1. Info Next (For explanation-only step)
  const handleInfoStepAcknowledge = () => {
    soundEffects.playClick();
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: currentStep.correctFeedback.actionResult,
    });
  };

  // 2. Click Push Interaction (e.g. Push 40)
  const handleClickPush = (val?: number | string) => {
    const valToPush = val !== undefined ? val : currentStep.pushValue || 40;

    if (liveStack.length >= capacity) {
      soundEffects.playError();
      setWarningAnimation('overflow');
      setStepFeedback({
        status: 'incorrect',
        title: 'Stack Overflow Detected!',
        explanation: `The stack has reached max capacity (${capacity}). You cannot push another element without overflow!`,
      });
      return;
    }

    soundEffects.playPush();
    const next = currentStep.postActionStack || [...liveStack, valToPush];
    setLiveStack(next);
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: currentStep.correctFeedback.actionResult || `Pushed [${valToPush}] onto TOP. Stack size = ${next.length}.`,
    });
  };

  // 3. Click Pop Interaction
  const handleClickPop = () => {
    if (liveStack.length === 0) {
      soundEffects.playError();
      setWarningAnimation('underflow');
      setStepFeedback({
        status: 'incorrect',
        title: 'Stack Underflow Detected!',
        explanation: 'The stack contains 0 elements. You cannot pop from an empty stack!',
      });
      return;
    }

    soundEffects.playPop();
    const popped = liveStack[liveStack.length - 1];
    const next = currentStep.postActionStack || liveStack.slice(0, -1);
    setLiveStack(next);
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: currentStep.correctFeedback.actionResult || `Popped [${popped}] from TOP. Remaining size = ${next.length}.`,
    });
  };

  // 4. Click Peek Interaction
  const handleClickPeek = () => {
    soundEffects.playClick();
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: `PEEK returned: [${frontVal}]. (Queue contents unchanged)`,
    });
  };

  // 5. Click Display Interaction
  const handleClickDisplay = () => {
    soundEffects.playSuccess();
    const itemsToDisplay = currentStep.displayOutput || [...liveStack].reverse();
    setDisplayedItems(itemsToDisplay);
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: `Printed order: ${itemsToDisplay.join(' → ')}`,
    });
  };

  // 6. Choice Selection (MCQ / Yes-No)
  const handleSelectChoice = (choiceId: string) => {
    setSelectedChoiceId(choiceId);
    soundEffects.playClick();

    if (currentStep.interactionType === 'yes-no') {
      const isCorrect = choiceId === (currentStep.correctChoiceId || 'yes');
      if (isCorrect) {
        soundEffects.playSuccess();
        setActionPerformed(true);
        setStepFeedback({
          status: 'correct',
          title: currentStep.correctFeedback.title,
          explanation: currentStep.correctFeedback.explanation,
          actionResult: currentStep.correctFeedback.actionResult,
        });
      } else {
        soundEffects.playError();
        setStepFeedback({
          status: 'incorrect',
          title: '✗ NOT QUITE',
          explanation:
            currentStep.incorrectFeedback?.explanation ||
            'Look closely at the number of elements and the TOP pointer index before deciding.',
        });
      }
      return;
    }

    const choiceObj = currentStep.choices?.find((c) => c.id === choiceId);
    if (choiceObj?.isCorrect) {
      soundEffects.playSuccess();
      if (currentStep.postActionStack) {
        setLiveStack(currentStep.postActionStack);
      }
      setActionPerformed(true);
      setStepFeedback({
        status: 'correct',
        title: currentStep.correctFeedback.title,
        explanation: choiceObj.feedback || currentStep.correctFeedback.explanation,
        actionResult: currentStep.correctFeedback.actionResult,
      });
    } else {
      soundEffects.playError();
      setStepFeedback({
        status: 'incorrect',
        title: '✗ NOT QUITE',
        explanation:
          choiceObj?.feedback ||
          'Not quite. Remember: Stacks strictly follow LIFO (Last In, First Out). Only the topmost item is accessed directly.',
      });
    }
  };

  // 7. Overflow Attempt Action
  const handleOverflowAttempt = () => {
    soundEffects.playError();
    setWarningAnimation('overflow');
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: currentStep.correctFeedback.actionResult,
    });
  };

  // 8. Underflow Attempt Action
  const handleUnderflowAttempt = () => {
    soundEffects.playError();
    setWarningAnimation('underflow');
    setActionPerformed(true);
    setStepFeedback({
      status: 'correct',
      title: currentStep.correctFeedback.title,
      explanation: currentStep.correctFeedback.explanation,
      actionResult: currentStep.correctFeedback.actionResult,
    });
  };

  // 9. Advance to Next Step
  const handleNextStep = () => {
    soundEffects.playClick();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      soundEffects.playSuccess();
      setIsWalkthroughComplete(true);
    }
  };

  // 10. Go back to Previous Step
  const handlePrevStep = () => {
    soundEffects.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // 11. Cycle Progressive Hint
  const handleCycleHint = () => {
    soundEffects.playClick();
    setHintStage((prev) => (prev < 3 ? prev + 1 : 1));
  };

  // =========================================================================
  // RENDER COMPLETE CELEBRATION VIEW
  // =========================================================================
  if (isWalkthroughComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-6"
        >
          {/* Header Icon */}
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Guidance Complete
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ✓ GUIDED SOLVE COMPLETE!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              You now understand how this Queue challenge operates step-by-step. Now apply what you learned and solve it
              independently!
            </p>
          </div>

          {/* Quick Recap Box */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 text-left space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Key Takeaways:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-400">
              <li>Queues strictly follow <strong>FIFO</strong> (First In, First Out).</li>
              <li>Removals occur at <strong>FRONT</strong>, new arrivals join at <strong>REAR</strong>.</li>
              <li><strong>PEEK</strong> inspects the FRONT element without altering the queue.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
                onTryLevel(resolvedLevel.id);
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>TRY THIS LEVEL</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
                if (onBackToLevels) onBackToLevels();
              }}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← BACK TO LEVELS</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // MAIN GUIDED SOLVE INTERACTIVE SCREEN
  // =========================================================================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 my-6 transition-all animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── 1. TOP HEADER & PROGRESS BAR ─── */}
        <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  💡 GUIDED SOLVE MODE
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  Let's solve this step by step.
                </span>
              </div>
            </div>

            {/* Exit Guided Solve Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              title="Exit Guided Solve"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Guided Solve</span>
            </button>
          </div>

          {/* Guide Mode Tabs (Level Specific vs. Master 10-Step Guide) */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                soundEffects.playClick();
                setGuideMode('level-guide');
                setCurrentStepIndex(0);
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                guideMode === 'level-guide'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Level 0{resolvedLevel.levelNumber || resolvedLevel.id} Guide
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setGuideMode('master-guide');
                setCurrentStepIndex(0);
              }}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                guideMode === 'master-guide'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              10-Step Master Guide
            </button>

            <span className="ml-auto font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              STEP {currentStepIndex + 1} / {totalSteps}
            </span>
          </div>

          {/* Dynamic Progress Indicator (● ━ ● ━ ● ━ ○ ━ ○) */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto py-1">
            {activeSteps.map((_, idx) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setCurrentStepIndex(idx);
                  }}
                  className={`w-3.5 h-3.5 rounded-full transition-all flex items-center justify-center text-[8px] font-bold cursor-pointer ${
                    idx === currentStepIndex
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/60 scale-110'
                      : idx < currentStepIndex
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                  title={`Step ${idx + 1}`}
                >
                  {idx < currentStepIndex ? '✓' : ''}
                </button>
                {idx < activeSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 min-w-[12px] transition-colors ${
                      idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── 2. STEP TITLE & CONCEPT BADGE ─── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {currentStep.conceptBadge || 'STACK CONCEPT'}
            </span>
            {currentStep.subtitle && (
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {currentStep.subtitle}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {currentStep.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {currentStep.explanation}
          </p>
        </div>

        {/* ─── 3. HORIZONTAL QUEUE PIPELINE VISUALIZATION ─── */}
        <div className="space-y-3 bg-slate-50/80 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Header Row with Boundary Indicators */}
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
              ← FRONT (Exit / Dequeue)
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              REAR (Entry / Enqueue) →
            </span>
          </div>

          {/* Horizontal Conveyor Pipeline */}
          <div className="grid grid-cols-5 gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 min-h-[72px] items-center">
            {Array.from({ length: capacity }).map((_, slotIdx) => {
              const itemVal = liveStack[slotIdx];
              const isOccupied = slotIdx < liveStack.length;
              const isFrontSlot = isOccupied && slotIdx === 0;
              const isRearSlot = isOccupied && slotIdx === rearIndex;

              return (
                <div
                  key={slotIdx}
                  className={`h-14 rounded-xl border flex flex-col items-center justify-center p-1 font-mono transition-all ${
                    isFrontSlot
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300 dark:ring-blue-800 scale-102'
                      : isRearSlot
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-800 scale-102'
                      : isOccupied
                      ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border-blue-300 dark:border-blue-800'
                      : 'border-dashed border-slate-300 dark:border-slate-700/60 bg-transparent text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-sans opacity-70">[{slotIdx}]</span>
                  <span className="text-sm font-black">{isOccupied ? itemVal : '·'}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    {isFrontSlot && isRearSlot ? 'FRONT/REAR' : isFrontSlot ? 'FRONT' : isRearSlot ? 'REAR' : isOccupied ? '' : 'FREE'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Attributes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Size / Cap</span>
              <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200">
                {liveStack.length} / {capacity}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">isEmpty</span>
              <span
                className={`text-xs font-black font-mono ${
                  liveStack.length === 0 ? 'text-emerald-500' : 'text-slate-400'
                }`}
              >
                {liveStack.length === 0 ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Active FRONT</span>
              <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400">
                {frontVal !== null ? frontVal : 'None (-1)'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Active REAR</span>
              <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400">
                {rearVal !== null ? rearVal : 'None (-1)'}
              </span>
            </div>
          </div>

          {/* Warning Animation Banner */}
          {warningAnimation && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                {warningAnimation === 'overflow'
                  ? '⚠️ OVERFLOW: Cannot Enqueue into full queue!'
                  : '⚠️ UNDERFLOW: Cannot Dequeue from empty queue!'}
              </span>
            </div>
          )}
        </div>

        {/* ─── 4. INTERACTIVE CHALLENGE / ACTION AREA ─── */}
        <div className="space-y-2.5">
          {currentStep.questionPrompt && (
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{currentStep.questionPrompt}</span>
            </div>
          )}

          {/* 4a. Multiple Choice Options */}
          {currentStep.interactionType === 'select-choice' && currentStep.choices && (
            <div className="grid grid-cols-1 gap-2">
              {currentStep.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelectChoice(choice.id)}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? choice.isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-400 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-300'
                          : 'bg-rose-50 dark:bg-rose-950 border-rose-400 text-rose-900 dark:text-rose-100 ring-2 ring-rose-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{choice.label}</span>
                    {isSelected && choice.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isSelected && !choice.isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 4b. Yes / No Decision Buttons */}
          {currentStep.interactionType === 'yes-no' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSelectChoice('yes')}
                className="py-3 px-4 rounded-xl font-black text-xs uppercase bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer active:scale-95"
              >
                [ YES ]
              </button>
              <button
                onClick={() => handleSelectChoice('no')}
                className="py-3 px-4 rounded-xl font-black text-xs uppercase bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer active:scale-95"
              >
                [ NO ]
              </button>
            </div>
          )}

          {/* 4c. Interactive Enqueue Action */}
          {currentStep.interactionType === 'click-push' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleClickPush()}
                disabled={actionPerformed}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ArrowDown className="w-4 h-4" />
                <span>[ ENQUEUE {currentStep.pushValue || 'D'} AT REAR ]</span>
              </button>
            </div>
          )}

          {/* 4d. Interactive Dequeue Action */}
          {currentStep.interactionType === 'click-pop' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleClickPop()}
                disabled={actionPerformed}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
                <span>[ DEQUEUE FRONT {frontVal !== null ? `(${frontVal})` : ''} ]</span>
              </button>
            </div>
          )}

          {/* 4e. Interactive Peek Action */}
          {currentStep.interactionType === 'click-peek' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleClickPeek()}
                disabled={actionPerformed}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>[ PEEK FRONT ELEMENT ]</span>
              </button>
            </div>
          )}

          {/* 4f. Interactive Display Action */}
          {currentStep.interactionType === 'click-display' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleClickDisplay()}
                disabled={actionPerformed}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>[ DISPLAY QUEUE ]</span>
              </button>
            </div>
          )}

          {/* 4g. Overflow Attempt Action */}
          {currentStep.interactionType === 'overflow-action' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleOverflowAttempt()}
                disabled={actionPerformed}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>[ ATTEMPT ENQUEUE F (TEST OVERFLOW) ]</span>
              </button>
            </div>
          )}

          {/* 4h. Underflow Attempt Action */}
          {currentStep.interactionType === 'underflow-action' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleUnderflowAttempt()}
                disabled={actionPerformed}
                className="flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>[ ATTEMPT DEQUEUE EMPTY QUEUE (TEST UNDERFLOW) ]</span>
              </button>
            </div>
          )}

          {/* 4i. Information Step Acknowledge */}
          {currentStep.interactionType === 'info-next' && !actionPerformed && (
            <button
              onClick={() => handleInfoStepAcknowledge()}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs"
            >
              I Understand → Continue
            </button>
          )}
        </div>

        {/* ─── 5. FEEDBACK BANNER (CORRECT / INCORRECT) ─── */}
        {stepFeedback && (
          <div
            className={`p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-all animate-in fade-in duration-150 ${
              stepFeedback.status === 'correct'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : 'bg-rose-50/80 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {stepFeedback.status === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-black block">{stepFeedback.title}</span>
                <p className="text-xs leading-relaxed opacity-90">{stepFeedback.explanation}</p>
                {stepFeedback.actionResult && (
                  <span className="text-[11px] font-mono font-bold block pt-1 opacity-80">
                    {stepFeedback.actionResult}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── 6. PROGRESSIVE HINTS BOX ─── */}
        {hintStage > 0 && currentStep.hints && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-150 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>HINT STAGE {hintStage} / 3:</span>
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400">
                {hintStage === 1 ? 'Concept' : hintStage === 2 ? 'Direction' : 'Strong Clue'}
              </span>
            </div>
            <p className="text-[11px] leading-snug">
              {currentStep.hints[hintStage - 1] || currentStep.hints[0]}
            </p>
          </div>
        )}

        {/* ─── 7. BOTTOM CONTROLS (HINT, PREV, NEXT STEP) ─── */}
        <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          {/* Progressive Hint Button */}
          <button
            onClick={handleCycleHint}
            className="px-3 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 fill-amber-500" />
            <span>{hintStage === 0 ? '💡 HINT' : `HINT (${hintStage}/3)`}</span>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevStep}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={handleNextStep}
              disabled={!actionPerformed && currentStep.interactionType !== 'info-next'}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold uppercase transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{currentStepIndex === totalSteps - 1 ? 'FINISH GUIDED SOLVE' : 'NEXT STEP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
