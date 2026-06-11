'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Type, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LanguageSelector } from '@/components/ui/language-selector';
import { FormatSelector } from './format-selector';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { generateTextSummary, getTaskStatus } from '@/lib/api/summary';
import type { SummaryResponse, TaskResponse, TaskStatus, ApiResponse, SummaryFormat } from '@/types';
import type { UsageStats } from '@/lib/api/user';

interface TextSummaryFormProps {
  usage: UsageStats | null;
}

const textSummarySchema = z.object({
  text: z
    .string()
    .min(100, 'Text must be at least 100 characters')
    .max(50000, 'Text must be no more than 50,000 characters'),
  language: z.string().min(1, 'Language is required'),
  format_type: z.string().min(1, 'Format is required'),
});

type TextFormData = z.infer<typeof textSummarySchema>;

export function TextSummaryForm({ usage }: TextSummaryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [, setTaskId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const router = useRouter();

  const form = useForm<TextFormData>({
    resolver: zodResolver(textSummarySchema),
    defaultValues: {
      text: '',
      language: 'English',
      format_type: 'standard',
    },
  });

  const watchedText = form.watch('text');
  const textLength = watchedText?.length || 0;
  const isTextValid = textLength >= 100 && textLength <= 50000;

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
              summary_type: 'text',
              source_url: null,
              source_content: '',
              summary_text: result.summary_text || 'Summary not available',
              language: result.language || 'English',
              format_type: form.getValues('format_type') as SummaryFormat,
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
          setTaskId(null);
          form.reset();
          
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
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to check task status');
      setIsLoading(false);
    }
  }, [form]);

  const onSubmit = async (data: TextFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSummary(null);
    setUploadProgress(0);
    setCurrentStep('Processing text...');

    try {
      // Start text processing and get task ID
      const response: ApiResponse<TaskResponse> = await generateTextSummary(data.text, data.language, data.format_type as SummaryFormat);

      if (response.error) {
        setError(response.error.detail);
        setIsLoading(false);
        return;
      }

      if (response.data && response.data.task_id) {
        // Processing started successfully, now poll for task status
        const taskId = response.data.task_id;
        setTaskId(taskId);
        setCurrentStep('Processing text...');
        setUploadProgress(10);
        
        // Start polling for task status immediately and then every 500ms
        pollTaskStatus(taskId);
        
        // Also poll after a short delay to catch quick updates
        setTimeout(() => pollTaskStatus(taskId), 1000);
      } else {
        setError('Failed to start text processing.');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to process text. Please try again.');
      setIsLoading(false);
    }
  };

  const handleViewSummaries = () => {
    router.push('/summaries');
  };

  if (success && summary) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Summary generated successfully!
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Generated Summary
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary.summary_text}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={() => setSuccess(false)} variant="outline">
              Create Another Summary
            </Button>
            <Button onClick={handleViewSummaries}>
              View All Summaries
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-blue-600">
        <Type className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Text Summary</h3>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {currentStep || 'Processing...'}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Text to Summarize</FormLabel>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-5 w-5 rounded-full">
                        <Info className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Text Summary Requirements</DialogTitle>
                        <DialogDescription>
                          Guidelines for text summarization to ensure optimal results.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 mt-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Requirements:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              <span>Text must be between 100 and 50,000 characters</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              <span>Text can be in any language</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              <span>Summary will be generated in your selected language</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Paste or type the text you want to summarize..."
                    className="h-[240px] resize-none overflow-y-auto"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="flex justify-between items-center">
                  <FormDescription>
                    Enter the text you want to summarize (minimum 100 characters)
                  </FormDescription>
                  <div className={`text-sm font-mono ${
                    textLength < 100 
                      ? 'text-red-500' 
                      : textLength > 50000 
                        ? 'text-red-500' 
                        : 'text-green-600'
                  }`}>
                    {textLength.toLocaleString()}/50,000
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary Language</FormLabel>
                <FormControl>
                  <LanguageSelector
                    value={field.value}
                    onValueChangeAction={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription>
                  Choose the language for your summary
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="format_type"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormatSelector
                    selectedFormat={field.value as SummaryFormat}
                    onFormatChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            type="submit"
            disabled={isLoading || !isTextValid || (usage?.remaining === 0)}
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
                <Type className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}