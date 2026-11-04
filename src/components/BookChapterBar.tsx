'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BibleBook } from '@/lib/bible';
import { getTranslation } from '@/lib/i18n';

interface BookChapterBarProps {
  lang: string;
  currentBook: BibleBook;
  currentChapter: number;
  allBooks: BibleBook[];
}

export default function BookChapterBar({
  lang,
  currentBook,
  currentChapter,
  allBooks,
}: BookChapterBarProps) {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();
  const t = getTranslation(lang);

  const isVi = lang === 'vi';
  const isEs = lang === 'es';

  const selectBookModalTitle = isVi
    ? 'Chọn Sách Kinh Thánh (Trọn Bộ 66 Cuốn)'
    : isEs
    ? 'Seleccionar Libro (66 Libros)'
    : `${t.all66Books}`;

  const selectBookModalSub = isVi
    ? 'Từ Sáng thế Ký (#1) đến Khải huyền (#66)'
    : isEs
    ? 'De Génesis (#1) a Apocalipsis (#66)'
    : 'All Old & New Testament Books (#1 - #66)';

  const searchPlaceholder = isVi
    ? 'Tìm sách trong 66 cuốn (ví dụ: Giăng, Khải huyền, Ma-thi-ơ...)'
    : isEs
    ? 'Buscar libro (ej. Juan, Apocalipsis, Mateo...)'
    : 'Search books (e.g. John, Revelation, Matthew...)';

  const noBooksFound = isVi
    ? `Không tìm thấy sách nào phù hợp với "${searchQuery}"`
    : isEs
    ? `No se encontró ningún libro para "${searchQuery}"`
    : `No books found matching "${searchQuery}"`;

  const selectChapterTitle = isVi
    ? `${currentBook.name} — Chọn Chương`
    : isEs
    ? `${currentBook.name} — Seleccionar Capítulo`
    : `${currentBook.name} — ${t.chapter}`;

  const selectChapterSub = isVi
    ? `Tổng cộng có ${currentBook.chapters} chương`
    : isEs
    ? `Total de ${currentBook.chapters} capítulos`
    : `${currentBook.chapters} chapters`;

  // Unified 66 books search filter without OT/NT split
  const filteredBooks = allBooks.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.slug.toLowerCase().includes(q) ||
      b.book_order.toString() === q
    );
  });

  const chaptersArray = Array.from({ length: currentBook.chapters }, (_, i) => i + 1);

  const handleSelectBook = (book: BibleBook) => {
    setIsBookModalOpen(false);
    setSearchQuery('');
    router.push(`/${lang}/kinh-thanh/${book.slug}/1`);
  };

  const handleSelectChapter = (ch: number) => {
    setIsChapterModalOpen(false);
    router.push(`/${lang}/kinh-thanh/${currentBook.slug}/${ch}`);
  };

  const hasPrev = currentChapter > 1;
  const hasNext = currentChapter < currentBook.chapters;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-2.5 sm:p-3 my-4 shadow-xs flex items-center justify-between gap-2 flex-wrap">
      {/* Book & Chapter Pickers */}
      <div className="flex items-center gap-2 flex-1 min-w-[280px]">
        {/* Book Selector Button */}
        <button
          onClick={() => {
            setIsBookModalOpen(true);
            setIsChapterModalOpen(false);
          }}
          className="inline-flex items-center gap-2 bg-stone-100 hover:bg-amber-100/70 border border-stone-300 text-stone-900 font-serif font-bold text-sm sm:text-base px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
          title={selectBookModalTitle}
        >
          <span>📖</span>
          <span className="truncate max-w-[150px] sm:max-w-[200px]">{currentBook.name}</span>
          <span className="text-xs text-stone-400">▼</span>
        </button>

        {/* Chapter Selector Button */}
        <button
          onClick={() => {
            setIsChapterModalOpen(true);
            setIsBookModalOpen(false);
          }}
          className="inline-flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white font-sans font-bold text-sm px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
          title={selectChapterTitle}
        >
          <span>
            {t.chapter} {currentChapter}
          </span>
          <span className="text-[11px] text-amber-200/90 font-normal">
            /{currentBook.chapters}
          </span>
          <span className="text-xs ml-0.5">▼</span>
        </button>

        {/* Directory Hub shortcut */}
        <Link
          href={`/${lang}/kinh-thanh`}
          className="hidden md:inline-flex text-xs font-semibold text-stone-500 hover:text-amber-800 px-2 py-1.5 transition"
        >
          {t.all66Books} →
        </Link>
      </div>

      {/* Quick Prev / Next Arrows */}
      <div className="flex items-center gap-1.5">
        {hasPrev ? (
          <Link
            href={`/${lang}/kinh-thanh/${currentBook.slug}/${currentChapter - 1}`}
            className="w-9 h-9 rounded-xl border border-stone-300 hover:border-amber-400 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 font-bold text-sm transition shadow-2xs"
            title={`${t.prevChapter} ${currentChapter - 1}`}
          >
            ←
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-xl border border-stone-200 bg-stone-50 opacity-40 flex items-center justify-center text-stone-400 text-sm">
            ←
          </div>
        )}

        {hasNext ? (
          <Link
            href={`/${lang}/kinh-thanh/${currentBook.slug}/${currentChapter + 1}`}
            className="w-9 h-9 rounded-xl border border-stone-300 hover:border-amber-400 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-700 font-bold text-sm transition shadow-2xs"
            title={`${t.nextChapter} ${currentChapter + 1}`}
          >
            →
          </Link>
        ) : (
          <div className="w-9 h-9 rounded-xl border border-stone-200 bg-stone-50 opacity-40 flex items-center justify-center text-stone-400 text-sm">
            →
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: CHỌN SÁCH (GOM TRỌN BỘ 66 SÁCH) */}
      {/* ========================================================= */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {selectBookModalTitle}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectBookModalSub}
                </p>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/70">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-700 shadow-2xs"
                autoFocus
              />
            </div>

            {/* 66 Books Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredBooks.map((b) => {
                  const isCurrent = b.id === currentBook.id;

                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSelectBook(b)}
                      className={`text-left p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-amber-100/90 border-amber-500 font-bold text-amber-950 ring-1 ring-amber-500 shadow-xs'
                          : 'bg-stone-50/60 hover:bg-amber-50/80 border-stone-200 text-stone-800 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-serif font-bold text-sm truncate">
                          {b.name}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 bg-white/80 px-1.5 py-0.5 rounded-md border border-stone-200/60 shrink-0">
                          #{b.book_order}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center justify-between">
                        <span className="font-mono">{b.code}</span>
                        <span>{b.chapters} ch</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-8 text-stone-400 text-sm">
                  {noBooksFound}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CHỌN CHƯƠNG */}
      {/* ========================================================= */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  {selectChapterTitle}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectChapterSub}
                </p>
              </div>
              <button
                onClick={() => setIsChapterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chapters Grid */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2.5">
                {chaptersArray.map((ch) => {
                  const isCurrent = ch === currentChapter;

                  return (
                    <button
                      key={ch}
                      onClick={() => handleSelectChapter(ch)}
                      className={`h-11 rounded-xl font-bold text-sm transition cursor-pointer flex items-center justify-center shadow-2xs ${
                        isCurrent
                          ? 'bg-amber-800 text-white shadow-xs ring-2 ring-amber-900'
                          : 'bg-stone-100 hover:bg-amber-100 text-stone-800 border border-stone-200/80 hover:border-amber-300'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
