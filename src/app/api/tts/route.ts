import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const tl = searchParams.get('tl') || 'vi';

  if (!q || q.trim().length === 0) {
    return new NextResponse('Missing text query parameter', { status: 400 });
  }

  // Truncate query if extremely long to fit Google TTS single chunk limit (200 chars)
  const trimmed = q.trim().slice(0, 200);

  // Map language codes to Google TTS language codes
  const langMap: Record<string, string> = {
    vi: 'vi',
    en: 'en',
    es: 'es',
    pt: 'pt',
    fr: 'fr',
    de: 'de',
    zh: 'zh-CN',
    ko: 'ko',
    ja: 'ja',
    ru: 'ru',
    tl: 'tl',
    th: 'th',
  };
  const targetTl = langMap[tl] || tl;

  const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
    targetTl
  )}&client=tw-ob&q=${encodeURIComponent(trimmed)}`;

  try {
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      return new NextResponse('TTS upstream error', { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    return new NextResponse('Failed to fetch audio stream', { status: 500 });
  }
}
