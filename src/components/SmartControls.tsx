import React from 'react';
import { Settings, Coffee, ShieldAlert, ShieldCheck, RotateCcw, PlusCircle, Download } from 'lucide-react';
import { playHarmonicChime } from '../utils/audio';

interface SmartControlsProps {
  isProtectionActive: boolean;
  onOpenLimit: () => void;
  onTakeBreak: () => void;
  onToggleBlockApps: () => void;
  onResetData: () => void;
  onQuickSimulate: () => void;
  onOpenExport: () => void;
  onOpenDriveSave: () => void;
  message: string;
  soundEnabled: boolean;
}

export const SmartControls: React.FC<SmartControlsProps> = ({
  isProtectionActive,
  onOpenLimit,
  onTakeBreak,
  onToggleBlockApps,
  onResetData,
  onQuickSimulate,
  onOpenExport,
  onOpenDriveSave,
  message,
  soundEnabled,
}) => {
  return (
    <div className="section bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>⚙️</span> Smart Controls
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quick triggers for digital limits, habit protection, and cloud archiving
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (soundEnabled) playHarmonicChime('click');
              onOpenDriveSave();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer shadow-2xs"
            title="Save report to Google Drive"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save to Drive</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playHarmonicChime('click');
              onQuickSimulate();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            title="Add +15 minutes to simulate active device usage"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate +15m</span>
          </button>

          <button
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Export habit summary"
          >
            <span>Summary</span>
          </button>
        </div>
      </div>

      {/* Buttons matching user's original HTML structure & classes */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          className="primary bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer text-sm"
          onClick={() => {
            if (soundEnabled) playHarmonicChime('click');
            onOpenLimit();
          }}
        >
          <Settings className="w-4 h-4" />
          <span>Set Daily Limit</span>
        </button>

        <button
          className="success bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer text-sm"
          onClick={() => {
            if (soundEnabled) playHarmonicChime('break');
            onTakeBreak();
          }}
        >
          <span>☕ Take Break</span>
        </button>

        <button
          className={`danger font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer text-sm ${
            isProtectionActive
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          onClick={() => {
            if (soundEnabled) playHarmonicChime('alert');
            onToggleBlockApps();
          }}
        >
          {isProtectionActive ? (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Unblock Distracting Apps</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4" />
              <span>🚫 Block Distracting Apps</span>
            </>
          )}
        </button>

        <button
          className="secondary bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer text-sm"
          onClick={() => {
            if (soundEnabled) playHarmonicChime('click');
            onResetData();
          }}
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Message Output matching id="message" */}
      <div className="min-h-[30px] mt-4">
        <p
          id="message"
          className={`text-sm font-semibold transition-all duration-300 ${
            message
              ? 'opacity-100 p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-lg text-indigo-900'
              : 'opacity-0'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
};
