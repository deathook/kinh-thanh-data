import { getTranslation } from '@/lib/i18n';

interface SmartAppBannerProps {
  currentLang?: string;
}

export default function SmartAppBanner({ currentLang = 'vi' }: SmartAppBannerProps) {
  const t = getTranslation(currentLang);

  return (
    <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-white px-4 py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📱</span>
          <div>
            <p className="font-semibold text-sm leading-tight">
              {t.bannerTitle}
            </p>
            <p className="text-xs text-amber-200/90 mt-0.5">
              {t.bannerSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/app-release.apk"
            download="KinhThanh_v1.1.0.apk"
            className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs px-4 py-2 rounded-full transition-all shadow hover:shadow-lg inline-flex items-center gap-1.5"
          >
            <span>{t.bannerBtn}</span>
            <span>↓</span>
          </a>
        </div>
      </div>
    </div>
  );
}
