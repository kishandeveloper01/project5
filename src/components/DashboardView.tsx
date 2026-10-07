import React from 'react';
import {
  Heart,
  Footprints,
  Moon,
  Flame,
  Activity,
  FileText,
  Users,
  Stethoscope,
  Salad,
  Bot,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Clock,
  Pill,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { User, FamilyMember, MedicalReport, FitnessData } from '../types';

interface DashboardViewProps {
  user: User | null;
  familyMembers: FamilyMember[];
  activeMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
  recentReports: MedicalReport[];
  fitnessData: FitnessData | null;
  onNavigate: (view: string) => void;
  onOpenReportModal: (report: MedicalReport) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  familyMembers,
  activeMember,
  onSelectMember,
  recentReports,
  fitnessData,
  onNavigate,
  onOpenReportModal,
}) => {
  const currentMember = activeMember || familyMembers[0];
  const todayMetrics = fitnessData?.today;

  const quickActions = [
    {
      id: 'reports',
      title: 'Analyze Report',
      description: 'Upload CBC, Lipid, or lab tests for Gemini breakdown',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'AI Powered',
    },
    {
      id: 'family',
      title: 'Health Records',
      description: 'View timeline, prescriptions & conditions',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'doctors',
      title: 'Find a Doctor',
      description: 'Browse verified specialists & book slots',
      icon: Stethoscope,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
    {
      id: 'fitness',
      title: 'Fitness Tracking',
      description: 'Review step goals, heart rate & sleep quality',
      icon: Activity,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      id: 'diet',
      title: 'AI Diet Plan',
      description: 'Generate customized meal plans with macros',
      icon: Salad,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'AI Plan',
    },
    {
      id: 'assistant',
      title: 'Ask Healthyfy AI',
      description: 'Get clear answers to any medical question',
      icon: Bot,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'Gemini',
    },
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-200 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-emerald-50">
            <Sparkles className="w-3 h-3 text-emerald-200" />
            <span>AI Health Assistant Active</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Kartik'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            Here's your comprehensive health overview for today. All baseline vitals are currently within stable clinical targets.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Upload New Report</span>
          </button>
        </div>
      </div>

      {/* Family Member Quick Profiles Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Family Health Profiles
            </span>
          </div>
          <button
            onClick={() => onNavigate('family')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Manage Profiles</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {familyMembers.map((member) => {
            const isSelected = currentMember?.id === member.id;
            return (
              <button
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div
                    className={`w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold ${member.avatarColor}`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate">{member.name}</div>
                    <div className="text-[10px] text-slate-500">{member.relationship}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Age: {member.age} yrs</span>
                  <span className="font-semibold text-slate-700">{member.bloodGroup}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daily Health Telemetry ({currentMember?.name})
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Synced with simulated health sensors</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Heart Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Heart Rate</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {todayMetrics?.heartRateBpm || 68} <span className="text-xs font-normal text-slate-500">bpm</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span>Resting: {todayMetrics?.restingHeartRate || 62} bpm</span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Steps</span>
              <Footprints className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {(todayMetrics?.steps || 8420).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              84% of 10k goal
            </div>
          </div>

          {/* Sleep */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Sleep</span>
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {todayMetrics?.sleepHours || 7.4} <span className="text-xs font-normal text-slate-500">hrs</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-medium truncate">
              {todayMetrics?.sleepQuality || 'Good (86%)'}
            </div>
          </div>

          {/* Calories */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Active Burn</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {(todayMetrics?.caloriesBurned || 2180).toLocaleString()} <span className="text-xs font-normal text-slate-500">kcal</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {todayMetrics?.activeMinutes || 48} active mins
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Blood Pressure</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-extrabold text-slate-900 tabular-nums">
              {todayMetrics?.bloodPressure || '118/76'}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium">
              Normotensive
            </div>
          </div>

          {/* Overall Wellness */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Wellness Index</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-xl font-extrabold text-emerald-600 tabular-nums">
              {todayMetrics?.wellnessScore || 88} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Optimal Tier
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Quick Health Actions
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-start justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg border ${action.color} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {action.title}
                      </span>
                      {action.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all mt-1" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Analyzed Report + Active Member Health Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Latest Report Breakdown */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Latest Report Analysis ({recentReports[0]?.memberName || 'Rajesh Sharma'})
              </span>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              All Reports →
            </button>
          </div>

          {recentReports.length > 0 ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {recentReports[0].title}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {recentReports[0].date}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {recentReports[0].summary}
                </p>
              </div>

              {/* Sample Metrics Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Key Parameters Evaluated:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentReports[0].values.slice(0, 4).map((val, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 rounded-lg border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-600 font-medium truncate max-w-[120px]">{val.testName}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 tabular-nums">{val.result}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            val.status === 'Within range'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {val.status === 'Within range' ? 'Normal' : 'Elevated'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onOpenReportModal(recentReports[0])}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View Complete AI Clinical Breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No recent medical reports uploaded yet.
            </div>
          )}
        </div>

        {/* Right: Active Member Health Profile & Medications */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                Care & Medication Schedule ({currentMember?.name})
              </span>
            </div>
            <button
              onClick={() => onNavigate('family')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Edit Profile
            </button>
          </div>

          <div className="space-y-3">
            {/* Active Conditions */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Known Conditions
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentMember?.existingConditions && currentMember.existingConditions.length > 0 ? (
                  currentMember.existingConditions.map((cond, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None logged</span>
                )}
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Current Prescriptions
              </div>
              <div className="space-y-1.5">
                {currentMember?.medications && currentMember.medications.length > 0 ? (
                  currentMember.medications.map((med, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{med}</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded shadow-2xs">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No active medications</span>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Emergency Contact</div>
              <div className="font-bold text-slate-800">
                {currentMember?.emergencyContact || '+91 98765 43211'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
