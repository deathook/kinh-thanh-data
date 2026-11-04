import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import HomePageView from '@/components/HomePageView';
import { isValidLang, getLangConfig, getTranslation, SUPPORTED_LANGUAGES } from '@/lib/i18n';

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
  const baseUrl = 'https://kinhthanh.khoahoctamlinh.vn';

  const languagesObj: Record<string, string> = {};
  for (const code of Object.keys(SUPPORTED_LANGUAGES)) {
    languagesObj[code] = code === 'vi' ? baseUrl : `${baseUrl}/${code}`;
  }

  return {
    title: `${t.siteTitle} - ${cfg.bibleName} | 12 Ngôn Ngữ Trực Tuyến`,
    description: `Khám phá Kinh Thánh 66 cuốn (${cfg.bibleName}) và 31 bài học tâm linh trực tuyến với giọng đọc TTS bản xứ.`,
    alternates: {
      canonical: lang === 'vi' ? baseUrl : `${baseUrl}/${lang}`,
      languages: languagesObj,
    },
  };
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { lang } = await params;
  if (!isValidLang(lang)) {
    notFound();
  }

  return <HomePageView lang={lang} />;
}
