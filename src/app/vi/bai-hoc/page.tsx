import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmartAppBanner from '@/components/SmartAppBanner';
import { getAllDevotionalTopics, getAllDevotionalLessons } from '@/lib/devotionalData';
import { getAllDialogueStages, getAllDialogueLessons } from '@/lib/dialogueData';

export const metadata: Metadata = {
  title: '31 Bài Học Tâm Linh & Lời Chúa Cha Giảng Dạy | Đọc & Nghe Online',
  description: 'Khám phá 15 bài học Căn Bản suy gẫm tỉnh thức và 16 bài học Nâng Cao trích từ kiệt tác Đối Thoại của Thánh Catarina Siena. Tích hợp đối chiếu Kinh Thánh và đọc to bằng giọng đọc trực tuyến.',
  keywords: ['Bài học Kinh Thánh', 'Góc suy gẫm', 'Lời Chúa Cha giảng dạy', 'Thánh Catarina Siena', 'Đối Thoại', 'Tâm linh Công giáo'],
};

export default function LessonsDirectoryPage() {
  const devotionalTopics = getAllDevotionalTopics();
  const devotionalLessons = getAllDevotionalLessons();
  const dialogueStages = getAllDialogueStages();
  const dialogueLessons = getAllDialogueLessons();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      <SmartAppBanner />
      <Header />

      {/* Hero Header Section */}
      <section className="bg-gradient-to-b from-white to-[#FAF8F5] border-b border-stone-200/80 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-1.5 rounded-full mb-4 shadow-2xs">
            <span>✨</span>
            <span>Kho Tàng Tâm Thức & Lời Chúa Ứng Nghiệm</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight mb-4">
            31 Bài Học Tâm Linh Thức Tỉnh & Chuyển Hóa
          </h1>

          <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            Lộ trình soi sáng từ căn bản đến nâng cao. Từng bài học đều đan cài các câu Kinh Thánh đối chiếu trực tiếp, hướng dẫn giải mã ẩn dụ và bài tập rèn luyện nội tâm hằng ngày.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <a
              href="#can-ban"
              className="bg-amber-800 hover:bg-amber-900 text-white px-4 py-2 rounded-full shadow-xs transition"
            >
              🌱 15 Bài Căn Bản (Góc Suy Gẫm)
            </a>
            <a
              href="#nang-cao"
              className="bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-full shadow-xs transition"
            >
              👑 16 Bài Nâng Cao (Lời Chúa Cha)
            </a>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 space-y-16">
        {/* ========================================================= */}
        {/* SECTION 1: LỘ TRÌNH CĂN BẢN (15 BÀI DEVOTIONAL) */}
        {/* ========================================================= */}
        <section id="can-ban" className="scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-amber-800/20 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                <span>🌱</span>
                <span>Lộ Trình Căn Bản • 15 Ngày Tĩnh Tâm</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Góc Suy Gẫm & Tỉnh Thức
              </h2>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md">
              Dành cho mọi tín hữu mong muốn xây dựng nền tảng vững vàng trong đời sống đức tin, chữa lành tổn thương và vượt qua áp lực cuộc sống.
            </p>
          </div>

          {/* Topics Grid */}
          <div className="space-y-10">
            {devotionalTopics.map((topic, topicIdx) => {
              const lessons = devotionalLessons.filter((l) => l.topicId === topic.id);

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs"
                >
                  {/* Topic Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-3xl p-3 bg-amber-50 rounded-2xl border border-amber-200/60 shrink-0">
                      {topic.iconEmoji}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                        Chủ Đề {topicIdx + 1}
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        {topic.titleVi}
                      </h3>
                      <p className="text-stone-500 text-xs sm:text-sm mt-1">
                        {topic.descriptionVi}
                      </p>
                    </div>
                  </div>

                  {/* Lessons in Topic */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/vi/bai-hoc/can-ban/${lesson.id}`}
                        className="group flex flex-col justify-between bg-[#FAF8F5] hover:bg-amber-50/70 border border-stone-200 hover:border-amber-400 p-5 rounded-2xl transition-all shadow-2xs hover:shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="bg-amber-800/10 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              Ngày {lesson.dayNumber}
                            </span>
                            <span className="text-xs text-stone-400 font-mono">
                              {lesson.scriptures.length} câu đối chiếu
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-900 transition mb-1 leading-snug">
                            {lesson.titleVi}
                          </h4>

                          <p className="text-xs text-stone-500 italic line-clamp-2 mb-3">
                            {lesson.subtitleVi}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-semibold text-amber-800 group-hover:text-amber-900">
                          <span>Đọc & Nghe audio</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: LỘ TRÌNH NÂNG CAO (16 BÀI DIALOGUE) */}
        {/* ========================================================= */}
        <section id="nang-cao" className="scroll-mt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b-2 border-amber-900/40 pb-4">
            <div>
              <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider mb-1">
                <span>👑</span>
                <span>Lộ Trình Nâng Cao • 16 Bài Chuyển Hóa Tâm Thức</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                Bản Đồ Tâm Linh: Lời Chúa Cha Giảng Dạy
              </h2>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm max-w-md">
              Trích xuất từ kiệt tác <em>Đối Thoại</em> của Thánh Catarina Siena (Lm. Vinhsơn Bùi Đức Sinh dịch) — Lộ trình thần bí đưa linh hồn vượt qua bản ngã giả tạo để kết hiệp mật thiết với Thiên Chúa.
            </p>
          </div>

          {/* Stages Grid */}
          <div className="space-y-10">
            {dialogueStages.map((stage) => {
              const lessons = dialogueLessons.filter((l) => l.stageId === stage.id);

              return (
                <div
                  key={stage.id}
                  className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs"
                >
                  {/* Stage Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <span className="text-3xl p-3 bg-amber-50 rounded-2xl border border-amber-200/60 shrink-0">
                      {stage.iconEmoji}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Chặng {stage.stageNumber}
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        {stage.titleVi}
                      </h3>
                      <p className="text-stone-500 text-xs sm:text-sm mt-1">
                        {stage.descriptionVi}
                      </p>
                    </div>
                  </div>

                  {/* Lessons in Stage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/vi/bai-hoc/nang-cao/${lesson.id}`}
                        className="group flex flex-col justify-between bg-[#FAF8F5] hover:bg-amber-50/70 border border-stone-200 hover:border-amber-400 p-5 rounded-2xl transition-all shadow-2xs hover:shadow-xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="bg-[#3D251E] text-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              Chặng {lesson.stageNumber} • Bài {lesson.lessonNumber}
                            </span>
                          </div>

                          <h4 className="font-serif font-bold text-stone-900 text-base group-hover:text-amber-900 transition mb-1 leading-snug">
                            {lesson.titleVi}
                          </h4>

                          <p className="text-xs text-stone-500 italic line-clamp-2 mb-3">
                            {lesson.subtitleVi}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs font-semibold text-amber-900 group-hover:text-amber-950">
                          <span>Đọc lời phán & bài tập</span>
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* APK Call to Action */}
        <section className="bg-gradient-to-r from-amber-900 via-stone-900 to-black text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg">
          <div className="max-w-2xl mx-auto">
            <span className="text-3xl block mb-2">📱</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-3 text-amber-50">
              Trải Nghiệm Toàn Diện Trên Ứng Dụng Mobile
            </h3>
            <p className="text-stone-300 text-sm mb-6 leading-relaxed">
              Tải ứng dụng Thánh Kinh v1.1.0 để lưu giữ toàn bộ 31 bài học offline, hỗ trợ cả 12 ngôn ngữ thế giới, tự động lưu tiến trình học và hẹn giờ tĩnh tâm mỗi ngày.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/app-release.apk"
                download="KinhThanh_v1.1.0.apk"
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm px-6 py-3 rounded-full shadow-md transition inline-flex items-center gap-2"
              >
                <span>Tải APK Android (57.1 MB)</span>
                <span>↓</span>
              </a>
              <Link
                href="/"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-6 py-3 rounded-full transition"
              >
                Xem chi tiết tính năng app
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
