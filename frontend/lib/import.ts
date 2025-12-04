/**
 * Import utilities for JSON, CSV, and XLSX
 */
import { Session, SessionSchema, Semester, Course } from '@/types/schema';
import * as XLSX from 'xlsx';

export function importFromJSON(jsonString: string): Session {
  const data = JSON.parse(jsonString);
  return SessionSchema.parse(data);
}

export function importFromCSV(csvText: string): Partial<Session> {
  const lines = csvText.split('\n').filter((line) => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    return row;
  });

  // Group by semester
  const semestersMap = new Map<string, Course[]>();

  data.forEach((row) => {
    const semesterName = row['Semester'] || row['semester'] || 'Unknown';
    const course: Course = {
      code: row['Course Code'] || row['code'] || '',
      name: row['Course Name'] || row['name'] || '',
      credits: parseFloat(row['Credits'] || row['credits'] || '0'),
      gradeType: 'letter',
      grade: row['Grade'] || row['grade'],
      gradePoint: row['Grade Point'] ? parseFloat(row['Grade Point']) : undefined,
    };

    if (!semestersMap.has(semesterName)) {
      semestersMap.set(semesterName, []);
    }
    semestersMap.get(semesterName)!.push(course);
  });

  const semesters: Semester[] = Array.from(semestersMap.entries()).map(
    ([name, courses], idx) => ({
      id: `sem-${idx + 1}`,
      name,
      courses,
      order: idx,
    })
  );

  return { semesters };
}

export function importFromXLSX(file: File): Promise<Partial<Session>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const csvText = XLSX.utils.sheet_to_csv(firstSheet);

        const session = importFromCSV(csvText);
        resolve(session);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
