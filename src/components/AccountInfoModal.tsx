'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

interface AccountInfoModalProps {
  currentLang?: string;
}

export default function AccountInfoModal({ currentLang = 'vi' }: AccountInfoModalProps) {
  const {
    user,
    isAccountInfoModalOpen,
    setAccountInfoModalOpen,
    hasPasswordProvider,
    updateUserDisplayName,
    updateUserPassword,
  } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passStatus, setPassStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const isVi = currentLang === 'vi';

  useEffect(() => {
    if (isAccountInfoModalOpen && user) {
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setNameStatus(null);
      setPassStatus(null);
    }
  }, [isAccountInfoModalOpen, user]);

  if (!isAccountInfoModalOpen || !user) return null;

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameStatus(null);
    if (!displayName.trim()) {
      setNameStatus({
        type: 'error',
        text: isVi ? 'Vui lòng nhập tên hiển thị.' : 'Please enter a display name.',
      });
      return;
    }

    setSavingName(true);
    try {
      await updateUserDisplayName(displayName.trim());
      setNameStatus({
        type: 'success',
        text: isVi ? 'Đã cập nhật tên hiển thị thành công!' : 'Display name updated successfully!',
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setNameStatus({
        type: 'error',
        text: error?.message || (isVi ? 'Không thể cập nhật tên hiển thị.' : 'Failed to update display name.'),
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus(null);

    if (hasPasswordProvider && !currentPassword) {
      setPassStatus({
        type: 'error',
        text: isVi ? 'Vui lòng nhập mật khẩu hiện tại.' : 'Please enter your current password.',
      });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPassStatus({
        type: 'error',
        text: isVi ? 'Mật khẩu mới tối thiểu 6 ký tự.' : 'New password must be at least 6 characters.',
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassStatus({
        type: 'error',
        text: isVi ? 'Mật khẩu xác nhận không khớp.' : 'Confirm password does not match.',
      });
      return;
    }

    setSavingPass(true);
    try {
      await updateUserPassword(hasPasswordProvider ? currentPassword : null, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassStatus({
        type: 'success',
        text: isVi ? 'Đã cập nhật mật khẩu thành công!' : 'Password updated successfully!',
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        setPassStatus({
          type: 'error',
          text: isVi ? 'Mật khẩu hiện tại không chính xác.' : 'Current password is incorrect.',
        });
      } else if (error?.code === 'auth/requires-recent-login') {
        setPassStatus({
          type: 'error',
          text: isVi
            ? 'Phiên đăng nhập đã lâu, vui lòng đăng xuất rồi đăng nhập lại để đổi mật khẩu.'
            : 'Please sign in again before changing your password.',
        });
      } else {
        setPassStatus({
          type: 'error',
          text: error?.message || (isVi ? 'Có lỗi xảy ra khi đổi mật khẩu.' : 'Failed to update password.'),
        });
      }
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setAccountInfoModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white p-6 relative">
          <button
            onClick={() => setAccountInfoModalOpen(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full transition cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-800/80 flex items-center justify-center text-2xl shadow-inner shrink-0">
              👤
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold font-serif leading-tight truncate">
                {isVi ? 'Thông Tin Tài Khoản' : 'Account Information'}
              </h2>
              <p className="text-xs text-amber-200/80 mt-0.5 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* 1. Update Display Name */}
          <form onSubmit={handleSaveName} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                {isVi ? 'Đổi Tên Hiển Thị' : 'Display Name'}
              </label>
            </div>

            {nameStatus && (
              <div
                className={`p-2.5 text-xs rounded-xl border ${
                  nameStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {nameStatus.text}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isVi ? 'Nhập họ và tên hiển thị...' : 'Enter display name...'}
                className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
              />
              <button
                type="submit"
                disabled={savingName}
                className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-60 shrink-0"
              >
                {savingName ? (isVi ? 'Đang lưu...' : 'Saving...') : isVi ? 'Lưu tên' : 'Save'}
              </button>
            </div>
          </form>

          <div className="border-t border-stone-200" />

          {/* 2. Change / Set Password */}
          <form onSubmit={handleSavePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                {hasPasswordProvider
                  ? isVi
                    ? 'Thay Đổi Mật Khẩu'
                    : 'Change Password'
                  : isVi
                  ? 'Thiết Lập Mật Khẩu Đăng Nhập'
                  : 'Set Account Password'}
              </label>
              {!hasPasswordProvider && (
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isVi
                    ? 'Tài khoản của bạn hiện chưa có mật khẩu (đăng nhập qua Google). Bạn có thể tạo mật khẩu mới mà không cần mật khẩu hiện tại.'
                    : 'Your account does not have a password yet. You can set a new password directly.'}
                </p>
              )}
            </div>

            {passStatus && (
              <div
                className={`p-2.5 text-xs rounded-xl border ${
                  passStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {passStatus.text}
              </div>
            )}

            {hasPasswordProvider && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {isVi ? 'Mật khẩu hiện tại' : 'Current Password'}
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isVi ? 'Mật khẩu mới' : 'New Password'}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isVi ? 'Tối thiểu 6 ký tự' : 'At least 6 characters'}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {isVi ? 'Nhập lại mật khẩu mới' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-amber-700 focus:ring-2 focus:ring-amber-200 text-sm outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer disabled:opacity-60"
            >
              {savingPass
                ? isVi
                  ? 'Đang cập nhật...'
                  : 'Updating...'
                : isVi
                ? 'Cập Nhật Mật Khẩu'
                : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
