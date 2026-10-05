import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Target,
  ArrowDownToLine,
  ArrowUpRight,
  Eye,
  CheckSquare,
  AlertTriangle,
  HelpCircle,
  Zap,
  Shield,
  Star,
} from 'lucide-react';
import { GameChallenge } from '../../types';

interface QuestionCardProps {
  challenge: GameChallenge;
  levelNumber?: number;
  currentChallengeIndex?: number;
  totalChallenges?: number;
  onOpenGuidedSolve?: () => void;
}

/**
 * Highlights bracketed terms like [D], [A], keywords like FRONT, REAR, FIFO, OVERFLOW, UNDERFLOW
 */
const renderHighlightedText = (text: string) => {
  if (!text) return text;

  // Split by bracketed values [xyz] or specific keywords
  const parts = text.split(/(\[[^\]]+\]|\bFRONT\b|\bREAR\b|\bFIFO\b|\bOVERFLOW\b|\bUNDERFLOW\b)/g);

  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-mono font-black text-sm sm:text-base shadow-2xs"
        >
          {part}
        </span>
      );
    }
    if (part === 'FRONT') {
      return (
        <span
          key={i}
          className="inline-flex items-center px-2.5 py-0.5 mx-1 rounded-md bg-blue-100 dark:bg-indigo-950/80 text-blue-700 dark:text-indigo-300 font-bold text-xs sm:text-sm"
        >
          FRONT
        </span>
      );
    }
    if (part === 'REAR') {
      return (
        <span
          key={i}
          className="inline-flex items-center px-2 py-0.5 mx-1 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold text-xs sm:text-sm"
        >
          REAR
        </span>
      );
    }
    if (part === 'FIFO') {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-black text-xs sm:text-sm"
        >
          FIFO
        </span>
      );
    }
    if (part === 'OVERFLOW' || part === 'UNDERFLOW') {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-black text-xs sm:text-sm font-mono"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

/**
 * Formats multi-line instructions (e.g. numbered trace steps) into clean rows
 */
const renderInstructionContent = (instruction: string) => {
  if (!instruction) return null;

  const lines = instruction.split('\n');
  if (lines.length === 1) {
    return <p className="leading-relaxed">{renderHighlightedText(instruction)}</p>;
  }

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Check if line starts with a number like "1. " or a bullet "• "
        const isStep = /^[0-9]+\.\s+/.test(trimmed);
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');

        if (isStep) {
          const stepNumber = trimmed.match(/^[0-9]+/)?.[0] || '';
          const textContent = trimmed.replace(/^[0-9]+\.\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {stepNumber}
              </span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {renderHighlightedText(textContent)}
              </span>
            </div>
          );
        }

        if (isBullet) {
          const textContent = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {renderHighlightedText(textContent)}
              </span>
            </div>
          );
        }

        return (
          <p key={idx} className="font-medium text-slate-800 dark:text-slate-200">
            {renderHighlightedText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  challenge,
  levelNumber,
  currentChallengeIndex,
  totalChallenges,
  onOpenGuidedSolve,
}) => {
  const [showHint, setShowHint] = useState<boolean>(false);

  const getModeDetails = (mode: string) => {
    switch (mode) {
      case 'enqueue':
        return {
          icon: <ArrowDownToLine className="w-3.5 h-3.5" />,
          label: 'ENQUEUE OPERATION',
          badgeClass:
            'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          interactionAffordance:
            '📥 Tap the element chip below or drag & drop it directly into the Queue above.',
        };
      case 'dequeue':
        return {
          icon: <ArrowUpRight className="w-3.5 h-3.5" />,
          label: 'DEQUEUE OPERATION',
          badgeClass:
            'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          interactionAffordance:
            '📤 Tap the Dequeue button or drag the FRONT element out of the box to serve/depart.',
        };
      case 'peek':
      case 'identify_front':
        return {
          icon: <Eye className="w-3.5 h-3.5" />,
          label: 'IDENTIFY FRONT ELEMENT',
          badgeClass:
            'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          interactionAffordance:
            '👀 Tap the element directly in the queue box above, or select from the candidate cards below.',
        };
      case 'identify_rear':
        return {
          icon: <Target className="w-3.5 h-3.5" />,
          label: 'IDENTIFY REAR ELEMENT',
          badgeClass:
            'bg-purple-100/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
          interactionAffordance:
            '🎯 Tap the element directly in the queue box above, or select from the candidate cards below.',
        };
      case 'overflow':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'OVERFLOW DEFENSE',
          badgeClass:
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          interactionAffordance:
            '🚨 Click the Test Overflow button to see how the system rejects writes beyond full capacity.',
        };
      case 'underflow':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'UNDERFLOW DEFENSE',
          badgeClass:
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
          interactionAffordance:
            '🚨 Click the Test Underflow button to see how the system handles dequeuing an empty queue.',
        };
      case 'choice':
      default:
        return {
          icon: <CheckSquare className="w-3.5 h-3.5" />,
          label: 'MULTIPLE CHOICE',
          badgeClass:
            'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          interactionAffordance:
            '🔘 Click any option below or drag and drop your choice into the Answer Drop Zone.',
        };
    }
  };

  const modeInfo = getModeDetails(challenge.mode);
  const displayChallengeNumber =
    currentChallengeIndex !== undefined
      ? currentChallengeIndex + 1
      : challenge.challengeNumber;
  const displayTotal =
    totalChallenges || challenge.totalChallengesInLevel || 10;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
      <div className="p-4 sm:p-5 sm:pb-6 space-y-4">
        {/* Top Metadata Header Row */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          {/* Question / Step & Mode Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 fill-current" />
              <span>
                QUESTION {displayChallengeNumber} OF {displayTotal}
              </span>
            </span>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full flex items-center gap-1.5 ${modeInfo.badgeClass}`}
            >
              {modeInfo.icon}
              <span>{modeInfo.label}</span>
            </span>

            {levelNumber && (
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                LEVEL {levelNumber}
              </span>
            )}
          </div>

          {/* Action Tools: Guided Solve, Hint & XP */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenGuidedSolve && (
              <button
                onClick={onOpenGuidedSolve}
                className="text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 bg-purple-50 dark:bg-purple-950/40 px-3.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Open Step-by-Step Guided Solve walkthrough"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Guided Solve</span>
              </button>
            )}

            {challenge.hint && (
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Toggle helpful hint and thought clue"
              >
                <span>{showHint ? 'Hide Hint' : '💡 Need a Hint?'}</span>
              </button>
            )}

            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              <Star className="w-3.5 h-3.5 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" />
              +{challenge.xpReward} XP
            </span>
          </div>
        </div>

        {/* ─── DOMINANT HIGHLIGHTED QUESTION HERO BLOCK ─── */}
        <div className="space-y-1 pt-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase leading-snug">
            {renderHighlightedText(challenge.question)}
          </h2>
        </div>

        {/* ─── ACTION INSTRUCTION CALLOUT ─── */}
        <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Target className="w-4 h-4 shrink-0" />
            <span>WHAT TO DO / MISSION INSTRUCTIONS:</span>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
            {renderInstructionContent(challenge.instruction)}
          </div>

          {/* Sub-bullet instruction matching reference */}
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
            <Star className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />
            <span>Drag the elements to FRONT or REAR to build the queue.</span>
          </div>
        </div>

        {/* ─── EXPANDABLE HINT DRAWER ─── */}
        {showHint && challenge.hint && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2 animate-in fade-in duration-150">
            <div className="font-black text-xs uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 fill-indigo-500 text-indigo-600 dark:text-indigo-400" />
              <span>HINT: {challenge.hint.title || 'Helpful Clue'}</span>
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              {challenge.hint.thoughtPrompt}
            </p>
            {challenge.hint.clue && (
              <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 font-mono text-xs font-bold text-indigo-950 dark:text-indigo-200">
                💡 Direct Clue: {challenge.hint.clue}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
