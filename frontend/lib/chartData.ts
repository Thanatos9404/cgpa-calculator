import { Session, Semester } from '@/types/schema';
import { calculateGPA, roundForDisplay, getSemesterGPA, getSemesterCredits, calculateCGPA } from './calculator';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export function getCGPATimeline(session: Session): ChartDataPoint[] {
  const sortedSemesters = [...session.semesters].sort((a, b) => a.order - b.order);

  let cumulativePoints = 0;
  let cumulativeCredits = 0;

  return sortedSemesters.map((semester) => {
    // Get effective GPA and credits (course-based or manual)
    const { gpa: semesterGPA } = getSemesterGPA(semester);
    const semesterCredits = getSemesterCredits(semester);

    // Add this semester's contribution
    if (semesterGPA !== null && semesterCredits > 0) {
      cumulativePoints += semesterGPA * semesterCredits;
      cumulativeCredits += semesterCredits;
    }

    const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

    return {
      name: semester.name,
      CGPA: roundForDisplay(cgpa) || 0,
      'Semester GPA': roundForDisplay(semesterGPA) || 0,
      value: roundForDisplay(cgpa) || 0,
    };
  });
}

export function getGradeDistribution(session: Session): ChartDataPoint[] {
  const distribution: Record<string, number> = {};

  session.semesters.forEach(semester => {
    semester.courses.forEach(course => {
      if (course.grade) {
        distribution[course.grade] = (distribution[course.grade] || 0) + 1;
      }
    });
  });

  // If no course-level grades, show a message for manual entries
  if (Object.keys(distribution).length === 0) {
    // Check if there are manual entries
    const hasManualEntries = session.semesters.some(s => s.manualGPA !== null && s.manualGPA !== undefined);
    if (hasManualEntries) {
      return [{ name: 'Manual Entry', value: 1, count: session.semesters.filter(s => s.manualGPA).length }];
    }
  }

  return Object.entries(distribution)
    .map(([grade, count]) => ({
      name: grade,
      value: count,
      count: count,
    }))
    .sort((a, b) => b.value - a.value);
}

export function getCreditsBreakdown(session: Session): ChartDataPoint[] {
  let completedCredits = 0;

  session.semesters.forEach(semester => {
    completedCredits += getSemesterCredits(semester);
  });

  // Assume typical degree is 160 credits (can be configurable)
  const totalRequired = 160;
  const remaining = Math.max(0, totalRequired - completedCredits);

  return [
    { name: 'Completed', value: completedCredits, fill: '#6366f1' },
    { name: 'Remaining', value: remaining, fill: '#e5e7eb' },
  ];
}

export function getSemesterComparison(session: Session): ChartDataPoint[] {
  const sortedSemesters = [...session.semesters].sort((a, b) => a.order - b.order);

  return sortedSemesters.map(semester => {
    const { gpa } = getSemesterGPA(semester);

    return {
      name: semester.name,
      GPA: roundForDisplay(gpa) || 0,
      value: roundForDisplay(gpa) || 0,
    };
  });
}

export function getTopCourses(session: Session, count: number = 10): ChartDataPoint[] {
  const allCourses: Array<{ name: string; gradePoint: number }> = [];

  session.semesters.forEach(semester => {
    semester.courses.forEach(course => {
      if (course.gradePoint !== null && course.gradePoint !== undefined) {
        allCourses.push({
          name: course.name,
          gradePoint: course.gradePoint,
        });
      }
    });
  });

  return allCourses
    .sort((a, b) => b.gradePoint - a.gradePoint)
    .slice(0, count)
    .map(course => ({
      name: course.name.length > 25 ? course.name.substring(0, 25) + '...' : course.name,
      'Grade Point': course.gradePoint,
      value: course.gradePoint,
    }));
}

export interface ProgressMetrics {
  percentage: number;
  completedCredits: number;
  totalCredits: number;
  coursesCompleted: number;
  totalCourses: number;
}

export function getProgressMetrics(session: Session, totalCreditsRequired: number = 160): ProgressMetrics {
  let completedCredits = 0;
  let coursesCompleted = 0;
  let totalCourses = 0;
  let semestersWithManualEntry = 0;

  session.semesters.forEach(semester => {
    // Count courses
    semester.courses.forEach(course => {
      totalCourses++;
      if (course.gradePoint !== null && course.gradePoint !== undefined) {
        coursesCompleted++;
      }
    });

    // Get credits (from courses or manual)
    completedCredits += getSemesterCredits(semester);

    // Track manual entries
    if (semester.courses.length === 0 && semester.manualGPA !== null && semester.manualGPA !== undefined) {
      semestersWithManualEntry++;
    }
  });

  // For display purposes, count manual entry semesters as "completed"
  if (semestersWithManualEntry > 0 && totalCourses === 0) {
    totalCourses = semestersWithManualEntry;
    coursesCompleted = semestersWithManualEntry;
  }

  const percentage = (completedCredits / totalCreditsRequired) * 100;

  return {
    percentage: Math.min(100, Math.round(percentage)),
    completedCredits,
    totalCredits: totalCreditsRequired,
    coursesCompleted,
    totalCourses,
  };
}
