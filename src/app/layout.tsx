import type { Metadata } from 'next';
import { Lora, Plus_Jakarta_Sans } from 'next/font/google';
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
        {children}
      </body>
    </html>
  );
}
