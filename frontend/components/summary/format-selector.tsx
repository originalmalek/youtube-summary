'use client';

import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getAvailableFormats, FormatsResponse } from '@/lib/api/summary';
import type { SummaryFormat } from '@/types';

interface FormatSelectorProps {
  selectedFormat: SummaryFormat;
  onFormatChange: (format: SummaryFormat) => void;
  disabled?: boolean;
  className?: string;
}

export function FormatSelector({ 
  selectedFormat, 
  onFormatChange, 
  disabled = false,
  className = '' 
}: FormatSelectorProps) {
  const [formats, setFormats] = useState<FormatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        setLoading(true);
        const response = await getAvailableFormats();
        if (response.data) {
          setFormats(response.data);
        }
      } catch (error) {
        console.error('Failed to load formats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormats();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'structured':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'analytical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'advanced':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>Summary Format</Label>
        <div className='h-9 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse' />
      </div>
    );
  }

  if (!formats) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>Summary Format</Label>
        <Select value={selectedFormat} onValueChange={onFormatChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder='Select format' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='standard'>Standard Text</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className='flex items-center gap-2'>
        <Label>Summary Format</Label>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost' size='sm' className='p-0 h-5 w-5 rounded-full'>
              <Info className='h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200' />
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Summary Format Types</DialogTitle>
              <DialogDescription>
                Choose the format that best suits your needs. Each format structures the summary differently.
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              {Object.entries(formats?.formats || {}).map(([formatKey, formatConfig]) => (
                <div key={formatKey} className='border rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-medium'>{formatConfig.name}</h4>
                    <Badge 
                      variant='outline' 
                      className={getCategoryColor(formatConfig.category)}
                    >
                      {formatConfig.category}
                    </Badge>
                    {formatConfig.premium && (
                      <Badge variant='secondary' className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'>
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {formatConfig.description}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Select value={selectedFormat} onValueChange={onFormatChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder='Select format' />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(formats?.formats || {}).map(([formatKey, formatConfig]) => (
            <SelectItem key={formatKey} value={formatKey}>
              <span>{formatConfig.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}