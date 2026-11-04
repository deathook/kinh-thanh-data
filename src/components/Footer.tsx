import Link from 'next/link';
import { getHomeTranslation } from '@/lib/homeI18n';
import { getTranslation, getLangConfig } from '@/lib/i18n';
import { getCanonicalSlug } from '@/lib/bible';

interface FooterProps {
  currentLang?: string;
}

export default function Footer({ currentLang = 'vi' }: FooterProps) {
  const t = getTranslation(currentLang);
  const cfg = getLangConfig(currentLang);
  const ht = getHomeTranslation(currentLang);

  const homeLink = currentLang === 'vi' ? '/' : `/${currentLang}`;
  const lessonsLink = `/${currentLang}/bai-hoc`;
  const bibleLink = `/${currentLang}/kinh-thanh`;

  const johnSlug = getCanonicalSlug(43, currentLang);
  const psalmSlug = getCanonicalSlug(19, currentLang);
  const mattSlug = getCanonicalSlug(40, currentLang);
  const genSlug = getCanonicalSlug(1, currentLang);

  // Friendly verse titles per language
  const psalmTitle = currentLang === 'vi' ? 'Thi thiên 23' : (currentLang === 'es' ? 'Salmos 23' : (currentLang === 'fr' ? 'Psaume 23' : (currentLang === 'pt' ? 'Salmos 23' : (currentLang === 'de' ? 'Psalm 23' : 'Psalm 23'))));
  const mattTitle = currentLang === 'vi' ? 'Ma-thi-ơ 5' : (currentLang === 'es' ? 'Mateo 5' : (currentLang === 'fr' ? 'Matthieu 5' : (currentLang === 'pt' ? 'Mateus 5' : (currentLang === 'de' ? 'Matthäus 5' : 'Matthew 5'))));
  const genTitle = currentLang === 'vi' ? 'Sáng thế Ký 1' : (currentLang === 'es' ? 'Génesis 1' : (currentLang === 'fr' ? 'Genèse 1' : (currentLang === 'pt' ? 'Gênesis 1' : (currentLang === 'de' ? '1. Mose 1' : 'Genesis 1'))));

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✝️</span>
              <span className="font-serif font-bold text-white text-lg">
                {t.siteTitle}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              {ht.footerAbout}
            </p>
            <div className="text-[11px] text-amber-400/90 font-medium">
              {ht.footerMotto}
            </div>
          </div>

          {/* Col 2: Bài Học Tâm Linh */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <span>🌱</span>
              <span>{ht.footerLessonsCol}</span>
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <Link href={`${lessonsLink}#can-ban`} className="hover:text-amber-400 transition">
                  • {ht.track1Badge}
                </Link>
              </li>
              <li>
                <Link href={`${lessonsLink}#nang-cao`} className="hover:text-amber-400 transition">
                  • {ht.track2Badge}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLang}/bai-hoc/can-ban/self_love_1`} className="hover:text-amber-400 transition">
                  • {ht.track1Title}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLang}/bai-hoc/nang-cao/stage1_cell_of_self_knowledge_1`} className="hover:text-amber-400 transition">
                  • {ht.track2Title}
                </Link>
              </li>
              <li>
                <Link href={lessonsLink} className="text-amber-400 hover:underline">
                  → {ht.lessonsViewAll}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Đọc Kinh Thánh */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <span>📖</span>
              <span>{ht.footerBibleCol} ({cfg.localName})</span>
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <Link href={`/${currentLang}/kinh-thanh/${johnSlug}/3`} className="hover:text-amber-400 transition">
                  • {ht.featuredVerseRef}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLang}/kinh-thanh/${psalmSlug}/23`} className="hover:text-amber-400 transition">
                  • {psalmTitle}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLang}/kinh-thanh/${mattSlug}/5`} className="hover:text-amber-400 transition">
                  • {mattTitle}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLang}/kinh-thanh/${genSlug}/1`} className="hover:text-amber-400 transition">
                  • {genTitle}
                </Link>
              </li>
              <li>
                <Link href={bibleLink} className="text-amber-400 hover:underline">
                  → {t.all66Books}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Tải Ứng Dụng Mobile */}
          <div id="download-app">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <span>📱</span>
              <span>{ht.footerAppCol}</span>
            </h4>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              {ht.footerAppDesc}
            </p>
            <a
              href="/app-release.apk"
              download="KinhThanh_v1.1.0.apk"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all border border-amber-500/40"
            >
              <span>{ht.footerAppBtn}</span>
              <span>↓</span>
            </a>
            <div className="text-[10px] text-stone-500 mt-2">
              {ht.footerAppSub}
            </div>
          </div>
        </div>

        {/* Bản Quyền & Giấy Phép */}
        <div className="pt-8 border-t border-stone-800/80 text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div>{ht.footerCopyright}</div>
            <div className="text-[11px] text-stone-600 mt-0.5">
              {cfg.bibleName} • {ht.footerLicense}
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <Link href={homeLink} className="hover:text-white transition">{t.home}</Link>
            <Link href={lessonsLink} className="hover:text-white transition">{t.lessons}</Link>
            <Link href={bibleLink} className="hover:text-white transition">{t.readBible}</Link>
            <a href="/app-release.apk" download className="hover:text-amber-400 transition">{t.downloadApp}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
