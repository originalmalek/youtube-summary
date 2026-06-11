'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  const token = params.token as string;

  useEffect(() => {
    const handleVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification token');
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (response.data) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.detail || 'Verification failed. Please try again.');
      }
    };

    handleVerification();
  }, [token]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleResendEmail = () => {
    // TODO: Implement resend functionality
    console.log('Resend email functionality to be implemented');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            {status === 'loading' && (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-8 w-8 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address.'}
            {status === 'success' && 'Your email has been successfully verified. You can now log in to your account.'}
            {status === 'error' && 'We could not verify your email address.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {message && (
            <div className={`rounded-md p-4 text-sm ${
              status === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                : status === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
            }`}>
              {message}
            </div>
          )}
          
          <div className="space-y-3">
            {status === 'success' && (
              <Button onClick={handleGoToLogin} className="w-full">
                Go to Login
              </Button>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <Button onClick={handleResendEmail} variant="outline" className="w-full">
                  Resend Verification Email
                </Button>
                <Button onClick={handleGoToLogin} variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}