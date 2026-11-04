'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ScriptureItem } from '@/lib/devotionalData';

export interface LessonContent {
  type: 'devotional' | 'dialogue';
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  scriptures: ScriptureItem[];
  // Devotional fields
  innerMeaning?: string;
  selfReflection?: string;
  dailyPractice?: string;
  prayer?: string;
  // Dialogue fields
  stageNumber?: number;
  divineWord?: string;
  roadmapInsight?: string;
  egoPitfall?: string;
  practicalExercise?: string;
  contemplativePrayer?: string;
  // Navigation
  prevLesson?: { id: string; title: string; href: string } | null;
  nextLesson?: { id: string; title: string; href: string } | null;
}

interface LessonReaderViewProps {
  lesson: LessonContent;
}

export default function LessonReaderView({ lesson }: LessonReaderViewProps) {
  // Font size: 'base' | 'lg' | 'xl' | '2xl'
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');

  // TTS State
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState(true);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const rateRef = useRef<number>(1.0);
  const queueRef = useRef<Array<{ id: string; text: string }>>([]);
  const queueIndexRef = useRef<number>(0);

  useEffect(() => {
    rateRef.current = speechRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = speechRate;
    }
  }, [speechRate]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    } else {
      setIsSupported(false);
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
    };
  }, []);

  const stopAudio = useCallback(() => {
    isPlayingRef.current = false;
    queueRef.current = [];
    queueIndexRef.current = 0;
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAll(false);
    setActiveSection(null);
  }, []);

  const speakNextInQueue = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (queueIndexRef.current >= queueRef.current.length) {
      stopAudio();
      return;
    }

    const currentItem = queueRef.current[queueIndexRef.current];
    setActiveSection(currentItem.id);

    // Pick best Vietnamese voice if available
    const voices = synthRef.current ? synthRef.current.getVoices() : [];
    const viVoice =
      voices.find((v) => v.lang.toLowerCase().startsWith('vi') && v.name.toLowerCase().includes('google')) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('vi') && (v.name.includes('An') || v.name.includes('Hoai') || v.name.includes('Nam'))) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('vi'));

    if (viVoice && synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(currentItem.text);
      utterance.lang = 'vi-VN';
      utterance.rate = rateRef.current;
      utterance.voice = viVoice;

      (window as unknown as { _currentLessonUtterance?: SpeechSynthesisUtterance })._currentLessonUtterance = utterance;

      utterance.onend = () => {
        if (isPlayingRef.current) {
          queueIndexRef.current += 1;
          setTimeout(() => {
            if (isPlayingRef.current) {
              speakNextInQueue();
            }
          }, 300);
        }
      };

      utterance.onerror = () => {
        if (isPlayingRef.current) {
          queueIndexRef.current += 1;
          speakNextInQueue();
        }
      };

      synthRef.current.speak(utterance);
    } else {
      // High-definition audio stream via /api/tts
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioUrl = `/api/tts?tl=vi&q=${encodeURIComponent(currentItem.text)}`;
      const audio = new Audio(audioUrl);
      audio.playbackRate = rateRef.current;
      audioRef.current = audio;

      audio.onended = () => {
        if (isPlayingRef.current) {
          queueIndexRef.current += 1;
          setTimeout(() => {
            if (isPlayingRef.current) {
              speakNextInQueue();
            }
          }, 300);
        }
      };

      audio.onerror = () => {
        if (isPlayingRef.current) {
          queueIndexRef.current += 1;
          speakNextInQueue();
        }
      };

      audio.play().catch(() => {
        if (isPlayingRef.current) {
          queueIndexRef.current += 1;
          setTimeout(() => {
            if (isPlayingRef.current) speakNextInQueue();
          }, 300);
        }
      });
    }
  }, [stopAudio]);

  const speakSingleSection = useCallback((sectionId: string, text: string) => {
    if (!synthRef.current) return;

    if (activeSection === sectionId && isPlayingRef.current) {
      stopAudio();
      return;
    }

    stopAudio();
    isPlayingRef.current = true;
    queueRef.current = [{ id: sectionId, text }];
    queueIndexRef.current = 0;
    speakNextInQueue();
  }, [activeSection, speakNextInQueue, stopAudio]);

  const playEntireLesson = useCallback(() => {
    if (!synthRef.current) return;

    if (isPlayingAll) {
      stopAudio();
      return;
    }

    stopAudio();
    isPlayingRef.current = true;
    setIsPlayingAll(true);

    const items: Array<{ id: string; text: string }> = [];

    // 1. Title & Subtitle
    items.push({
      id: 'header',
      text: `${lesson.title}. ${lesson.subtitle}.`,
    });

    if (lesson.type === 'dialogue') {
      // Dialogue sequence
      if (lesson.divineWord) {
        items.push({
          id: 'divine_word',
          text: `Lời Chúa Cha giảng dạy. ${lesson.divineWord}`,
        });
      }
      lesson.scriptures.forEach((s, idx) => {
        items.push({
          id: `scripture_${idx}`,
          text: `Đối chiếu Kinh Thánh, ${s.refVi}. ${s.textVi}. Suy ngẫm: ${s.noteVi}`,
        });
      });
      if (lesson.roadmapInsight) {
        items.push({
          id: 'roadmap',
          text: `Bản đồ chỉ đường và chiều sâu tâm thức. ${lesson.roadmapInsight}`,
        });
      }
      if (lesson.egoPitfall) {
        items.push({
          id: 'pitfall',
          text: `Cạm bẫy bản ngã cần cảnh giác. ${lesson.egoPitfall}`,
        });
      }
      if (lesson.practicalExercise) {
        items.push({
          id: 'practice',
          text: `Bài tập rèn luyện tâm thức. ${lesson.practicalExercise}`,
        });
      }
      if (lesson.contemplativePrayer) {
        items.push({
          id: 'prayer',
          text: `Lời kinh kết hiệp. ${lesson.contemplativePrayer}`,
        });
      }
    } else {
      // Devotional sequence
      lesson.scriptures.forEach((s, idx) => {
        items.push({
          id: `scripture_${idx}`,
          text: `Lắng nghe Lời Chúa, ${s.refVi}. ${s.textVi}. Gợi mở: ${s.noteVi}`,
        });
      });
      if (lesson.innerMeaning) {
        items.push({
          id: 'meaning',
          text: `Giải mã ẩn dụ và chiều sâu tâm linh. ${lesson.innerMeaning}`,
        });
      }
      if (lesson.selfReflection) {
        items.push({
          id: 'reflection',
          text: `Tự vấn lương tâm. ${lesson.selfReflection}`,
        });
      }
      if (lesson.dailyPractice) {
        items.push({
          id: 'practice',
          text: `Bài tập rèn luyện hằng ngày. ${lesson.dailyPractice}`,
        });
      }
      if (lesson.prayer) {
        items.push({
          id: 'prayer',
          text: `Lời kinh tỉnh thức. ${lesson.prayer}`,
        });
      }
    }

    queueRef.current = items;
    queueIndexRef.current = 0;
    speakNextInQueue();
  }, [isPlayingAll, lesson, speakNextInQueue, stopAudio]);

  // Dynamic font size classes
  const contentFontClass =
    fontSize === 'normal'
      ? 'text-base sm:text-[17px] leading-relaxed'
      : fontSize === 'large'
      ? 'text-lg sm:text-xl leading-relaxed'
      : 'text-xl sm:text-2xl leading-relaxed';

  return (
    <div className="w-full">
      {/* Top Floating Controls Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 py-2.5 px-4 mb-6 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Breadcrumbs or Back Link */}
          <Link
            href="/vi/bai-hoc"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-800 transition-colors"
          >
            <span>←</span>
            <span className="hidden sm:inline">Danh sách</span> bài học
          </Link>

          {/* Center Play Audio Button */}
          <div className="flex items-center gap-2">
            {isSupported && (
              <button
                onClick={playEntireLesson}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
                  isPlayingAll
                    ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                    : 'bg-stone-900 hover:bg-amber-900 text-white'
                }`}
              >
                <span>{isPlayingAll ? '⏹ Dừng nghe' : '🎧 Nghe toàn bộ'}</span>
              </button>
            )}

            {/* Speed toggle */}
            {isPlayingRef.current && (
              <button
                onClick={() => {
                  const rates = [0.8, 1.0, 1.25];
                  const nextIndex = (rates.indexOf(speechRate) + 1) % rates.length;
                  setSpeechRate(rates[nextIndex]);
                }}
                className="text-[11px] font-mono px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md border border-stone-200"
                title="Thay đổi tốc độ đọc"
              >
                {speechRate}x
              </button>
            )}
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200">
            <span className="text-[11px] font-bold text-stone-400 px-1 select-none">T</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                fontSize === 'normal'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Vừa
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                fontSize === 'large'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Lớn
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                fontSize === 'huge'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Rất lớn
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        {/* Main Banner Card (Deep Warm Mahogany / Brown) */}
        <div className="bg-[#3D251E] text-white rounded-3xl p-6 sm:p-9 shadow-md mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="inline-block bg-[#633C30] text-amber-200 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/30">
              {lesson.badge}
            </span>

            {isSupported && (
              <button
                onClick={playEntireLesson}
                className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 text-amber-300 hover:text-white px-3.5 py-1.5 rounded-full text-xs font-medium border border-amber-500/20 transition"
              >
                <span>🎧</span>
                <span>{isPlayingAll ? 'Đang đọc...' : 'Nghe toàn bộ'}</span>
              </button>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-amber-50 leading-tight mb-3">
            {lesson.title}
          </h1>
          <p className="font-sans italic text-amber-200/90 text-sm sm:text-base leading-relaxed">
            {lesson.subtitle}
          </p>
        </div>

        {/* DIALOGUE SPECIFIC: Lời Chúa Cha Giảng Dạy */}
        {lesson.type === 'dialogue' && lesson.divineWord && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                  <span>👤</span>
                  <span>Lời Chúa Cha Giảng Dạy</span>
                </h2>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  Trích xuất kiệt tác Đối Thoại – Lm. Vinhsơn Bùi Đức Sinh dịch
                </p>
              </div>

              {isSupported && (
                <button
                  onClick={() => speakSingleSection('divine_word', lesson.divineWord || '')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'divine_word'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            {/* Glowing Golden Box for Divine Words */}
            <div
              className={`bg-amber-50/60 border-2 border-amber-300/80 rounded-2xl p-6 sm:p-8 shadow-xs transition-all ${
                activeSection === 'divine_word' ? 'ring-2 ring-amber-500 bg-amber-100/70' : ''
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
                <span>✨</span>
                <span>Tiếng Phán Thần Linh</span>
              </div>
              <blockquote className={`font-serif italic text-stone-900 leading-relaxed ${contentFontClass}`}>
                “{lesson.divineWord}”
              </blockquote>
            </div>
          </section>
        )}

        {/* SCRIPTURES: Lắng Nghe Lời Chúa / Đối Chiếu Kinh Thánh */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
              <span>📖</span>
              <span>
                {lesson.type === 'dialogue' ? 'Đối Chiếu Kinh Thánh' : 'Lắng Nghe Lời Chúa'}
              </span>
            </h2>
            <span className="text-xs text-stone-500">
              {lesson.scriptures.length} câu đối chiếu
            </span>
          </div>

          <div className="space-y-4">
            {lesson.scriptures.map((s, idx) => (
              <div
                key={idx}
                className={`bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-amber-400 ${
                  activeSection === `scripture_${idx}` ? 'ring-2 ring-amber-500 bg-amber-50/50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-800 text-base">📙</span>
                    <span className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                      {s.refVi}
                    </span>
                  </div>

                  {/* Jump directly to chapter verse in Bible Reader */}
                  <Link
                    href={`/vi/kinh-thanh/${s.slugVi}/${s.chapter}#cau-${s.verse}`}
                    className="inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full transition shadow-2xs"
                  >
                    <span>Đối chiếu</span>
                    <span>→</span>
                  </Link>
                </div>

                <blockquote className={`font-serif text-stone-800 leading-relaxed mb-3 ${contentFontClass}`}>
                  “{s.textVi}”
                </blockquote>

                {/* Insight Note Box */}
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-3 text-xs sm:text-sm text-stone-700 leading-relaxed flex items-start gap-2">
                  <span className="text-amber-700 text-sm mt-0.5">💡</span>
                  <span>{s.noteVi}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DEVOTIONAL: Giải Mã Ẩn Dụ & Chiều Sâu Tâm Linh */}
        {lesson.type === 'devotional' && lesson.innerMeaning && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span>💡</span>
                <span>Giải Mã Ẩn Dụ & Chiều Sâu Tâm Linh</span>
              </h2>

              {isSupported && (
                <button
                  onClick={() => speakSingleSection('meaning', lesson.innerMeaning || '')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'meaning'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            <div
              className={`bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs text-stone-800 font-sans ${contentFontClass} ${
                activeSection === 'meaning' ? 'ring-2 ring-amber-500 bg-amber-50/40' : ''
              }`}
            >
              {lesson.innerMeaning}
            </div>
          </section>
        )}

        {/* DEVOTIONAL: Tự Vấn Lương Tâm */}
        {lesson.type === 'devotional' && lesson.selfReflection && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span>🔍</span>
                <span>Tự Vấn Lương Tâm</span>
              </h2>

              {isSupported && (
                <button
                  onClick={() => speakSingleSection('reflection', lesson.selfReflection || '')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'reflection'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            <div
              className={`bg-stone-50 border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs text-stone-800 font-sans ${contentFontClass} ${
                activeSection === 'reflection' ? 'ring-2 ring-amber-500 bg-amber-50/40' : ''
              }`}
            >
              {lesson.selfReflection}
            </div>
          </section>
        )}

        {/* DIALOGUE: Bản Đồ Chỉ Đường & Chiều Sâu Tâm Thức */}
        {lesson.type === 'dialogue' && lesson.roadmapInsight && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span>🗺️</span>
                <span>Bản Đồ Chỉ Đường & Chiều Sâu Tâm Thức</span>
              </h2>

              {isSupported && (
                <button
                  onClick={() => speakSingleSection('roadmap', lesson.roadmapInsight || '')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'roadmap'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            <div
              className={`bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-xs text-stone-800 font-sans ${contentFontClass} ${
                activeSection === 'roadmap' ? 'ring-2 ring-amber-500 bg-amber-50/40' : ''
              }`}
            >
              {lesson.roadmapInsight}
            </div>
          </section>
        )}

        {/* DIALOGUE: Cạm Bẫy Bản Ngã Cần Cảnh Giác */}
        {lesson.type === 'dialogue' && lesson.egoPitfall && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-950 flex items-center gap-2">
                <span>⚠️</span>
                <span>Cạm Bẫy Bản Ngã Cần Cảnh Giác</span>
              </h2>

              {isSupported && (
                <button
                  onClick={() => speakSingleSection('pitfall', lesson.egoPitfall || '')}
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'pitfall'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            <div
              className={`bg-rose-50/60 border border-rose-200 rounded-2xl p-6 sm:p-7 shadow-xs text-rose-950 font-sans ${contentFontClass} ${
                activeSection === 'pitfall' ? 'ring-2 ring-rose-500 bg-rose-100/60' : ''
              }`}
            >
              {lesson.egoPitfall}
            </div>
          </section>
        )}

        {/* PRACTICAL EXERCISE (Cả Căn bản & Nâng cao) */}
        {(lesson.dailyPractice || lesson.practicalExercise) && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span>🌱</span>
                <span>
                  {lesson.type === 'dialogue'
                    ? 'Bài Tập Rèn Luyện Tâm Thức'
                    : 'Bài Tập Rèn Luyện Hằng Ngày'}
                </span>
              </h2>

              {isSupported && (
                <button
                  onClick={() =>
                    speakSingleSection('practice', (lesson.dailyPractice || lesson.practicalExercise) || '')
                  }
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'practice'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            <div
              className={`bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 sm:p-7 shadow-xs text-emerald-950 font-sans ${contentFontClass} ${
                activeSection === 'practice' ? 'ring-2 ring-emerald-500 bg-emerald-100/60' : ''
              }`}
            >
              {lesson.dailyPractice || lesson.practicalExercise}
            </div>
          </section>
        )}

        {/* PRAYER SECTION (Cả Căn bản & Nâng cao) */}
        {(lesson.prayer || lesson.contemplativePrayer) && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2">
                <span>🙏</span>
                <span>
                  {lesson.type === 'dialogue' ? 'Lời Kinh Kết Hiệp' : 'Lời Kinh Tỉnh Thức'}
                </span>
              </h2>

              {isSupported && (
                <button
                  onClick={() =>
                    speakSingleSection('prayer', (lesson.prayer || lesson.contemplativePrayer) || '')
                  }
                  className={`p-2 rounded-full transition-colors ${
                    activeSection === 'prayer'
                      ? 'bg-amber-600 text-white animate-pulse'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Nghe đoạn này"
                >
                  🔊
                </button>
              )}
            </div>

            <div
              className={`bg-amber-50/80 border border-amber-200 rounded-2xl p-6 sm:p-8 shadow-xs text-stone-900 font-serif italic ${contentFontClass} ${
                activeSection === 'prayer' ? 'ring-2 ring-amber-500 bg-amber-100/70' : ''
              }`}
            >
              “{lesson.prayer || lesson.contemplativePrayer}”
            </div>
          </section>
        )}

        {/* Bottom Pagination: Next & Back Lesson */}
        <div className="border-t border-stone-200 pt-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {lesson.prevLesson ? (
            <Link
              href={lesson.prevLesson.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-amber-50/80 border border-stone-300 text-stone-800 text-sm font-semibold px-5 py-3 rounded-xl transition shadow-xs"
            >
              <span>←</span>
              <span className="truncate max-w-[200px]">{lesson.prevLesson.title}</span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          <Link
            href="/vi/bai-hoc"
            className="text-xs font-semibold text-stone-500 hover:text-amber-800 transition"
          >
            Tất cả 31 bài học
          </Link>

          {lesson.nextLesson ? (
            <Link
              href={lesson.nextLesson.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold px-5 py-3 rounded-xl transition shadow-xs"
            >
              <span className="truncate max-w-[200px]">{lesson.nextLesson.title}</span>
              <span>→</span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      </div>
    </div>
  );
}
