'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import UserCloudDataModal from '@/components/UserCloudDataModal';
import AccountInfoModal from '@/components/AccountInfoModal';
import PasswordResetModal from '@/components/PasswordResetModal';
import { isValidLang } from '@/lib/i18n';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    const segments = pathname.split('/').filter(Boolean);
    const firstSeg = segments[0];
    if (firstSeg && isValidLang(firstSeg)) {
      document.documentElement.lang = firstSeg;
    } else {
      document.documentElement.lang = 'vi';
    }
  }, [pathname]);

  return (
    <AuthProvider>
      {children}
      <AuthModal />
      <UserCloudDataModal />
      <AccountInfoModal />
      <PasswordResetModal />
    </AuthProvider>
  );
}
