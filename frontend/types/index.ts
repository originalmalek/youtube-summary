// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  username: string; // Email address
  password: string;
}

export interface RegisterData {
  username: string; // Email address
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
}

export interface RegisterResponse {
  confirm_url: string;
  email_task_id?: string;
}

export interface PasswordResetRequest {
  username: string; // Email address
}

export interface PasswordResetResponse {
  message: string;
  email_task_id?: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface EmailConfirmationResponse {
  confirm_url: string;
  email_task_id?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Summary Types
export type SummaryType = 'youtube' | 'file' | 'text';
export type SummaryStatus = 'active' | 'archived' | 'deleted';
export type SummaryFormat = 
  | 'standard' 
  | 'bullets' 
  | 'takeaways' 
  | 'executive' 
  | 'qa' 
  | 'action_items' 
  | 'pros_cons' 
  | 'timeline' 
  | 'study_guide';

export interface SummaryResponse {
  id: string;
  user_id: string;
  summary_type: SummaryType;
  source_url: string | null;
  source_content: string;
  summary_text: string;
  language: string;
  format_type: SummaryFormat;
  status: SummaryStatus;
  created_at: string;
  is_shared?: boolean;
  share_id?: string;
}

export interface SummaryHistory {
  summaries: SummaryResponse[];
  total: number;
  limit: number;
  offset: number;
  has_next: boolean;
}

export interface ShareResponse {
  share_url: string;
  share_id: string;
}

export interface SharedSummaryResponse {
  summary_text: string;
  summary_type: SummaryType;
  format_type: SummaryFormat;
  language: string;
  created_at: string;
  source_url: string | null;
}

// Task Status Types
export interface TaskStatus {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_step: string;
  progress: number;
  created_at: string;
  updated_at: string;
  file_info: {
    name: string;
    size: number;
    type: string;
  };
  email_data: {
    email_type: string;
    email_address: string;
    token: string;
  };
  text_info: {
    text_length: number;
  };
  language: string;
  result?: {
    summary_id?: string;
    summary_text?: string;
    language?: string;
    file_info?: any;
    extracted_text_length?: number;
    summary_length?: number;
    email_type?: string;
    email_address?: string;
    sent_at?: number;
    status?: string;
    attempts?: number;
  };
  error?: string;
  retry_count: number;
  max_retries: number;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  message: string;
  file_info: {
    name: string;
    size: number;
    type: string;
  };
  language: string;
}

// Form Types
export interface YoutubeSummaryForm {
  url: string;
  language?: string;
  length?: 'short' | 'medium' | 'detailed';
  format?: 'paragraph' | 'bullet_points' | 'outline';
}

export interface FileSummaryForm {
  file: File;
  language?: string;
  length?: 'short' | 'medium' | 'detailed';
  format?: 'paragraph' | 'bullet_points' | 'outline';
}

export interface TextSummaryForm {
  text: string;
  language?: string;
}

// API Response Types
export interface ApiError {
  detail: string;
  status_code: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  message?: string;
}

// Auth Store Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: LoginCredentials, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => void;
  updateUser: (user: User) => void;
}

// UI State Types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Filter and Search Types
export interface SummaryFilters {
  search?: string;
  type?: SummaryType | 'all';
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  favoritesOnly?: boolean;
}

export interface SortOptions {
  field: 'created_at' | 'title' | 'type';
  direction: 'asc' | 'desc';
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Export utility type helpers
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredField<T, K extends keyof T> = T & Required<Pick<T, K>>;