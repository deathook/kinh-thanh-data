import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import LessonReaderView, { LessonContent } from '@/components/LessonReaderView';
import { getAllDialogueLessons, getDialogueLessonById } from '@/lib/dialogueData';
import { isValidLang, getLangConfig, getTranslation, LANGUAGE_LIST } from '@/lib/i18n';

interface PageProps {
  params: Promise<{
    lang: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isValidLang(lang)) return { title: 'Not Found' };

  const lesson = getDialogueLessonById(id);
  if (!lesson) return { title: 'Not Found' };

  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);
  const isVi = lang === 'vi';
  const baseUrl = 'https://kinhthanh.khoahoctamlinh.vn';

  const lessonTitle = isVi ? lesson.titleVi : lesson.titleEn;
  const lessonSub = isVi ? lesson.subtitleVi : lesson.subtitleEn;
  const stagePrefix = isVi ? `Chặng ${lesson.stageNumber}` : `Stage ${lesson.stageNumber}`;
  const lessonPrefix = isVi ? `Bài ${lesson.lessonNumber}` : `Lesson ${lesson.lessonNumber}`;
  const sectionLabel = isVi ? 'Đối Thoại - Lời Chúa Cha' : 'The Dialogue - Divine Teachings';

  const title = `${stagePrefix} - ${lessonPrefix}: ${lessonTitle} | ${sectionLabel} - ${t.siteTitle}`;
  const description = `${lessonSub}. ${t.readOnline} - ${cfg.bibleName}.`;

  const alternatesLanguages: Record<string, string> = {};
  LANGUAGE_LIST.forEach((l) => {
    alternatesLanguages[l.code] = `${baseUrl}/${l.code}/bai-hoc/nang-cao/${id}`;
  });

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [lessonTitle, stagePrefix, lessonPrefix, sectionLabel, t.siteTitle, cfg.bibleName],
    alternates: {
      canonical: `${baseUrl}/${lang}/bai-hoc/nang-cao/${id}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/${lang}/bai-hoc/nang-cao/${id}`,
      siteName: t.siteTitle,
      locale: cfg.voiceLang.replace('-', '_'),
      images: [
        {
          url: '/images/feature-graphic.png',
          width: 1024,
          height: 500,
          alt: `${stagePrefix} - ${lessonPrefix}: ${lessonTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/feature-graphic.png'],
    },
  };
}

export default async function LocalizedDialogueLessonDetailPage({ params }: PageProps) {
  const { lang, id } = await params;
  if (!isValidLang(lang)) {
    notFound();
  }

  const lesson = getDialogueLessonById(id);
  if (!lesson) {
    notFound();
  }

  const allLessons = getAllDialogueLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === id);

  const prev =
    currentIndex > 0
      ? {
          id: allLessons[currentIndex - 1].id,
          title: `Chặng ${allLessons[currentIndex - 1].stageNumber} - Bài ${allLessons[currentIndex - 1].lessonNumber}: ${allLessons[currentIndex - 1].titleVi}`,
          href: `/${lang}/bai-hoc/nang-cao/${allLessons[currentIndex - 1].id}`,
        }
      : null;

  const next =
    currentIndex < allLessons.length - 1
      ? {
          id: allLessons[currentIndex + 1].id,
          title: `Chặng ${allLessons[currentIndex + 1].stageNumber} - Bài ${allLessons[currentIndex + 1].lessonNumber}: ${allLessons[currentIndex + 1].titleVi}`,
          href: `/${lang}/bai-hoc/nang-cao/${allLessons[currentIndex + 1].id}`,
        }
      : null;

  const lessonContent: LessonContent = {
    type: 'dialogue',
    id: lesson.id,
    stageNumber: lesson.stageNumber,
    badge: `CHẶNG ${lesson.stageNumber} • BÀI ${lesson.lessonNumber} 👑 Lời Chúa Cha Giảng Dạy`,
    title: lesson.titleVi,
    subtitle: lesson.subtitleVi,
    divineWord: lesson.divineWordVi,
    scriptures: lesson.scriptures,
    roadmapInsight: lesson.roadmapInsightVi,
    egoPitfall: lesson.egoPitfallVi,
    practicalExercise: lesson.practicalExerciseVi,
    contemplativePrayer: lesson.contemplativePrayerVi,
    prevLesson: prev,
    nextLesson: next,
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner currentLang={lang} />
      <Header currentLang={lang} />

      <main className="flex-1 w-full">
        <LessonReaderView lesson={lessonContent} />
      </main>

      <Footer currentLang={lang} />
    </div>
  );
}
