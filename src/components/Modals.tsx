import React, { useState, useEffect } from 'react';
import { X, Check, Coffee, ShieldAlert, Sparkles, Heart, Eye, Droplets } from 'lucide-react';
import { AppItem, AppCategory } from '../types';
import { playHarmonicChime } from '../utils/audio';

// 1. Daily Limit Modal (matches id="limitModal" and id="limitInput")
interface LimitModalProps {
  isOpen: boolean;
  currentLimit: number;
  onClose: () => void;
  onSave: (newLimit: number) => void;
}

export const DailyLimitModal: React.FC<LimitModalProps> = ({
  isOpen,
  currentLimit,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState<string>(String(currentLimit));
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setValue(String(currentLimit));
      setError('');
    }
  }, [isOpen, currentLimit]);

  if (!isOpen) return null;

  const handleSave = () => {
    const num = Number(value);
    if (isNaN(num) || num < 1 || num > 24) {
      setError('Please enter a valid value between 1 and 24 hours.');
      return;
    }
    onSave(num);
  };

  return (
    <div
      id="limitModal"
      className="modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="modal-content bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Set Daily Screen Time</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Choose a recommended target or enter your custom daily screen time limit in hours.
        </p>

        {/* Quick presets */}
        <div className="flex gap-2 mb-3">
          {[2, 4, 6, 8].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setValue(String(h))}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                Number(value) === h
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label htmlFor="limitInput" className="block text-xs font-medium text-slate-700 mb-1">
            Limit in hours (1 – 24)
          </label>
          <input
            type="number"
            id="limitInput"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
            placeholder="Enter hours"
            min="1"
            max="24"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 font-semibold"
          />
          {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            className="secondary bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm transition-colors cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="primary bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
            onClick={handleSave}
          >
            Save Limit
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Mindful 5-Minute Break Modal with 4-7-8 Breathing Guide
interface BreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const MindfulBreakModal: React.FC<BreakModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(300); // 5 minutes
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(300);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playHarmonicChime('break');
          onComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  // Breathing guide cycle (Inhale 4s -> Hold 7s -> Exhale 8s)
  useEffect(() => {
    if (!isOpen) return;

    let timer: NodeJS.Timeout;
    const runCycle = () => {
      setBreathPhase('Inhale');
      setBreathCount(4);
      timer = setTimeout(() => {
        setBreathPhase('Hold');
        setBreathCount(7);
        timer = setTimeout(() => {
          setBreathPhase('Exhale');
          setBreathCount(8);
          timer = setTimeout(runCycle, 8000);
        }, 7000);
      }, 4000);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-100 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            ☕ Digital Decompression
          </span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mt-2">Take a 5-Minute Break</h3>
        <p className="text-xs text-slate-500 mb-6">
          Step back from the screen. Rest your eyes, stretch, and breathe deeply.
        </p>

        {/* Breathing Orb */}
        <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
          <div
            className={`w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 opacity-20 absolute transition-all duration-1000 ${
              breathPhase === 'Inhale'
                ? 'scale-125 opacity-30'
                : breathPhase === 'Hold'
                ? 'scale-125 opacity-40'
                : 'scale-90 opacity-15'
            }`}
          />
          <div className="relative z-10">
            <p className="text-sm font-semibold text-emerald-800 tracking-wide uppercase">
              {breathPhase}
            </p>
            <div className="text-4xl font-bold text-slate-900 font-mono tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* 3 healthy habits tips */}
        <div className="grid grid-cols-3 gap-2 text-left my-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-start gap-1.5">
            <Eye className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-slate-800">20-20-20 Rule</p>
              <p className="text-[10px] text-slate-500 leading-tight">Look 20ft away for 20s</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Droplets className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-slate-800">Hydrate</p>
              <p className="text-[10px] text-slate-500 leading-tight">Drink a glass of water</p>
            </div>
          </div>
          <div className="flex items-start gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-slate-800">Posture</p>
              <p className="text-[10px] text-slate-500 leading-tight">Roll neck & shoulders</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={() => {
              onComplete();
              onClose();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer text-sm"
          >
            Finished Break & Log
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Blocked App Warning Intercept Modal
interface BlockedModalProps {
  app: AppItem | null;
  onClose: () => void;
  onEmergencyPass: () => void;
}

export const BlockedAppModal: React.FC<BlockedModalProps> = ({
  app,
  onClose,
  onEmergencyPass,
}) => {
  if (!app) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-100 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          {app.name} is Blocked
        </h3>

        <p className="text-xs text-slate-600 mt-2 mb-5">
          Focus Mode protection is active to help you resist distractions. Take a breath and reflect before opening this app.
        </p>

        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
          >
            Stay Focused (Recommended)
          </button>

          <button
            onClick={() => {
              onEmergencyPass();
              onClose();
            }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            1-Minute Emergency Pass
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Add App Modal
interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newApp: AppItem) => void;
}

export const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AppCategory>('entertainment');
  const [limitHours, setLimitHours] = useState('1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newApp: AppItem = {
      id,
      name: name.trim(),
      category,
      minutesUsed: 0,
      dailyLimitMinutes: Math.max(15, Number(limitHours) * 60),
      iconSymbol: name.charAt(0).toUpperCase(),
      colorClass: 'bg-indigo-600 text-white',
      badgeBg: 'bg-indigo-50 text-indigo-600',
      isBlocked: false,
    };

    onAdd(newApp);
    setName('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Track New Application</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              App or Website Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TikTok, Netflix, Slack"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AppCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="entertainment">Entertainment</option>
              <option value="social">Social Media</option>
              <option value="games">Gaming</option>
              <option value="communication">Communication</option>
              <option value="productivity">Productivity</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Limit Target (Hours)
            </label>
            <input
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={limitHours}
              onChange={(e) => setLimitHours(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
            >
              Add App
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
