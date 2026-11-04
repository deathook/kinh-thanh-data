import Image from 'next/image';
import Link from 'next/link';
import { getAllBooks, getCanonicalSlug } from '@/lib/bible';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import SearchModal from '@/components/SearchModal';
import { getAllDevotionalLessons } from '@/lib/devotionalData';
import { getAllDialogueLessons } from '@/lib/dialogueData';
import { getTranslation, getLangConfig } from '@/lib/i18n';
import { getHomeTranslation } from '@/lib/homeI18n';

interface HomePageViewProps {
  lang?: string;
}

export default function HomePageView({ lang = 'vi' }: HomePageViewProps) {
  const t = getTranslation(lang);
  const cfg = getLangConfig(lang);
  const ht = getHomeTranslation(lang);

  const books = getAllBooks(lang);
  const oldTestament = books.filter((b) => b.testament === 'OT');
  const newTestament = books.filter((b) => b.testament === 'NT');

  const devotionalSample = getAllDevotionalLessons().slice(0, 3);
  const dialogueSample = getAllDialogueLessons().slice(0, 3);

  const johnSlug = getCanonicalSlug(43, lang); // Book 43 is John
  const lessonsLink = `/${lang}/bai-hoc`;
  const john3Link = `/${lang}/kinh-thanh/${johnSlug}/3`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner currentLang={lang} />
      <Header currentLang={lang} />

      {/* ========================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF8F5] border-b border-stone-200/70 pt-16 pb-20 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-950 text-xs font-bold px-4 py-1.5 rounded-full mb-6 border border-amber-300/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{ht.heroBadge}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-stone-950 tracking-tight leading-[1.15] mb-6">
            {ht.heroHeadline1} <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 bg-clip-text text-transparent">
              {ht.heroHeadline2}
            </span>
          </h1>

          <p className="text-stone-600 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            {ht.heroDesc}
          </p>

          {/* Hero Instant Search Bar */}
          <div className="mb-8 max-w-xl mx-auto">
            <SearchModal currentLang={lang} triggerStyle="hero" />
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-12">
            <a
              href="/app-release.apk"
              download="KinhThanh_v1.1.0.apk"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-base px-7 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span className="text-xl">📱</span>
              <div className="text-left">
                <div className="leading-tight">{ht.downloadApkTitle}</div>
                <div className="text-[11px] text-amber-200/90 font-normal">{ht.downloadApkSub}</div>
              </div>
              <span className="text-lg ml-1">↓</span>
            </a>

            <Link
              href={lessonsLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-900 font-bold text-base px-6 py-4 rounded-2xl border-2 border-stone-300 hover:border-amber-700 transition shadow-xs"
            >
              <span>🌱</span>
              <span>{t.lessons} ({t.lessonsBadge})</span>
              <span>→</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xl mb-1">🌍</div>
              <div className="font-bold text-sm text-stone-900">{ht.feature12LangTitle}</div>
              <div className="text-xs text-stone-500">{cfg.localName} ({cfg.bibleName})</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xl mb-1">⚡</div>
              <div className="font-bold text-sm text-stone-900">{ht.featureOfflineTitle}</div>
              <div className="text-xs text-stone-500">{ht.featureOfflineDesc}</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xl mb-1">🎧</div>
              <div className="font-bold text-sm text-stone-900">{ht.featureTtsTitle}</div>
              <div className="text-xs text-stone-500">{ht.featureTtsDesc}</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div className="text-xl mb-1">🕊️</div>
              <div className="font-bold text-sm text-stone-900">{ht.featureNoAdsTitle}</div>
              <div className="text-xs text-stone-500">{ht.featureNoAdsDesc}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* APP SHOWCASE & MOCKUPS GALLERY */}
      {/* ========================================================= */}
      <section className="py-16 px-4 bg-white border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-2">
              {ht.showcaseTag}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
              {ht.showcaseTitle}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base">
              {ht.showcaseDesc}
            </p>
          </div>

          {/* 4 Mockups Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="relative w-full max-w-[220px] rounded-[24px] overflow-hidden mb-4 shadow-lg border-[3px] border-stone-800 bg-stone-900 mx-auto">
                <Image
                  src="/images/mockup-home.jpg"
                  alt={ht.mockupHomeTitle}
                  width={220}
                  height={391}
                  className="w-full h-auto object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">{ht.mockupHomeTitle}</h3>
              <p className="text-xs text-stone-500 text-center leading-relaxed">
                {ht.mockupHomeDesc}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="relative w-full max-w-[220px] rounded-[24px] overflow-hidden mb-4 shadow-lg border-[3px] border-stone-800 bg-stone-900 mx-auto">
                <Image
                  src="/images/mockup-reader.jpg"
                  alt={ht.mockupReaderTitle}
                  width={220}
                  height={391}
                  className="w-full h-auto object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">{ht.mockupReaderTitle}</h3>
              <p className="text-xs text-stone-500 text-center leading-relaxed">
                {ht.mockupReaderDesc}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="relative w-full max-w-[220px] rounded-[24px] overflow-hidden mb-4 shadow-lg border-[3px] border-stone-800 bg-stone-900 mx-auto">
                <Image
                  src="/images/mockup-books.jpg"
                  alt={ht.mockupBooksTitle}
                  width={220}
                  height={391}
                  className="w-full h-auto object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">{ht.mockupBooksTitle}</h3>
              <p className="text-xs text-stone-500 text-center leading-relaxed">
                {ht.mockupBooksDesc}
              </p>
            </div>

            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-stone-200/90 shadow-xs flex flex-col items-center hover:shadow-md transition-shadow">
              <div className="relative w-full max-w-[220px] rounded-[24px] overflow-hidden mb-4 shadow-lg border-[3px] border-stone-800 bg-stone-900 mx-auto">
                <Image
                  src="/images/mockup-settings.jpg"
                  alt={ht.mockupSettingsTitle}
                  width={220}
                  height={391}
                  className="w-full h-auto object-cover"
                />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base mb-1">{ht.mockupSettingsTitle}</h3>
              <p className="text-xs text-stone-500 text-center leading-relaxed">
                {ht.mockupSettingsDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 31 BÀI HỌC TÂM LINH SHOWCASE SECTION */}
      {/* ========================================================= */}
      <section className="py-16 px-4 bg-[#FAF8F5] border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-2">
                {ht.lessonsSectionTag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                {ht.lessonsSectionTitle}
              </h2>
            </div>
            <Link
              href={lessonsLink}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 hover:text-amber-900 hover:underline"
            >
              <span>{ht.lessonsViewAll}</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Track 1: Căn Bản */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    {ht.track1Badge}
                  </span>
                  <span className="text-xs text-stone-400">{ht.track1Focus}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mb-2">
                  {ht.track1Title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
                  {ht.track1Desc}
                </p>

                <div className="space-y-3 mb-6">
                  {devotionalSample.map((l) => {
                    const lessonTitle = lang === 'vi' ? l.titleVi : (l.titleEn || l.titleVi);
                    const topicTitle = lang === 'vi' ? l.topicTitleVi : (l.topicTitleEn || l.topicTitleVi);
                    const dayLabel = lang === 'vi' ? `Bài ${l.dayNumber}` : (lang === 'es' ? `Lección ${l.dayNumber}` : (lang === 'fr' ? `Leçon ${l.dayNumber}` : `Day ${l.dayNumber}`));
                    return (
                      <Link
                        key={l.id}
                        href={`/${lang}/bai-hoc/can-ban/${l.id}`}
                        className="group flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200/70 hover:border-amber-300 transition"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-amber-800">
                            {dayLabel} • {topicTitle}
                          </div>
                          <div className="font-serif font-bold text-stone-900 text-sm group-hover:text-amber-900 transition">
                            {lessonTitle}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-400 group-hover:text-amber-800 transition">
                          {ht.readLessonBtn}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                href={`${lessonsLink}#can-ban`}
                className="w-full text-center bg-stone-100 hover:bg-amber-100 text-stone-900 hover:text-amber-900 text-xs font-bold py-3 rounded-xl transition"
              >
                {ht.track1ViewAll}
              </Link>
            </div>

            {/* Track 2: Nâng Cao */}
            <div className="bg-[#3D251E] text-white rounded-3xl p-6 sm:p-8 border border-amber-900/60 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block bg-[#633C30] text-amber-200 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
                    {ht.track2Badge}
                  </span>
                  <span className="text-xs text-amber-300/80">{ht.track2Focus}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-amber-50 mb-2">
                  {ht.track2Title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-200/90 mb-6 leading-relaxed">
                  {ht.track2Desc}
                </p>

                <div className="space-y-3 mb-6">
                  {dialogueSample.map((l) => {
                    const lessonTitle = lang === 'vi' ? l.titleVi : (l.titleEn || l.titleVi);
                    const stageLabel = lang === 'vi' ? `Chặng ${l.stageNumber} • Bài ${l.lessonNumber}` : (lang === 'es' ? `Etapa ${l.stageNumber} • Lección ${l.lessonNumber}` : `Stage ${l.stageNumber} • Lesson ${l.lessonNumber}`);
                    return (
                      <Link
                        key={l.id}
                        href={`/${lang}/bai-hoc/nang-cao/${l.id}`}
                        className="group flex items-center justify-between p-3 rounded-xl bg-black/25 hover:bg-black/40 border border-amber-500/20 hover:border-amber-400 transition"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-amber-300">
                            {stageLabel}
                          </div>
                          <div className="font-serif font-bold text-amber-50 text-sm group-hover:text-amber-200 transition">
                            {lessonTitle}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-400 group-hover:text-white transition">
                          {ht.readLessonBtn}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link
                href={`${lessonsLink}#nang-cao`}
                className="w-full text-center bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white text-xs font-bold py-3 rounded-xl transition border border-amber-500/30"
              >
                {ht.track2ViewAll}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FEATURED VERSES SECTION */}
      {/* ========================================================= */}
      <section className="py-16 px-4 bg-white border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FAF8F5] border-2 border-amber-200/90 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-3 h-full bg-amber-800" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-wider text-amber-800 uppercase">
                {ht.featuredVerseTag}
              </span>
              <span className="text-xs text-stone-500 font-mono">{cfg.bibleName}</span>
            </div>
            <blockquote className="font-serif text-xl sm:text-2xl text-stone-900 leading-relaxed mb-4">
              {ht.featuredVerseQuote}
            </blockquote>
            <p className="font-sans text-sm text-stone-600 italic mb-6">
              {ht.featuredVerseSecondary}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-stone-200">
              <span className="text-sm font-bold text-stone-800">{ht.featuredVerseRef}</span>
              <Link
                href={`${john3Link}?highlight=16#cau-16`}
                className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-900 hover:underline inline-flex items-center gap-1.5"
              >
                <span>{ht.featuredVerseReadCh}</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 66 BOOKS BROWSER SECTION */}
      {/* ========================================================= */}
      <main id="doc-kinh-thanh" className="flex-1 max-w-6xl w-full mx-auto px-4 py-16 scroll-mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-2">
            {ht.libraryTag} ({cfg.localName})
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
            {t.all66Books} • {cfg.bibleName}
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            {ht.libraryDesc}
          </p>
        </div>

        {/* 1. Cựu Ước (39 Sách) */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-4 border-b border-stone-200 pb-2">
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {t.oldTestament} <span className="text-sm font-sans font-normal text-stone-500">({oldTestament.length})</span>
            </h3>
            <span className="text-xs text-stone-500">{ht.oldTestamentCount}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {oldTestament.map((b) => (
              <Link
                key={b.id}
                href={`/${lang}/kinh-thanh/${b.slug}/1`}
                className="bg-white hover:bg-amber-50/80 border border-stone-200/90 hover:border-amber-400 p-3.5 rounded-2xl transition shadow-2xs hover:shadow-xs group"
              >
                <div className="font-medium text-sm text-stone-900 group-hover:text-amber-900 truncate">
                  {b.name}
                </div>
                <div className="text-[11px] text-stone-400 flex items-center justify-between mt-1.5">
                  <span className="font-mono">{b.code}</span>
                  <span className="font-mono ml-1">{b.chapters} ch</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 2. Tân Ước (27 Sách) */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-amber-800/40 pb-2">
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {t.newTestament} <span className="text-sm font-sans font-normal text-stone-500">({newTestament.length})</span>
            </h3>
            <span className="text-xs text-amber-800 font-semibold">{ht.newTestamentCount}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {newTestament.map((b) => {
              const isRev = b.code === 'REV';

              return (
                <Link
                  key={b.id}
                  href={`/${lang}/kinh-thanh/${b.slug}/1`}
                  className={`p-3.5 rounded-2xl transition shadow-2xs hover:shadow-xs group border ${
                    isRev
                      ? 'bg-amber-50/90 border-amber-400 hover:bg-amber-100 hover:border-amber-600 ring-1 ring-amber-400/60'
                      : 'bg-white hover:bg-amber-50/80 border-stone-200/90 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-medium text-sm text-stone-900 group-hover:text-amber-900 truncate">
                      {b.name}
                    </span>
                    {isRev && (
                      <span className="bg-amber-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                        {ht.book66Badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center justify-between mt-1.5">
                    <span className="font-mono">{b.code}</span>
                    <span className="font-mono ml-1">{b.chapters} ch</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* FINAL DOWNLOAD SECTION */}
      {/* ========================================================= */}
      <section className="bg-stone-900 text-white py-16 px-4 border-t border-stone-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
            ✝️
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3 text-amber-50">
            {ht.finalCtaTitle}
          </h2>
          <p className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            {ht.finalCtaDesc}
          </p>

          <div className="inline-flex flex-col items-center">
            <a
              href="/app-release.apk"
              download="KinhThanh_v1.1.0.apk"
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base px-8 py-4 rounded-2xl shadow-lg transition-all inline-flex items-center gap-3 transform hover:scale-105"
            >
              <span className="text-xl">📥</span>
              <span>{ht.finalCtaBtn}</span>
            </a>
            <div className="text-xs text-stone-400 mt-3">
              {ht.finalCtaSub}
            </div>
          </div>
        </div>
      </section>

      <Footer currentLang={lang} />
    </div>
  );
}
