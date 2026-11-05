'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';

interface UserAuthButtonProps {
  currentLang?: string;
}

export default function UserAuthButton({ currentLang = 'vi' }: UserAuthButtonProps) {
  const {
    user,
    cloudData,
    loading,
    isSyncing,
    lastSyncFormatted,
    setAuthModalOpen,
    setUserDataModalOpen,
    logout,
    manualSync,
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isVi = currentLang === 'vi';

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-stone-100 animate-pulse border border-stone-200" />
    );
  }

  // Not logged in
  if (!user) {
    return (
      <button
        onClick={() => setAuthModalOpen(true)}
        className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
        title={isVi ? 'Đăng nhập Google / Email để đồng bộ' : 'Sign in to sync'}
      >
        <span className="text-sm">👤</span>
        <span className="hidden xs:inline">{isVi ? 'Đăng nhập' : 'Sign In'}</span>
      </button>
    );
  }

  // Logged in
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-stone-100 border border-transparent hover:border-stone-200 transition cursor-pointer"
      >
        {user.photoURL ? (
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden ring-2 ring-amber-700/60 shadow-2xs">
            <Image
              src={user.photoURL}
              alt={displayName}
              width={32}
              height={32}
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs ring-2 ring-amber-700/40">
            {initial}
          </div>
        )}
        <span className="hidden md:inline-block text-xs font-semibold text-stone-800 max-w-[100px] truncate">
          {displayName}
        </span>
        <span className="text-[9px] text-stone-500 hidden sm:inline">▼</span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-stone-800">
          {/* User Profile Header */}
          <div className="px-4 py-2.5 border-b border-stone-100">
            <div className="font-bold text-sm text-stone-900 truncate">{displayName}</div>
            <div className="text-xs text-stone-500 truncate">{user.email}</div>
            <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span>☁️</span>
                <span>{isSyncing ? (isVi ? 'Đang đồng bộ...' : 'Syncing...') : lastSyncFormatted}</span>
              </span>
              <button
                onClick={manualSync}
                disabled={isSyncing}
                className="text-amber-800 hover:text-amber-950 font-bold hover:underline cursor-pointer disabled:opacity-50"
                title="Đồng bộ ngay"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Quick Nav to Cloud Data */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setUserDataModalOpen(true);
              }}
              className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>🖍️</span>
                <span>{isVi ? 'Câu tô màu & Ghi chú' : 'Highlights & Notes'}</span>
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {cloudData.highlights.length + cloudData.notes.length}
              </span>
            </button>

            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setUserDataModalOpen(true);
              }}
              className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-stone-50 flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span>🙏</span>
                <span>{isVi ? 'Nhật ký Cầu nguyện' : 'Prayer Journal'}</span>
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {cloudData.prayers.length}
              </span>
            </button>
          </div>

          <div className="border-t border-stone-100 my-1" />

          {/* Sign Out Button */}
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
          >
            <span>🚪</span>
            <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
