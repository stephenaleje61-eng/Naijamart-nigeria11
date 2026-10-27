import { 
  GradingScale, 
  CourseGrade, 
  CourseItem, 
  SemesterRecord, 
  DegreeClassification, 
  WhatIfResult, 
  FinalCgpaPrediction,
  SavedCgpaRecord 
} from '../types/cgpa';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Point mappings
export const GRADE_POINTS_5_0: Record<CourseGrade, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const GRADE_POINTS_4_0: Record<CourseGrade, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
  E: 0,
  F: 0,
};

export const POPULAR_NIGERIAN_UNIVERSITIES = [
  'FUWukari - Federal University Wukari',
  'UNILAG - University of Lagos',
  'FUTO - Federal University of Technology Owerri',
  'UNILORIN - University of Ilorin',
  'ABU Zaria - Ahmadu Bello University',
  'UNN - University of Nigeria Nsukka',
  'OAU - Obafemi Awolowo University',
  'UI - University of Ibadan',
  'ATBU - Abubakar Tafawa Balewa University',
  'UNIBEN - University of Benin',
  'FUTA - Federal University of Technology Akure',
  'UniAbuja - University of Abuja',
  'UniPort - University of Port Harcourt',
  'LASU - Lagos State University',
  'Covenant University',
  'Babcock University',
  'Afe Babalola University (ABUAD)',
  'Other Nigerian University / Polytechnic'
];

/**
 * Get grade point value for a specific scale
 */
export function getGradePoint(grade: CourseGrade, scale: GradingScale): number {
  return scale === '5.0' ? GRADE_POINTS_5_0[grade] : GRADE_POINTS_4_0[grade];
}

/**
 * Calculate totals for a semester
 */
export function calculateSemesterSummary(courses: CourseItem[], scale: GradingScale) {
  let totalUnits = 0;
  let totalPoints = 0;
  let carryoversCount = 0;

  for (const c of courses) {
    const units = Math.max(0, Number(c.units) || 0);
    const pts = getGradePoint(c.grade, scale);
    totalUnits += units;
    totalPoints += units * pts;
    if (c.grade === 'F' && units > 0) {
      carryoversCount += 1;
    }
  }

  const gpa = totalUnits > 0 ? parseFloat((totalPoints / totalUnits).toFixed(2)) : 0.0;

  return {
    totalUnits,
    totalPoints,
    gpa,
    carryoversCount,
  };
}

/**
 * Calculate overall CGPA across all semesters
 */
export function calculateOverallCgpa(semesters: SemesterRecord[], scale: GradingScale) {
  let cumulativeUnits = 0;
  let cumulativePoints = 0;
  let totalCarryovers = 0;

  for (const sem of semesters) {
    const { totalUnits, totalPoints, carryoversCount } = calculateSemesterSummary(sem.courses, scale);
    cumulativeUnits += totalUnits;
    cumulativePoints += totalPoints;
    totalCarryovers += carryoversCount;
  }

  const cgpa = cumulativeUnits > 0 ? parseFloat((cumulativePoints / cumulativeUnits).toFixed(2)) : 0.0;

  return {
    cumulativeUnits,
    cumulativePoints,
    cgpa,
    totalCarryovers,
  };
}

/**
 * Determine Degree Classification based on CGPA and scale
 */
export function getDegreeClassification(cgpa: number, scale: GradingScale): DegreeClassification {
  if (scale === '5.0') {
    if (cgpa >= 4.5) {
      return {
        classTitle: 'First Class Honours',
        shortTitle: 'First Class',
        badgeColor: 'bg-amber-500 text-amber-950 border-amber-300',
        textColor: 'text-amber-500',
        hexColor: '#D97706',
        bgGradient: 'from-amber-500 via-yellow-400 to-amber-600',
        description: 'Exceptional academic excellence. Highest distinction possible in Nigerian universities.',
        motivationalQuote: 'Outstanding brilliance! The sky is just your stepping stone! 🏆',
        minCgpa: 4.5,
        maxCgpa: 5.0,
      };
    }
    if (cgpa >= 3.5) {
      return {
        classTitle: 'Second Class Upper (2:1)',
        shortTitle: 'Second Class Upper',
        badgeColor: 'bg-emerald-600 text-white border-emerald-400',
        textColor: 'text-emerald-600',
        hexColor: '#059669',
        bgGradient: 'from-emerald-600 via-teal-500 to-emerald-700',
        description: 'Strong, commendable academic performance. Eligible for top corporate jobs and postgraduate scholarships.',
        motivationalQuote: 'Almost First Class! Push just a little harder next semester! 🌟',
        minCgpa: 3.5,
        maxCgpa: 4.49,
      };
    }
    if (cgpa >= 2.4) {
      return {
        classTitle: 'Second Class Lower (2:2)',
        shortTitle: 'Second Class Lower',
        badgeColor: 'bg-blue-600 text-white border-blue-400',
        textColor: 'text-blue-600',
        hexColor: '#2563EB',
        bgGradient: 'from-blue-600 via-indigo-500 to-blue-700',
        description: 'Solid academic standing. Good foundation with ample room to boost into 2:1 territory.',
        motivationalQuote: 'Consistent effort! You have the potential to climb higher! 📘',
        minCgpa: 2.4,
        maxCgpa: 3.49,
      };
    }
    if (cgpa >= 1.5) {
      return {
        classTitle: 'Third Class Honours',
        shortTitle: 'Third Class',
        badgeColor: 'bg-orange-500 text-white border-orange-300',
        textColor: 'text-orange-600',
        hexColor: '#EA580C',
        bgGradient: 'from-orange-500 via-amber-600 to-orange-700',
        description: 'Satisfactory standing. Urgent strategic study and course retakes recommended to elevate grade.',
        motivationalQuote: 'Never give up! Strategic focus will turn things around! 📙',
        minCgpa: 1.5,
        maxCgpa: 2.39,
      };
    }
    return {
      classTitle: 'Pass / Academic Probation',
      shortTitle: 'Pass / Probation',
      badgeColor: 'bg-red-600 text-white border-red-400',
      textColor: 'text-red-600',
      hexColor: '#DC2626',
      bgGradient: 'from-red-600 via-rose-600 to-red-800',
      description: 'At risk of academic probation. Immediate counseling, study group joining, and retake planning required.',
      motivationalQuote: 'Every champion faces setbacks. Regroup, clear carryovers, and rise again! ⚠️',
      minCgpa: 0.0,
      maxCgpa: 1.49,
    };
  }

  // 4.0 Scale (Polytechnics / Select Institutions)
  if (cgpa >= 3.5) {
    return {
      classTitle: 'Distinction / First Class',
      shortTitle: 'Distinction',
      badgeColor: 'bg-amber-500 text-amber-950 border-amber-300',
      textColor: 'text-amber-500',
      hexColor: '#D97706',
      bgGradient: 'from-amber-500 via-yellow-400 to-amber-600',
      description: 'Top honor distinction on the 4.0 scale.',
      motivationalQuote: 'Brilliant mastery! Academic excellence confirmed! 🏆',
      minCgpa: 3.5,
      maxCgpa: 4.0,
    };
  }
  if (cgpa >= 3.0) {
    return {
      classTitle: 'Upper Credit (2:1)',
      shortTitle: 'Upper Credit',
      badgeColor: 'bg-emerald-600 text-white border-emerald-400',
      textColor: 'text-emerald-600',
      hexColor: '#059669',
      bgGradient: 'from-emerald-600 via-teal-500 to-emerald-700',
      description: 'Strong upper credit standing.',
      motivationalQuote: 'Superb result! Well done on your upper credit! 🌟',
      minCgpa: 3.0,
      maxCgpa: 3.49,
    };
  }
  if (cgpa >= 2.5) {
    return {
      classTitle: 'Lower Credit (2:2)',
      shortTitle: 'Lower Credit',
      badgeColor: 'bg-blue-600 text-white border-blue-400',
      textColor: 'text-blue-600',
      hexColor: '#2563EB',
      bgGradient: 'from-blue-600 via-indigo-500 to-blue-700',
      description: 'Sound credit standing with room to scale into upper credit.',
      motivationalQuote: 'Keep building momentum! Upper credit is within reach! 📘',
      minCgpa: 2.5,
      maxCgpa: 2.99,
    };
  }
  if (cgpa >= 2.0) {
    return {
      classTitle: 'Pass Grade',
      shortTitle: 'Pass',
      badgeColor: 'bg-orange-500 text-white border-orange-300',
      textColor: 'text-orange-600',
      hexColor: '#EA580C',
      bgGradient: 'from-orange-500 via-amber-600 to-orange-700',
      description: 'Basic passing requirement met.',
      motivationalQuote: 'Keep pushing! Target high grades in remaining semesters! 📙',
      minCgpa: 2.0,
      maxCgpa: 2.49,
    };
  }
  return {
    classTitle: 'Fail / Probation',
    shortTitle: 'Probation',
    badgeColor: 'bg-red-600 text-white border-red-400',
    textColor: 'text-red-600',
    hexColor: '#DC2626',
    bgGradient: 'from-red-600 via-rose-600 to-red-800',
    description: 'Below minimum pass standard.',
    motivationalQuote: 'Take heart. Meet your academic advisor to structure a comeback strategy! ⚠️',
    minCgpa: 0.0,
    maxCgpa: 1.99,
  };
}

/**
 * What-If Target CGPA calculation
 */
export function calculateWhatIf(
  currentCgpa: number,
  currentUnits: number,
  nextUnits: number,
  targetCgpa: number,
  scale: GradingScale
): WhatIfResult {
  const maxPossibleGpa = scale === '5.0' ? 5.0 : 4.0;

  if (currentUnits <= 0) {
    return {
      targetCgpa,
      currentCgpa: 0,
      currentUnits: 0,
      nextUnits,
      requiredGpa: targetCgpa,
      isAchievable: targetCgpa <= maxPossibleGpa,
      advice: targetCgpa <= maxPossibleGpa
        ? `Since this is your first semester, simply achieve a ${targetCgpa.toFixed(2)} GPA!`
        : `Target CGPA cannot exceed ${maxPossibleGpa.toFixed(2)}.`,
    };
  }

  const currentTgp = currentCgpa * currentUnits;
  const targetTotalUnits = currentUnits + nextUnits;
  const targetTotalTgp = targetCgpa * targetTotalUnits;
  const requiredNextTgp = targetTotalTgp - currentTgp;
  const requiredGpa = nextUnits > 0 ? parseFloat((requiredNextTgp / nextUnits).toFixed(2)) : 0;

  const isAchievable = requiredGpa <= maxPossibleGpa && requiredGpa >= 0;

  let advice = '';
  if (requiredGpa > maxPossibleGpa) {
    const maxAttainableCgpa = parseFloat(((currentTgp + nextUnits * maxPossibleGpa) / targetTotalUnits).toFixed(2));
    advice = `Mathematically impossible in a single semester (needs ${requiredGpa.toFixed(2)} GPA, above max ${maxPossibleGpa.toFixed(2)}). Even with straight A's (${maxPossibleGpa.toFixed(2)}), your maximum CGPA this semester will be ${maxAttainableCgpa}. You will need 2+ consistent high-GPA semesters to reach ${targetCgpa.toFixed(2)}.`;
  } else if (requiredGpa <= 0) {
    advice = `Your current CGPA is already safely above your target! Even with a minimal GPA next semester, your cumulative average remains at or above ${targetCgpa.toFixed(2)}.`;
  } else if (requiredGpa >= 4.5) {
    advice = `Requires top-tier dedication! You need approx straight A's (GPA: ${requiredGpa.toFixed(2)}) across your ${nextUnits} units next semester. Form study groups and start revisions early.`;
  } else if (requiredGpa >= 3.5) {
    advice = `Very realistic and attainable! Aim for a mix of A's and B's (GPA: ${requiredGpa.toFixed(2)}) to hit your target of ${targetCgpa.toFixed(2)}.`;
  } else {
    advice = `Easily achievable! A steady performance with C's and B's (GPA: ${requiredGpa.toFixed(2)}) will secure your target CGPA.`;
  }

  return {
    targetCgpa,
    currentCgpa,
    currentUnits,
    nextUnits,
    requiredGpa: Math.max(0, requiredGpa),
    isAchievable,
    advice,
  };
}

/**
 * Final Degree CGPA Predictor
 */
export function predictFinalCgpa(
  currentLevel: string,
  currentCgpa: number,
  projectedFutureGpa: number,
  scale: GradingScale
): FinalCgpaPrediction {
  const unitsMap: Record<string, { completed: number; remaining: number }> = {
    '100L': { completed: 36, remaining: 108 }, // 4-year degree (144 total units)
    '200L': { completed: 72, remaining: 72 },
    '300L': { completed: 108, remaining: 36 },
    '400L': { completed: 126, remaining: 18 },
    '500L': { completed: 150, remaining: 20 },
  };

  const { completed, remaining } = unitsMap[currentLevel] || { completed: 50, remaining: 50 };
  const currentPoints = currentCgpa * completed;
  const projectedPoints = projectedFutureGpa * remaining;
  const totalUnits = completed + remaining;
  const predictedCgpa = parseFloat(((currentPoints + projectedPoints) / totalUnits).toFixed(2));

  return {
    currentLevel,
    currentCgpa,
    completedUnits: completed,
    remainingUnits: remaining,
    projectedGpa: projectedFutureGpa,
    predictedFinalCgpa: predictedCgpa,
    predictedClass: getDegreeClassification(predictedCgpa, scale),
  };
}

/**
 * Pre-loaded example semester for demonstration
 */
export function getExampleSemester(): SemesterRecord {
  const courses: CourseItem[] = [
    { id: 'ex-1', code: 'MTH 101', title: 'Elementary Mathematics I (Calculus & Algebra)', units: 3, grade: 'A' },
    { id: 'ex-2', code: 'PHY 101', title: 'General Physics I (Mechanics & Properties of Matter)', units: 3, grade: 'B' },
    { id: 'ex-3', code: 'CHM 101', title: 'General Chemistry I (Physical & Inorganic)', units: 3, grade: 'A' },
    { id: 'ex-4', code: 'GST 101', title: 'Use of English & Communication Skills', units: 2, grade: 'A' },
    { id: 'ex-5', code: 'PHY 107', title: 'Practical Physics Laboratory I', units: 1, grade: 'A' },
    { id: 'ex-6', code: 'BIO 101', title: 'General Biology I', units: 3, grade: 'B' },
    { id: 'ex-7', code: 'CSC 101', title: 'Introduction to Computer Science & Applications', units: 2, grade: 'A' },
  ];

  const summary = calculateSemesterSummary(courses, '5.0');

  return {
    id: 'sem-example-1',
    name: 'Year 1 - First Semester',
    level: '100L',
    semesterNum: 1,
    courses,
    totalUnits: summary.totalUnits,
    totalPoints: summary.totalPoints,
    gpa: summary.gpa,
  };
}

/**
 * LocalStorage offline persistence helper
 */
const ACTIVE_STATE_KEY = 'naijahub_cgpa_active_state';
const HISTORY_RECORDS_KEY = 'naijahub_cgpa_history';

export function loadSavedActiveState(): {
  gradingScale: GradingScale;
  semesters: SemesterRecord[];
  university: string;
  department: string;
  studentName: string;
} | null {
  try {
    const raw = localStorage.getItem(ACTIVE_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveState(data: {
  gradingScale: GradingScale;
  semesters: SemesterRecord[];
  university: string;
  department: string;
  studentName: string;
}) {
  try {
    localStorage.setItem(ACTIVE_STATE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save active CGPA state to localStorage', e);
  }
}

export function getLocalHistory(): SavedCgpaRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecordToHistory(record: SavedCgpaRecord) {
  try {
    const existing = getLocalHistory();
    const filtered = existing.filter((r) => r.id !== record.id);
    const updated = [record, ...filtered].slice(0, 20); // keep up to 20 saved states
    localStorage.setItem(HISTORY_RECORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save to history', e);
  }
}

export function deleteRecordFromHistory(id: string) {
  try {
    const existing = getLocalHistory();
    const updated = existing.filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_RECORDS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to delete history item', e);
  }
}

/**
 * Firebase Firestore persistence for logged-in or anonymous students
 */
export async function syncCgpaToFirebase(record: SavedCgpaRecord): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'cgpaCalculations'), {
      userId: record.userId || 'anonymous',
      studentName: record.studentName || 'Student',
      schoolName: record.schoolName || '',
      department: record.department || '',
      gradingScale: record.gradingScale,
      semesters: record.semesters,
      overallCgpa: record.overallCgpa,
      totalUnits: record.totalUnits,
      totalPoints: record.totalPoints,
      createdAt: serverTimestamp(),
    });

    if (record.userId && record.userId !== 'anonymous') {
      await setDoc(doc(db, 'users', record.userId, 'cgpaRecords', record.id), {
        ...record,
        updatedAt: serverTimestamp(),
      });
    }

    return docRef.id;
  } catch (err) {
    console.warn('Firestore CGPA sync note (offline storage succeeded):', err);
    return record.id;
  }
}
