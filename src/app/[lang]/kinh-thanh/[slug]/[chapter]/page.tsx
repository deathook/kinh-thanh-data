import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getBookBySlug,
  getChapterVerses,
  getAllBooks,
  getCanonicalSlug,
} from '@/lib/bible';
import {
  SUPPORTED_LANGUAGES,
  isValidLang,
  getLangConfig,
  getTranslation,
  LANGUAGE_LIST,
} from '@/lib/i18n';
import WebTtsPlayer from '@/components/WebTtsPlayer';
import SmartAppBanner from '@/components/SmartAppBanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookChapterBar from '@/components/BookChapterBar';

interface PageProps {
  params: Promise<{
    lang: string;
    slug: string;
    chapter: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug, chapter } = await params;
  if (!isValidLang(lang)) return { title: 'Language Not Supported' };

  const book = getBookBySlug(slug, lang);
  if (!book) return { title: 'Book Not Found' };

  const chNum = parseInt(chapter, 10);
  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);

  const title = `${book.name} ${t.chapter} ${chNum} - ${cfg.bibleName}`;
  const description = `${t.readOnline} ${book.name} ${t.chapter} ${chNum} (${cfg.bibleName}) - ${t.ttsTitle}.`;

  // Build hreflang alternates for all 12 languages for Google SEO
  const alternatesLanguages: Record<string, string> = {};
  LANGUAGE_LIST.forEach((l) => {
    const slugInLang = getCanonicalSlug(book.id, l.code);
    alternatesLanguages[l.code] = `/${l.code}/kinh-thanh/${slugInLang}/${chNum}`;
  });

  return {
    title,
    description,
    keywords: [book.name, `${t.chapter} ${chNum}`, cfg.bibleName, 'Holy Scripture', 'Bible Audio TTS'],
    alternates: {
      canonical: `/${lang}/kinh-thanh/${book.slug}/${chNum}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: cfg.voiceLang.replace('-', '_'),
    },
  };
}

export default async function MultilingualChapterPage({ params }: PageProps) {
  const { lang, slug, chapter } = await params;
  if (!isValidLang(lang)) {
    notFound();
  }

  const book = getBookBySlug(slug, lang);
  const chNum = parseInt(chapter, 10);

  if (!book || isNaN(chNum) || chNum < 1 || chNum > book.chapters) {
    notFound();
  }

  const verses = getChapterVerses(book.id, chNum, lang);
  const allBooks = getAllBooks(lang);
  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);

  // Map slugs for all 12 languages for the Language Switcher
  const bookSlugsByLang: Record<string, string> = {};
  LANGUAGE_LIST.forEach((l) => {
    bookSlugsByLang[l.code] = getCanonicalSlug(book.id, l.code);
  });

  // Prev / Next Navigation
  const hasPrev = chNum > 1;
  const hasNext = chNum < book.chapters;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${book.name} ${t.chapter} ${chNum}`,
    description: `${book.name} ${t.chapter} ${chNum} - ${cfg.bibleName}`,
    inLanguage: lang,
    author: {
      '@type': 'Organization',
      name: t.siteTitle,
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner currentLang={lang} />
      <Header
        currentLang={lang}
        bookId={book.id}
        chapter={chNum}
        bookSlugsByLang={bookSlugsByLang}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-stone-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-amber-800 transition-colors">
            {t.home}
          </Link>
          <span>/</span>
          <Link href={`/${lang}/kinh-thanh`} className="hover:text-amber-800 transition-colors">
            {t.readBible}
          </Link>
          <span>/</span>
          <span>{book.testament === 'OT' ? t.oldTestament : t.newTestament}</span>
          <span>/</span>
          <span className="font-medium text-stone-800">{book.name}</span>
          <span>/</span>
          <span className="text-amber-800 font-bold">
            {t.chapter} {chNum}
          </span>
        </nav>

        {/* Interactive Book & Chapter Selector Bar */}
        <BookChapterBar
          lang={lang}
          currentBook={{ ...book }}
          currentChapter={chNum}
          allBooks={allBooks.map((b) => ({ ...b }))}
        />

        {/* Chapter Header */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 tracking-tight mb-2">
            {book.name} {t.chapter} {chNum}
          </h1>
          <p className="text-stone-500 text-sm">
            {cfg.bibleName} • {verses.length} {t.versesCount}
          </p>
        </div>

        {/* Enhanced Native Web Speech TTS Player */}
        <WebTtsPlayer
          verses={verses.map((v) => ({ verse: v.verse, text: v.text }))}
          title={`${book.name} ${chNum}`}
          lang={lang}
        />

        {/* Verses Reading View - Single Language (Không cần song ngữ) */}
        <article className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-6 sm:p-10 my-6 font-serif text-lg leading-relaxed space-y-3">
          {verses.map((v) => (
            <div
              key={v.id}
              id={`cau-${v.verse}`}
              className="group hover:bg-amber-50/60 p-2.5 rounded-xl transition-all target:bg-amber-100/90 target:ring-2 target:ring-amber-500 target:rounded-xl scroll-mt-24 flex items-start gap-3"
            >
              <span className="verse-num font-sans font-bold text-xs text-amber-800 select-none shrink-0 w-7 text-right pt-1 transition-all">
                {v.verse}
              </span>
              <span className="verse-text text-stone-900 leading-relaxed text-lg sm:text-xl transition-all">
                {v.text}
              </span>
            </div>
          ))}
        </article>

        {/* Bottom Pagination */}
        <div className="flex items-center justify-between my-8 gap-4">
          {hasPrev ? (
            <Link
              href={`/${lang}/kinh-thanh/${book.slug}/${chNum - 1}`}
              className="bg-white border border-stone-300 hover:border-amber-400 text-stone-800 text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition shadow-2xs hover:shadow-xs"
            >
              ← {t.prevChapter} {chNum - 1}
            </Link>
          ) : (
            <div />
          )}

          <div className="text-xs font-mono text-stone-500">
            {chNum} / {book.chapters}
          </div>

          {hasNext ? (
            <Link
              href={`/${lang}/kinh-thanh/${book.slug}/${chNum + 1}`}
              className="bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl transition shadow-xs hover:shadow"
            >
              {t.nextChapter} {chNum + 1} →
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
