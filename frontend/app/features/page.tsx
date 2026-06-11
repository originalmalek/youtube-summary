import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Youtube, 
  Zap, 
  Globe, 
  FileText, 
  Download, 
  Brain,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { generateDynamicSEO } from '@/lib/seo';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { SoftwareApplicationStructuredData } from '@/components/seo/structured-data';

export const metadata: Metadata = generateDynamicSEO('features');

const coreFeatures = [
  {
    icon: <Youtube className="h-8 w-8 text-red-500" />,
    title: "Universal YouTube Compatibility",
    description: "Works with any YouTube video - from short clips to multi-hour lectures, documentaries, and live streams.",
    benefits: [
      "Support for all video lengths",
      "Works with private and unlisted videos",
      "Handles multiple languages automatically",
      "Compatible with YouTube Shorts and regular videos"
    ]
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-500" />,
    title: "Advanced AI Processing",
    description: "Powered by state-of-the-art language models that understand context, nuance, and key concepts.",
    benefits: [
      "95%+ accuracy in content extraction",
      "Context-aware summarization",
      "Identifies key themes and concepts",
      "Maintains original video tone and style"
    ]
  },
  {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "Lightning-Fast Processing",
    description: "Get comprehensive summaries in seconds, not minutes. Our optimized AI pipeline ensures rapid results.",
    benefits: [
      "Average processing time: 10-30 seconds",
      "Real-time progress tracking",
      "Batch processing for multiple videos",
      "Priority processing for premium users"
    ]
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-500" />,
    title: "Multi-Language Support",
    description: "Summarize videos in 10+ languages and get outputs in your preferred language.",
    benefits: [
      "Auto-detect video language",
      "Translate summaries to any supported language",
      "Preserve technical terms and proper nouns",
      "Cultural context awareness"
    ]
  },
  {
    icon: <FileText className="h-8 w-8 text-green-500" />,
    title: "Multiple Output Formats",
    description: "Choose from various summary formats tailored to your specific needs and preferences.",
    benefits: [
      "Bullet points for quick scanning",
      "Detailed paragraphs for comprehensive understanding",
      "Key takeaways for actionable insights",
      "Timeline format for chronological content"
    ]
  },
  {
    icon: <Download className="h-8 w-8 text-indigo-500" />,
    title: "Export & Integration",
    description: "Export summaries to your favorite tools and platforms with one click.",
    benefits: [
      "Word document and HTML export",
      "Copy to clipboard functionality",
      "Direct integration with note-taking apps",
      "Easy sharing with team members"
    ]
  }
];


const useCases = [
  {
    title: "Students & Researchers",
    description: "Quickly extract key information from educational videos, lectures, and research presentations.",
    icon: "🎓"
  },
  {
    title: "Content Creators",
    description: "Analyze competitor content, research trends, and create content briefs from video inspiration.",
    icon: "📹"
  },
  {
    title: "Business Professionals",
    description: "Stay updated with industry trends, conference talks, and training materials efficiently.",
    icon: "💼"
  },
  {
    title: "Language Learners",
    description: "Understand video content in foreign languages and improve comprehension skills.",
    icon: "🌍"
  }
];

export default function Features() {
  return (
    <>
      <SoftwareApplicationStructuredData />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs items={[{ name: 'Features', url: '/features' }]} />
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-600">
              <Star className="h-4 w-4 mr-2" />
              Comprehensive Feature Set
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for{' '}
              <span className="text-blue-600 dark:text-blue-400">Smart Video Summarization</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover all the advanced capabilities that make our YouTube summarizer the most comprehensive tool for extracting insights from video content.
            </p>
            
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Try All Features Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Core Features */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Core Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Essential capabilities that power intelligent video summarization
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {coreFeatures.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>


          {/* Use Cases */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Perfect for Every Use Case
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Discover how different professionals and learners benefit from our platform
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {useCases.map((useCase, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                      {useCase.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {useCase.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>


          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience All Features?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your free trial today and discover how our comprehensive feature set can transform your video learning experience.
            </p>
            <div className="flex gap-4 justify-center flex-col sm:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4">
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 border-0">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}