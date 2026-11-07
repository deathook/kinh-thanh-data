import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import LessonReaderView, { LessonContent } from '@/components/LessonReaderView';
import { getAllDevotionalLessons, getDevotionalLessonById } from '@/lib/devotionalData';
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

  const lesson = getDevotionalLessonById(id);
  if (!lesson) return { title: 'Not Found' };

  const cfg = getLangConfig(lang);
  const t = getTranslation(lang);
  const isVi = lang === 'vi';
  const baseUrl = 'https://kinhthanh.khoahoctamlinh.vn';

  const lessonTitle = isVi ? lesson.titleVi : lesson.titleEn;
  const lessonSub = isVi ? lesson.subtitleVi : lesson.subtitleEn;
  const dayPrefix = isVi ? `Bài ${lesson.dayNumber}` : `Lesson ${lesson.dayNumber}`;
  const sectionLabel = isVi ? 'Góc Suy Gẫm & Tỉnh Thức' : 'Mindful Consciousness & Devotional';

  const title = `${dayPrefix}: ${lessonTitle} | ${sectionLabel} - ${t.siteTitle}`;
  const description = `${lessonSub}. ${t.readOnline} - ${cfg.bibleName}.`;

  const alternatesLanguages: Record<string, string> = {};
  LANGUAGE_LIST.forEach((l) => {
    alternatesLanguages[l.code] = `${baseUrl}/${l.code}/bai-hoc/can-ban/${id}`;
  });

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [lessonTitle, dayPrefix, sectionLabel, t.siteTitle, cfg.bibleName],
    alternates: {
      canonical: `${baseUrl}/${lang}/bai-hoc/can-ban/${id}`,
      languages: alternatesLanguages,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${baseUrl}/${lang}/bai-hoc/can-ban/${id}`,
      siteName: t.siteTitle,
      locale: cfg.voiceLang.replace('-', '_'),
      images: [
        {
          url: '/images/feature-graphic.png',
          width: 1024,
          height: 500,
          alt: `${dayPrefix}: ${lessonTitle}`,
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

export default async function LocalizedDevotionalDetailPage({ params }: PageProps) {
  const { lang, id } = await params;
  if (!isValidLang(lang)) {
    notFound();
  }

  const lesson = getDevotionalLessonById(id);
  if (!lesson) {
    notFound();
  }

  const allLessons = getAllDevotionalLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === id);

  const prev =
    currentIndex > 0
      ? {
          id: allLessons[currentIndex - 1].id,
          title: `Bài ${allLessons[currentIndex - 1].dayNumber}: ${allLessons[currentIndex - 1].titleVi}`,
          href: `/${lang}/bai-hoc/can-ban/${allLessons[currentIndex - 1].id}`,
        }
      : null;

  const next =
    currentIndex < allLessons.length - 1
      ? {
          id: allLessons[currentIndex + 1].id,
          title: `Bài ${allLessons[currentIndex + 1].dayNumber}: ${allLessons[currentIndex + 1].titleVi}`,
          href: `/${lang}/bai-hoc/can-ban/${allLessons[currentIndex + 1].id}`,
        }
      : null;

  const lessonContent: LessonContent = {
    type: 'devotional',
    id: lesson.id,
    badge: `BÀI ${lesson.dayNumber} • ${lesson.topicTitleVi}`,
    title: lesson.titleVi,
    subtitle: lesson.subtitleVi,
    scriptures: lesson.scriptures,
    innerMeaning: lesson.innerMeaningVi,
    selfReflection: lesson.selfReflectionVi,
    dailyPractice: lesson.dailyPracticeVi,
    prayer: lesson.prayerVi,
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
