'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true
  analytics: false,
  functional: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      functional: true,
    });
  };

  const rejectOptional = () => {
    savePreferences(defaultPreferences);
  };

  const handleCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-2">
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1">We use cookies</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  We use cookies to improve your experience.{' '}
                  <Link href="/legal/cookies" className="text-primary hover:underline">
                    Learn more
                  </Link>
                </p>
                <div className="flex gap-2">
                  <Button onClick={acceptAll} size="sm" className="h-7 px-3 text-xs">
                    Accept
                  </Button>
                  <Button onClick={() => setShowSettings(true)} variant="outline" size="sm" className="h-7 px-3 text-xs">
                    Settings
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => setShowBanner(false)}
                variant="ghost"
                size="sm"
                className="shrink-0 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Cookie Preferences</h2>
                <Button
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Necessary</h4>
                    <p className="text-xs text-muted-foreground">
                      Required for basic site functionality
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">Always On</div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Analytics</h4>
                    <p className="text-xs text-muted-foreground">
                      Help us understand how you use our site
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => 
                        setPreferences(prev => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      preferences.analytics ? 'bg-primary' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Functional</h4>
                    <p className="text-xs text-muted-foreground">
                      Remember your preferences and settings
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => 
                        setPreferences(prev => ({ ...prev, functional: e.target.checked }))
                      }
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      preferences.functional ? 'bg-primary' : 'bg-gray-300'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                        preferences.functional ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleCustomPreferences} className="flex-1">
                  Save Preferences
                </Button>
                <Button onClick={acceptAll} variant="outline" className="flex-1">
                  Accept All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}