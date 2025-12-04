/**
 * Intrasemester target calculator - calculates marks needed in specific courses
 */
import { Session, Semester, Course } from '@/types/schema';
import { calculateGPA, convertMarksToPoints, BIT_MESRA_10_POINT } from './calculator';

export interface IntraSemesterTarget {
  currentSemesterGPA: number | null;
  targetSemesterGPA: number;
  coursesWithMarks: Course[];
  coursesNeedingGrades: Course[];
  recommendations: CourseRecommendation[];
  feasible: boolean;
  message: string;
}

export interface CourseRecommendation {
  courseName: string;
  currentMarks?: number;
  marksNeeded: number;
  gradeNeeded: string;
  feasible: boolean;
}

export function calculateIntraSemesterTarget(
  semester: Semester,
  targetGPA: number,
  scale: number = 10
): IntraSemesterTarget {
  const coursesWithMarks = semester.courses.filter(c => c.gradePoint !== null && c.gradePoint !== undefined);
  const coursesNeedingGrades = semester.courses.filter(c => c.gradePoint === null || c.gradePoint === undefined);

  const currentGPA = calculateGPA(coursesWithMarks);

  if (coursesNeedingGrades.length === 0) {
    return {
      currentSemesterGPA: currentGPA,
      targetSemesterGPA: targetGPA,
      coursesWithMarks,
      coursesNeedingGrades: [],
      recommendations: [],
      feasible: currentGPA !== null && currentGPA >= targetGPA,
      message: currentGPA !== null && currentGPA >= targetGPA
        ? `You've already achieved ${currentGPA.toFixed(2)} GPA this semester!`
        : `All courses graded. Current GPA: ${currentGPA?.toFixed(2) ?? 'N/A'}`,
    };
  }

  // Calculate total credits
  const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
  const completedCredits = coursesWithMarks.reduce((sum, c) => sum + c.credits, 0);
  const remainingCredits = coursesNeedingGrades.reduce((sum, c) => sum + c.credits, 0);

  // Calculate current points earned
  const currentPoints = coursesWithMarks.reduce((sum, c) => {
    return sum + (c.gradePoint || 0) * c.credits;
  }, 0);

  // Calculate points needed
  const targetPoints = targetGPA * totalCredits;
  const pointsNeeded = targetPoints - currentPoints;
  const avgGPANeeded = remainingCredits > 0 ? pointsNeeded / remainingCredits : 0;

  const feasible = avgGPANeeded <= scale && avgGPANeeded >= 0;

  // Generate recommendations per course
  const recommendations: CourseRecommendation[] = coursesNeedingGrades.map(course => {
    // Assume equal distribution for simplicity, or could be weighted
    const requiredGP = avgGPANeeded;

    // Find what marks/grade needed
    const template = scale === 10 ? BIT_MESRA_10_POINT : undefined;
    let marksNeeded = 0;
    let gradeNeeded = 'N/A';

    if (template) {
      // Find the minimum marks to achieve required GP
      for (const mapping of template.mappings) {
        if (mapping.gradePoint >= requiredGP) {
          marksNeeded = mapping.minMarks;
          gradeNeeded = mapping.letterGrade;
        }
      }
      // If GP needed is higher than max, need max marks
      if (requiredGP > template.mappings[0].gradePoint) {
        marksNeeded = 100;
        gradeNeeded = template.mappings[0].letterGrade + '+';
      }
    }

    return {
      courseName: course.name,
      currentMarks: course.marks,
      marksNeeded: Math.round(marksNeeded),
      gradeNeeded,
      feasible: marksNeeded <= 100,
    };
  });

  let message = '';
  if (!feasible) {
    if (avgGPANeeded > scale) {
      message = `Target not achievable! Would need ${avgGPANeeded.toFixed(2)} GPA (max is ${scale}).`;
    } else {
      message = `Target already exceeded! Current semester is on track.`;
    }
  } else if (avgGPANeeded >= scale * 0.9) {
    message = `Very challenging! Need ${avgGPANeeded.toFixed(2)} avg GPA in remaining courses.`;
  } else if (avgGPANeeded >= scale * 0.7) {
    message = `Achievable with good performance! Aim for ${avgGPANeeded.toFixed(2)} avg GPA.`;
  } else {
    message = `Easily achievable! Maintain ${avgGPANeeded.toFixed(2)} avg GPA in remaining courses.`;
  }

  return {
    currentSemesterGPA: currentGPA,
    targetSemesterGPA: targetGPA,
    coursesWithMarks,
    coursesNeedingGrades,
    recommendations,
    feasible,
    message,
  };
}
