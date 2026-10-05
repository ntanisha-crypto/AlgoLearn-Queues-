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
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 font-black text-xs sm:text-sm"
        >
          FRONT
        </span>
      );
    }
    if (part === 'REAR') {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-black text-xs sm:text-sm"
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
            'bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 dark:border-blue-800',
          interactionAffordance:
            '📥 Tap the element chip below or drag & drop it directly into the Queue above.',
        };
      case 'dequeue':
        return {
          icon: <ArrowUpRight className="w-3.5 h-3.5" />,
          label: 'DEQUEUE OPERATION',
          badgeClass:
            'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
          interactionAffordance:
            '📤 Tap the Dequeue button or drag the FRONT element out of the box to serve/depart.',
        };
      case 'peek':
      case 'identify_front':
        return {
          icon: <Eye className="w-3.5 h-3.5" />,
          label: 'IDENTIFY FRONT ELEMENT',
          badgeClass:
            'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
          interactionAffordance:
            '👀 Tap the element directly in the queue box above, or select from the candidate cards below.',
        };
      case 'identify_rear':
        return {
          icon: <Target className="w-3.5 h-3.5" />,
          label: 'IDENTIFY REAR ELEMENT',
          badgeClass:
            'bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 dark:border-blue-800',
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
            'bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200 border-blue-200 dark:border-blue-800',
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
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-blue-400/90 dark:border-blue-600/90 shadow-md shadow-blue-500/5 dark:shadow-blue-950/40">
      {/* Top Gradient Highlight Accent Stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />

      <div className="p-4 sm:p-5 sm:pb-6 space-y-4">
        {/* Top Metadata Header Row */}
        <div className="flex items-center justify-between gap-2.5 flex-wrap">
          {/* Question / Step & Mode Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>
                QUESTION {displayChallengeNumber} OF {displayTotal}
              </span>
            </span>

            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-2xs ${modeInfo.badgeClass}`}
            >
              {modeInfo.icon}
              <span>{modeInfo.label}</span>
            </span>

            {levelNumber && (
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                LEVEL {levelNumber}
              </span>
            )}
          </div>

          {/* Action Tools: Guided Solve, Hint & XP */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenGuidedSolve && (
              <button
                onClick={onOpenGuidedSolve}
                className="text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:text-indigo-950 dark:hover:text-indigo-100 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 px-3 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                title="Open Step-by-Step Guided Solve walkthrough"
              >
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-500" />
                <span>Guided Solve</span>
              </button>
            )}

            {challenge.hint && (
              <button
                onClick={() => setShowHint((prev) => !prev)}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
                title="Toggle helpful hint and thought clue"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>{showHint ? 'Hide Hint' : '💡 Need a Hint?'}</span>
              </button>
            )}

            <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
              +{challenge.xpReward} XP
            </span>
          </div>
        </div>

        {/* ─── DOMINANT HIGHLIGHTED QUESTION HERO BLOCK ─── */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-blue-500" />
              CURRENT OBJECTIVE
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Read carefully &amp; execute below:
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 dark:text-white tracking-tight leading-snug">
            {renderHighlightedText(challenge.question)}
          </h2>
        </div>

        {/* ─── ACTION INSTRUCTION CALLOUT ─── */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>👉 WHAT TO DO / MISSION INSTRUCTIONS:</span>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
            {renderInstructionContent(challenge.instruction)}
          </div>

          {/* Quick interaction helper footer */}
          <div className="pt-1 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center gap-2 text-[11px] font-medium text-blue-700 dark:text-blue-300">
            <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>{modeInfo.interactionAffordance}</span>
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
