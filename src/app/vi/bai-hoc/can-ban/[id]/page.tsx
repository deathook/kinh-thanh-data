import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import LessonReaderView, { LessonContent } from '@/components/LessonReaderView';
import { getAllDevotionalLessons, getDevotionalLessonById } from '@/lib/devotionalData';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const lessons = getAllDevotionalLessons();
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = getDevotionalLessonById(id);
  if (!lesson) return { title: 'Không tìm thấy bài học' };

  return {
    title: `Bài ${lesson.dayNumber}: ${lesson.titleVi} | Góc Suy Gẫm & Tỉnh Thức`,
    description: `${lesson.subtitleVi}. Bài học tĩnh tâm tâm linh với các câu Kinh Thánh đối chiếu trực tiếp và bài tập rèn luyện thực tế.`,
    keywords: [lesson.titleVi, 'Góc suy gẫm', 'Tĩnh tâm', 'Kinh Thánh', 'Tâm linh Công giáo'],
  };
}

export default async function DevotionalLessonDetailPage({ params }: PageProps) {
  const { id } = await params;
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
          href: `/vi/bai-hoc/can-ban/${allLessons[currentIndex - 1].id}`,
        }
      : null;

  const next =
    currentIndex < allLessons.length - 1
      ? {
          id: allLessons[currentIndex + 1].id,
          title: `Bài ${allLessons[currentIndex + 1].dayNumber}: ${allLessons[currentIndex + 1].titleVi}`,
          href: `/vi/bai-hoc/can-ban/${allLessons[currentIndex + 1].id}`,
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
      <SmartAppBanner />
      <Header />

      <main className="flex-1 w-full">
        <LessonReaderView lesson={lessonContent} />
      </main>

      <Footer />
    </div>
  );
}
