'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface AuthModalProps {
  currentLang?: string;
}

interface CaptchaChallenge {
  a: number;
  b: number;
  op: '+' | '×';
  answer: number;
}

function generateCaptcha(): CaptchaChallenge {
  const useMultiply = Math.random() > 0.65;
  if (useMultiply) {
    const a = Math.floor(Math.random() * 8) + 2; // 2..9
    const b = Math.floor(Math.random() * 5) + 2; // 2..6
    return { a, b, op: '×', answer: a * b };
  } else {
    const a = Math.floor(Math.random() * 15) + 3; // 3..17
    const b = Math.floor(Math.random() * 12) + 2; // 2..13
    return { a, b, op: '+', answer: a + b };
  }
}

export default function AuthModal({ currentLang = 'vi' }: AuthModalProps) {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    resetPasswordWithEmail,
    isSyncing,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Anti-spam Captcha & Cooldown state
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [honeypot, setHoneypot] = useState(''); // Hidden field for bots
  const [resetCooldown, setResetCooldown] = useState(0);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput('');
  }, []);

  useEffect(() => {
    if (isAuthModalOpen) {
      refreshCaptcha();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, mode, refreshCaptcha]);

  // Countdown timer for password reset rate-limit
  useEffect(() => {
    if (resetCooldown <= 0) return;
    const timer = setInterval(() => {
      setResetCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resetCooldown]);

  if (!isAuthModalOpen) return null;

  const isVi = currentLang === 'vi';

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      setAuthModalOpen(false);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e?.code === 'auth/popup-closed-by-user') {
        setErrorMsg(isVi ? 'Bạn đã đóng cửa sổ đăng nhập.' : 'Sign-in popup closed.');
      } else if (e?.code === 'auth/unauthorized-domain') {
        setErrorMsg(
          isVi
            ? 'Tên miền này cần được bật trong cấu hình Firebase Authorized Domains.'
            : 'This domain must be enabled in Firebase Authorized Domains.'
        );
      } else {
        setErrorMsg(e?.message || (isVi ? 'Đăng nhập Google thất bại. Vui lòng thử lại.' : 'Google sign-in failed.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Honeypot bot check
    if (honeypot.trim() !== '') {
      return;
    }

    if (mode === 'forgot') {
      if (resetCooldown > 0) {
        setErrorMsg(
          isVi
            ? `Vui lòng đợi ${resetCooldown} giây trước khi gửi lại yêu cầu.`
            : `Please wait ${resetCooldown}s before sending another request.`
        );
        return;
      }

      if (!email.trim()) {
        setErrorMsg(isVi ? 'Vui lòng nhập địa chỉ email của tài khoản.' : 'Please enter your account email.');
        return;
      }

      // Verify Captcha
      if (parseInt(captchaInput.trim(), 10) !== captcha.answer) {
        setErrorMsg(isVi ? 'Mã xác thực Captcha không đúng. Vui lòng tính lại!' : 'Incorrect Captcha answer. Please try again!');
        refreshCaptcha();
        return;
      }

      setSubmitting(true);
      try {
        await resetPasswordWithEmail(email.trim());
        setResetCooldown(60); // 60s anti-spam cooldown
        refreshCaptcha();
        setSuccessMsg(
          isVi
            ? `Đã gửi email khôi phục mật khẩu (bằng Tiếng Anh) tới ${email.trim()}. Vui lòng mở email và bấm vào đường link để đặt lại mật khẩu mới.`
            : `Password reset link (in English) has been sent to ${email.trim()}. Please open the email and click the link to set a new password.`
        );
      } catch (err: unknown) {
        refreshCaptcha();
        const error = err as { code?: string; message?: string };
        if (error?.code === 'auth/user-not-found') {
          setErrorMsg(isVi ? 'Không tìm thấy tài khoản với email này.' : 'No account found with this email.');
        } else if (error?.code === 'auth/invalid-email') {
          setErrorMsg(isVi ? 'Địa chỉ email không hợp lệ.' : 'Invalid email address.');
        } else if (error?.code === 'auth/too-many-requests') {
          setErrorMsg(isVi ? 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.' : 'Too many requests. Please try again later.');
        } else {
          setErrorMsg(error?.message || (isVi ? 'Không thể gửi email khôi phục, vui lòng thử lại.' : 'Failed to send reset email.'));
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMsg(isVi ? 'Vui lòng nhập họ và tên.' : 'Please enter your full name.');
        return;
      }
      if (!email.trim() || !password) {
        setErrorMsg(isVi ? 'Vui lòng điền đầy đủ email và mật khẩu.' : 'Please enter email and password.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg(isVi ? 'Mật khẩu tối thiểu 6 ký tự.' : 'Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg(isVi ? 'Mật khẩu nhập lại không khớp.' : 'Passwords do not match.');
        return;
      }
      // Verify Captcha on registration to prevent spam accounts
      if (parseInt(captchaInput.trim(), 10) !== captcha.answer) {
        setErrorMsg(isVi ? 'Mã xác thực Captcha không đúng. Vui lòng tính lại!' : 'Incorrect Captcha answer. Please try again!');
        refreshCaptcha();
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMsg(isVi ? 'Vui lòng điền đầy đủ email và mật khẩu.' : 'Please enter email and password.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg(isVi ? 'Mật khẩu tối thiểu 6 ký tự.' : 'Password must be at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, fullName.trim());
      }
      setAuthModalOpen(false);
    } catch (err: unknown) {
      if (mode === 'register') refreshCaptcha();
      const error = err as { code?: string; message?: string };
      if (
        error?.code === 'auth/user-not-found' ||
        error?.code === 'auth/wrong-password' ||
        error?.code === 'auth/invalid-credential'
      ) {
        setErrorMsg(isVi ? 'Email hoặc mật khẩu không chính xác.' : 'Incorrect email or password.');
      } else if (error?.code === 'auth/email-already-in-use') {
        setErrorMsg(isVi ? 'Email này đã được đăng ký. Vui lòng chọn Đăng nhập.' : 'Email already in use.');
      } else if (error?.code === 'auth/weak-password') {
        setErrorMsg(isVi ? 'Mật khẩu quá yếu (tối thiểu 6 ký tự).' : 'Password is too weak (min 6 characters).');
      } else {
        setErrorMsg(error?.message || (isVi ? 'Có lỗi xảy ra, vui lòng thử lại.' : 'An error occurred, please try again.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
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
            {mode === 'forgot' ? '🔑' : '✝️'}
          </div>
          <h2 className="text-xl font-bold font-serif leading-tight">
            {mode === 'forgot'
              ? isVi
                ? 'Quên Mật Khẩu'
                : 'Forgot Password'
              : mode === 'register'
              ? isVi
                ? 'Tạo Tài Khoản Mới'
                : 'Create Account'
              : isVi
              ? 'Đăng Nhập & Đồng Bộ Đám Mây'
              : 'Sign In & Cloud Sync'}
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
            {mode === 'forgot'
              ? isVi
                ? 'Nhập email tài khoản của bạn. Hệ thống sẽ gửi một email (bằng Tiếng Anh) chứa đường link để bạn bấm vào và đặt lại mật khẩu mới.'
                : 'Enter your email address. We will send an email in English with a link to reset your password.'
              : isVi
              ? 'Lưu trữ ghi chú, câu tô màu & lời cầu nguyện. Tự động đồng bộ với App Android.'
              : 'Sync highlights, personal notes & prayer journal across Web and Android App.'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
              <span className="shrink-0">✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              {/* 1-Click Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={submitting || isSyncing}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border-2 border-stone-300 hover:border-stone-400 text-stone-800 font-semibold py-2.5 px-4 rounded-2xl transition shadow-xs cursor-pointer group disabled:opacity-60"
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

              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-stone-200 w-full" />
                <span className="bg-white px-3 text-xs text-stone-400 uppercase tracking-wider font-semibold absolute">
                  {isVi ? 'hoặc dùng Email' : 'or with Email'}
                </span>
              </div>
            </>
          )}

          {/* Email / Password / Register / Forgot Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {/* Hidden Honeypot against automated bots */}
            <input
              type="text"
              name="website_url_hp"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isVi ? 'Họ và tên' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isVi ? 'Nguyễn Văn A' : 'Your full name'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {mode === 'forgot'
                  ? isVi
                    ? 'Email tài khoản cần khôi phục'
                    : 'Account Email'
                  : 'Email'}
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

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    {isVi ? 'Mật khẩu' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
                    >
                      {isVi ? 'Quên mật khẩu?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
                />
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isVi ? 'Nhập lại mật khẩu' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
                />
              </div>
            )}

            {/* Anti-spam Captcha Widget for Forgot Password & Registration */}
            {(mode === 'forgot' || mode === 'register') && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>{isVi ? 'Xác thực chống Spam (Captcha):' : 'Anti-spam Captcha:'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-[11px] text-amber-800 hover:underline font-semibold cursor-pointer"
                    title={isVi ? 'Đổi phép tính khác' : 'Refresh Captcha'}
                  >
                    🔄 {isVi ? 'Đổi mã' : 'Refresh'}
                  </button>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="px-3.5 py-2 rounded-lg bg-stone-900 text-amber-300 font-mono font-bold text-sm tracking-widest select-none shadow-inner shrink-0">
                    {captcha.a} {captcha.op} {captcha.b} = ?
                  </div>
                  <input
                    type="number"
                    required
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder={isVi ? 'Nhập kết quả...' : 'Result...'}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (mode === 'forgot' && resetCooldown > 0)}
              className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-60 text-sm mt-1"
            >
              {submitting
                ? isVi
                  ? 'Đang xử lý...'
                  : 'Processing...'
                : mode === 'forgot'
                ? resetCooldown > 0
                  ? isVi
                    ? `Gửi lại sau (${resetCooldown}s)`
                    : `Resend in (${resetCooldown}s)`
                  : isVi
                  ? 'Gửi Link Đặt Lại Mật Khẩu'
                  : 'Send Password Reset Link'
                : mode === 'login'
                ? isVi
                  ? 'Đăng Nhập'
                  : 'Sign In'
                : isVi
                ? 'Tạo Tài Khoản'
                : 'Create Account'}
            </button>
          </form>

          {/* Toggle Login / Register / Forgot */}
          <div className="text-center text-xs text-stone-600 pt-2 border-t border-stone-100">
            {mode === 'login' ? (
              <span>
                {isVi ? 'Chưa có tài khoản? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  {isVi ? 'Đăng ký ngay' : 'Sign up'}
                </button>
              </span>
            ) : (
              <span>
                {isVi ? 'Đã nhớ mật khẩu? ' : 'Remembered your password? '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  {isVi ? 'Quay lại Đăng nhập' : 'Back to Sign in'}
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
