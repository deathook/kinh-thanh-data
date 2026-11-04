import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import HomePageView from '@/components/HomePageView';
import { isValidLang, getLangConfig, getTranslation, SUPPORTED_LANGUAGES } from '@/lib/i18n';
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
  const baseUrl = 'https://kinhthanh.khoahoctamlinh.vn';

  const languagesObj: Record<string, string> = {};
  for (const code of Object.keys(SUPPORTED_LANGUAGES)) {
    languagesObj[code] = code === 'vi' ? baseUrl : `${baseUrl}/${code}`;
  }

  const title = `${t.siteTitle} - ${cfg.bibleName} | ${ht.heroHeadline1}`;
  const description = ht.heroDesc;

  return {
    title,
    description,
    alternates: {
      canonical: lang === 'vi' ? baseUrl : `${baseUrl}/${lang}`,
      languages: languagesObj,
    },
    openGraph: {
      title,
      description,
      url: lang === 'vi' ? baseUrl : `${baseUrl}/${lang}`,
      siteName: t.siteTitle,
      locale: cfg.voiceLang.replace('-', '_'),
      images: [
        {
          url: '/images/feature-graphic.png',
          width: 1024,
          height: 500,
          alt: t.siteTitle,
        },
      ],
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
