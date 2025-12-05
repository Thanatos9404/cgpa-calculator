/**
 * Client-side calculation engine (mirrors backend logic)
 */
import {
  Course,
  Semester,
  GradeMapping,
  GradeTemplate,
  ConversionMethod,
} from '@/types/schema';

// Built-in Templates (matching backend)
export const BIT_MESRA_10_POINT: GradeTemplate = {
  name: 'BIT Mesra 10-Point',
  scale: 10,
  description: 'Official BIT Mesra grading system (10-point scale)',
  mappings: [
    { minMarks: 91, maxMarks: 100, letterGrade: 'A+/O', gradePoint: 10.0 },
    { minMarks: 81, maxMarks: 90, letterGrade: 'A', gradePoint: 9.0 },
    { minMarks: 71, maxMarks: 80, letterGrade: 'B', gradePoint: 8.0 },
    { minMarks: 61, maxMarks: 70, letterGrade: 'C', gradePoint: 7.0 },
    { minMarks: 51, maxMarks: 60, letterGrade: 'D', gradePoint: 6.0 },
    { minMarks: 41, maxMarks: 50, letterGrade: 'E', gradePoint: 5.0 },
    { minMarks: 0, maxMarks: 40, letterGrade: 'F', gradePoint: 0.0 },
  ],
};

export const STANDARD_4_POINT: GradeTemplate = {
  name: 'Standard 4-Point',
  scale: 4,
  description: 'Standard US 4.0 grading scale',
  mappings: [
    { minMarks: 93, maxMarks: 100, letterGrade: 'A+', gradePoint: 4.0 },
    { minMarks: 90, maxMarks: 92, letterGrade: 'A', gradePoint: 4.0 },
    { minMarks: 87, maxMarks: 89, letterGrade: 'A-', gradePoint: 3.7 },
    { minMarks: 83, maxMarks: 86, letterGrade: 'B+', gradePoint: 3.3 },
    { minMarks: 80, maxMarks: 82, letterGrade: 'B', gradePoint: 3.0 },
    { minMarks: 77, maxMarks: 79, letterGrade: 'B-', gradePoint: 2.7 },
    { minMarks: 73, maxMarks: 76, letterGrade: 'C+', gradePoint: 2.3 },
    { minMarks: 70, maxMarks: 72, letterGrade: 'C', gradePoint: 2.0 },
    { minMarks: 67, maxMarks: 69, letterGrade: 'C-', gradePoint: 1.7 },
    { minMarks: 63, maxMarks: 66, letterGrade: 'D+', gradePoint: 1.3 },
    { minMarks: 60, maxMarks: 62, letterGrade: 'D', gradePoint: 1.0 },
    { minMarks: 0, maxMarks: 59, letterGrade: 'F', gradePoint: 0.0 },
  ],
};

const LETTER_TO_POINTS_10: Record<string, number> = {
  'A+/O': 10.0,
  'A+': 10.0,
  O: 10.0,
  A: 9.0,
  B: 8.0,
  C: 7.0,
  D: 6.0,
  E: 5.0,
  F: 0.0,
};

const LETTER_TO_POINTS_4: Record<string, number> = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  'D-': 0.7,
  F: 0.0,
};

export function getBuiltinTemplates(): GradeTemplate[] {
  return [BIT_MESRA_10_POINT, STANDARD_4_POINT];
}

export function getTemplateByName(name: string): GradeTemplate | undefined {
  return getBuiltinTemplates().find((t) => t.name === name);
}

export function convertMarksToGrade(
  marks: number,
  template: GradeTemplate
): string {
  for (const mapping of template.mappings) {
    if (marks >= mapping.minMarks && marks <= mapping.maxMarks) {
      return mapping.letterGrade;
    }
  }
  return template.mappings[template.mappings.length - 1].letterGrade;
}

export function convertGradeToPoints(
  grade: string,
  scale: number,
  template?: GradeTemplate
): number {
  const upperGrade = grade.toUpperCase().trim();

  if (template) {
    const mapping = template.mappings.find(
      (m) => m.letterGrade.toUpperCase() === upperGrade
    );
    if (mapping) return mapping.gradePoint;
  }

  if (scale === 10) {
    return LETTER_TO_POINTS_10[upperGrade] ?? 0.0;
  } else {
    return LETTER_TO_POINTS_4[upperGrade] ?? 0.0;
  }
}

export function convertMarksToPoints(
  marks: number,
  template: GradeTemplate
): { letter: string; points: number } {
  const letter = convertMarksToGrade(marks, template);
  const points = convertGradeToPoints(letter, template.scale, template);
  return { letter, points };
}

export function calculateGPA(courses: Course[]): number | null {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const course of courses) {
    if (course.gradePoint === null || course.gradePoint === undefined) {
      continue;
    }
    if (course.credits === 0) {
      continue;
    }

    totalPoints += course.gradePoint * course.credits;
    totalCredits += course.credits;
  }

  if (totalCredits === 0) {
    return null;
  }

  return totalPoints / totalCredits;
}

export function calculateCGPA(semesters: Semester[]): number | null {
  let totalPoints = 0;
  let totalCredits = 0;

  for (const semester of semesters) {
    // Priority: Course-based GPA > Manual GPA
    if (semester.courses.length > 0) {
      // Use calculated GPA from courses
      for (const course of semester.courses) {
        if (course.gradePoint === null || course.gradePoint === undefined) continue;
        if (course.credits === 0) continue;
        totalPoints += course.gradePoint * course.credits;
        totalCredits += course.credits;
      }
    } else if (semester.manualGPA !== null && semester.manualGPA !== undefined &&
      semester.manualCredits !== null && semester.manualCredits !== undefined &&
      semester.manualCredits > 0) {
      // Use manual GPA entry
      totalPoints += semester.manualGPA * semester.manualCredits;
      totalCredits += semester.manualCredits;
    }
  }

  if (totalCredits === 0) {
    return null;
  }

  return totalPoints / totalCredits;
}

// Get effective GPA for a semester (course-based or manual)
export function getSemesterGPA(semester: Semester): { gpa: number | null; isManual: boolean } {
  if (semester.courses.length > 0) {
    return { gpa: calculateGPA(semester.courses), isManual: false };
  } else if (semester.manualGPA !== null && semester.manualGPA !== undefined) {
    return { gpa: semester.manualGPA, isManual: true };
  }
  return { gpa: null, isManual: false };
}

// Get effective credits for a semester
export function getSemesterCredits(semester: Semester): number {
  if (semester.courses.length > 0) {
    return semester.courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  } else if (semester.manualCredits !== null && semester.manualCredits !== undefined) {
    return semester.manualCredits;
  }
  return 0;
}

export function convertScale(
  value: number,
  fromScale: number,
  toScale: number,
  method: ConversionMethod = 'linear'
): { convertedValue: number; formula: string } {
  if (fromScale === toScale) {
    return {
      convertedValue: value,
      formula: 'Same scale - no conversion needed',
    };
  }

  if (method === 'official') {
    // BIT Mesra official mapping
    if (fromScale === 10 && toScale === 4) {
      if (value >= 9.5) return { convertedValue: 4.0, formula: 'Official mapping: 9.5-10.0 → 4.0' };
      if (value >= 8.5) return { convertedValue: 3.7, formula: 'Official mapping: 8.5-9.4 → 3.7' };
      if (value >= 7.5) return { convertedValue: 3.3, formula: 'Official mapping: 7.5-8.4 → 3.3' };
      if (value >= 6.5) return { convertedValue: 3.0, formula: 'Official mapping: 6.5-7.4 → 3.0' };
      if (value >= 5.5) return { convertedValue: 2.7, formula: 'Official mapping: 5.5-6.4 → 2.7' };
      if (value >= 5.0) return { convertedValue: 2.0, formula: 'Official mapping: 5.0-5.4 → 2.0' };
      return {
        convertedValue: value * 0.4,
        formula: `Official mapping: Below 5.0 → ${value} × 0.4`,
      };
    } else {
      // 4 to 10
      if (value >= 3.7) return { convertedValue: 9.0, formula: 'Official mapping: 3.7-4.0 → 9.0' };
      if (value >= 3.3) return { convertedValue: 8.0, formula: 'Official mapping: 3.3-3.6 → 8.0' };
      if (value >= 3.0) return { convertedValue: 7.0, formula: 'Official mapping: 3.0-3.2 → 7.0' };
      if (value >= 2.7) return { convertedValue: 6.0, formula: 'Official mapping: 2.7-2.9 → 6.0' };
      if (value >= 2.0) return { convertedValue: 5.5, formula: 'Official mapping: 2.0-2.6 → 5.5' };
      return {
        convertedValue: value * 2.5,
        formula: `Official mapping: Below 2.0 → ${value} × 2.5`,
      };
    }
  }

  // Linear conversion
  if (fromScale === 10 && toScale === 4) {
    const converted = (value / 10.0) * 4.0;
    return { convertedValue: converted, formula: `Linear: (${value} / 10) × 4` };
  } else {
    const converted = (value / 4.0) * 10.0;
    return { convertedValue: converted, formula: `Linear: (${value} / 4) × 10` };
  }
}

export function roundForDisplay(value: number | null | undefined, decimals = 2): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function validateCourse(course: Course, scale: number): string[] {
  const warnings: string[] = [];

  if (course.credits < 0) {
    warnings.push(`Course ${course.code}: Negative credits not allowed`);
  }

  if (course.credits === 0) {
    warnings.push(`Course ${course.code}: Zero credits - will not affect GPA`);
  }

  if (course.gradeType === 'marks') {
    if (course.marks === undefined || course.marks === null) {
      warnings.push(`Course ${course.code}: Marks not provided`);
    } else if (course.marks < 0 || course.marks > 100) {
      warnings.push(`Course ${course.code}: Marks out of range (0-100)`);
    }
  }

  if (course.gradeType === 'letter' && !course.grade) {
    warnings.push(`Course ${course.code}: Letter grade not provided`);
  }

  return warnings;
}

// Calculate grade distribution for charts
export function calculateGradeDistribution(semesters: Semester[]): Record<string, number> {
  const distribution: Record<string, number> = {};

  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      if (course.grade) {
        distribution[course.grade] = (distribution[course.grade] || 0) + 1;
      }
    });
  });

  return distribution;
}
