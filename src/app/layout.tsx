import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin', 'vietnamese', 'cyrillic'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kinhthanh.khoahoctamlinh.vn'),
  title: {
    default: 'Thánh Kinh v1.1.0 & 31 Bài Học Tâm Linh | 12 Ngôn Ngữ Trực Tuyến',
    template: '%s | Thánh Kinh & Cầu Nguyện',
  },
  description: 'Nền tảng đọc Kinh Thánh 12 ngôn ngữ thế giới (Bản Truyền Thống 1925, Berean Standard Bible,...) và 31 bài học chuyển hóa tâm thức trực tuyến với âm thanh giọng đọc TTS bản xứ.',
  keywords: [
    'Thánh Kinh',
    'Kinh Thánh',
    'Holy Bible',
    'Kinh Thánh 1925',
    'Berean Standard Bible',
    'Đọc Kinh Thánh online',
    'Kinh Thánh có giọng đọc',
    '31 bài học tâm linh',
    'Thánh Catarina Siena',
    'Tải app Kinh Thánh APK',
  ],
  authors: [{ name: 'Thánh Kinh & Cầu Nguyện' }],
  creator: 'Thánh Kinh & Cầu Nguyện',
  publisher: 'Thánh Kinh & Cầu Nguyện',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Thánh Kinh v1.1.0 & 31 Bài Học Tâm Linh | 12 Ngôn Ngữ Trực Tuyến',
    description: 'Nền tảng đọc Kinh Thánh 12 ngôn ngữ thế giới, hỗ trợ đọc thành tiếng và 31 bài học chuyển hóa tâm thức.',
    url: 'https://kinhthanh.khoahoctamlinh.vn',
    siteName: 'Thánh Kinh & Cầu Nguyện',
    locale: 'vi_VN',
    type: 'website',
    images: [
      {
        url: '/images/feature-graphic.png',
        width: 1024,
        height: 500,
        alt: 'Thánh Kinh & Cầu Nguyện',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Thánh Kinh v1.1.0 & 31 Bài Học Tâm Linh',
    description: 'Nền tảng đọc Kinh Thánh 12 ngôn ngữ thế giới, hỗ trợ đọc thành tiếng và 31 bài học chuyển hóa tâm thức.',
    images: ['/images/feature-graphic.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google2e3774e741a3d322',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${lora.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-stone-900">
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Q6GRRC1CSY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Q6GRRC1CSY');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
