import React from 'react';
import { Clock, Target, Coffee, Award, Edit3, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatMinutes } from '../utils/initialData';

interface MetricCardsProps {
  totalMinutes: number;
  dailyLimitHours: number;
  breaksCount: number;
  focusScore: number;
  onOpenLimitModal: () => void;
  onTakeBreak: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalMinutes,
  dailyLimitHours,
  breaksCount,
  focusScore,
  onOpenLimitModal,
  onTakeBreak,
}) => {
  const limitMinutes = dailyLimitHours * 60;
  const progressPercent = Math.min(Math.round((totalMinutes / limitMinutes) * 100), 100);
  const isOverLimit = totalMinutes > limitMinutes;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Today's Screen Time */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Today's Screen Time
          </h3>
          <Clock className="w-4 h-4 text-indigo-500" />
        </div>

        <div id="screenTime" className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {formatMinutes(totalMinutes)}
        </div>

        <div className="mt-3.5">
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              id="mainProgress"
              className={`h-full rounded-full transition-all duration-500 ${
                isOverLimit
                  ? 'bg-red-500'
                  : progressPercent > 80
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>
            Daily limit: <span id="limitText" className="font-semibold text-slate-700">{dailyLimitHours} hours</span>
          </span>
          <button
            onClick={onOpenLimitModal}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
            title="Edit daily limit"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* 2. Daily Goal */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Daily Goal
          </h3>
          <Target className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {dailyLimitHours}h
        </div>

        <div className="mt-3.5 flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{totalMinutes <= limitMinutes ? `${Math.round((limitMinutes - totalMinutes) / 60 * 10) / 10}h remaining today` : 'Limit exceeded'}</span>
        </div>

        <p className="mt-2.5 text-xs text-slate-500">
          Maximum recommended usage
        </p>
      </div>

      {/* 3. Breaks Taken */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Breaks Taken
          </h3>
          <Coffee className="w-4 h-4 text-amber-500" />
        </div>

        <div id="breakCount" className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {breaksCount}
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Keep taking regular breaks
          </span>
          <button
            onClick={onTakeBreak}
            className="text-xs text-emerald-700 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            + Take Now
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Target: 1 break every 45-60 min
        </p>
      </div>

      {/* 4. Focus Score */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Focus Score
          </h3>
          <Award className="w-4 h-4 text-purple-500" />
        </div>

        <div id="focusScore" className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {focusScore}%
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                focusScore >= 80 ? 'bg-purple-600' : focusScore >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
              }`}
              style={{ width: `${focusScore}%` }}
            />
          </div>
        </div>

        <p className="mt-2.5 text-xs text-slate-500 font-medium">
          {focusScore >= 80
            ? 'Excellent digital balance!'
            : focusScore >= 60
            ? 'Good digital balance'
            : 'Consider taking more breaks'}
        </p>
      </div>
    </div>
  );
};
