import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import SearchModal from './SearchModal';
import UserAuthButton from './UserAuthButton';
import { getTranslation, getLangConfig } from '@/lib/i18n';

interface HeaderProps {
  currentLang?: string;
  bookId?: number;
  chapter?: number;
  bookSlugsByLang?: Record<string, string>;
}

export default function Header({
  currentLang = 'vi',
  bookId,
  chapter,
  bookSlugsByLang,
}: HeaderProps) {
  const t = getTranslation(currentLang);
  const cfg = getLangConfig(currentLang);

  const homeLink = currentLang === 'vi' ? '/' : `/${currentLang}`;
  const bibleLink = `/${currentLang}/kinh-thanh`;
  const lessonsLink = `/${currentLang}/bai-hoc`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href={homeLink} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-800 to-stone-900 flex items-center justify-center text-white text-xl shadow-xs group-hover:scale-105 transition-transform">
            ✝️
          </div>
          <div>
            <span className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight block leading-tight group-hover:text-amber-900 transition-colors">
              {t.siteTitle}
            </span>
            <span className="text-[11px] text-stone-500 font-sans tracking-wide block">
              {cfg.bibleName}
            </span>
          </div>
        </Link>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
          <Link
            href={lessonsLink}
            className="text-stone-700 hover:text-amber-800 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-stone-100"
          >
            <span>{t.lessons}</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
              {t.lessonsBadge}
            </span>
          </Link>

          <Link
            href={bibleLink}
            className="hidden sm:inline-flex text-stone-700 hover:text-amber-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-100"
          >
            {t.readBible}
          </Link>

          {/* Instant Scripture Search */}
          <SearchModal currentLang={currentLang} triggerStyle="header" />

          {/* 12-Language Switcher */}
          <LanguageSwitcher
            currentLang={currentLang}
            bookId={bookId}
            chapter={chapter}
            bookSlugsByLang={bookSlugsByLang}
          />

          {/* User Account & Cloud Sync */}
          <UserAuthButton currentLang={currentLang} />

          <a
            href="/app-release.apk"
            download="KinhThanh_v1.1.0.apk"
            className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-3 sm:px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow inline-flex items-center gap-1.5"
          >
            <span>📱</span>
            <span className="hidden xs:inline">{t.downloadApp}</span>
            <span className="hidden md:inline">v1.1.0</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
