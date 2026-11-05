'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface AuthModalProps {
  currentLang?: string;
}

export default function AuthModal({ currentLang = 'vi' }: AuthModalProps) {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    isSyncing,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      setAuthModalOpen(false);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Bạn đã đóng cửa sổ đăng nhập.');
      } else if (e?.code === 'auth/unauthorized-domain') {
        setErrorMsg('Tên miền này cần được bật trong cấu hình Firebase Authorized Domains.');
      } else {
        setErrorMsg(e?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu 6 ký tự.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      setAuthModalOpen(false);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === 'auth/user-not-found' || e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential') {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else if (e?.code === 'auth/email-already-in-use') {
        setErrorMsg('Email này đã được đăng ký. Vui lòng chọn Đăng nhập.');
      } else if (e?.code === 'auth/weak-password') {
        setErrorMsg('Mật khẩu quá yếu (tối thiểu 6 ký tự).');
      } else {
        setErrorMsg(e?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isVi = currentLang === 'vi';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white p-6 relative">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full transition cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-800/80 flex items-center justify-center text-2xl shadow-inner mb-3">
            ✝️
          </div>
          <h2 className="text-xl font-bold font-serif leading-tight">
            {isVi ? 'Đăng Nhập & Đồng Bộ Đám Mây' : 'Sign In & Cloud Sync'}
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
            {isVi
              ? 'Lưu trữ ghi chú, câu tô màu & lời cầu nguyện. Tự động đồng bộ với App Android.'
              : 'Sync highlights, personal notes & prayer journal across Web and Android App.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={submitting || isSyncing}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-stone-400 text-stone-800 font-semibold py-3 px-4 rounded-2xl transition shadow-xs cursor-pointer group disabled:opacity-60"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isVi ? 'Đăng nhập nhanh bằng Google' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-xs text-stone-400 uppercase tracking-wider font-semibold absolute">
              {isVi ? 'hoặc dùng Email' : 'or with Email'}
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isVi ? 'Mật khẩu' : 'Password'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-60 text-sm"
            >
              {submitting
                ? isVi ? 'Đang xử lý...' : 'Processing...'
                : mode === 'login'
                ? isVi ? 'Đăng Nhập' : 'Sign In'
                : isVi ? 'Tạo Tài Khoản' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="text-center text-xs text-stone-600 pt-2 border-t border-stone-100">
            {mode === 'login' ? (
              <span>
                {isVi ? 'Chưa có tài khoản? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  {isVi ? 'Đăng ký ngay' : 'Sign up'}
                </button>
              </span>
            ) : (
              <span>
                {isVi ? 'Đã có tài khoản? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  {isVi ? 'Đăng nhập' : 'Sign in'}
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Footer info badge */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>Cloud Firestore Sync</span>
          </span>
          <span>Bảo mật 100%</span>
        </div>
      </div>
    </div>
  );
}
