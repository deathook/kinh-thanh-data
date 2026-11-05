'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { HIGHLIGHT_COLORS } from '@/lib/cloudSync';

interface UserCloudDataModalProps {
  currentLang?: string;
}

export default function UserCloudDataModal({ currentLang = 'vi' }: UserCloudDataModalProps) {
  const {
    user,
    cloudData,
    isUserDataModalOpen,
    setUserDataModalOpen,
    removeHighlight,
    removeNote,
    savePrayer,
    removePrayer,
    manualSync,
    isSyncing,
    lastSyncFormatted,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'highlights' | 'notes' | 'prayers'>('highlights');

  // New prayer input form
  const [newPrayerTitle, setNewPrayerTitle] = useState('');
  const [newPrayerContent, setNewPrayerContent] = useState('');
  const [showAddPrayer, setShowAddPrayer] = useState(false);

  if (!isUserDataModalOpen) return null;

  const isVi = currentLang === 'vi';

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayerTitle.trim()) return;

    savePrayer({
      id: Date.now().toString(),
      title: newPrayerTitle.trim(),
      content: newPrayerContent.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    setNewPrayerTitle('');
    setNewPrayerContent('');
    setShowAddPrayer(false);
  };

  const handleTogglePrayer = (prayerId: string, currentStatus: 'pending' | 'answered') => {
    const p = cloudData.prayers.find((item) => item.id === prayerId);
    if (!p) return;
    savePrayer({
      ...p,
      status: currentStatus === 'pending' ? 'answered' : 'pending',
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setUserDataModalOpen(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-stone-200 text-stone-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">☁️</span>
              <h2 className="text-lg sm:text-xl font-bold font-serif">
                {isVi ? 'Dữ Liệu Đám Mây Cá Nhân' : 'Personal Cloud Journal'}
              </h2>
            </div>
            <div className="text-xs text-amber-200/80 mt-1 flex items-center gap-2 flex-wrap">
              <span>{user ? user.email : (isVi ? 'Chế độ Cục bộ (Chưa đăng nhập)' : 'Local Storage')}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>{lastSyncFormatted}</span>
                {isSyncing && <span className="animate-spin text-[10px]">⏳</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={manualSync}
                disabled={isSyncing}
                className="bg-amber-800/80 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                title="Đồng bộ lại"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
              </button>
            )}
            <button
              onClick={() => setUserDataModalOpen(false)}
              className="text-stone-400 hover:text-white p-1 rounded-full transition cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 pt-2 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('highlights')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'highlights'
                ? 'border-amber-800 text-amber-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🖍️</span>
            <span>{isVi ? 'Câu Tô Màu' : 'Highlights'}</span>
            <span className="bg-amber-100 text-amber-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
              {cloudData.highlights.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'border-amber-800 text-amber-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>📝</span>
            <span>{isVi ? 'Ghi Chú' : 'Notes'}</span>
            <span className="bg-amber-100 text-amber-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
              {cloudData.notes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prayers')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'prayers'
                ? 'border-amber-800 text-amber-900 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>🙏</span>
            <span>{isVi ? 'Cầu Nguyện' : 'Prayers'}</span>
            <span className="bg-amber-100 text-amber-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
              {cloudData.prayers.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {/* TAB 1: HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div>
              {cloudData.highlights.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <div className="text-4xl mb-3">🖍️</div>
                  <p className="text-sm font-medium">
                    {isVi
                      ? 'Bạn chưa tô màu câu Kinh Thánh nào.'
                      : 'You have not highlighted any verses yet.'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    {isVi
                      ? 'Khi đọc Kinh Thánh, click vào câu bất kỳ để chọn màu tô và lưu vào đám mây.'
                      : 'Click any verse while reading to highlight with color and save to cloud.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cloudData.highlights.map((h) => {
                    const colorObj = HIGHLIGHT_COLORS.find((c) => c.hex === h.color);
                    return (
                      <div
                        key={h.verse_key}
                        className="p-3.5 rounded-2xl border border-stone-200/90 hover:border-amber-300 transition shadow-2xs bg-white relative flex flex-col gap-2"
                        style={{ borderLeftColor: h.color, borderLeftWidth: '6px' }}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/${currentLang}/kinh-thanh/giang/${h.chapter}?highlight=${h.verse}#cau-${h.verse}`}
                            onClick={() => setUserDataModalOpen(false)}
                            className="font-bold text-amber-900 hover:underline text-sm flex items-center gap-1.5"
                          >
                            <span>📖</span>
                            <span>
                              {h.book_name} {h.chapter}:{h.verse}
                            </span>
                          </Link>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                              style={{ backgroundColor: h.color }}
                              title={colorObj?.name || 'Màu tô'}
                            />
                            <button
                              onClick={() => removeHighlight(h.verse_key)}
                              className="text-stone-400 hover:text-rose-600 p-1 text-xs transition cursor-pointer"
                              title="Xóa tô màu"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-700 font-serif leading-relaxed line-clamp-2">
                          “{h.verse_text}”
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NOTES */}
          {activeTab === 'notes' && (
            <div>
              {cloudData.notes.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm font-medium">
                    {isVi ? 'Chưa có ghi chú nào.' : 'No notes created yet.'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    {isVi
                      ? 'Click vào câu Kinh Thánh và chọn Thêm ghi chú để lưu lại cảm xúc và sự soi dẫn của Chúa.'
                      : 'Click any verse and select Add Note to write your spiritual insights.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cloudData.notes.map((n) => (
                    <div
                      key={n.verse_key}
                      className="p-4 rounded-2xl border border-stone-200/90 hover:border-amber-300 transition shadow-2xs bg-amber-50/30 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                          <span>📌</span>
                          <span>
                            {n.book_name} {n.chapter}:{n.verse}
                          </span>
                        </span>
                        <button
                          onClick={() => removeNote(n.verse_key)}
                          className="text-stone-400 hover:text-rose-600 p-1 text-xs transition cursor-pointer"
                          title="Xóa ghi chú"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200/80 text-stone-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                        {n.content}
                      </div>

                      {n.verse_text && (
                        <p className="text-[11px] text-stone-500 font-serif italic line-clamp-1">
                          “{n.verse_text}”
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRAYERS */}
          {activeTab === 'prayers' && (
            <div className="space-y-4">
              {/* Add Prayer Toggle / Form */}
              {!showAddPrayer ? (
                <button
                  onClick={() => setShowAddPrayer(true)}
                  className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-700 bg-amber-50/50 hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>➕</span>
                  <span>{isVi ? 'Thêm Lời Cầu Nguyện Mới' : 'Add New Prayer'}</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreatePrayer}
                  className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 space-y-3 animate-in fade-in"
                >
                  <h3 className="font-bold text-xs text-amber-950 uppercase tracking-wide">
                    {isVi ? 'Soạn lời cầu nguyện mới' : 'Write Prayer'}
                  </h3>
                  <input
                    type="text"
                    required
                    value={newPrayerTitle}
                    onChange={(e) => setNewPrayerTitle(e.target.value)}
                    placeholder={isVi ? 'Tiêu đề: ví dụ Cầu nguyện cho gia đình bình an...' : 'Prayer title...'}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm outline-none focus:border-amber-700"
                  />
                  <textarea
                    rows={3}
                    value={newPrayerContent}
                    onChange={(e) => setNewPrayerContent(e.target.value)}
                    placeholder={isVi ? 'Nội dung tâm tình với Chúa Cha...' : 'Prayer content...'}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm outline-none focus:border-amber-700"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPrayer(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      {isVi ? 'Lưu Lời Cầu Nguyện' : 'Save Prayer'}
                    </button>
                  </div>
                </form>
              )}

              {/* Prayers list */}
              {cloudData.prayers.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <div className="text-4xl mb-3">🙏</div>
                  <p className="text-sm font-medium">
                    {isVi ? 'Chưa có lời cầu nguyện nào.' : 'No prayers in your journal yet.'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs mx-auto">
                    {isVi
                      ? 'Hãy viết ra những tâm sự, ước nguyện của bạn để cầu nguyện mỗi ngày.'
                      : 'Write down your petitions and thanksgiving to pray each day.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cloudData.prayers.map((p) => {
                    const isAnswered = p.status === 'answered';
                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border transition shadow-2xs flex flex-col gap-2 ${
                          isAnswered
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-stone-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTogglePrayer(p.id, p.status)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition cursor-pointer ${
                                isAnswered
                                  ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                                  : 'border-stone-300 hover:border-amber-700 bg-white'
                              }`}
                              title={isAnswered ? 'Bấm để đánh dấu Chưa nhậm' : 'Bấm để đánh dấu Đã được nhậm'}
                            >
                              {isAnswered && '✓'}
                            </button>
                            <h4
                              className={`font-bold text-sm leading-tight ${
                                isAnswered ? 'text-emerald-950 line-through opacity-80' : 'text-stone-900'
                              }`}
                            >
                              {p.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isAnswered
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}
                            >
                              {isAnswered ? (isVi ? 'Đã được nhậm' : 'Answered') : (isVi ? 'Đang cầu nguyện' : 'Pending')}
                            </span>
                            <button
                              onClick={() => removePrayer(p.id)}
                              className="text-stone-400 hover:text-rose-600 p-1 text-xs transition cursor-pointer"
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        {p.content && (
                          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap pl-7">
                            {p.content}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-50 p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="text-amber-800">📱</span>
            <span>{isVi ? 'Tự động đồng bộ với App Android' : 'Syncs automatically with Android App'}</span>
          </span>
          <button
            onClick={() => setUserDataModalOpen(false)}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl transition cursor-pointer"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
