import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  Users,
  Salad,
  Activity,
  Stethoscope,
  HeartHandshake,
  Cpu,
  BrainCircuit,
  CheckCircle2,
} from 'lucide-react';

interface LandingHeroProps {
  onStartDemo: () => void;
  onOpenAssistant: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStartDemo, onOpenAssistant }) => {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Gen Healthcare · Powered by Google Gemini AI</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Healthyfy
                <span className="block text-emerald-600">Your Health. Smarter. Simpler.</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                An AI-powered health companion designed for understanding complex lab reports, organizing multi-generational family records, tracking daily wellness, and making informed healthcare decisions.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartDemo}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore Healthyfy Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={onOpenAssistant}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4 text-emerald-600" />
                <span>Try AI Health Assistant</span>
              </button>
            </div>

            {/* Safety & Trust Markers */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero AI Hallucination Guardrails</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>HIPAA & Privacy Conscious Architecture</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 aspect-4/3 group">
              <img
                src="/src/assets/images/hero_healthyfy_1791210496144.jpg"
                alt="Doctor reviewing digital health records with patient in modern clinic"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-600/90 backdrop-blur-xs px-2.5 py-1 rounded-md w-max mb-1">
                  <Activity className="w-3 h-3" />
                  <span>Real-Time Clinical Understanding</span>
                </div>
                <div className="text-xs font-medium text-slate-200">
                  Translating complex laboratory diagnostics into reassuring, actionable family wellness plans.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "How Healthyfy Works" Section */}
      <section className="bg-slate-50 rounded-3xl border border-slate-200/80 p-6 sm:p-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">
            Architecture Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How Healthyfy Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A secure pipeline turning raw diagnostic numbers and wearable streams into meaningful clinical clarity.
          </p>
        </div>

        {/* 4 Steps Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-xs mb-3">
              01
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Your Health Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload blood tests, prescription scans, or sync wearable fitness sensor telemetry.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs relative ring-1 ring-emerald-500/20">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs mb-3">
              02
            </div>
            <h3 className="text-sm font-bold text-emerald-950 mb-1 flex items-center gap-1.5">
              <span>Gemini 3.8 AI</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Server-side reasoning extracts values, identifies clinical significance, and flags safety priorities.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-extrabold text-xs mb-3">
              03
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Personalized Insights</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive simple English summaries, questions to ask your doctor, and tailored nutrition recommendations.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-xs mb-3">
              04
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Better Decisions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Take organized family timelines directly to your physician consultations with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* 5 Core Feature Showcase Cards */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Core Capabilities Built for Real Healthcare Needs
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Engineered with privacy-first storage and high clinical standards.
            </p>
          </div>
          <button
            onClick={onStartDemo}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Launch App Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">AI-Powered Report Analysis</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload PDF or image laboratory panels (CBC, Lipid, Thyroid, Blood Sugar). Gemini extracts structured metrics into easy tables with normal vs abnormal ranges and clear explanations.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Family Health Records</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain separate private profiles for parents, spouse, children, and yourself. Keep allergy logs, chronic conditions, prescriptions, and historical timelines completely segregated.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Salad className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">AI Personalized Nutrition</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate culturally responsive full-day meal plans based on existing health conditions (e.g. father's diabetes), allergies, calorie targets, and healthy alternative food swaps.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Wearable & Fitness Telemetry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Track daily steps, resting heart rate curves, sleep stages (Deep & REM), and active calorie expenditure with integrated simulated wearable telemetry for demonstration.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Specialist Doctor Discovery</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Locate verified cardiologists, dermatologists, general physicians, pediatricians, and orthopedic surgeons with ratings, hospital locations, and instant appointment scheduling.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Emergency SOS Protocols</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              One-touch emergency helpline dialing (112, 108, 102), nearest hospital ER navigation, and instant family member emergency contact integration across all screens.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
