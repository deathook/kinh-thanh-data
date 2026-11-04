import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import { getAllDevotionalTopics, getAllDevotionalLessons } from '@/lib/devotionalData';
import { getAllDialogueStages, getAllDialogueLessons } from '@/lib/dialogueData';
import { isValidLang, getLangConfig, getTranslation } from '@/lib/i18n';
import { getHomeTranslation } from '@/lib/homeI18n';

interface PageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isValidLang(lang)) return { title: 'Not Found' };

  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);
  const ht = getHomeTranslation(lang);

  return {
    title: `${t.lessons} (${t.lessonsBadge}) - ${ht.lessonsSectionTitle} | ${cfg.localName}`,
    description: `${ht.track1Title} & ${ht.track2Title} - 31 Spiritual Lessons.`,
  };
}

export default async function LocalizedLessonsPage({ params }: PageProps) {
  const { lang } = await params;
  if (!isValidLang(lang)) {
    notFound();
  }

  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);
  const ht = getHomeTranslation(lang);

  const devotionalTopics = getAllDevotionalTopics();
  const devotionalLessons = getAllDevotionalLessons();
  const dialogueStages = getAllDialogueStages();
  const dialogueLessons = getAllDialogueLessons();

  const isVi = lang === 'vi';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner currentLang={lang} />
      <Header currentLang={lang} />

      {/* Hero Header Section */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-stone-200/80 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
            <span>✨</span>
            <span>
              {isVi
                ? `Kho Tàng Tâm Thức & Lời Chúa Ứng Nghiệm (${cfg.localName})`
                : `${ht.lessonsSectionTag} (${cfg.localName})`}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight mb-4">
            {ht.lessonsSectionTitle}
          </h1>

          <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            {isVi
              ? 'Lộ trình soi sáng từ căn bản đến nâng cao. Từng bài học đều đan cài các câu Kinh Thánh đối chiếu trực tiếp, hướng dẫn giải mã ẩn dụ và bài tập rèn luyện nội tâm hằng ngày.'
              : `${ht.track1Desc} ${ht.track2Desc}`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <a
              href="#can-ban"
              className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-full shadow-xs transition"
            >
              🌱 {ht.track1Badge}
            </a>
            <a
              href="#nang-cao"
              className="bg-[#3D251E] hover:bg-[#2c1913] text-amber-200 px-4 py-2 rounded-full shadow-xs transition border border-amber-900/60"
            >
              👑 {ht.track2Badge}
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-16">
        {/* ========================================================= */}
        {/* SECTION 1: LỘ TRÌNH CĂN BẢN (15 BÀI) */}
        {/* ========================================================= */}
        <section id="can-ban" className="scroll-mt-20">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
              <span>🌱</span>
              <span>{ht.track1Badge} • {ht.track1Focus}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
              {ht.track1Title}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base max-w-3xl leading-relaxed">
              {ht.track1Desc}
            </p>
          </div>

          <div className="space-y-8">
            {devotionalTopics.map((topic) => {
              const lessonsOfTopic = devotionalLessons.filter((l) => l.topicId === topic.id);
              const topicTitle = isVi ? topic.titleVi : (topic.titleEn || topic.titleVi);
              const topicSubtitle = isVi ? topic.subtitleVi : (topic.subtitleEn || topic.subtitleVi);

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-xs p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
                    <span className="text-3xl">{topic.iconEmoji}</span>
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        {topicTitle}
                      </h3>
                      <p className="text-xs text-stone-500">{topicSubtitle}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lessonsOfTopic.map((lesson) => {
                      const lessonTitle = isVi ? lesson.titleVi : (lesson.titleEn || lesson.titleVi);
                      const lessonSubtitle = isVi ? lesson.subtitleVi : (lesson.subtitleEn || lesson.subtitleVi);
                      const dayLabel = isVi
                        ? `Ngày ${lesson.dayNumber}`
                        : lang === 'es'
                        ? `Día ${lesson.dayNumber}`
                        : lang === 'fr'
                        ? `Jour ${lesson.dayNumber}`
                        : `Day ${lesson.dayNumber}`;

                      return (
                        <Link
                          key={lesson.id}
                          href={`/${lang}/bai-hoc/can-ban/${lesson.id}`}
                          className="group flex flex-col justify-between p-4 rounded-2xl bg-stone-50/80 hover:bg-amber-50/70 border border-stone-200/70 hover:border-amber-400 transition shadow-2xs hover:shadow-xs"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-amber-800 mb-1">
                              {dayLabel}
                            </div>
                            <div className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-900 transition mb-2">
                              {lessonTitle}
                            </div>
                            <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                              {lessonSubtitle}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-[11px] font-semibold text-amber-800">
                            <span>
                              {lesson.scriptures.length}{' '}
                              {isVi ? 'Câu gốc đối chiếu' : 'Scriptures'}
                            </span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: LỘ TRÌNH NÂNG CAO (16 BÀI) */}
        {/* ========================================================= */}
        <section id="nang-cao" className="scroll-mt-20">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
              <span>👑</span>
              <span>{ht.track2Badge} • {ht.track2Focus}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-3">
              {ht.track2Title}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base max-w-3xl leading-relaxed">
              {ht.track2Desc}
            </p>
          </div>

          <div className="space-y-8">
            {dialogueStages.map((stage) => {
              const lessonsOfStage = dialogueLessons.filter((l) => l.stageId === stage.id);
              const stageTitle = isVi ? stage.titleVi : (stage.titleEn || stage.titleVi);
              const stageDesc = isVi ? stage.descriptionVi : (stage.descriptionEn || stage.descriptionVi);
              const stagePrefix = isVi ? 'Chặng' : (lang === 'es' ? 'Etapa' : (lang === 'fr' ? 'Étape' : 'Stage'));

              return (
                <div
                  key={stage.id}
                  className="bg-[#2B1B17] text-white rounded-3xl border border-amber-900/40 shadow-sm p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-800">
                    <span className="text-3xl">{stage.iconEmoji}</span>
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-50">
                        {stagePrefix} {stage.stageNumber}: {stageTitle}
                      </h3>
                      <p className="text-xs text-amber-200/80">{stageDesc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {lessonsOfStage.map((lesson) => {
                      const lessonTitle = isVi ? lesson.titleVi : (lesson.titleEn || lesson.titleVi);
                      const lessonSubtitle = isVi ? lesson.subtitleVi : (lesson.subtitleEn || lesson.subtitleVi);
                      const lessonPrefix = isVi ? 'Bài' : (lang === 'es' ? 'Lección' : (lang === 'fr' ? 'Leçon' : 'Lesson'));

                      return (
                        <Link
                          key={lesson.id}
                          href={`/${lang}/bai-hoc/nang-cao/${lesson.id}`}
                          className="group flex flex-col justify-between p-4 rounded-2xl bg-black/25 hover:bg-black/45 border border-amber-500/20 hover:border-amber-400 transition"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-amber-300 mb-1">
                              {lessonPrefix} {lesson.lessonNumber}
                            </div>
                            <div className="font-serif font-bold text-amber-50 text-base group-hover:text-amber-200 transition mb-2">
                              {lessonTitle}
                            </div>
                            <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                              {lessonSubtitle}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-300">
                            <span>
                              {lesson.scriptures.length}{' '}
                              {isVi ? 'Câu gốc minh họa' : 'Scriptures'}
                            </span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer currentLang={lang} />
    </div>
  );
}
