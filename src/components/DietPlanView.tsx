import React, { useState } from 'react';
import {
  Salad,
  Sparkles,
  Utensils,
  Coffee,
  Sun,
  Sunset,
  Moon,
  Droplets,
  ShoppingCart,
  ArrowRightLeft,
  ShieldCheck,
  RefreshCw,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api';
import { FamilyMember, DietPlan } from '../types';

interface DietPlanViewProps {
  familyMembers: FamilyMember[];
  activeMember: FamilyMember | null;
  onSelectMember: (member: FamilyMember) => void;
}

export const DietPlanView: React.FC<DietPlanViewProps> = ({
  familyMembers,
  activeMember,
  onSelectMember,
}) => {
  const currentMember = activeMember || familyMembers[0];

  const [age, setAge] = useState(currentMember?.age || 30);
  const [goals, setGoals] = useState('Maintain cardiovascular health & steady blood glucose');
  const [activityLevel, setActivityLevel] = useState('Moderately active (3-4 days exercise)');
  const [dietaryPreference, setDietaryPreference] = useState('Vegetarian');
  const [allergies, setAllergies] = useState(currentMember?.allergies.join(', ') || 'None');
  const [schedule, setSchedule] = useState('Wakeup 7 AM, Desk work 9-5, Dinner 8 PM, Sleep 11 PM');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) { alert('Please add/select a family member first.'); return; }
    setIsGenerating(true);

    try {
      const plan = await api.generateDiet({
        age: Number(age),
        goals,
        activityLevel,
        dietaryPreference,
        allergies,
        schedule,
        memberId: currentMember.id,
      });
      setDietPlan(plan);
    } catch (err: any) {
      alert('Failed to generate diet plan: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentMember) return <div className="p-8 text-center text-sm text-slate-500">Add a family member to create a personalized diet plan.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Nutrition Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            AI Personalized Diet & Nutrition Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formulate balanced, culturally tailored meal plans grounded in your lab results and family chronic conditions.
          </p>
        </div>

        {/* Member Context */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs text-slate-500 font-medium">Meal plan for:</span>
          <select
            value={currentMember.id}
            onChange={(e) => {
              const m = familyMembers.find((item) => item.id === e.target.value);
              if (m) {
                onSelectMember(m);
                setAge(m.age);
                setAllergies(m.allergies.join(', ') || 'None');
              }
            }}
            className="text-xs font-bold text-slate-800 bg-transparent outline-hidden cursor-pointer"
          >
            {familyMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dietary Preference
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              >
                <option value="Vegetarian">Vegetarian (Lacto-vegetarian)</option>
                <option value="Non-Vegetarian">Non-Vegetarian (Lean meats & fish)</option>
                <option value="Eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                <option value="Vegan">Vegan (Plant-based)</option>
                <option value="Low-Carb / Diabetic">Low-Carb / Glycemic Control</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              >
                <option value="Sedentary (Desk job, minimal walking)">Sedentary</option>
                <option value="Lightly active (1-2 days exercise)">Lightly Active</option>
                <option value="Moderately active (3-4 days exercise)">Moderately Active</option>
                <option value="Very active (5-6 days rigorous training)">Very Active</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Health & Fitness Goals
              </label>
              <input
                type="text"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g. Lower cholesterol, stabilize fasting sugar, lean muscle"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Allergies or Food Intolerances
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Lactose, Peanuts, Gluten, Shellfish"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Routine Schedule
            </label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Wakeup 7 AM, Workout 6 PM, Dinner 8:30 PM, Sleep 11 PM"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gemini AI is crafting your personalized nutritional plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Personalized Diet Plan with Gemini AI</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Generated Plan Output */}
      {dietPlan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Strategy Overview & Calorie Goal */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400">
                Nutritional Strategy for {currentMember.name}
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {dietPlan.overview}
              </p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-center shrink-0">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Daily Calorie Target</div>
              <div className="text-base font-extrabold text-emerald-400 tabular-nums">
                {dietPlan.calorieTarget}
              </div>
            </div>
          </div>

          {/* Today's 5 Meals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Today's Complete Meal Structure
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
              {/* Breakfast */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
                    <Sun className="w-4 h-4" />
                    <span>Breakfast</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {dietPlan.meals.breakfast.title}
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {dietPlan.meals.breakfast.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{dietPlan.meals.breakfast.calories}</span>
                    <span className="text-emerald-700">Protein: {dietPlan.meals.breakfast.protein}</span>
                  </div>
                  <div className="text-slate-400 italic line-clamp-2">
                    {dietPlan.meals.breakfast.keyBenefit}
                  </div>
                </div>
              </div>

              {/* Mid-Morning Snack */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                    <Coffee className="w-4 h-4" />
                    <span>Mid-Morning</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {dietPlan.meals.midMorningSnack.title}
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {dietPlan.meals.midMorningSnack.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{dietPlan.meals.midMorningSnack.calories}</span>
                    <span className="text-emerald-700">Protein: {dietPlan.meals.midMorningSnack.protein}</span>
                  </div>
                  <div className="text-slate-400 italic line-clamp-2">
                    {dietPlan.meals.midMorningSnack.keyBenefit}
                  </div>
                </div>
              </div>

              {/* Lunch */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
                    <Utensils className="w-4 h-4" />
                    <span>Lunch</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {dietPlan.meals.lunch.title}
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {dietPlan.meals.lunch.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{dietPlan.meals.lunch.calories}</span>
                    <span className="text-emerald-700">Protein: {dietPlan.meals.lunch.protein}</span>
                  </div>
                  <div className="text-slate-400 italic line-clamp-2">
                    {dietPlan.meals.lunch.keyBenefit}
                  </div>
                </div>
              </div>

              {/* Evening Snack */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-600 mb-1">
                    <Sunset className="w-4 h-4" />
                    <span>Evening Snack</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {dietPlan.meals.eveningSnack.title}
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {dietPlan.meals.eveningSnack.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{dietPlan.meals.eveningSnack.calories}</span>
                    <span className="text-emerald-700">Protein: {dietPlan.meals.eveningSnack.protein}</span>
                  </div>
                  <div className="text-slate-400 italic line-clamp-2">
                    {dietPlan.meals.eveningSnack.keyBenefit}
                  </div>
                </div>
              </div>

              {/* Dinner */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">
                    <Moon className="w-4 h-4" />
                    <span>Dinner</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {dietPlan.meals.dinner.title}
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-1 mt-2">
                    {dietPlan.meals.dinner.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{dietPlan.meals.dinner.calories}</span>
                    <span className="text-emerald-700">Protein: {dietPlan.meals.dinner.protein}</span>
                  </div>
                  <div className="text-slate-400 italic line-clamp-2">
                    {dietPlan.meals.dinner.keyBenefit}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Grid Section: Hydration, Grocery List, and Craving Swaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Hydration */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span>Hydration Protocol</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {dietPlan.hydrationTips.map((tip, idx) => (
                  <li key={idx} className="p-2.5 bg-blue-50/40 border border-blue-100 rounded-xl leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Grocery Suggestions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Essential Grocery Checklist</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dietPlan.groceryList.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Healthy Alternatives */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>Craving Swaps</span>
              </div>
              <div className="space-y-2 text-xs">
                {dietPlan.healthyAlternatives.map((alt, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl space-y-0.5">
                    <div className="text-[11px] text-rose-600 line-through">
                      Craving: {alt.craving}
                    </div>
                    <div className="font-bold text-emerald-800">
                      Swap: {alt.swap}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {alt.benefit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="leading-relaxed">
              <strong>Nutritional Disclaimer:</strong> {dietPlan.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
