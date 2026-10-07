export type AppCategory = 'entertainment' | 'social' | 'communication' | 'games' | 'productivity';

export interface AppItem {
  id: string;
  name: string;
  category: AppCategory;
  minutesUsed: number;
  dailyLimitMinutes?: number;
  iconSymbol: string;
  colorClass: string;
  badgeBg: string;
  isBlocked: boolean;
}

export interface DayScreenTime {
  day: string;
  fullDay: string;
  hours: number;
  minutes: number;
  productiveHours: number;
  entertainmentHours: number;
}

export interface BreakRecord {
  id: string;
  timestamp: string;
  durationMinutes: number;
  type: 'micro' | 'walk' | 'hydration' | 'stretch';
}

export interface ScreenTimeState {
  dailyLimitHours: number;
  breaksCount: number;
  focusScore: number;
  isMonitoring: boolean;
  isFocusProtectionActive: boolean;
  apps: AppItem[];
  weeklyData: DayScreenTime[];
  soundEnabled: boolean;
  ambientSound: boolean;
}
