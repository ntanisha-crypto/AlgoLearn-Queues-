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
import { LevelPedagogicalCard } from '../game/LevelPedagogicalCard';
import { LevelMultiQueueInteractive } from '../game/LevelMultiQueueInteractive';
import { LevelCircularInteractive } from '../game/LevelCircularInteractive';
import { LevelSpeedQueueInteractive } from '../game/LevelSpeedQueueInteractive';
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

  // 2. DEQUEUE OPERATION
  const handleDequeue = () => {
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

      {/* 2. Focused Question Card */}
      {currentChallenge && (
        <QuestionCard
          challenge={currentChallenge}
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

      {/* 3.5 INTERACTIVE PEDAGOGICAL BLUEPRINT (LEVELS 1 - 3) */}
      {currentChallenge && (
        <LevelPedagogicalCard
          levelId={activeLevelId}
          currentChallenge={currentChallenge}
          activeQueue={activeQueue}
          capacity={currentChallenge?.capacity || 5}
          isPeeking={isPeeking}
          frontValue={frontValue}
          rearValue={rearValue}
        />
      )}

      {/* 3.55 DEDICATED ADVANCED ARCHITECTURE LABS (LEVELS 3, 4) */}
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
        <div className="space-y-4">
          <LevelSpeedQueueInteractive
            onNotifyAction={(actionText) => {
              setFeedbackActionText(actionText);
            }}
            onScoreReward={(delta) => {
              setEarnedXP((xp) => xp + delta);
            }}
          />
        </div>
      )}

      {/* 4. PRIMARY FIFO QUEUE VISUALIZER */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          const isChamberDrop = (e.target as HTMLElement)?.closest('#queue-drop-target');
          if (isChamberDrop) return;
          e.preventDefault();
          const raw = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
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
            } catch {}
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
          highlightFront={currentChallenge?.mode === 'dequeue' || currentChallenge?.mode === 'peek' || isPeeking}
          highlightRear={currentChallenge?.mode === 'enqueue'}
          peekValue={isPeeking ? frontValue : null}
          isPeekActive={isPeeking}
          overflowWarning={currentChallenge?.mode === 'overflow'}
          underflowWarning={currentChallenge?.mode === 'underflow'}
          onDropItem={(val) => handleEnqueue(val)}
          onDequeueFront={() => {
            if (currentChallenge?.mode === 'dequeue') {
              handleDequeue();
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
            if (index === 0 && currentChallenge?.mode === 'dequeue') {
              handleDequeue();
            } else if (index === 0 && currentChallenge?.mode === 'peek') {
              handlePeek();
            } else if (index !== 0 && currentChallenge?.mode === 'dequeue') {
              soundEffects.playError();
              setFeedbackStatus('incorrect');
              setFeedbackTitle('FIFO Order Guard');
              setFeedbackActionText(`Survivor [${val}] is at position [${index}]. Only position [0] (FRONT) can exit.`);
              setFeedbackLifoReason('Queue removals strictly follow First In, First Out order.');
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
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowDownToLine className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  ENQUEUE REAR ARRIVALS
                </span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Click option or drag &amp; drop directly into the Bunker Queue above
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {availableElements.map((el, idx) => {
                const isTarget = currentChallenge.targetValue === undefined || String(currentChallenge.targetValue) === String(el);
                return (
                  <div
                    key={`${el}-${idx}`}
                    draggable={feedbackStatus !== 'correct'}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'ENQUEUE', value: el, index: idx }));
                      e.dataTransfer.effectAllowed = 'copy';
                    }}
                    onClick={() => {
                      if (feedbackStatus !== 'correct') {
                        handleEnqueue(el, idx);
                      }
                    }}
                    className={`px-5 py-3 rounded-xl font-mono font-black text-sm flex items-center gap-2 border-2 transition-all shadow-xs select-none ${
                      feedbackStatus === 'correct'
                        ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 cursor-not-allowed'
                        : isTarget
                        ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 hover:scale-102 cursor-grab active:cursor-grabbing'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing'
                    }`}
                    title="Click to enqueue or drag into the queue chamber"
                  >
                    <ArrowDownToLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>ENQUEUE [{el}] AT REAR</span>
                    <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 ml-1">
                      Drag / Click
                    </span>
                  </div>
                );
              })}
            </div>
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
              Drag FRONT element out of the box to delete, drop onto exit zone, or click button
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch pt-1">
            <DequeueZone
              frontElementValue={frontValue}
              onDequeueSuccess={() => handleDequeue()}
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

            <div className="flex flex-col justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Direct Dequeue Action
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {frontValue !== null
                    ? `Survivor [${frontValue}] is at position [0] (FRONT) and is ready for departure.`
                    : 'The queue is currently empty. Dequeue will cause Underflow.'}
                </p>
              </div>

              <button
                onClick={handleDequeue}
                disabled={feedbackStatus === 'correct' || activeQueue.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-mono font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-95 border-2 border-transparent ${
                  feedbackStatus === 'correct' || activeQueue.length === 0
                    ? 'opacity-40 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-500/20 hover:border-rose-300'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>DEQUEUE FRONT {frontValue !== null ? `[${frontValue}]` : ''}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE: PEEK (Level 3) */}
      {currentChallenge?.mode === 'peek' && currentLevel.id !== 4 && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                PEEK OPERATION (NON-DESTRUCTIVE)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Inspect FRONT element without removing it
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            <button
              onClick={handlePeek}
              disabled={feedbackStatus === 'correct' || activeQueue.length === 0}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-mono font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-95 ${
                feedbackStatus === 'correct'
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>PEEK FRONT (INSPECT WITHOUT REMOVING)</span>
            </button>

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Queue size will remain <strong>{activeQueue.length} / {currentChallenge?.capacity || 5}</strong> after inspection.
            </div>
          </div>
        </div>
      )}

      {/* MODE: MULTIPLE CHOICE (Level 1, Level 2, Level 3, Level 4) */}
      {currentChallenge?.choices && currentChallenge.choices.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              SELECT THE CORRECT ANSWER
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Click an option OR drag and drop it into the Answer Drop Zone
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
            className="w-full p-3.5 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-950/40 flex items-center justify-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300 select-none transition-colors hover:bg-blue-100/70 dark:hover:bg-blue-900/40"
          >
            <span className="text-base">🎯</span>
            <span>Drag and drop your chosen option here (or click any option below)</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {currentChallenge.choices.map((choice, idx) => {
              const isSelected = selectedChoiceId === choice.id;
              const isCorrectFeedback = feedbackStatus === 'correct' && isSelected;
              const isIncorrectFeedback = feedbackStatus === 'incorrect' && isSelected;

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
                  className={`p-3.5 sm:p-4 rounded-xl text-left border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold select-none ${
                    isCorrectFeedback
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-100 shadow-xs ring-2 ring-emerald-300 dark:ring-emerald-800'
                      : isIncorrectFeedback
                      ? 'bg-red-50 dark:bg-red-950/60 border-red-400 text-red-950 dark:text-red-100'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border-slate-200 dark:border-slate-700 hover:border-blue-300 text-slate-800 dark:text-slate-200 cursor-grab active:cursor-grabbing hover:scale-[1.01]'
                  }`}
                  title="Click option or drag into Answer Drop Zone"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{choice.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal">
                      Click / Drag
                    </span>
                    {isCorrectFeedback && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    {isIncorrectFeedback && (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE: OVERFLOW TEST (Level 4) */}
      {currentChallenge?.mode === 'overflow' && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-amber-800/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>QUEUE OVERFLOW SIMULATION ZONE</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The bunker queue is holding 5 survivors out of 5 capacity slots (100% full). Test the software exception guardrail.
          </p>

          <button
            onClick={handleOverflowTrigger}
            disabled={feedbackStatus === 'correct'}
            className="px-5 py-3 rounded-xl font-mono font-black text-xs uppercase tracking-wide bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>ENQUEUE SURVIVOR [F] (TRIGGER & TEST OVERFLOW)</span>
          </button>
        </div>
      )}

      {/* MODE: UNDERFLOW TEST (Level 5) */}
      {currentChallenge?.mode === 'underflow' && (
        <div className="bg-red-50/70 dark:bg-red-950/30 p-4 sm:p-5 rounded-2xl border border-red-200 dark:border-red-800/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-900 dark:text-red-200 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>QUEUE UNDERFLOW SIMULATION ZONE</span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The bunker queue is completely empty (0 / 5 survivors). There is no element at the FRONT pointer to remove.
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
