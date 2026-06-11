'use client';

import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      const prefs = JSON.parse(consent);
      setPreferences(prefs);
      setHasConsent(true);
    }
  }, []);

  const canUseAnalytics = () => {
    return hasConsent && preferences?.analytics === true;
  };

  const canUseFunctional = () => {
    return hasConsent && preferences?.functional === true;
  };

  const updatePreferences = (newPrefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(newPrefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setPreferences(newPrefs);
    setHasConsent(true);
  };

  const clearConsent = () => {
    localStorage.removeItem('cookie-consent');
    localStorage.removeItem('cookie-consent-date');
    setPreferences(null);
    setHasConsent(false);
  };

  return {
    preferences,
    hasConsent,
    canUseAnalytics,
    canUseFunctional,
    updatePreferences,
    clearConsent,
  };
}