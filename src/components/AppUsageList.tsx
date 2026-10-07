import React, { useState } from 'react';
import { AppItem } from '../types';
import { formatMinutes } from '../utils/initialData';
import { Plus, ShieldAlert, ShieldCheck, Play, Sparkles, Filter } from 'lucide-react';

interface AppUsageListProps {
  apps: AppItem[];
  totalMinutes: number;
  isProtectionActive: boolean;
  onAddMinutes: (appId: string, minutes: number) => void;
  onToggleAppBlock: (appId: string) => void;
  onOpenAddModal: () => void;
  onAttemptLaunchApp: (app: AppItem) => void;
}

export const AppUsageList: React.FC<AppUsageListProps> = ({
  apps,
  totalMinutes,
  isProtectionActive,
  onAddMinutes,
  onToggleAppBlock,
  onOpenAddModal,
  onAttemptLaunchApp,
}) => {
  const [filter, setFilter] = useState<'all' | 'distracting' | 'productive'>('all');

  const filteredApps = apps.filter((app) => {
    if (filter === 'distracting') {
      return app.category === 'entertainment' || app.category === 'social' || app.category === 'games';
    }
    if (filter === 'productive') {
      return app.category === 'productivity' || app.category === 'communication';
    }
    return true;
  });

  return (
    <div className="section bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📊</span> App Usage
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {apps.length} tracked
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter segment */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('distracting')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'distracting' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Distracting
            </button>
            <button
              onClick={() => setFilter('productive')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filter === 'productive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Productive
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            title="Add a custom app"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        {filteredApps.map((app) => {
          // Calculate percentage relative to its limit or total screen time
          const percentage = app.dailyLimitMinutes
            ? Math.min(Math.round((app.minutesUsed / app.dailyLimitMinutes) * 100), 100)
            : Math.min(Math.round((app.minutesUsed / (totalMinutes || 1)) * 100), 100);

          const isOverAppLimit = app.dailyLimitMinutes && app.minutesUsed >= app.dailyLimitMinutes;
          const isAppShielded = isProtectionActive || app.isBlocked;

          // App icon background classes from user's original style
          const getIconStyle = () => {
            if (app.id === 'youtube') return 'bg-red-600 text-white';
            if (app.id === 'instagram') return 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white';
            if (app.id === 'whatsapp') return 'bg-emerald-600 text-white';
            if (app.id === 'games') return 'bg-indigo-600 text-white';
            if (app.id === 'docs') return 'bg-amber-600 text-white';
            return app.colorClass || 'bg-slate-700 text-white';
          };

          return (
            <div
              key={app.id}
              className={`app flex items-center justify-between p-3 rounded-xl border transition-all ${
                isAppShielded && (app.category === 'entertainment' || app.category === 'social' || app.category === 'games')
                  ? 'bg-slate-50/80 border-slate-200'
                  : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="app-info flex items-center gap-3.5 flex-1 min-w-0 mr-3">
                <div
                  className={`app-icon ${app.id} w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs select-none ${getIconStyle()}`}
                >
                  {app.iconSymbol}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {app.name}
                    </span>
                    {isOverAppLimit && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.2 rounded shrink-0">
                        Limit Met
                      </span>
                    )}
                    {isAppShielded && (app.category === 'entertainment' || app.category === 'social' || app.category === 'games') && (
                      <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded shrink-0 flex items-center gap-0.5">
                        <ShieldAlert className="w-2.5 h-2.5" /> Blocked
                      </span>
                    )}
                  </div>

                  <div className="mini-progress w-full max-w-[160px] h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                    <span
                      className={`h-full block rounded-full transition-all duration-300 ${
                        isOverAppLimit
                          ? 'bg-red-500'
                          : percentage > 70
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1">
                    {app.dailyLimitMinutes ? `Limit: ${formatMinutes(app.dailyLimitMinutes)}` : 'No limit set'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="app-time font-mono font-bold text-slate-800 text-sm tabular-nums">
                  {formatMinutes(app.minutesUsed)}
                </div>

                {/* Quick actions: launch test or add 10m */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAttemptLaunchApp(app)}
                    title={`Open / Test Launch ${app.name}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onAddMinutes(app.id, 10)}
                    title="Simulate +10 mins usage"
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                  >
                    +10m
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
