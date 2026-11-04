'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

export default function LanguagePreferenceSync() {
  const router = useRouter();

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('app_lang');
      if (savedLang && savedLang !== 'vi' && SUPPORTED_LANGUAGES[savedLang]) {
        router.replace(`/${savedLang}`);
      }
    } catch {}
  }, [router]);

  return null;
}
