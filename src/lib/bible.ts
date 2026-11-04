import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { SUPPORTED_LANGUAGES } from './i18n';

export interface BibleBook {
  id: number;
  book_order: number;
  testament: 'OT' | 'NT';
  code: string;
  slug: string;
  name: string;
  short_name: string;
  chapters: number;
}

export interface BibleVerse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
}

// Convert node:sqlite null-prototype objects into standard plain objects for React Server Components
function toPlain<T>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((item) => ({ ...item })) as unknown as T;
  }
  return { ...data };
}

// Database singleton pool for all 12 languages
const dbMap = new Map<string, DatabaseSync>();

export function getBibleDb(lang: string = 'vi'): DatabaseSync {
  const safeLang = SUPPORTED_LANGUAGES[lang] ? lang : 'vi';
  if (!dbMap.has(safeLang)) {
    // 1. Try local/Vercel project database path
    let dbPath = path.resolve(process.cwd(), `database/bible_${safeLang}.db`);
    if (!fs.existsSync(dbPath)) {
      // 2. Fallback to parent workspace database path
      dbPath = path.resolve(process.cwd(), `../database/output/bible_${safeLang}.db`);
    }
    dbMap.set(safeLang, new DatabaseSync(dbPath, { readOnly: true }));
  }
  return dbMap.get(safeLang)!;
}

export function getAllBooks(lang: string = 'vi'): BibleBook[] {
  const db = getBibleDb(lang);
  const rows = db.prepare('SELECT * FROM books ORDER BY book_order ASC').all() as unknown as BibleBook[];
  return toPlain(rows);
}

export function getBookBySlug(slugOrCode: string, lang: string = 'vi'): BibleBook | null {
  const db = getBibleDb(lang);
  const normalized = slugOrCode.toLowerCase().trim();

  // Try slug first
  let book = db.prepare('SELECT * FROM books WHERE slug = ? LIMIT 1').get(normalized) as unknown as BibleBook | undefined;
  if (book) return toPlain(book);

  // Try code
  book = db.prepare('SELECT * FROM books WHERE LOWER(code) = ? LIMIT 1').get(normalized) as unknown as BibleBook | undefined;
  if (book) return toPlain(book);

  // Fallback matching ID across vi/en
  try {
    const viDb = getBibleDb('vi');
    const viBook = viDb.prepare('SELECT id FROM books WHERE slug = ? OR LOWER(code) = ? LIMIT 1').get(normalized, normalized) as { id: number } | undefined;
    if (viBook) {
      const match = db.prepare('SELECT * FROM books WHERE id = ? LIMIT 1').get(viBook.id) as unknown as BibleBook | undefined;
      return match ? toPlain(match) : null;
    }

    const enDb = getBibleDb('en');
    const enBook = enDb.prepare('SELECT id FROM books WHERE slug = ? OR LOWER(code) = ? LIMIT 1').get(normalized, normalized) as { id: number } | undefined;
    if (enBook) {
      const match = db.prepare('SELECT * FROM books WHERE id = ? LIMIT 1').get(enBook.id) as unknown as BibleBook | undefined;
      return match ? toPlain(match) : null;
    }
  } catch {
    // ignore
  }

  return null;
}

export function getCanonicalSlug(bookId: number, targetLang: string = 'vi'): string {
  try {
    const db = getBibleDb(targetLang);
    const book = db.prepare('SELECT slug FROM books WHERE id = ? LIMIT 1').get(bookId) as { slug: string } | undefined;
    return book ? book.slug : 'john';
  } catch {
    return 'john';
  }
}

export function getChapterVerses(bookId: number, chapter: number, lang: string = 'vi'): BibleVerse[] {
  const db = getBibleDb(lang);
  const rows = db.prepare(
    'SELECT id, book_id, chapter, verse, text FROM verses WHERE book_id = ? AND chapter = ? ORDER BY verse ASC'
  ).all(bookId, chapter) as unknown as BibleVerse[];
  return toPlain(rows);
}

export function searchBible(query: string, lang: string = 'vi', limit: number = 40) {
  const db = getBibleDb(lang);
  const cleanWords = query.trim().replace(/["'*()]/g, '').split(/\s+/).filter((w) => w.length > 0);
  if (cleanWords.length === 0) return [];

  const formattedQuery = cleanWords.map((w) => `"${w}"*`).join(' ');

  try {
    const sql = `
      SELECT 
        v.id, v.book_id, v.chapter, v.verse, v.text,
        b.name, b.slug, b.code
      FROM verses_fts fts
      JOIN verses v ON v.id = fts.rowid
      JOIN books b ON b.id = v.book_id
      WHERE verses_fts MATCH ?
      LIMIT ?
    `;
    const rows = db.prepare(sql).all(formattedQuery, limit);
    if (rows && rows.length > 0) {
      return toPlain(rows);
    }
  } catch {
    // If FTS fails, continue to LIKE fallback
  }

  try {
    const likeSql = `
      SELECT 
        v.id, v.book_id, v.chapter, v.verse, v.text,
        b.name, b.slug, b.code
      FROM verses v
      JOIN books b ON b.id = v.book_id
      WHERE v.text LIKE ?
      LIMIT ?
    `;
    const rows = db.prepare(likeSql).all(`%${query.trim()}%`, limit);
    return toPlain(rows);
  } catch {
    return [];
  }
}
