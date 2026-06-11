import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { Footer } from "@/components/layout/footer";

import { CookieConsent } from "@/components/layout/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";
import { RouterProvider } from "@/components/providers/router-provider";
import { Toaster } from "@/components/ui/sonner";
import { generateSEOMetadata } from "@/lib/seo";
import { WebsiteStructuredData, OrganizationStructuredData } from "@/components/seo/structured-data";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = generateSEOMetadata({
  title: "Summar.me - AI-Powered Video Summaries",
  description: "Transform long YouTube videos into concise, intelligent summaries powered by AI. Save time and get key insights instantly from any video.",
  keywords: [
    'YouTube summarizer',
    'AI video summary',
    'YouTube summary tool',
    'video to text',
    'YouTube transcript',
    'AI content extraction',
    'video analysis',
    'YouTube automation',
    'content summarization',
    'AI productivity tool'
  ],
  url: '/',
  type: 'website',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Summar.me" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RouterProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <CookieConsent />
            <Toaster />
          </RouterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
