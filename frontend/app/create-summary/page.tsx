import { Metadata } from 'next';
import { CreateSummaryForm } from '@/components/summary/create-summary-form';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'Create Summary - YouTube Summary',
  description: 'Create AI-powered summaries from YouTube videos, uploaded files, or direct text input',
};

export default function CreateSummaryPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Summary
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Generate AI-powered summaries from YouTube videos, uploaded files, or direct text input
            </p>
          </div>
          
          <CreateSummaryForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}