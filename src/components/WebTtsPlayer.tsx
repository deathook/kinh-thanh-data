'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getLangConfig, getTranslation } from '@/lib/i18n';

interface WebTtsPlayerProps {
  verses: Array<{ verse: number; text: string }>;
  title: string;
  lang: string;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2, label: '2.0x' },
];

export default function WebTtsPlayer({ verses, title, lang }: WebTtsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSupported] = useState(true);
  const [showFloating, setShowFloating] = useState(false);

  const inlineCardRef = useRef<HTMLDivElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const rateRef = useRef<number>(1.0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const langConfig = getLangConfig(lang);
  const t = getTranslation(lang);

  // Detect when inline player card scrolls out of view to show floating bottom player
  useEffect(() => {
    const el = inlineCardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating player when inline card is scrolled above the viewport
        const isAboveViewport = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setShowFloating(isAboveViewport);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Update voices from Web Speech API
  const updateVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    voicesRef.current = window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      updateVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        updateVoices();
      };
    }

    return () => {
      isPlayingRef.current = false;
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.active-karaoke-verse').forEach((el) => {
          el.classList.remove('active-karaoke-verse');
        });
      }
    };
  }, [updateVoices]);

  const clearKaraokeHighlights = () => {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.active-karaoke-verse').forEach((el) => {
      el.classList.remove('active-karaoke-verse');
    });
  };

  const applyKaraokeHighlight = (verseNumber: number) => {
    if (typeof document === 'undefined') return;
    clearKaraokeHighlights();
    const el = document.getElementById(`cau-${verseNumber}`);
    if (el) {
      el.classList.add('active-karaoke-verse');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearKaraokeHighlights();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerseIndex(null);
  }, []);

  // Strict voice search: only returns voice if it matches target language
  const findMatchingVoice = (voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;
    const cfg = getLangConfig(targetLang);
    const prefix = cfg.voiceLang.split('-')[0].toLowerCase();

    for (const kw of cfg.voiceKeywords) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(prefix) &&
          v.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (match) return match;
    }

    const exact = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === cfg.voiceLang.toLowerCase().replace('_', '-')
    );
    if (exact) return exact;

    const byPrefix = voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (byPrefix) return byPrefix;

    return null;
  };

  const speakVerseAtIndex = useCallback(
    (index: number) => {
      if (!isPlayingRef.current) return;

      if (index >= verses.length) {
        stopAudio();
        return;
      }

      activeIndexRef.current = index;
      setCurrentVerseIndex(index);

      // Karaoke highlight and scroll
      applyKaraokeHighlight(verses[index].verse);

      const v = verses[index];
      const prefix = lang === 'vi' ? `Câu ${v.verse}. ` : `${t.verse} ${v.verse}. `;
      const fullText = prefix + v.text;

      const matchedVoice = findMatchingVoice(voicesRef.current, lang);

      if (matchedVoice && synthRef.current) {
        if (synthRef.current.paused) {
          synthRef.current.resume();
        }

        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = langConfig.voiceLang;
        utterance.rate = rateRef.current;
        utterance.voice = matchedVoice;

        (window as unknown as { _currentBibleUtterance?: SpeechSynthesisUtterance })._currentBibleUtterance = utterance;

        utterance.onend = () => {
          if (isPlayingRef.current) {
            setTimeout(() => {
              if (isPlayingRef.current) {
                speakVerseAtIndex(index + 1);
              }
            }, 180);
          }
        };

        utterance.onerror = (e) => {
          if (e.error === 'interrupted' || e.error === 'canceled') return;
          if (isPlayingRef.current) {
            setTimeout(() => {
              if (isPlayingRef.current) {
                speakVerseAtIndex(index + 1);
              }
            }, 100);
          }
        };

        synthRef.current.speak(utterance);
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audioUrl = `/api/tts?tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(fullText)}`;
        const audio = new Audio(audioUrl);
        audio.playbackRate = rateRef.current;
        audioRef.current = audio;

        audio.onended = () => {
          if (isPlayingRef.current) {
            setTimeout(() => {
              if (isPlayingRef.current) {
                speakVerseAtIndex(index + 1);
              }
            }, 180);
          }
        };

        audio.onerror = () => {
          if (isPlayingRef.current) {
            setTimeout(() => {
              if (isPlayingRef.current) {
                speakVerseAtIndex(index + 1);
              }
            }, 100);
          }
        };

        audio.play().catch(() => {
          if (isPlayingRef.current) {
            setTimeout(() => {
              if (isPlayingRef.current) speakVerseAtIndex(index + 1);
            }, 500);
          }
        });
      }
    },
    [lang, langConfig.voiceLang, stopAudio, t.verse, verses]
  );

  const handleSpeedChange = (newRate: number) => {
    setSpeechRate(newRate);
    rateRef.current = newRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    } else if (isPlayingRef.current && synthRef.current) {
      // Restart current verse immediately at the new speed for Web Speech API
      synthRef.current.cancel();
      speakVerseAtIndex(activeIndexRef.current);
    }
  };

  const startPlaying = () => {
    if (verses.length === 0) return;

    if (isPaused) {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      } else if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.resume();
      }
      if (currentVerseIndex !== null && verses[currentVerseIndex]) {
        applyKaraokeHighlight(verses[currentVerseIndex].verse);
      }
      setIsPaused(false);
      setIsPlaying(true);
      isPlayingRef.current = true;
      return;
    }

    stopAudio();
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    speakVerseAtIndex(0);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthRef.current) {
      synthRef.current.pause();
    }
    setIsPaused(true);
    setIsPlaying(false);
    isPlayingRef.current = false;
  };

  if (!isSupported) {
    return null;
  }

  const progressPercent =
    currentVerseIndex !== null && verses.length > 0
      ? Math.round(((currentVerseIndex + 1) / verses.length) * 100)
      : 0;

  return (
    <>
      {/* 1. Top Inline Player Card */}
      <div
        ref={inlineCardRef}
        className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 my-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Speaker Icon & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                isPlaying
                  ? 'bg-amber-700 text-white animate-pulse'
                  : 'bg-amber-800 text-white'
              }`}
            >
              <span className="text-lg">🔊</span>
            </div>
            <div>
              <div className="font-semibold text-stone-900 text-sm">
                {t.ttsTitle}
              </div>
              <div className="text-xs text-stone-500">
                {isPlaying && currentVerseIndex !== null
                  ? `${t.ttsPlaying} (${t.verse} ${verses[currentVerseIndex]?.verse}/${verses.length})`
                  : isPaused
                  ? t.ttsPaused
                  : `${langConfig.flag} ${langConfig.localName} • ${langConfig.bibleName}`}
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            {/* Speed Selector: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x */}
            <select
              value={speechRate.toString()}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="bg-white border border-stone-300 text-stone-700 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-700 transition cursor-pointer font-medium shadow-2xs"
              title="Tốc độ đọc / Speed"
            >
              {SPEED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Play / Pause / Resume */}
            {!isPlaying ? (
              <button
                onClick={startPlaying}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>{isPaused ? '▶' : '🎧'}</span>
                <span>{isPaused ? t.ttsResume : t.ttsPlay}</span>
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>⏸</span>
                <span>{t.ttsPaused}</span>
              </button>
            )}

            {/* Stop Button */}
            {(isPlaying || isPaused) && (
              <button
                onClick={stopAudio}
                className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
              >
                ⏹ {t.ttsStop}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Floating Bottom Player Bar (shown when user scrolls down past inline card) */}
      <div
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl transition-all duration-300 ${
          showFloating
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border border-amber-300/90 rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar on top edge when playing/paused */}
          {(isPlaying || isPaused) && (
            <div className="w-full h-1 bg-amber-100">
              <div
                className="h-full bg-amber-700 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <div className="px-3.5 py-2.5 flex items-center justify-between gap-2.5">
            {/* Left: Compact Info */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                  isPlaying
                    ? 'bg-amber-700 text-white animate-pulse'
                    : 'bg-amber-800 text-white'
                }`}
              >
                <span className="text-sm">🔊</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                  {title}
                </div>
                <div className="text-[11px] text-stone-500 truncate">
                  {isPlaying && currentVerseIndex !== null
                    ? `${t.ttsPlaying} (${t.verse} ${verses[currentVerseIndex]?.verse}/${verses.length})`
                    : isPaused
                    ? `${t.ttsPaused} (${t.verse} ${verses[currentVerseIndex ?? 0]?.verse}/${verses.length})`
                    : `${langConfig.flag} ${langConfig.bibleName}`}
                </div>
              </div>
            </div>

            {/* Right: Compact Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <select
                value={speechRate.toString()}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs rounded-xl px-2 sm:px-2.5 py-1.5 outline-none focus:border-amber-700 transition cursor-pointer font-semibold"
                title="Tốc độ đọc / Speed"
              >
                {SPEED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {!isPlaying ? (
                <button
                  onClick={startPlaying}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>{isPaused ? '▶' : '🎧'}</span>
                  <span className="hidden xs:inline">{isPaused ? t.ttsResume : t.ttsPlay}</span>
                </button>
              ) : (
                <button
                  onClick={pauseAudio}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-3 sm:px-3.5 py-1.5 rounded-xl transition shadow-2xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <span>⏸</span>
                  <span className="hidden xs:inline">{t.ttsPaused}</span>
                </button>
              )}

              {(isPlaying || isPaused) && (
                <button
                  onClick={stopAudio}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                  title={t.ttsStop}
                >
                  ⏹
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
