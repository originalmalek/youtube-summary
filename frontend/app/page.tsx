'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  Play,
  Clock,
  Zap,
  FileText,
  Globe,
  Download,
  Star,
  Check,
  ArrowRight,
  Youtube,
  Sparkles,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { SoftwareApplicationStructuredData, FAQStructuredData } from '@/components/seo/structured-data';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Content Creator",
    content: "This tool has revolutionized how I consume educational content. I can get the key insights from hour-long videos in just minutes!",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Researcher",
    content: "Perfect for academic research. The AI summaries are incredibly accurate and help me quickly identify relevant content.",
    rating: 5
  },
  {
    name: "Emma Davis",
    role: "Student",
    content: "Game-changer for my studies! I can summarize entire lecture series and review them efficiently during exams.",
    rating: 5
  }
];

const features = [
  {
    icon: <Youtube className="h-6 w-6 text-red-500" />,
    title: "YouTube Video Summarizer",
    description: "Instantly transform any YouTube video into concise, intelligent summaries using advanced AI technology."
  },
  {
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    title: "Lightning Fast Processing",
    description: "Get comprehensive summaries in seconds, not hours. Save 90% of your time on content consumption."
  },
  {
    icon: <Globe className="h-6 w-6 text-blue-500" />,
    title: "Multi-Language Support",
    description: "Summarize videos in multiple languages and get summaries in your preferred language."
  },
  {
    icon: <FileText className="h-6 w-6 text-green-500" />,
    title: "Multiple Output Formats",
    description: "Choose from bullet points, detailed summaries, key takeaways, or custom formats that suit your needs."
  },
  {
    icon: <Download className="h-6 w-6 text-purple-500" />,
    title: "Export Anywhere",
    description: "Download summaries as Word documents, HTML files, or copy to your favorite note-taking app."
  },
  {
    icon: <Star className="h-6 w-6 text-orange-500" />,
    title: "Smart Organization",
    description: "Automatically categorize and organize your summaries with our intelligent tagging system."
  }
];

const stats = [
  { number: "10,000+", label: "Videos Summarized" },
  { number: "90%", label: "Time Saved" },
  { number: "4.5/5", label: "User Rating" }
];

const faqs = [
  {
    question: "How accurate are the AI-generated summaries?",
    answer: "Our AI technology achieves 95%+ accuracy in capturing key points and main ideas from videos. The summaries are continuously improved through machine learning."
  },
  {
    question: "What video lengths can you summarize?",
    answer: "We can summarize videos of any length, from short clips to multi-hour lectures. Longer videos may take slightly more time to process."
  },
  {
    question: "Do you support videos in languages other than English?",
    answer: "Yes! We support 10 languages for both input videos and output summaries, including English, Russian, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, and Korean. You can summarize a Spanish video and get the summary in English, for example."
  },
  {
    question: "Can I export summaries to other applications?",
    answer: "Absolutely! You can export summaries as Word documents, HTML files, or copy them directly to your clipboard for use in other apps."
  }
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/create-summary');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading or redirect for authenticated users
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SoftwareApplicationStructuredData />
      <FAQStructuredData faqs={faqs} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-8">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-600">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Video Summarization Tool
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Turn YouTube Videos into{' '}
              <span className="text-blue-600 dark:text-blue-400">Smart Summaries</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Save hours of your time with AI-powered YouTube video summarizer. Get key insights, main points, and actionable takeaways from any video in seconds.
            </p>
            
            <div className="flex gap-4 justify-center flex-col sm:flex-row mb-12">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700">
                  <Play className="h-5 w-5 mr-2" />
                  Start Summarizing Free
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  See How It Works
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                Powerful Features
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need for Video Summarization
              </h2>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Advanced AI technology meets intuitive design to deliver the most comprehensive video summarization experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get intelligent video summaries in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Paste YouTube URL</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply copy and paste any YouTube video URL into our summarizer tool.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our advanced AI analyzes the video content and extracts key insights automatically.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Summary</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive a comprehensive summary with main points, key takeaways, and actionable insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-white dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4">
                <Users className="h-4 w-4 mr-2" />
                Customer Reviews
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Loved by Content Creators & Learners
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                      "{testimonial.content}"
                    </p>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to know about our YouTube summarizer tool
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 dark:bg-blue-700 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Video Learning Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already saving hours with AI-powered video summaries.
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
                  <Play className="h-5 w-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 border-0">
                  Learn More
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
