/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { AppUsageList } from './components/AppUsageList';
import { FocusModeCard } from './components/FocusModeCard';
import { WeeklyChart } from './components/WeeklyChart';
import { SmartControls } from './components/SmartControls';
import {
  DailyLimitModal,
  MindfulBreakModal,
  BlockedAppModal,
  AddAppModal,
} from './components/Modals';
import { ExportModal } from './components/ExportModal';
import { GoogleDriveSaveModal } from './components/GoogleDriveSaveModal';
import { INITIAL_APPS, INITIAL_WEEKLY } from './utils/initialData';
import { AppItem, DayScreenTime } from './types';
import { playHarmonicChime } from './utils/audio';

export default function App() {
  // 1. Persistent state from localStorage (maintains compatibility with original snippet)
  const [dailyLimit, setDailyLimit] = useState<number>(() => {
    const saved = localStorage.getItem('dailyLimit');
    return saved ? Number(saved) : 6;
  });

  const [breaks, setBreaks] = useState<number>(() => {
    const saved = localStorage.getItem('breaks');
    return saved ? Number(saved) : 4;
  });

  const [apps, setApps] = useState<AppItem[]>(() => {
    const saved = localStorage.getItem('screenTimeApps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_APPS;
  });

  const [weeklyData, setWeeklyData] = useState<DayScreenTime[]>(() => {
    const saved = localStorage.getItem('weeklyData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_WEEKLY;
  });

  // App-level flags & controls
  const [isProtectionActive, setIsProtectionActive] = useState<boolean>(false);
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [ambientSound, setAmbientSound] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Modals state
  const [isLimitModalOpen, setIsLimitModalOpen] = useState<boolean>(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [blockedAttemptApp, setBlockedAttemptApp] = useState<AppItem | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dailyLimit', String(dailyLimit));
  }, [dailyLimit]);

  useEffect(() => {
    localStorage.setItem('breaks', String(breaks));
  }, [breaks]);

  useEffect(() => {
    localStorage.setItem('screenTimeApps', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('weeklyData', JSON.stringify(weeklyData));
  }, [weeklyData]);

  // Calculate total minutes today
  const totalMinutes = useMemo(() => {
    return apps.reduce((acc, app) => acc + app.minutesUsed, 0);
  }, [apps]);

  // Calculate dynamic focus score (based on productive app ratio and breaks taken)
  const focusScore = useMemo(() => {
    if (totalMinutes === 0) return 90;
    const productiveMinutes = apps
      .filter((a) => a.category === 'productivity' || a.category === 'communication')
      .reduce((sum, a) => sum + a.minutesUsed, 0);
    const ratio = productiveMinutes / totalMinutes;
    // Base 55 + up to 30 for ratio + up to 15 for breaks
    const score = Math.round(55 + ratio * 30 + Math.min(breaks * 2.5, 15));
    return Math.min(Math.max(score, 45), 98);
  }, [apps, totalMinutes, breaks]);

  // Flash message handler
  const showMessage = useCallback((text: string) => {
    setMessage(text);
    const timer = setTimeout(() => {
      setMessage('');
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Time-of-day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! 👋';
    if (hour < 17) return 'Good Afternoon! 👋';
    return 'Good Evening! 👋';
  }, []);

  // Handlers
  const handleSaveLimit = (newLimit: number) => {
    setDailyLimit(newLimit);
    setIsLimitModalOpen(false);
    if (soundEnabled) playHarmonicChime('success');
    showMessage('✅ Daily limit updated successfully!');
  };

  const handleTakeBreak = () => {
    setIsBreakModalOpen(true);
  };

  const handleCompleteBreak = () => {
    setBreaks((prev) => prev + 1);
    setIsBreakModalOpen(false);
    if (soundEnabled) playHarmonicChime('break');
    showMessage('☕ Great! 5-minute break recorded.');
  };

  const handleToggleBlockApps = () => {
    const nextState = !isProtectionActive;
    setIsProtectionActive(nextState);
    if (nextState) {
      showMessage('🚫 Distracting apps are now blocked for Focus Mode.');
    } else {
      showMessage('🔓 App shields deactivated. All apps accessible.');
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    setDailyLimit(6);
    setBreaks(4);
    setApps(INITIAL_APPS);
    setWeeklyData(INITIAL_WEEKLY);
    setIsProtectionActive(false);
    setIsFocusActive(false);
    if (soundEnabled) playHarmonicChime('alert');
    showMessage('🔄 Demo data has been reset to defaults.');
  };

  const handleAddMinutes = (appId: string, minutesToAdd: number) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId
          ? { ...app, minutesUsed: app.minutesUsed + minutesToAdd }
          : app
      )
    );
    if (soundEnabled) playHarmonicChime('click');
    showMessage(`⏱️ Logged +${minutesToAdd}m usage for ${apps.find((a) => a.id === appId)?.name || 'app'}.`);
  };

  const handleQuickSimulate = () => {
    // Add 15 mins to the first app or distribute
    setApps((prev) =>
      prev.map((app, index) =>
        index === 0 ? { ...app, minutesUsed: app.minutesUsed + 15 } : app
      )
    );
    showMessage('⚡ Simulated +15m of active screen time.');
  };

  const handleToggleAppBlock = (appId: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === appId ? { ...app, isBlocked: !app.isBlocked } : app
      )
    );
    const app = apps.find((a) => a.id === appId);
    showMessage(`🛡️ Shield status updated for ${app?.name || 'app'}.`);
  };

  const handleAddCustomApp = (newApp: AppItem) => {
    setApps((prev) => [...prev, newApp]);
    if (soundEnabled) playHarmonicChime('success');
    showMessage(`✨ Added "${newApp.name}" to tracking.`);
  };

  const handleAttemptLaunchApp = (app: AppItem) => {
    const isDistracting =
      app.category === 'entertainment' || app.category === 'social' || app.category === 'games';

    if ((isProtectionActive || app.isBlocked || isFocusActive) && isDistracting) {
      if (soundEnabled) playHarmonicChime('alert');
      setBlockedAttemptApp(app);
    } else {
      if (soundEnabled) playHarmonicChime('click');
      showMessage(`📱 Launched simulated session for ${app.name}`);
    }
  };

  const handleFocusSessionComplete = (durationMinutes: number) => {
    showMessage(`🎉 Amazing! Completed a ${durationMinutes}-minute focus sprint.`);
    setBreaks((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col font-sans">
      {/* 1. Header with branding and status */}
      <Header
        isFocusActive={isFocusActive}
        isProtectionActive={isProtectionActive}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        ambientSound={ambientSound}
        onToggleAmbient={() => setAmbientSound((prev) => !prev)}
        onOpenDriveSave={() => setIsDriveModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Welcome Banner */}
        <div className="welcome mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {greeting}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage your screen time and build healthier digital habits.
            </p>
          </div>

          <div className="text-xs font-medium text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto">
            <span>Status: </span>
            <span className="font-semibold text-slate-800">
              {totalMinutes <= dailyLimit * 60 ? 'On Track for Daily Goal' : 'Over Daily Limit'}
            </span>
          </div>
        </div>

        {/* Dashboard 4 Cards */}
        <MetricCards
          totalMinutes={totalMinutes}
          dailyLimitHours={dailyLimit}
          breaksCount={breaks}
          focusScore={focusScore}
          onOpenLimitModal={() => setIsLimitModalOpen(true)}
          onTakeBreak={handleTakeBreak}
        />

        {/* Grid: App Usage (Left) & Focus Mode (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-7">
          <AppUsageList
            apps={apps}
            totalMinutes={totalMinutes}
            isProtectionActive={isProtectionActive}
            onAddMinutes={handleAddMinutes}
            onToggleAppBlock={handleToggleAppBlock}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onAttemptLaunchApp={handleAttemptLaunchApp}
          />

          <FocusModeCard
            isFocusActive={isFocusActive}
            onFocusStateChange={setIsFocusActive}
            onSessionComplete={handleFocusSessionComplete}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Weekly Screen Time Chart */}
        <WeeklyChart
          weeklyData={weeklyData}
          dailyLimitHours={dailyLimit}
        />

        {/* Smart Controls & Messages */}
        <SmartControls
          isProtectionActive={isProtectionActive}
          onOpenLimit={() => setIsLimitModalOpen(true)}
          onTakeBreak={handleTakeBreak}
          onToggleBlockApps={handleToggleBlockApps}
          onResetData={handleResetData}
          onQuickSimulate={handleQuickSimulate}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenDriveSave={() => setIsDriveModalOpen(true)}
          message={message}
          soundEnabled={soundEnabled}
        />
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart Screen Time Manager · Digital Wellness & Focus Suite</span>
          <span>Tip: Take 20 seconds to look 20 feet away every 20 minutes to reduce digital eye strain.</span>
        </div>
      </footer>

      {/* Modals */}
      <DailyLimitModal
        isOpen={isLimitModalOpen}
        currentLimit={dailyLimit}
        onClose={() => setIsLimitModalOpen(false)}
        onSave={handleSaveLimit}
      />

      <MindfulBreakModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        onComplete={handleCompleteBreak}
      />

      <BlockedAppModal
        app={blockedAttemptApp}
        onClose={() => setBlockedAttemptApp(null)}
        onEmergencyPass={() => {
          if (blockedAttemptApp) {
            showMessage(`⚡ 1-Minute pass granted for ${blockedAttemptApp.name}`);
          }
          setBlockedAttemptApp(null);
        }}
      />

      <AddAppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomApp}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        totalMinutes={totalMinutes}
        dailyLimitHours={dailyLimit}
        breaksCount={breaks}
        focusScore={focusScore}
        apps={apps}
        weeklyData={weeklyData}
      />

      <GoogleDriveSaveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        totalMinutes={totalMinutes}
        dailyLimitHours={dailyLimit}
        breaksCount={breaks}
        focusScore={focusScore}
        apps={apps}
        weeklyData={weeklyData}
      />
    </div>
  );
}
