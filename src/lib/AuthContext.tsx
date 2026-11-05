'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  linkWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import {
  UserCloudData,
  getLocalCloudData,
  subscribeToSyncData,
  syncWithFirebase,
  getLastSyncTime,
  addOrUpdateHighlight,
  deleteHighlight,
  addOrUpdateNote,
  deleteNote,
  addOrUpdatePrayer,
  deletePrayer,
  HighlightRecord,
  NoteRecord,
  PrayerRecord,
} from './cloudSync';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  cloudData: UserCloudData;
  isSyncing: boolean;
  lastSyncFormatted: string;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isUserDataModalOpen: boolean;
  setUserDataModalOpen: (open: boolean) => void;
  isAccountInfoModalOpen: boolean;
  setAccountInfoModalOpen: (open: boolean) => void;
  hasPasswordProvider: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, fullName: string) => Promise<void>;
  resetPasswordWithEmail: (email: string) => Promise<void>;
  updateUserDisplayName: (newName: string) => Promise<void>;
  updateUserPassword: (currentPassword: string | null, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  manualSync: () => Promise<void>;
  addHighlight: (record: HighlightRecord) => void;
  removeHighlight: (verseKey: string) => void;
  saveNote: (record: NoteRecord) => void;
  removeNote: (verseKey: string) => void;
  savePrayer: (prayer: PrayerRecord) => void;
  removePrayer: (id: string | number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userVersion, setUserVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cloudData, setCloudData] = useState<UserCloudData>(getLocalCloudData());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStr, setLastSyncStr] = useState<string | null>(getLastSyncTime());
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isUserDataModalOpen, setUserDataModalOpen] = useState(false);
  const [isAccountInfoModalOpen, setAccountInfoModalOpen] = useState(false);

  // Subscribe to local/cloud data changes
  useEffect(() => {
    const unsub = subscribeToSyncData((newData) => {
      setCloudData(newData);
    });
    return unsub;
  }, []);

  // Sync on login
  const triggerSync = useCallback(async (currentUser: User) => {
    setIsSyncing(true);
    try {
      const synced = await syncWithFirebase(currentUser);
      setCloudData(synced);
      setLastSyncStr(new Date().toISOString());
    } catch (e) {
      console.error('Trigger sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        await triggerSync(currentUser);
      }
    });
    return unsubscribe;
  }, [triggerSync]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        await triggerSync(res.user);
      }
    } catch (err: unknown) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  }, [triggerSync]);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await triggerSync(res.user);
      }
    } catch (err: unknown) {
      console.error('Email Sign In Error:', err);
      throw err;
    }
  }, [triggerSync]);

  const registerWithEmail = useCallback(async (email: string, pass: string, fullName: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        if (fullName.trim()) {
          await updateProfile(res.user, { displayName: fullName.trim() });
        }
        setUserVersion((v) => v + 1);
        await triggerSync(res.user);
      }
    } catch (err: unknown) {
      console.error('Email Register Error:', err);
      throw err;
    }
  }, [triggerSync]);

  const resetPasswordWithEmail = useCallback(async (email: string) => {
    auth.languageCode = 'en'; // Ensure reset email is sent in English
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const updateUserDisplayName = useCallback(async (newName: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Chưa đăng nhập');
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tên hiển thị không được để trống');

    await updateProfile(currentUser, { displayName: trimmed });
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { displayName: trimmed }, { merge: true });
    } catch (e) {
      console.warn('Firestore displayName sync warning:', e);
    }
    setUser(auth.currentUser);
    setUserVersion((v) => v + 1);
  }, []);

  const hasPasswordProvider = useMemo(() => {
    void userVersion;
    if (!user) return false;
    return user.providerData?.some((p) => p.providerId === 'password') ?? false;
  }, [user, userVersion]);

  const updateUserPassword = useCallback(async (currentPassword: string | null, newPassword: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error('Chưa đăng nhập');

    const hasPass = currentUser.providerData?.some((p) => p.providerId === 'password') ?? false;
    if (hasPass) {
      if (!currentPassword) {
        throw new Error('Vui lòng nhập mật khẩu hiện tại.');
      }
      const cred = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, cred);
      await updatePassword(currentUser, newPassword);
    } else {
      // User currently has no password (e.g. signed in via Google only)
      const cred = EmailAuthProvider.credential(currentUser.email, newPassword);
      try {
        await linkWithCredential(currentUser, cred);
      } catch (err: unknown) {
        const e = err as { code?: string };
        if (e?.code === 'auth/provider-already-linked') {
          await updatePassword(currentUser, newPassword);
        } else {
          throw err;
        }
      }
    }
    setUser(auth.currentUser);
    setUserVersion((v) => v + 1);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  }, []);

  const manualSync = useCallback(async () => {
    if (user) {
      await triggerSync(user);
    }
  }, [user, triggerSync]);

  const addHighlight = useCallback((record: HighlightRecord) => {
    addOrUpdateHighlight(user, record);
  }, [user]);

  const removeHighlight = useCallback((verseKey: string) => {
    deleteHighlight(user, verseKey);
  }, [user]);

  const saveNote = useCallback((record: NoteRecord) => {
    addOrUpdateNote(user, record);
  }, [user]);

  const removeNote = useCallback((verseKey: string) => {
    deleteNote(user, verseKey);
  }, [user]);

  const savePrayer = useCallback((prayer: PrayerRecord) => {
    addOrUpdatePrayer(user, prayer);
  }, [user]);

  const removePrayer = useCallback((id: string | number) => {
    deletePrayer(user, id);
  }, [user]);

  const lastSyncFormatted = useMemo(() => {
    if (!lastSyncStr) return 'Chưa đồng bộ';
    try {
      const d = new Date(lastSyncStr);
      return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${d.toLocaleDateString()}`;
    } catch {
      return 'Đã lưu';
    }
  }, [lastSyncStr]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cloudData,
        isSyncing,
        lastSyncFormatted,
        isAuthModalOpen,
        setAuthModalOpen,
        isUserDataModalOpen,
        setUserDataModalOpen,
        isAccountInfoModalOpen,
        setAccountInfoModalOpen,
        hasPasswordProvider,
        signInWithGoogle,
        signInWithEmail,
        registerWithEmail,
        resetPasswordWithEmail,
        updateUserDisplayName,
        updateUserPassword,
        logout,
        manualSync,
        addHighlight,
        removeHighlight,
        saveNote,
        removeNote,
        savePrayer,
        removePrayer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
