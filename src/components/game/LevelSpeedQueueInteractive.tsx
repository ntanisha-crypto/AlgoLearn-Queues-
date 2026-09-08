import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Wifi,
  Zap,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  Send,
  Flame,
} from 'lucide-react';
import { soundEffects } from '../../services/sound';

interface Packet {
  id: string;
  name: string;
  dataSize: string;
  color: string;
}

interface LevelSpeedQueueInteractiveProps {
  onNotifyAction?: (actionText: string) => void;
  onScoreReward?: (delta: number) => void;
}

export const LevelSpeedQueueInteractive: React.FC<LevelSpeedQueueInteractiveProps> = ({
  onNotifyAction,
  onScoreReward,
}) => {
  const [buffer, setBuffer] = useState<Packet[]>([
    { id: 'pkt-1', name: 'PKT-101', dataSize: '64 KB', color: 'from-blue-500 to-indigo-600' },
    { id: 'pkt-2', name: 'PKT-102', dataSize: '128 KB', color: 'from-purple-500 to-pink-600' },
  ]);

  const [incomingPackets, setIncomingPackets] = useState<Packet[]>([
    { id: 'in-1', name: 'PKT-103', dataSize: '256 KB', color: 'from-emerald-500 to-teal-600' },
    { id: 'in-2', name: 'PKT-104', dataSize: '64 KB', color: 'from-amber-500 to-orange-600' },
    { id: 'in-3', name: 'PKT-105', dataSize: '512 KB', color: 'from-cyan-500 to-blue-600' },
  ]);

  const [dispatchedCount, setDispatchedCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [isOverExit, setIsOverExit] = useState<boolean>(false);
  const [isOverBuffer, setIsOverBuffer] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<string>(
    'Network Dispatcher: Enqueue arriving packets at REAR, Dequeue/Transmit from FRONT to prevent buffer overflows!'
  );

  const BUFFER_CAPACITY = 5;

  // Enqueue Packet
  const handleEnqueuePacket = (pkt: Packet) => {
    if (buffer.length >= BUFFER_CAPACITY) {
      soundEffects.playError();
      const msg = '🚨 BUFFER OVERFLOW! Dropping packet! Clear queue by transmitting from FRONT first.';
      setLastMessage(msg);
      onNotifyAction?.(msg);
      setCombo(1);
      return;
    }

    soundEffects.playPush();
    setBuffer((prev) => [...prev, pkt]);
    setIncomingPackets((prev) => prev.filter((p) => p.id !== pkt.id));

    // Replenish an incoming packet
    const newId = Date.now().toString().slice(-4);
    const names = ['PKT-201', 'PKT-202', 'PKT-203', 'PKT-204', 'PKT-205'];
    const randomName = names[Math.floor(Math.random() * names.length)] + '-' + newId.slice(-2);
    const nextIncoming: Packet = {
      id: `in-${newId}`,
      name: randomName,
      dataSize: `${Math.pow(2, Math.floor(Math.random() * 4) + 6)} KB`,
      color: 'from-indigo-500 to-purple-600',
    };

    setTimeout(() => {
      setIncomingPackets((prev) => (prev.length < 4 ? [...prev, nextIncoming] : prev));
    }, 1500);

    const msg = `Ingested [${pkt.name}] into FIFO Buffer at REAR. Buffer load: ${buffer.length + 1}/${BUFFER_CAPACITY}`;
    setLastMessage(msg);
    onNotifyAction?.(msg);
  };

  // Dequeue / Transmit packet
  const handleDispatchFront = () => {
    if (buffer.length === 0) {
      soundEffects.playError();
      const msg = 'Underflow: No packets in buffer to transmit!';
      setLastMessage(msg);
      onNotifyAction?.(msg);
      return;
    }

    soundEffects.playPop();
    const transmitted = buffer[0];
    setBuffer((prev) => prev.slice(1));
    setDispatchedCount((c) => c + 1);

    const pointsGained = 50 * combo;
    setScore((s) => s + pointsGained);
    setCombo((c) => Math.min(5, c + 1));
    onScoreReward?.(pointsGained);

    const msg = `🚀 Dispatched [${transmitted.name}] through Antenna! FIFO order preserved. (+${pointsGained} XP | ${combo}x Combo)`;
    setLastMessage(msg);
    onNotifyAction?.(msg);
  };

  const handleReset = () => {
    soundEffects.playClick();
    setBuffer([
      { id: 'pkt-1', name: 'PKT-101', dataSize: '64 KB', color: 'from-blue-500 to-indigo-600' },
      { id: 'pkt-2', name: 'PKT-102', dataSize: '128 KB', color: 'from-purple-500 to-pink-600' },
    ]);
    setIncomingPackets([
      { id: 'in-1', name: 'PKT-103', dataSize: '256 KB', color: 'from-emerald-500 to-teal-600' },
      { id: 'in-2', name: 'PKT-104', dataSize: '64 KB', color: 'from-amber-500 to-orange-600' },
      { id: 'in-3', name: 'PKT-105', dataSize: '512 KB', color: 'from-cyan-500 to-blue-600' },
    ]);
    setCombo(1);
    setScore(0);
    setDispatchedCount(0);
    setLastMessage('Session reset. Drag arrivals into buffer, drag front packet out to transmit.');
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              LEVEL 6: HIGH-THROUGHPUT PACKET DISPATCHER
              <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Real-Time FIFO Buffer
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag incoming packets into the queue, then drag or transmit the FRONT packet out before overflow occurs!
            </p>
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-bold">
            <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Transmitted: {dispatchedCount}</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>Combo: {combo}x</span>
          </div>

          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>XP: {score}</span>
          </div>
        </div>
      </div>

      {/* Message bar */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 truncate">
          <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
          {lastMessage}
        </span>
        <button
          onClick={handleReset}
          className="text-xs font-sans text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Live Routing Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* 1. TRANSMISSION ANTENNA (DEQUEUE / DELETE TARGET) */}
        <div
          id="packet-exit-antenna"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setIsOverExit(true);
          }}
          onDragLeave={() => setIsOverExit(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsOverExit(false);
            const raw = e.dataTransfer.getData('text/plain');
            if (raw === 'FRONT_PACKET') {
              handleDispatchFront();
            } else if (raw === 'INVALID_PACKET') {
              soundEffects.playError();
              setLastMessage('FIFO Violation! Only the FRONT packet [0] can be transmitted.');
              onNotifyAction?.('FIFO Violation! Only FRONT packet can be transmitted.');
            }
          }}
          onClick={handleDispatchFront}
          className={`lg:col-span-3 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none ${
            isOverExit
              ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 ring-4 ring-emerald-300 dark:ring-emerald-800 scale-102 shadow-lg'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 hover:border-emerald-500 text-slate-600 dark:text-slate-300'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 shadow-xs">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
            TRANSMIT ANTENNA
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
            Drop FRONT packet here or click to DEQUEUE & Transmit
          </span>
        </div>

        {/* 2. FIFO QUEUE PACKET BUFFER */}
        <div
          id="packet-queue-buffer"
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            setIsOverBuffer(true);
          }}
          onDragLeave={() => setIsOverBuffer(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsOverBuffer(false);
            const raw = e.dataTransfer.getData('text/plain');
            try {
              const parsed = JSON.parse(raw);
              if (parsed.type === 'INCOMING_PACKET') {
                handleEnqueuePacket(parsed.packet);
              }
            } catch {}
          }}
          className={`lg:col-span-6 rounded-2xl border-2 p-3.5 flex flex-col justify-between transition-all relative overflow-hidden ${
            buffer.length >= BUFFER_CAPACITY
              ? 'border-rose-400 dark:border-rose-600 bg-rose-50/20 dark:bg-rose-950/20 ring-4 ring-rose-200 dark:ring-rose-900'
              : isOverBuffer
              ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 ring-4 ring-blue-200 dark:ring-blue-800'
              : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-rose-600 dark:text-rose-400 font-bold">← FRONT (Next Transmit)</span>
            <span className="font-bold">FIFO BUFFER: {buffer.length} / {BUFFER_CAPACITY}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">REAR (Drop Arrivals) →</span>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 min-h-[95px]">
            {buffer.length === 0 ? (
              <span className="text-xs text-slate-400 font-mono">Buffer empty. Drag arrivals in from the right.</span>
            ) : (
              <AnimatePresence mode="popLayout">
                {buffer.map((pkt, idx) => {
                  const isFront = idx === 0;
                  return (
                    <motion.div
                      key={pkt.id}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0, x: -30 }}
                      draggable
                      onDragStart={(e) => {
                        if (isFront) {
                          e.dataTransfer.setData('text/plain', 'FRONT_PACKET');
                        } else {
                          e.dataTransfer.setData('text/plain', 'INVALID_PACKET');
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border-2 font-mono flex flex-col items-center justify-center text-center shrink-0 select-none shadow-xs transition-transform ${
                        isFront
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 ring-2 ring-rose-200 dark:ring-rose-800 cursor-grab active:cursor-grabbing hover:scale-105'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-400">
                        {isFront ? 'FRONT [0]' : `[${idx}]`}
                      </span>
                      <span className="font-black text-xs">{pkt.name}</span>
                      <span className="text-[9px] text-slate-500">{pkt.dataSize}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="text-[10px] text-center text-slate-400 font-medium pt-1">
            Drag FRONT packet out to delete/transmit. Drop new arrivals into this box to enqueue.
          </div>
        </div>

        {/* 3. ARRIVING PACKET INGESTION FEED */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>INCOMING FEED</span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-black animate-pulse">
              LIVE ●
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {incomingPackets.map((pkt) => (
              <div
                key={pkt.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify({ type: 'INCOMING_PACKET', packet: pkt })
                  );
                }}
                onClick={() => handleEnqueuePacket(pkt)}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between cursor-grab active:cursor-grabbing hover:border-emerald-400 transition-all text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{pkt.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">{pkt.dataSize}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  Drag in
                </span>
              </div>
            ))}
          </div>

          <span className="text-[10px] text-slate-400 text-center">
            Drag or click an incoming packet to enqueue at the REAR.
          </span>
        </div>
      </div>
    </div>
  );
};
