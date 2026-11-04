import Link from 'next/link';

interface FooterProps {
  currentLang?: string;
}

export default function Footer({ currentLang = 'vi' }: FooterProps) {
  const homeLink = currentLang === 'vi' ? '/' : `/${currentLang}`;
  const lessonsLink = `/${currentLang}/bai-hoc`;
  const bibleLink = `/${currentLang}/kinh-thanh`;

  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">✝️</span>
              <span className="font-serif font-bold text-white text-lg">
                Thánh Kinh & Cầu Nguyện
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed mb-4">
              Dự án phi lợi nhuận lan tỏa Lời Chúa và tri thức tâm thức chuyển hóa. Cung cấp trọn bộ 66 sách Kinh Thánh song ngữ và 31 bài học rèn luyện nội tâm.
            </p>
            <div className="text-[11px] text-amber-400/90 font-medium">
              ✨ 100% Miễn phí • Không quảng cáo • Tôn vinh Chúa
            </div>
          </div>

          {/* Col 2: Bài Học Tâm Linh */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <span>🌱</span>
              <span>31 Bài Học Tâm Linh</span>
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <Link href="/vi/bai-hoc#can-ban" className="hover:text-amber-400 transition">
                  • 15 Bài Căn Bản (Góc Suy Gẫm)
                </Link>
              </li>
              <li>
                <Link href="/vi/bai-hoc#nang-cao" className="hover:text-amber-400 transition">
                  • 16 Bài Nâng Cao (Lời Chúa Cha)
                </Link>
              </li>
              <li>
                <Link href="/vi/bai-hoc/can-ban/self_love_1" className="hover:text-amber-400 transition">
                  • Bài 1: Đền Thờ Của Thánh Linh
                </Link>
              </li>
              <li>
                <Link href="/vi/bai-hoc/nang-cao/stage1_cell_of_self_knowledge_1" className="hover:text-amber-400 transition">
                  • Bài 1: Khởi Đầu Tự Biết Mình
                </Link>
              </li>
              <li>
                <Link href="/vi/bai-hoc" className="text-amber-400 hover:underline">
                  → Xem toàn bộ 31 bài học
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Đọc Kinh Thánh */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <span>📖</span>
              <span>Đọc Kinh Thánh Song Ngữ</span>
            </h4>
            <ul className="text-xs space-y-2 text-stone-400">
              <li>
                <Link href="/vi/kinh-thanh/giang/3" className="hover:text-amber-400 transition">
                  • Giăng 3 (Vì Đức Chúa Trời yêu thương...)
                </Link>
              </li>
              <li>
                <Link href="/vi/kinh-thanh/thi-thien/23" className="hover:text-amber-400 transition">
                  • Thi thiên 23 (Đức Giê-hô-va là Đấng chăn giữ)
                </Link>
              </li>
              <li>
                <Link href="/vi/kinh-thanh/ma-thi-o/5" className="hover:text-amber-400 transition">
                  • Ma-thi-ơ 5 (Bài Giảng Trên Núi)
                </Link>
              </li>
              <li>
                <Link href="/vi/kinh-thanh/sang-the-ky/1" className="hover:text-amber-400 transition">
                  • Sáng thế Ký 1 (Khởi nguyên sáng tạo)
                </Link>
              </li>
              <li>
                <Link href="/en/bible/john/3" className="hover:text-amber-400 transition">
                  • Berean Standard Bible (BSB English)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Tải Ứng Dụng Mobile */}
          <div id="download-app">
            <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <span>📱</span>
              <span>Ứng Dụng Thánh Kinh v1.1.0</span>
            </h4>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Trải nghiệm toàn diện trên thiết bị di động: Đọc offline 12 ngôn ngữ, tra cứu siêu tốc, sổ tay ghi chú & báo thức cầu nguyện.
            </p>
            <a
              href="/app-release.apk"
              download="KinhThanh_v1.1.0.apk"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all border border-amber-500/40"
            >
              <span>Tải file APK (57.1 MB)</span>
              <span>↓</span>
            </a>
            <div className="text-[10px] text-stone-500 mt-2">
              Hỗ trợ Android 7.0 trở lên • An toàn 100%
            </div>
          </div>
        </div>

        {/* Bản Quyền & Giấy Phép */}
        <div className="pt-8 border-t border-stone-800/80 text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div>© 2026 Thánh Kinh & Cầu Nguyện. Được phát triển vì cộng đồng tín hữu.</div>
            <div className="text-[11px] text-stone-600 mt-0.5">
              Bản dịch Truyền Thống 1925 (Public Domain) • Berean Standard Bible (BSB Public Domain 2023) • Trích xuất kiệt tác Đối Thoại (Lm. Vinhsơn Bùi Đức Sinh dịch)
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <Link href={homeLink} className="hover:text-white transition">Trang chủ</Link>
            <Link href={lessonsLink} className="hover:text-white transition">Bài học</Link>
            <Link href={bibleLink} className="hover:text-white transition">Kinh Thánh</Link>
            <a href="/app-release.apk" download className="hover:text-amber-400 transition">Tải APK</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
