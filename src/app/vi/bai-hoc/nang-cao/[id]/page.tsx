import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import LessonReaderView, { LessonContent } from '@/components/LessonReaderView';
import { getAllDialogueLessons, getDialogueLessonById } from '@/lib/dialogueData';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  const lessons = getAllDialogueLessons();
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = getDialogueLessonById(id);
  if (!lesson) return { title: 'Không tìm thấy bài học' };

  return {
    title: `Chặng ${lesson.stageNumber} - Bài ${lesson.lessonNumber}: ${lesson.titleVi} | Lời Chúa Cha Giảng Dạy`,
    description: `Trích xuất tác phẩm Đối Thoại của Thánh Catarina Siena: ${lesson.subtitleVi}. Bài học tâm thức nâng cao kết hiệp với Thiên Chúa.`,
    keywords: [
      lesson.titleVi,
      'Lời Chúa Cha giảng dạy',
      'Thánh Catarina Siena',
      'Đối Thoại',
      'Bản đồ tâm linh',
      'Tâm linh Công giáo',
    ],
  };
}

export default async function DialogueLessonDetailPage({ params }: PageProps) {
  const { id } = await params;
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
          href: `/vi/bai-hoc/nang-cao/${allLessons[currentIndex - 1].id}`,
        }
      : null;

  const next =
    currentIndex < allLessons.length - 1
      ? {
          id: allLessons[currentIndex + 1].id,
          title: `Chặng ${allLessons[currentIndex + 1].stageNumber} - Bài ${allLessons[currentIndex + 1].lessonNumber}: ${allLessons[currentIndex + 1].titleVi}`,
          href: `/vi/bai-hoc/nang-cao/${allLessons[currentIndex + 1].id}`,
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
      <SmartAppBanner />
      <Header />

      <main className="flex-1 w-full">
        <LessonReaderView lesson={lessonContent} />
      </main>

      <Footer />
    </div>
  );
}
