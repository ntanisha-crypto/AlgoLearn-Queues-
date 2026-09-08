import React, { useState } from 'react';
import { Printer, Cpu, Server, Radio, Play, Plus, RotateCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundEffects } from '../../services/sound';

export const InteractiveQueueApplicationsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'printer' | 'cpu' | 'server' | 'streaming'>('printer');

  // Printer State
  const [printJobs, setPrintJobs] = useState<{ id: number; name: string; pages: number }[]>([
    { id: 1, name: 'Tax_Return.pdf', pages: 4 },
    { id: 2, name: 'Lecture_Notes.docx', pages: 12 },
    { id: 3, name: 'Invoice_890.pdf', pages: 2 },
  ]);
  const [printedJob, setPrintedJob] = useState<string | null>(null);

  // CPU Round-Robin State
  const [processes, setProcesses] = useState<{ pid: string; burstTime: number }[]>([
    { pid: 'P1', burstTime: 8 },
    { pid: 'P2', burstTime: 4 },
    { pid: 'P3', burstTime: 6 },
  ]);
  const [currentCpu, setCurrentCpu] = useState<string | null>(null);

  const handlePrintNext = () => {
    if (printJobs.length === 0) return;
    soundEffects.playPop();
    const job = printJobs[0];
    setPrintJobs(printJobs.slice(1));
    setPrintedJob(`Completed: ${job.name} (${job.pages} pages)`);
    setTimeout(() => setPrintedJob(null), 3000);
  };

  const handleAddPrintJob = () => {
    soundEffects.playPush();
    const newId = printJobs.length + 10;
    setPrintJobs([...printJobs, { id: newId, name: `Report_${newId}.pdf`, pages: 5 }]);
  };

  const handleCpuStep = () => {
    if (processes.length === 0) return;
    soundEffects.playClick();
    const active = processes[0];
    const QUANTUM = 4;
    const remaining = Math.max(0, active.burstTime - QUANTUM);

    if (remaining > 0) {
      // Moves to REAR of queue
      setProcesses([...processes.slice(1), { pid: active.pid, burstTime: remaining }]);
      setCurrentCpu(`Executed ${active.pid} for ${QUANTUM}ms (Remaining: ${remaining}ms). Moved to REAR!`);
    } else {
      // Process finished
      setProcesses(processes.slice(1));
      setCurrentCpu(`Finished ${active.pid}! Dequeued permanently.`);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Real-World Systems Powered by Queues</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-900/40">
              ARCHITECTURE IN PRODUCTION
            </span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operating systems, networks, and distributed systems depend entirely on Queues.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('printer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'printer'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Spooler</span>
          </button>
          <button
            onClick={() => setActiveTab('cpu')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'cpu'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU Scheduling</span>
          </button>
        </div>
      </div>

      {/* Printer Demo */}
      {activeTab === 'printer' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-blue-600" />
                OS Print Queue (FIFO)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Oldest job prints first
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-2 min-h-[75px]">
              {printJobs.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 italic py-2">
                  No print jobs pending. All documents printed!
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {printJobs.map((job, idx) => (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, x: -30 }}
                      className={`p-2.5 rounded-xl border flex flex-col justify-center min-w-[140px] text-xs font-mono ${
                        idx === 0
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                        <span className={idx === 0 ? 'text-rose-600' : 'text-slate-400'}>
                          {idx === 0 ? 'NEXT IN LINE' : `WAITING #${idx + 1}`}
                        </span>
                        <span>{job.pages}p</span>
                      </div>
                      <span className="font-bold truncate">{job.name}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {printedJob && (
              <div className="mt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{printedJob}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddPrintJob}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enqueue Print Job</span>
              </button>
              <button
                onClick={handlePrintNext}
                disabled={printJobs.length === 0}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Next (FRONT)</span>
              </button>
            </div>
            <button
              onClick={() => {
                setPrintJobs([
                  { id: 1, name: 'Tax_Return.pdf', pages: 4 },
                  { id: 2, name: 'Lecture_Notes.docx', pages: 12 },
                  { id: 3, name: 'Invoice_890.pdf', pages: 2 },
                ]);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-mono"
            >
              Reset Jobs
            </button>
          </div>
        </div>
      )}

      {/* CPU Round Robin Demo */}
      {activeTab === 'cpu' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" />
                CPU Ready Queue (Time Quantum = 4ms)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Round-Robin Circular FIFO
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-2 min-h-[75px]">
              {processes.length === 0 ? (
                <div className="text-xs font-mono text-slate-400 italic py-2">
                  Ready queue empty! All processes finished execution.
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {processes.map((proc, idx) => (
                    <motion.div
                      key={proc.pid}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5, y: -20 }}
                      className={`p-2.5 rounded-xl border flex flex-col justify-center min-w-[130px] text-xs font-mono ${
                        idx === 0
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                        <span className={idx === 0 ? 'text-emerald-600' : 'text-slate-400'}>
                          {idx === 0 ? 'ACTIVE CPU' : 'READY QUEUE'}
                        </span>
                        <span>{proc.burstTime}ms</span>
                      </div>
                      <span className="font-bold text-sm">{proc.pid}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {currentCpu && (
              <div className="mt-2 text-xs font-mono text-blue-600 dark:text-blue-400">
                {currentCpu}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleCpuStep}
              disabled={processes.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-40 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute 4ms Time Slice</span>
            </button>
            <button
              onClick={() => {
                setProcesses([
                  { pid: 'P1', burstTime: 8 },
                  { pid: 'P2', burstTime: 4 },
                  { pid: 'P3', burstTime: 6 },
                ]);
                setCurrentCpu(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-600 font-mono"
            >
              Reset Processes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
