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
  verifyPasswordResetCode,
  confirmPasswordReset,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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
  getUserDocId,
} from './cloudSync';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerData?: Array<{ providerId: string }>;
}

const CUSTOM_SESSION_KEY = 'holy_bible_custom_user_session';

async function sha256Hex(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text + '_bible_salt_2026');
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple fallback if subtle crypto unavailable
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return String(h);
}

interface AuthContextType {
  user: AppUser | null;
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
  requestPasswordResetOtp: (email: string) => Promise<{ codeSent: boolean }>;
  confirmPasswordResetWithOtp: (email: string, code: string, newPassword: string) => Promise<void>;
  confirmPasswordResetWithOobCode: (oobCodeOrLink: string, newPassword: string) => Promise<string>;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [hasPasswordProvider, setHasPasswordProvider] = useState<boolean>(false);
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

  // Inspect Firestore user doc to see if password_hash or displayName exists
  const refreshUserDocMeta = useCallback(async (currentUser: AppUser) => {
    try {
      const docId = getUserDocId(currentUser.email || currentUser.uid);
      const snap = await getDoc(doc(db, 'users', docId));
      const hasFbPass = currentUser.providerData?.some((p) => p.providerId === 'password') ?? false;
      if (snap.exists()) {
        const d = snap.data();
        const hasHash = Boolean(d.password_hash);
        setHasPasswordProvider(hasFbPass || hasHash);
        if (d.displayName && d.displayName !== currentUser.displayName) {
          setUser((prev) => (prev ? { ...prev, displayName: d.displayName } : prev));
        }
      } else {
        setHasPasswordProvider(hasFbPass);
      }
    } catch {
      const hasFbPass = currentUser.providerData?.some((p) => p.providerId === 'password') ?? false;
      setHasPasswordProvider(hasFbPass);
    }
  }, []);

  // Sync on login
  const triggerSync = useCallback(
    async (currentUser: AppUser) => {
      setIsSyncing(true);
      try {
        const synced = await syncWithFirebase(currentUser);
        setCloudData(synced);
        setLastSyncStr(new Date().toISOString());
        await refreshUserDocMeta(currentUser);
      } catch (e) {
        console.error('Trigger sync error:', e);
      } finally {
        setIsSyncing(false);
      }
    },
    [refreshUserDocMeta]
  );

  // Listen to Firebase Auth state OR fallback custom session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        const appU: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          providerData: fbUser.providerData,
        };
        setUser(appU);
        setLoading(false);
        await triggerSync(appU);
      } else {
        // Check if there is a custom email/password session saved
        if (typeof window !== 'undefined') {
          try {
            const rawSession = localStorage.getItem(CUSTOM_SESSION_KEY);
            if (rawSession) {
              const parsed = JSON.parse(rawSession) as AppUser;
              setUser(parsed);
              setLoading(false);
              await triggerSync(parsed);
              return;
            }
          } catch {
            // Ignore
          }
        }
        setUser(null);
        setHasPasswordProvider(false);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [triggerSync]);

  const signInWithGoogle = useCallback(async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_SESSION_KEY);
      }
      const appU: AppUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
        providerData: res.user.providerData,
      };
      setUser(appU);
      await triggerSync(appU);
    }
  }, [triggerSync]);

  const signInWithEmail = useCallback(
    async (email: string, pass: string) => {
      const cleanEmail = email.trim().toLowerCase();
      const passHash = await sha256Hex(pass);
      const docId = getUserDocId(cleanEmail);

      // 1. Try Firebase Auth first
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        if (res.user) {
          // Ensure password_hash is also saved in Firestore
          await setDoc(doc(db, 'users', docId), { password_hash: passHash }, { merge: true });
          return;
        }
      } catch (err: unknown) {
        const e = err as { code?: string };
        // If Email/Password provider is not enabled in Firebase Console OR user set password via Firestore
        if (
          e?.code === 'auth/operation-not-allowed' ||
          e?.code === 'auth/user-not-found' ||
          e?.code === 'auth/invalid-credential' ||
          e?.code === 'auth/wrong-password'
        ) {
          // Check Firestore users/{docId}
          const userSnap = await getDoc(doc(db, 'users', docId));
          if (userSnap.exists()) {
            const data = userSnap.data();
            if (data.password_hash && data.password_hash === passHash) {
              const customUser: AppUser = {
                uid: docId,
                email: cleanEmail,
                displayName: data.displayName || cleanEmail.split('@')[0],
                photoURL: data.photoUrl || null,
                providerData: [{ providerId: 'password' }],
              };
              if (typeof window !== 'undefined') {
                localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(customUser));
              }
              setUser(customUser);
              setHasPasswordProvider(true);
              await triggerSync(customUser);
              return;
            }
          }
          // Throw invalid credential if Firestore hash didn't match
          throw { code: 'auth/invalid-credential', message: 'Email hoặc mật khẩu không chính xác.' };
        }
        throw err;
      }
    },
    [triggerSync]
  );

  const registerWithEmail = useCallback(
    async (email: string, pass: string, fullName: string) => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim() || cleanEmail.split('@')[0];
      const passHash = await sha256Hex(pass);
      const docId = getUserDocId(cleanEmail);

      // Check if already registered in Firestore with a password
      const existingSnap = await getDoc(doc(db, 'users', docId));
      if (existingSnap.exists() && existingSnap.data()?.password_hash) {
        throw { code: 'auth/email-already-in-use', message: 'Email này đã được đăng ký.' };
      }

      // 1. Try Firebase Auth createUserWithEmailAndPassword
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (res.user) {
          await updateProfile(res.user, { displayName: cleanName });
          await setDoc(
            doc(db, 'users', docId),
            {
              email: cleanEmail,
              displayName: cleanName,
              password_hash: passHash,
              provider: 'password',
              updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
          const appU: AppUser = {
            uid: res.user.uid,
            email: cleanEmail,
            displayName: cleanName,
            photoURL: null,
            providerData: res.user.providerData,
          };
          setUser(appU);
          setHasPasswordProvider(true);
          await triggerSync(appU);
          return;
        }
      } catch (err: unknown) {
        const e = err as { code?: string };
        // Fallback if Email/Password provider is not enabled in Firebase Console (auth/operation-not-allowed)
        if (e?.code === 'auth/operation-not-allowed') {
          await setDoc(
            doc(db, 'users', docId),
            {
              email: cleanEmail,
              displayName: cleanName,
              password_hash: passHash,
              provider: 'password',
              updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
          const customUser: AppUser = {
            uid: docId,
            email: cleanEmail,
            displayName: cleanName,
            photoURL: null,
            providerData: [{ providerId: 'password' }],
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(customUser));
          }
          setUser(customUser);
          setHasPasswordProvider(true);
          await triggerSync(customUser);
          return;
        }
        throw err;
      }
    },
    [triggerSync]
  );

  const resetPasswordWithEmail = useCallback(async (email: string) => {
    auth.languageCode = 'en';
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  /**
   * Generate a 6-digit verification code, store in Firestore, and send in English to the user's email
   */
  const requestPasswordResetOtp = useCallback(async (email: string): Promise<{ codeSent: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const docId = getUserDocId(cleanEmail);
    const snap = await getDoc(doc(db, 'users', docId));

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await sha256Hex(otpCode);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await setDoc(
      doc(db, 'users', docId),
      {
        email: cleanEmail,
        reset_otp_hash: otpHash,
        reset_otp_expires: expiresAt,
        reset_requested_at: serverTimestamp(),
      },
      { merge: true }
    );

    // Call our backend API to dispatch the 6-digit code email in English
    let relaySent = false;
    try {
      const apiRes = await fetch('/api/auth/send-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, code: otpCode }),
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        relaySent = Boolean(json.relaySent);
      }
    } catch {
      // Ignore network error
    }

    // Only fall back to Firebase's default reset email if our custom 6-digit SMTP email didn't send
    if (!relaySent) {
      try {
        auth.languageCode = 'en';
        await sendPasswordResetEmail(auth, cleanEmail);
      } catch {
        // Ignore
      }
    }

    void snap;
    return { codeSent: true };
  }, []);

  /**
   * Verify 6-digit OTP code and update password
   */
  const confirmPasswordResetWithOtp = useCallback(
    async (email: string, code: string, newPassword: string) => {
      const cleanEmail = email.trim().toLowerCase();
      const docId = getUserDocId(cleanEmail);
      const snap = await getDoc(doc(db, 'users', docId));

      if (!snap.exists()) {
        throw new Error('Không tìm thấy yêu cầu khôi phục mật khẩu cho email này.');
      }

      const data = snap.data();
      const inputOtpHash = await sha256Hex(code.trim());
      const now = Date.now();

      if (!data.reset_otp_hash || data.reset_otp_hash !== inputOtpHash) {
        throw new Error('Mã xác thực 6 số không chính xác.');
      }

      if (data.reset_otp_expires && now > data.reset_otp_expires) {
        throw new Error('Mã xác thực 6 số đã hết hạn (quá 15 phút). Vui lòng yêu cầu mã mới.');
      }

      const newPassHash = await sha256Hex(newPassword);
      await setDoc(
        doc(db, 'users', docId),
        {
          password_hash: newPassHash,
          reset_otp_hash: null,
          reset_otp_expires: null,
          password_updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
    },
    []
  );

  /**
   * Verify Firebase oobCode (or full reset link pasted from email) and update password in both Firebase Auth & Firestore
   */
  const confirmPasswordResetWithOobCode = useCallback(
    async (oobCodeOrLink: string, newPassword: string): Promise<string> => {
      let cleanCode = oobCodeOrLink.trim();
      // If user pasted the full link from email, extract oobCode parameter
      if (cleanCode.includes('oobCode=')) {
        try {
          const match = cleanCode.match(/[?&]oobCode=([^&\s]+)/);
          if (match && match[1]) {
            cleanCode = decodeURIComponent(match[1]);
          }
        } catch {
          // Ignore
        }
      }

      const verifiedEmail = await verifyPasswordResetCode(auth, cleanCode);
      await confirmPasswordReset(auth, cleanCode, newPassword);

      const newPassHash = await sha256Hex(newPassword);
      const docId = getUserDocId(verifiedEmail);
      await setDoc(
        doc(db, 'users', docId),
        {
          email: verifiedEmail.toLowerCase(),
          password_hash: newPassHash,
          reset_otp_hash: null,
          reset_otp_expires: null,
          password_updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
      return verifiedEmail;
    },
    []
  );

  const updateUserDisplayName = useCallback(
    async (newName: string) => {
      if (!user) throw new Error('Chưa đăng nhập');
      const trimmed = newName.trim();
      if (!trimmed) throw new Error('Tên hiển thị không được để trống');

      // Update Firebase Auth profile if logged in via Firebase
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: trimmed });
        } catch (e) {
          console.warn('Firebase updateProfile warning:', e);
        }
      }

      // Update Firestore user document
      const docId = getUserDocId(user.email || user.uid);
      await setDoc(doc(db, 'users', docId), { displayName: trimmed }, { merge: true });
      if (user.uid && user.uid !== docId) {
        try {
          await setDoc(doc(db, 'users', user.uid), { displayName: trimmed }, { merge: true });
        } catch {
          // Ignore
        }
      }

      const updatedUser: AppUser = { ...user, displayName: trimmed };
      setUser(updatedUser);
      if (typeof window !== 'undefined' && localStorage.getItem(CUSTOM_SESSION_KEY)) {
        localStorage.setItem(CUSTOM_SESSION_KEY, JSON.stringify(updatedUser));
      }
    },
    [user]
  );

  const updateUserPassword = useCallback(
    async (currentPassword: string | null, newPassword: string) => {
      if (!user || !user.email) throw new Error('Chưa đăng nhập');

      const docId = getUserDocId(user.email || user.uid);
      const snap = await getDoc(doc(db, 'users', docId));
      const existingData = snap.exists() ? snap.data() : {};
      const existingHash: string | undefined = existingData?.password_hash;

      // Verify current password if one already exists
      if (hasPasswordProvider) {
        if (!currentPassword) {
          throw new Error('Vui lòng nhập mật khẩu hiện tại.');
        }
        const curHash = await sha256Hex(currentPassword);
        if (existingHash && existingHash !== curHash) {
          throw { code: 'auth/wrong-password', message: 'Mật khẩu hiện tại không chính xác.' };
        }
      }

      const newPassHash = await sha256Hex(newPassword);

      // 1. Always save hashed password in Firestore so it never fails with auth/operation-not-allowed
      await setDoc(
        doc(db, 'users', docId),
        {
          email: user.email.toLowerCase(),
          password_hash: newPassHash,
          password_updated_at: new Date().toISOString(),
        },
        { merge: true }
      );
      if (user.uid && user.uid !== docId) {
        try {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              email: user.email.toLowerCase(),
              password_hash: newPassHash,
              password_updated_at: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Ignore
        }
      }

      // 2. Also attempt to update/link in Firebase Auth if Email/Password provider is enabled
      if (auth.currentUser && auth.currentUser.email) {
        try {
          const fbHasPass = auth.currentUser.providerData?.some((p) => p.providerId === 'password') ?? false;
          if (fbHasPass && currentPassword) {
            const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, cred);
            await updatePassword(auth.currentUser, newPassword);
          } else if (!fbHasPass) {
            const cred = EmailAuthProvider.credential(auth.currentUser.email, newPassword);
            await linkWithCredential(auth.currentUser, cred);
          }
        } catch (err: unknown) {
          const e = err as { code?: string };
          // If Firebase Console hasn't enabled Email/Password (auth/operation-not-allowed), ignore because Firestore hash is already saved!
          if (e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
            throw err;
          }
        }
      }

      setHasPasswordProvider(true);
    },
    [user, hasPasswordProvider]
  );

  const logout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_SESSION_KEY);
      }
      await signOut(auth);
      setUser(null);
      setHasPasswordProvider(false);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  }, []);

  const manualSync = useCallback(async () => {
    if (user) {
      await triggerSync(user);
    }
  }, [user, triggerSync]);

  const addHighlight = useCallback(
    (record: HighlightRecord) => {
      addOrUpdateHighlight(user, record);
    },
    [user]
  );

  const removeHighlight = useCallback(
    (verseKey: string) => {
      deleteHighlight(user, verseKey);
    },
    [user]
  );

  const saveNote = useCallback(
    (record: NoteRecord) => {
      addOrUpdateNote(user, record);
    },
    [user]
  );

  const removeNote = useCallback(
    (verseKey: string) => {
      deleteNote(user, verseKey);
    },
    [user]
  );

  const savePrayer = useCallback(
    (prayer: PrayerRecord) => {
      addOrUpdatePrayer(user, prayer);
    },
    [user]
  );

  const removePrayer = useCallback(
    (id: string | number) => {
      deletePrayer(user, id);
    },
    [user]
  );

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
        requestPasswordResetOtp,
        confirmPasswordResetWithOtp,
        confirmPasswordResetWithOobCode,
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
