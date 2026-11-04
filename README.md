# Thánh Kinh & Cầu Nguyện (Web Application)

Nền tảng đọc Kinh Thánh 66 cuốn đa ngôn ngữ (12 thứ tiếng) và 31 bài học tĩnh tâm, hỗ trợ Text-to-Speech phát âm chuẩn quốc tế, giao diện đọc Lora Serif sang trọng, tải trực tiếp APK Android.

## Tính năng nổi bật
- **66 Cuốn Sách Toàn Diện:** Tích hợp đầy đủ từ Sáng Thế Ký đến Khải Huyền, hỗ trợ tìm kiếm và chọn nhanh chương/mục.
- **12 Ngôn Ngữ Độc Lập:** Tiếng Việt, Tiếng Anh, Tiếng Trung, Tiếng Hàn, Tiếng Nhật, Tiếng Tây Ban Nha, Tiếng Pháp, Tiếng Đức, Tiếng Bồ Đào Nha, Tiếng Nga, Tiếng Tagalog, Tiếng Thái.
- **Đọc Thành Tiếng (TTS):** Tự động phát âm chuẩn từng ngôn ngữ, tích hợp hiệu ứng Karaoke vàng hổ phách cuộn theo từng câu đang đọc.
- **Tối Ưu SEO & Tốc Độ:** Next.js 16 App Router, Server Components truy vấn SQLite siêu tốc không cần external server.
- **Hỗ Trợ Tải App:** Banner và nút tải APK Android v1.1.0 trực tiếp.

## Cài đặt và Chạy thử cục bộ

```bash
# Cài đặt thư viện
npm install

# Khởi chạy server phát triển
npm run dev

# Mở trình duyệt tại http://localhost:3000
```

## Triển khai lên Vercel
1. Đẩy dự án lên GitHub.
2. Đăng nhập vào [Vercel](https://vercel.com) và chọn Import Repository.
3. Trong phần **Project Settings > Node.js Version**, chọn **22.x** (để hỗ trợ `node:sqlite`).
4. Bấm **Deploy**.

