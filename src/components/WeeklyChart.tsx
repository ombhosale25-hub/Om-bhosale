import React, { useState } from 'react';
import { DayScreenTime } from '../types';
import { TrendingDown, Calendar, Info } from 'lucide-react';

interface WeeklyChartProps {
  weeklyData: DayScreenTime[];
  dailyLimitHours: number;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  weeklyData,
  dailyLimitHours,
}) => {
  const [activeDay, setActiveDay] = useState<DayScreenTime | null>(null);

  // Maximum scale for chart height (e.g. 7 hours ~ 200px)
  const maxHours = Math.max(...weeklyData.map((d) => d.hours + d.minutes / 60), dailyLimitHours, 7);

  const totalWeeklyMinutes = weeklyData.reduce(
    (acc, d) => acc + d.hours * 60 + d.minutes,
    0
  );
  const avgMinutes = Math.round(totalWeeklyMinutes / weeklyData.length);
  const avgHoursFormatted = `${Math.floor(avgMinutes / 60)}h ${avgMinutes % 60}m`;

  return (
    <div className="section bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>📈</span> Weekly Screen Time
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Past 7 days usage trend and daily limit threshold
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600"></span>
            <span>Daily Usage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 border-dashed border-t"></span>
            <span>Limit ({dailyLimitHours}h)</span>
          </div>
          <div className="text-slate-400">·</div>
          <div>
            Avg: <span className="font-semibold text-slate-900 font-mono tabular-nums">{avgHoursFormatted}</span>/day
          </div>
        </div>
      </div>

      {/* Chart container with reference line */}
      <div className="relative pt-8 pb-2">
        {/* Daily limit reference line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-amber-400/80 pointer-events-none z-10 flex items-center justify-end pr-2"
          style={{
            bottom: `${Math.round((dailyLimitHours / maxHours) * 200) + 32}px`,
          }}
        >
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1 rounded -translate-y-2.5">
            Goal: {dailyLimitHours}h
          </span>
        </div>

        {/* The Bar Chart */}
        <div className="chart flex items-end justify-around h-[220px] border-b-2 border-slate-200 pt-5 px-2">
          {weeklyData.map((d) => {
            const dayDecimalHours = d.hours + d.minutes / 60;
            const barHeightPx = Math.max(15, Math.round((dayDecimalHours / maxHours) * 190));
            const isOver = dayDecimalHours >= dailyLimitHours;
            const isHovered = activeDay?.day === d.day;

            return (
              <div
                key={d.day}
                className="bar-container relative text-center w-[11%] group cursor-pointer"
                onMouseEnter={() => setActiveDay(d)}
                onMouseLeave={() => setActiveDay(null)}
                onClick={() => setActiveDay(activeDay?.day === d.day ? null : d)}
              >
                {/* Floating tooltip */}
                <div
                  className={`absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none transition-all z-20 ${
                    isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 scale-95'
                  }`}
                >
                  <p className="font-bold">{d.fullDay}</p>
                  <p className="text-indigo-200 font-mono tabular-nums">
                    {d.hours}h {d.minutes}m {isOver ? '(Limit reached)' : ''}
                  </p>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </div>

                {/* The Bar */}
                <div
                  className={`bar w-full rounded-t-lg transition-all duration-300 ${
                    isOver
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : isHovered
                      ? 'bg-indigo-700'
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ height: `${barHeightPx}px` }}
                />

                <div className="day text-xs font-semibold text-slate-600 mt-2.5 select-none">
                  {d.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected or Default Day Details Strip */}
      <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>
            {activeDay
              ? `${activeDay.fullDay}: ${activeDay.hours}h ${activeDay.minutes}m total (${activeDay.productiveHours}h productive, ${activeDay.entertainmentHours}h leisure)`
              : 'Hover or tap any day column to view detailed screen time breakdown.'}
          </span>
        </div>

        <div className="flex items-center gap-1 text-emerald-600 font-medium">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Weekly digital balance score: 84/100</span>
        </div>
      </div>
    </div>
  );
};
