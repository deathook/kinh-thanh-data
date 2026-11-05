'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getLangConfig, getTranslation } from '@/lib/i18n';

interface WebTtsPlayerProps {
  verses: Array<{ verse: number; text: string }>;
  title: string;
  lang: string;
  nextChapterUrl?: string;
}

type PlayMode = 'next' | 'repeat' | 'stop';

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 0.75, label: '0.75x' },
  { value: 1, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 1.75, label: '1.75x' },
  { value: 2, label: '2.0x' },
];

export default function WebTtsPlayer({
  verses,
  title,
  lang,
  nextChapterUrl,
}: WebTtsPlayerProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [playMode, setPlayMode] = useState<PlayMode>('next');
  const [isSupported] = useState(true);
  const [showFloating, setShowFloating] = useState(false);
  const [openMenuLocation, setOpenMenuLocation] = useState<'inline' | 'floating' | null>(null);

  const inlineCardRef = useRef<HTMLDivElement | null>(null);
  const inlineMenuRef = useRef<HTMLDivElement | null>(null);
  const floatingMenuRef = useRef<HTMLDivElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const rateRef = useRef<number>(1.0);
  const playModeRef = useRef<PlayMode>('next');
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const langConfig = getLangConfig(lang);
  const t = getTranslation(lang);
  const isVi = lang === 'vi';

  const playModeOptions: Array<{ value: PlayMode; icon: string; label: string }> = [
    {
      value: 'next',
      icon: '⏭',
      label: isVi ? 'Chuyển chương' : 'Auto next chapter',
    },
    {
      value: 'repeat',
      icon: '🔁',
      label: isVi ? 'Lặp lại chương này' : 'Repeat chapter',
    },
    {
      value: 'stop',
      icon: '⏹',
      label: isVi ? 'Dừng hết chương' : 'Stop at end',
    },
  ];

  const currentModeOption =
    playModeOptions.find((o) => o.value === playMode) || playModeOptions[0];

  // Close mode menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        inlineMenuRef.current &&
        !inlineMenuRef.current.contains(target) &&
        floatingMenuRef.current &&
        !floatingMenuRef.current.contains(target)
      ) {
        setOpenMenuLocation(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect when inline player card scrolls out of view to show floating bottom player
  useEffect(() => {
    const el = inlineCardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
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
    if (typeof window !== 'undefined') {
      // Restore saved speech rate if available
      const savedRate = sessionStorage.getItem('tts_speech_rate');
      if (savedRate) {
        const parsed = parseFloat(savedRate);
        if (!isNaN(parsed) && parsed > 0) {
          setSpeechRate(parsed);
          rateRef.current = parsed;
        }
      }

      // Restore saved play mode if available (default: 'next')
      const savedMode = sessionStorage.getItem('tts_play_mode') as PlayMode | null;
      if (savedMode === 'next' || savedMode === 'repeat' || savedMode === 'stop') {
        setPlayMode(savedMode);
        playModeRef.current = savedMode;
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        updateVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          updateVoices();
        };
      }
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

  const stopAudio = useCallback((keepAutoPlayFlag = false) => {
    isPlayingRef.current = false;
    if (!keepAutoPlayFlag && typeof window !== 'undefined') {
      sessionStorage.removeItem('tts_auto_play');
    }
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
        const mode = playModeRef.current;
        if (mode === 'repeat') {
          speakVerseAtIndex(0);
        } else if (mode === 'next' && nextChapterUrl && typeof window !== 'undefined') {
          sessionStorage.setItem('tts_auto_play', '1');
          sessionStorage.setItem('tts_speech_rate', String(rateRef.current));
          sessionStorage.setItem('tts_play_mode', mode);
          stopAudio(true);
          router.push(nextChapterUrl);
        } else {
          stopAudio();
        }
        return;
      }

      activeIndexRef.current = index;
      setCurrentVerseIndex(index);

      // Karaoke highlight and scroll
      applyKaraokeHighlight(verses[index].verse);

      const v = verses[index];
      // Before reading verse 1 (index === 0), read the book & chapter heading (e.g. "Giăng Chương 1. ").
      const fullText = index === 0 ? `${title}. ${v.text}` : v.text;

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
    [lang, langConfig.voiceLang, nextChapterUrl, router, stopAudio, title, verses]
  );

  // Listen for "Play from this verse" event dispatched from ChapterVersesReader
  useEffect(() => {
    const handlePlayFromVerse = (e: Event) => {
      const customEvent = e as CustomEvent<{ verse: number }>;
      const targetVerseNum = customEvent.detail?.verse;
      if (!targetVerseNum) return;

      const targetIndex = verses.findIndex((v) => v.verse === targetVerseNum);
      if (targetIndex >= 0) {
        stopAudio();
        isPlayingRef.current = true;
        setIsPlaying(true);
        setIsPaused(false);
        speakVerseAtIndex(targetIndex);
      }
    };

    window.addEventListener('bible-tts-play-from-verse', handlePlayFromVerse);
    return () => window.removeEventListener('bible-tts-play-from-verse', handlePlayFromVerse);
  }, [verses, stopAudio, speakVerseAtIndex]);

  // Auto-start playback if navigated from previous chapter completion
  useEffect(() => {
    if (typeof window === 'undefined' || verses.length === 0) return;
    const shouldAutoPlay = sessionStorage.getItem('tts_auto_play') === '1';
    if (shouldAutoPlay) {
      sessionStorage.removeItem('tts_auto_play');
      const timer = setTimeout(() => {
        stopAudio(true);
        isPlayingRef.current = true;
        setIsPlaying(true);
        setIsPaused(false);
        speakVerseAtIndex(0);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [title, verses, speakVerseAtIndex, stopAudio]);

  const handleSpeedChange = (newRate: number) => {
    setSpeechRate(newRate);
    rateRef.current = newRate;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tts_speech_rate', String(newRate));
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    } else if (isPlayingRef.current && synthRef.current) {
      synthRef.current.cancel();
      speakVerseAtIndex(activeIndexRef.current);
    }
  };

  const handleSelectPlayMode = (newMode: PlayMode) => {
    setPlayMode(newMode);
    playModeRef.current = newMode;
    setOpenMenuLocation(null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tts_play_mode', newMode);
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('tts_auto_play');
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
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Speaker Icon & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                isPlaying
                  ? 'bg-amber-700 text-white animate-pulse'
                  : 'bg-amber-800 text-white'
              }`}
            >
              <span className="text-base sm:text-lg">🔊</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-stone-900 text-sm truncate">
                {t.ttsTitle}
              </div>
              <div className="text-xs text-stone-500 truncate">
                {isPlaying && currentVerseIndex !== null
                  ? `${t.ttsPlaying} (${t.verse} ${verses[currentVerseIndex]?.verse}/${verses.length})`
                  : isPaused
                  ? t.ttsPaused
                  : `${langConfig.flag} ${langConfig.localName} • ${langConfig.bibleName}`}
              </div>
            </div>
          </div>

          {/* Right: Icon Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Play Mode Icon Dropdown */}
            <div className="relative" ref={inlineMenuRef}>
              <button
                onClick={() =>
                  setOpenMenuLocation(openMenuLocation === 'inline' ? null : 'inline')
                }
                className="w-9 h-9 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-sm rounded-xl flex items-center justify-center transition cursor-pointer shadow-2xs"
                title={currentModeOption.label}
              >
                {currentModeOption.icon}
              </button>

              {openMenuLocation === 'inline' && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl py-1.5 z-50">
                  {playModeOptions.map((opt) => {
                    const active = opt.value === playMode;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectPlayMode(opt.value)}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          active
                            ? 'bg-amber-50 text-amber-900'
                            : 'text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                        {active && <span className="text-amber-800 font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Speed Selector: 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x */}
            <select
              value={speechRate.toString()}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="h-9 bg-white border border-stone-300 text-stone-700 text-xs rounded-xl px-2.5 outline-none focus:border-amber-700 transition cursor-pointer font-semibold shadow-2xs"
              title="Tốc độ đọc / Speed"
            >
              {SPEED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Play / Pause Button (Icon only) */}
            {!isPlaying ? (
              <button
                onClick={startPlaying}
                className="w-9 h-9 bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
                title={isPaused ? t.ttsResume : t.ttsPlay}
              >
                ▶
              </button>
            ) : (
              <button
                onClick={pauseAudio}
                className="w-9 h-9 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
                title={t.ttsPaused}
              >
                ⏸
              </button>
            )}

            {/* Stop Button (Icon only) */}
            {(isPlaying || isPaused) && (
              <button
                onClick={() => stopAudio()}
                className="w-9 h-9 bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-bold rounded-xl transition flex items-center justify-center cursor-pointer"
                title={t.ttsStop}
              >
                ⏹
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Floating Bottom Player Bar (shown when user scrolls down past inline card) */}
      <div
        className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl transition-all duration-300 ${
          showFloating
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-12 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border border-amber-300/90 rounded-2xl shadow-xl relative">
          {/* Progress Bar on top edge when playing/paused */}
          {(isPlaying || isPaused) && (
            <div className="w-full h-1 bg-amber-100 rounded-t-2xl overflow-hidden">
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

            {/* Right: Compact Icon Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Play Mode Icon Dropdown (pops upward) */}
              <div className="relative" ref={floatingMenuRef}>
                <button
                  onClick={() =>
                    setOpenMenuLocation(openMenuLocation === 'floating' ? null : 'floating')
                  }
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-sm rounded-xl flex items-center justify-center transition cursor-pointer"
                  title={currentModeOption.label}
                >
                  {currentModeOption.icon}
                </button>

                {openMenuLocation === 'floating' && (
                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl py-1.5 z-50">
                    {playModeOptions.map((opt) => {
                      const active = opt.value === playMode;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelectPlayMode(opt.value)}
                          className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                            active
                              ? 'bg-amber-50 text-amber-900'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </span>
                          {active && <span className="text-amber-800 font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Speed Selector */}
              <select
                value={speechRate.toString()}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="h-8 sm:h-9 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs rounded-xl px-2 outline-none focus:border-amber-700 transition cursor-pointer font-semibold"
                title="Tốc độ đọc / Speed"
              >
                {SPEED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Play / Pause Button (Icon only) */}
              {!isPlaying ? (
                <button
                  onClick={startPlaying}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer"
                  title={isPaused ? t.ttsResume : t.ttsPlay}
                >
                  ▶
                </button>
              ) : (
                <button
                  onClick={pauseAudio}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-700 hover:bg-amber-800 text-white text-sm font-bold rounded-xl transition shadow-2xs flex items-center justify-center cursor-pointer"
                  title={t.ttsPaused}
                >
                  ⏸
                </button>
              )}

              {/* Stop Button (Icon only) */}
              {(isPlaying || isPaused) && (
                <button
                  onClick={() => stopAudio()}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-bold rounded-xl transition flex items-center justify-center cursor-pointer"
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
