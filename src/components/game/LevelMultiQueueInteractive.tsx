import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartPulse,
  Zap,
  UtensilsCrossed,
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface Visitor {
  id: string;
  name: string;
  targetQueue: 'emergency' | 'ride' | 'food';
  description: string;
  avatarColor: string;
}

interface LevelMultiQueueInteractiveProps {
  onNotifyAction?: (actionText: string) => void;
  onScoreChange?: (delta: number, lifeLost?: boolean) => void;
}

const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'v-1',
    name: 'Alex',
    targetQueue: 'ride',
    description: 'Wants to ride the Rollercoaster 🎢',
    avatarColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700',
  },
  {
    id: 'v-2',
    name: 'Bella',
    targetQueue: 'food',
    description: 'Hungry for burgers & snacks 🍔',
    avatarColor: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700',
  },
  {
    id: 'v-3',
    name: 'Chris',
    targetQueue: 'ride',
    description: 'Wants to ride the Rollercoaster 🎢',
    avatarColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-700',
  },
  {
    id: 'v-4',
    name: 'Diana',
    targetQueue: 'emergency',
    description: 'Needs medical FastPass / First Aid 🚑',
    avatarColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700',
  },
  {
    id: 'v-5',
    name: 'Ethan',
    targetQueue: 'food',
    description: 'Looking for ice cream & soft drinks 🍔',
    avatarColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700',
  },
];

export const LevelMultiQueueInteractive: React.FC<LevelMultiQueueInteractiveProps> = ({
  onNotifyAction,
  onScoreChange,
}) => {
  const [visitorIndex, setVisitorIndex] = useState<number>(0);
  const [emergencyQueue, setEmergencyQueue] = useState<string[]>([]);
  const [rideQueue, setRideQueue] = useState<string[]>([]);
  const [foodQueue, setFoodQueue] = useState<string[]>([]);
  const [servedHistory, setServedHistory] = useState<{ name: string; queue: string; time: string }[]>([]);
  const [lastMessage, setLastMessage] = useState<string>(
    'Direct arriving guests to their respective queues, then serve each line in FIFO order.'
  );

  const activeVisitor = visitorIndex < INITIAL_VISITORS.length ? INITIAL_VISITORS[visitorIndex] : null;

  // Handle Enqueue into a selected queue
  const handleRouteVisitor = (chosenQueue: 'emergency' | 'ride' | 'food') => {
    if (!activeVisitor) return;

    if (chosenQueue === activeVisitor.targetQueue) {
      soundEffects.playPush();
      onScoreChange?.(10, false);

      if (chosenQueue === 'emergency') {
        setEmergencyQueue((prev) => [...prev, activeVisitor.name]);
      } else if (chosenQueue === 'ride') {
        setRideQueue((prev) => [...prev, activeVisitor.name]);
      } else {
        setFoodQueue((prev) => [...prev, activeVisitor.name]);
      }

      const queueName =
        chosenQueue === 'emergency' ? '🚑 Emergency Queue' : chosenQueue === 'ride' ? '🎢 Ride Queue' : '🍔 Food Queue';

      const msg = `✅ ${activeVisitor.name} correctly enqueued into ${queueName}! (+10 pts)`;
      setLastMessage(msg);
      onNotifyAction?.(msg);
      setVisitorIndex((prev) => prev + 1);
    } else {
      soundEffects.playError();
      onScoreChange?.(-10, true);
      const expectedQueue =
        activeVisitor.targetQueue === 'emergency'
          ? '🚑 Emergency Queue'
          : activeVisitor.targetQueue === 'ride'
          ? '🎢 Ride Queue'
          : '🍔 Food Queue';

      const msg = `❌ Wrong Queue! ${activeVisitor.name} needs the ${expectedQueue}. (-10 pts, -1 Life)`;
      setLastMessage(msg);
      onNotifyAction?.(msg);
    }
  };

  // Handle Dequeue from a specific queue
  const handleDequeueQueue = (queueType: 'emergency' | 'ride' | 'food') => {
    let targetList: string[] = [];
    let setTargetList: React.Dispatch<React.SetStateAction<string[]>>;
    let label = '';

    if (queueType === 'emergency') {
      targetList = emergencyQueue;
      setTargetList = setEmergencyQueue;
      label = '🚑 Emergency Queue';
    } else if (queueType === 'ride') {
      targetList = rideQueue;
      setTargetList = setRideQueue;
      label = '🎢 Ride Queue';
    } else {
      targetList = foodQueue;
      setTargetList = setFoodQueue;
      label = '🍔 Food Queue';
    }

    if (targetList.length === 0) {
      soundEffects.playError();
      onScoreChange?.(-10, false);
      const msg = `🚨 Queue Underflow! The ${label} is currently empty.`;
      setLastMessage(msg);
      onNotifyAction?.(msg);
      return;
    }

    soundEffects.playPop();
    onScoreChange?.(10, false);
    const servedPerson = targetList[0];
    setTargetList((prev) => prev.slice(1));

    setServedHistory((prev) => [
      { name: servedPerson, queue: label, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ]);

    const msg = `🎉 Served ${servedPerson} from ${label} (FIFO: entered first!). (+10 pts)`;
    setLastMessage(msg);
    onNotifyAction?.(msg);
  };

  // Reset multi-queue simulator
  const handleReset = () => {
    soundEffects.playClick();
    setVisitorIndex(0);
    setEmergencyQueue([]);
    setRideQueue([]);
    setFoodQueue([]);
    setServedHistory([]);
    setLastMessage('Reset complete: 3 amusement park queues ready for dispatch.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Level 6 Interactive Arena
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              Multi-Queue Architecture
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
            AMUSEMENT PARK MULTI-QUEUE DISPATCH
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Route each guest to their requested destination and manage 3 separate queues simultaneously.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer self-start sm:self-center transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Queues</span>
        </button>
      </div>

      {/* Arriving Guest Dispatch Stage */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span>Arriving Guest Dispatch</span>
          <span className="font-mono text-indigo-600 dark:text-indigo-400">
            Guest {Math.min(visitorIndex + 1, INITIAL_VISITORS.length)} of {INITIAL_VISITORS.length}
          </span>
        </div>

        {activeVisitor ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'GUEST', name: activeVisitor.name, targetQueue: activeVisitor.targetQueue }));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="flex items-center gap-3 p-2 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 cursor-grab active:cursor-grabbing select-none transition-all hover:scale-[1.02]"
              title="Drag this guest card to any queue box, or click the queue buttons"
            >
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center font-black text-lg ${activeVisitor.avatarColor} shrink-0 shadow-2xs`}
              >
                {activeVisitor.name[0]}
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <span>{activeVisitor.name}</span>
                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    Draggable
                  </span>
                </div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {activeVisitor.description}
                </div>
              </div>
            </div>

            {/* Routing Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleRouteVisitor('emergency')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <span>🚑 Emergency Queue</span>
              </button>

              <button
                onClick={() => handleRouteVisitor('ride')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span>🎢 Ride Queue</span>
              </button>

              <button
                onClick={() => handleRouteVisitor('food')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-amber-200 dark:border-amber-900 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
                <span>🍔 Food Queue</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              All park guests have been dispatched to their respective lines!
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Now serve riders using the DEQUEUE buttons below!
            </span>
          </div>
        )}
      </div>

      {/* 3 Independent Queues Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Emergency Queue */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleRouteVisitor('emergency');
          }}
          className="rounded-xl border-2 border-rose-200 hover:border-rose-400 dark:border-rose-900/60 dark:hover:border-rose-700 bg-rose-50/40 dark:bg-rose-950/30 p-4 flex flex-col justify-between space-y-4 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 dark:text-rose-300 uppercase">
                <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>🚑 Emergency Queue</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                {emergencyQueue.length} in line
              </span>
            </div>

            {/* Visual Queue Line */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-rose-100 dark:border-rose-900/40 min-h-[68px] flex items-center gap-1.5 overflow-x-auto">
              {emergencyQueue.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic mx-auto">
                  Line is empty (Drop guest here or click button)
                </span>
              ) : (
                emergencyQueue.map((item, idx) => (
                  <div
                    key={`${item}-${idx}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 border ${
                      idx === 0
                        ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300 dark:ring-rose-800'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {idx === 0 ? `FRONT: ${item}` : item}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => handleDequeueQueue('emergency')}
            disabled={emergencyQueue.length === 0}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold border border-rose-300 dark:border-rose-800 bg-white hover:bg-rose-100 dark:bg-slate-900 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>DEQUEUE EMERGENCY (FIFO)</span>
          </button>
        </div>

        {/* 2. Ride Queue */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleRouteVisitor('ride');
          }}
          className="rounded-xl border-2 border-blue-200 hover:border-blue-400 dark:border-blue-900/60 dark:hover:border-blue-700 bg-blue-50/40 dark:bg-blue-950/30 p-4 flex flex-col justify-between space-y-4 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-300 uppercase">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>🎢 Ride Queue</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {rideQueue.length} in line
              </span>
            </div>

            {/* Visual Queue Line */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-blue-100 dark:border-blue-900/40 min-h-[68px] flex items-center gap-1.5 overflow-x-auto">
              {rideQueue.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic mx-auto">
                  Line is empty (Drop guest here or click button)
                </span>
              ) : (
                rideQueue.map((item, idx) => (
                  <div
                    key={`${item}-${idx}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 border ${
                      idx === 0
                        ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-300 dark:ring-blue-800'
                        : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    {idx === 0 ? `FRONT: ${item}` : item}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => handleDequeueQueue('ride')}
            disabled={rideQueue.length === 0}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold border border-blue-300 dark:border-blue-800 bg-white hover:bg-blue-100 dark:bg-slate-900 dark:hover:bg-blue-950 text-blue-700 dark:text-blue-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>BOARD ROLLERCOASTER (FIFO)</span>
          </button>
        </div>

        {/* 3. Food Queue */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleRouteVisitor('food');
          }}
          className="rounded-xl border-2 border-amber-200 hover:border-amber-400 dark:border-amber-900/60 dark:hover:border-amber-700 bg-amber-50/40 dark:bg-amber-950/30 p-4 flex flex-col justify-between space-y-4 transition-colors"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 dark:text-amber-300 uppercase">
                <UtensilsCrossed className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>🍔 Food Queue</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
                {foodQueue.length} in line
              </span>
            </div>

            {/* Visual Queue Line */}
            <div className="bg-white dark:bg-slate-900 rounded-lg p-2.5 border border-amber-100 dark:border-amber-900/40 min-h-[68px] flex items-center gap-1.5 overflow-x-auto">
              {foodQueue.length === 0 ? (
                <span className="text-[11px] font-mono text-slate-400 italic mx-auto">
                  Line is empty (0)
                </span>
              ) : (
                foodQueue.map((item, idx) => (
                  <div
                    key={`${item}-${idx}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 border ${
                      idx === 0
                        ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-300 dark:ring-amber-800'
                        : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {idx === 0 ? `FRONT: ${item}` : item}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => handleDequeueQueue('food')}
            disabled={foodQueue.length === 0}
            className="w-full py-2 px-3 rounded-lg text-xs font-bold border border-amber-300 dark:border-amber-800 bg-white hover:bg-amber-100 dark:bg-slate-900 dark:hover:bg-amber-950 text-amber-700 dark:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>SERVE SNACKS (FIFO)</span>
          </button>
        </div>
      </div>

      {/* Live System Log & Pedagogical Principle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Dispatch Event Log
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {lastMessage}
          </div>
        </div>

        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Multi-Queue FIFO Rule
          </div>
          <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            Each queue maintains its own FRONT and REAR pointers independently. Alex was served before Chris in the Ride line because Alex arrived first in that specific queue!
          </p>
        </div>
      </div>
    </div>
  );
};
