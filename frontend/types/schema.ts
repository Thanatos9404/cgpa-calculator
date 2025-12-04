/**
 * TypeScript types and Zod schemas for CGPA Calculator
 */
import { z } from 'zod';

// Enums
export type GradeType = 'letter' | 'marks';
export type RepeatPolicy = 'latest' | 'highest' | 'average';
export type ConversionMethod = 'official' | 'linear';

// Course Schema
export const CourseSchema = z.object({
  code: z.string().optional(), // Made optional
  name: z.string().min(1, 'Course name is required'),
  credits: z.number().min(0, 'Credits cannot be negative'),
  gradeType: z.enum(['letter', 'marks']),
  grade: z.string().optional(),
  marks: z.number().min(0).max(100).optional(),
  gradePoint: z.number().min(0).optional().nullable(),
  // Component-wise marks
  endsem: z.number().min(0).optional(),
  midsem: z.number().min(0).optional(),
  internals: z.number().min(0).optional(),
  endsemMax: z.number().optional(), // Max marks for endsem (usually 50)
  midsemMax: z.number().optional(), // Max marks for midsem (usually 25 or 30)
});

export type Course = z.infer<typeof CourseSchema>;

// Semester Schema
export const SemesterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Semester name is required'),
  courses: z.array(CourseSchema).default([]),
  gpa: z.number().min(0).optional().nullable(),
  order: z.number().default(0),
});

export type Semester = z.infer<typeof SemesterSchema>;

// Grade Mapping Schema
export const GradeMappingSchema = z.object({
  minMarks: z.number().min(0).max(100),
  maxMarks: z.number().min(0).max(100),
  letterGrade: z.string(),
  gradePoint: z.number().min(0),
});

export type GradeMapping = z.infer<typeof GradeMappingSchema>;

// Grade Template Schema
export const GradeTemplateSchema = z.object({
  name: z.string(),
  scale: z.union([z.literal(4), z.literal(10)]),
  mappings: z.array(GradeMappingSchema),
  description: z.string().optional(),
});

export type GradeTemplate = z.infer<typeof GradeTemplateSchema>;

// Session Metadata Schema
export const SessionMetadataSchema = z.object({
  scale: z.union([z.literal(4), z.literal(10)]).default(10),
  roundTo: z.number().default(2),
  repeatPolicy: z.enum(['latest', 'highest', 'average']).default('latest'),
  customTemplate: z.string().optional().nullable(),
});

export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;

// Session Schema
export const SessionSchema = z.object({
  semesters: z.array(SemesterSchema).default([]),
  metadata: SessionMetadataSchema.default({}),
  customMappings: z.array(GradeMappingSchema).optional().nullable(),
  cgpa: z.number().min(0).optional().nullable(),
});

export type Session = z.infer<typeof SessionSchema>;

// Conversion Request/Response
export const ConversionRequestSchema = z.object({
  value: z.number().positive(),
  fromScale: z.union([z.literal(4), z.literal(10)]),
  toScale: z.union([z.literal(4), z.literal(10)]),
  method: z.enum(['official', 'linear']).default('linear'),
});

export type ConversionRequest = z.infer<typeof ConversionRequestSchema>;

export interface ConversionResponse {
  originalValue: number;
  convertedValue: number;
  fromScale: number;
  toScale: number;
  method: string;
  formula?: string;
}

// Chart Data Types
export interface CGPATimelineData {
  semester: string;
  cgpa: number;
  gpa: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  percentage: number;
}

export interface CreditDistribution {
  semester: string;
  credits: number;
}

// UI State Types
export interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export interface WhatIfState {
  isActive: boolean;
  simulatedSemesters: Semester[];
  projectedCGPA: number | null;
}

// Export/Import Types
export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf' | 'png';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  chartImages?: Record<string, string>;
}

// API Response Types
export interface APIError {
  error: string;
  detail?: string;
  status: string;
}

// Validation Types
export interface ValidationWarning {
  courseCode: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
