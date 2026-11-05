'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { HIGHLIGHT_COLORS } from '@/lib/cloudSync';

interface VerseItem {
  id: number;
  verse: number;
  text: string;
}

interface ChapterVersesReaderProps {
  verses: VerseItem[];
  lang?: string;
  bookId?: number;
  bookName?: string;
  chapter?: number;
}

export default function ChapterVersesReader({
  verses,
  lang = 'vi',
  bookId = 1,
  bookName = 'Kinh Thánh',
  chapter = 1,
}: ChapterVersesReaderProps) {
  const searchParams = useSearchParams();
  const {
    cloudData,
    addHighlight,
    removeHighlight,
    saveNote,
    removeNote,
  } = useAuth();

  // Navigation target from URL ?highlight=... or #cau-...
  const [navTargetVerse, setNavTargetVerse] = useState<number | null>(null);
  const [justArrived, setJustArrived] = useState(false);
  const scrolledRef = useRef(false);

  // Active interactive verse
  const [activeVerse, setActiveVerse] = useState<number | null>(null);

  // Note editing state
  const [editingNoteVerse, setEditingNoteVerse] = useState<number | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Check URL params (?highlight=16) or hash (#cau-16) on mount/change
  useEffect(() => {
    let targetNum: number | null = null;

    const paramHighlight = searchParams.get('highlight');
    if (paramHighlight) {
      const parsed = parseInt(paramHighlight, 10);
      if (!isNaN(parsed) && parsed > 0) {
        targetNum = parsed;
      }
    }

    if (!targetNum && typeof window !== 'undefined' && window.location.hash) {
      const match = window.location.hash.match(/#cau-(\d+)/);
      if (match && match[1]) {
        targetNum = parseInt(match[1], 10);
      }
    }

    if (targetNum && !scrolledRef.current) {
      setNavTargetVerse(targetNum);
      setActiveVerse(targetNum);
      setJustArrived(true);
      scrolledRef.current = true;

      setTimeout(() => {
        const el = document.getElementById(`cau-${targetNum}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);

      const pulseTimer = setTimeout(() => {
        setJustArrived(false);
      }, 3500);

      return () => clearTimeout(pulseTimer);
    }
  }, [searchParams]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const match = window.location.hash.match(/#cau-(\d+)/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          setNavTargetVerse(num);
          setActiveVerse(num);
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
    if (activeVerse === verseNum) {
      setActiveVerse(null);
      setEditingNoteVerse(null);
    } else {
      setActiveVerse(verseNum);
      setEditingNoteVerse(null);
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState(null, '', `#cau-${verseNum}`);
      }
    }
  };

  const handleSetColor = (v: VerseItem, colorHex: string) => {
    const verseKey = `${bookId}_${chapter}_${v.verse}`;
    addHighlight({
      book_id: bookId,
      chapter,
      verse: v.verse,
      book_name: bookName,
      verse_text: v.text,
      color: colorHex,
      verse_key: verseKey,
      created_at: new Date().toISOString(),
    });
    showToast(lang === 'vi' ? 'Đã tô màu & lưu đám mây' : 'Highlighted & synced');
  };

  const handleRemoveColor = (verseNum: number) => {
    const verseKey = `${bookId}_${chapter}_${verseNum}`;
    removeHighlight(verseKey);
    showToast(lang === 'vi' ? 'Đã xóa màu tô' : 'Highlight removed');
  };

  const handleOpenNote = (verseNum: number) => {
    const verseKey = `${bookId}_${chapter}_${verseNum}`;
    const existing = cloudData.notes.find((n) => n.verse_key === verseKey);
    setNoteContent(existing ? existing.content : '');
    setEditingNoteVerse(verseNum);
  };

  const handleSaveNote = (v: VerseItem) => {
    const verseKey = `${bookId}_${chapter}_${v.verse}`;
    if (!noteContent.trim()) {
      removeNote(verseKey);
    } else {
      saveNote({
        book_id: bookId,
        chapter,
        verse: v.verse,
        book_name: bookName,
        verse_text: v.text,
        content: noteContent.trim(),
        verse_key: verseKey,
        updated_at: new Date().toISOString(),
      });
    }
    setEditingNoteVerse(null);
    showToast(lang === 'vi' ? 'Đã lưu ghi chú vào đám mây' : 'Note saved to cloud');
  };

  const handleCopyVerse = (v: VerseItem) => {
    const shareText = `“${v.text}” — ${bookName} ${chapter}:${v.verse}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast(lang === 'vi' ? 'Đã sao chép câu Kinh Thánh' : 'Verse copied to clipboard');
    }
  };

  const isVi = lang === 'vi';

  return (
    <article className="bg-white rounded-3xl shadow-xs border border-stone-200/90 p-4 sm:p-7 md:p-9 my-6 font-serif text-lg leading-relaxed space-y-3 relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="text-emerald-400">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {verses.map((v) => {
        const verseKey = `${bookId}_${chapter}_${v.verse}`;
        const userHighlight = cloudData.highlights.find((h) => h.verse_key === verseKey);
        const userNote = cloudData.notes.find((n) => n.verse_key === verseKey);
        const isNavTarget = navTargetVerse === v.verse;
        const isActive = activeVerse === v.verse;
        const isEditingNote = editingNoteVerse === v.verse;

        // Custom style calculation
        let dynamicBg = '';
        let dynamicBorderLeft = 'border-l-4 border-transparent';

        if (userHighlight) {
          dynamicBg = '';
          dynamicBorderLeft = 'border-l-4';
        }

        if (isNavTarget) {
          dynamicBg = 'bg-gradient-to-r from-amber-100 via-amber-100/90 to-amber-50/70';
          dynamicBorderLeft = 'border-l-4 border-amber-700 shadow-sm ring-1 ring-amber-400/80';
        }

        return (
          <div
            key={v.id}
            id={`cau-${v.verse}`}
            onClick={() => handleVerseClick(v.verse)}
            style={{
              backgroundColor: userHighlight && !isNavTarget ? `${userHighlight.color}40` : undefined,
              borderLeftColor: userHighlight && !isNavTarget ? userHighlight.color : undefined,
            }}
            className={`group p-3 rounded-2xl transition-all cursor-pointer relative scroll-mt-28 flex flex-col gap-2 ${dynamicBg} ${dynamicBorderLeft} ${
              isNavTarget && justArrived ? 'animate-pulse' : ''
            } ${
              !userHighlight && !isNavTarget ? 'hover:bg-amber-50/50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Verse Number Column */}
              <div className="shrink-0 pt-0.5 text-right w-8">
                {isNavTarget ? (
                  <span className="inline-block bg-amber-800 text-white font-sans font-bold text-xs px-1.5 py-0.5 rounded-md shadow-2xs">
                    {v.verse}
                  </span>
                ) : userHighlight ? (
                  <span
                    className="inline-block text-stone-900 font-sans font-bold text-xs px-1.5 py-0.5 rounded-md shadow-2xs border border-black/10"
                    style={{ backgroundColor: userHighlight.color }}
                  >
                    {v.verse}
                  </span>
                ) : (
                  <span className="verse-num font-sans font-bold text-xs text-amber-800/80 group-hover:text-amber-900 select-none transition-colors">
                    {v.verse}
                  </span>
                )}
              </div>

              {/* Verse Text & Navigation Badge */}
              <div className="flex-1">
                {isNavTarget && (
                  <div className="inline-flex items-center gap-1.5 bg-amber-200/90 text-amber-950 font-sans text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 shadow-2xs border border-amber-300">
                    <span>{isVi ? '📌 Câu đối chiếu / Đang xem' : '📌 Selected Verse'}</span>
                    <span className="font-mono opacity-80">
                      • {bookName} {chapter}:{v.verse}
                    </span>
                  </div>
                )}

                <div
                  className={`verse-text leading-relaxed text-lg sm:text-xl transition-colors ${
                    isNavTarget
                      ? 'text-amber-950 font-medium'
                      : userHighlight
                      ? 'text-stone-950 font-medium'
                      : 'text-stone-900'
                  }`}
                >
                  {v.text}
                </div>
              </div>
            </div>

            {/* Display Attached Note */}
            {userNote && !isEditingNote && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenNote(v.verse);
                }}
                className="ml-11 p-3 bg-amber-50/90 hover:bg-amber-100/90 border border-amber-300/80 rounded-2xl text-xs sm:text-sm text-stone-800 font-sans shadow-2xs flex items-start justify-between gap-3 transition"
              >
                <div className="flex items-start gap-2">
                  <span className="text-base shrink-0">📝</span>
                  <div className="leading-relaxed whitespace-pre-wrap">{userNote.content}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNote(verseKey);
                    showToast(isVi ? 'Đã xóa ghi chú' : 'Note deleted');
                  }}
                  className="text-stone-400 hover:text-rose-600 p-1 text-xs cursor-pointer shrink-0"
                  title={isVi ? 'Xóa ghi chú' : 'Delete note'}
                >
                  🗑️
                </button>
              </div>
            )}

            {/* Inline Note Editor */}
            {isEditingNote && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="ml-11 p-3.5 bg-white border-2 border-amber-400 rounded-2xl shadow-md font-sans text-xs sm:text-sm space-y-2 animate-in fade-in"
              >
                <div className="font-bold text-amber-950 flex items-center justify-between">
                  <span>📝 {isVi ? 'Ghi chú câu' : 'Note on verse'} {v.verse}</span>
                  <button
                    onClick={() => setEditingNoteVerse(null)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder={isVi ? 'Viết suy ngẫm, cảm xúc hoặc sự soi dẫn của bạn...' : 'Write your notes or reflections...'}
                  className="w-full p-2.5 rounded-xl border border-stone-200 outline-none focus:border-amber-700 text-xs sm:text-sm"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingNoteVerse(null)}
                    className="px-3 py-1.5 text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
                  >
                    {isVi ? 'Hủy' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => handleSaveNote(v)}
                    className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {isVi ? 'Lưu Ghi Chú' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Floating Toolbar when verse is selected */}
            {isActive && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="ml-11 mt-1 p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-300 shadow-lg flex items-center flex-wrap gap-2 font-sans text-xs animate-in fade-in zoom-in-95 duration-100 z-10"
              >
                {/* 5 Color Palette Swatches */}
                <div className="flex items-center gap-1.5 px-1 py-0.5 border-r border-stone-200 pr-2">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => handleSetColor(v, c.hex)}
                      className="w-6 h-6 rounded-full border border-black/15 hover:scale-110 transition shadow-2xs cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                      title={`Tô màu ${c.name}`}
                    >
                      {userHighlight?.color === c.hex && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                  {userHighlight && (
                    <button
                      onClick={() => handleRemoveColor(v.verse)}
                      className="text-stone-400 hover:text-rose-600 px-1 text-xs transition cursor-pointer"
                      title={isVi ? 'Xóa màu tô' : 'Remove highlight'}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Note Button */}
                <button
                  onClick={() => handleOpenNote(v.verse)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 font-medium transition cursor-pointer"
                >
                  <span>📝</span>
                  <span>{userNote ? (isVi ? 'Sửa ghi chú' : 'Edit note') : (isVi ? 'Ghi chú' : 'Add note')}</span>
                </button>

                {/* Copy Verse Button */}
                <button
                  onClick={() => handleCopyVerse(v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-stone-100 text-stone-700 font-medium transition cursor-pointer"
                >
                  <span>📋</span>
                  <span>{isVi ? 'Sao chép' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </article>
  );
}
