import { Session } from '@/types/schema';
import { calculateGPA, roundForDisplay } from './calculator';

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
    // Add this semester's contribution
    semester.courses.forEach(course => {
      if (course.gradePoint !== null && course.gradePoint !== undefined) {
        cumulativePoints += course.gradePoint * course.credits;
        cumulativeCredits += course.credits;
      }
    });

    const cgpa = cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;
    const semesterGPA = calculateGPA(semester.courses) || 0;

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
    semester.courses.forEach(course => {
      if (course.gradePoint !== null && course.gradePoint !== undefined) {
        completedCredits += course.credits;
      }
    });
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
    const gpa = calculateGPA(semester.courses);

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

  session.semesters.forEach(semester => {
    semester.courses.forEach(course => {
      totalCourses++;
      if (course.gradePoint !== null && course.gradePoint !== undefined) {
        completedCredits += course.credits;
        coursesCompleted++;
      }
    });
  });

  const percentage = (completedCredits / totalCreditsRequired) * 100;

  return {
    percentage: Math.min(100, Math.round(percentage)),
    completedCredits,
    totalCredits: totalCreditsRequired,
    coursesCompleted,
    totalCourses,
  };
}
