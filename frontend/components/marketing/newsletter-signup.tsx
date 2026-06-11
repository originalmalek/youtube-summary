'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { analytics } from '@/components/analytics/google-analytics';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
  location?: string;
}

export function NewsletterSignup({
  title = "Stay Updated with AI Insights",
  description = "Get the latest tips, features, and insights about AI-powered video summarization delivered to your inbox.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  variant = 'default',
  className = '',
  location = 'general'
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    try {
      // Track newsletter signup
      analytics.trackNewsletterSignup(location);
      
      // Here you would normally send the email to your newsletter service
      // For now, we'll simulate a successful signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Thank you for subscribing! Check your email for confirmation.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        {status === 'success' ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {message}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {description}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder={placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="bg-white dark:bg-gray-800"
              />
              
              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {status === 'loading' ? 'Subscribing...' : buttonText}
              </Button>
            </form>
          </>
        )}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`text-center ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          
          {status === 'success' ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {message}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {description}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder={placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'loading'}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="bg-blue-600 hover:bg-blue-700 px-8"
                  >
                    {status === 'loading' ? 'Subscribing...' : buttonText}
                  </Button>
                </div>
                
                {status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mail className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription className="text-base">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {status === 'success' ? (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {message}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
            />
            
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {status === 'loading' ? 'Subscribing...' : buttonText}
              <Mail className="h-4 w-4 ml-2" />
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}