/**
 * Backend API client with privacy prompts
 */
import { Session, ConversionRequest, ConversionResponse, GradeTemplate } from '@/types/schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'API request failed');
    }

    return response.json();
  }

  async convertScale(request: ConversionRequest): Promise<ConversionResponse> {
    return this.request<ConversionResponse>('/convert-scale', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generatePDF(
    session: Session,
    chartImages?: Record<string, string>
  ): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session,
        includeCharts: !!chartImages,
        chartImages,
      }),
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    return response.blob();
  }

  async getOfficialTemplates(): Promise<GradeTemplate[]> {
    const result = await this.request<{ templates: GradeTemplate[] }>(
      '/official-templates'
    );
    return result.templates;
  }

  async parseTranscript(
    fileContent: string,
    fileType: 'pdf' | 'image'
  ): Promise<any> {
    return this.request('/parse-transcript', {
      method: 'POST',
      body: JSON.stringify({ fileContent, fileType }),
    });
  }
}

export const apiClient = new APIClient(API_URL);

// Privacy-aware wrapper functions
export async function convertScaleWithBackend(
  request: ConversionRequest
): Promise<ConversionResponse | null> {
  try {
    return await apiClient.convertScale(request);
  } catch (error) {
    console.error('Backend conversion failed:', error);
    return null;
  }
}

export async function generatePDFWithBackend(
  session: Session,
  chartImages?: Record<string, string>
): Promise<Blob | null> {
  const userConsent = confirm(
    'Generate PDF using backend server for enhanced quality? Your data will be sent to the server temporarily.\n\nClick Cancel to use client-side PDF generation instead.'
  );

  if (!userConsent) {
    return null; // User declined, use client-side fallback
  }

  try {
    return await apiClient.generatePDF(session, chartImages);
  } catch (error) {
    console.error('Backend PDF generation failed:', error);
    alert('Backend PDF generation failed. Please try client-side export.');
    return null;
  }
}
