import React from 'react';
import {
  ArrowUpRight,
  ArrowDownToLine,
  Layers,
  Eye,
  Bug,
  Zap,
  Clock,
  Sparkles,
  CheckCircle2,
  Flame,
  ArrowRight,
  Play,
  FlaskConical,
  BookOpen,
  ArrowLeftRight,
  Radio,
} from 'lucide-react';
import { GameMetaData, GAME_CATALOG } from '../../data/gameMeta';
import { UserProgress } from '../../types';
import { soundEffects } from '../../services/sound';

interface GameHubProps {
  progress: UserProgress;
  activeLevelId: number;
  currentChallengeIndex: number;
  onOpenPreview: (game: GameMetaData) => void;
  onDirectContinue: (levelId: number) => void;
  onOpenGuidedSolve?: (levelId: number) => void;
  onOpenInGameLab?: () => void;
  onOpenLearn?: () => void;
  onUpdateProgress?: (updated: UserProgress | ((prev: UserProgress) => UserProgress)) => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  progress,
  activeLevelId,
  currentChallengeIndex,
  onOpenPreview,
  onDirectContinue,
  onOpenGuidedSolve,
  onOpenInGameLab,
  onOpenLearn,
  onUpdateProgress,
}) => {
  const completedLevels = progress.completedGameLevels || [];

  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'pop':
        return <ArrowUpRight className="w-5 h-5" />;
      case 'push':
        return <ArrowDownToLine className="w-5 h-5" />;
      case 'build':
        return <Layers className="w-5 h-5" />;
      case 'predict':
        return <Eye className="w-5 h-5" />;
      case 'debug':
        return <Bug className="w-5 h-5" />;
      case 'speed':
        return <Zap className="w-5 h-5" />;
      case 'infinity':
        return <ArrowLeftRight className="w-5 h-5" />;
      case 'trophy':
        return <Radio className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const getDifficultyBadge = (difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'Master':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const handleOpenLab = () => {
    soundEffects.playClick();
    if (onOpenInGameLab) {
      onOpenInGameLab();
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* ─── 1. SIMPLE GAME PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Interactive DSA Simulator
            </span>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Learn → Practice → Master
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            QUEUE COMMAND CENTER
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Professional Queue Engineering Curriculum: FIFO Guardrails, Execution Tracing, Circular Ring Buffers, and High-Throughput Packet Dispatching.
          </p>
        </div>
      </div>

      {/* ─── 2. QUEUE GAME LEVEL CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {GAME_CATALOG.map((game) => {
          const isCompleted = completedLevels.includes(game.id);
          const isInProgress = !isCompleted && game.id === activeLevelId && currentChallengeIndex > 0;
          const formattedNumber = game.levelNumber < 10 ? `0${game.levelNumber}` : `${game.levelNumber}`;

          return (
            <div
              key={game.id}
              onClick={() => {
                soundEffects.playClick();
                onDirectContinue(game.id);
              }}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer ${
                isCompleted
                  ? 'border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400'
                  : isInProgress
                  ? 'border-blue-300 dark:border-blue-800 ring-1 ring-blue-200 dark:ring-blue-900/50'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div>
                {/* Top Row: Game Number, Icon & Status */}
                <div className="flex items-center justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black font-mono tracking-wider text-slate-400 dark:text-slate-500">
                      {formattedNumber}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getGameIcon(game.iconName)}
                    </div>
                  </div>

                  {/* Completion Status Badge */}
                  <div>
                    {isCompleted ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : isInProgress ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> In Progress
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        ○ Not Started
                      </span>
                    )}
                  </div>
                </div>

                {/* Game Title & Subtitle */}
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                  {game.title}
                </h2>
                {game.subtitle && (
                  <div className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 mb-2 line-clamp-1">
                    {game.subtitle}
                  </div>
                )}

                {/* Short Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-3">
                  {game.description}
                </p>

              </div>

              {/* Card Footer: Metadata & Primary Action Button */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  {/* Difficulty & Estimated Time */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${getDifficultyBadge(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {game.duration}
                    </span>
                  </div>

                  {/* XP Reward */}
                  <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    <Sparkles className="w-3 h-3 fill-amber-500" />
                    +{game.xpReward} XP
                  </span>
                </div>

                {/* Primary Action Button: PLAY GAME */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEffects.playClick();
                    onDirectContinue(game.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] ${
                    isCompleted
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                      : isInProgress
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>PLAY GAME</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 3. QUEUE EXPERIMENT LAB CARD ─── */}
      <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <div
          onClick={handleOpenLab}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all group cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <FlaskConical className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Interactive Sandbox
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Open Experiment Ground
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                QUEUE EXPERIMENT LAB
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Practice Queue operations interactively using Enqueue, Dequeue, Peek, dynamic capacity resizing, and real-time pointer tracking.
              </p>

              <div className="flex items-center gap-2 pt-2 flex-wrap text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  ⚡ FIFO Enqueue &amp; Dequeue
                </span>
                <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  📏 Dynamic Bunker Capacity
                </span>
                <span className="bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  👀 Non-Destructive Peek
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLab();
              }}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group-hover:shadow-md active:scale-95"
            >
              <FlaskConical className="w-4 h-4" />
              <span>OPEN EXPERIMENT LAB</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
