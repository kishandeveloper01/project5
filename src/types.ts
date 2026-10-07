export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  preferences?: { medicationAlarms: boolean; hydrationAlerts: boolean; reportReadyAlerts: boolean; fitnessMilestones: boolean };
}

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: 'Self' | 'Father' | 'Mother' | 'Sister' | 'Brother' | 'Child' | 'Spouse' | 'Other';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  allergies: string[];
  existingConditions: string[];
  medications: string[];
  emergencyContact: string;
  notes: string;
  avatarColor: string;
}

export interface ReportValueItem {
  testName: string;
  result: string;
  referenceRange: string;
  status: 'Within range' | 'Higher than reference range' | 'Lower than reference range';
  unit?: string;
  clinicalSignificance?: string;
}

export interface MedicalReport {
  id: string;
  userId: string;
  memberId: string;
  memberName: string;
  reportType: string;
  title: string;
  date: string;
  laboratory: string;
  summary: string;
  isUrgent: boolean;
  emergencyWarning?: string;
  values: ReportValueItem[];
  aiExplanation: string;
  possibleIndications: string[];
  suggestedQuestions: string[];
  nextSteps: string[];
  disclaimer: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  hospital: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  address: string;
  consultationFee: number;
  availableTimings: string;
  isAvailableToday: boolean;
  avatarUrl?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'health' | 'medication' | 'hydration' | 'fitness' | 'report' | 'appointment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface FitnessToday {
  steps: number;
  stepGoal: number;
  heartRateBpm: number;
  restingHeartRate: number;
  sleepHours: number;
  sleepQuality: string;
  deepSleepMinutes: number;
  remSleepMinutes: number;
  caloriesBurned: number;
  activeMinutes: number;
  distanceKm: number;
  bloodPressure: string;
  wellnessScore: number;
}

export interface FitnessData {
  syncEnabled: boolean;
  syncStatus: string;
  today: FitnessToday;
  weeklySteps: Array<{ day: string; steps: number; goal: number }>;
  heartRateTrends: Array<{ time: string; bpm: number }>;
  sleepTrends: Array<{ day: string; hours: number }>;
  recentWorkouts: Array<{ type: string; duration: string; calories: number; distance: string; date: string }>;
}

export interface MealItem {
  title: string;
  items: string[];
  calories: string;
  protein: string;
  keyBenefit: string;
}

export interface DietPlan {
  overview: string;
  calorieTarget: string;
  meals: {
    breakfast: MealItem;
    midMorningSnack: MealItem;
    lunch: MealItem;
    eveningSnack: MealItem;
    dinner: MealItem;
  };
  weeklyMealIdeas: string[];
  hydrationTips: string[];
  groceryList: string[];
  healthyAlternatives: Array<{
    craving: string;
    swap: string;
    benefit: string;
  }>;
  disclaimer: string;
}
