'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface VerseItem {
  id: number;
  verse: number;
  text: string;
}

interface ChapterVersesReaderProps {
  verses: VerseItem[];
  lang?: string;
  bookName?: string;
  chapter?: number;
}

export default function ChapterVersesReader({
  verses,
  lang = 'vi',
  bookName,
  chapter,
}: ChapterVersesReaderProps) {
  const searchParams = useSearchParams();
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [justArrived, setJustArrived] = useState(false);
  const scrolledRef = useRef(false);

  // Check URL params (?highlight=16) or hash (#cau-16)
  useEffect(() => {
    let targetNum: number | null = null;

    // 1. Check query param ?highlight=...
    const paramHighlight = searchParams.get('highlight');
    if (paramHighlight) {
      const parsed = parseInt(paramHighlight, 10);
      if (!isNaN(parsed) && parsed > 0) {
        targetNum = parsed;
      }
    }

    // 2. Check window.location.hash (#cau-16)
    if (!targetNum && typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#cau-(\d+)/);
      if (match && match[1]) {
        targetNum = parseInt(match[1], 10);
      }
    }

    if (targetNum && !scrolledRef.current) {
      setHighlightedVerse(targetNum);
      setJustArrived(true);
      scrolledRef.current = true;

      // Smooth scroll to verse
      setTimeout(() => {
        const el = document.getElementById(`cau-${targetNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      // Stop gentle arrival pulse after 3 seconds
      const pulseTimer = setTimeout(() => {
        setJustArrived(false);
      }, 3500);

      return () => clearTimeout(pulseTimer);
    }
  }, [searchParams]);

  // Listen for hash changes if navigated on the same page
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const match = window.location.hash.match(/#cau-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          setHighlightedVerse(num);
          setJustArrived(true);
          const el = document.getElementById(`cau-${num}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setTimeout(() => setJustArrived(false), 3000);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleVerseClick = (verseNum: number) => {
    if (highlightedVerse === verseNum) {
      // Toggle off if already selected
      setHighlightedVerse(null);
    } else {
      setHighlightedVerse(verseNum);
      // Update hash without jumping
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', `#cau-${verseNum}`);
      }
    }
  };

  const highlightBadgeText =
    lang === 'vi'
      ? '📌 Câu đối chiếu / Đang xem'
      : lang === 'es'
      ? '📌 Versículo seleccionado'
      : lang === 'fr'
      ? '📌 Verset en surbrillance'
      : '📌 Highlighted Verse';

  return (
    <article className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-5 sm:p-8 md:p-10 my-6 font-serif text-lg leading-relaxed space-y-3">
      {verses.map((v) => {
        const isHighlighted = highlightedVerse === v.verse;

        return (
          <div
            key={v.id}
            id={`cau-${v.verse}`}
            onClick={() => handleVerseClick(v.verse)}
            className={`group p-3 rounded-2xl transition-all cursor-pointer relative scroll-mt-28 flex items-start gap-3.5 ${
              isHighlighted
                ? `bg-gradient-to-r from-amber-100 via-amber-100/90 to-amber-50/70 border-l-4 border-amber-700 shadow-sm ring-1 ring-amber-400/80 ${
                    justArrived ? 'animate-pulse' : ''
                  }`
                : 'hover:bg-amber-50/60 border-l-4 border-transparent'
            }`}
          >
            {/* Verse Number Column */}
            <div className="shrink-0 pt-0.5 text-right w-8">
              {isHighlighted ? (
                <span className="inline-block bg-amber-800 text-white font-sans font-bold text-xs px-1.5 py-0.5 rounded-md shadow-2xs">
                  {v.verse}
                </span>
              ) : (
                <span className="verse-num font-sans font-bold text-xs text-amber-800/80 group-hover:text-amber-900 select-none transition-colors">
                  {v.verse}
                </span>
              )}
            </div>

            {/* Verse Text & Highlight Badge */}
            <div className="flex-1">
              {isHighlighted && (
                <div className="inline-flex items-center gap-1.5 bg-amber-200/90 text-amber-950 font-sans text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 shadow-2xs border border-amber-300">
                  <span>{highlightBadgeText}</span>
                  {bookName && (
                    <span className="font-mono opacity-80">
                      • {bookName} {chapter}:{v.verse}
                    </span>
                  )}
                </div>
              )}
              <div
                className={`verse-text leading-relaxed text-lg sm:text-xl transition-colors ${
                  isHighlighted ? 'text-amber-950 font-medium' : 'text-stone-900'
                }`}
              >
                {v.text}
              </div>
            </div>
          </div>
        );
      })}
    </article>
  );
}
