import { AppItem, DayScreenTime } from '../types';

export const INITIAL_APPS: AppItem[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'entertainment',
    minutesUsed: 95, // 1h 35m
    dailyLimitMinutes: 120, // 2h limit
    iconSymbol: '▶',
    colorClass: 'bg-red-600',
    badgeBg: 'bg-red-50 text-red-600',
    isBlocked: false,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    minutesUsed: 70, // 1h 10m
    dailyLimitMinutes: 60, // Limit reached/exceeded!
    iconSymbol: '◎',
    colorClass: 'bg-pink-600',
    badgeBg: 'bg-pink-50 text-pink-600',
    isBlocked: false,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'communication',
    minutesUsed: 45, // 45m
    dailyLimitMinutes: 90,
    iconSymbol: '☏',
    colorClass: 'bg-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-600',
    isBlocked: false,
  },
  {
    id: 'games',
    name: 'Games',
    category: 'games',
    minutesUsed: 30, // 30m
    dailyLimitMinutes: 45,
    iconSymbol: '🎮',
    colorClass: 'bg-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-600',
    isBlocked: false,
  },
  {
    id: 'docs',
    name: 'Productivity & Notes',
    category: 'productivity',
    minutesUsed: 25, // 25m
    dailyLimitMinutes: 180,
    iconSymbol: '⚡',
    colorClass: 'bg-amber-600',
    badgeBg: 'bg-amber-50 text-amber-600',
    isBlocked: false,
  },
];

export const INITIAL_WEEKLY: DayScreenTime[] = [
  { day: 'Mon', fullDay: 'Monday', hours: 4, minutes: 12, productiveHours: 1.8, entertainmentHours: 2.4 },
  { day: 'Tue', fullDay: 'Tuesday', hours: 5, minutes: 5, productiveHours: 2.1, entertainmentHours: 2.9 },
  { day: 'Wed', fullDay: 'Wednesday', hours: 3, minutes: 25, productiveHours: 2.0, entertainmentHours: 1.4 },
  { day: 'Thu', fullDay: 'Thursday', hours: 6, minutes: 2, productiveHours: 2.4, entertainmentHours: 3.6 },
  { day: 'Fri', fullDay: 'Friday', hours: 4, minutes: 45, productiveHours: 2.5, entertainmentHours: 2.2 },
  { day: 'Sat', fullDay: 'Saturday', hours: 3, minutes: 5, productiveHours: 0.8, entertainmentHours: 2.3 },
  { day: 'Sun', fullDay: 'Sunday', hours: 3, minutes: 42, productiveHours: 1.2, entertainmentHours: 2.5 },
];

export function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
