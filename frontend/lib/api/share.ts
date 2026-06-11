import { apiClient, apiCall } from './client';
import type { SharedSummaryResponse, ShareResponse, ApiResponse } from '@/types';

/**
 * Get a shared summary by share ID (public endpoint - no auth required)
 */
export const getSharedSummary = async (shareId: string): Promise<ApiResponse<SharedSummaryResponse>> => {
  return apiCall(() => apiClient.get(`/share/${shareId}`));
};

/**
 * Create a share link for a summary
 */
export const createShareLink = async (summaryId: string): Promise<ApiResponse<ShareResponse>> => {
  return apiCall(() => apiClient.post(`/summary/share/${summaryId}`));
};

/**
 * Disable sharing for a summary
 */
export const disableSharing = async (summaryId: string): Promise<ApiResponse<{ message: string }>> => {
  return apiCall(() => apiClient.delete(`/summary/share/${summaryId}`));
};