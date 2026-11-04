import { NextRequest, NextResponse } from 'next/server';
import { searchBible } from '@/lib/bible';
import { isValidLang } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const rawLang = searchParams.get('lang') || 'vi';
  const lang = isValidLang(rawLang) ? rawLang : 'vi';

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = searchBible(q, lang, 50);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('API search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
