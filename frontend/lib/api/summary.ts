import { apiClient, apiCall } from './client';
import type { 
  ApiResponse, 
  SummaryResponse, 
  SummaryHistory, 
  TaskStatus, 
  TaskResponse,
  SummaryFormat 
} from '@/types';

// Format configuration interface
export interface SummaryFormatConfig {
  name: string;
  description: string;
  premium: boolean;
  category: 'basic' | 'structured' | 'analytical' | 'advanced';
}

// Available formats response
export interface FormatsResponse {
  formats: Record<SummaryFormat, SummaryFormatConfig>;
  default_format: SummaryFormat;
}

// Get user's summary history
export const getSummaries = async (
  limit: number = 10,
  status: 'active' | 'archived' = 'active',
  offset: number = 0
): Promise<ApiResponse<SummaryHistory>> => {
  return apiCall<SummaryHistory>(() =>
    apiClient.get(`/summary/summaries?limit=${limit}&status=${status}&offset=${offset}`)
  );
};

// Get a specific summary by ID
export const getSummary = async (
  summaryId: string
): Promise<ApiResponse<SummaryResponse>> => {
  return apiCall<SummaryResponse>(() =>
    apiClient.get(`/summary/summary/${summaryId}`)
  );
};

// Generate YouTube summary (returns task info)
export const generateYoutubeSummary = async (
  youtubeUrl: string,
  language: string = 'English',
  formatType: SummaryFormat = 'standard'
): Promise<ApiResponse<TaskResponse>> => {
  return apiCall<TaskResponse>(() =>
    apiClient.get(`/summary/summary_youtube?youtube_url=${encodeURIComponent(youtubeUrl)}&language=${encodeURIComponent(language)}&format_type=${formatType}`)
  );
};

// Generate file summary (returns task info)
export const generateFileSummary = async (
  file: File,
  language: string = 'English',
  formatType: SummaryFormat = 'standard'
): Promise<ApiResponse<TaskResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiCall<TaskResponse>(() =>
    apiClient.post(`/summary/summary_file?language=${encodeURIComponent(language)}&format_type=${formatType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  );
};

// Get task status
export const getTaskStatus = async (
  taskId: string
): Promise<ApiResponse<TaskStatus>> => {
  return apiCall<TaskStatus>(() =>
    apiClient.get(`/summary/task/${taskId}/status`)
  );
};

// Toggle summary status between active and archived
export const toggleSummaryStatus = async (
  summaryId: string
): Promise<ApiResponse<SummaryResponse>> => {
  return apiCall<SummaryResponse>(() =>
    apiClient.patch(`/summary/summary/${summaryId}/toggle-status`)
  );
};

// Generate text summary (returns task info)
export const generateTextSummary = async (
  text: string,
  language: string = 'English',
  formatType: SummaryFormat = 'standard'
): Promise<ApiResponse<TaskResponse>> => {
  return apiCall<TaskResponse>(() =>
    apiClient.post('/summary/summary_text', {
      text,
      language,
      format_type: formatType
    })
  );
};

// Delete summary (soft delete)
export const deleteSummary = async (
  summaryId: string
): Promise<ApiResponse<{ message: string }>> => {
  return apiCall<{ message: string }>(() =>
    apiClient.delete(`/summary/summary/${summaryId}`)
  );
};

// Get available summary formats
export const getAvailableFormats = async (): Promise<ApiResponse<FormatsResponse>> => {
  return apiCall<FormatsResponse>(() =>
    apiClient.get('/summary/formats')
  );
};