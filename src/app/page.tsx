import type { Metadata } from 'next';
import HomePageView from '@/components/HomePageView';
import LanguagePreferenceSync from '@/components/LanguagePreferenceSync';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Thánh Kinh v1.1.0 Song Ngữ & 31 Bài Học Tâm Linh | Đọc & Tải App Android',
  description: 'Cổng thông tin Thánh Kinh song ngữ Bản Truyền Thống 1925 & 12 ngôn ngữ thế giới. Tải ứng dụng di động v1.1.0 đọc offline và khám phá 31 bài học chuyển hóa tâm thức trực tuyến.',
  alternates: {
    canonical: 'https://kinhthanh.khoahoctamlinh.vn',
    languages: Object.keys(SUPPORTED_LANGUAGES).reduce((acc, code) => {
      acc[code] = code === 'vi' ? 'https://kinhthanh.khoahoctamlinh.vn' : `https://kinhthanh.khoahoctamlinh.vn/${code}`;
      return acc;
    }, {} as Record<string, string>),
  },
};

export default function RootHomePage() {
  return (
    <>
      <LanguagePreferenceSync />
      <HomePageView lang="vi" />
    </>
  );
}
