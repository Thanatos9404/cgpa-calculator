'use client';

import { useState, useEffect } from 'react';
import { Session, Semester, Course, GradeType } from '@/types/schema';
import { calculateCGPA, calculateGPA, roundForDisplay, convertMarksToPoints, BIT_MESRA_10_POINT, convertGradeToPoints } from '@/lib/calculator';
import { loadSession, saveSession, clearSession } from '@/lib/storage';
import { exportToJSON, exportToCSV } from '@/lib/export';
import { calculateStatistics, calculateTargetGPA } from '@/lib/statistics';
import { calculateIntraSemesterTarget } from '@/lib/intrasemester';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Trash2, Edit2, Save, X, BookOpen, Target, BarChart3, FileInput, Award } from 'lucide-react';

// Import the panel components
import StatisticsPanel from '@/components/StatisticsPanel';
import TargetCalculatorPanel from '@/components/TargetCalculatorPanel';

export default function DashboardPage() {
  const [session, setSession] = useState<Session>({
    semesters: [],
    metadata: { scale: 10, roundTo: 2, repeatPolicy: 'latest' },
  });
  const [showStatistics, setShowStatistics] = useState(false);
  const [showTargetCalculator, setShowTargetCalculator] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load session on mount
  useEffect(() => {
    console.log('[Dashboard] Component mounted, loading session...');
    const loaded = loadSession();
    if (loaded && loaded.semesters) {
      console.log('[Dashboard] Setting session with', loaded.semesters.length, 'semesters');
      setSession(loaded);
    } else {
      console.log('[Dashboard] No session found, using empty state');
    }
    setIsLoaded(true);
  }, []);

  // Save session on change (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('[Dashboard] Session changed, saving...', session.semesters.length, 'semesters');
      saveSession(session);
    }
  }, [session, isLoaded]);

  const cgpa = calculateCGPA(session.semesters);
  const cgpaDisplay = roundForDisplay(cgpa);

  const addSemester = () => {
    const newSemester: Semester = {
      id: `sem-${Date.now()}`,
      name: `Semester ${session.semesters.length + 1}`,
      courses: [],
      order: session.semesters.length,
    };
    setSession({
      ...session,
      semesters: [...session.semesters, newSemester],
    });
  };

  const deleteSemester = (semesterId: string) => {
    setSession({
      ...session,
      semesters: session.semesters.filter(s => s.id !== semesterId),
    });
  };

  const updateSemester = (semesterId: string, updates: Partial<Semester>) => {
    setSession({
      ...session,
      semesters: session.semesters.map(s =>
        s.id === semesterId ? { ...s, ...updates } : s
      ),
    });
  };

  const addCourse = (semesterId: string, course: Course) => {
    setSession({
      ...session,
      semesters: session.semesters.map(s =>
        s.id === semesterId
          ? { ...s, courses: [...s.courses, course] }
          : s
      ),
    });
  };

  const deleteCourse = (semesterId: string, courseIndex: number) => {
    setSession({
      ...session,
      semesters: session.semesters.map(s =>
        s.id === semesterId
          ? { ...s, courses: s.courses.filter((_, i) => i !== courseIndex) }
          : s
      ),
    });
  };

  const updateCourse = (semesterId: string, courseIndex: number, updatedCourse: Course) => {
    setSession({
      ...session,
      semesters: session.semesters.map(s =>
        s.id === semesterId
          ? { ...s, courses: s.courses.map((c, i) => i === courseIndex ? updatedCourse : c) }
          : s
      ),
    });
  };

  const handleExportJSON = () => {
    exportToJSON(session);
  };

  const handleExportCSV = () => {
    exportToCSV(session);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const imported = JSON.parse(json);
        setSession(imported);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import file. Please check the format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearSession();
      setSession({
        semesters: [],
        metadata: { scale: 10, roundTo: 2, repeatPolicy: 'latest' },
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* CGPA Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-neutral-600 dark:text-neutral-400 mb-2">
          Cumulative GPA
        </p>
        <div className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
          {cgpaDisplay !== null ? cgpaDisplay.toFixed(2) : 'N/A'}
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
          {session.metadata.scale}-Point Scale
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <button onClick={addSemester} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Semester
        </button>
        <button
          onClick={() => setShowStatistics(!showStatistics)}
          className={`btn-secondary flex items-center gap-2 ${showStatistics ? 'ring-2 ring-primary-500' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
          Statistics
        </button>
        <button
          onClick={() => setShowTargetCalculator(!showTargetCalculator)}
          className={`btn-secondary flex items-center gap-2 ${showTargetCalculator ? 'ring-2 ring-primary-500' : ''}`}
        >
          <Target className="w-4 h-4" />
          Target CGPA
        </button>
        <label className="btn-secondary flex items-center gap-2 cursor-pointer">
          <FileInput className="w-4 h-4" />
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </label>
        <button onClick={handleExportJSON} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export JSON
        </button>
        <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button onClick={handleClearAll} className="btn-secondary flex items-center gap-2 text-red-600 dark:text-red-400">
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Statistics Panel */}
      {showStatistics && session.semesters.length > 0 && (
        <StatisticsPanel session={session} />
      )}

      {/* Target Calculator */}
      {showTargetCalculator && (
        <TargetCalculatorPanel session={session} />
      )}

      {/* Semesters Grid */}
      <div className="space-y-6">
        {session.semesters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-neutral-500 dark:text-neutral-400 py-12"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-neutral-400 dark:text-neutral-600" />
            <p className="text-lg mb-4">No semesters added yet</p>
            <p className="text-sm mb-6">Start by adding your first semester to track your CGPA</p>
            <button onClick={addSemester} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-2" />
              Add First Semester
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {[...session.semesters]
              .sort((a, b) => a.order - b.order)
              .map((semester, idx) => (
                <SemesterCard
                  key={semester.id}
                  semester={semester}
                  index={idx}
                  onDelete={() => deleteSemester(semester.id)}
                  onUpdate={(updates) => updateSemester(semester.id, updates)}
                  onAddCourse={(course) => addCourse(semester.id, course)}
                  onDeleteCourse={(courseIndex) => deleteCourse(semester.id, courseIndex)}
                  onUpdateCourse={(courseIndex, updatedCourse) => updateCourse(semester.id, courseIndex, updatedCourse)}
                  scale={session.metadata.scale}
                />
              ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Semester Card Component
function SemesterCard({
  semester,
  index,
  onDelete,
  onUpdate,
  onAddCourse,
  onDeleteCourse,
  onUpdateCourse,
  scale,
}: {
  semester: Semester;
  index: number;
  onDelete: () => void;
  onUpdate: (updates: Partial<Semester>) => void;
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (index: number) => void;
  onUpdateCourse: (index: number, course: Course) => void;
  scale: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(semester.name);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [showIntraTarget, setShowIntraTarget] = useState(false);
  const [intraTargetGPA, setIntraTargetGPA] = useState('');

  const gpa = calculateGPA(semester.courses);
  const gpaDisplay = roundForDisplay(gpa);

  const handleSaveName = () => {
    onUpdate({ name: editName });
    setIsEditing(false);
  };

  const handleCalculateIntraTarget = () => {
    const target = parseFloat(intraTargetGPA);
    if (isNaN(target) || target <= 0 || target > scale) {
      alert(`Please enter a valid target GPA (0-${scale})`);
      return;
    }
    return calculateIntraSemesterTarget(semester, target, scale);
  };

  const intraResult = intraTargetGPA ? handleCalculateIntraTarget() : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-6 rounded-xl"
    >
      {/* Semester Header */}
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field flex-1"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
            <button onClick={handleSaveName} className="btn-primary p-2">
              <Save className="w-4 h-4" />
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-secondary p-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1">
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              {semester.name}
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Semester GPA</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {gpaDisplay !== null ? gpaDisplay.toFixed(2) : 'N/A'}
            </p>
          </div>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Intrasemester Target Button */}
      {semester.courses.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowIntraTarget(!showIntraTarget)}
            className={`btn-secondary flex items-center gap-2 text-sm ${showIntraTarget ? 'ring-2 ring-primary-500' : ''}`}
          >
            <Award className="w-4 h-4" />
            Semester Target
          </button>
        </div>
      )}

      {/* Intrasemester Target Panel */}
      {showIntraTarget && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
        >
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            What grades do I need this semester?
          </h4>
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              step="0.01"
              min="0"
              max={scale}
              value={intraTargetGPA}
              onChange={(e) => setIntraTargetGPA(e.target.value)}
              className="input-field flex-1"
              placeholder={`Target GPA (0-${scale})`}
            />
            <button onClick={() => { /* triggers re-render */ }} className="btn-primary">
              Calculate
            </button>
          </div>

          {intraResult && (
            <div className="space-y-3">
              <div className={`p-3 rounded ${intraResult.feasible
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                }`}>
                <p className="text-sm font-medium">{intraResult.message}</p>
              </div>

              {intraResult.recommendations.length > 0 && (
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                    Marks needed in pending courses:
                  </p>
                  <div className="space-y-2">
                    {intraResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="p-2 bg-white dark:bg-neutral-700 rounded text-sm">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {rec.courseName}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Need: {rec.marksNeeded}+ marks ({rec.gradeNeeded} grade)
                          {!rec.feasible && ' - ⚠️ Not achievable!'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Courses List */}
      <div className="space-y-3 mb-4">
        {semester.courses.map((course, idx) => (
          <CourseRow
            key={idx}
            course={course}
            index={idx}
            onDelete={() => onDeleteCourse(idx)}
            onUpdate={(updatedCourse) => onUpdateCourse(idx, updatedCourse)}
            scale={scale}
          />
        ))}
      </div>

      {/* Add Course Form */}
      {isAddingCourse ? (
        <CourseForm
          onSubmit={(course) => {
            onAddCourse(course);
            setIsAddingCourse(false);
          }}
          onCancel={() => setIsAddingCourse(false)}
          scale={scale}
        />
      ) : (
        <button
          onClick={() => setIsAddingCourse(true)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      )}
    </motion.div>
  );
}

// Course Row Component
function CourseRow({
  course,
  index,
  onDelete,
  onUpdate,
  scale
}: {
  course: Course;
  index: number;
  onDelete: () => void;
  onUpdate: (course: Course) => void;
  scale: number;
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <CourseForm
        initialCourse={course}
        onSubmit={(updated) => {
          onUpdate(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
        scale={scale}
        isEditing={true}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
    >
      <div className="flex-1 grid grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Code</p>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{course.code || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Name</p>
          <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">{course.name}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Credits</p>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">{course.credits}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">Grade / GP</p>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {course.grade} / {course.gradePoint?.toFixed(1) ?? 'N/A'}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 rounded hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors text-primary-600 dark:text-primary-400"
          title="Edit course"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
          title="Delete course"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}


// Course Form Component  
function CourseForm({
  initialCourse,
  onSubmit,
  onCancel,
  scale,
  isEditing = false,
}: {
  initialCourse?: Course;
  onSubmit: (course: Course) => void;
  onCancel: () => void;
  scale: number;
  isEditing?: boolean;
}) {
  const [code, setCode] = useState(initialCourse?.code || '');
  const [name, setName] = useState(initialCourse?.name || '');
  const [credits, setCredits] = useState(initialCourse?.credits?.toString() || '');
  const [gradeType, setGradeType] = useState<GradeType>(initialCourse?.gradeType || 'letter');
  const [letterGrade, setLetterGrade] = useState(initialCourse?.grade || '');
  const [marks, setMarks] = useState(initialCourse?.marks?.toString() || '');

  // Component-wise marks
  const hasComponents = initialCourse?.endsem !== undefined || initialCourse?.midsem !== undefined;
  const [useComponents, setUseComponents] = useState(hasComponents);
  const [endsem, setEndsem] = useState(initialCourse?.endsem?.toString() || '');
  const [midsem, setMidsem] = useState(initialCourse?.midsem?.toString() || '');
  const [internals, setInternals] = useState(initialCourse?.internals?.toString() || '');
  const [endsemMax, setEndsemMax] = useState(initialCourse?.endsemMax?.toString() || '50');
  const [midsemMax, setMidsemMax] = useState(initialCourse?.midsemMax?.toString() || '25');

  // Calculate total marks from components
  const calculateTotalFromComponents = (): number => {
    const endsemMarks = parseFloat(endsem) || 0;
    const midsemMarks = parseFloat(midsem) || 0;
    const internalsMarks = parseFloat(internals) || 0;
    const endsemMaxVal = parseFloat(endsemMax) || 50;
    const midsemMaxVal = parseFloat(midsemMax) || 25;
    const internalsMax = 100 - endsemMaxVal - midsemMaxVal;

    const endsemPercent = (endsemMarks / endsemMaxVal) * endsemMaxVal;
    const midsemPercent = (midsemMarks / midsemMaxVal) * midsemMaxVal;
    const internalsPercent = (internalsMarks / internalsMax) * internalsMax;

    return Math.min(100, endsemPercent + midsemPercent + internalsPercent);
  };

  const handleSubmit = () => {
    if (!name || !credits) {
      alert('Please fill in course name and credits');
      return;
    }

    let gradePoint: number | undefined;
    let finalGrade: string | undefined;
    let finalMarks: number | undefined;

    if (gradeType === 'letter') {
      if (!letterGrade) {
        alert('Please select a letter grade');
        return;
      }
      finalGrade = letterGrade;
      gradePoint = convertGradeToPoints(letterGrade, scale, scale === 10 ? BIT_MESRA_10_POINT : undefined);
    } else {
      let marksNum: number;

      if (useComponents) {
        marksNum = calculateTotalFromComponents();
        finalMarks = marksNum;
      } else {
        marksNum = parseFloat(marks);
        if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
          alert('Please enter valid marks (0-100)');
          return;
        }
        finalMarks = marksNum;
      }

      const template = scale === 10 ? BIT_MESRA_10_POINT : undefined;
      if (template) {
        const { letter, points } = convertMarksToPoints(marksNum, template);
        finalGrade = letter;
        gradePoint = points;
      }
    }

    const course: Course = {
      code: code || undefined,
      name,
      credits: parseFloat(credits),
      gradeType,
      grade: finalGrade,
      marks: finalMarks,
      gradePoint,
      endsem: useComponents ? parseFloat(endsem) : undefined,
      midsem: useComponents ? parseFloat(midsem) : undefined,
      internals: useComponents ? parseFloat(internals) : undefined,
      endsemMax: useComponents ? parseFloat(endsemMax) : undefined,
      midsemMax: useComponents ? parseFloat(midsemMax) : undefined,
    };

    onSubmit(course);
  };

  const gradeOptions = scale === 10
    ? ['A+/O', 'A', 'B', 'C', 'D', 'E', 'F']
    : ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

  const totalFromComponents = useComponents && gradeType === 'marks' ? calculateTotalFromComponents() : 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Course Code (Optional)</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field"
            placeholder="CS101"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Course Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Data Structures"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Credits *</label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            className="input-field"
            placeholder="4"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Grade Type</label>
          <select
            value={gradeType}
            onChange={(e) => setGradeType(e.target.value as GradeType)}
            className="input-field"
          >
            <option value="letter">Letter Grade</option>
            <option value="marks">Marks (0-100)</option>
          </select>
        </div>
      </div>

      {gradeType === 'letter' ? (
        <div>
          <label className="text-xs text-neutral-600 dark:text-neutral-400">Letter Grade *</label>
          <select
            value={letterGrade}
            onChange={(e) => setLetterGrade(e.target.value)}
            className="input-field"
          >
            <option value="">Select Grade</option>
            {gradeOptions.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 p-2 bg-neutral-200 dark:bg-neutral-700 rounded">
            <input
              type="checkbox"
              id="use-components"
              checked={useComponents}
              onChange={(e) => setUseComponents(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="use-components" className="text-sm text-neutral-700 dark:text-neutral-300">
              Enter marks by components (Endsem, Midsem, Internals)
            </label>
          </div>

          {useComponents ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Endsem Max Marks</label>
                  <select
                    value={endsemMax}
                    onChange={(e) => setEndsemMax(e.target.value)}
                    className="input-field"
                  >
                    <option value="50">50</option>
                    <option value="40">40</option>
                    <option value="60">60</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Midsem Max Marks</label>
                  <select
                    value={midsemMax}
                    onChange={(e) => setMidsemMax(e.target.value)}
                    className="input-field"
                  >
                    <option value="25">25</option>
                    <option value="30">30</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-neutral-500 dark:text-neutral-400 p-2 bg-neutral-200 dark:bg-neutral-700 rounded">
                Internals: {100 - parseFloat(endsemMax) - parseFloat(midsemMax)} marks (automatically calculated)
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Endsem Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={endsemMax}
                    value={endsem}
                    onChange={(e) => setEndsem(e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">out of {endsemMax}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Midsem Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={midsemMax}
                    value={midsem}
                    onChange={(e) => setMidsem(e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">out of {midsemMax}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-600 dark:text-neutral-400">Internals Scored</label>
                  <input
                    type="number"
                    min="0"
                    max={100 - parseFloat(endsemMax) - parseFloat(midsemMax)}
                    value={internals}
                    onChange={(e) => setInternals(e.target.value)}
                    className="input-field"
                    placeholder="0"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    out of {100 - parseFloat(endsemMax) - parseFloat(midsemMax)}
                  </p>
                </div>
              </div>

              {(endsem || midsem || internals) && (
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Total: {totalFromComponents.toFixed(2)} / 100
                  </p>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="text-xs text-neutral-600 dark:text-neutral-400">Total Marks (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="input-field"
                placeholder="85"
              />
            </div>
          )}
        </>
      )}

      <div className="flex gap-2 pt-2">
        <button onClick={handleSubmit} className="btn-primary flex-1">
          {isEditing ? 'Update Course' : 'Add Course'}
        </button>
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
