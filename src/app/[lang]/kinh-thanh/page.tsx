import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllBooks } from '@/lib/bible';
import { isValidLang, getLangConfig, getTranslation } from '@/lib/i18n';
import { getHomeTranslation } from '@/lib/homeI18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return { title: 'Language Not Supported' };

  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);

  return {
    title: `${t.readBible} - ${t.all66Books} (${cfg.bibleName})`,
    description: `${t.readBible} ${cfg.bibleName} - ${cfg.localName}. ${t.oldTestament} & ${t.newTestament}.`,
  };
}

export default async function BibleDirectoryPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isValidLang(lang)) {
    notFound();
  }

  const books = getAllBooks(lang);
  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);
  const ht = getHomeTranslation(lang);

  const oldTestament = books.filter((b) => b.testament === 'OT');
  const newTestament = books.filter((b) => b.testament === 'NT');

  const readNowLabel = lang === 'vi' ? 'Đọc ngay →' : (lang === 'es' ? 'Leer ahora →' : (lang === 'fr' ? 'Lire maintenant →' : 'Read now →'));
  const part1Label = lang === 'vi' ? 'Phần 1' : (lang === 'es' ? 'Parte 1' : (lang === 'fr' ? 'Partie 1' : 'Part 1'));
  const part2Label = lang === 'vi' ? 'Phần 2' : (lang === 'es' ? 'Parte 2' : (lang === 'fr' ? 'Partie 2' : 'Part 2'));

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner currentLang={lang} />
      <Header currentLang={lang} />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-stone-200/80 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
            <span>{cfg.flag}</span>
            <span>{cfg.bibleName} • {t.all66Books}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight mb-3">
            {t.readBible} ({cfg.localName})
          </h1>

          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
            {ht.libraryDesc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <a
              href="#cuu-uoc"
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 py-2 rounded-full shadow-2xs transition"
            >
              📜 {t.oldTestament} ({oldTestament.length})
            </a>
            <a
              href="#tan-uoc"
              className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-full shadow-xs transition"
            >
              ✝️ {t.newTestament} ({newTestament.length})
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-14">
        {/* ========================================================= */}
        {/* 1. CỰU ƯỚC (39 SÁCH) */}
        {/* ========================================================= */}
        <section id="cuu-uoc" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-5 border-b-2 border-stone-300 pb-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {part1Label}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {t.oldTestament} <span className="text-sm font-sans font-normal text-stone-500">({oldTestament.length})</span>
              </h2>
            </div>
            <span className="text-xs text-stone-500">{ht.oldTestamentCount}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {oldTestament.map((b) => (
              <Link
                key={b.id}
                href={`/${lang}/kinh-thanh/${b.slug}/1`}
                className="bg-white hover:bg-amber-50/80 border border-stone-200/90 hover:border-amber-400 p-3.5 rounded-2xl transition shadow-2xs hover:shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-900 truncate">
                    {b.name}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
                    <span className="font-mono">{b.code}</span>
                    <span className="font-mono">{b.chapters} ch</span>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                  {readNowLabel}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. TÂN ƯỚC (27 SÁCH) */}
        {/* ========================================================= */}
        <section id="tan-uoc" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-5 border-b-2 border-amber-800/40 pb-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {part2Label}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {t.newTestament} <span className="text-sm font-sans font-normal text-stone-500">({newTestament.length})</span>
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-semibold">{ht.newTestamentCount}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {newTestament.map((b) => {
              const isRev = b.code === 'REV';

              return (
                <Link
                  key={b.id}
                  href={`/${lang}/kinh-thanh/${b.slug}/1`}
                  className={`p-3.5 rounded-2xl transition shadow-2xs hover:shadow-xs group flex flex-col justify-between border ${
                    isRev
                      ? 'bg-amber-50/90 border-amber-400 hover:bg-amber-100 hover:border-amber-600 ring-1 ring-amber-400/60'
                      : 'bg-white hover:bg-amber-50/80 border-stone-200/90 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-900 truncate">
                        {b.name}
                      </span>
                      {isRev && (
                        <span className="bg-amber-700 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                          {ht.book66Badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
                      <span className="font-mono">{b.code}</span>
                      <span className="font-mono">{b.chapters} ch</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    {readNowLabel}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <Footer currentLang={lang} />
    </div>
  );
}
