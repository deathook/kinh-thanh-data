'use client';

import React from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import UserCloudDataModal from '@/components/UserCloudDataModal';
import AccountInfoModal from '@/components/AccountInfoModal';
import PasswordResetModal from '@/components/PasswordResetModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
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
