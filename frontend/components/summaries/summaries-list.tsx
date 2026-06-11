'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileText, Youtube, File, ExternalLink, Calendar, Clock, Globe, Share2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { getSummaries } from '@/lib/api/summary';
import { createShareLink } from '@/lib/api/share';
import type { SummaryResponse, SummaryType, SummaryFormat } from '@/types';
import { ArchiveToggleButton } from '@/components/summary/archive-toggle-button';
import { DownloadButton } from '@/components/summary/download-button';
import { Pagination } from '@/components/ui/pagination';

export function SummariesList() {
  const [summaries, setSummaries] = useState<SummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});
  const [sharingLoading, setSharingLoading] = useState<Record<string, boolean>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 10;

  const fetchSummaries = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const offset = (page - 1) * limit;
      const response = await getSummaries(limit, 'active', offset);
      
      if (response.error) {
        setError(response.error.detail);
      } else if (response.data) {
        // response.data is SummaryHistory with summaries array
        setSummaries(response.data.summaries);
        setTotal(response.data.total);
        setTotalPages(Math.ceil(response.data.total / limit));
        setHasNext(response.data.has_next);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch summaries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries(currentPage);
  }, [currentPage, refreshKey]);

  useEffect(() => {
    const handleRefreshSummaries = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('refreshSummaries', handleRefreshSummaries);
    return () => window.removeEventListener('refreshSummaries', handleRefreshSummaries);
  }, []);

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

  const getFormatBadgeColor = (format: SummaryFormat) => {
    switch (format) {
      case 'standard':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'bullets':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'takeaways':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'executive':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'qa':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'action_items':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'pros_cons':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'timeline':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'study_guide':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const toggleSummaryExpansion = (summaryId: string) => {
    setExpandedSummary(expandedSummary === summaryId ? null : summaryId);
  };

  const handleStatusChange = (updatedSummary: SummaryResponse) => {
    // Remove the summary from the list since it's now archived
    setSummaries(prevSummaries => 
      prevSummaries.filter(summary => summary.id !== updatedSummary.id)
    );
    // Update total count
    setTotal(prev => prev - 1);
    setTotalPages(Math.ceil((total - 1) / limit));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleGenerateShare = async (summaryId: string) => {
    // Don't generate if we already have a link or are currently loading
    if (shareLinks[summaryId] || sharingLoading[summaryId]) {
      return;
    }

    setSharingLoading(prev => ({ ...prev, [summaryId]: true }));
    
    try {
      const response = await createShareLink(summaryId);
      
      if (response.error) {
        setError(response.error.detail);
      } else if (response.data) {
        setShareLinks(prev => ({ ...prev, [summaryId]: response.data!.share_url }));
      }
    } catch {
      setError('Failed to create share link');
    } finally {
      setSharingLoading(prev => ({ ...prev, [summaryId]: false }));
    }
  };

  const handleCopyLink = async (summaryId: string) => {
    const shareUrl = shareLinks[summaryId];
    if (!shareUrl) {
      setError('No share link available');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedStates(prev => ({ ...prev, [summaryId]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [summaryId]: false }));
      }, 2000);
    } catch {
      setError('Failed to copy link to clipboard');
    }
  };

  const handleDialogOpenChange = (summaryId: string, open: boolean) => {
    setOpenDialogs(prev => ({ ...prev, [summaryId]: open }));
    
    if (open) {
      // Generate share link when dialog opens
      handleGenerateShare(summaryId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!Array.isArray(summaries) || summaries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No summaries yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            You haven&apos;t created any summaries yet. Start by summarizing a YouTube video or uploading a file.
          </p>
          <Button asChild>
            <Link href="/">Create Summary</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {total} {total === 1 ? 'summary' : 'summaries'} found
        </p>
      </div>

      <div className="grid gap-6">
        {Array.isArray(summaries) ? summaries.map((summary) => (
          <Card key={summary.id} className="hover:shadow-md transition-shadow">
            <CardContent>
              {/* Professional single-row layout with CSS Grid */}
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center mb-4">
                {/* Left content area - single horizontal scroll */}
                <div className="overflow-x-auto scrollbar-hide max-w-full">
                  <div className="flex items-center gap-4 min-w-max px-1">
                    {/* Badges section */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getSummaryIcon(summary.summary_type)}
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {getSummaryTypeLabel(summary.summary_type)}
                      </Badge>
                      <Badge className={`text-xs whitespace-nowrap ${getFormatBadgeColor(summary.format_type)}`}>
                        {getFormatLabel(summary.format_type)}
                      </Badge>
                    </div>
                    
                    {/* Metadata section */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className="whitespace-nowrap">
                          {format(new Date(summary.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="whitespace-nowrap">
                          {format(new Date(summary.created_at), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span className="whitespace-nowrap">
                          {summary.language}
                        </span>
                      </div>
                    </div>
                    
                    {/* View Source */}
                    {summary.source_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center space-x-1 flex-shrink-0"
                      >
                        <a
                          href={summary.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="whitespace-nowrap">View Source</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Right actions area - fixed size */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Dialog 
                    open={openDialogs[summary.id] || false}
                    onOpenChange={(open) => handleDialogOpenChange(summary.id, open)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Share2 className="h-3 w-3" />
                        <span className="hidden lg:inline">Share</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share Summary</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Anyone with this link can view this summary without signing in.
                        </p>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={
                              sharingLoading[summary.id] 
                                ? 'Generating link...' 
                                : shareLinks[summary.id] || 'Link will appear here'
                            }
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleCopyLink(summary.id)}
                            disabled={sharingLoading[summary.id] || !shareLinks[summary.id]}
                            className="flex items-center space-x-1"
                          >
                            {copiedStates[summary.id] ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <DownloadButton
                    summary={{
                      summary_text: summary.summary_text,
                      summary_type: summary.summary_type,
                      format_type: summary.format_type,
                      language: summary.language,
                      created_at: summary.created_at,
                      source_url: summary.source_url || undefined,
                    }}
                    variant="outline"
                    size="sm"
                    showText={true}
                  />
                  
                  <ArchiveToggleButton
                    summary={summary}
                    onStatusChange={handleStatusChange}
                    variant="outline"
                    size="sm"
                    showText={true}
                  />
                </div>
              </div>
              
              {/* Separator Line */}
              <div className="border-t border-gray-200 dark:border-gray-700 mb-4"></div>
              
              <div className="space-y-4">
                <div>
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:text-gray-700 dark:prose-ul:text-gray-300 prose-ol:text-gray-700 dark:prose-ol:text-gray-300 markdown-content">
                    {expandedSummary === summary.id ? (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                      >
                        {summary.summary_text}
                      </ReactMarkdown>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                      >
                        {truncateText(summary.summary_text)}
                      </ReactMarkdown>
                    )}
                  </div>
                  
                  {summary.summary_text.length > 200 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => toggleSummaryExpansion(summary.id)}
                      className="p-0 h-auto text-primary hover:text-primary/80 mt-2"
                    >
                      {expandedSummary === summary.id ? 'Show less' : 'Read more'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No summaries available</p>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            hasNext={hasNext}
            hasPrevious={currentPage > 1}
            totalItems={total}
            itemsPerPage={limit}
          />
        </div>
      )}
    </div>
  );
}