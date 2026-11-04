'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslation } from '@/lib/i18n';

interface SearchResultItem {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  name: string;
  slug: string;
  code: string;
}

interface SearchModalProps {
  currentLang?: string;
  triggerClassName?: string;
  triggerStyle?: 'header' | 'hero' | 'minimal';
}

const SEARCH_SUGGESTIONS: Record<string, string[]> = {
  vi: ['Yêu thương', 'Bình an', 'Đức tin', 'Hy vọng', 'Cầu nguyện', 'Chân lý'],
  en: ['Love', 'Peace', 'Faith', 'Hope', 'Prayer', 'Truth'],
  es: ['Amor', 'Paz', 'Fe', 'Esperanza', 'Oración', 'Verdad'],
  pt: ['Amor', 'Paz', 'Fé', 'Esperança', 'Oração', 'Verdade'],
  fr: ['Amour', 'Paix', 'Foi', 'Espérance', 'Prière', 'Vérité'],
  de: ['Liebe', 'Frieden', 'Glaube', 'Hoffnung', 'Gebet', 'Wahrheit'],
  zh: ['爱', '平安', '信心', '盼望', '祷告', '真理'],
  ko: ['사랑', '평안', '믿음', '소망', '기도', '진리'],
  ja: ['愛', '平安', '信仰', '希望', '祈り', '真理'],
  ru: ['Любовь', 'Мир', 'Вера', 'Надежда', 'Молитва', 'Истина'],
  tl: ['Pag-ibig', 'Kapayapaan', 'Pananampalataya', 'Pag-asa', 'Panalangin', 'Katotohanan'],
  th: ['ความรัก', 'สันติสุข', 'ความเชื่อ', 'ความหวัง', 'การอธิษฐาน', 'ความจริง'],
};

export default function SearchModal({
  currentLang = 'vi',
  triggerClassName,
  triggerStyle = 'header',
}: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = getTranslation(currentLang);

  const suggestions = SEARCH_SUGGESTIONS[currentLang] || SEARCH_SUGGESTIONS.vi;

  // Listen for Ctrl+K or ⌘+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search query
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm.trim())}&lang=${currentLang}`
        );
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [currentLang]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    router.push(`/${currentLang}/kinh-thanh/${item.slug}/${item.chapter}#cau-${item.verse}`);
  };

  // Highlight matched terms in text
  const renderHighlightedText = (text: string, searchTerms: string) => {
    if (!searchTerms.trim()) return text;
    const words = searchTerms
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (words.length === 0) return text;

    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 text-amber-950 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <>
      {/* Trigger Button based on Style */}
      {triggerStyle === 'header' && (
        <button
          onClick={() => setIsOpen(true)}
          className={
            triggerClassName ||
            'inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-700 transition-all shadow-2xs cursor-pointer'
          }
          title={`${t.searchPlaceholder} (Ctrl+K)`}
        >
          <span>🔍</span>
          <span className="hidden sm:inline">
            {currentLang === 'vi' ? 'Tìm câu gốc' : currentLang === 'es' ? 'Buscar' : 'Search'}
          </span>
          <kbd className="hidden lg:inline-block bg-white text-[10px] text-stone-500 font-mono px-1.5 py-0.5 rounded border border-stone-200">
            Ctrl K
          </kbd>
        </button>
      )}

      {triggerStyle === 'hero' && (
        <div
          onClick={() => setIsOpen(true)}
          className={
            triggerClassName ||
            'w-full max-w-xl mx-auto bg-white/95 backdrop-blur hover:bg-white border-2 border-stone-300 hover:border-amber-700 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:shadow transition-all flex items-center justify-between gap-3 cursor-pointer group text-left'
          }
        >
          <div className="flex items-center gap-3 text-stone-500 group-hover:text-amber-900 transition-colors">
            <span className="text-xl">🔍</span>
            <span className="text-xs sm:text-sm font-medium">
              {t.searchPlaceholder || 'Tìm kiếm câu gốc Kinh Thánh...'}
            </span>
          </div>
          <kbd className="hidden sm:inline-block bg-stone-100 text-[11px] text-stone-500 font-mono px-2 py-1 rounded-lg border border-stone-200">
            Ctrl K
          </kbd>
        </div>
      )}

      {triggerStyle === 'minimal' && (
        <button
          onClick={() => setIsOpen(true)}
          className={triggerClassName || 'text-stone-600 hover:text-amber-800 transition p-2'}
          title="Search"
        >
          🔍
        </button>
      )}

      {/* Search Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center p-4 pt-12 sm:pt-20 animate-in fade-in duration-150">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center gap-3 bg-stone-50/70">
              <span className="text-xl text-stone-400">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder || 'Nhập từ khóa câu gốc...'}
                className="flex-1 bg-transparent text-stone-900 text-base sm:text-lg font-medium outline-none placeholder:text-stone-400"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="w-7 h-7 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 text-xs font-bold flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 bg-stone-200/70 hover:bg-stone-300 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Keyword Suggestions when no query is typed */}
            {!query && (
              <div className="p-5 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2.5">
                  {currentLang === 'vi'
                    ? 'Gợi ý từ khóa tìm kiếm'
                    : currentLang === 'es'
                    ? 'Sugerencias de búsqueda'
                    : 'Search suggestions'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => setQuery(kw)}
                      className="bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 transition cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Area */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 divide-y divide-stone-100">
              {loading && (
                <div className="py-12 text-center text-stone-500 text-sm flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {currentLang === 'vi'
                      ? 'Đang tra cứu Lời Chúa...'
                      : currentLang === 'es'
                      ? 'Buscando...'
                      : 'Searching Scripture...'}
                  </span>
                </div>
              )}

              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <div className="py-12 text-center text-stone-400 text-sm">
                  <div className="text-2xl mb-2">📖</div>
                  <div>
                    {currentLang === 'vi'
                      ? `Không tìm thấy câu gốc nào phù hợp với "${query}"`
                      : currentLang === 'es'
                      ? `No se encontraron versículos para "${query}"`
                      : `No verses found matching "${query}"`}
                  </div>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="mb-3 text-xs font-semibold text-stone-500">
                  {currentLang === 'vi'
                    ? `Tìm thấy ${results.length} câu gốc:`
                    : currentLang === 'es'
                    ? `Se encontraron ${results.length} versículos:`
                    : `Found ${results.length} verses:`}
                </div>
              )}

              {!loading &&
                results.map((r) => (
                  <button
                    key={`${r.book_id}-${r.chapter}-${r.verse}`}
                    onClick={() => handleSelectResult(r)}
                    className="w-full text-left py-3 px-2 rounded-xl hover:bg-amber-50/70 transition cursor-pointer group flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-amber-100 text-amber-900 font-serif font-bold text-xs px-2.5 py-0.5 rounded-md group-hover:bg-amber-800 group-hover:text-white transition-colors">
                        {r.name} {r.chapter}:{r.verse}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400 group-hover:text-amber-800 transition">
                        {currentLang === 'vi' ? 'Đọc câu này →' : 'Read →'}
                      </span>
                    </div>
                    <p className="font-serif text-sm text-stone-800 leading-relaxed pl-1 pt-1">
                      {renderHighlightedText(r.text, query)}
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
