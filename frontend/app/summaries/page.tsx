import { Metadata } from 'next';
import { SummariesList } from '@/components/summaries/summaries-list';
import { ProtectedRoute } from '@/components/auth/protected-route';

export const metadata: Metadata = {
  title: 'My Summaries - YouTube Summary',
  description: 'View and manage your AI-generated summaries',
};

export default function SummariesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Summaries
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View and manage your AI-generated summaries
            </p>
          </div>
          
          <SummariesList />
        </div>
      </div>
    </ProtectedRoute>
  );
}