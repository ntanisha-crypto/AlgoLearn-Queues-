import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GameLevelConfig, GameChallenge, UserProgress } from '../../types';
import { GAME_LEVELS } from '../../data/gameData';
import { GAME_CATALOG, GameMetaData } from '../../data/gameMeta';
import { QueueVisualizer } from '../common/QueueVisualizer';
import { soundEffects } from '../../services/sound';
import { awardXP } from '../../services/storage';

// Modular Game Components
import { GameHub } from '../game/GameHub';
import { GamePreviewModal } from '../game/GamePreviewModal';
import { GameHeader } from '../game/GameHeader';
import { QuestionCard } from '../game/QuestionCard';
import { AvailableElementsPalette } from '../game/AvailableElementsPalette';
import { GameFeedbackCard } from '../game/GameFeedbackCard';
import { DequeueZone } from '../game/DequeueZone';
import { LevelCompleteModal } from '../game/LevelCompleteModal';
import { InGameLab } from '../game/InGameLab';
import { GuidedSolveModal } from '../game/GuidedSolveModal';
import { LevelMultiQueueInteractive } from '../game/LevelMultiQueueInteractive';
import { LevelCircularInteractive } from '../game/LevelCircularInteractive';
import { LevelSpeedQueueInteractive } from '../game/LevelSpeedQueueInteractive';
import { InteractiveTraceSimulator } from '../game/InteractiveTraceSimulator';
import {
  ArrowRight,
  ArrowDownToLine,
  ArrowUpRight,
  Eye,
  AlertTriangle,
  Flame,
  Clock,
  Play,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Zap,
  Radio,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameViewProps {
  progress: UserProgress;
  activeLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onUpdateProgress: (updated: UserProgress) => void;
}

export const GameView: React.FC<GameViewProps> = ({
  progress,
  activeLevelId,
  onSelectLevel,
  onUpdateProgress,
}) => {
  // Navigation & View Mode: 'hub' (Game Hub), 'playing' (Active Gameplay), or 'lab' (In-Game Experiment Lab)
  const [viewMode, setViewMode] = useState<'hub' | 'playing' | 'lab'>('hub');
  const [selectedGameForPreview, setSelectedGameForPreview] = useState<GameMetaData | null>(null);
  const [isGuidedSolveOpen, setIsGuidedSolveOpen] = useState<boolean>(false);
  const [guidedSolveLevelId, setGuidedSolveLevelId] = useState<number>(activeLevelId);

  // Current active level configuration
  const currentLevel: GameLevelConfig =
    GAME_LEVELS.find((l) => l.id === activeLevelId) || GAME_LEVELS[0];

  // Challenge Index within the active level
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const challenges = currentLevel.challenges || [];
  const currentChallenge: GameChallenge =
    challenges[currentChallengeIndex] || challenges[0];

  const [levelCompletedModalOpen, setLevelCompletedModalOpen] = useState<boolean>(false);

  // Active Interactive Queue State
  const [activeQueue, setActiveQueue] = useState<(string | number)[]>([]);
  const [availableElements, setAvailableElements] = useState<(string | number)[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [selectedEnqueueValue, setSelectedEnqueueValue] = useState<string | number | null>(null);
  const [showLiveSandbox, setShowLiveSandbox] = useState<boolean>(false);
  const [isInteractiveArenaOpen, setIsInteractiveArenaOpen] = useState<boolean>(false);

  // Immediate Action Feedback State
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState<string>('');
  const [feedbackActionText, setFeedbackActionText] = useState<string>('');
  const [feedbackLifoReason, setFeedbackLifoReason] = useState<string>('');
  const [earnedXP, setEarnedXP] = useState<number>(0);

  // Level 4: Timed Queue Master State (30 seconds or untimed practice)
  const [timedRunning, setTimedRunning] = useState<boolean>(false);
  const [isUntimedMode, setIsUntimedMode] = useState<boolean>(false);
  const [timedSeconds, setTimedSeconds] = useState<number>(30);
  const [timedScore, setTimedScore] = useState<number>(0);
  const [timedCombo, setTimedCombo] = useState<number>(1);
  const [timedStep, setTimedStep] = useState<number>(0);

  // Initialize Challenge State
  const setupChallenge = useCallback((challenge: GameChallenge) => {
    if (!challenge) return;

    setActiveQueue(challenge.initialStack ? [...challenge.initialStack] : []);
    setAvailableElements(challenge.availableElements ? [...challenge.availableElements] : []);
    setFeedbackStatus(null);
    setFeedbackTitle('');
    setFeedbackActionText('');
    setFeedbackLifoReason('');
    setIsPeeking(false);
    setSelectedChoiceId(null);
    setSelectedEnqueueValue(null);
  }, []);

  // When active level or challenge changes, re-initialize
  useEffect(() => {
    if (currentChallenge) {
      setupChallenge(currentChallenge);
    }
  }, [activeLevelId, currentChallengeIndex, currentChallenge, setupChallenge]);

  // When switching levels, reset challenge index to 0
  const handleSelectLevel = (levelId: number) => {
    soundEffects.playClick();
    setCurrentChallengeIndex(0);
    setMistakes(0);
    onSelectLevel(levelId);
  };

  // Reset current challenge
  const handleResetChallenge = () => {
    soundEffects.playClick();
    setMistakes(0);
    if (currentChallenge) {
      setupChallenge(currentChallenge);
    }
  };

  // Global Reset Game
  const handleResetGame = () => {
    soundEffects.playClick();
    setCurrentChallengeIndex(0);
    setMistakes(0);
    if (challenges[0]) {
      setupChallenge(challenges[0]);
    }
  };

  // Level 4: 30-Second Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((currentLevel.id === 4 || currentLevel.type === 'speed') && timedRunning && timedSeconds > 0) {
      interval = setInterval(() => {
        setTimedSeconds((t) => {
          if (t <= 1) {
            setTimedRunning(false);
            if (timedStep >= 4 && !progress.completedGameLevels.includes(4)) {
              handleTriggerLevelComplete();
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentLevel.id, currentLevel.type, timedRunning, timedSeconds, timedStep]);

  // Trigger Level Complete Reward & Modal
  const handleTriggerLevelComplete = () => {
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }

    const { updated } = awardXP(
      progress,
      currentLevel.xpReward,
      `game_level_${currentLevel.id}_completed`,
      `Completed Level ${currentLevel.levelNumber || currentLevel.id}`,
      currentLevel.title
    );

    const completed = Array.from(new Set([...updated.completedGameLevels, currentLevel.id]));
    onUpdateProgress({
      ...updated,
      completedGameLevels: completed,
    });

    setLevelCompletedModalOpen(true);
  };

  // Advance to Next Challenge or Trigger Level Complete
  const handleNextChallenge = () => {
    soundEffects.playClick();
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex((prev) => prev + 1);
    } else {
      handleTriggerLevelComplete();
    }
  };

  // =========================================================================
  // QUEUE OPERATION HANDLERS
  // =========================================================================

  // 1. ENQUEUE OPERATION
  const handleEnqueue = (val: string | number, itemIndex?: number) => {
    const capacity = currentChallenge.capacity || 5;

    // Check for overflow
    if (activeQueue.length >= capacity) {
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle('🚨 Queue Overflow!');
      setFeedbackActionText(`Cannot enqueue [${val}] because the bunker is at maximum capacity (${capacity}/${capacity}).`);
      setFeedbackLifoReason(currentChallenge.feedback?.incorrectTip || 'The queue has reached its maximum capacity.');
      return;
    }

    const isTarget = currentChallenge.targetValue === undefined || String(currentChallenge.targetValue) === String(val);
    setSelectedEnqueueValue(val);

    if (isTarget) {
      soundEffects.playPush();
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.65 },
        });
      } catch {
        // Ignore
      }

      const nextQueue = currentChallenge.targetStack
        ? [...currentChallenge.targetStack]
        : [...activeQueue, val];
      setActiveQueue(nextQueue);

      // Remove from available elements palette
      setAvailableElements((prev) => {
        if (itemIndex !== undefined && itemIndex >= 0 && itemIndex < prev.length) {
          const copy = [...prev];
          copy.splice(itemIndex, 1);
          return copy;
        }
        const idx = prev.findIndex((el) => String(el) === String(val));
        if (idx === -1) return prev;
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      });

      const xpReward = currentChallenge.xpReward || 30;
      setEarnedXP(xpReward);
      const { updated } = awardXP(
        progress,
        xpReward,
        `challenge_${currentChallenge.id}_success`,
        `Completed ${currentChallenge.question}`,
        currentLevel.title
      );
      onUpdateProgress(updated);

      setFeedbackStatus('correct');
      setFeedbackTitle(currentChallenge.feedback.correctTitle);
      setFeedbackActionText(currentChallenge.feedback.correctActionText);
      setFeedbackLifoReason(currentChallenge.feedback.lifoReason);
    } else {
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle('Incorrect Enqueue Selection');
      setFeedbackActionText(`The algorithm requested survivor [${currentChallenge.targetValue}], but you selected [${val}].`);
      setFeedbackLifoReason(currentChallenge.feedback.incorrectTip);
    }
  };

  // Dynamic Dequeue Options based on active queue elements
  const dequeueCandidates = React.useMemo(() => {
    if (!activeQueue || activeQueue.length === 0) return [];

    const candidates: { value: string | number; positionText: string; isFront: boolean }[] = [];

    activeQueue.forEach((val, idx) => {
      candidates.push({
        value: val,
        positionText: `Waiting in line`,
        isFront: idx === 0,
      });
    });

    // If activeQueue only has 1 or 2 items, provide sensible options so there are always choices
    if (candidates.length < 3) {
      const extraPool = ['A', 'B', 'C', 'D', 'PKT-100', 'PKT-101'];
      for (const extra of extraPool) {
        if (candidates.length >= 3) break;
        if (!candidates.some((c) => String(c.value) === String(extra))) {
          candidates.push({
            value: extra,
            positionText: 'Outside queue',
            isFront: false,
          });
        }
      }
    }

    return candidates;
  }, [activeQueue]);

  // 2. DEQUEUE OPERATION
  const handleDequeue = (attemptedValue?: string | number) => {
    if (activeQueue.length === 0) {
      if (currentChallenge.mode === 'underflow') {
        handleUnderflowTrigger();
        return;
      }
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle('🚨 Queue Underflow!');
      setFeedbackActionText('Cannot remove an element because the bunker queue is empty (0 / 5).');
      setFeedbackLifoReason('There is no element at the FRONT to remove.');
      return;
    }

    const frontVal = activeQueue[0];
    const isTarget =
      attemptedValue === undefined ||
      String(attemptedValue) === String(frontVal);

    if (isTarget) {
      soundEffects.playPop();
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {
        // Ignore
      }

      const nextQueue = currentChallenge.targetStack
        ? [...currentChallenge.targetStack]
        : activeQueue.slice(1);
      setActiveQueue(nextQueue);

      const xpReward = currentChallenge.xpReward || 35;
      setEarnedXP(xpReward);
      const { updated } = awardXP(
        progress,
        xpReward,
        `challenge_${currentChallenge.id}_success`,
        `Completed ${currentChallenge.question}`,
        currentLevel.title
      );
      onUpdateProgress(updated);

      setFeedbackStatus('correct');
      setFeedbackTitle(currentChallenge.feedback.correctTitle);
      setFeedbackActionText(currentChallenge.feedback.correctActionText);
      setFeedbackLifoReason(currentChallenge.feedback.lifoReason);
    } else {
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle(`🚨 FIFO Violation: Cannot Dequeue [${attemptedValue}]`);
      setFeedbackActionText(
        `You selected survivor [${attemptedValue}], which is NOT at position 0 (FRONT). In a Queue, only the FRONT element [${frontVal}] is allowed to depart first.`
      );
      setFeedbackLifoReason(
        `First In, First Out (FIFO) invariant: elements must wait in line. Survivor [${attemptedValue}] cannot cut ahead of [${frontVal}].`
      );
    }
  };

  // 3. IDENTIFY FRONT OPERATION
  const handleIdentifyFront = (attemptedValue: string | number) => {
    if (activeQueue.length === 0) return;
    const frontVal = activeQueue[0];
    const isTarget = String(attemptedValue) === String(frontVal);

    if (isTarget) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}

      const xpReward = currentChallenge.xpReward || 35;
      setEarnedXP(xpReward);
      const { updated } = awardXP(
        progress,
        xpReward,
        `challenge_${currentChallenge.id}_success`,
        `Identified FRONT element [${frontVal}]`,
        currentLevel.title
      );
      onUpdateProgress(updated);

      setFeedbackStatus('correct');
      setFeedbackTitle(currentChallenge.feedback?.correctTitle || `Identified FRONT Element [${frontVal}]!`);
      setFeedbackActionText(
        currentChallenge.feedback?.correctActionText ||
          `Correct! Element [${frontVal}] stands at position [0] (FRONT pointer).`
      );
      setFeedbackLifoReason(
        currentChallenge.feedback?.lifoReason ||
          'In FIFO Queues, the FRONT pointer always points to index 0, the first element to arrive.'
      );
    } else {
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle('Incorrect FRONT Selection');
      setFeedbackActionText(
        `You selected [${attemptedValue}], but the element at the FRONT pointer (index 0) is [${frontVal}].`
      );
      setFeedbackLifoReason('The FRONT pointer always references the earliest arrival at position 0.');
    }
  };

  // 4. IDENTIFY REAR OPERATION
  const handleIdentifyRear = (attemptedValue: string | number) => {
    if (activeQueue.length === 0) return;
    const rearVal = activeQueue[activeQueue.length - 1];
    const isTarget = String(attemptedValue) === String(rearVal);

    if (isTarget) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch {}

      const xpReward = currentChallenge.xpReward || 35;
      setEarnedXP(xpReward);
      const { updated } = awardXP(
        progress,
        xpReward,
        `challenge_${currentChallenge.id}_success`,
        `Identified REAR element [${rearVal}]`,
        currentLevel.title
      );
      onUpdateProgress(updated);

      setFeedbackStatus('correct');
      setFeedbackTitle(currentChallenge.feedback?.correctTitle || `Identified REAR Element [${rearVal}]!`);
      setFeedbackActionText(
        currentChallenge.feedback?.correctActionText ||
          `Correct! Element [${rearVal}] stands at the REAR pointer (most recent arrival).`
      );
      setFeedbackLifoReason(
        currentChallenge.feedback?.lifoReason ||
          'In Queues, the REAR pointer always tracks the newest arrival at the end of the line.'
      );
    } else {
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle('Incorrect REAR Selection');
      setFeedbackActionText(
        `You selected [${attemptedValue}], but the element at the REAR pointer (last position) is [${rearVal}].`
      );
      setFeedbackLifoReason('The REAR pointer always tracks the newest arrival at the end of the line.');
    }
  };

  // 3. PEEK OPERATION
  const handlePeek = () => {
    if (activeQueue.length === 0) {
      soundEffects.playError();
      setMistakes((m) => m + 1);
      setFeedbackStatus('incorrect');
      setFeedbackTitle('Cannot PEEK Empty Queue');
      setFeedbackActionText('The queue is empty (0 / 5). No FRONT element exists to inspect.');
      setFeedbackLifoReason('PEEK requires at least one element at the FRONT.');
      return;
    }

    soundEffects.playSuccess();
    setIsPeeking(true);

    const xpReward = currentChallenge.xpReward || 40;
    setEarnedXP(xpReward);
    const { updated } = awardXP(
      progress,
      xpReward,
      `challenge_${currentChallenge.id}_success`,
      `Completed ${currentChallenge.question}`,
      currentLevel.title
    );
    onUpdateProgress(updated);

    setFeedbackStatus('correct');
    setFeedbackTitle(currentChallenge.feedback.correctTitle);
    setFeedbackActionText(currentChallenge.feedback.correctActionText);
    setFeedbackLifoReason(currentChallenge.feedback.lifoReason);
  };

  // 4. CHOICE SELECTION HANDLER
  const handleSelectChoice = (choice: { id: string; label: string; isCorrect: boolean; why?: string }) => {
    setSelectedChoiceId(choice.id);

    if (choice.isCorrect) {
      soundEffects.playSuccess();
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore
      }

      const xpReward = currentChallenge.xpReward || 35;
      setEarnedXP(xpReward);
      const { updated } = awardXP(
        progress,
        xpReward,
        `challenge_${currentChallenge.id}_success`,
        `Completed ${currentChallenge.question}`,
        currentLevel.title
      );
      onUpdateProgress(updated);

      setFeedbackStatus('correct');
      setFeedbackTitle(currentChallenge.feedback.correctTitle);
      setFeedbackActionText(currentChallenge.feedback.correctActionText);
      setFeedbackLifoReason(choice.why || currentChallenge.feedback.lifoReason);
    } else {
      soundEffects.playError();
      setMistakes((m) => m + 1);

      setFeedbackStatus('incorrect');
      setFeedbackTitle('Incorrect Selection');
      setFeedbackActionText(choice.why || 'That is not the correct queue behavior.');
      setFeedbackLifoReason(currentChallenge.feedback.incorrectTip);
    }
  };

  // 5. OVERFLOW TEST TRIGGER HANDLER
  const handleOverflowTrigger = () => {
    soundEffects.playError();
    try {
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.65 },
      });
    } catch {
      // Ignore
    }

    const xpReward = currentChallenge.xpReward || 50;
    setEarnedXP(xpReward);
    const { updated } = awardXP(
      progress,
      xpReward,
      `challenge_${currentChallenge.id}_success`,
      `Tested Overflow Exception`,
      currentLevel.title
    );
    onUpdateProgress(updated);

    setFeedbackStatus('correct');
    setFeedbackTitle(currentChallenge.feedback.correctTitle);
    setFeedbackActionText(currentChallenge.feedback.correctActionText);
    setFeedbackLifoReason(currentChallenge.feedback.lifoReason);
  };

  // 6. UNDERFLOW TEST TRIGGER HANDLER
  const handleUnderflowTrigger = () => {
    soundEffects.playError();
    try {
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.65 },
      });
    } catch {
      // Ignore
    }

    const xpReward = currentChallenge.xpReward || 35;
    setEarnedXP(xpReward);
    const { updated } = awardXP(
      progress,
      xpReward,
      `challenge_${currentChallenge.id}_success`,
      `Tested Underflow Exception`,
      currentLevel.title
    );
    onUpdateProgress(updated);

    setFeedbackStatus('correct');
    setFeedbackTitle(currentChallenge.feedback.correctTitle);
    setFeedbackActionText(currentChallenge.feedback.correctActionText);
    setFeedbackLifoReason(currentChallenge.feedback.lifoReason);
  };

  // 7. LEVEL 6 TIMED & UNTIMED RAPID-FIRE ACTIONS
  const handleTimedAction = (action: 'ENQUEUE' | 'DEQUEUE' | 'PEEK', value?: string | number) => {
    if (!timedRunning && !isUntimedMode) return;

    const activePrompt = challenges[timedStep] || challenges[0];

    if (activePrompt.mode === 'enqueue') {
      if (action === 'ENQUEUE' && String(value) === String(activePrompt.targetValue)) {
        soundEffects.playPush();
        setActiveQueue((prev) => [...prev, value!]);
        setTimedScore((s) => s + 100 * timedCombo);
        setTimedCombo((c) => Math.min(3, c + 1));

        if (timedStep < challenges.length - 1) {
          setTimedStep((s) => s + 1);
          setCurrentChallengeIndex((s) => s + 1);
        } else {
          setTimedRunning(false);
          setIsUntimedMode(false);
          handleTriggerLevelComplete();
        }
      } else {
        soundEffects.playError();
        setMistakes((m) => m + 1);
        setTimedCombo(1);
      }
    } else if (activePrompt.mode === 'dequeue') {
      if (action === 'DEQUEUE' && activeQueue.length > 0) {
        soundEffects.playPop();
        setActiveQueue((prev) => prev.slice(1));
        setTimedScore((s) => s + 100 * timedCombo);
        setTimedCombo((c) => Math.min(3, c + 1));

        if (timedStep < challenges.length - 1) {
          setTimedStep((s) => s + 1);
          setCurrentChallengeIndex((s) => s + 1);
        } else {
          setTimedRunning(false);
          setIsUntimedMode(false);
          handleTriggerLevelComplete();
        }
      } else {
        soundEffects.playError();
        setMistakes((m) => m + 1);
        setTimedCombo(1);
      }
    } else if (activePrompt.mode === 'peek') {
      if (action === 'PEEK' && activeQueue.length > 0) {
        soundEffects.playSuccess();
        setIsPeeking(true);
        setTimeout(() => setIsPeeking(false), 1200);
        setTimedScore((s) => s + 100 * timedCombo);
        setTimedCombo((c) => Math.min(3, c + 1));

        if (timedStep < challenges.length - 1) {
          setTimedStep((s) => s + 1);
          setCurrentChallengeIndex((s) => s + 1);
        } else {
          setTimedRunning(false);
          setIsUntimedMode(false);
          handleTriggerLevelComplete();
        }
      } else {
        soundEffects.playError();
        setMistakes((m) => m + 1);
        setTimedCombo(1);
      }
    }
  };

  const handleOpenGuidedSolve = (levelId?: number) => {
    soundEffects.playClick();
    setGuidedSolveLevelId(levelId || activeLevelId);
    setIsGuidedSolveOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: HUB
  // ─────────────────────────────────────────────────────────────────────────
  if (viewMode === 'hub') {
    return (
      <div className="w-full">
        {/* Interactive Guided Solve Modal */}
        <GuidedSolveModal
          isOpen={isGuidedSolveOpen}
          levelId={guidedSolveLevelId}
          onClose={() => setIsGuidedSolveOpen(false)}
          onTryLevel={(lvlId) => {
            setIsGuidedSolveOpen(false);
            handleSelectLevel(lvlId);
            setViewMode('playing');
          }}
        />

        <GameHub
          progress={progress}
          activeLevelId={activeLevelId}
          currentChallengeIndex={currentChallengeIndex}
          onOpenPreview={(game) => {
            setSelectedGameForPreview(game);
          }}
          onDirectContinue={(levelId) => {
            handleSelectLevel(levelId);
            setViewMode('playing');
          }}
          onOpenGuidedSolve={(levelId) => {
            handleOpenGuidedSolve(levelId);
          }}
          onOpenInGameLab={() => {
            soundEffects.playClick();
            setViewMode('lab');
          }}
          onUpdateProgress={onUpdateProgress}
        />

        <GamePreviewModal
          game={selectedGameForPreview}
          isOpen={selectedGameForPreview !== null}
          isCompleted={progress.completedGameLevels.includes(selectedGameForPreview?.id || -1)}
          isInProgress={
            selectedGameForPreview?.id === activeLevelId && currentChallengeIndex > 0
          }
          currentChallengeProgress={{
            current: currentChallengeIndex + 1,
            total: challenges.length,
          }}
          onClose={() => setSelectedGameForPreview(null)}
          onStartGame={(gameId) => {
            setSelectedGameForPreview(null);
            handleSelectLevel(gameId);
            setViewMode('playing');
          }}
          onOpenGuidedSolve={(gameId) => {
            setSelectedGameForPreview(null);
            handleOpenGuidedSolve(gameId);
          }}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: IN-GAME EXPERIMENT LAB
  // ─────────────────────────────────────────────────────────────────────────
  if (viewMode === 'lab') {
    return (
      <div className="w-full animate-in fade-in duration-200">
        <InGameLab
          progress={progress}
          onUpdateProgress={onUpdateProgress}
          onBackToGame={() => {
            soundEffects.playClick();
            setViewMode('hub');
          }}
          onSelectLevel={(levelId) => {
            handleSelectLevel(levelId);
            setViewMode('playing');
          }}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VIEW: PLAYING (ACTIVE QUEUE GAMEPLAY)
  // ─────────────────────────────────────────────────────────────────────────
  const frontValue = activeQueue.length > 0 ? activeQueue[0] : null;
  const rearValue = activeQueue.length > 0 ? activeQueue[activeQueue.length - 1] : null;

  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Interactive Guided Solve Modal */}
      <GuidedSolveModal
        isOpen={isGuidedSolveOpen}
        levelId={guidedSolveLevelId}
        onClose={() => setIsGuidedSolveOpen(false)}
        onTryLevel={(lvlId) => {
          setIsGuidedSolveOpen(false);
          handleSelectLevel(lvlId);
        }}
      />

      {/* Level Completed Celebration Modal */}
      <LevelCompleteModal
        isOpen={levelCompletedModalOpen}
        level={currentLevel}
        xpEarned={currentLevel.xpReward}
        mistakes={mistakes}
        hasNextLevel={activeLevelId < GAME_LEVELS.length}
        onNextLevel={() => {
          setLevelCompletedModalOpen(false);
          const nextLvlId = activeLevelId + 1;
          if (nextLvlId <= GAME_LEVELS.length) {
            handleSelectLevel(nextLvlId);
            setViewMode('playing');
          } else {
            setViewMode('hub');
          }
        }}
        onReplayLevel={() => {
          setLevelCompletedModalOpen(false);
          setCurrentChallengeIndex(0);
          setMistakes(0);
          if (currentLevel.challenges[0]) {
            setupChallenge(currentLevel.challenges[0]);
          }
        }}
        onClose={() => {
          setLevelCompletedModalOpen(false);
          setViewMode('hub');
        }}
      />

      {/* 1. Minimal Top Game Bar with Game Hub Return */}
      <GameHeader
        currentLevel={currentLevel}
        allLevels={GAME_LEVELS}
        currentChallengeIndex={currentChallengeIndex}
        totalChallenges={challenges.length}
        progress={progress}
        mistakes={mistakes}
        maxMistakes={3}
        isLabActive={viewMode === 'lab'}
        onOpenLab={() => {
          soundEffects.playClick();
          setViewMode('lab');
        }}
        onOpenGuidedSolve={() => handleOpenGuidedSolve(activeLevelId)}
        onSelectLevel={handleSelectLevel}
        onResetChallenge={handleResetChallenge}
        onResetGame={handleResetGame}
        onBackToHub={() => {
          soundEffects.playClick();
          setViewMode('hub');
        }}
      />

      {/* 2. Dominant, Highlighted Question Card */}
      {currentChallenge && (
        <QuestionCard
          challenge={currentChallenge}
          levelNumber={currentLevel.levelNumber || currentLevel.id}
          currentChallengeIndex={currentChallengeIndex}
          totalChallenges={challenges.length}
          onOpenGuidedSolve={() => handleOpenGuidedSolve(activeLevelId)}
        />
      )}

      {/* 3. Game Feedback Card (Displays "WHY DID THIS HAPPEN?" upon every operation) */}
      <GameFeedbackCard
        status={feedbackStatus}
        title={feedbackTitle}
        actionText={feedbackActionText}
        lifoReason={feedbackLifoReason}
        xpEarned={earnedXP}
        onNextChallenge={handleNextChallenge}
        onRetry={() => {
          setFeedbackStatus(null);
          if (currentChallenge) setupChallenge(currentChallenge);
        }}
        isLastChallenge={currentChallengeIndex === challenges.length - 1}
      />

      {/* 3.55 DEDICATED ADVANCED ARCHITECTURE LABS (LEVELS 2, 3, 4) - COLLAPSIBLE ARENA OPTION */}
      {(activeLevelId === 2 || activeLevelId === 3 || activeLevelId === 4) && (
        <div className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-blue-50/70 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-blue-950/40 p-3.5 sm:p-4 shadow-xs transition-all">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    INTERACTIVE ARENA
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                    {activeLevelId === 2
                      ? 'Execution Trace Simulator'
                      : activeLevelId === 3
                      ? 'Multi-Station & Ring Buffer Lab'
                      : 'Live High-Speed Traffic Engine'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {isInteractiveArenaOpen
                    ? 'Interactive Arena is open. Click button to close and focus on challenges.'
                    : 'Hands-on practice simulator available. Click button to open!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEffects.playClick();
                setIsInteractiveArenaOpen((prev) => !prev);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                isInteractiveArenaOpen
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 ring-2 ring-indigo-300 dark:ring-indigo-800'
              }`}
            >
              {isInteractiveArenaOpen ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Close Arena</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Open Interactive Arena</span>
                </>
              )}
            </button>
          </div>

          {/* Collapsible Arena Body */}
          {isInteractiveArenaOpen && (
            <div className="pt-4 border-t border-indigo-200/80 dark:border-indigo-800/60 mt-3 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
              {activeLevelId === 2 && currentChallenge && (
                <InteractiveTraceSimulator challengeId={currentChallenge.id} />
              )}

              {activeLevelId === 3 && (
                <div className="space-y-4">
                  {currentChallengeIndex < 3 ? (
                    <LevelMultiQueueInteractive
                      onNotifyAction={(actionText) => {
                        setFeedbackActionText(actionText);
                      }}
                      onScoreChange={(delta, lifeLost) => {
                        if (lifeLost) {
                          setMistakes((m) => m + 1);
                        } else {
                          setEarnedXP((xp) => xp + delta);
                        }
                      }}
                    />
                  ) : (
                    <LevelCircularInteractive
                      onNotifyAction={(actionText) => {
                        setFeedbackActionText(actionText);
                      }}
                    />
                  )}
                </div>
              )}

              {activeLevelId === 4 && (
                <LevelSpeedQueueInteractive
                  onNotifyAction={(actionText) => {
                    setFeedbackActionText(actionText);
                  }}
                  onScoreReward={(delta) => {
                    setEarnedXP((xp) => xp + delta);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. PRIMARY FIFO QUEUE VISUALIZER */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(e) => {
          const isChamberDrop = (e.target as HTMLElement)?.closest('#queue-drop-target');
          if (isChamberDrop) return;
          e.preventDefault();
          const raw = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed.type === 'DEQUEUE') {
                handleDequeue();
                return;
              }
              if (parsed.type === 'DEQUEUE_INVALID') {
                soundEffects.playError();
                setFeedbackStatus('incorrect');
                setFeedbackTitle('FIFO Restriction');
                setFeedbackActionText(`Cannot remove survivor [${parsed.value}]. Only the FRONT element may exit a Queue.`);
                setFeedbackLifoReason('In standard FIFO queues, items in the middle or rear must wait for front elements to be dequeued.');
                return;
              }
              if (parsed.type === 'ENQUEUE' || parsed.type === 'PUSH') {
                handleEnqueue(parsed.value, parsed.index);
                return;
              }
            } catch {
              if (currentChallenge?.mode === 'enqueue') {
                handleEnqueue(raw);
              }
            }
          }
        }}
        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[11px]">
              BUNKER QUEUE
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              FIFO: First In → First Out
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              FRONT: <strong className="text-blue-600 dark:text-blue-400">{frontValue !== null ? frontValue : 'None (-1)'}</strong>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              REAR: <strong className="text-indigo-600 dark:text-indigo-400">{rearValue !== null ? rearValue : 'None (-1)'}</strong>
            </span>
          </div>
        </div>

        <QueueVisualizer
          items={activeQueue}
          capacity={currentChallenge?.capacity || 5}
          bunkerLabel={activeLevelId === 4 ? '📡 TELECOM PACKET FIFO BUFFER (ROUTER CACHE)' : 'BUNKER QUEUE'}
          highlightFront={currentChallenge?.mode === 'dequeue' || currentChallenge?.mode === 'peek' || isPeeking}
          highlightRear={currentChallenge?.mode === 'enqueue'}
          peekValue={isPeeking ? frontValue : null}
          isPeekActive={isPeeking}
          overflowWarning={currentChallenge?.mode === 'overflow'}
          underflowWarning={currentChallenge?.mode === 'underflow'}
          onDropItem={(val) => handleEnqueue(val)}
          onDequeueFront={(val) => {
            if (currentChallenge?.mode === 'dequeue') {
              handleDequeue(val);
            } else {
              soundEffects.playClick();
            }
          }}
          onInvalidDequeueAttempt={(val) => {
            soundEffects.playError();
            setFeedbackStatus('incorrect');
            setFeedbackTitle('FIFO Restriction');
            setFeedbackActionText(`Cannot remove survivor [${val}]. Only the FRONT element may exit a Queue.`);
            setFeedbackLifoReason('In standard FIFO queues, items in the middle or rear must wait for front elements to be dequeued.');
          }}
          onElementClick={(val, index) => {
            soundEffects.playClick();
            if (currentChallenge?.mode === 'dequeue') {
              handleDequeue(val);
            } else if (currentChallenge?.mode === 'identify_front' || currentChallenge?.mode === 'peek') {
              handleIdentifyFront(val);
            } else if (currentChallenge?.mode === 'identify_rear') {
              handleIdentifyRear(val);
            }
          }}
          customEmptyMessage="Bunker Queue is Empty (0 / 5). No survivors in line."
        />
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE QUEUE CONTROLS BY MODE */}
      {/* ========================================================================= */}

      {/* MODE: ENQUEUE */}
      {currentChallenge?.mode === 'enqueue' && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-emerald-400/80 dark:border-emerald-600/80 shadow-md space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                INTERACTIVE DECISION
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Which element should be enqueued next at the REAR?
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select the correct incoming arrival in chronological sequence, or drag it into the queue:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {availableElements.map((el, idx) => {
              const isSelected = String(selectedEnqueueValue) === String(el);
              const isCorrectFeedback = feedbackStatus === 'correct' && isSelected;
              const isIncorrectFeedback = feedbackStatus === 'incorrect' && isSelected;

              return (
                <div
                  key={`${el}-${idx}`}
                  draggable={feedbackStatus !== 'correct'}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', String(el));
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'ENQUEUE', value: el, index: idx }));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    if (feedbackStatus !== 'correct') {
                      setSelectedEnqueueValue(el);
                      handleEnqueue(el, idx);
                    }
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none cursor-pointer active:scale-[0.99] ${
                    isCorrectFeedback
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-xs ring-2 ring-emerald-300 dark:ring-emerald-800'
                      : isIncorrectFeedback
                      ? 'bg-red-50 dark:bg-red-950/70 border-red-400 text-red-950 dark:text-red-100 ring-2 ring-red-300 dark:ring-red-800'
                      : 'bg-slate-50 hover:bg-emerald-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-900 dark:text-white shadow-2xs hover:shadow-xs'
                  }`}
                  title="Click to enqueue or drag into the queue chamber"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm flex items-center justify-center shrink-0">
                      {el}
                    </span>
                    <div className="text-left">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Enqueue [{el}]</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {activeLevelId === 4 ? `Network Packet [${el}]` : `Arriving Visitor [${el}]`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800">
                      Select →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE: DEQUEUE */}
      {currentChallenge?.mode === 'dequeue' && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                DEQUEUE FRONT OPERATION (DRAG OUT TO DELETE)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              Drag FRONT element out of the box into the Exit/Trash bay to delete, or click any option
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch pt-1">
            <DequeueZone
              frontElementValue={frontValue}
              onDequeueSuccess={(val) => handleDequeue(val)}
              onDequeueInvalid={(val) => {
                soundEffects.playError();
                setFeedbackStatus('incorrect');
                setFeedbackTitle('FIFO Restriction');
                setFeedbackActionText(`Cannot remove survivor [${val}]. Only the FRONT element may exit a Queue.`);
                setFeedbackLifoReason('Queue elements must wait their turn. Only position [0] exits.');
              }}
              isGuidedSolveActive={isGuidedSolveOpen}
              disabled={feedbackStatus === 'correct' || activeQueue.length === 0}
            />

            <div className="flex flex-col justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border-2 border-rose-300 dark:border-rose-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                    INTERACTIVE DECISION
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Which element should exit the queue next?
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which element has reached the FRONT to depart under FIFO, or drag it into the Exit Bay:
                </p>
              </div>

              {/* Dynamic Dequeue Candidate Options (Draggable & Clickable) */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {dequeueCandidates.map((candidate, cIdx) => (
                  <div
                    key={`${candidate.value}-${cIdx}`}
                    draggable={feedbackStatus !== 'correct' && activeQueue.length > 0}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(candidate.value));
                      e.dataTransfer.setData(
                        'application/json',
                        JSON.stringify({ type: 'DEQUEUE', value: candidate.value, isFront: candidate.isFront })
                      );
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onClick={() => handleDequeue(candidate.value)}
                    className={`w-full p-3 sm:p-3.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none cursor-grab active:cursor-grabbing active:scale-[0.99] ${
                      candidate.isFront
                        ? 'bg-white hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-700 hover:border-rose-400 text-slate-900 dark:text-white shadow-2xs hover:shadow-xs'
                        : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 shadow-2xs'
                    }`}
                    title="Click to dequeue or drag into the Exit Bay to delete"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono font-black text-sm flex items-center justify-center shrink-0">
                        {candidate.value}
                      </span>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Element [{candidate.value}]</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {activeLevelId === 4 ? `Network Payload [${candidate.value}]` : `Queue Element [${candidate.value}]`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] uppercase font-bold text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800">
                        Select / Drag →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE: IDENTIFY FRONT / PEEK */}
      {(currentChallenge?.mode === 'identify_front' || currentChallenge?.mode === 'peek') && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-rose-400/80 dark:border-rose-600/80 shadow-md space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                INTERACTIVE IDENTIFICATION
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Which element is currently at the FRONT pointer?
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click the element directly in the bunker visualizer above, or tap your selection below:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {dequeueCandidates.map((candidate, idx) => (
              <button
                key={`front-opt-${candidate.value}-${idx}`}
                onClick={() => handleIdentifyFront(candidate.value)}
                disabled={feedbackStatus === 'correct'}
                className="p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none cursor-pointer bg-slate-50 hover:bg-rose-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-400 text-slate-900 dark:text-white shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono font-black text-sm flex items-center justify-center shrink-0">
                    {candidate.value}
                  </span>
                  <div className="text-left">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Element [{candidate.value}]
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Candidate for FRONT pointer
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-100/70 dark:bg-rose-950 border border-rose-300 dark:border-rose-800">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODE: IDENTIFY REAR */}
      {currentChallenge?.mode === 'identify_rear' && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-emerald-400/80 dark:border-emerald-600/80 shadow-md space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                INTERACTIVE IDENTIFICATION
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Which element is currently at the REAR pointer?
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click the element directly in the bunker visualizer above, or tap your selection below:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {dequeueCandidates.map((candidate, idx) => (
              <button
                key={`rear-opt-${candidate.value}-${idx}`}
                onClick={() => handleIdentifyRear(candidate.value)}
                disabled={feedbackStatus === 'correct'}
                className="p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none cursor-pointer bg-slate-50 hover:bg-emerald-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-900 dark:text-white shadow-2xs hover:shadow-xs active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm flex items-center justify-center shrink-0">
                    {candidate.value}
                  </span>
                  <div className="text-left">
                    <div className="font-bold text-slate-900 dark:text-white">
                      Element [{candidate.value}]
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Candidate for REAR pointer
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800">
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}


      {/* MODE: MULTIPLE CHOICE (Level 1, Level 2, Level 3, Level 4) */}
      {currentChallenge?.choices && currentChallenge.choices.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border-2 border-blue-400/80 dark:border-blue-600/80 shadow-md space-y-4">
          {/* Dominant Highlighted Question Banner inside Choice section */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border-2 border-blue-300 dark:border-blue-700 flex items-start gap-3 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              ?
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-700 inline-block">
                QUESTION TO ANSWER:
              </span>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {currentChallenge.question}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              SELECT THE CORRECT ANSWER BELOW
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              Click an option OR drag &amp; drop it into the Answer Drop Zone
            </span>
          </div>

          {/* Interactive Answer Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData('application/json');
              if (raw) {
                try {
                  const choice = JSON.parse(raw);
                  handleSelectChoice(choice);
                } catch {
                  // ignore
                }
              }
            }}
            className="w-full p-3.5 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/40 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 select-none transition-colors hover:bg-blue-100/70 dark:hover:bg-blue-900/40 cursor-pointer"
          >
            <span className="text-base">🎯</span>
            <span>Drag and drop your chosen option here (or click any option below)</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {currentChallenge.choices.map((choice, idx) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrectFeedback = feedbackStatus === 'correct' && isSelected;
              const isIncorrectFeedback = feedbackStatus === 'incorrect' && isSelected;

              // Highlight bracketed values in choice label
              const parts = choice.label.split(/(\[[^\]]+\])/g);

              return (
                <div
                  key={choice.id || idx}
                  draggable={feedbackStatus !== 'correct'}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(choice));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => {
                    if (feedbackStatus !== 'correct') {
                      handleSelectChoice(choice);
                    }
                  }}
                  className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none cursor-pointer ${
                    isCorrectFeedback
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-xs ring-2 ring-emerald-300 dark:ring-emerald-800'
                      : isIncorrectFeedback
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-400 text-red-950 dark:text-red-100'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-800 dark:text-slate-200 hover:scale-[1.01]'
                  }`}
                  title="Click option or drag into Answer Drop Zone"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">
                      {parts.map((p, pIdx) => {
                        if (p.startsWith('[') && p.endsWith(']')) {
                          return (
                            <span
                              key={pIdx}
                              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-mono font-bold text-xs"
                            >
                              {p}
                            </span>
                          );
                        }
                        return p;
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal">
                      Click / Drag
                    </span>
                    {isCorrectFeedback && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isIncorrectFeedback && (
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE: OVERFLOW TEST (Level 1) */}
      {currentChallenge?.mode === 'overflow' && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-800/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>QUEUE OVERFLOW SIMULATION ZONE</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            The bunker queue is holding 4 survivors out of 4 capacity slots (100% full). Test the software exception guardrail.
          </p>

          <button
            onClick={handleOverflowTrigger}
            disabled={feedbackStatus === 'correct'}
            className="px-5 py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wide bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>ENQUEUE SURVIVOR [E] (TRIGGER & TEST OVERFLOW)</span>
          </button>
        </div>
      )}

      {/* MODE: UNDERFLOW TEST (Level 1) */}
      {currentChallenge?.mode === 'underflow' && (
        <div className="bg-red-50/70 dark:bg-red-950/30 p-4 sm:p-5 rounded-2xl border border-red-200 dark:border-red-800/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-900 dark:text-red-200 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>QUEUE UNDERFLOW SIMULATION ZONE</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            The bunker queue is completely empty (0 / 4 survivors). There is no element at the FRONT pointer to remove.
          </p>

          <button
            onClick={handleUnderflowTrigger}
            disabled={feedbackStatus === 'correct'}
            className="px-5 py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wide bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>DEQUEUE EMPTY QUEUE (TRIGGER & TEST UNDERFLOW)</span>
          </button>
        </div>
      )}
    </div>
  );
};
