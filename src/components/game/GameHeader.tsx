import React from 'react';
import { ArrowLeft, ChevronDown, RotateCcw } from 'lucide-react';
import { GameLevelConfig, UserProgress } from '../../types';

interface GameHeaderProps {
  currentLevel: GameLevelConfig;
  allLevels: GameLevelConfig[];
  currentChallengeIndex: number;
  totalChallenges: number;
  progress: UserProgress;
  mistakes?: number;
  maxMistakes?: number;
  isLabActive?: boolean;
  onOpenLab?: () => void;
  onOpenGuidedSolve?: () => void;
  onOpenLearn?: () => void;
  onSelectLevel: (levelId: number) => void;
  onResetChallenge: () => void;
  onResetGame?: () => void;
  onBackToHub?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentLevel,
  allLevels,
  currentChallengeIndex,
  totalChallenges,
  progress,
  onSelectLevel,
  onResetChallenge,
  onBackToHub,
}) => {
  const isCompleted = progress.completedGameLevels.includes(currentLevel.id);
  const progressPercent = Math.min(
    100,
    Math.round(((currentChallengeIndex + 1) / totalChallenges) * 100)
  );

  return (
    <div className="space-y-3 w-full">
      {/* Upper Card: Clean, minimal matching reference image */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
        {/* Left: ← Game Hub & Level Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              title="Return to Game Hub"
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Game Hub</span>
            </button>
          )}

          {/* Level Dropdown with Checkmark & Down Chevron */}
          <div className="relative inline-flex items-center">
            <select
              value={currentLevel.id}
              onChange={(e) => onSelectLevel(Number(e.target.value))}
              aria-label="Select Game Level"
              className="appearance-none font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white pl-3.5 pr-8 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-hidden cursor-pointer transition-colors shadow-2xs"
            >
              {allLevels.map((lvl) => {
                const levelCompleted = progress.completedGameLevels.includes(lvl.id);
                const shortTitle = lvl.title.split(':')[1]?.trim() || lvl.title;
                return (
                  <option key={lvl.id} value={lvl.id}>
                    Level {lvl.levelNumber || lvl.id}: {shortTitle} {levelCompleted ? '✓' : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right: ROUND 1 / 4 & Reset button */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            ROUND
          </span>

          <div className="flex items-center font-mono font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800/80 shadow-2xs">
            {currentChallengeIndex + 1} / {totalChallenges}
          </div>

          <button
            onClick={onResetChallenge}
            title="Reset Round"
            aria-label="Reset Round"
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors active:scale-95 shadow-2xs shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Line below upper card matching reference */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
