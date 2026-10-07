import React, { useState, useEffect } from 'react';
import { Play, Square, Pause, RotateCcw, ShieldCheck, Sparkles, Volume2 } from 'lucide-react';
import { playHarmonicChime } from '../utils/audio';

interface FocusModeCardProps {
  isFocusActive: boolean;
  onFocusStateChange: (active: boolean) => void;
  onSessionComplete: (durationMinutes: number) => void;
  soundEnabled: boolean;
}

export const FocusModeCard: React.FC<FocusModeCardProps> = ({
  isFocusActive,
  onFocusStateChange,
  onSessionComplete,
  soundEnabled,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(25); // in minutes
  const [remainingSeconds, setRemainingSeconds] = useState<number>(25 * 60);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isFocusActive && !isPaused) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Completed!
            if (soundEnabled) {
              playHarmonicChime('break');
            }
            onFocusStateChange(false);
            onSessionComplete(selectedDuration);
            return selectedDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocusActive, isPaused, selectedDuration, soundEnabled, onFocusStateChange, onSessionComplete]);

  const handleStart = () => {
    if (soundEnabled) playHarmonicChime('click');
    setIsPaused(false);
    onFocusStateChange(true);
  };

  const handlePause = () => {
    if (soundEnabled) playHarmonicChime('click');
    setIsPaused(true);
  };

  const handleStop = () => {
    if (soundEnabled) playHarmonicChime('alert');
    onFocusStateChange(false);
    setIsPaused(false);
    setRemainingSeconds(selectedDuration * 60);
  };

  const handleSelectPreset = (minutes: number) => {
    if (isFocusActive) return;
    setSelectedDuration(minutes);
    setRemainingSeconds(minutes * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalSecondsInitial = selectedDuration * 60;
  const progressPercent = Math.round(((totalSecondsInitial - remainingSeconds) / totalSecondsInitial) * 100);

  return (
    <div className="section bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🎯</span> Focus Mode
          </h2>
          {isFocusActive && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Session in Progress
            </span>
          )}
        </div>

        {/* Duration selector tabs */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              disabled={isFocusActive}
              onClick={() => handleSelectPreset(mins)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                selectedDuration === mins
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        <div className="focus-box text-center py-4 bg-slate-50/70 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Block distracting apps and concentrate on your work.
          </p>

          {/* Large timer display */}
          <div
            id="timer"
            className="timer text-5xl sm:text-6xl font-bold font-mono tracking-tight text-slate-900 my-4 select-none tabular-nums"
          >
            {formatTime(remainingSeconds)}
          </div>

          {/* Progress bar */}
          {isFocusActive && (
            <div className="max-w-xs mx-auto mb-4">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {!isFocusActive ? (
              <button
                className="success bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
                onClick={handleStart}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Focus</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    className="success bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    onClick={handleStart}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    className="secondary bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    onClick={handlePause}
                  >
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  className="danger bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  onClick={handleStop}
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>

          <p id="focusStatus" className="mt-4 text-xs font-semibold text-slate-500">
            {isFocusActive
              ? isPaused
                ? '⏸️ Focus session paused'
                : '🟢 Focus Mode Active — Social apps blocked'
              : 'Focus mode is currently OFF'}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          Shields active during sessions
        </span>
        <span>Pomodoro Technique</span>
      </div>
    </div>
  );
};
