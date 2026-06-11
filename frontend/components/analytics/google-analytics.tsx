'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  // Use environment variable if measurementId is not provided
  const gaId = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaId) {
    // Don't render analytics in development or if no ID is provided
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    console.warn('Google Analytics measurement ID not found');
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

// Event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_location: url,
      page_title: title,
    });
  }
};

// Predefined event tracking functions
export const analytics = {
  // User registration events
  trackSignUp: (method: string = 'email') => {
    trackEvent('sign_up', { method });
  },

  trackLogin: (method: string = 'email') => {
    trackEvent('login', { method });
  },

  // Summary generation events
  trackSummaryGenerated: (videoLength?: number, format?: string, language?: string) => {
    trackEvent('summary_generated', {
      video_length: videoLength,
      summary_format: format,
      summary_language: language,
    });
  },

  trackSummaryDownloaded: (format: string) => {
    trackEvent('summary_downloaded', { download_format: format });
  },

  trackSummaryShared: (platform?: string) => {
    trackEvent('summary_shared', { platform });
  },

  // Navigation events
  trackPageView: (pageName: string) => {
    trackEvent('page_view', { page_name: pageName });
  },

  // Feature usage
  trackFeatureUsed: (featureName: string, value?: string | number) => {
    trackEvent('feature_used', { 
      feature_name: featureName,
      feature_value: value 
    });
  },

  // Conversion events
  trackSubscription: (plan: string) => {
    trackEvent('purchase', {
      currency: 'USD',
      value: plan === 'pro' ? 9.99 : 19.99,
      items: [{
        item_id: plan,
        item_name: `${plan.toUpperCase()} Plan`,
        category: 'Subscription',
        quantity: 1,
        price: plan === 'pro' ? 9.99 : 19.99,
      }]
    });
  },

  // Engagement events
  trackVideoUrlSubmitted: (source: 'paste' | 'upload') => {
    trackEvent('video_url_submitted', { source });
  },

  trackTimeOnPage: (pageName: string, timeInSeconds: number) => {
    trackEvent('time_on_page', {
      page_name: pageName,
      time_seconds: timeInSeconds
    });
  },

  // Error tracking
  trackError: (errorType: string, errorMessage: string, page?: string) => {
    trackEvent('exception', {
      description: errorMessage,
      error_type: errorType,
      page: page || window.location.pathname,
      fatal: false
    });
  },

  // Search events
  trackSearch: (searchTerm: string, resultCount?: number) => {
    trackEvent('search', {
      search_term: searchTerm,
      result_count: resultCount
    });
  },

  // Social sharing
  trackSocialShare: (platform: string, contentType: string = 'summary') => {
    trackEvent('share', {
      method: platform,
      content_type: contentType,
      item_id: window.location.pathname
    });
  },

  // Newsletter signup
  trackNewsletterSignup: (location: string) => {
    trackEvent('newsletter_signup', { location });
  },

  // Contact form
  trackContactForm: (formType: string) => {
    trackEvent('contact_form_submitted', { form_type: formType });
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void;
  }
}