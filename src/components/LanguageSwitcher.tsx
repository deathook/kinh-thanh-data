'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LANGUAGES, LANGUAGE_LIST } from '@/lib/i18n';

interface LanguageSwitcherProps {
  currentLang: string;
  bookId?: number;
  chapter?: number;
  bookSlugsByLang?: Record<string, string>;
}

export default function LanguageSwitcher({
  currentLang,
  bookId,
  chapter,
  bookSlugsByLang,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentConfig = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.vi;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (targetCode: string) => {
    setIsOpen(false);
    if (targetCode === currentLang) return;

    // If on chapter reading page
    if (chapter && bookSlugsByLang && bookSlugsByLang[targetCode]) {
      const targetSlug = bookSlugsByLang[targetCode];
      router.push(`/${targetCode}/kinh-thanh/${targetSlug}/${chapter}`);
      return;
    }

    // Default: switch to that language's reading chapter (e.g. John 3) or home
    if (targetCode === 'vi') {
      router.push('/vi/kinh-thanh/giang/3');
    } else {
      router.push(`/${targetCode}/kinh-thanh/john/3`);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-800 transition-all shadow-2xs cursor-pointer"
        title="Chuyển đổi ngôn ngữ / Switch language"
      >
        <span className="text-sm">{currentConfig.flag}</span>
        <span className="hidden sm:inline">{currentConfig.localName}</span>
        <span className="text-[10px] text-stone-500">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-stone-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 mb-1">
            Chọn Ngôn Ngữ / Languages
          </div>

          <div className="space-y-0.5 px-1">
            {LANGUAGE_LIST.map((lang) => {
              const isSelected = lang.code === currentLang;

              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100/70 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <div className="leading-tight">{lang.localName}</div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        {lang.bibleName}
                      </div>
                    </div>
                  </div>

                  {isSelected && <span className="text-amber-800 text-sm">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
