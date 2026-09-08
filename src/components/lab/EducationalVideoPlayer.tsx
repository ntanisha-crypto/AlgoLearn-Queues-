import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Expand,
  Video,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Upload,
  RefreshCw,
  Layers,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Film,
  X,
  Eye,
  Repeat,
  Zap,
  ShieldAlert,
  Check,
  CornerDownRight,
} from 'lucide-react';
import { soundEffects } from '../../services/sound';
import { LessonData, EducationalScene } from '../../data/labVideoData';

export type { LessonData, EducationalScene };

interface EducationalVideoPlayerProps {
  activeLesson: LessonData;
  customVideoUrl: string | null;
  customVideoName: string | null;
  autoPlayTrigger?: number;
  onUploadClick: () => void;
  onLessonComplete?: (lessonId: number) => void;
}

export const EducationalVideoPlayer: React.FC<EducationalVideoPlayerProps> = ({
  activeLesson,
  customVideoUrl,
  customVideoName,
  autoPlayTrigger,
  onUploadClick,
  onLessonComplete,
}) => {
  const [viewMode, setViewMode] = useState<'video' | 'simulation'>('video');
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(activeLesson.duration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [isHoveringVideo, setIsHoveringVideo] = useState<boolean>(false);
  const [fsControlsVisible, setFsControlsVisible] = useState<boolean>(true);
  const [isHoveringControls, setIsHoveringControls] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(performance.now());
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentSceneIdRef = useRef<number>(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine active video source
  const effectiveVideoSrc = customVideoUrl || activeLesson.videoSrc;
  const isVideoMode = viewMode === 'video' && !!effectiveVideoSrc;
  const totalDuration = videoDuration > 0 ? videoDuration : activeLesson.duration;

  // Sync lesson switch
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    currentSceneIdRef.current = -1;
    setVideoDuration(activeLesson.duration);

    if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = 0;
      nativeVideoRef.current.playbackRate = playbackSpeed;
    }
  }, [activeLesson.id]);

  // Speech synthesis & web audio setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis || null;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
  }, []);

  // Web Audio SFX generator for simulation mode
  const playSfx = useCallback(
    (type: 'push' | 'pop' | 'peek' | 'transition' | 'warning') => {
      if (isMuted || volume === 0 || !audioCtxRef.current) return;
      try {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        const currentVol = isMuted ? 0 : volume * 0.15;

        if (type === 'push') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(420, now);
          osc.frequency.exponentialRampToValueAtTime(840, now + 0.15);
          gain.gain.setValueAtTime(currentVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === 'pop') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(750, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.16);
          gain.gain.setValueAtTime(currentVol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === 'peek') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);
          gain.gain.setValueAtTime(currentVol * 0.8, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.16);
        } else if (type === 'warning') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
          gain.gain.setValueAtTime(currentVol * 0.9, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.25);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(580, now + 0.1);
          gain.gain.setValueAtTime(currentVol * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.14);
        }
      } catch {
        // Fallback gracefully
      }
    },
    [isMuted, volume]
  );

  // Find active scene
  const currentSceneIndex = activeLesson.scenes.findIndex(
    (s) => currentTime >= s.timeStart && currentTime < s.timeEnd
  );
  const activeScene =
    activeLesson.scenes[currentSceneIndex >= 0 ? currentSceneIndex : activeLesson.scenes.length - 1];

  // Speech narration when running simulation mode
  useEffect(() => {
    if (isVideoMode || !isPlaying || isMuted || !synthRef.current) return;
    if (activeScene && activeScene.id !== currentSceneIdRef.current) {
      currentSceneIdRef.current = activeScene.id;
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(activeScene.narration);
      utterance.rate = 1.05 * playbackSpeed;
      utterance.volume = isMuted ? 0 : volume;

      const voices = synthRef.current.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      );
      if (naturalVoice) utterance.voice = naturalVoice;

      synthRef.current.speak(utterance);

      if (activeScene.type === 'push' || activeScene.type === 'enqueue') playSfx('push');
      else if (activeScene.type === 'pop' || activeScene.type === 'dequeue') playSfx('pop');
      else if (activeScene.type === 'peek') playSfx('peek');
      else if (activeScene.type === 'overflow' || activeScene.type === 'underflow') playSfx('warning');
      else playSfx('transition');
    }
  }, [activeScene, isPlaying, isMuted, playbackSpeed, volume, isVideoMode, playSfx]);

  // Simulation mode RAF loop
  useEffect(() => {
    if (isVideoMode) return;

    if (isPlaying) {
      lastTimestampRef.current = performance.now();

      const loop = (timestamp: number) => {
        const delta = (timestamp - lastTimestampRef.current) / 1000;
        lastTimestampRef.current = timestamp;

        setCurrentTime((prev) => {
          const next = prev + delta * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            if (synthRef.current) synthRef.current.cancel();
            if (onLessonComplete) onLessonComplete(activeLesson.id);
            return totalDuration;
          }
          return next;
        });

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);
    } else {
      if (synthRef.current) synthRef.current.cancel();
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDuration, isVideoMode, onLessonComplete, activeLesson.id]);

  // Video element event listeners
  const handleNativeTimeUpdate = () => {
    if (nativeVideoRef.current) {
      setCurrentTime(nativeVideoRef.current.currentTime);
      if (nativeVideoRef.current.ended) {
        setIsPlaying(false);
        if (onLessonComplete) onLessonComplete(activeLesson.id);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (nativeVideoRef.current) {
      const dur = nativeVideoRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        setVideoDuration(dur);
      }
      nativeVideoRef.current.volume = isMuted ? 0 : volume;
      nativeVideoRef.current.muted = isMuted;
      nativeVideoRef.current.playbackRate = playbackSpeed;
    }
  };

  // Fullscreen controls
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    setFsControlsVisible(true);
    resetInactivityTimer();
    if (containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setFsControlsVisible(true);
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Handle external autoPlay trigger (e.g. from WATCH LESSON buttons)
  useEffect(() => {
    if (autoPlayTrigger && autoPlayTrigger > 0) {
      enterFullscreen();
      setIsPlaying(true);
      if (nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = 0;
        nativeVideoRef.current.play().catch(() => {});
      }
    }
  }, [autoPlayTrigger, enterFullscreen]);

  // Play / Pause handler
  const handleTogglePlay = () => {
    soundEffects.playClick();
    if (isVideoMode && nativeVideoRef.current) {
      if (isPlaying) {
        nativeVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        if (nativeVideoRef.current.ended || currentTime >= totalDuration - 0.2) {
          nativeVideoRef.current.currentTime = 0;
          setCurrentTime(0);
        }
        enterFullscreen();
        nativeVideoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            setIsPlaying(false);
          });
      }
    } else {
      if (!isPlaying && currentTime >= totalDuration) {
        setCurrentTime(0);
        currentSceneIdRef.current = -1;
      }
      if (!isPlaying) {
        enterFullscreen();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Restart video
  const handleRestart = () => {
    soundEffects.playClick();
    setCurrentTime(0);
    currentSceneIdRef.current = -1;
    enterFullscreen();
    if (isVideoMode && nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = 0;
      nativeVideoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          enterFullscreen();
        })
        .catch(() => {});
    } else {
      setIsPlaying(true);
    }
  };

  // Step 5s backward or forward
  const handleSkipTime = (seconds: number) => {
    soundEffects.playClick();
    const newTime = Math.min(totalDuration, Math.max(0, currentTime + seconds));
    setCurrentTime(newTime);
    currentSceneIdRef.current = -1;
    if (isVideoMode && nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = newTime;
    }
  };

  // Seek timeline
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    currentSceneIdRef.current = -1;
    if (isVideoMode && nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = seekTime;
    }
  };

  // Scene jumper
  const handleJumpScene = (sceneIndex: number) => {
    if (sceneIndex >= 0 && sceneIndex < activeLesson.scenes.length) {
      soundEffects.playClick();
      const targetTime = activeLesson.scenes[sceneIndex].timeStart;
      setCurrentTime(targetTime);
      currentSceneIdRef.current = -1;
      if (isVideoMode && nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = targetTime;
      }
      enterFullscreen();
      setIsPlaying(true);
    }
  };

  // Speed change
  const handleSpeedChange = (speed: number) => {
    soundEffects.playClick();
    setPlaybackSpeed(speed);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = speed;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.volume = val;
      nativeVideoRef.current.muted = false;
    }
  };

  const handleToggleMute = useCallback(() => {
    soundEffects.playClick();
    setIsMuted((prev) => {
      const nextMuted = !prev;
      if (nativeVideoRef.current) {
        nativeVideoRef.current.muted = nextMuted;
      }
      return nextMuted;
    });
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    soundEffects.playClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement && !isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [enterFullscreen, exitFullscreen, isFullscreen]);

  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      setFsControlsVisible(true);
      if (isFs) {
        resetInactivityTimer();
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcut listeners when focused or in fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkipTime(-5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSkipTime(5);
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isVideoMode, totalDuration, currentTime, isFullscreen, exitFullscreen, toggleFullscreen, handleToggleMute]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressTrackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const seekFromPointer = useCallback(
    (clientX: number) => {
      if (!progressTrackRef.current) return;
      const rect = progressTrackRef.current.getBoundingClientRect();
      const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? clampedX / rect.width : 0;
      const seekTime = Math.max(0, Math.min(ratio * totalDuration, totalDuration));
      setCurrentTime(seekTime);
      currentSceneIdRef.current = -1;
      if (isVideoMode && nativeVideoRef.current) {
        nativeVideoRef.current.currentTime = seekTime;
      }
    },
    [totalDuration, isVideoMode]
  );

  // Auto-hide fullscreen controls timer logic
  const resetInactivityTimer = useCallback(() => {
    setFsControlsVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    // Only auto-hide if in fullscreen AND actively playing AND not dragging AND not hovering over controls
    if (isFullscreen && isPlaying && !isHoveringControls && !isDragging) {
      hideTimerRef.current = setTimeout(() => {
        setFsControlsVisible(false);
      }, 2500);
    }
  }, [isFullscreen, isPlaying, isHoveringControls, isDragging]);

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isFullscreen, isPlaying, isHoveringControls, isDragging, resetInactivityTimer]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    resetInactivityTimer();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    seekFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    resetInactivityTimer();
    seekFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      resetInactivityTimer();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  // Video screen click handler:
  // - In fullscreen: clicking the video screen area while playing toggles control visibility
  //   without pausing or restarting playback, and without exiting fullscreen.
  //   Clicking while paused starts playback.
  // - In normal mode: clicking toggles play/pause.
  const handleVideoAreaClick = (e: React.MouseEvent) => {
    if (isFullscreen) {
      if (isPlaying) {
        setFsControlsVisible((prev) => {
          const next = !prev;
          if (next) {
            resetInactivityTimer();
          } else {
            if (hideTimerRef.current) {
              clearTimeout(hideTimerRef.current);
              hideTimerRef.current = null;
            }
          }
          return next;
        });
      } else {
        handleTogglePlay();
      }
    } else {
      handleTogglePlay();
    }
  };

  const progressPercent =
    totalDuration > 0 ? Math.min(100, Math.max(0, (currentTime / totalDuration) * 100)) : 0;

  const sceneProgress = activeScene
    ? Math.min(
        1,
        Math.max(0, (currentTime - activeScene.timeStart) / (activeScene.timeEnd - activeScene.timeStart || 1))
      )
    : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={() => {
        if (isFullscreen) {
          resetInactivityTimer();
        }
      }}
      onTouchStart={() => {
        if (isFullscreen) {
          resetInactivityTimer();
        }
      }}
      onTouchMove={() => {
        if (isFullscreen) {
          resetInactivityTimer();
        }
      }}
      className={`rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen
          ? `fixed inset-0 z-50 rounded-none w-screen h-screen bg-black p-0 flex flex-col justify-between ${
              !fsControlsVisible && isPlaying ? 'cursor-none' : 'cursor-default'
            }`
          : isTheaterMode
          ? 'fixed inset-0 z-50 rounded-none w-screen h-screen bg-slate-950 p-4 sm:p-6 flex flex-col justify-between'
          : 'p-4 sm:p-6 w-full'
      }`}
    >
      {/* ─── 1. VIDEO HEADER BAR (Normal & Theater Mode) ─── */}
      {!isFullscreen && (
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/70 dark:border-blue-800/70 shadow-2xs shrink-0">
              <Video className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-400 uppercase">
                  {activeLesson.lessonNumber}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                  <Film className="w-2.5 h-2.5" /> Source Video
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase">
                {activeLesson.title}
              </h3>
            </div>
          </div>

          {/* Quick Maximize / Theater View Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTheaterMode((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 ${
                isTheaterMode
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
              }`}
              title={isTheaterMode ? 'Exit Theater View' : 'Theater View (Full Viewport)'}
            >
              <Expand className="w-3.5 h-3.5" />
              <span>{isTheaterMode ? 'Exit Theater' : 'Theater View'}</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Fullscreen Mode (F)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 2. VIDEO DISPLAY SCREEN / INTERACTIVE STAGE ─── */}
      <div
        onMouseEnter={() => setIsHoveringVideo(true)}
        onMouseLeave={() => setIsHoveringVideo(false)}
        className={`w-full overflow-hidden relative flex items-center justify-center select-none ${
          isFullscreen || isTheaterMode
            ? 'w-full flex-1 h-full bg-black'
            : 'rounded-2xl bg-slate-950 border border-slate-800/90 w-full min-h-[580px] sm:min-h-[680px] lg:min-h-[760px] xl:min-h-[820px] aspect-[16/10] sm:aspect-[16/9] shadow-inner'
        }`}
      >
        {customVideoUrl ? (
          <div
            className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer group"
            onClick={handleVideoAreaClick}
          >
            <video
              ref={nativeVideoRef}
              src={customVideoUrl}
              onTimeUpdate={handleNativeTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                if (onLessonComplete) onLessonComplete(activeLesson.id);
              }}
              playsInline
              controls={false}
              className="w-full h-full object-contain bg-black pointer-events-none"
            />

            {/* Glowing Big Center Play Button overlay when paused */}
            {!isPlaying && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer z-10"
              >
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.7)] transform transition-transform group-hover:scale-110 active:scale-95">
                  <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Floating Top Mini HUD */}
            <div
              className={`absolute top-3 left-3 right-3 sm:top-5 sm:left-6 sm:right-6 flex items-center justify-between transition-opacity duration-200 z-30 ${
                isFullscreen
                  ? fsControlsVisible
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                  : isHoveringVideo || !isPlaying
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold border border-white/15 shadow-md">
                  {customVideoName || activeLesson.title}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-blue-300 text-xs font-mono font-bold border border-white/15 shadow-md">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              {isFullscreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exitFullscreen();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-sans text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all"
                  title="Exit Fullscreen (Esc or F)"
                  aria-label="Exit Fullscreen"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ─── ANIMATED EDUCATIONAL ENGINE (UNDISTURBED VOICE AUDIO & BACKGROUND) ─── */
          <div
            onClick={handleVideoAreaClick}
            className="w-full h-full relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-black flex flex-col justify-between p-3 sm:p-5 text-slate-100 cursor-pointer select-none group"
          >
            {/* Native Video Element: Runs the audio track (voice narration) in sync without disruption */}
            {effectiveVideoSrc && (
              <video
                ref={nativeVideoRef}
                src={effectiveVideoSrc}
                onTimeUpdate={handleNativeTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (onLessonComplete) onLessonComplete(activeLesson.id);
                }}
                playsInline
                controls={false}
                className="sr-only"
              />
            )}

            {/* Background grid matrix effect - exactly matching the video's backdrop */}
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #2563eb 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* Top Scene HUD Header */}
            <div
              className={`relative z-30 flex items-center justify-between gap-2 transition-opacity duration-200 ${
                isFullscreen
                  ? fsControlsVisible
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                  : 'opacity-100 pointer-events-auto'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                  SCENE {activeScene?.id || 1}/{activeLesson.scenes.length}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    activeScene?.badgeColor || 'text-blue-300 bg-blue-950/80 border-blue-700/60'
                  }`}
                >
                  {activeScene?.badge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-300 font-semibold px-2 py-0.5 rounded-md bg-black/60 border border-white/10">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
                {isFullscreen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exitFullscreen();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                    title="Exit Fullscreen"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exit</span>
                  </button>
                )}
              </div>
            </div>

            {/* Glowing Big Center Play Button overlay when paused */}
            {!isPlaying && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity cursor-pointer z-20"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(37,99,235,0.8)] transform transition-transform group-hover:scale-110 active:scale-95">
                  <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Middle Stage: Dynamic Data Structure Visualizer */}
            <div className="relative z-10 flex-1 flex items-center justify-center py-4 min-h-0 w-full">
              {/* ───────── LESSON 1: QUEUE DATA STRUCTURE ───────── */}
              {activeLesson.id === 1 && (
                <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col items-center justify-center px-4">
                  {/* SCENE 1: FIFO Principle & Pipeline */}
                  {activeScene?.id === 1 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      {/* Pointers Banner */}
                      <div className="w-full max-w-2xl flex items-center justify-between px-3 font-mono text-sm sm:text-base font-bold">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-950/90 border border-rose-500/70 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse">
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                          <span>FRONT: queue[0] (Exit Point)</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                          <span>REAR: queue[3] (Entry Point)</span>
                          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        </div>
                      </div>

                      {/* Queue Pipeline with animated FIFO Flow */}
                      <div className="w-full max-w-3xl lg:max-w-4xl border-y-2 border-indigo-500/80 rounded-2xl p-4 sm:p-6 lg:p-8 flex items-center justify-between gap-2 sm:gap-4 bg-slate-950/95 shadow-2xl shadow-indigo-950/60 relative overflow-hidden">
                        {/* Animated conveyor pulse line */}
                        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-l from-emerald-500 via-indigo-500 to-rose-500 opacity-90 animate-pulse" />
                        
                        {[10, 20, 30, 40].map((val, idx) => (
                          <div key={val} className="flex items-center gap-2 sm:gap-3">
                            <div
                              className={`w-20 sm:w-28 lg:w-36 py-4 sm:py-6 rounded-2xl flex flex-col items-center justify-center font-mono font-bold border transition-all duration-300 ${
                                idx === 0
                                  ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_26px_rgba(244,63,94,0.8)] scale-105'
                                  : idx === 3
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_26px_rgba(16,185,129,0.8)] scale-105'
                                  : 'bg-slate-900/95 text-slate-200 border-slate-700/80'
                              }`}
                            >
                              <span className="text-xs sm:text-sm opacity-80 font-mono">[{idx}]</span>
                              <span className="text-2xl sm:text-3xl lg:text-4xl font-black my-1">{val}</span>
                              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold">
                                {idx === 0 ? '1ST OUT' : idx === 3 ? 'LAST IN' : 'IN LINE'}
                              </span>
                            </div>
                            {idx < 3 && <span className="text-slate-500 font-mono text-sm sm:text-base select-none">←</span>}
                          </div>
                        ))}
                      </div>

                      {/* Conveyor direction stream */}
                      <div className="flex items-center gap-3 flex-wrap justify-center text-xs sm:text-sm font-mono">
                        <span className="px-4 py-2 rounded-xl bg-indigo-950/90 border border-indigo-700/80 text-indigo-300 font-bold flex items-center gap-2 shadow-sm">
                          <Zap className="w-4 h-4 text-indigo-400" />
                          FIFO Stream: Flowing from REAR (Right) to FRONT (Left)
                        </span>
                        <span className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-medium">
                          First arrived (10) will be first to exit
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 2: Primary Operations Overview */}
                  {activeScene?.id === 2 && (
                    <div className="w-full flex flex-col items-center gap-5">
                      <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-3xl lg:max-w-4xl">
                        {/* Enqueue Card with mini animation */}
                        <div
                          className={`p-4 sm:p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                            sceneProgress < 0.35
                              ? 'bg-emerald-950/90 border-emerald-500 shadow-[0_0_26px_rgba(16,185,129,0.6)] scale-105'
                              : 'bg-slate-900/80 border-slate-800 opacity-75'
                          }`}
                        >
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-base sm:text-lg mb-2">
                            +
                          </div>
                          <span className="font-mono font-black text-sm sm:text-base text-emerald-300">ENQUEUE</span>
                          <span className="text-xs sm:text-sm text-slate-300 mt-1">Inserts at REAR</span>
                          {/* Mini visual animation */}
                          <div className="mt-3 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-black/40 border border-emerald-500/30">
                            <span className="text-xs font-mono text-slate-400">[..]</span>
                            <span className="text-xs font-mono text-slate-400">→</span>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white animate-pulse">
                              +50
                            </span>
                          </div>
                          <span className="mt-2.5 px-2.5 py-1 rounded-md bg-emerald-900/70 text-emerald-300 text-xs font-mono font-bold">
                            O(1) Time
                          </span>
                        </div>

                        {/* Dequeue Card with mini animation */}
                        <div
                          className={`p-4 sm:p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                            sceneProgress >= 0.35 && sceneProgress < 0.7
                              ? 'bg-rose-950/90 border-rose-500 shadow-[0_0_26px_rgba(244,63,94,0.6)] scale-105'
                              : 'bg-slate-900/80 border-slate-800 opacity-75'
                          }`}
                        >
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-base sm:text-lg mb-2">
                            −
                          </div>
                          <span className="font-mono font-black text-sm sm:text-base text-rose-300">DEQUEUE</span>
                          <span className="text-xs sm:text-sm text-slate-300 mt-1">Removes at FRONT</span>
                          {/* Mini visual animation */}
                          <div className="mt-3 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-black/40 border border-rose-500/30">
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                              -10
                            </span>
                            <span className="text-xs font-mono text-slate-400">←</span>
                            <span className="text-xs font-mono text-slate-400">[..]</span>
                          </div>
                          <span className="mt-2.5 px-2.5 py-1 rounded-md bg-rose-900/70 text-rose-300 text-xs font-mono font-bold">
                            O(1) Time
                          </span>
                        </div>

                        {/* Peek Card with mini animation */}
                        <div
                          className={`p-4 sm:p-6 rounded-2xl border flex flex-col items-center text-center transition-all duration-300 ${
                            sceneProgress >= 0.7
                              ? 'bg-amber-950/90 border-amber-500 shadow-[0_0_26px_rgba(245,158,11,0.6)] scale-105'
                              : 'bg-slate-900/80 border-slate-800 opacity-75'
                          }`}
                        >
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base mb-2">
                            <Eye className="w-5 h-5" />
                          </div>
                          <span className="font-mono font-black text-sm sm:text-base text-amber-300">PEEK</span>
                          <span className="text-xs sm:text-sm text-slate-300 mt-1">Inspects FRONT</span>
                          {/* Mini visual animation */}
                          <div className="mt-3 flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-black/40 border border-amber-500/30">
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white">
                              [20]
                            </span>
                            <Eye className="w-3.5 h-3.5 text-amber-400 animate-ping" />
                          </div>
                          <span className="mt-2.5 px-2.5 py-1 rounded-md bg-amber-900/70 text-amber-300 text-xs font-mono font-bold">
                            O(1) Safe
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-slate-300">
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                          Defensive guards: isEmpty() prevents Underflow, isFull() prevents Overflow
                        </span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 3: Enqueue Step-by-Step (VIVID PHYSICAL INSERTION ANIMATION) */}
                  {activeScene?.id === 3 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      {/* Step-by-step indicator bar */}
                      <div className="px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        {sceneProgress < 0.25
                          ? 'Step 1: Check isFull() → FALSE (Slot Available)'
                          : sceneProgress < 0.55
                          ? 'Step 2: Advance REAR pointer: rear++ (3 → 4)'
                          : sceneProgress < 0.85
                          ? 'Step 3: Inserting 50 into queue[4]...'
                          : 'Step 4: queue[4] = 50 Complete in O(1) Time!'}
                      </div>

                      {/* Interactive Queue Stage with incoming element */}
                      <div className="w-full max-w-3xl lg:max-w-4xl flex flex-col items-center gap-3">
                        {/* Floating Incoming Element Token */}
                        <div className="h-10 sm:h-12 flex items-center justify-end w-full pr-8 relative">
                          <div
                            className={`px-4 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border flex items-center gap-2 transition-all duration-500 ${
                              sceneProgress < 0.25
                                ? 'bg-emerald-900/90 border-emerald-400 text-emerald-200 animate-bounce'
                                : sceneProgress < 0.55
                                ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_22px_rgba(16,185,129,0.9)] scale-105'
                                : 'opacity-0 translate-y-3 pointer-events-none'
                            }`}
                          >
                            <span className="text-xs uppercase font-bold text-emerald-300">Incoming:</span>
                            <span className="text-base sm:text-lg font-black">50</span>
                            <ArrowDown className="w-4 h-4 text-emerald-300 animate-pulse" />
                          </div>
                        </div>

                        {/* Pipeline Array */}
                        <div className="w-full border-y-2 border-emerald-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-3 bg-slate-950/95 shadow-2xl relative overflow-hidden">
                          {[10, 20, 30, 40].map((val, idx) => (
                            <div key={val} className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-center font-mono">
                              <span className="text-xs text-slate-400 block">[{idx}]</span>
                              <span className="font-black text-xl sm:text-2xl text-slate-200">{val}</span>
                              <span className="text-[9px] sm:text-xs text-slate-400 block uppercase font-mono font-bold mt-1">
                                {idx === 0 ? 'FRONT' : idx === 3 && sceneProgress < 0.25 ? 'REAR' : 'HOLD'}
                              </span>
                            </div>
                          ))}

                          {/* Slot [4]: Animated Enqueue Landing Spot */}
                          <div
                            className={`w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 rounded-2xl text-center font-mono transition-all duration-500 border ${
                              sceneProgress >= 0.55
                                ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_28px_rgba(16,185,129,0.9)] scale-105'
                                : sceneProgress >= 0.25
                                ? 'bg-emerald-950/70 border-2 border-dashed border-emerald-400 text-emerald-300 animate-pulse'
                                : 'bg-slate-900/40 border border-dashed border-slate-700 text-slate-500'
                            }`}
                            style={{
                              transform:
                                sceneProgress >= 0.55 && sceneProgress < 0.85
                                  ? `translateY(${(0.85 - sceneProgress) * -12}px)`
                                  : 'none',
                            }}
                          >
                            <span className="text-xs block opacity-80">[4]</span>
                            <span className="font-black text-xl sm:text-2xl">
                              {sceneProgress >= 0.55 ? '50' : sceneProgress >= 0.25 ? 'TARGET' : 'EMPTY'}
                            </span>
                            <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-emerald-200 mt-1">
                              {sceneProgress >= 0.25 ? 'NEW REAR' : 'FREE'}
                            </span>
                          </div>
                        </div>

                        {/* Real-time pointer mechanic banner */}
                        <div className="w-full flex items-center justify-between px-3 text-xs sm:text-sm font-mono">
                          <span className="text-slate-400">front = 0 (Fixed)</span>
                          <span className="text-emerald-400 font-bold">
                            {sceneProgress < 0.25 ? 'rear = 3' : 'rear = 4 (Incremented)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-emerald-400">
                        <Check className="w-4 h-4" />
                        <span>Enqueue inserts strictly at REAR in constant O(1) time without shifting!</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 4: Dequeue Step-by-Step (VIVID PHYSICAL DELETION ANIMATION) */}
                  {activeScene?.id === 4 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      {/* Step-by-step indicator bar */}
                      <div className="px-4 py-2 rounded-full bg-rose-950/90 border border-rose-500/70 text-rose-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
                        {sceneProgress < 0.25
                          ? 'Step 1: Check isEmpty() → FALSE (Items Present)'
                          : sceneProgress < 0.60
                          ? 'Step 2: Extract Element at FRONT (10 sliding out)'
                          : sceneProgress < 0.85
                          ? 'Step 3: Advance FRONT pointer: front++ (0 → 1)'
                          : 'Step 4: Dequeue Complete! 20 is the new FRONT'}
                      </div>

                      {/* Interactive Queue Stage with departing element */}
                      <div className="w-full max-w-3xl lg:max-w-4xl flex flex-col items-center gap-3">
                        {/* Pipeline Array */}
                        <div className="w-full border-y-2 border-rose-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-3 bg-slate-950/95 shadow-2xl relative overflow-hidden">
                          {/* Slot [0]: Departing Element 10 */}
                          <div
                            className={`w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 rounded-2xl text-center font-mono transition-all duration-500 border ${
                              sceneProgress < 0.25
                                ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_26px_rgba(244,63,94,0.8)] scale-105'
                                : sceneProgress < 0.65
                                ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_30px_rgba(244,63,94,0.95)]'
                                : 'bg-slate-900/30 border border-dashed border-slate-700 text-slate-600'
                            }`}
                            style={{
                              transform:
                                sceneProgress >= 0.25 && sceneProgress < 0.65
                                  ? `translateX(${-(sceneProgress - 0.25) * 80}px) scale(${1 - (sceneProgress - 0.25) * 0.4})`
                                  : 'none',
                              opacity: sceneProgress >= 0.65 ? 0.35 : Math.max(0.2, 1 - (sceneProgress - 0.25) * 1.5),
                            }}
                          >
                            <span className="text-xs block opacity-80">[0]</span>
                            <span className="font-black text-xl sm:text-2xl">{sceneProgress < 0.65 ? '10' : 'DELETED'}</span>
                            <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-rose-200 mt-1">
                              {sceneProgress < 0.25 ? 'FRONT' : sceneProgress < 0.65 ? 'EXITING' : 'FREED'}
                            </span>
                          </div>

                          {/* Slot [1]: Element 20 (Becoming the New FRONT) */}
                          <div
                            className={`w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 rounded-2xl text-center font-mono transition-all duration-500 border ${
                              sceneProgress >= 0.60
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_28px_rgba(99,102,241,0.9)] scale-105'
                                : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                            }`}
                          >
                            <span className="text-xs text-slate-400 block">[1]</span>
                            <span className="font-black text-xl sm:text-2xl">{20}</span>
                            <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-indigo-200 mt-1">
                              {sceneProgress >= 0.60 ? 'NEW FRONT' : 'IN LINE'}
                            </span>
                          </div>

                          {/* Remaining elements [30, 40, 50] */}
                          {[30, 40, 50].map((val, idx) => (
                            <div key={val} className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-center font-mono text-slate-200">
                              <span className="text-xs text-slate-400 block">[{idx + 2}]</span>
                              <span className="font-black text-xl sm:text-2xl">{val}</span>
                              <span className="text-[9px] sm:text-xs text-slate-400 block uppercase font-mono font-bold mt-1">
                                {idx === 2 ? 'REAR' : 'IN LINE'}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Real-time pointer mechanic banner */}
                        <div className="w-full flex items-center justify-between px-3 text-xs sm:text-sm font-mono">
                          <span className="text-rose-400 font-bold">
                            {sceneProgress < 0.60 ? 'front = 0 (Reading 10)' : 'front = 1 (Advanced to 20)'}
                          </span>
                          <span className="text-slate-400">rear = 4 (Untouched)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-rose-400">
                        <Check className="w-4 h-4" />
                        <span>Dequeue removes FRONT in constant O(1) time without moving remaining items!</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 5: Peek Operation & Pointer Rules Summary */}
                  {activeScene?.id === 5 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      <div className="px-4 py-2 rounded-full bg-amber-950/90 border border-amber-500/70 text-amber-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md">
                        <Eye className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>PEEK: Safe Inspection of queue[front] = 20 (Non-Destructive)</span>
                      </div>

                      {/* Queue Pipeline with radar beam over FRONT */}
                      <div className="w-full max-w-3xl lg:max-w-4xl border-y-2 border-amber-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-3 bg-slate-950/95 shadow-2xl relative overflow-hidden">
                        {/* Slot 0: Freed */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl text-center font-mono text-slate-600">
                          <span className="text-xs block">[0]</span>
                          <span className="text-xs uppercase font-bold mt-1">FREED</span>
                        </div>

                        {/* Inspected Front element (20) with golden scanner glow */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 rounded-2xl text-center font-mono border-2 border-amber-400 bg-amber-600 text-white shadow-[0_0_32px_rgba(245,158,11,0.9)] scale-110 animate-pulse">
                          <span className="text-xs block opacity-80">[1]</span>
                          <span className="font-black text-xl sm:text-2xl">20</span>
                          <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-amber-100 mt-1">
                            PEEK TARGET
                          </span>
                        </div>

                        {[30, 40, 50].map((val, idx) => (
                          <div key={val} className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-center font-mono text-slate-300">
                            <span className="text-xs text-slate-400 block">[{idx + 2}]</span>
                            <span className="font-black text-xl sm:text-2xl">{val}</span>
                            <span className="text-[9px] sm:text-xs text-slate-400 block uppercase font-bold mt-1">
                              {idx === 2 ? 'REAR' : 'HOLD'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs sm:text-sm font-mono flex-wrap justify-center">
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                          <span>🔒</span> FRONT=1, REAR=4 (Pointers completely untouched)
                        </span>
                        <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 font-bold">
                          All Operations: Enqueue, Dequeue, Peek run in O(1)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ───────── LESSON 2: QUEUE OPERATIONS & TYPES ───────── */}
              {activeLesson.id === 2 && (
                <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col items-center justify-center px-4">
                  {/* SCENE 1: The 4 Types of Queues Animated Overview */}
                  {activeScene?.id === 1 && (
                    <div className="w-full grid grid-cols-2 gap-3.5 sm:gap-5 max-w-3xl lg:max-w-4xl">
                      {/* 1. Linear Queue */}
                      <div
                        className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ${
                          sceneProgress < 0.25
                            ? 'bg-blue-950/90 border-blue-500 scale-105 shadow-[0_0_24px_rgba(59,130,246,0.7)]'
                            : 'bg-slate-900/80 border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-mono font-black text-blue-300 flex items-center justify-between">
                          <span>1. Linear Queue</span>
                          <span className="text-sm text-blue-400">→</span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1.5">Single-ended FIFO line; Rear inserts, Front deletes</div>
                        {/* Mini animation graphic */}
                        <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-black/40 border border-blue-500/30 text-xs font-mono">
                          <span className="text-rose-400">Exit ←</span>
                          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold">10 | 20 | 30</span>
                          <span className="text-emerald-400">← Enter</span>
                        </div>
                      </div>

                      {/* 2. Circular Queue */}
                      <div
                        className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ${
                          sceneProgress >= 0.25 && sceneProgress < 0.5
                            ? 'bg-emerald-950/90 border-emerald-500 scale-105 shadow-[0_0_24px_rgba(16,185,129,0.7)]'
                            : 'bg-slate-900/80 border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-mono font-black text-emerald-300 flex items-center justify-between">
                          <span>2. Circular Queue</span>
                          <Repeat className="w-4 h-4 text-emerald-400 animate-spin" />
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1.5">Modulo wrap: (rear+1)%MAX loops back to index 0</div>
                        {/* Mini animation graphic */}
                        <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-black/40 border border-emerald-500/30 text-xs font-mono">
                          <span className="text-emerald-300 font-bold">↺ Wraps [4] ➔ [0] (Zero Waste)</span>
                        </div>
                      </div>

                      {/* 3. Priority Queue */}
                      <div
                        className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ${
                          sceneProgress >= 0.5 && sceneProgress < 0.75
                            ? 'bg-amber-950/90 border-amber-500 scale-105 shadow-[0_0_24px_rgba(245,158,11,0.7)]'
                            : 'bg-slate-900/80 border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-mono font-black text-amber-300 flex items-center justify-between">
                          <span>3. Priority Queue</span>
                          <Zap className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1.5">Weighted elements; highest priority extracted first</div>
                        {/* Mini animation graphic */}
                        <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs font-mono">
                          <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold animate-pulse">Pri: 1 Leapfrogs</span>
                        </div>
                      </div>

                      {/* 4. Deque */}
                      <div
                        className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 ${
                          sceneProgress >= 0.75
                            ? 'bg-purple-950/90 border-purple-500 scale-105 shadow-[0_0_24px_rgba(168,85,247,0.7)]'
                            : 'bg-slate-900/80 border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="text-sm sm:text-base font-mono font-black text-purple-300 flex items-center justify-between">
                          <span>4. Deque (Double-Ended)</span>
                          <span className="text-sm text-purple-400">⟷</span>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-300 mt-1.5">Insert & delete at both Front and Rear endpoints</div>
                        {/* Mini animation graphic */}
                        <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-black/40 border border-purple-500/30 text-xs font-mono">
                          <span className="text-purple-300 font-bold">⟵ Dual Front | Dual Rear ⟶</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENE 2: Linear Queue & False Overflow (ANIMATED FORCEFIELD BLOCKED) */}
                  {activeScene?.id === 2 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      <div className="px-4 py-2 rounded-full bg-rose-950/90 border border-rose-500/70 text-rose-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 animate-pulse shadow-md">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>FALSE OVERFLOW: rear == MAX-1, but slots [0, 1] are empty!</span>
                      </div>

                      {/* Linear Array with blocked incoming 60 */}
                      <div className="w-full max-w-3xl lg:max-w-4xl border-y-2 border-rose-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-3 bg-slate-950/95 shadow-2xl relative">
                        {/* Vacant slot 0 */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/40 border-2 border-dashed border-rose-500/50 rounded-2xl text-center font-mono text-rose-400 animate-pulse">
                          <span className="text-xs block">[0]</span>
                          <span className="text-sm sm:text-base uppercase font-bold text-rose-300">EMPTY</span>
                          <span className="text-[9px] sm:text-xs block text-rose-400 mt-1">WASTED</span>
                        </div>
                        {/* Vacant slot 1 */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/40 border-2 border-dashed border-rose-500/50 rounded-2xl text-center font-mono text-rose-400 animate-pulse">
                          <span className="text-xs block">[1]</span>
                          <span className="text-sm sm:text-base uppercase font-bold text-rose-300">EMPTY</span>
                          <span className="text-[9px] sm:text-xs block text-rose-400 mt-1">WASTED</span>
                        </div>
                        {/* Active elements 30, 40, 50 */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono">
                          <span className="text-xs text-slate-400 block">[2]</span>
                          <span className="font-black text-xl sm:text-2xl text-slate-200">30</span>
                          <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-rose-300 mt-1">FRONT</span>
                        </div>
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono">
                          <span className="text-xs text-slate-400 block">[3]</span>
                          <span className="font-black text-xl sm:text-2xl text-slate-200">40</span>
                        </div>
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-rose-900/90 border border-rose-500 rounded-2xl text-center font-mono text-white">
                          <span className="text-xs text-rose-300 block">[4]</span>
                          <span className="font-black text-xl sm:text-2xl">50</span>
                          <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-rose-200 mt-1">REAR (END)</span>
                        </div>

                        {/* Animated Blocked Incoming element 60 */}
                        <div
                          className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 font-mono text-red-400 animate-bounce z-20"
                          style={{
                            transform: `translateX(${Math.sin(currentTime * 5) * 4}px)`,
                          }}
                        >
                          <div className="w-14 sm:w-16 py-2.5 rounded-xl bg-red-950 border-2 border-red-500 text-center font-black text-white shadow-[0_0_20px_rgba(239,68,68,0.9)]">
                            60
                          </div>
                          <span className="text-[10px] sm:text-xs font-black bg-red-950/95 px-2 py-0.5 rounded border border-red-500/90 text-red-300">
                            ⛔ BLOCKED
                          </span>
                        </div>
                      </div>

                      {/* Curved indicator showing wasted memory */}
                      <div className="text-xs sm:text-sm font-mono text-rose-300 text-center flex items-center gap-2 bg-rose-950/60 px-4 py-2 rounded-xl border border-rose-800/60">
                        <CornerDownRight className="w-4 h-4 text-rose-400 rotate-180" />
                        <span>Memory Paradox: 2 slots are free at front, but linear queue cannot loop back!</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 3: Circular Queue Modulo Wraparound (ANIMATED ORBITAL WRAPAROUND) */}
                  {activeScene?.id === 3 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      <div className="px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md">
                        <Repeat className="w-4 h-4 text-emerald-400 animate-spin" />
                        <span>FORMULA: (rear + 1) % MAX = (4 + 1) % 5 = 0 (Loops back!)</span>
                      </div>

                      {/* Circular wrap representation with orbital trajectory */}
                      <div className="w-full max-w-3xl lg:max-w-4xl border-y-2 border-emerald-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-2 sm:gap-3 bg-slate-950/95 shadow-2xl relative">
                        {/* Slot 0 reclaimed by 60 with animated landing */}
                        <div
                          className={`w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 rounded-2xl text-center font-mono transition-all duration-500 border ${
                            sceneProgress >= 0.35
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_28px_rgba(16,185,129,0.9)] scale-105 animate-pulse'
                              : 'bg-slate-900/50 border-dashed border-emerald-500/50 text-emerald-400'
                          }`}
                        >
                          <span className="text-xs block opacity-80">[0]</span>
                          <span className="font-black text-xl sm:text-2xl">{sceneProgress >= 0.35 ? '60' : 'WRAP'}</span>
                          <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-emerald-200 mt-1">
                            {sceneProgress >= 0.35 ? 'NEW REAR' : 'FREE'}
                          </span>
                        </div>

                        {/* Slot 1: Free */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl text-center font-mono text-slate-400">
                          <span className="text-xs block">[1]</span>
                          <span className="text-sm uppercase font-bold mt-1">FREE</span>
                        </div>

                        {/* Elements 30, 40, 50 */}
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono text-slate-200">
                          <span className="text-xs text-slate-400 block">[2]</span>
                          <span className="font-black text-xl sm:text-2xl">30</span>
                          <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-rose-300 mt-1">FRONT</span>
                        </div>
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono text-slate-200">
                          <span className="text-xs text-slate-400 block">[3]</span>
                          <span className="font-black text-xl sm:text-2xl">40</span>
                        </div>
                        <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono text-slate-200">
                          <span className="text-xs text-slate-400 block">[4]</span>
                          <span className="font-black text-xl sm:text-2xl">50</span>
                          <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-slate-400 mt-1">OLD REAR</span>
                        </div>

                        {/* Animated curved orbital bridge trajectory line */}
                        <div className="absolute inset-x-8 -top-3 flex items-center justify-between text-xs font-mono font-bold text-emerald-400 pointer-events-none">
                          <span className="animate-pulse">⟵ [0] Wrapped</span>
                          <span className="text-emerald-500">┄┄┄┄ Modulo Arc ┄┄┄┄</span>
                          <span>[4]</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-emerald-300">
                        <Check className="w-4 h-4" />
                        <span>Zero wasted memory: Wraparound connects end back to front seamlessly in O(1)!</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 4: Priority Queue Operations (ANIMATED LEAPFROGGING PRIORITY SCHEDULING) */}
                  {activeScene?.id === 4 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      <div className="px-4 py-2 rounded-full bg-amber-950/90 border border-amber-500/70 text-amber-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>PRIORITY QUEUE: Highest Priority Extracted First (Heap-Ordered)</span>
                      </div>

                      {/* Items with priority rank animation */}
                      <div className="w-full max-w-3xl lg:max-w-4xl border-y-2 border-amber-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-around gap-3 bg-slate-950/95 shadow-2xl relative">
                        {/* Task C: High Priority Leapfrogs to Front */}
                        <div
                          className={`w-36 sm:w-44 py-4 sm:py-6 rounded-2xl text-center font-mono border-2 transition-all duration-500 ${
                            sceneProgress >= 0.35
                              ? 'border-amber-400 bg-amber-600 text-white shadow-[0_0_28px_rgba(245,158,11,0.9)] scale-105 animate-pulse order-1'
                              : 'border-amber-500/60 bg-amber-950/60 text-amber-200 order-3'
                          }`}
                          style={{
                            transform: sceneProgress >= 0.35 ? 'translateY(-4px)' : 'none',
                          }}
                        >
                          <span className="text-xs text-amber-100 block font-bold">TASK C (Emergency)</span>
                          <span className="font-black text-xl sm:text-2xl">VAL: 99</span>
                          <span className="text-[10px] sm:text-xs block px-2 py-1 rounded bg-amber-950 text-amber-300 mt-2 font-black uppercase">
                            PRIORITY 1 (HIGH)
                          </span>
                        </div>

                        {/* Task B: Medium Priority */}
                        <div className="w-32 sm:w-40 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono order-2">
                          <span className="text-xs text-slate-400 block">TASK B</span>
                          <span className="font-black text-lg sm:text-xl text-slate-200">VAL: 70</span>
                          <span className="text-[10px] sm:text-xs block px-2 py-1 rounded bg-blue-900/80 text-blue-300 mt-2 font-bold">
                            Pri: 2 (Normal)
                          </span>
                        </div>

                        {/* Task A: Low Priority */}
                        <div className="w-32 sm:w-40 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono order-3">
                          <span className="text-xs text-slate-400 block">TASK A</span>
                          <span className="font-black text-lg sm:text-xl text-slate-200">VAL: 40</span>
                          <span className="text-[10px] sm:text-xs block px-2 py-1 rounded bg-slate-800 text-slate-300 mt-2 font-bold">
                            Pri: 3 (Low)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-amber-300">
                        <CornerDownRight className="w-4 h-4 text-amber-400" />
                        <span>Task C (Priority 1) leaps forward and is dequeued first regardless of arrival time!</span>
                      </div>
                    </div>
                  )}

                  {/* SCENE 5: Deque (Double-Ended Queue) Operations (4-WAY DUAL INSERTION/DELETION) */}
                  {activeScene?.id === 5 && (
                    <div className="w-full flex flex-col items-center gap-4 sm:gap-6">
                      <div className="px-4 py-2 rounded-full bg-purple-950/90 border border-purple-500/70 text-purple-300 text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-md">
                        <Repeat className="w-4 h-4 text-purple-400" />
                        <span>DEQUE: 4-Way Insertion & Deletion at Both Ends in O(1)</span>
                      </div>

                      {/* Deque visual pipeline with bidirectional active controls */}
                      <div className="w-full max-w-3xl lg:max-w-4xl border-y-2 border-purple-500/80 rounded-2xl p-4 sm:p-6 flex items-center justify-between gap-3 bg-slate-950/95 shadow-2xl relative">
                        {/* Front End Actions with active highlight */}
                        <div className="flex flex-col gap-2 font-mono font-bold text-xs">
                          <div
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                              sceneProgress < 0.25
                                ? 'bg-emerald-600 border-emerald-400 text-white scale-105 shadow-[0_0_16px_rgba(16,185,129,0.7)]'
                                : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                            }`}
                          >
                            <span>+</span>
                            <span>insertFront</span>
                          </div>
                          <div
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                              sceneProgress >= 0.5 && sceneProgress < 0.75
                                ? 'bg-rose-600 border-rose-400 text-white scale-105 shadow-[0_0_16px_rgba(244,63,94,0.7)]'
                                : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                            }`}
                          >
                            <span>−</span>
                            <span>deleteFront</span>
                          </div>
                        </div>

                        {/* Deque Central Body */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-purple-900/80 border border-purple-500 rounded-2xl text-center font-mono text-white">
                            <span className="text-xs block text-purple-200">[0]</span>
                            <span className="font-black text-xl sm:text-2xl">25</span>
                            <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-purple-200 mt-1">FRONT</span>
                          </div>
                          <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-slate-900 border border-slate-700 rounded-2xl text-center font-mono text-slate-200">
                            <span className="text-xs block text-slate-400">[1]</span>
                            <span className="font-black text-xl sm:text-2xl">50</span>
                          </div>
                          <div className="w-16 sm:w-24 lg:w-28 py-3.5 sm:py-5 bg-purple-900/80 border border-purple-500 rounded-2xl text-center font-mono text-white">
                            <span className="text-xs block text-purple-200">[2]</span>
                            <span className="font-black text-xl sm:text-2xl">75</span>
                            <span className="text-[9px] sm:text-xs block font-extrabold uppercase text-purple-200 mt-1">REAR</span>
                          </div>
                        </div>

                        {/* Rear End Actions with active highlight */}
                        <div className="flex flex-col gap-2 font-mono font-bold text-xs">
                          <div
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                              sceneProgress >= 0.25 && sceneProgress < 0.5
                                ? 'bg-emerald-600 border-emerald-400 text-white scale-105 shadow-[0_0_16px_rgba(16,185,129,0.7)]'
                                : 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                            }`}
                          >
                            <span>+</span>
                            <span>insertRear</span>
                          </div>
                          <div
                            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                              sceneProgress >= 0.75
                                ? 'bg-rose-600 border-rose-400 text-white scale-105 shadow-[0_0_16px_rgba(244,63,94,0.7)]'
                                : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                            }`}
                          >
                            <span>−</span>
                            <span>deleteRear</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-purple-300">
                        <Check className="w-4 h-4" />
                        <span>Unifies Stack (LIFO) and Queue (FIFO) in constant O(1) time per operation!</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Scene Narration & Pedagogical Concept HUD */}
            <div className="relative z-20 w-full max-w-2xl mx-auto mt-2">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/85 border border-slate-800/90 backdrop-blur-md shadow-lg flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono font-bold text-blue-300 leading-tight">
                    {activeScene?.title || activeLesson.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
                    {activeScene?.keyConcept || activeScene?.narration}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. VIDEO CONTROLS & FLOATING TOOLBAR ─── */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseEnter={() => {
          setIsHoveringControls(true);
          setFsControlsVisible(true);
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          setIsHoveringControls(false);
          resetInactivityTimer();
        }}
        onFocusCapture={() => setFsControlsVisible(true)}
        className={`w-full transition-all duration-300 ${
          isFullscreen
            ? `absolute bottom-4 left-4 right-4 sm:left-8 sm:right-8 z-30 p-4 sm:p-5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/15 shadow-2xl text-white transition-opacity duration-200 ${
                fsControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`
            : 'pt-5 mt-2 space-y-3'
        }`}
      >
        {/* TOP PROGRESS BAR (Draggable Scrubber + Circular Thumb) */}
        <div className="w-full select-none">
          <div
            ref={progressTrackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative w-full h-6 flex items-center cursor-pointer group touch-none"
            role="slider"
            aria-label="Seek Video Timeline"
            aria-valuemin={0}
            aria-valuemax={totalDuration}
            aria-valuenow={currentTime}
          >
            {/* Horizontal Track Background */}
            <div
              className={`w-full h-1.5 sm:h-2 rounded-full transition-all relative overflow-hidden ${
                isFullscreen
                  ? 'bg-white/20 group-hover:h-2.5'
                  : 'bg-slate-200 dark:bg-slate-800 group-hover:h-2.5'
              }`}
            >
              {/* Accent Fill */}
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-[width] duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Circular Draggable Scrubber Thumb */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-blue-600 dark:border-blue-400 bg-white shadow-md transition-transform duration-75 pointer-events-none ${
                isDragging ? 'scale-125 ring-4 ring-blue-500/30' : 'group-hover:scale-110'
              }`}
              style={{ left: `calc(${progressPercent}% - 8px)` }}
            />
          </div>

          {/* TIME DISPLAY (Left: Current, Right: Total) */}
          <div className="flex items-center justify-between font-mono text-xs sm:text-sm font-semibold pt-1">
            <span
              className={
                isFullscreen ? 'text-white font-bold' : 'text-slate-900 dark:text-slate-100 font-bold'
              }
            >
              {formatTime(currentTime)}
            </span>
            <span
              className={
                isFullscreen ? 'text-slate-400 font-medium' : 'text-slate-500 dark:text-slate-400 font-medium'
              }
            >
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>

        {/* CONTROLS TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pt-1">
          {/* Left: Rewind 10s, Pause/Play, Forward 10s */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Rewind 10s */}
            <button
              onClick={() => handleSkipTime(-10)}
              className={`p-2.5 sm:p-3 rounded-2xl font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs group ${
                isFullscreen
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
              }`}
              title="Rewind 10 seconds"
              aria-label="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-rotate-12 transition-transform" />
            </button>

            {/* Central Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500 hover:from-blue-800 hover:via-blue-700 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 transition-all active:scale-95 cursor-pointer tracking-wide"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  <span>PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                  <span>PLAY</span>
                </>
              )}
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => handleSkipTime(10)}
              className={`p-2.5 sm:p-3 rounded-2xl font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs group ${
                isFullscreen
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
              }`}
              title="Forward 10 seconds"
              aria-label="Forward 10 seconds"
            >
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>

          {/* Middle: Playback Speed Selector (0.5x, 1x, 1.5x, 2x) */}
          <div
            className={`flex items-center rounded-2xl p-1 font-mono text-xs ${
              isFullscreen
                ? 'bg-white/10 border border-white/15'
                : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : isFullscreen
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                aria-label={`Set playback speed to ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Right: Volume Slider & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Volume Control */}
            <div
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
                isFullscreen
                  ? 'bg-white/10 border border-white/15 text-white'
                  : 'bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              <button
                onClick={handleToggleMute}
                className="hover:text-blue-500 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume Slider"
                className="w-16 sm:w-20 h-1.5 rounded-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className={`p-2.5 sm:p-3 rounded-2xl font-bold transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs ${
                isFullscreen
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
              }`}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
