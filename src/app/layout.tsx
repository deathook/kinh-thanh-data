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
  title: 'Thánh Kinh v1.1.0 & 31 Bài Học Tâm Linh | 12 Ngôn Ngữ Trực Tuyến',
  description: 'Nền tảng đọc Kinh Thánh 12 ngôn ngữ thế giới và 31 bài học chuyển hóa tâm thức trực tuyến.',
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
