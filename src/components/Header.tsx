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
        <Link href={homeLink} className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-800 to-stone-900 flex items-center justify-center text-white text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
            ✝️
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-base sm:text-lg text-stone-900 tracking-tight block leading-tight group-hover:text-amber-900 transition-colors">
              {t.siteTitle}
            </span>
            <span className="text-[11px] text-stone-500 font-sans tracking-wide block">
              {cfg.bibleName}
            </span>
          </div>
        </Link>

        {/* Navigation Bar */}
        <nav className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm font-medium">
          <Link
            href={lessonsLink}
            className="text-stone-700 hover:text-amber-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-100 whitespace-nowrap"
          >
            {t.lessons}
          </Link>

          <Link
            href={bibleLink}
            className="hidden sm:inline-flex text-stone-700 hover:text-amber-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-stone-100 whitespace-nowrap"
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
        </nav>
      </div>
    </header>
  );
}
