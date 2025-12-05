/**
 * Statistics and analysis utilities for CGPA data
 */
import { Session, Semester, Course } from '@/types/schema';
import { calculateGPA, calculateCGPA, roundForDisplay, getSemesterGPA, getSemesterCredits } from './calculator';

export interface Statistics {
  totalCourses: number;
  totalCredits: number;
  averageCreditsPerSemester: number;
  highestSemesterGPA: number | null;
  lowestSemesterGPA: number | null;
  gradeDistribution: Record<string, number>;
  trendDirection: 'improving' | 'declining' | 'stable' | 'unknown';
}

export function calculateStatistics(session: Session): Statistics {
  const semesters = session.semesters;

  let totalCourses = 0;
  let totalCredits = 0;
  const gradeDistribution: Record<string, number> = {};
  const semesterGPAs: number[] = [];
  let semestersWithData = 0;

  semesters.forEach(semester => {
    // Get effective GPA (course-based or manual)
    const { gpa, isManual } = getSemesterGPA(semester);
    const credits = getSemesterCredits(semester);

    // Count courses for detailed entries
    totalCourses += semester.courses.length;

    // Get credits (from courses or manual)
    totalCredits += credits;

    // Grade distribution (only from actual courses)
    semester.courses.forEach(course => {
      if (course.grade) {
        gradeDistribution[course.grade] = (gradeDistribution[course.grade] || 0) + 1;
      }
    });

    // Track GPA for this semester (whether manual or calculated)
    if (gpa !== null) {
      semesterGPAs.push(gpa);
      semestersWithData++;
    }
  });

  const highestSemesterGPA = semesterGPAs.length > 0 ? Math.max(...semesterGPAs) : null;
  const lowestSemesterGPA = semesterGPAs.length > 0 ? Math.min(...semesterGPAs) : null;
  const averageCreditsPerSemester = semestersWithData > 0 ? totalCredits / semestersWithData : 0;

  // Calculate trend
  let trendDirection: 'improving' | 'declining' | 'stable' | 'unknown' = 'unknown';
  if (semesterGPAs.length >= 2) {
    const recentGPAs = semesterGPAs.slice(-3);
    const firstHalf = recentGPAs.slice(0, Math.floor(recentGPAs.length / 2));
    const secondHalf = recentGPAs.slice(Math.floor(recentGPAs.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (avgSecond > avgFirst + 0.2) {
      trendDirection = 'improving';
    } else if (avgSecond < avgFirst - 0.2) {
      trendDirection = 'declining';
    } else {
      trendDirection = 'stable';
    }
  }

  return {
    totalCourses,
    totalCredits,
    averageCreditsPerSemester: roundForDisplay(averageCreditsPerSemester) || 0,
    highestSemesterGPA: roundForDisplay(highestSemesterGPA),
    lowestSemesterGPA: roundForDisplay(lowestSemesterGPA),
    gradeDistribution,
    trendDirection,
  };
}

export interface TargetCalculation {
  targetCGPA: number;
  currentCGPA: number;
  creditsCompleted: number;
  creditsRemaining: number;
  requiredGPA: number;
  feasible: boolean;
  message: string;
}

export function calculateTargetGPA(
  session: Session,
  targetCGPA: number,
  creditsRemaining: number
): TargetCalculation {
  const currentCGPA = calculateCGPA(session.semesters) || 0;

  // Use getSemesterCredits to include manual credits
  let creditsCompleted = 0;
  session.semesters.forEach(semester => {
    creditsCompleted += getSemesterCredits(semester);
  });

  // Formula: targetCGPA = (currentCGPA * creditsCompleted + requiredGPA * creditsRemaining) / (creditsCompleted + creditsRemaining)
  // Solving for requiredGPA:
  // requiredGPA = (targetCGPA * (creditsCompleted + creditsRemaining) - currentCGPA * creditsCompleted) / creditsRemaining

  const requiredGPA = creditsRemaining > 0
    ? (targetCGPA * (creditsCompleted + creditsRemaining) - currentCGPA * creditsCompleted) / creditsRemaining
    : 0;

  const maxPossible = session.metadata.scale || 10;
  const feasible = requiredGPA <= maxPossible && requiredGPA >= 0;

  let message = '';
  if (!feasible) {
    if (requiredGPA > maxPossible) {
      message = `Not achievable! You would need a ${requiredGPA.toFixed(2)} GPA, which exceeds the maximum of ${maxPossible}.`;
    } else {
      message = `Target already achieved! Your current CGPA (${currentCGPA.toFixed(2)}) is already above your target.`;
    }
  } else if (requiredGPA >= maxPossible * 0.9) {
    message = `Very challenging! You need to maintain a ${requiredGPA.toFixed(2)} GPA in remaining courses.`;
  } else if (requiredGPA >= maxPossible * 0.7) {
    message = `Achievable with effort! Aim for a ${requiredGPA.toFixed(2)} GPA in upcoming semesters.`;
  } else {
    message = `Easily achievable! Maintain a ${requiredGPA.toFixed(2)} GPA in remaining courses.`;
  }

  return {
    targetCGPA,
    currentCGPA: roundForDisplay(currentCGPA) || 0,
    creditsCompleted,
    creditsRemaining,
    requiredGPA: roundForDisplay(requiredGPA) || 0,
    feasible,
    message,
  };
}
