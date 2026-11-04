import { NextRequest, NextResponse } from 'next/server';
import { searchBible } from '@/lib/bible';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');
  const lang = (searchParams.get('lang') as 'vi' | 'en') || 'vi';

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = searchBible(q, lang, 40);
  return NextResponse.json({ results });
}
