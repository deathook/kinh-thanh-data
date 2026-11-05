import { getTranslation } from '@/lib/i18n';

interface SmartAppBannerProps {
  currentLang?: string;
}

export default function SmartAppBanner({ currentLang = 'vi' }: SmartAppBannerProps) {
  const t = getTranslation(currentLang);

  return (
    <div className="bg-gradient-to-r from-stone-900 via-amber-900 to-stone-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm border-b border-amber-800/40">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4 text-left">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-800/70 border border-amber-600/40 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner">
            📱
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs sm:text-sm leading-tight truncate text-amber-50">
              {t.bannerTitle}
            </p>
            <p className="text-[11px] sm:text-xs text-amber-200/85 mt-0.5 truncate">
              {t.bannerSubtitle}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <a
            href="/app-release.apk"
            download="KinhThanh_v1.1.0.apk"
            className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all shadow-xs hover:shadow inline-flex items-center gap-1 whitespace-nowrap"
          >
            <span>{t.bannerBtn}</span>
            <span>↓</span>
          </a>
        </div>
      </div>
    </div>
  );
}
