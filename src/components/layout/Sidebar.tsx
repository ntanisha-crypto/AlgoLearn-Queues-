import React, { useState, useEffect, forwardRef } from 'react';
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Gamepad2,
  HelpCircle,
  TrendingUp,
  X,
} from 'lucide-react';
import { TabType, UserProgress } from '../../types';
import { soundEffects } from '../../services/sound';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  progress: UserProgress;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(({
  currentTab,
  onSelectTab,
  progress,
  isOpen,
  onClose,
}, ref) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute stats according to curriculum
  const completedLearn = Math.min(20, progress.completedTheoryChapters?.length || 0);
  const completedLabs = Math.min(2, progress.completedLabs?.length || 0);
  const completedGames = Math.min(4, progress.completedGameLevels?.filter((id) => id >= 1 && id <= 4).length || 0);
  const totalActivities = 27;
  const completedActivities = Math.min(27, completedLearn + completedLabs + completedGames + (progress.quizCompleted ? 1 : 0));
  const masteryPercentage = Math.round((completedActivities / totalActivities) * 100);

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: { text: string; bg: string; color: string };
  }[] = [
    {
      id: 'home',
      label: 'Overview',
      icon: LayoutGrid,
      badge: {
        text: `${completedActivities}/27`,
        bg: 'bg-blue-50 dark:bg-blue-950/70',
        color: 'text-blue-600 dark:text-blue-400',
      },
    },
    {
      id: 'theory',
      label: 'Learn',
      icon: BookOpen,
      badge: {
        text: `${completedLearn}/20`,
        bg: 'bg-blue-50 dark:bg-blue-950/70',
        color: 'text-blue-600 dark:text-blue-400',
      },
    },
    {
      id: 'lab',
      label: 'Visualize',
      icon: Sparkles,
      badge: {
        text: `${completedLabs}/2`,
        bg: 'bg-blue-50 dark:bg-blue-950/70',
        color: 'text-blue-600 dark:text-blue-400',
      },
    },
    {
      id: 'game',
      label: 'Game',
      icon: Gamepad2,
      badge: {
        text: `${completedGames}/4`,
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        color: 'text-emerald-600 dark:text-emerald-400',
      },
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: HelpCircle,
      badge: {
        text: progress.quizCompleted ? '1/1' : '0/1',
        bg: 'bg-blue-50 dark:bg-blue-950/70',
        color: 'text-blue-600 dark:text-blue-400',
      },
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: TrendingUp,
      badge: {
        text: `${masteryPercentage}%`,
        bg: 'bg-blue-50 dark:bg-blue-950/70',
        color: 'text-blue-600 dark:text-blue-400',
      },
    },
  ];

  const handleItemClick = (tab: TabType) => {
    soundEffects.playClick();
    onSelectTab(tab);
    // Note: Do not close navigation when selecting items as requested
  };

  return (
    <aside
      ref={ref}
      id="main-sidebar-navigation"
      role="navigation"
      aria-label="Sidebar Navigation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-full shrink-0 overflow-hidden bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between select-none transition-all duration-300 ease-out z-30 ${
        isOpen ? 'w-[280px] sm:w-[300px] opacity-100' : 'w-0 opacity-0 border-r-0 pointer-events-none'
      }`}
    >
      <div className="w-[280px] sm:w-[300px] h-full flex flex-col justify-between shrink-0">
        {/* Navigation Items (Directly at top without empty logo banner) */}
        <div className="p-3 sm:p-3.5 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-2 py-1 mb-1.5 shrink-0 border-b border-slate-100 dark:border-slate-800/60 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation Menu
            </span>

            {/* Close button (upper-right) */}
            <button
              onClick={() => {
                soundEffects.playClick();
                onClose();
              }}
              title="Close navigation (Esc)"
              aria-label="Close navigation"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5 flex-1 mt-0.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/90 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold border border-blue-100/80 dark:border-blue-900/50 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Icon container */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className="text-sm font-semibold tracking-tight truncate">
                      {item.label}
                    </span>
                  </div>

                  {/* Badges: All details show simultaneously when cursor moves towards the navigation bar */}
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${item.badge.bg} ${item.badge.color} transition-all duration-200 pointer-events-none select-none shrink-0 ${
                      isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1.5'
                    }`}
                  >
                    {item.badge.text}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
