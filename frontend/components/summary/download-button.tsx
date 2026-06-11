'use client';

import { useState } from 'react';
import { Download, FileText, FileDown, File, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

import { exportSummary, type ExportFormat } from './download-utils';

interface DownloadButtonProps {
  summary: {
    summary_text: string;
    summary_type: string;
    format_type: string;
    language: string;
    created_at: string;
    source_url?: string;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
}

export function DownloadButton({ 
  summary, 
  variant = 'outline', 
  size = 'sm',
  showText = true 
}: DownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const exportFormats = [
    {
      format: 'html' as ExportFormat,
      label: 'HTML',
      icon: FileText,
      description: 'Web page with styling',
    },
    {
      format: 'docx' as ExportFormat,
      label: 'DOCX',
      icon: FileDown,
      description: 'Microsoft Word document',
    },
  ];

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportingFormat(format);
      setExportProgress(0);

      await exportSummary(summary, format, (progress) => {
        setExportProgress(progress);
      });

      // Show completion briefly
      setTimeout(() => {
        setIsExporting(false);
        setExportingFormat(null);
        setExportProgress(0);
      }, 500);

    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
      setExportingFormat(null);
      setExportProgress(0);
      
      // You could add toast notification here
      alert(`Failed to export as ${format.toUpperCase()}. Please try again.`);
    }
  };

  const getCurrentFormatLabel = () => {
    if (!exportingFormat) return '';
    const format = exportFormats.find(f => f.format === exportingFormat);
    return format?.label || '';
  };

  if (isExporting) {
    return (
      <div className="flex items-center space-x-2 min-w-[120px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {exportProgress < 100 ? `Exporting ${getCurrentFormatLabel()}...` : 'Done!'}
          </span>
        </div>
        {exportProgress > 0 && exportProgress < 100 && (
          <div className="w-16">
            <Progress value={exportProgress} className="h-1" />
          </div>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="flex items-center space-x-1"
          disabled={isExporting}
        >
          <Download className="h-3 w-3" />
          {showText && <span className="hidden lg:inline">Download</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {exportFormats.map(({ format, label, icon: Icon, description }) => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            className="flex items-center space-x-3 p-3 cursor-pointer"
          >
            <Icon className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-xs text-gray-500">{description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}