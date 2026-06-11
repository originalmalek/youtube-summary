'use client';

import { useState } from 'react';
import { Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleSummaryStatus } from '@/lib/api/summary';
import type { SummaryResponse } from '@/types';

interface ArchiveToggleButtonProps {
  summary: SummaryResponse;
  onStatusChange: (updatedSummary: SummaryResponse) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
}

export function ArchiveToggleButton({ 
  summary, 
  onStatusChange, 
  variant = 'outline',
  size = 'sm',
  showText = true
}: ArchiveToggleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await toggleSummaryStatus(summary.id);
      
      if (response.error) {
        setError(response.error.detail || 'Failed to update summary status');
        return;
      }

      if (response.data) {
        onStatusChange(response.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update summary status');
    } finally {
      setIsLoading(false);
    }
  };

  const isArchived = summary.status === 'archived';
  const buttonText = isArchived ? 'Restore' : 'Archive';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center space-x-1 ${error ? 'border-red-500 text-red-500' : ''}`}
    >
      {isArchived ? <ArchiveRestore className="h-3 w-3" /> : <Archive className="h-3 w-3" />}
      {showText && !isLoading && <span className="hidden lg:inline">{buttonText}</span>}
      {showText && isLoading && <span className="hidden lg:inline">Loading...</span>}
    </Button>
  );
}