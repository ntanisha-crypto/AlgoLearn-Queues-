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
  X,
} from 'lucide-react';
import { LessonData, EducationalScene } from '../../data/labVideoData';
import { AlgoLearnLogo } from '../common/AlgoLearnLogo';

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
  onLessonComplete,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(activeLesson.duration || 40);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine active video source
  const effectiveVideoSrc = customVideoUrl || activeLesson.videoSrc;
  const totalDuration = videoDuration > 0 ? videoDuration : activeLesson.duration || 40;
  const progressPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (currentTime / totalDuration) * 100)) : 0;

  // Format seconds into MM:SS
  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0 || !isFinite(secs)) return '00:00';
    const totalSecs = Math.floor(secs);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const mm = m < 10 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `${mm}:${ss}`;
  };

  // Sync when active lesson or custom video changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setVideoDuration(activeLesson.duration || 40);

    if (nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = 0;
      nativeVideoRef.current.playbackRate = playbackSpeed;
    }
  }, [effectiveVideoSrc, activeLesson.id, activeLesson.duration, playbackSpeed]);

  // Handle autoPlayTrigger
  useEffect(() => {
    if (autoPlayTrigger && autoPlayTrigger > 0 && nativeVideoRef.current) {
      nativeVideoRef.current.currentTime = 0;
      nativeVideoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [autoPlayTrigger]);

  // Handle Fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  // Auto-hide controls timer
  const resetHideTimer = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, resetHideTimer]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input / textarea typing
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      } else if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSkip(5);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    if (!nativeVideoRef.current) return;
    if (nativeVideoRef.current.paused) {
      nativeVideoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      nativeVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Restart video to 00:00 and play
  const handleRestart = () => {
    if (!nativeVideoRef.current) return;
    nativeVideoRef.current.currentTime = 0;
    setCurrentTime(0);
    nativeVideoRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => {});
  };

  // Skip time forward / backward
  const handleSkip = (seconds: number) => {
    if (!nativeVideoRef.current) return;
    const newTime = Math.max(0, Math.min(totalDuration, nativeVideoRef.current.currentTime + seconds));
    nativeVideoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Speed change
  const handleSpeedChange = (spd: number) => {
    setPlaybackSpeed(spd);
    if (nativeVideoRef.current) {
      nativeVideoRef.current.playbackRate = spd;
    }
  };

  // Volume slider
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      if (nativeVideoRef.current) nativeVideoRef.current.muted = true;
    } else {
      setIsMuted(false);
      if (nativeVideoRef.current) {
        nativeVideoRef.current.muted = false;
        nativeVideoRef.current.volume = val;
      }
    }
  };

  // Mute toggle
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (nativeVideoRef.current) {
        nativeVideoRef.current.muted = false;
        nativeVideoRef.current.volume = volume > 0 ? volume : 0.85;
      }
    } else {
      setIsMuted(true);
      if (nativeVideoRef.current) {
        nativeVideoRef.current.muted = true;
      }
    }
  };

  // Fullscreen actions
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // Enter Fullscreen
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      } else {
        setIsFullscreen(true);
      }
    } else {
      // Exit Fullscreen
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if ((document as any).webkitFullscreenElement && (document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Video Time Update
  const handleNativeTimeUpdate = () => {
    if (nativeVideoRef.current && !isScrubbing) {
      setCurrentTime(nativeVideoRef.current.currentTime);
    }
  };

  // Video Metadata Loaded
  const handleLoadedMetadata = () => {
    if (nativeVideoRef.current) {
      const dur = nativeVideoRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        setVideoDuration(dur);
      }
      nativeVideoRef.current.playbackRate = playbackSpeed;
      nativeVideoRef.current.volume = isMuted ? 0 : volume;
    }
  };

  // Progress Bar Seek & Dragging
  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsScrubbing(true);
    handleSeekUpdate(e);
  };

  const handleSeekUpdate = useCallback(
    (e: MouseEvent | TouchEvent | React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !nativeVideoRef.current || totalDuration <= 0) return;
      const rect = progressBarRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clickPos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const newTime = clickPos * totalDuration;
      nativeVideoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [totalDuration]
  );

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleSeekUpdate(e);
    };
    const handleMouseUp = () => {
      setIsScrubbing(false);
    };
    const handleTouchMove = (e: TouchEvent) => {
      handleSeekUpdate(e);
    };
    const handleTouchEnd = () => {
      setIsScrubbing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isScrubbing, handleSeekUpdate]);

  return (
    <div
      ref={containerRef}
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      onMouseLeave={() => {
        if (isPlaying) setControlsVisible(false);
      }}
      className={`relative w-full overflow-hidden select-none bg-black transition-all duration-300 flex items-center justify-center ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-black'
          : 'rounded-2xl sm:rounded-3xl border border-slate-800/90 shadow-2xl aspect-video max-h-[85vh]'
      }`}
    >
      {/* ─── 1. FULL-SCREEN VIDEO (PRESERVES ORIGINAL ASPECT RATIO, FRAMES, AND QUALITY) ─── */}
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
        onClick={handleTogglePlay}
        onDoubleClick={toggleFullscreen}
        playsInline
        controls={false}
        className="w-full h-full object-contain bg-black cursor-pointer"
      />

      {/* ─── 2 & 3 & 4. TOP HUD (TITLE, TIMER, FULLSCREEN/EXIT FULLSCREEN) ─── */}
      <div
        className={`absolute top-3 sm:top-5 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between pointer-events-none z-30 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top-Left: Topic Title Badge & Timer Badge */}
        <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto flex-wrap">
          {/* 2. TOP-LEFT VIDEO TITLE BADGE */}
          <div className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold tracking-wider uppercase border border-white/20 shadow-lg select-none">
            {customVideoName || activeLesson.title}
          </div>

          {/* 3. TOP-LEFT TIMER BADGE */}
          <div className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-semibold border border-white/20 shadow-lg select-none">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>

        {/* 4. TOP-RIGHT FULLSCREEN / EXIT FULLSCREEN CONTROL */}
        <div className="pointer-events-auto">
          {isFullscreen ? (
            <button
              onClick={exitFullscreen}
              className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all select-none"
              title="Exit Fullscreen (Esc or F)"
              aria-label="Exit Fullscreen"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Exit Fullscreen</span>
            </button>
          ) : (
            <button
              onClick={toggleFullscreen}
              className="px-3.5 py-1.5 rounded-full bg-black/75 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 transition-all select-none"
              title="Enter Fullscreen (F)"
              aria-label="Enter Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5 stroke-[2]" />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle AlgoLearn Watermark in Bottom-Right (as seen in reference design) */}
      <div
        className={`absolute bottom-28 right-4 sm:bottom-32 sm:right-6 pointer-events-none select-none opacity-80 z-20 hidden sm:flex items-center transition-opacity duration-300 ${
          controlsVisible ? 'opacity-80' : 'opacity-30'
        }`}
      >
        <AlgoLearnLogo size="sm" showSubtitle={true} />
      </div>

      {/* ─── 5. BOTTOM VIDEO CONTROL BAR (MODERN FLOATING CONTROL PANEL) ─── */}
      <div
        className={`absolute bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 max-w-4xl mx-auto z-30 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col gap-2.5 sm:gap-3">
          {/* 10. PROGRESS / SEEK BAR */}
          <div
            ref={progressBarRef}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            className="relative w-full h-4 sm:h-5 flex items-center cursor-pointer group select-none"
            title="Click or drag to seek"
            role="slider"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={totalDuration}
            aria-label="Video Seek Bar"
          >
            {/* Background Track Rail */}
            <div className="w-full h-1.5 sm:h-2 bg-slate-800 rounded-full overflow-hidden relative">
              {/* Progress Fill */}
              <div
                className="h-full bg-blue-600 rounded-full transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Circular Thumb Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform group-hover:scale-125"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Current Time & Total Duration display row */}
          <div className="flex items-center justify-between font-mono text-[11px] sm:text-xs font-bold px-0.5 select-none">
            <span className="text-white px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10">
              {formatTime(currentTime)}
            </span>
            <span className="text-white px-2.5 py-0.5 rounded-md bg-black/60 border border-white/10">
              {formatTime(totalDuration)}
            </span>
          </div>

          {/* Controls Bottom Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 pt-0.5">
            {/* Left Controls: Restart, Play/Pause, Forward 10s */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* 7. RESTART BUTTON */}
              <button
                onClick={handleRestart}
                title="Restart Video (00:00)"
                aria-label="Restart Video"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* 6. PLAY / PAUSE BUTTON */}
              <button
                onClick={handleTogglePlay}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/40 transition-all cursor-pointer active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              {/* Forward 10s Button */}
              <button
                onClick={() => handleSkip(10)}
                title="Forward 10 seconds"
                aria-label="Forward 10 seconds"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <RotateCw className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>

            {/* 8. PLAYBACK SPEED (0.5x, 1x, 1.5x, 2x) */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-full p-1 font-mono text-xs shadow-inner select-none">
              {[0.5, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  aria-label={`Set speed to ${spd}x`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* 9. VOLUME & FULLSCREEN */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-full px-3 py-1.5 text-white shadow-inner">
                <button
                  onClick={handleToggleMute}
                  className="text-white hover:text-blue-400 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Volume Slider"
                  className="w-14 sm:w-20 h-1.5 rounded-full accent-blue-500 bg-white/20 cursor-pointer"
                />
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen (Esc or F)' : 'Enter Fullscreen (F)'}
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                ) : (
                  <Maximize2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
