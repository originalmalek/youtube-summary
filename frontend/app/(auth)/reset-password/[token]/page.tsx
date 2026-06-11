'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { useAuthStore } from '@/lib/stores/auth-store';

interface ResetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Resolve the params Promise
    params.then((resolvedParams) => {
      setToken(resolvedParams.token);
    });
  }, [params]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/create-summary');
    }
  }, [isAuthenticated, router]);

  // Show loading or redirect for authenticated users
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
