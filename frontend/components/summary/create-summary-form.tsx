'use client';

import { useState, useEffect } from 'react';
import { Youtube, Upload, Type, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { YoutubeSummaryForm } from './youtube-summary-form';
import { FileSummaryForm } from './file-summary-form';
import { TextSummaryForm } from './text-summary-form';
import { getUserUsage, type UsageStats } from '@/lib/api/user';

export function CreateSummaryForm() {
  const [activeTab, setActiveTab] = useState('youtube');
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await getUserUsage();
        setUsage(data);
      } catch (error) {
        console.error('Failed to fetch usage stats:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsage();

    // Listen for usage updates
    const handleUsageUpdate = () => fetchUsage();
    window.addEventListener('usageUpdated', handleUsageUpdate);
    return () => window.removeEventListener('usageUpdated', handleUsageUpdate);
  }, []);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Create New Summary</span>
        </CardTitle>
        <CardDescription>
          Choose how you want to create your summary
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {loadingUsage ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="youtube" className="flex items-center space-x-1 text-xs sm:text-sm">
                <Youtube className="h-4 w-4" />
                <span className="hidden sm:inline">YouTube Video</span>
                <span className="sm:hidden">YouTube</span>
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center space-x-1 text-xs sm:text-sm">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload File</span>
                <span className="sm:hidden">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center space-x-1 text-xs sm:text-sm">
                <Type className="h-4 w-4" />
                <span className="hidden sm:inline">Direct Text</span>
                <span className="sm:hidden">Text</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube" className="mt-0">
              <YoutubeSummaryForm usage={usage} />
            </TabsContent>

            <TabsContent value="file" className="mt-0">
              <FileSummaryForm usage={usage} />
            </TabsContent>

            <TabsContent value="text" className="mt-0">
              <TextSummaryForm usage={usage} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}