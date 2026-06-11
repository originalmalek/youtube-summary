'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, File, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FormatSelector } from './format-selector';

import { generateFileSummary, getTaskStatus } from '@/lib/api/summary';
import type { SummaryResponse, TaskResponse, TaskStatus, ApiResponse, SummaryFormat } from '@/types';
import type { UsageStats } from '@/lib/api/user';

interface FileSummaryFormProps {
  usage: UsageStats | null;
}

const ACCEPTED_FILE_TYPES = {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileSummaryForm({ usage }: FileSummaryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('English');
  const [formatType, setFormatType] = useState<SummaryFormat>('standard');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const router = useRouter();

  // Polling function to check task status
  const pollTaskStatus = useCallback(async (taskId: string) => {
    try {
      const response: ApiResponse<TaskStatus> = await getTaskStatus(taskId);
      
      if (response.error) {
        setError(response.error.detail || 'Failed to get task status');
        setIsLoading(false);
        return;
      }
      
      if (response.data) {
        const { status, current_step, progress, result, error: taskError } = response.data;
        
        setCurrentStep(current_step || '');
        
        // Update progress from backend
        if (progress !== undefined) {
          setUploadProgress(progress);
        }
        
        if (status === 'completed' && result) {
          // Task completed successfully
          setUploadProgress(100);
          setCurrentStep('Complete!');

          // Trigger usage update in navbar
          window.dispatchEvent(new CustomEvent('usageUpdated'));

          try {
            const summaryData: SummaryResponse = {
              id: result.summary_id || 'unknown',
              user_id: '',
              summary_type: 'file',
              source_url: null,
              source_content: '',
              summary_text: result.summary_text || 'Summary not available',
              language: result.language || 'English',
              format_type: formatType,
              status: 'active',
              created_at: new Date().toISOString()
            };
            
            setSummary(summaryData);
            setSuccess(true);
          } catch (error) {
            console.error('Error creating summary data:', error);
            setError('Summary completed but failed to display. Check your summary history.');
          }
          
          setIsLoading(false);
          setSelectedFile(null);
          setTaskId(null);
          
        } else if (status === 'failed') {
          // Task failed
          setError(taskError || 'Processing failed');
          setIsLoading(false);
          setTaskId(null);
          
        } else if (status === 'processing' || status === 'pending') {
          // Task still processing, check again in 500ms for faster updates
          setTimeout(() => pollTaskStatus(taskId), 1000);
          
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check task status');
      setIsLoading(false);
    }
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((error: any) => error.code === 'file-too-large')) {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors.some((error: any) => error.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload a text, PDF, or Word document.');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSummary(null);
    setUploadProgress(0);
    setCurrentStep('Uploading file...');

    try {
      // Upload file and get task ID
      const response: ApiResponse<TaskResponse> = await generateFileSummary(selectedFile, language, formatType);

      if (response.error) {
        setError(response.error.detail);
        setIsLoading(false);
        return;
      }

      if (response.data && response.data.task_id) {
        // File uploaded successfully, now poll for task status
        const taskId = response.data.task_id;
        setTaskId(taskId);
        setCurrentStep('Processing document...');
        setUploadProgress(10);
        
        // Start polling for task status immediately and then every 500ms
        pollTaskStatus(taskId);
        
        // Also poll after a short delay to catch quick updates
        setTimeout(() => pollTaskStatus(taskId), 1000);
      } else {
        setError('Failed to start document processing.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file. Please try again.');
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleViewSummaries = () => {
    router.push('/summaries');
  };

  if (success && summary) {
    return (
      <div className="flex flex-col">
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 mb-3 sm:mb-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
            Summary generated successfully!
          </AlertDescription>
        </Alert>

        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Generated Summary
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 flex-1 overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary.summary_text}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 pt-4 border-t dark:border-gray-700">
          <Button onClick={() => setSuccess(false)} variant="outline" className="w-full sm:w-auto">
            Create Another Summary
          </Button>
          <Button onClick={handleViewSummaries} className="w-full sm:w-auto">
            View All Summaries
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2 text-blue-600">
        <Upload className="h-5 w-5" />
        <h3 className="text-lg font-semibold">File Upload Summary</h3>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600 dark:text-blue-400">
              Drop the file here...
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Supports: TXT, PDF, DOC, DOCX (max 10MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <File className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{currentStep || 'Processing...'}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
              {taskId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Task ID: {taskId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Summary Language
              </label>
              <LanguageSelector
                value={language}
                onValueChangeAction={setLanguage}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose the language for your summary
              </p>
            </div>

            <FormatSelector
              selectedFormat={formatType}
              onFormatChange={setFormatType}
              disabled={isLoading}
            />
          </div>

          {usage && usage.remaining === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve reached your monthly summary limit ({usage.limit} summaries).
                <span className="block mt-1">
                  Resets on {new Date(usage.reset_date).toLocaleDateString()}.
                </span>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (usage?.remaining === 0)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Summary...
              </>
            ) : usage?.remaining === 0 ? (
              <>Limit Reached - Upgrade to Continue</>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </div>
      )}

      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>Supported file types:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Text files (.txt)</li>
          <li>PDF documents (.pdf)</li>
          <li>Word documents (.doc, .docx)</li>
        </ul>
        <p className="mt-2">Maximum file size: 10MB</p>
      </div>
    </div>
  );
}