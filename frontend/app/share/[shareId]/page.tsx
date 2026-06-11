'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, Youtube, File, ExternalLink, Calendar, Globe, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSharedSummary } from '@/lib/api/share';
import { DownloadButton } from '@/components/summary/download-button';
import type { SharedSummaryResponse, SummaryType, SummaryFormat } from '@/types';

export default function SharedSummaryPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [summary, setSummary] = useState<SharedSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedSummary = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getSharedSummary(shareId);
        
        if (response.error) {
          setError(response.error.detail);
        } else if (response.data) {
          setSummary(response.data);
        }
      } catch {
        setError('Failed to load shared summary');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      fetchSharedSummary();
    }
  }, [shareId]);

  const getSummaryIcon = (type: SummaryType) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'file':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSummaryTypeLabel = (type: SummaryType) => {
    switch (type) {
      case 'youtube':
        return 'YouTube';
      case 'file':
        return 'File';
      default:
        return 'Text';
    }
  };

  const getFormatLabel = (format: SummaryFormat) => {
    switch (format) {
      case 'standard':
        return 'Standard';
      case 'bullets':
        return 'Bullet Points';
      case 'takeaways':
        return 'Key Takeaways';
      case 'executive':
        return 'Executive Summary';
      case 'qa':
        return 'Q&A Format';
      case 'action_items':
        return 'Action Items';
      case 'pros_cons':
        return 'Pros & Cons';
      case 'timeline':
        return 'Timeline';
      case 'study_guide':
        return 'Study Guide';
      default:
        return 'Standard';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading shared summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error === 'Shared summary not found' 
                ? 'This shared summary could not be found. It may have been removed or the link may be invalid.'
                : error
              }
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Summary not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Globe className="h-4 w-4" />
            <span>Shared Summary</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Shared Summary
          </h1>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getSummaryIcon(summary.summary_type)}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {getSummaryTypeLabel(summary.summary_type)}
                    </Badge>
                    <Badge variant="outline">
                      {getFormatLabel(summary.format_type)}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Globe className="h-3 w-3" />
                      {summary.language}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(summary.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <DownloadButton
                  summary={{
                    summary_text: summary.summary_text,
                    summary_type: summary.summary_type,
                    format_type: summary.format_type,      
                    language: summary.language,
                    created_at: summary.created_at,
                    source_url: summary.source_url || undefined,
                  }}
                  showText={false}
                />
                {summary.source_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a
                      href={summary.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Source
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary.summary_text}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            This summary was shared from{' '}
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              YouTube Summary App
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}