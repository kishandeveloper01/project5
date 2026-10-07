import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || (isProd ? '' : 'healthyfy-local-development-secret-change-me');
if (isProd && !JWT_SECRET) throw new Error('JWT_SECRET must be configured in production.');

// -------------------------------------------------------------
// Gemini AI Initialization
// -------------------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Gemini can temporarily return 429/5xx responses when a model is rate-limited
// or under heavy load. Keep the primary model, but use bounded exponential
// backoff and a stable Flash fallback so a transient Google-side outage does
// not immediately break a user-facing Healthyfy feature.
const GEMINI_FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
] as const;

function isRetryableGeminiError(error: any): boolean {
  const status = Number(error?.status ?? error?.code ?? error?.error?.code ?? 0);
  return status === 408 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function getGeminiErrorStatus(error: any): number {
  return Number(error?.status ?? error?.code ?? error?.error?.code ?? 0);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateGeminiWithFallback<T>(
  requestFactory: (model: string) => Promise<T>,
  options: { maxModels?: number; retriesPerModel?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const maxModels = Math.max(1, options.maxModels ?? GEMINI_FALLBACK_MODELS.length);
  const retriesPerModel = Math.max(1, options.retriesPerModel ?? 2);
  const baseDelayMs = Math.max(250, options.baseDelayMs ?? 1500);
  let lastError: any = null;

  for (const model of GEMINI_FALLBACK_MODELS.slice(0, maxModels)) {
    for (let attempt = 0; attempt < retriesPerModel; attempt++) {
      try {
        return await requestFactory(model);
      } catch (error: any) {
        lastError = error;
        if (!isRetryableGeminiError(error) || attempt === retriesPerModel - 1) break;

        // 1.5s, 3s, ... with a small random jitter to avoid synchronized retries.
        const delay = baseDelayMs * (2 ** attempt) + Math.floor(Math.random() * 400);
        console.warn(`Gemini ${model} returned ${getGeminiErrorStatus(error)}; retrying in ${delay}ms.`);
        await wait(delay);
      }
    }
  }

  throw lastError ?? new Error('Gemini request failed without an error object.');
}

// -------------------------------------------------------------
// Application Data (seeded on first MongoDB connection)
// -------------------------------------------------------------
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  city: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences: {
    medicationAlarms: boolean;
    hydrationAlerts: boolean;
    reportReadyAlerts: boolean;
    fitnessMilestones: boolean;
  };
}

interface FamilyMember {
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

interface MedicalReport {
  id: string;
  userId: string;
  memberId: string;
  memberName: string;
  reportType: string;
  title: string;
  date: string;
  laboratory: string;
  rawText?: string;
  summary: string;
  isUrgent: boolean;
  emergencyWarning?: string;
  values: Array<{
    testName: string;
    result: string;
    referenceRange: string;
    status: 'Within range' | 'Higher than reference range' | 'Lower than reference range';
    unit?: string;
    clinicalSignificance?: string;
  }>;
  aiExplanation: string;
  possibleIndications: string[];
  suggestedQuestions: string[];
  nextSteps: string[];
  disclaimer: string;
}

interface Doctor {
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

interface NotificationItem {
  id: string;
  userId: string;
  type: 'health' | 'medication' | 'hydration' | 'fitness' | 'report' | 'appointment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

let users: User[] = [
  {
    id: 'user-kartik-1',
    name: 'Kartik Sharma',
    email: 'kartik@healthyfy.ai',
    passwordHash: bcrypt.hashSync('healthyfy123', 10),
    phone: '+91 98765 43210',
    city: 'Bengaluru, India',
    emergencyContact: {
      name: 'Rajesh Sharma (Father)',
      relationship: 'Father',
      phone: '+91 98765 43211',
    },
    preferences: { medicationAlarms: true, hydrationAlerts: true, reportReadyAlerts: true, fitnessMilestones: true },
  },
];

let familyMembers: FamilyMember[] = [
  {
    id: 'fam-1',
    userId: 'user-kartik-1',
    name: 'Kartik Sharma (You)',
    relationship: 'Self',
    age: 26,
    gender: 'Male',
    bloodGroup: 'O+',
    allergies: ['Dust mites', 'Penicillin'],
    existingConditions: ['Mild Asthma (Exercise-induced)'],
    medications: ['Salbutamol inhaler PRN'],
    emergencyContact: '+91 98765 43211',
    notes: 'Preparing for half-marathon, sedentary desk job in tech.',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'fam-2',
    userId: 'user-kartik-1',
    name: 'Rajesh Sharma',
    relationship: 'Father',
    age: 58,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: ['Sulfa drugs'],
    existingConditions: ['Type 2 Diabetes', 'Mild Hypertension'],
    medications: ['Metformin 500mg (Daily)', 'Telmisartan 40mg (Daily)'],
    emergencyContact: '+91 98765 43210',
    notes: 'Last HbA1c in February was 7.1%. Walks 30 mins every morning.',
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'fam-3',
    userId: 'user-kartik-1',
    name: 'Sunita Sharma',
    relationship: 'Mother',
    age: 54,
    gender: 'Female',
    bloodGroup: 'A+',
    allergies: ['Peanuts'],
    existingConditions: ['Hypothyroidism', 'Osteopenia'],
    medications: ['Thyronorm 50mcg (Fasting)', 'Calcium + Vit D3 (Post lunch)'],
    emergencyContact: '+91 98765 43210',
    notes: 'TSH stable. Practicing daily restorative yoga.',
    avatarColor: 'bg-teal-600',
  },
  {
    id: 'fam-4',
    userId: 'user-kartik-1',
    name: 'Ananya Sharma',
    relationship: 'Sister',
    age: 22,
    gender: 'Female',
    bloodGroup: 'O+',
    allergies: ['None known'],
    existingConditions: ['Mild Iron Deficiency'],
    medications: ['Ferrous Ascorbate 100mg'],
    emergencyContact: '+91 98765 43210',
    notes: 'College student, actively practicing badminton.',
    avatarColor: 'bg-amber-600',
  },
];

let medicalReports: MedicalReport[] = [
  {
    id: 'rep-1',
    userId: 'user-kartik-1',
    memberId: 'fam-2',
    memberName: 'Rajesh Sharma',
    reportType: 'Lipid Profile',
    title: 'Comprehensive Lipid & Cholesterol Panel',
    date: '2026-09-18',
    laboratory: 'MaxCare Diagnostics, Indiranagar',
    summary: 'The lipid profile shows borderline elevated LDL (bad cholesterol) and slightly elevated triglycerides, while HDL (protective cholesterol) remains in optimal range.',
    isUrgent: false,
    values: [
      { testName: 'Total Cholesterol', result: '215', referenceRange: '< 200 mg/dL', status: 'Higher than reference range', clinicalSignificance: 'Mildly elevated total circulating cholesterol.' },
      { testName: 'HDL (Good Cholesterol)', result: '52', referenceRange: '> 40 mg/dL', status: 'Within range', clinicalSignificance: 'Optimal cardiovascular protective level.' },
      { testName: 'LDL (Bad Cholesterol)', result: '138', referenceRange: '< 100 mg/dL', status: 'Higher than reference range', clinicalSignificance: 'Elevated; recommended to discuss dietary fiber and lipid-lowering measures.' },
      { testName: 'Triglycerides', result: '165', referenceRange: '< 150 mg/dL', status: 'Higher than reference range', clinicalSignificance: 'Mildly elevated; associated with carbohydrate intake and exercise balance.' },
      { testName: 'VLDL', result: '25', referenceRange: '< 30 mg/dL', status: 'Within range', clinicalSignificance: 'Normal.' },
    ],
    aiExplanation: 'Your father’s HDL is heart-protective, but LDL and Triglycerides are slightly higher than recommended benchmarks for adults over 50. This is very common and often responsive to reduced saturated fats, increased soluble fiber, and regular brisk walking.',
    possibleIndications: ['Mild hyperlipidemia', 'Metabolic lipid imbalance influenced by diet or genetics', 'Need for routine quarterly lipid monitoring'],
    suggestedQuestions: [
      'Should we consider adding plant sterols or dietary adjustments before pharmaceutical statin therapy?',
      'Does his current diabetes medication regimen influence triglyceride clearance?',
      'When should we schedule a follow-up fasting lipid profile?'
    ],
    nextSteps: [
      'Incorporate 25g+ of daily soluble fiber (oats, flaxseeds, psyllium, legumes).',
      'Maintain his 30-minute daily morning brisk walks consistently.',
      'Schedule a routine review with his primary physician within 3-4 weeks.'
    ],
    disclaimer: 'This AI analysis is for educational and informational purposes only and does not replace professional medical advice.',
  },
  {
    id: 'rep-2',
    userId: 'user-kartik-1',
    memberId: 'fam-1',
    memberName: 'Kartik Sharma (You)',
    reportType: 'CBC (Complete Blood Count)',
    title: 'Routine Executive Wellness CBC Panel',
    date: '2026-08-10',
    laboratory: 'Apollo Health Center',
    summary: 'Normal overall blood cell counts with normal Hemoglobin and healthy white blood cell counts, supporting normal oxygen transport and immune function.',
    isUrgent: false,
    values: [
      { testName: 'Hemoglobin', result: '15.2', referenceRange: '13.5 - 17.5 g/dL', status: 'Within range' },
      { testName: 'Total WBC Count', result: '6,800', referenceRange: '4,000 - 11,000 /uL', status: 'Within range' },
      { testName: 'Platelet Count', result: '240,000', referenceRange: '150,000 - 450,000 /uL', status: 'Within range' },
      { testName: 'RBC Count', result: '5.1', referenceRange: '4.5 - 5.9 mill/uL', status: 'Within range' },
      { testName: 'Hematocrit (PCV)', result: '45.1', referenceRange: '41 - 50 %', status: 'Within range' },
    ],
    aiExplanation: 'All primary CBC parameters are well within standard reference intervals. Adequate hydration and cardiovascular fitness are reflected in these balanced values.',
    possibleIndications: ['Healthy baseline hematology', 'No signs of acute infection or anemia'],
    suggestedQuestions: ['Are any additional athletic baseline panels (e.g. serum ferritin, Vitamin D3) recommended?'],
    nextSteps: ['Maintain current balanced nutrition and hydration levels during marathon training.'],
    disclaimer: 'This AI analysis is for educational and informational purposes only and does not replace professional medical advice.',
  },
  {
    id: 'rep-3',
    userId: 'user-kartik-1',
    memberId: 'fam-3',
    memberName: 'Sunita Sharma',
    reportType: 'Thyroid & Vitamin Panel',
    title: 'Thyroid Function & Vitamin D3/B12 Evaluation',
    date: '2026-07-25',
    laboratory: 'Metropolis Healthcare',
    summary: 'TSH is well-controlled under current Thyronorm dosage. Vitamin D3 is moderately deficient at 18 ng/mL, requiring supplementation.',
    isUrgent: false,
    values: [
      { testName: 'TSH (Thyroid Stimulating Hormone)', result: '2.4', referenceRange: '0.4 - 4.2 uIU/mL', status: 'Within range' },
      { testName: 'Free T4', result: '1.2', referenceRange: '0.8 - 1.8 ng/dL', status: 'Within range' },
      { testName: 'Vitamin D3 (25-OH)', result: '18.4', referenceRange: '30 - 100 ng/mL', status: 'Lower than reference range', clinicalSignificance: 'Deficiency; linked with bone density and muscle aches.' },
      { testName: 'Vitamin B12', result: '385', referenceRange: '200 - 900 pg/mL', status: 'Within range' },
    ],
    aiExplanation: 'Her thyroid medication is keeping her thyroid hormone levels very well-regulated. However, her Vitamin D3 level is 18.4 ng/mL, which is below the 30 ng/mL threshold and may contribute to osteopenia progression if unaddressed.',
    possibleIndications: ['Euthyroid state on replacement therapy', 'Moderate Vitamin D3 deficiency'],
    suggestedQuestions: ['Should we initiate a 6-week weekly 60,000 IU Cholecalciferol course?'],
    nextSteps: ['Discuss prescription weekly Vitamin D3 drops/capsules with endocrinologist or family physician.'],
    disclaimer: 'This AI analysis is for educational and informational purposes only and does not replace professional medical advice.',
  }
];

const doctorsDatabase: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Priya V. Nambiar',
    specialty: 'General Physician',
    qualification: 'MBBS, MD (Internal Medicine)',
    experienceYears: 14,
    hospital: 'Fortis Clinic & Diagnostics, Koramangala',
    distanceKm: 1.8,
    rating: 4.9,
    reviewsCount: 312,
    address: '80 Feet Road, 4th Block, Koramangala, Bengaluru',
    consultationFee: 700,
    availableTimings: '10:00 AM - 02:00 PM, 05:00 PM - 08:30 PM',
    isAvailableToday: true,
    avatarUrl: '/src/assets/images/doctor_female_avatar_1791210509492.jpg',
  },
  {
    id: 'doc-2',
    name: 'Dr. Arvind Swaminathan',
    specialty: 'Cardiologist',
    qualification: 'MD, DM (Cardiology), FACC',
    experienceYears: 20,
    hospital: 'Manipal Heart Foundation, Old Airport Road',
    distanceKm: 3.4,
    rating: 4.9,
    reviewsCount: 489,
    address: '98 HAL Airport Road, Kodihalli, Bengaluru',
    consultationFee: 1200,
    availableTimings: '11:00 AM - 04:00 PM',
    isAvailableToday: true,
    avatarUrl: '/src/assets/images/doctor_male_avatar_1791210521468.jpg',
  },
  {
    id: 'doc-3',
    name: 'Dr. Shalini Deshmukh',
    specialty: 'Dermatologist',
    qualification: 'MBBS, DDVL, MD (Dermatology)',
    experienceYears: 11,
    hospital: 'Skin & Aesthetics Center, Indiranagar',
    distanceKm: 2.5,
    rating: 4.8,
    reviewsCount: 240,
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    consultationFee: 850,
    availableTimings: '03:00 PM - 07:30 PM',
    isAvailableToday: false,
    avatarUrl: '/src/assets/images/doctor_female_avatar_1791210509492.jpg',
  },
  {
    id: 'doc-4',
    name: 'Dr. Rajeshwar Rao',
    specialty: 'Orthopedic',
    qualification: 'MS (Ortho), Fellowship in Joint Replacement (UK)',
    experienceYears: 18,
    hospital: 'Apollo Ortho & Spine Institute',
    distanceKm: 4.1,
    rating: 4.7,
    reviewsCount: 195,
    address: 'Bannerghatta Main Road, Bengaluru',
    consultationFee: 950,
    availableTimings: '09:30 AM - 01:00 PM',
    isAvailableToday: true,
    avatarUrl: '/src/assets/images/doctor_male_avatar_1791210521468.jpg',
  },
  {
    id: 'doc-5',
    name: 'Dr. Meera Iyer',
    specialty: 'Pediatrician',
    qualification: 'MD (Pediatrics), DCH',
    experienceYears: 12,
    hospital: 'Rainbow Children’s Clinic, HSR Layout',
    distanceKm: 2.9,
    rating: 4.9,
    reviewsCount: 350,
    address: 'Sector 3, 27th Main, HSR Layout, Bengaluru',
    consultationFee: 650,
    availableTimings: '10:00 AM - 01:30 PM, 06:00 PM - 09:00 PM',
    isAvailableToday: true,
    avatarUrl: '/src/assets/images/doctor_female_avatar_1791210509492.jpg',
  },
  {
    id: 'doc-6',
    name: 'Dr. Vikramaditya Sen',
    specialty: 'Neurologist',
    qualification: 'MD (Medicine), DM (Neurology)',
    experienceYears: 16,
    hospital: 'Aster CMI Hospital, Sahakara Nagar',
    distanceKm: 8.5,
    rating: 4.8,
    reviewsCount: 178,
    address: 'Bellary Road, Hebbal, Bengaluru',
    consultationFee: 1400,
    availableTimings: '11:30 AM - 03:30 PM',
    isAvailableToday: false,
    avatarUrl: '/src/assets/images/doctor_male_avatar_1791210521468.jpg',
  },
];

let notifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-kartik-1',
    type: 'medication',
    title: 'Father’s Medication Reminder',
    message: 'Rajesh Sharma: Post-dinner Metformin 500mg is scheduled for 8:30 PM.',
    timestamp: '15 mins ago',
    read: false,
    priority: 'high',
  },
  {
    id: 'notif-2',
    userId: 'user-kartik-1',
    type: 'hydration',
    title: 'Hydration Goal Alert',
    message: 'You have logged 1.8L of water today. Reach your 3.0L goal by evening!',
    timestamp: '1 hour ago',
    read: false,
    priority: 'low',
  },
  {
    id: 'notif-3',
    userId: 'user-kartik-1',
    type: 'report',
    title: 'Report Analysis Completed',
    message: 'Gemini AI finished evaluating Rajesh Sharma’s Lipid Profile report.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'medium',
  },
  {
    id: 'notif-4',
    userId: 'user-kartik-1',
    type: 'fitness',
    title: 'Daily Step Milestone',
    message: 'Great job! You achieved 8,420 steps today, 84% of your daily goal.',
    timestamp: 'Yesterday',
    read: true,
    priority: 'low',
  },
];

// Demo Fitness Tracker state
// Keep sync status per authenticated user so one user's setting cannot affect another.
const fitnessSyncByUser = new Map<string, boolean>();
const fitnessData = {
  syncStatus: 'Active (Fitbit & Apple Health Simulated Integration)',
  today: {
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
  },
  weeklySteps: [
    { day: 'Mon', steps: 9120, goal: 10000 },
    { day: 'Tue', steps: 10450, goal: 10000 },
    { day: 'Wed', steps: 7800, goal: 10000 },
    { day: 'Thu', steps: 8900, goal: 10000 },
    { day: 'Fri', steps: 11200, goal: 10000 },
    { day: 'Sat', steps: 12500, goal: 10000 },
    { day: 'Sun', steps: 8420, goal: 10000 },
  ],
  heartRateTrends: [
    { time: '06:00', bpm: 58 },
    { time: '09:00', bpm: 74 },
    { time: '12:00', bpm: 82 },
    { time: '15:00', bpm: 71 },
    { time: '18:00', bpm: 124 }, // workout
    { time: '21:00', bpm: 68 },
    { time: '00:00', bpm: 61 },
  ],
  sleepTrends: [
    { day: 'Mon', hours: 7.1 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 7.5 },
    { day: 'Thu', hours: 8.0 },
    { day: 'Fri', hours: 6.5 },
    { day: 'Sat', hours: 8.2 },
    { day: 'Sun', hours: 7.4 },
  ],
  recentWorkouts: [
    { type: 'Evening Run', duration: '35 mins', calories: 340, distance: '4.8 km', date: 'Today, 6:00 PM' },
    { type: 'Morning Mobility Yoga', duration: '25 mins', calories: 120, distance: '-', date: 'Yesterday, 7:00 AM' },
    { type: 'Brisk Outdoor Walk', duration: '40 mins', calories: 190, distance: '3.1 km', date: '3 Oct, 7:30 PM' },
  ],
};


// -------------------------------------------------------------
// MongoDB Persistence
// -------------------------------------------------------------
// All user-generated application data is stored in one MongoDB state
// document. This keeps the existing demo data model intact while making
// accounts, family records, reports, notifications and appointments
// persistent across server restarts.
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'healthyfy';
const MONGODB_COLLECTION = 'app_state';

let mongoClient: MongoClient | null = null;
let mongoStateCollection: any = null;

async function connectMongoAndLoadState(): Promise<void> {
  if (!MONGODB_URI) {
    if (isProd) {
      throw new Error('MONGODB_URI must be configured in production.');
    }
    console.warn('MONGODB_URI is not configured. Running with temporary in-memory data for local development.');
    return;
  }

  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();

  const db = mongoClient.db(MONGODB_DB_NAME);
  mongoStateCollection = db.collection(MONGODB_COLLECTION);

  const saved = await mongoStateCollection.findOne({ _id: 'main' });

  if (saved) {
    if (Array.isArray(saved.users)) users = saved.users;
    if (Array.isArray(saved.familyMembers)) familyMembers = saved.familyMembers;
    if (Array.isArray(saved.medicalReports)) medicalReports = saved.medicalReports;
    if (Array.isArray(saved.notifications)) notifications = saved.notifications;
    if (Array.isArray(saved.appointments)) appointments = saved.appointments;

    fitnessSyncByUser.clear();
    if (saved.fitnessSyncByUser && typeof saved.fitnessSyncByUser === 'object') {
      for (const [userId, enabled] of Object.entries(saved.fitnessSyncByUser)) {
        fitnessSyncByUser.set(userId, Boolean(enabled));
      }
    }

    console.log(`MongoDB connected. Loaded Healthyfy data from ${MONGODB_DB_NAME}.${MONGODB_COLLECTION}.`);
  } else {
    await persistState();
    console.log(`MongoDB connected. Created initial Healthyfy data in ${MONGODB_DB_NAME}.${MONGODB_COLLECTION}.`);
  }
}

async function persistState(): Promise<void> {
  if (!mongoStateCollection) return;

  await mongoStateCollection.replaceOne(
    { _id: 'main' },
    {
      _id: 'main',
      users,
      familyMembers,
      medicalReports,
      notifications,
      appointments,
      fitnessSyncByUser: Object.fromEntries(fitnessSyncByUser.entries()),
      updatedAt: new Date(),
    },
    { upsert: true },
  );
}

async function persistStateSafely(): Promise<void> {
  try {
    await persistState();
  } catch (error) {
    console.error('MongoDB persistence error:', error);
  }
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) return res.status(401).json({ error: 'Authentication required.' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    const user = users.find((u) => u.id === payload.id);
    if (!user) return res.status(401).json({ error: 'User account no longer exists.' });
    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// -------------------------------------------------------------
// App Setup & Routes
// -------------------------------------------------------------
const app = express();
app.use(express.json({ limit: '25mb' }));

// 1. Auth Endpoints
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password, phone, city } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: normalizedName,
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    phone: phone || '',
    city: city || 'Bengaluru, India',
    emergencyContact: { name: '', relationship: '', phone: '' },
    preferences: { medicationAlarms: true, hydrationAlerts: true, reportReadyAlerts: true, fitnessMilestones: true },
  };
  users.push(newUser);

  // Create self profile in family members
  familyMembers.push({
    id: `fam-${Date.now()}`,
    userId: newUser.id,
    name: `${normalizedName} (You)`,
    relationship: 'Self',
    age: 0,
    gender: 'Other',
    bloodGroup: 'Unknown',
    allergies: [],
    existingConditions: [],
    medications: [],
    emergencyContact: phone || '',
    notes: '',
    avatarColor: 'bg-emerald-500',
  });

  await persistState();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
    expiresIn: '7d',
  });
  return res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '7d',
  });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city } });
});

app.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.user?.id);
  if (!user) return res.status(401).json({ error: 'User account not found.' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city }, preferences: user.preferences });
});

app.put('/api/auth/profile', authenticateToken, async (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.user!.id);
  if (!user) return res.status(404).json({ error: 'User account not found.' });
  const { name, phone, city, preferences } = req.body || {};
  if (typeof name === 'string' && name.trim()) user.name = name.trim();
  if (typeof phone === 'string') user.phone = phone.trim();
  if (typeof city === 'string') user.city = city.trim();
  if (preferences && typeof preferences === 'object') {
    for (const key of ['medicationAlarms', 'hydrationAlerts', 'reportReadyAlerts', 'fitnessMilestones']) {
      if (typeof preferences[key] === 'boolean') user.preferences[key as keyof typeof user.preferences] = preferences[key];
    }
  }
  const self = familyMembers.find((f) => f.userId === user.id && f.relationship === 'Self');
  if (self) { self.name = `${user.name} (You)`; self.emergencyContact = user.phone || self.emergencyContact; }
  await persistState();
  res.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, city: user.city }, preferences: user.preferences });
});

// 2. Family Members Endpoints
app.get('/api/family', authenticateToken, (req: Request, res: Response) => {
  const currentUserId = req.user!.id;
  const list = familyMembers.filter((f) => f.userId === currentUserId);
  res.json(list);
});

app.post('/api/family', authenticateToken, async (req: Request, res: Response) => {
  const currentUserId = req.user!.id;
  const { name, relationship, age, gender, bloodGroup, allergies, existingConditions, medications, emergencyContact, notes } = req.body;

  if (!name || !relationship) {
    return res.status(400).json({ error: 'Name and relationship are required.' });
  }

  const colors = ['bg-indigo-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600', 'bg-teal-600', 'bg-sky-600'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];

  const newMember: FamilyMember = {
    id: `fam-${Date.now()}`,
    userId: currentUserId,
    name,
    relationship,
    age: Number(age) || 30,
    gender: gender || 'Other',
    bloodGroup: bloodGroup || 'Unknown',
    allergies: Array.isArray(allergies) ? allergies : typeof allergies === 'string' ? allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
    existingConditions: Array.isArray(existingConditions) ? existingConditions : typeof existingConditions === 'string' ? existingConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
    medications: Array.isArray(medications) ? medications : typeof medications === 'string' ? medications.split(',').map((s) => s.trim()).filter(Boolean) : [],
    emergencyContact: emergencyContact || '',
    notes: notes || '',
    avatarColor,
  };

  familyMembers.push(newMember);
  await persistState();
  res.status(201).json(newMember);
});

app.put('/api/family/:id', authenticateToken, async (req: Request, res: Response) => {
  const index = familyMembers.findIndex((f) => f.id === req.params.id && f.userId === req.user!.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Family member not found.' });
  }

  const { userId: _userId, id: _id, ...safeUpdates } = req.body || {};
  familyMembers[index] = { ...familyMembers[index], ...safeUpdates, userId: req.user!.id, id: familyMembers[index].id };
  await persistState();
  res.json(familyMembers[index]);
});

app.delete('/api/family/:id', authenticateToken, async (req: Request, res: Response) => {
  const index = familyMembers.findIndex((f) => f.id === req.params.id && f.userId === req.user!.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Family member not found.' });
  }

  familyMembers.splice(index, 1);
  await persistState();
  res.json({ success: true, message: 'Family member removed.' });
});

// 3. Health Records & Reports
app.get('/api/records', authenticateToken, (req: Request, res: Response) => {
  const { memberId } = req.query;
  const currentUserId = req.user!.id;
  let records = medicalReports.filter((r) => r.userId === currentUserId);
  if (memberId) {
    records = records.filter((r) => r.memberId === memberId);
  }
  res.json(records);
});

app.post('/api/records', authenticateToken, async (req: Request, res: Response) => {
  const currentUserId = req.user!.id;
  const member = familyMembers.find((f) => f.id === req.body.memberId && f.userId === currentUserId);
  if (!member) return res.status(403).json({ error: 'You can only save records for your own family members.' });
  const { id: _id, userId: _userId, ...reportBody } = req.body || {};
  const newReport: MedicalReport = {
    ...reportBody,
    id: `rep-${Date.now()}`,
    userId: currentUserId,
    memberId: member.id,
    memberName: member.name,
    date: req.body.date || new Date().toISOString().split('T')[0],
  };
  medicalReports.unshift(newReport);
  await persistState();
  res.status(201).json(newReport);
});

app.delete('/api/records/:id', authenticateToken, async (req: Request, res: Response) => {
  const index = medicalReports.findIndex((r) => r.id === req.params.id && r.userId === req.user!.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Report not found.' });
  }
  medicalReports.splice(index, 1);
  await persistState();
  res.json({ success: true });
});

// 4. Gemini AI Report Analysis
app.post('/api/ai/analyze-report', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { reportType, reportText, imageBase64, imageMimeType, memberId } = req.body;
    const member = familyMembers.find((f) => f.id === memberId && f.userId === req.user!.id);
    if (!member) return res.status(404).json({ error: 'Selected family member was not found.' });

    const promptText = `
You are Healthyfy AI, an expert medical report analysis assistant.
Analyze this medical report carefully and return a structured JSON response.

Member Context:
- Name: ${member.name}
- Age: ${member.age}, Gender: ${member.gender}
- Known Conditions: ${member.existingConditions.join(', ') || 'None'}
- Current Medications: ${member.medications.join(', ') || 'None'}
- Allergies: ${member.allergies.join(', ') || 'None'}

Report Type: ${reportType || 'General Laboratory Panel'}
Report Content / Values:
${reportText || 'Patient provided image/scanned document of lab report.'}

CRITICAL MEDICAL SAFETY REQUIREMENTS:
1. You are an educational and informational tool, NOT a replacement for a doctor.
2. Provide a clear, jargon-free summary in conversational, reassuring language.
3. Extract each test into an item with testName, result, referenceRange, and status strictly as one of:
   - "Within range"
   - "Higher than reference range"
   - "Lower than reference range"
4. Explain abnormal or notable values in simple language that an ordinary person can easily comprehend.
5. List educational possibilities of what results may indicate (NEVER present a diagnosis as certain).
6. Provide suggested practical questions the user should ask their doctor.
7. Outline helpful next steps (e.g. hydration, dietary adjustment, routine doctor consultation).
8. Emergency Warning: If values are critically life-threatening (e.g., severe acute chest pain signs, troponin spike, critical hypoglycemia < 40mg/dL, platelets < 20,000, dangerous potassium spike), set isUrgent to true and provide an immediate warning to seek emergency care. Otherwise set isUrgent to false.
9. Always include the standard disclaimer: "This AI analysis is for informational purposes only and does not replace professional medical advice."
`;

    if (!ai) return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env to analyze reports.' });

    let contentsPayload: any = promptText;

    if (imageBase64 && imageMimeType) {
      contentsPayload = {
        parts: [
          {
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
            },
          },
          { text: promptText },
        ],
      };
    }

    const response = await generateGeminiWithFallback<any>((model) => ai.models.generateContent({
      model,
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'Simple plain-language summary of what the report contains.' },
            values: {
              type: Type.ARRAY,
              description: 'Extracted key lab test metrics.',
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  result: { type: Type.STRING },
                  referenceRange: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    enum: ['Within range', 'Higher than reference range', 'Lower than reference range'],
                  },
                  clinicalSignificance: { type: Type.STRING },
                },
                required: ['testName', 'result', 'referenceRange', 'status'],
              },
            },
            aiExplanation: { type: Type.STRING, description: 'Conversational explanation of abnormal or notable values.' },
            possibleIndications: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'General educational possibilities without definite diagnosis.',
            },
            suggestedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Specific questions to ask a doctor.',
            },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Suggested lifestyle and follow-up medical actions.',
            },
            isUrgent: { type: Type.BOOLEAN, description: 'True if values suggest an emergency needing immediate ER care.' },
            emergencyWarning: { type: Type.STRING, description: 'Warning text if urgent.' },
            disclaimer: { type: Type.STRING },
          },
          required: ['summary', 'values', 'aiExplanation', 'possibleIndications', 'suggestedQuestions', 'nextSteps', 'isUrgent'],
        },
      },
    }), { maxModels: GEMINI_FALLBACK_MODELS.length, retriesPerModel: 2, baseDelayMs: 1500 });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.disclaimer) {
      parsed.disclaimer = 'This AI analysis is for informational purposes only and does not replace professional medical advice.';
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing report with Gemini:', error);
    return res.status(502).json({ error: 'AI report analysis is temporarily unavailable. No medical values were fabricated or assumed.' });
  }
});

// 5. Gemini AI Health Assistant / Chat
app.post('/api/ai/chat', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { message, memberId, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const member = familyMembers.find((f) => f.id === memberId && f.userId === req.user!.id);
    if (!member) return res.status(404).json({ error: 'Selected family member was not found.' });
    const memberRecentReports = medicalReports
      .filter((r) => r.memberId === member.id)
      .slice(0, 2)
      .map((r) => `${r.reportType} (${r.date}): ${r.summary}`)
      .join('\n');

    const systemInstruction = `
You are Healthyfy AI, an intelligent, compassionate personal and family health companion.
Current Selected Family Member Context:
- Name: ${member.name} (${member.relationship})
- Age: ${member.age}, Gender: ${member.gender}
- Blood Group: ${member.bloodGroup}
- Allergies: ${member.allergies.join(', ') || 'None reported'}
- Known Conditions: ${member.existingConditions.join(', ') || 'None reported'}
- Medications: ${member.medications.join(', ') || 'None reported'}
- Recent Stored Lab Reports:
${memberRecentReports || 'No recent reports stored.'}

GUIDELINES:
1. Always address questions in a supportive, polite, and medically grounded tone.
2. You do NOT diagnose illnesses definitively, nor do you replace a physician.
3. If the user asks about emergency symptoms (e.g., severe sudden chest pressure, acute weakness, uncontrolled bleeding, severe shortness of breath), immediately urge them to call local emergency services (e.g. 112 / 911 / 108) or visit the nearest ER.
4. When answering questions regarding lab reports, diet, sleep, or fitness, provide clear, actionable, and science-backed explanations.
5. Offer 2-3 concrete questions they can ask their doctor.
6. Keep formatting clean with clear paragraphs and bullet points where helpful.
7. Conclude with a brief reminder that this information is educational.
`;

    if (!ai) return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env to use AI chat.' });

    let response: any;
    try {
      response = await generateGeminiWithFallback((model) => ai.models.generateContent({
        model,
        contents: message,
        config: { systemInstruction },
      }), { maxModels: 4, retriesPerModel: 2, baseDelayMs: 1200 });
    } catch (error: any) {
      console.error('Gemini AI chat unavailable after retries/fallback models:', error);
      return res.json({
        reply: 'The AI service is temporarily busy right now. Please try your question again in a few moments. If you have an emergency or severe symptoms, contact local emergency services or a doctor immediately.',
      });
    }


    return res.json({ reply: response.text || 'I am here to help. Could you please rephrase your health question?' });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    return res.json({
      reply: 'I apologize, I am temporarily having trouble contacting the AI engine. However, remember to stay hydrated, maintain good rest, and speak with your doctor if you have immediate medical concerns.',
    });
  }
});

// 6. Gemini AI Personalized Diet Plan
app.post('/api/ai/generate-diet', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { age, goals, activityLevel, dietaryPreference, allergies, schedule, memberId } = req.body;
    const member = familyMembers.find((f) => f.id === memberId && f.userId === req.user!.id);
    if (!member) return res.status(404).json({ error: 'Selected family member was not found.' });

    const promptText = `
Generate a personalized, culturally adaptable, and medically conscious daily & weekly nutrition plan for:
- Individual: ${member.name}
- Age: ${age || member.age}
- Health Goals: ${goals || 'Overall vitality, cardiovascular wellness, energy optimization'}
- Activity Level: ${activityLevel || 'Moderately active'}
- Dietary Preference: ${dietaryPreference || 'Balanced (Vegetarian/Flexitarian)'}
- Allergies / Intolerances: ${allergies || member.allergies.join(', ') || 'None'}
- Existing Health Conditions: ${member.existingConditions.join(', ') || 'None'}
- Approximate Schedule: ${schedule || 'Wake up 7:00 AM, Desk work 9-5, Sleep 11:00 PM'}

Return structured JSON with:
- overview: Short encouraging paragraph outlining dietary strategy
- calorieTarget: Estimated daily kcal target
- meals: Object with breakfast, midMorningSnack, lunch, eveningSnack, dinner. Each meal must include:
    - title: Meal name
    - items: Array of dishes/ingredients with portion sizes
    - calories: string (approx kcal)
    - protein: string (e.g. "24g")
    - keyBenefit: Why this benefits their specific health goals
- weeklyMealIdeas: Array of 3 creative alternative suggestions for the week
- hydrationTips: Array of 3 daily hydration reminders
- groceryList: Array of key healthy grocery items to pick up
- healthyAlternatives: Array of objects with { craving: string, swap: string, benefit: string }
- disclaimer: Standard disclaimer noting this is general nutritional guidance, and individuals with chronic conditions (such as diabetes, renal disease, pregnancy) should consult a registered dietitian.
`;

    if (!ai) return res.status(503).json({ error: 'Gemini is not configured. Add GEMINI_API_KEY to .env to generate diet plans.' });

    const response = await generateGeminiWithFallback<any>((model) => ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            calorieTarget: { type: Type.STRING },
            meals: {
              type: Type.OBJECT,
              properties: {
                breakfast: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, keyBenefit: { type: Type.STRING } },
                  required: ['title', 'items', 'calories', 'protein', 'keyBenefit'],
                },
                midMorningSnack: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, keyBenefit: { type: Type.STRING } },
                  required: ['title', 'items', 'calories', 'protein', 'keyBenefit'],
                },
                lunch: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, keyBenefit: { type: Type.STRING } },
                  required: ['title', 'items', 'calories', 'protein', 'keyBenefit'],
                },
                eveningSnack: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, keyBenefit: { type: Type.STRING } },
                  required: ['title', 'items', 'calories', 'protein', 'keyBenefit'],
                },
                dinner: {
                  type: Type.OBJECT,
                  properties: { title: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.STRING } }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, keyBenefit: { type: Type.STRING } },
                  required: ['title', 'items', 'calories', 'protein', 'keyBenefit'],
                },
              },
              required: ['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'],
            },
            weeklyMealIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            hydrationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            groceryList: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthyAlternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { craving: { type: Type.STRING }, swap: { type: Type.STRING }, benefit: { type: Type.STRING } },
                required: ['craving', 'swap', 'benefit'],
              },
            },
            disclaimer: { type: Type.STRING },
          },
          required: ['overview', 'calorieTarget', 'meals', 'weeklyMealIdeas', 'hydrationTips', 'groceryList', 'healthyAlternatives'],
        },
      },
    }), { maxModels: GEMINI_FALLBACK_MODELS.length, retriesPerModel: 2, baseDelayMs: 1200 });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.disclaimer) {
      parsed.disclaimer = 'This meal plan is for general wellness and educational guidance. Users with medical conditions should consult a certified dietitian.';
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI diet:', error);
    return res.status(500).json({ error: 'Failed to generate personalized diet plan. Please try again.' });
  }
});

// 7. Doctors API
app.get('/api/doctors', (req: Request, res: Response) => {
  const { specialty, query, availableToday } = req.query;
  let list = [...doctorsDatabase];

  if (specialty && specialty !== 'All') {
    list = list.filter((d) => d.specialty.toLowerCase() === String(specialty).toLowerCase());
  }

  if (availableToday === 'true') {
    list = list.filter((d) => d.isAvailableToday);
  }

  if (query) {
    const q = String(query).toLowerCase();
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.address.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

// 8. Appointment API
interface Appointment {
  id: string; userId: string; doctorId: string; doctorName: string; specialty: string; date: string; slot: string; status: 'confirmed' | 'cancelled'; createdAt: string;
}
let appointments: Appointment[] = [];

app.post('/api/appointments', authenticateToken, async (req: Request, res: Response) => {
  const { doctorId, date, slot } = req.body || {};
  const doctor = doctorsDatabase.find((d) => d.id === doctorId);
  if (!doctor || !date || !slot) return res.status(400).json({ error: 'Doctor, date and time slot are required.' });
  const selected = new Date(`${date}T12:00:00`);
  if (Number.isNaN(selected.getTime()) || selected < new Date(new Date().toDateString())) return res.status(400).json({ error: 'Please choose a valid future date.' });
  const conflict = appointments.some((a) => a.doctorId === doctorId && a.date === date && a.slot === slot && a.status === 'confirmed');
  if (conflict) return res.status(409).json({ error: 'That slot is already booked. Please choose another slot.' });
  const appointment: Appointment = { id: crypto.randomUUID(), userId: req.user!.id, doctorId, doctorName: doctor.name, specialty: doctor.specialty, date, slot, status: 'confirmed', createdAt: new Date().toISOString() };
  appointments.push(appointment);
  notifications.push({ id: `notif-${crypto.randomUUID()}`, userId: req.user!.id, type: 'appointment', title: 'Appointment confirmed', message: `${doctor.name} on ${date} at ${slot}.`, timestamp: new Date().toISOString(), read: false, priority: 'medium' });
  await persistState();
  res.status(201).json(appointment);
});

app.get('/api/appointments', authenticateToken, (req: Request, res: Response) => {
  res.json(appointments.filter((a) => a.userId === req.user!.id));
});

// 8. Fitness API
app.get('/api/fitness', authenticateToken, (req: Request, res: Response) => {
  res.json({
    syncEnabled: fitnessSyncByUser.get(req.user!.id) ?? false,
    ...fitnessData,
  });
});

app.post('/api/fitness/toggle-sync', authenticateToken, async (req: Request, res: Response) => {
  const next = !(fitnessSyncByUser.get(req.user!.id) ?? false);
  fitnessSyncByUser.set(req.user!.id, next);
  await persistState();
  res.json({ syncEnabled: next, message: next ? 'Simulated wearable sync active' : 'Wearable sync paused' });
});

// 9. Notifications API
app.get('/api/notifications', authenticateToken, (req: Request, res: Response) => {
  res.json(notifications.filter((n) => n.userId === req.user!.id));
});

app.post('/api/notifications/:id/read', authenticateToken, async (req: Request, res: Response) => {
  const item = notifications.find((n) => n.id === req.params.id && n.userId === req.user!.id);
  if (item) item.read = true;
  await persistState();
  res.json({ success: true });
});

app.post('/api/notifications/clear-all', authenticateToken, async (req: Request, res: Response) => {
  notifications.filter((n) => n.userId === req.user!.id).forEach((n) => (n.read = true));
  await persistState();
  res.json({ success: true });
});

// -------------------------------------------------------------
// Vite Dev Server Integration / Static Serving
// -------------------------------------------------------------
async function startServer() {
  await connectMongoAndLoadState();

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Healthyfy server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
