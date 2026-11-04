import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllBooks } from '@/lib/bible';
import { isValidLang, getLangConfig, getTranslation, SUPPORTED_LANGUAGES } from '@/lib/i18n';
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
    title: `${t.readBible} - 66 Sách Kinh Thánh (${cfg.bibleName})`,
    description: `Khám phá và đọc trọn bộ 66 sách Cựu Ước và Tân Ước (từ Sáng thế Ký đến Khải Huyền) bản dịch ${cfg.bibleName} với giọng đọc trực tuyến.`,
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

  // Chronological Biblical order: Cựu Ước (OT) first, Tân Ước (NT) second
  const oldTestament = books.filter((b) => b.testament === 'OT');
  const newTestament = books.filter((b) => b.testament === 'NT');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner currentLang={lang} />
      <Header currentLang={lang} />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-stone-200/80 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
            <span>{cfg.flag}</span>
            <span>{cfg.bibleName} • Trọn Bộ 66 Sách</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight leading-tight mb-3">
            {t.readBible} Trực Tuyến
          </h1>

          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
            Chọn bất kỳ sách nào dưới đây để bắt đầu đọc và nghe âm thanh giọng đọc bản xứ.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <a
              href="#cuu-uoc"
              className="bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 px-4 py-2 rounded-full shadow-2xs transition"
            >
              📜 Cựu Ước (39 Sách)
            </a>
            <a
              href="#tan-uoc"
              className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-full shadow-xs transition"
            >
              ✝️ Tân Ước (27 Sách • Đến Khải Huyền)
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-14">
        {/* ========================================================= */}
        {/* 1. CỰU ƯỚC (39 SÁCH) - ĐƯỢC ĐẶT ĐẦU TIÊN THEO ĐÚNG THỨ TỰ */}
        {/* ========================================================= */}
        <section id="cuu-uoc" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-5 border-b-2 border-stone-300 pb-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Phần 1
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {t.oldTestament} <span className="text-sm font-sans font-normal text-stone-500">(39 Sách)</span>
              </h2>
            </div>
            <span className="text-xs text-stone-500">Từ Sáng thế Ký đến Ma-la-chi</span>
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
                  Đọc ngay →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. TÂN ƯỚC (27 SÁCH) - KẾT THÚC VỚI KHẢI HUYỀN */}
        {/* ========================================================= */}
        <section id="tan-uoc" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-5 border-b-2 border-amber-800/40 pb-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Phần 2
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                {t.newTestament} <span className="text-sm font-sans font-normal text-stone-500">(27 Sách)</span>
              </h2>
            </div>
            <span className="text-xs text-amber-800 font-semibold">Từ Ma-thi-ơ đến Khải Huyền</span>
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
                          Sách cuối
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
                      <span className="font-mono">{b.code}</span>
                      <span className="font-mono">{b.chapters} ch</span>
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-800 opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                    Đọc ngay →
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
