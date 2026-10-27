export type GradingScale = '5.0' | '4.0';

export type CourseGrade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface CourseItem {
  id: string;
  code: string;
  title?: string;
  units: number;
  grade: CourseGrade;
}

export interface SemesterRecord {
  id: string;
  name: string; // e.g. "Year 1 - First Semester"
  level: string; // "100L", "200L", etc.
  semesterNum: 1 | 2;
  courses: CourseItem[];
  totalUnits: number;
  totalPoints: number;
  gpa: number;
}

export interface DegreeClassification {
  classTitle: string;
  shortTitle: string;
  badgeColor: string; // Tailwind color class
  textColor: string;
  hexColor: string;
  bgGradient: string;
  description: string;
  motivationalQuote: string;
  minCgpa: number;
  maxCgpa: number;
}

export interface WhatIfResult {
  targetCgpa: number;
  currentCgpa: number;
  currentUnits: number;
  nextUnits: number;
  requiredGpa: number;
  isAchievable: boolean;
  advice: string;
}

export interface FinalCgpaPrediction {
  currentLevel: string;
  currentCgpa: number;
  completedUnits: number;
  remainingUnits: number;
  projectedGpa: number;
  predictedFinalCgpa: number;
  predictedClass: DegreeClassification;
}

export interface SavedCgpaRecord {
  id: string;
  userId?: string;
  studentName?: string;
  schoolName?: string;
  department?: string;
  gradingScale: GradingScale;
  semesters: SemesterRecord[];
  overallCgpa: number;
  totalUnits: number;
  totalPoints: number;
  savedAt: string;
}
