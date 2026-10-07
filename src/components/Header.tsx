import React from 'react';
import { Volume2, VolumeX, Shield, Radio, FolderUp } from 'lucide-react';
import { playHarmonicChime, toggleAmbientSound } from '../utils/audio';

interface HeaderProps {
  isFocusActive: boolean;
  isProtectionActive: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambientSound: boolean;
  onToggleAmbient: () => void;
  onOpenDriveSave: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isFocusActive,
  isProtectionActive,
  soundEnabled,
  onToggleSound,
  ambientSound,
  onToggleAmbient,
  onOpenDriveSave,
}) => {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="smartphone">📱</span>
              Smart Screen Time
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium mt-0.5">
            Healthy Digital Habits
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Save to Google Drive Button */}
          <button
            onClick={() => {
              if (soundEnabled) playHarmonicChime('click');
              onOpenDriveSave();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs border border-white/20 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
            title="Save Screen Time Preview & Reports directly to Google Drive"
          >
            <FolderUp className="w-3.5 h-3.5" />
            <span>Save to Drive</span>
          </button>

          {/* Audio & Ambience Controls */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-lg p-1 backdrop-blur-xs border border-white/15">
            <button
              onClick={() => {
                if (!soundEnabled) playHarmonicChime('click');
                onToggleSound();
              }}
              title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="p-1.5 rounded-md hover:bg-white/20 text-white/90 transition-colors"
              aria-label="Toggle sound effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/60" />}
            </button>

            <button
              onClick={() => {
                const next = !ambientSound;
                toggleAmbientSound(next);
                onToggleAmbient();
              }}
              title={ambientSound ? 'Stop ambient rain sound' : 'Play calming ambient rain sound for focus'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                ambientSound
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-white/80 hover:bg-white/20'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${ambientSound ? 'animate-pulse text-indigo-600' : ''}`} />
              <span className="hidden md:inline">{ambientSound ? 'Rain Sound On' : 'Ambient Noise'}</span>
            </button>
          </div>

          {/* Status Badge */}
          <div
            id="status"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-all ${
              isProtectionActive || isFocusActive
                ? 'bg-amber-400 text-slate-900 border-amber-300 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 backdrop-blur-xs'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isProtectionActive || isFocusActive ? 'bg-amber-900' : 'bg-emerald-300'
              }`}
            />
            <span>
              {isProtectionActive
                ? '🛡️ Focus Protection Active'
                : isFocusActive
                ? '🟢 Focus Session Running'
                : '● Monitoring Active'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

