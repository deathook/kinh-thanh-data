'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getLangConfig, getTranslation } from '@/lib/i18n';

interface WebTtsPlayerProps {
  verses: Array<{ verse: number; text: string }>;
  title: string;
  lang: string;
}

export default function WebTtsPlayer({ verses, title, lang }: WebTtsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState<number | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeIndexRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const rateRef = useRef<number>(1.0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const langConfig = getLangConfig(lang);
  const t = getTranslation(lang);

  useEffect(() => {
    rateRef.current = speechRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = speechRate;
    }
  }, [speechRate]);

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
      // Clean up karaoke highlights
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

    // 1. Search for keyword matches (e.g. "Google tiếng Việt", "An", "HoaiMy")
    for (const kw of cfg.voiceKeywords) {
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(prefix) &&
          v.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (match) return match;
    }

    // 2. Exact match on language tag
    const exact = voices.find(
      (v) => v.lang.toLowerCase().replace('_', '-') === cfg.voiceLang.toLowerCase().replace('_', '-')
    );
    if (exact) return exact;

    // 3. Prefix match
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

      // Check if browser has genuine native voice for this language
      const matchedVoice = findMatchingVoice(voicesRef.current, lang);

      if (matchedVoice && synthRef.current) {
        // Option A: Use Web Speech API with verified native voice
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
        // Option B: High-definition Google TTS Audio Stream via /api/tts
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

  return (
    <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 my-6 shadow-xs">
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
          {/* Speed Selector: 0.5x, 0.75x, 1x (default), 1.5x, 2.0x */}
          <select
            value={speechRate.toString()}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setSpeechRate(val);
            }}
            className="bg-white border border-stone-300 text-stone-700 text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-700 transition cursor-pointer font-medium shadow-2xs"
            title="Tốc độ đọc / Speech rate"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x (Chuẩn)</option>
            <option value="1.5">1.5x</option>
            <option value="2">2.0x</option>
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
  );
}
