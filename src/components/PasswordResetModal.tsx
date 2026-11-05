'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthModalOpen, confirmPasswordResetWithOobCode } = useAuth();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [isOpen, setIsOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'resetPassword' && oobCode) {
      setIsOpen(true);
      setVerifying(true);
      setErrorMsg(null);
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setTargetEmail(email);
          setVerifying(false);
        })
        .catch(() => {
          setVerifying(false);
          setErrorMsg(
            'Đường dẫn khôi phục mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu gửi lại email mới.'
          );
        });
    } else {
      setIsOpen(false);
    }
  }, [mode, oobCode]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      url.searchParams.delete('oobCode');
      url.searchParams.delete('apiKey');
      url.searchParams.delete('lang');
      router.replace(url.pathname + url.search);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);
    try {
      await confirmPasswordResetWithOobCode(oobCode, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'auth/expired-action-code' || error?.code === 'auth/invalid-action-code') {
        setErrorMsg('Đường dẫn đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu lại.');
      } else if (error?.code === 'auth/weak-password') {
        setErrorMsg('Mật khẩu quá yếu (tối thiểu 6 ký tự).');
      } else {
        setErrorMsg(error?.message || 'Không thể đặt lại mật khẩu, vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full transition cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
          <div className="w-12 h-12 rounded-2xl bg-amber-800/80 flex items-center justify-center text-2xl shadow-inner mb-3">
            🔐
          </div>
          <h2 className="text-xl font-bold font-serif leading-tight">
            Đặt Lại Mật Khẩu Mới
          </h2>
          {targetEmail && (
            <p className="text-xs text-amber-200/80 mt-1 truncate">
              Tài khoản: {targetEmail}
            </p>
          )}
        </div>

        <div className="p-6 space-y-4">
          {verifying ? (
            <div className="py-8 text-center text-sm text-stone-600">
              ⏳ Đang kiểm tra mã xác thực từ email...
            </div>
          ) : success ? (
            <div className="space-y-4 text-center py-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl">
                ✅ Đã thay đổi mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng mật khẩu mới trên cả Website và Ứng dụng.
              </div>
              <button
                onClick={() => {
                  handleClose();
                  setAuthModalOpen(true);
                }}
                className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-sm"
              >
                Đăng Nhập Ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmReset} className="space-y-3.5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                  <span className="shrink-0">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {targetEmail && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mật khẩu mới
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nhập lại mật khẩu mới
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-60 text-sm"
                  >
                    {submitting ? 'Đang lưu...' : 'Xác Nhận Đổi Mật Khẩu'}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PasswordResetModal() {
  return (
    <Suspense fallback={null}>
      <PasswordResetContent />
    </Suspense>
  );
}
