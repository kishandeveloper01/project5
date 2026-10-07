import React, { useState } from 'react';
import {
  Activity,
  Footprints,
  Heart,
  Moon,
  Flame,
  Watch,
  RotateCw,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Zap,
  Info,
} from 'lucide-react';
import { api } from '../api';
import { FitnessData } from '../types';

interface FitnessViewProps {
  fitnessData: FitnessData | null;
  onRefreshFitness: () => void;
}

export const FitnessView: React.FC<FitnessViewProps> = ({ fitnessData, onRefreshFitness }) => {
  const [syncLoading, setSyncLoading] = useState(false);

  const today = fitnessData?.today || {
    steps: 8420,
    stepGoal: 10000,
    heartRateBpm: 68,
    restingHeartRate: 62,
    sleepHours: 7.4,
    sleepQuality: 'Good (86% efficiency)',
    deepSleepMinutes: 110,
    remSleepMinutes: 95,
    caloriesBurned: 2180,
    activeMinutes: 48,
    distanceKm: 6.2,
    bloodPressure: '118/76 mmHg',
    wellnessScore: 88,
  };

  const weeklySteps = fitnessData?.weeklySteps || [
    { day: 'Mon', steps: 9120, goal: 10000 },
    { day: 'Tue', steps: 10450, goal: 10000 },
    { day: 'Wed', steps: 7800, goal: 10000 },
    { day: 'Thu', steps: 8900, goal: 10000 },
    { day: 'Fri', steps: 11200, goal: 10000 },
    { day: 'Sat', steps: 12500, goal: 10000 },
    { day: 'Sun', steps: 8420, goal: 10000 },
  ];

  const heartRateTrends = fitnessData?.heartRateTrends || [
    { time: '06:00', bpm: 58 },
    { time: '09:00', bpm: 74 },
    { time: '12:00', bpm: 82 },
    { time: '15:00', bpm: 71 },
    { time: '18:00', bpm: 124 },
    { time: '21:00', bpm: 68 },
    { time: '00:00', bpm: 61 },
  ];

  const sleepTrends = fitnessData?.sleepTrends || [
    { day: 'Mon', hours: 7.1 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 7.5 },
    { day: 'Thu', hours: 8.0 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 8.2 },
    { day: 'Sun', hours: 7.4 },
  ];

  const workouts = fitnessData?.recentWorkouts || [
    { type: 'Evening Run', duration: '35 mins', calories: 340, distance: '4.8 km', date: 'Today, 6:00 PM' },
    { type: 'Morning Mobility Yoga', duration: '25 mins', calories: 120, distance: '-', date: 'Yesterday, 7:00 AM' },
    { type: 'Brisk Outdoor Walk', duration: '40 mins', calories: 190, distance: '3.1 km', date: '3 Oct, 7:30 PM' },
  ];

  const handleToggleSync = async () => {
    setSyncLoading(true);
    try {
      await api.toggleFitnessSync();
      onRefreshFitness();
    } catch (err: any) {
      alert('Failed to toggle sync: ' + err.message);
    } finally {
      setSyncLoading(false);
    }
  };

  const maxSteps = Math.max(...weeklySteps.map((s) => s.steps), 13000);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Fitness & Wearable Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor daily mobility, resting cardiovascular trends, circadian sleep cycles, and active calorie burn.
          </p>
        </div>

        {/* Sync Device Toggle */}
        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          <Watch className="w-4 h-4 text-emerald-600" />
          <div className="text-xs">
            <span className="text-slate-500">Wearable Status: </span>
            <strong className="text-emerald-700 font-bold">
              {fitnessData?.syncEnabled ? 'Active Sync' : 'Paused'}
            </strong>
          </div>
          <button
            onClick={handleToggleSync}
            disabled={syncLoading}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {syncLoading ? 'Syncing...' : 'Toggle'}
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Demo Fitness Mode:</strong> Displaying simulated wearable sensor streams (Fitbit & Apple Health payload structure) for hackathon evaluation.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded shrink-0">
          Telemetry Active
        </span>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Steps */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Today's Steps</span>
            <Footprints className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {today.steps.toLocaleString()}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((today.steps / today.stepGoal) * 100, 100)}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-400">
            Goal: {today.stepGoal.toLocaleString()}
          </div>
        </div>

        {/* Resting Heart Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Heart Rate</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {today.heartRateBpm} <span className="text-xs font-normal text-slate-400">bpm</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            Resting: {today.restingHeartRate} bpm
          </div>
          <div className="text-[10px] text-slate-400">Normal sinus rhythm</div>
        </div>

        {/* Sleep Quality */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Sleep Duration</span>
            <Moon className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {today.sleepHours} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-semibold truncate">
            {today.sleepQuality}
          </div>
          <div className="text-[10px] text-slate-400">Deep: {today.deepSleepMinutes}m · REM: {today.remSleepMinutes}m</div>
        </div>

        {/* Calories Burned */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Calories</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {today.caloriesBurned} <span className="text-xs font-normal text-slate-400">kcal</span>
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">
            Active: 620 kcal
          </div>
          <div className="text-[10px] text-slate-400">Basal metabolic + workout</div>
        </div>

        {/* Distance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Distance</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {today.distanceKm} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[10px] text-teal-700 font-semibold">
            Active: {today.activeMinutes} mins
          </div>
          <div className="text-[10px] text-slate-400">Daily walking & running</div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Blood Pressure</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {today.bloodPressure}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            Optimal Target
          </div>
          <div className="text-[10px] text-slate-400">Calibrated cuff reading</div>
        </div>
      </div>

      {/* Interactive SVG Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Steps Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Weekly Step Consistency
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Avg: 9,770 steps/day
            </span>
          </div>

          <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
            {weeklySteps.map((item, idx) => {
              const heightPct = (item.steps / maxSteps) * 100;
              const isGoalMet = item.steps >= item.goal;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {item.steps > 999 ? `${(item.steps / 1000).toFixed(1)}k` : item.steps}
                  </span>
                  <div
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                      isGoalMet
                        ? 'bg-emerald-500 group-hover:bg-emerald-600'
                        : 'bg-emerald-300 group-hover:bg-emerald-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] font-semibold text-slate-600">{item.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Goal Met (≥ 10,000 steps)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
              <span>Moderate Mobility</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Heart Rate Curve */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                24-Hour Heart Rate Profile
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Resting: 62 bpm</span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-52 relative pt-4 flex flex-col justify-end">
            <svg viewBox="0 0 400 150" className="w-full h-36 overflow-visible">
              {/* Background Reference Lines */}
              <line x1="0" y1="30" x2="400" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />

              {/* Area gradient */}
              <defs>
                <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 10 120 L 70 85 L 130 70 L 190 90 L 250 20 L 310 95 L 380 115"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 10 120 L 70 85 L 130 70 L 190 90 L 250 20 L 310 95 L 380 115 L 380 150 L 10 150 Z"
                fill="url(#hrGradient)"
              />

              {/* Data points */}
              {[
                { x: 10, y: 120, label: '58' },
                { x: 70, y: 85, label: '74' },
                { x: 130, y: 70, label: '82' },
                { x: 190, y: 90, label: '71' },
                { x: 250, y: 20, label: '124' },
                { x: 310, y: 95, label: '68' },
                { x: 380, y: 115, label: '61' },
              ].map((pt, i) => (
                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
              ))}
            </svg>

            {/* Time Labels */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              {heartRateTrends.map((hr, idx) => (
                <span key={idx} className="tabular-nums">{hr.time}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Peak: 124 bpm (Evening run at 18:00)</span>
            <span>Sleep Low: 58 bpm</span>
          </div>
        </div>
      </div>

      {/* Recent Workouts Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Workout Sessions
            </h3>
          </div>
          <span className="text-xs text-slate-400">Auto-recorded via sensor telemetry</span>
        </div>

        <div className="divide-y divide-slate-100">
          {workouts.map((w, i) => (
            <div key={i} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  {w.type.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{w.type}</div>
                  <div className="text-[11px] text-slate-400">{w.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="font-bold text-slate-800">{w.duration}</div>
                  <div className="text-[11px] text-slate-400">Duration</div>
                </div>
                <div>
                  <div className="font-bold text-amber-600 tabular-nums">{w.calories} kcal</div>
                  <div className="text-[11px] text-slate-400">Burned</div>
                </div>
                {w.distance !== '-' && (
                  <div className="hidden sm:block">
                    <div className="font-bold text-slate-800 tabular-nums">{w.distance}</div>
                    <div className="text-[11px] text-slate-400">Distance</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
