'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { analytics } from '@/components/analytics/google-analytics';

interface DemoRequestProps {
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  teamSize: string;
  useCase: string;
  message: string;
}

export function DemoRequest({ className = '' }: DemoRequestProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    teamSize: '',
    useCase: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.company) {
      setStatus('error');
      setMessage('Please fill in all required fields.');
      return;
    }

    if (!formData.email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    try {
      // Track demo request
      analytics.trackContactForm('demo_request');
      
      // Here you would normally send the data to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('success');
      setMessage('Thank you for your interest! We\'ll be in touch within 24 hours to schedule your personalized demo.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        role: '',
        teamSize: '',
        useCase: '',
        message: ''
      });
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again or contact us directly.');
    }
  };

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-xl">Request a Personalized Demo</CardTitle>
        </div>
        <CardDescription className="text-base">
          See how YouTube Summary can transform your team's content consumption workflow. 
          Get a tailored demonstration of our enterprise features.
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Work Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Role
                </label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={status === 'loading'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO/Founder</SelectItem>
                    <SelectItem value="cto">CTO/Tech Lead</SelectItem>
                    <SelectItem value="product">Product Manager</SelectItem>
                    <SelectItem value="education">Education/Training</SelectItem>
                    <SelectItem value="research">Research & Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Team Size
                </label>
                <Select 
                  value={formData.teamSize} 
                  onValueChange={(value) => handleInputChange('teamSize', value)}
                  disabled={status === 'loading'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 people</SelectItem>
                    <SelectItem value="11-50">11-50 people</SelectItem>
                    <SelectItem value="51-200">51-200 people</SelectItem>
                    <SelectItem value="201-1000">201-1000 people</SelectItem>
                    <SelectItem value="1000+">1000+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Use Case
                </label>
                <Select 
                  value={formData.useCase} 
                  onValueChange={(value) => handleInputChange('useCase', value)}
                  disabled={status === 'loading'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee-training">Employee Training</SelectItem>
                    <SelectItem value="research">Research & Analysis</SelectItem>
                    <SelectItem value="content-creation">Content Creation</SelectItem>
                    <SelectItem value="education">Educational Institution</SelectItem>
                    <SelectItem value="market-research">Market Research</SelectItem>
                    <SelectItem value="competitive-analysis">Competitive Analysis</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tell us about your specific needs (Optional)
              </label>
              <Textarea
                id="message"
                placeholder="What challenges are you trying to solve? What features are most important to your team?"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                disabled={status === 'loading'}
                rows={4}
              />
            </div>
            
            {status === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              {status === 'loading' ? 'Submitting Request...' : 'Schedule My Demo'}
              <Calendar className="h-5 w-5 ml-2" />
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll respond within 24 hours. No spam, ever.
              </p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}