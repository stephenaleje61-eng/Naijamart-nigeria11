import React, { useState, useEffect, useMemo } from 'react';
import { 
  GradingScale, 
  CourseGrade, 
  CourseItem, 
  SemesterRecord, 
  SavedCgpaRecord 
} from '../../types/cgpa';
import { 
  calculateSemesterSummary, 
  calculateOverallCgpa, 
  getDegreeClassification, 
  calculateWhatIf, 
  predictFinalCgpa, 
  getExampleSemester, 
  loadSavedActiveState, 
  saveActiveState, 
  getLocalHistory, 
  saveRecordToHistory, 
  deleteRecordFromHistory, 
  syncCgpaToFirebase, 
  POPULAR_NIGERIAN_UNIVERSITIES 
} from '../../services/cgpaService';
import { ShareResultModal } from './ShareResultModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Plus, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Share2, 
  Camera, 
  Target, 
  TrendingUp, 
  Zap, 
  History, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  School, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Copy, 
  MessageSquare, 
  ArrowRight,
  Info
} from 'lucide-react';

interface CgpaCalculatorPageProps {
  onNavigateHome?: () => void;
}

export const CgpaCalculatorPage: React.FC<CgpaCalculatorPageProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Primary Calculator Configuration State
  const [gradingScale, setGradingScale] = useState<GradingScale>('5.0');
  const [schoolName, setSchoolName] = useState('FUWukari - Federal University Wukari');
  const [department, setDepartment] = useState('');
  const [studentName, setStudentName] = useState(user?.displayName || '');

  // Semesters & Courses state
  const [semesters, setSemesters] = useState<SemesterRecord[]>(() => {
    const saved = loadSavedActiveState();
    if (saved && saved.semesters && saved.semesters.length > 0) {
      return saved.semesters;
    }
    // Default initial empty semester with 5 standard blank course rows
    return [
      {
        id: 'sem-1',
        name: 'Year 1 - First Semester',
        level: '100L',
        semesterNum: 1,
        courses: [
          { id: 'c-1', code: 'MTH 101', title: 'Mathematics I', units: 3, grade: 'A' },
          { id: 'c-2', code: 'PHY 101', title: 'Physics I', units: 3, grade: 'B' },
          { id: 'c-3', code: 'CHM 101', title: 'Chemistry I', units: 3, grade: 'A' },
          { id: 'c-4', code: 'GST 101', title: 'Communication in English', units: 2, grade: 'A' },
          { id: 'c-5', code: 'BIO 101', title: 'General Biology', units: 3, grade: 'B' },
        ],
        totalUnits: 14,
        totalPoints: 61,
        gpa: 4.36,
      },
    ];
  });

  const [activeSemesterIndex, setActiveSemesterIndex] = useState(0);

  // Active Tool Mode Tabs: 'calculator' | 'what-if' | 'predictor' | 'quick-gpa' | 'history'
  const [activeToolTab, setActiveToolTab] = useState<'calculator' | 'what-if' | 'predictor' | 'quick-gpa' | 'history'>('calculator');

  // What-If Planner State
  const [targetCgpaInput, setTargetCgpaInput] = useState<number>(4.5);
  const [nextSemesterUnitsInput, setNextSemesterUnitsInput] = useState<number>(20);

  // Final Degree Predictor State
  const [predictorLevel, setPredictorLevel] = useState<string>('200L');
  const [projectedAverageInput, setProjectedAverageInput] = useState<number>(4.2);

  // Quick GPA State (standalone unit/grade list)
  const [quickCourses, setQuickCourses] = useState<{ id: string; units: number; grade: CourseGrade }[]>([
    { id: 'q-1', units: 3, grade: 'A' },
    { id: 'q-2', units: 3, grade: 'B' },
    { id: 'q-3', units: 2, grade: 'A' },
    { id: 'q-4', units: 3, grade: 'C' },
  ]);

  // History State
  const [historyList, setHistoryList] = useState<SavedCgpaRecord[]>(() => getLocalHistory());

  // Result Card Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Update dynamic document title for SEO
  useEffect(() => {
    document.title = 'ATBU / FUTO / UNILORIN CGPA Calculator - Nigerian 5.0 & 4.0 Scale | NaijaHub';
  }, []);

  // Sync to localStorage automatically whenever state changes
  useEffect(() => {
    saveActiveState({
      gradingScale,
      semesters,
      university: schoolName,
      department,
      studentName,
    });
  }, [gradingScale, semesters, schoolName, department, studentName]);

  // Active semester helper
  const currentSemester = semesters[activeSemesterIndex] || semesters[0];

  // Recalculate current semester totals
  const currentSemesterSummary = useMemo(() => {
    return calculateSemesterSummary(currentSemester.courses, gradingScale);
  }, [currentSemester.courses, gradingScale]);

  // Recalculate overall CGPA across all semesters
  const overallSummary = useMemo(() => {
    return calculateOverallCgpa(semesters, gradingScale);
  }, [semesters, gradingScale]);

  // Degree classification
  const classification = useMemo(() => {
    return getDegreeClassification(overallSummary.cgpa, gradingScale);
  }, [overallSummary.cgpa, gradingScale]);

  // Quick GPA calculation
  const quickGpaSummary = useMemo(() => {
    const formatted = quickCourses.map((c) => ({
      id: c.id,
      code: '',
      units: c.units,
      grade: c.grade,
    }));
    return calculateSemesterSummary(formatted, gradingScale);
  }, [quickCourses, gradingScale]);

  // What-If calculation result
  const whatIfResult = useMemo(() => {
    return calculateWhatIf(
      overallSummary.cgpa,
      overallSummary.cumulativeUnits,
      nextSemesterUnitsInput,
      targetCgpaInput,
      gradingScale
    );
  }, [overallSummary.cgpa, overallSummary.cumulativeUnits, nextSemesterUnitsInput, targetCgpaInput, gradingScale]);

  // Final Degree Prediction result
  const predictionResult = useMemo(() => {
    return predictFinalCgpa(
      predictorLevel,
      overallSummary.cgpa,
      projectedAverageInput,
      gradingScale
    );
  }, [predictorLevel, overallSummary.cgpa, projectedAverageInput, gradingScale]);

  // Course handlers
  const handleCourseChange = (
    courseId: string,
    field: keyof CourseItem,
    value: any
  ) => {
    setSemesters((prev) => {
      return prev.map((sem, idx) => {
        if (idx !== activeSemesterIndex) return sem;
        const updatedCourses = sem.courses.map((c) => {
          if (c.id !== courseId) return c;
          return { ...c, [field]: value };
        });
        const summary = calculateSemesterSummary(updatedCourses, gradingScale);
        return {
          ...sem,
          courses: updatedCourses,
          totalUnits: summary.totalUnits,
          totalPoints: summary.totalPoints,
          gpa: summary.gpa,
        };
      });
    });
  };

  const handleAddCourse = () => {
    const newCourse: CourseItem = {
      id: `course-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: '',
      title: '',
      units: 3,
      grade: 'A',
    };

    setSemesters((prev) => {
      return prev.map((sem, idx) => {
        if (idx !== activeSemesterIndex) return sem;
        const updatedCourses = [...sem.courses, newCourse];
        const summary = calculateSemesterSummary(updatedCourses, gradingScale);
        return {
          ...sem,
          courses: updatedCourses,
          totalUnits: summary.totalUnits,
          totalPoints: summary.totalPoints,
          gpa: summary.gpa,
        };
      });
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setSemesters((prev) => {
      return prev.map((sem, idx) => {
        if (idx !== activeSemesterIndex) return sem;
        const updatedCourses = sem.courses.filter((c) => c.id !== courseId);
        const summary = calculateSemesterSummary(updatedCourses, gradingScale);
        return {
          ...sem,
          courses: updatedCourses,
          totalUnits: summary.totalUnits,
          totalPoints: summary.totalPoints,
          gpa: summary.gpa,
        };
      });
    });
  };

  // Semester management
  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    const year = Math.ceil(nextNum / 2);
    const sem = nextNum % 2 === 1 ? 'First' : 'Second';
    const level = `${year * 100}L`;

    const newSemester: SemesterRecord = {
      id: `sem-${Date.now()}`,
      name: `Year ${year} - ${sem} Semester`,
      level,
      semesterNum: (nextNum % 2 === 1 ? 1 : 2) as 1 | 2,
      courses: [
        { id: `c-${Date.now()}-1`, code: '', title: '', units: 3, grade: 'A' },
        { id: `c-${Date.now()}-2`, code: '', title: '', units: 3, grade: 'B' },
        { id: `c-${Date.now()}-3`, code: '', title: '', units: 2, grade: 'A' },
      ],
      totalUnits: 8,
      totalPoints: 34,
      gpa: 4.25,
    };

    setSemesters([...semesters, newSemester]);
    setActiveSemesterIndex(semesters.length);
    showToast(`Added ${newSemester.name} 🎓`, 'success');
  };

  const handleDeleteCurrentSemester = () => {
    if (semesters.length <= 1) {
      showToast('You must have at least one semester', 'info');
      return;
    }
    if (!window.confirm(`Delete ${currentSemester.name}?`)) return;

    const updated = semesters.filter((_, idx) => idx !== activeSemesterIndex);
    setSemesters(updated);
    setActiveSemesterIndex(Math.max(0, activeSemesterIndex - 1));
    showToast('Semester removed', 'info');
  };

  const handleClearAll = () => {
    if (!window.confirm('Clear all entered courses and reset to blank?')) return;
    setSemesters([
      {
        id: `sem-reset-${Date.now()}`,
        name: 'Year 1 - First Semester',
        level: '100L',
        semesterNum: 1,
        courses: [
          { id: 'cr-1', code: '', title: '', units: 3, grade: 'A' },
          { id: 'cr-2', code: '', title: '', units: 3, grade: 'B' },
          { id: 'cr-3', code: '', title: '', units: 2, grade: 'A' },
        ],
        totalUnits: 8,
        totalPoints: 34,
        gpa: 4.25,
      },
    ]);
    setActiveSemesterIndex(0);
    showToast('Calculator reset', 'info');
  };

  const handleLoadExample = () => {
    const example = getExampleSemester();
    setSemesters([example]);
    setActiveSemesterIndex(0);
    setGradingScale('5.0');
    showToast('Example First Class Semester Loaded! 🎓', 'success');
  };

  // Save current record to History & Firestore
  const handleSaveRecord = async () => {
    const record: SavedCgpaRecord = {
      id: `cgpa-${Date.now()}`,
      userId: user?.uid || 'anonymous',
      studentName: studentName || user?.displayName || 'Scholar',
      schoolName,
      department,
      gradingScale,
      semesters,
      overallCgpa: overallSummary.cgpa,
      totalUnits: overallSummary.cumulativeUnits,
      totalPoints: overallSummary.cumulativePoints,
      savedAt: new Date().toISOString(),
    };

    saveRecordToHistory(record);
    setHistoryList(getLocalHistory());

    await syncCgpaToFirebase(record);
    showToast('CGPA calculation saved to History! Available offline.', 'success');
  };

  const handleRestoreFromHistory = (rec: SavedCgpaRecord) => {
    setGradingScale(rec.gradingScale);
    setSemesters(rec.semesters);
    if (rec.schoolName) setSchoolName(rec.schoolName);
    if (rec.department) setDepartment(rec.department);
    if (rec.studentName) setStudentName(rec.studentName);
    setActiveSemesterIndex(0);
    setActiveToolTab('calculator');
    showToast('Restored calculation from history', 'success');
  };

  const handleDeleteHistory = (id: string) => {
    deleteRecordFromHistory(id);
    setHistoryList(getLocalHistory());
    showToast('Removed from history', 'info');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#087443] via-emerald-800 to-[#087443] rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-gray-950 text-xs font-black uppercase tracking-wider mb-2.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Nigerian Student Tool • 100% Offline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Nigerian University CGPA Calculator</span>
              <span className="text-xl sm:text-2xl">🎓</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mt-1 leading-relaxed">
              Fast, accurate 5.0 & 4.0 grading scale calculator for FUWukari, UNILAG, FUTO, UNILORIN, ABU, and all Nigerian universities.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadExample}
              className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-black border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Try Example</span>
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-gray-950 text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer scale-102"
            >
              <Camera className="w-4 h-4 text-gray-950" />
              <span>Generate Result Card 📸</span>
            </button>
          </div>
        </div>

        {/* Setup Configuration Bar: Scale & School */}
        <div className="mt-5 pt-4 border-t border-emerald-600/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Scale Selector */}
          <div>
            <label className="text-[11px] font-bold text-emerald-200 block mb-1">
              Grading System *
            </label>
            <div className="flex bg-black/25 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setGradingScale('5.0')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  gradingScale === '5.0' ? 'bg-white text-[#087443] shadow-xs' : 'text-emerald-100 hover:text-white'
                }`}
              >
                5.0 Scale (Universities)
              </button>
              <button
                type="button"
                onClick={() => setGradingScale('4.0')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  gradingScale === '4.0' ? 'bg-white text-[#087443] shadow-xs' : 'text-emerald-100 hover:text-white'
                }`}
              >
                4.0 Scale (Polytechnics)
              </button>
            </div>
          </div>

          {/* School Selector */}
          <div>
            <label className="text-[11px] font-bold text-emerald-200 block mb-1">
              University / Polytechnic (Optional)
            </label>
            <select
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full text-xs p-2 rounded-xl bg-black/25 text-white border border-emerald-500/40 focus:border-white outline-hidden cursor-pointer"
            >
              {POPULAR_NIGERIAN_UNIVERSITIES.map((sch) => (
                <option key={sch} value={sch} className="bg-gray-900 text-white">
                  {sch}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-[11px] font-bold text-emerald-200 block mb-1">
              Department (Optional)
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Medicine, Law"
              className="w-full text-xs p-2 rounded-xl bg-black/25 text-white placeholder-emerald-300/60 border border-emerald-500/40 focus:border-white outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Hero CGPA Speedometer Card */}
      <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-[#EDEDED]">
        {/* Left: Big Circular Dial & Classification */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          {/* Speedometer Gauge representation */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-[#2A2A2A]"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={classification.hexColor}
                strokeWidth="12"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * (overallSummary.cgpa / (gradingScale === '5.0' ? 5.0 : 4.0)))}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-black text-gray-500 tracking-wider">CGPA</span>
              <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                {overallSummary.cgpa.toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 mt-0.5">
                /{gradingScale}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-xs ${classification.badgeColor}`}>
                <Award className="w-3.5 h-3.5" />
                <span>{classification.classTitle}</span>
              </span>
            </div>
            <p className="text-xs font-bold text-gray-200">
              {classification.motivationalQuote}
            </p>
            <p className="text-[11px] text-gray-400 line-clamp-2">
              {classification.description}
            </p>
          </div>
        </div>

        {/* Right: Academic Stat Chips */}
        <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto shrink-0">
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Units</span>
            <span className="text-lg font-black text-white">{overallSummary.cumulativeUnits}</span>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Grade Points</span>
            <span className="text-lg font-black text-white">{overallSummary.cumulativePoints}</span>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Semesters</span>
            <span className="text-lg font-black text-[#10B981]">{semesters.length}</span>
          </div>
        </div>
      </div>

      {/* Carryover Alert Banner (If Any F Grade Detected) */}
      {overallSummary.totalCarryovers > 0 && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-red-200 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-900/60 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-black text-red-200">
                {overallSummary.totalCarryovers} Course Carryover{overallSummary.totalCarryovers > 1 ? 's' : ''} Detected (F Grade)
              </p>
              <p className="text-[11px] text-red-400">
                F grades award 0 grade points and weigh down your cumulative GPA. Be sure to register and retake them next session to boost your grade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Extra Tools Navigation Bar */}
      <div className="bg-[#151515] p-1.5 rounded-2xl border border-[#2A2A2A] flex overflow-x-auto gap-1 shadow-2xs">
        <button
          onClick={() => setActiveToolTab('calculator')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeToolTab === 'calculator' ? 'bg-[#008751] text-white shadow-xs border border-emerald-600/30' : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Semester Calculator</span>
        </button>

        <button
          onClick={() => setActiveToolTab('what-if')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeToolTab === 'what-if' ? 'bg-[#008751] text-white shadow-xs border border-emerald-600/30' : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>"What-If" Planner</span>
        </button>

        <button
          onClick={() => setActiveToolTab('predictor')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeToolTab === 'predictor' ? 'bg-[#008751] text-white shadow-xs border border-emerald-600/30' : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Final Degree Predictor</span>
        </button>

        <button
          onClick={() => setActiveToolTab('quick-gpa')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeToolTab === 'quick-gpa' ? 'bg-[#008751] text-white shadow-xs border border-emerald-600/30' : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Quick GPA</span>
        </button>

        <button
          onClick={() => setActiveToolTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeToolTab === 'history' ? 'bg-[#008751] text-white shadow-xs border border-emerald-600/30' : 'text-gray-400 hover:bg-[#2A2A2A] hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({historyList.length})</span>
        </button>
      </div>

      {/* TAB 1: Main Semester Calculator */}
      {activeToolTab === 'calculator' && (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-4 sm:p-6 shadow-sm space-y-5 text-[#EDEDED]">
          {/* Semester Selector Pill Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {semesters.map((sem, idx) => (
                <button
                  key={sem.id}
                  onClick={() => setActiveSemesterIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    activeSemesterIndex === idx
                      ? 'bg-[#008751] text-white shadow-xs border border-emerald-600/30'
                      : 'bg-[#0A0A0A] text-gray-300 hover:bg-[#2A2A2A] border border-[#2A2A2A]'
                  }`}
                >
                  {sem.name.replace(' - ', ' ')}
                  <span className="ml-1 opacity-70">({sem.gpa.toFixed(2)})</span>
                </button>
              ))}

              <button
                type="button"
                onClick={handleAddSemester}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-[#0A0A0A] text-emerald-400 hover:bg-[#2A2A2A] border border-[#2A2A2A] shrink-0 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Semester</span>
              </button>
            </div>

            {/* Current Semester Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSaveRecord}
                className="px-3 py-1.5 rounded-xl bg-[#0A0A0A] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Save</span>
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="p-2 text-gray-400 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                title="Clear Courses"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              {semesters.length > 1 && (
                <button
                  type="button"
                  onClick={handleDeleteCurrentSemester}
                  className="p-2 text-red-400 hover:text-red-300 rounded-xl transition-colors cursor-pointer"
                  title="Delete this semester"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Current Semester Live Stats Bar */}
          <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-sm">{currentSemester.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-black">
                {currentSemester.level}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-gray-300">
              <span>
                Semester Units: <strong className="text-white">{currentSemesterSummary.totalUnits}</strong>
              </span>
              <span>
                Semester Points: <strong className="text-white">{currentSemesterSummary.totalPoints}</strong>
              </span>
              <span className="bg-[#008751] text-white px-2.5 py-1 rounded-xl font-black border border-emerald-600/30">
                GPA: {currentSemesterSummary.gpa.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Courses Table / Cards */}
          <div className="space-y-3">
            {/* Header row (Desktop) */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-3 py-1 text-[11px] font-black uppercase text-gray-500 tracking-wider">
              <div className="col-span-3">Course Code</div>
              <div className="col-span-4">Course Title (Optional)</div>
              <div className="col-span-2">Credit Units</div>
              <div className="col-span-2 text-center">Grade</div>
              <div className="col-span-1 text-right">Points</div>
            </div>

            {/* Course Rows */}
            {currentSemester.courses.map((course, cIdx) => {
              const pts = (course.units || 0) * (gradingScale === '5.0' ? (course.grade === 'A' ? 5 : course.grade === 'B' ? 4 : course.grade === 'C' ? 3 : course.grade === 'D' ? 2 : course.grade === 'E' ? 1 : 0) : (course.grade === 'A' ? 4 : course.grade === 'B' ? 3 : course.grade === 'C' ? 2 : course.grade === 'D' ? 1 : 0));
              const isCarryover = course.grade === 'F' && course.units > 0;

              return (
                <div
                  key={course.id}
                  className={`p-3 sm:p-2.5 rounded-2xl border transition-all flex flex-col sm:grid sm:grid-cols-12 gap-2.5 items-center ${
                    isCarryover ? 'bg-red-950/30 border-red-800/60' : 'bg-[#0A0A0A] border-[#2A2A2A] hover:border-[#10B981]'
                  }`}
                >
                  {/* Course Code */}
                  <div className="w-full sm:col-span-3">
                    <input
                      type="text"
                      value={course.code}
                      onChange={(e) => handleCourseChange(course.id, 'code', e.target.value)}
                      placeholder={`e.g. MTH ${101 + cIdx}`}
                      className="w-full text-xs font-black uppercase tracking-wider px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white placeholder-gray-500 focus:border-[#10B981] outline-hidden"
                    />
                  </div>

                  {/* Course Title */}
                  <div className="w-full sm:col-span-4">
                    <input
                      type="text"
                      value={course.title || ''}
                      onChange={(e) => handleCourseChange(course.id, 'title', e.target.value)}
                      placeholder="Course Title (optional)"
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white placeholder-gray-500 focus:border-[#10B981] outline-hidden"
                    />
                  </div>

                  {/* Credit Units (1 - 6) */}
                  <div className="w-full sm:col-span-2 flex items-center justify-between sm:justify-start gap-2">
                    <span className="sm:hidden text-xs font-bold text-gray-400">Units:</span>
                    <select
                      value={course.units}
                      onChange={(e) => handleCourseChange(course.id, 'units', Number(e.target.value))}
                      className="text-xs font-black px-3 py-2 rounded-xl bg-[#151515] border border-[#2A2A2A] text-white focus:border-[#10B981] outline-hidden cursor-pointer w-24 sm:w-full"
                    >
                      {[1, 2, 3, 4, 5, 6].map((u) => (
                        <option key={u} value={u} className="bg-[#151515] text-white">
                          {u} Unit{u > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Selector (A, B, C, D, E, F) */}
                  <div className="w-full sm:col-span-2 flex items-center justify-between sm:justify-center gap-1">
                    <span className="sm:hidden text-xs font-bold text-gray-400">Grade:</span>
                    <div className="flex gap-1">
                      {(gradingScale === '5.0' ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['A', 'B', 'C', 'D', 'F']).map((g) => {
                        const isSelected = course.grade === g;
                        let btnColor = 'bg-[#151515] text-gray-400 border-[#2A2A2A] hover:text-white';
                        if (isSelected) {
                          if (g === 'A') btnColor = 'bg-emerald-600 text-white border-emerald-600';
                          else if (g === 'B') btnColor = 'bg-teal-600 text-white border-teal-600';
                          else if (g === 'C') btnColor = 'bg-blue-600 text-white border-blue-600';
                          else if (g === 'D') btnColor = 'bg-amber-600 text-white border-amber-600';
                          else if (g === 'E') btnColor = 'bg-orange-500 text-white border-orange-500';
                          else if (g === 'F') btnColor = 'bg-red-600 text-white border-red-600 animate-pulse';
                        }
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => handleCourseChange(course.id, 'grade', g as CourseGrade)}
                            className={`w-7 h-7 sm:w-6.5 sm:h-6.5 rounded-lg text-xs font-black border transition-all flex items-center justify-center cursor-pointer ${btnColor}`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points & Delete Row */}
                  <div className="w-full sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                    <span className="text-xs font-black text-gray-300 bg-[#151515] border border-[#2A2A2A] px-2 py-1 rounded-md sm:bg-transparent sm:border-0 sm:px-0">
                      {pts} pts
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Course Button & Result Card CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddCourse}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[#0A0A0A] hover:bg-[#2A2A2A] text-emerald-400 font-black text-xs border border-[#2A2A2A] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>➕ Add Course Row</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#008751] hover:bg-[#007043] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-600/30"
            >
              <Camera className="w-4 h-4" />
              <span>Generate Result Card 📸</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: "What-If" CGPA Target Planner */}
      {activeToolTab === 'what-if' && (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-5 text-[#EDEDED]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">What GPA Do I Need Next Semester?</h3>
              <p className="text-xs text-gray-400">
                Plan ahead and calculate the exact minimum semester GPA required to reach First Class or your target class.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-[#2A2A2A]">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Target CGPA *
              </label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max={gradingScale === '5.0' ? 5.0 : 4.0}
                value={targetCgpaInput}
                onChange={(e) => setTargetCgpaInput(Number(e.target.value))}
                className="w-full text-xs font-black p-2.5 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white focus:border-[#10B981] outline-hidden"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                {gradingScale === '5.0' ? '4.50 = First Class, 3.50 = 2:1' : '3.50 = Distinction'}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Completed Units So Far
              </label>
              <input
                type="number"
                disabled
                value={overallSummary.cumulativeUnits}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-[#2A2A2A] bg-[#151515] text-gray-400 outline-hidden"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Automatically read from your entered semesters
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Next Semester Planned Units *
              </label>
              <input
                type="number"
                min="6"
                max="30"
                value={nextSemesterUnitsInput}
                onChange={(e) => setNextSemesterUnitsInput(Number(e.target.value))}
                className="w-full text-xs font-black p-2.5 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white focus:border-[#10B981] outline-hidden"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Average Nigerian university semester is 18 - 24 units
              </span>
            </div>
          </div>

          {/* What-If Result Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              whatIfResult.isAchievable ? 'bg-[#0A0A0A] border-emerald-500/40' : 'bg-[#0A0A0A] border-amber-500/40'
            }`}
          >
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Required GPA Next Semester
              </span>
              <div className="text-3xl font-black text-white flex items-baseline gap-2">
                <span>{whatIfResult.requiredGpa.toFixed(2)}</span>
                <span className="text-xs font-bold text-gray-400">/ {gradingScale} GPA</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed max-w-xl pt-1">
                {whatIfResult.advice}
              </p>
            </div>

            <div className="shrink-0 text-center">
              <span
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1 ${
                  whatIfResult.isAchievable ? 'bg-[#008751] text-white border border-emerald-600/30' : 'bg-amber-400 text-black'
                }`}
              >
                {whatIfResult.isAchievable ? '✓ Achievable Goal' : '⚠️ Multi-Semester Plan Needed'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Final Degree CGPA Predictor */}
      {activeToolTab === 'predictor' && (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-5 text-[#EDEDED]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-black">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Final Graduating Degree Predictor</h3>
              <p className="text-xs text-gray-400">
                Forecast your final degree classification upon graduation based on your current level and projected performance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0A0A0A] p-4 rounded-2xl border border-[#2A2A2A]">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Your Current Academic Level
              </label>
              <select
                value={predictorLevel}
                onChange={(e) => setPredictorLevel(e.target.value)}
                className="w-full text-xs font-black p-2.5 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white focus:border-[#10B981] outline-hidden cursor-pointer"
              >
                <option value="100L" className="bg-[#151515]">100 Level (Freshman)</option>
                <option value="200L" className="bg-[#151515]">200 Level (Sophomore)</option>
                <option value="300L" className="bg-[#151515]">300 Level (Penultimate)</option>
                <option value="400L" className="bg-[#151515]">400 Level (Final Year)</option>
                <option value="500L" className="bg-[#151515]">500 Level (5-Year Program)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Current Cumulative CGPA
              </label>
              <input
                type="number"
                disabled
                value={overallSummary.cgpa}
                className="w-full text-xs font-black p-2.5 rounded-xl border border-[#2A2A2A] bg-[#151515] text-gray-300 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Projected Future Semester GPA
              </label>
              <input
                type="number"
                step="0.05"
                min="1.0"
                max={gradingScale === '5.0' ? 5.0 : 4.0}
                value={projectedAverageInput}
                onChange={(e) => setProjectedAverageInput(Number(e.target.value))}
                className="w-full text-xs font-black p-2.5 rounded-xl border border-[#2A2A2A] bg-[#151515] text-white focus:border-[#10B981] outline-hidden"
              />
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-[#2A2A2A] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Projected Final Degree CGPA
              </span>
              <div className="text-3xl font-black text-[#10B981]">
                {predictionResult.predictedFinalCgpa.toFixed(2)}
              </div>
              <p className="text-xs text-gray-300">
                Estimated graduating classification: <strong className="text-white">{predictionResult.predictedClass.classTitle}</strong>
              </p>
            </div>

            <div className={`px-4 py-2 rounded-2xl text-xs font-black shadow-xs ${predictionResult.predictedClass.badgeColor}`}>
              🎓 {predictionResult.predictedClass.classTitle}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Quick GPA Calculator */}
      {activeToolTab === 'quick-gpa' && (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-4 text-[#EDEDED]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-black text-white">Quick GPA Mode</h3>
                <p className="text-xs text-gray-400">No course codes needed — calculate your GPA in seconds.</p>
              </div>
            </div>

            <div className="bg-[#008751] text-white px-3.5 py-1.5 rounded-xl text-xs font-black border border-emerald-600/30">
              GPA: {quickGpaSummary.gpa.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {quickCourses.map((c, i) => (
              <div key={c.id} className="p-3 bg-[#0A0A0A] rounded-2xl border border-[#2A2A2A] flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-300">Course #{i + 1}</span>

                <select
                  value={c.units}
                  onChange={(e) => {
                    const u = Number(e.target.value);
                    setQuickCourses(quickCourses.map((qc) => (qc.id === c.id ? { ...qc, units: u } : qc)));
                  }}
                  className="text-xs font-bold p-1.5 rounded-lg border border-[#2A2A2A] bg-[#151515] text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((unit) => (
                    <option key={unit} value={unit} className="bg-[#151515]">
                      {unit} Unit{unit > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>

                <div className="flex gap-1">
                  {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setQuickCourses(quickCourses.map((qc) => (qc.id === c.id ? { ...qc, grade: g as CourseGrade } : qc)));
                      }}
                      className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer ${
                        c.grade === g ? 'bg-[#008751] text-white' : 'bg-[#151515] border border-[#2A2A2A] text-gray-300 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setQuickCourses(quickCourses.filter((qc) => qc.id !== c.id))}
                  className="p-1 text-gray-500 hover:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setQuickCourses([
                  ...quickCourses,
                  { id: `q-${Date.now()}`, units: 3, grade: 'A' },
                ]);
              }}
              className="px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-xs font-black text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Quick Course</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Saved Records & History */}
      {activeToolTab === 'history' && (
        <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-4 text-[#EDEDED]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-[#10B981]" />
              <div>
                <h3 className="text-base font-black text-white">Your Saved Calculations</h3>
                <p className="text-xs text-gray-400">Stored safely on device and synced when logged in.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveRecord}
              className="px-3.5 py-1.5 rounded-xl bg-[#008751] text-white text-xs font-black shadow-xs cursor-pointer border border-emerald-600/30"
            >
              Save Current Calculation
            </button>
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-xs">
              <History className="w-10 h-10 mx-auto mb-2 text-gray-600" />
              No saved calculations yet. Click "Save Current Calculation" to keep records.
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyList.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-[#2A2A2A] hover:border-[#10B981] bg-[#0A0A0A] flex items-center justify-between gap-3 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">
                        CGPA: {rec.overallCgpa.toFixed(2)}
                      </span>
                      <span className="text-[10px] bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                        {rec.gradingScale} Scale
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {rec.schoolName || 'University'} • {rec.semesters.length} Semesters • {rec.totalUnits} Units
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Saved {new Date(rec.savedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRestoreFromHistory(rec)}
                      className="px-3 py-1.5 rounded-xl bg-[#151515] border border-[#2A2A2A] text-gray-300 text-xs font-bold hover:bg-[#2A2A2A] hover:text-white cursor-pointer"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteHistory(rec.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Degree Class Benchmark Reference Cards */}
      <div className="bg-[#151515] rounded-3xl border border-[#2A2A2A] p-5 shadow-xs space-y-3 text-[#EDEDED]">
        <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider">
          Nigerian University Grading Benchmarks (NUC Scale)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-amber-500/40">
            <span className="text-[10px] font-black text-amber-400 block">4.50 - 5.00</span>
            <span className="text-xs font-black text-amber-300">First Class 🏆</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-emerald-500/40">
            <span className="text-[10px] font-black text-emerald-400 block">3.50 - 4.49</span>
            <span className="text-xs font-black text-emerald-300">Second Upper (2:1) 🌟</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-blue-500/40">
            <span className="text-[10px] font-black text-blue-400 block">2.40 - 3.49</span>
            <span className="text-xs font-black text-blue-300">Second Lower (2:2) 📘</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-orange-500/40">
            <span className="text-[10px] font-black text-orange-400 block">1.50 - 2.39</span>
            <span className="text-xs font-black text-orange-300">Third Class 📙</span>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A0A0A] border border-red-500/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-black text-red-400 block">0.00 - 1.49</span>
            <span className="text-xs font-black text-red-300">Probation ⚠️</span>
          </div>
        </div>
      </div>

      {/* Viral Result Card Generator Modal */}
      <ShareResultModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        data={{
          studentName,
          university: schoolName,
          department,
          cgpa: overallSummary.cgpa,
          gradingScale,
          totalUnits: overallSummary.cumulativeUnits,
          totalPoints: overallSummary.cumulativePoints,
          semestersCount: semesters.length,
          classification,
        }}
      />
    </div>
  );
};
