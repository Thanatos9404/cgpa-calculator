/**
 * Export utilities for JSON, CSV, XLSX, PDF, and PNG
 */
import { Session, Semester, Course } from '@/types/schema';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function exportToJSON(session: Session, filename = 'cgpa-data.json'): void {
  const json = JSON.stringify(session, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, filename);
}

export function exportToCSV(session: Session, filename = 'cgpa-data.csv'): void {
  const rows: string[][] = [
    ['Semester', 'Course Code', 'Course Name', 'Credits', 'Grade', 'Grade Point'],
  ];

  session.semesters.forEach((semester) => {
    semester.courses.forEach((course) => {
      rows.push([
        semester.name,
        course.code || '',
        course.name,
        course.credits.toString(),
        course.grade || '',
        course.gradePoint?.toString() || '',
      ]);
    });
  });

  const csvContent = rows.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

export function exportToXLSX(session: Session, filename = 'cgpa-data.xlsx'): void {
  const data: any[] = [];

  session.semesters.forEach((semester) => {
    semester.courses.forEach((course) => {
      data.push({
        Semester: semester.name,
        'Course Code': course.code || '',
        'Course Name': course.name,
        Credits: course.credits,
        Grade: course.grade || '',
        'Grade Point': course.gradePoint || '',
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'CGPA Data');

  XLSX.writeFile(workbook, filename);
}

export async function exportToPDFClient(
  dashboardElementId: string,
  filename = 'transcript.pdf'
): Promise<void> {
  const element = document.getElementById(dashboardElementId);
  if (!element) {
    throw new Error('Dashboard element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

export async function exportToPNG(
  elementId: string,
  filename = 'dashboard.png'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true,
  });

  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, filename);
    }
  });
}
