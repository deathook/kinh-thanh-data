import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    slug: string;
    chapter: string;
  }>;
}

export default async function LegacyEnglishRedirect({ params }: PageProps) {
  const { slug, chapter } = await params;
  redirect(`/en/kinh-thanh/${slug}/${chapter}`);
}
