import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Bell,
  Sparkles,
  Phone,
  MapPin,
  Lock,
  LogOut,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface SettingsViewProps {
  user: User | null;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onLogout }) => {
  const [name, setName] = useState(user?.name || 'Kartik Sharma');
  const [email] = useState(user?.email || 'kartik@healthyfy.ai');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.city || 'Bengaluru, Karnataka');

  // Notifications toggles
  const [medicationAlarms, setMedicationAlarms] = useState(user?.preferences?.medicationAlarms ?? true);
  const [hydrationAlerts, setHydrationAlerts] = useState(user?.preferences?.hydrationAlerts ?? true);
  const [reportReadyAlerts, setReportReadyAlerts] = useState(user?.preferences?.reportReadyAlerts ?? true);
  const [fitnessMilestones, setFitnessMilestones] = useState(user?.preferences?.fitnessMilestones ?? true);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateProfile({ name, phone, city, preferences: { medicationAlarms, hydrationAlerts, reportReadyAlerts, fitnessMilestones } });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Could not save settings: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Account & Healthyfy Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure profile details, emergency notifications, and inspect Google Gemini integration credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile and notification preferences updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Personal Information
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Saved to account</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs cursor-not-allowed outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Notifications Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Health Alerts & Reminders
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800">Family Medication Alarms</div>
              <div className="text-[11px] text-slate-500">
                Receive notifications when father or mother's scheduled medication is due
              </div>
            </div>
            <input
              type="checkbox"
              checked={medicationAlarms}
              onChange={(e) => setMedicationAlarms(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800">Daily Hydration Pings</div>
              <div className="text-[11px] text-slate-500">
                Periodic reminders to reach 3.0L daily water consumption goal
              </div>
            </div>
            <input
              type="checkbox"
              checked={hydrationAlerts}
              onChange={(e) => setHydrationAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800">Report Analysis Completion</div>
              <div className="text-[11px] text-slate-500">
                Instant notification when Gemini AI completes diagnostic parsing
              </div>
            </div>
            <input
              type="checkbox"
              checked={reportReadyAlerts}
              onChange={(e) => setReportReadyAlerts(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-slate-800">Fitness Milestone Celebrations</div>
              <div className="text-[11px] text-slate-500">
                Alerts upon reaching 10,000 steps or achieving healthy resting heart rate targets
              </div>
            </div>
            <input
              type="checkbox"
              checked={fitnessMilestones}
              onChange={(e) => setFitnessMilestones(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* AI Engine & Privacy Architecture */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Google Gemini Engine Architecture
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Active · gemini-3.8-flash
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="text-slate-400">Model Deployment</div>
            <div className="font-semibold text-slate-200">gemini-3.8-flash via @google/genai</div>
          </div>
          <div className="space-y-1">
            <div className="text-slate-400">Security Architecture</div>
            <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Client Exposure · Server-Side Proxy</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
          All clinical report analyses, chat completions, and nutritional recommendations are computed on a secure server-side boundary, with prompt guardrails prohibiting hallucinated medical diagnosis.
        </p>
      </div>

      {/* Sign Out Action */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={onLogout}
          className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Healthyfy</span>
        </button>
      </div>
    </div>
  );
};
