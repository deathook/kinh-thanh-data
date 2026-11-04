import type { MetadataRoute } from 'next';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { getAllBooks } from '@/lib/bible';
import { getAllDevotionalLessons } from '@/lib/devotionalData';
import { getAllDialogueLessons } from '@/lib/dialogueData';

export const revalidate = 86400; // Cache on CDN for 24 hours

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kinh-thanh-red.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const now = new Date();

  // 1. Home Page (Trang chủ)
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // 2. Lesson List Page & Individual Lessons (31 Bài Học Tâm Linh)
  sitemapEntries.push({
    url: `${BASE_URL}/vi/bai-hoc`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  const devLessons = getAllDevotionalLessons();
  for (const lesson of devLessons) {
    sitemapEntries.push({
      url: `${BASE_URL}/vi/bai-hoc/can-ban/${lesson.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  const diaLessons = getAllDialogueLessons();
  for (const lesson of diaLessons) {
    sitemapEntries.push({
      url: `${BASE_URL}/vi/bai-hoc/nang-cao/${lesson.id}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }

  // 3. Bible Library Pages & Chapter Pages for all 12 Languages (14,280 pages)
  const langKeys = Object.keys(SUPPORTED_LANGUAGES);

  for (const lang of langKeys) {
    // Library index page (e.g. /vi/kinh-thanh, /en/kinh-thanh, ...)
    sitemapEntries.push({
      url: `${BASE_URL}/${lang}/kinh-thanh`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    // All 66 books and each book's chapters
    try {
      const books = getAllBooks(lang);
      for (const book of books) {
        for (let ch = 1; ch <= book.chapters; ch++) {
          sitemapEntries.push({
            url: `${BASE_URL}/${lang}/kinh-thanh/${book.slug}/${ch}`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: lang === 'vi' || lang === 'en' ? 0.8 : 0.7,
          });
        }
      }
    } catch (err) {
      console.error(`Error generating sitemap for language ${lang}:`, err);
    }
  }

  return sitemapEntries;
}
