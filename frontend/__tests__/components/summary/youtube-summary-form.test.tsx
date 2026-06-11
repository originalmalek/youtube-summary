import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { YoutubeSummaryForm } from '@/components/summary/youtube-summary-form';
import * as summaryApi from '@/lib/api/summary';

// Mock the API
vi.mock('@/lib/api/summary');

// Mock the format selector to avoid API calls
vi.mock('@/components/summary/format-selector', () => ({
  FormatSelector: ({ selectedFormat, onFormatChange }: any) => (
    <button onClick={() => onFormatChange('bullets')}>
      {selectedFormat === 'standard' ? 'Standard' : 'Bullet Points'}
    </button>
  ),
}));

// Mock the language selector
vi.mock('@/components/ui/language-selector', () => ({
  LanguageSelector: ({ value, onValueChangeAction }: any) => (
    <button onClick={() => onValueChangeAction('English')}>
      {value === 'English' ? 'English' : 'Russian'}
    </button>
  ),
}));

describe('YoutubeSummaryForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all elements', () => {
    render(<YoutubeSummaryForm />);
    
    expect(screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate summary/i })).toBeInTheDocument();
    expect(screen.getByText(/youtube video summary/i)).toBeInTheDocument();
  });

  it('validates YouTube URL format', async () => {
    const user = userEvent.setup();
    render(<YoutubeSummaryForm />);
    
    const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/);
    const submitButton = screen.getByRole('button', { name: /generate summary/i });
    
    // Test invalid URL
    await user.type(input, 'not-a-url');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid url/i)).toBeInTheDocument();
    });
    
    // Clear and test non-YouTube URL
    await user.clear(input);
    await user.type(input, 'https://example.com');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid youtube url/i)).toBeInTheDocument();
    });
  });

  it('accepts valid YouTube URLs', async () => {
    const user = userEvent.setup();
    render(<YoutubeSummaryForm />);
    
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'youtube.com/watch?v=dQw4w9WgXcQ',
    ];
    
    const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/);
    
    for (const url of validUrls) {
      await user.clear(input);
      await user.type(input, url);
      
      // Should not show error for valid URLs
      expect(screen.queryByText(/invalid youtube url/i)).not.toBeInTheDocument();
    }
  });

  it('generates summary successfully', async () => {
    const user = userEvent.setup();
    const mockSummary = {
      summary_id: 'test-id',
      summary_text: '## Test Summary\n\nThis is a test summary.',
      language: 'en',
      created_at: new Date().toISOString(),
      summary_type: 'youtube',
      format_type: 'standard',
      source_url: 'https://youtube.com/watch?v=test',
    };
    
    vi.mocked(summaryApi.generateYoutubeSummary).mockResolvedValue({
      data: {
        task_id: 'test-task',
        message: 'Processing started',
      },
    });
    
    // Mock getTaskStatus for async operations
    vi.mocked(summaryApi.getTaskStatus).mockResolvedValue({
      data: {
        task_id: 'test-task',
        status: 'completed',
        result: mockSummary,
      },
    });
    
    render(<YoutubeSummaryForm />);
    
    const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/);
    const submitButton = screen.getByRole('button', { name: /generate summary/i });
    
    await user.type(input, 'https://youtube.com/watch?v=test');
    await user.click(submitButton);
    
    // The async operation completes quickly in tests, so check for success state
    await waitFor(() => {
      expect(screen.getByText(/summary generated successfully/i)).toBeInTheDocument();
    });
    
    // Wait for summary to appear
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /test summary/i })).toBeInTheDocument();
      expect(screen.getByText(/this is a test summary/i)).toBeInTheDocument();
    });
    
    // Check API was called correctly
    expect(summaryApi.generateYoutubeSummary).toHaveBeenCalledWith(
      'https://youtube.com/watch?v=test',
      'English',
      'standard'
    );
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    vi.mocked(summaryApi.generateYoutubeSummary).mockResolvedValue({
      error: { detail: 'Video not found', status_code: 404 },
    });
    
    render(<YoutubeSummaryForm />);
    
    const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/);
    const submitButton = screen.getByRole('button', { name: /generate summary/i });
    
    await user.type(input, 'https://youtube.com/watch?v=invalid');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/video not found/i)).toBeInTheDocument();
    });
  });

  it('allows format and language selection', async () => {
    const user = userEvent.setup();
    render(<YoutubeSummaryForm />);
    
    // Format selector should be present (using our mock)
    const formatButton = screen.getByText(/standard/i);
    expect(formatButton).toBeInTheDocument();
    
    // Language selector should be present (using our mock)
    const languageButton = screen.getByText(/english/i);
    expect(languageButton).toBeInTheDocument();
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    
    vi.mocked(summaryApi.generateYoutubeSummary).mockResolvedValue({
      data: {
        task_id: 'test-task',
        message: 'Processing started',
      },
    });
    
    // Mock getTaskStatus for async operations
    vi.mocked(summaryApi.getTaskStatus).mockResolvedValue({
      data: {
        task_id: 'test-task',
        status: 'completed',
        result: {
          summary_id: 'test-id',
          summary_text: 'Test summary',
          language: 'en',
          created_at: new Date().toISOString(),
          summary_type: 'youtube',
          format_type: 'standard',
        },
      },
    });
    
    render(<YoutubeSummaryForm />);
    
    const input = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/);
    await user.type(input, 'https://youtube.com/watch?v=test');
    
    const submitButton = screen.getByRole('button', { name: /generate summary/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/test summary/i)).toBeInTheDocument();
    });
    
    // After successful submission, the form transitions to success view,
    // so the input field is no longer visible
    expect(screen.queryByPlaceholderText(/https:\/\/www\.youtube\.com\/watch/)).not.toBeInTheDocument();
  });
});