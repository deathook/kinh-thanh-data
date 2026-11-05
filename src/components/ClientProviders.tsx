'use client';

import React from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import AuthModal from '@/components/AuthModal';
import UserCloudDataModal from '@/components/UserCloudDataModal';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
      <UserCloudDataModal />
    </AuthProvider>
  );
}
