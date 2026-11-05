'use client';

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase';

export interface HighlightRecord {
  book_id: number;
  chapter: number;
  verse: number;
  book_name: string;
  verse_text: string;
  color: string; // Hex color code: #FEF08A (yellow), #BBF7D0 (green), #BFDBFE (blue), #E9D5FF (purple), #FECDD3 (rose)
  verse_key: string; // Format: `${book_id}_${chapter}_${verse}`
  created_at: string;
}

export interface NoteRecord {
  book_id: number;
  chapter: number;
  verse: number;
  book_name: string;
  verse_text: string;
  content: string;
  verse_key: string;
  updated_at: string;
}

export interface PrayerRecord {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  reminder_time?: string;
  answered_note?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserCloudData {
  user: string;
  synced_at: string;
  highlights: HighlightRecord[];
  notes: NoteRecord[];
  prayers: PrayerRecord[];
}

const LOCAL_STORAGE_KEY = 'holy_bible_cloud_data_v1';
const LOCAL_LAST_SYNC_KEY = 'holy_bible_last_sync_time';

export const HIGHLIGHT_COLORS = [
  { name: 'Vàng Nắng', hex: '#FEF08A', border: '#EAB308', bgClass: 'bg-yellow-200' },
  { name: 'Xanh Lá', hex: '#BBF7D0', border: '#22C55E', bgClass: 'bg-emerald-200' },
  { name: 'Xanh Lam', hex: '#BFDBFE', border: '#3B82F6', bgClass: 'bg-sky-200' },
  { name: 'Tím Hoa', hex: '#E9D5FF', border: '#A855F7', bgClass: 'bg-purple-200' },
  { name: 'Hồng Đào', hex: '#FECDD3', border: '#F43F5E', bgClass: 'bg-rose-200' },
];

type SyncListener = (data: UserCloudData) => void;
const listeners: Set<SyncListener> = new Set();

export function subscribeToSyncData(callback: SyncListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(data: UserCloudData) {
  listeners.forEach((listener) => {
    try {
      listener(data);
    } catch (e) {
      console.error('Error notifying sync listener:', e);
    }
  });
}

export function getLocalCloudData(): UserCloudData {
  if (typeof window === 'undefined') {
    return { user: '', synced_at: '', highlights: [], notes: [], prayers: [] };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        user: parsed.user || '',
        synced_at: parsed.synced_at || '',
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        prayers: Array.isArray(parsed.prayers) ? parsed.prayers : [],
      };
    }
  } catch (err) {
    console.error('Failed to parse local cloud data:', err);
  }
  return { user: '', synced_at: '', highlights: [], notes: [], prayers: [] };
}

export function saveLocalCloudData(data: UserCloudData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    notifyListeners(data);
  } catch (err) {
    console.error('Failed to save local cloud data:', err);
  }
}

export function getLastSyncTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_LAST_SYNC_KEY);
}

export function setLastSyncTime(timeStr: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_LAST_SYNC_KEY, timeStr);
}

/**
 * Merge local and remote data seamlessly (unioning by keys)
 */
function mergeCloudData(local: UserCloudData, remote: UserCloudData): UserCloudData {
  // Merge Highlights (key: verse_key)
  const hlMap = new Map<string, HighlightRecord>();
  local.highlights.forEach((h) => hlMap.set(h.verse_key, h));
  remote.highlights.forEach((h) => hlMap.set(h.verse_key, h));

  // Merge Notes (key: verse_key, keep newer)
  const noteMap = new Map<string, NoteRecord>();
  local.notes.forEach((n) => noteMap.set(n.verse_key, n));
  remote.notes.forEach((n) => {
    const existing = noteMap.get(n.verse_key);
    if (!existing || new Date(n.updated_at) >= new Date(existing.updated_at)) {
      noteMap.set(n.verse_key, n);
    }
  });

  // Merge Prayers (key: id)
  const prayerMap = new Map<string, PrayerRecord>();
  local.prayers.forEach((p) => prayerMap.set(String(p.id), p));
  remote.prayers.forEach((p) => {
    const existing = prayerMap.get(String(p.id));
    if (!existing || new Date(p.updated_at || p.created_at) >= new Date(existing.updated_at || existing.created_at)) {
      prayerMap.set(String(p.id), p);
    }
  });

  return {
    user: remote.user || local.user,
    synced_at: new Date().toISOString(),
    highlights: Array.from(hlMap.values()),
    notes: Array.from(noteMap.values()),
    prayers: Array.from(prayerMap.values()),
  };
}

/**
 * Normalize an email or UID into a deterministic, safe Firestore document ID
 * so that Google login and Email/Password login for the same email share the exact same cloud document.
 */
export function getUserDocId(emailOrUid: string): string {
  const clean = (emailOrUid || 'guest').trim().toLowerCase();
  if (clean.includes('@')) {
    return clean.replace(/[^a-z0-9]/g, '_');
  }
  return clean;
}

/**
 * Full two-way sync with Firebase Cloud Firestore
 */
export async function syncWithFirebase(user: { uid: string; email: string | null; displayName?: string | null; photoURL?: string | null; providerData?: Array<{ providerId: string }> }): Promise<UserCloudData> {
  const local = getLocalCloudData();
  const primaryId = getUserDocId(user.email || user.uid);
  const userDocRef = doc(db, 'users', primaryId);

  try {
    const docSnap = await getDoc(userDocRef);
    let merged = local;

    if (docSnap.exists()) {
      const data = docSnap.data();
      const backup = data.backup_data;
      if (backup) {
        const remote: UserCloudData = {
          user: user.email || user.uid,
          synced_at: data.updated_at || new Date().toISOString(),
          highlights: Array.isArray(backup.highlights) ? backup.highlights : [],
          notes: Array.isArray(backup.notes) ? backup.notes : [],
          prayers: Array.isArray(backup.prayers) ? backup.prayers : [],
        };
        merged = mergeCloudData(local, remote);
      }
    }

    // Also check legacy UID document if different from primaryId so no previous data is lost
    if (user.uid && user.uid !== primaryId) {
      try {
        const legacyRef = doc(db, 'users', user.uid);
        const legacySnap = await getDoc(legacyRef);
        if (legacySnap.exists()) {
          const lData = legacySnap.data();
          const lBackup = lData.backup_data;
          if (lBackup) {
            const legacyRemote: UserCloudData = {
              user: user.email || user.uid,
              synced_at: lData.updated_at || new Date().toISOString(),
              highlights: Array.isArray(lBackup.highlights) ? lBackup.highlights : [],
              notes: Array.isArray(lBackup.notes) ? lBackup.notes : [],
              prayers: Array.isArray(lBackup.prayers) ? lBackup.prayers : [],
            };
            merged = mergeCloudData(merged, legacyRemote);
          }
        }
      } catch {
        // Ignore legacy check error
      }
    }

    merged.user = user.email || user.uid;
    merged.synced_at = new Date().toISOString();

    const docPayload = {
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoUrl: user.photoURL,
      provider: user.providerData?.[0]?.providerId || 'google',
      last_sync: serverTimestamp(),
      updated_at: merged.synced_at,
      highlights_count: merged.highlights.length,
      notes_count: merged.notes.length,
      prayers_count: merged.prayers.length,
      backup_data: {
        user: merged.user,
        synced_at: merged.synced_at,
        highlights: merged.highlights,
        notes: merged.notes,
        prayers: merged.prayers,
      },
    };

    // Push merged back to primary Firestore document
    await setDoc(userDocRef, docPayload, { merge: true });

    // Also keep UID doc in sync if present
    if (user.uid && user.uid !== primaryId) {
      try {
        await setDoc(doc(db, 'users', user.uid), docPayload, { merge: true });
      } catch {
        // Ignore
      }
    }

    saveLocalCloudData(merged);
    setLastSyncTime(merged.synced_at);
    return merged;
  } catch (error) {
    console.error('Firebase sync error:', error);
    // Even if cloud write fails, local data is preserved
    return local;
  }
}

/**
 * Push current local changes to cloud if user is logged in
 */
export async function pushCurrentDataToCloud(user: { uid: string; email: string | null } | null, data: UserCloudData): Promise<void> {
  saveLocalCloudData(data);
  if (!user) return;

  try {
    const primaryId = getUserDocId(user.email || user.uid);
    const userDocRef = doc(db, 'users', primaryId);
    const payload = {
      email: user.email,
      last_sync: serverTimestamp(),
      updated_at: new Date().toISOString(),
      highlights_count: data.highlights.length,
      notes_count: data.notes.length,
      prayers_count: data.prayers.length,
      backup_data: {
        user: user.email || user.uid,
        synced_at: new Date().toISOString(),
        highlights: data.highlights,
        notes: data.notes,
        prayers: data.prayers,
      },
    };
    await setDoc(userDocRef, payload, { merge: true });
    if (user.uid && user.uid !== primaryId) {
      await setDoc(doc(db, 'users', user.uid), payload, { merge: true });
    }
    setLastSyncTime(new Date().toISOString());
  } catch (e) {
    console.warn('Silent cloud push warning:', e);
  }
}

// -------------------------------------------------------------
// CRUD Operations
// -------------------------------------------------------------

export type SyncUserLike = { uid: string; email: string | null } | null;

export function addOrUpdateHighlight(user: SyncUserLike, record: HighlightRecord) {
  const current = getLocalCloudData();
  const index = current.highlights.findIndex((h) => h.verse_key === record.verse_key);
  if (index >= 0) {
    current.highlights[index] = record;
  } else {
    current.highlights.push(record);
  }
  pushCurrentDataToCloud(user, current);
}

export function deleteHighlight(user: SyncUserLike, verseKey: string) {
  const current = getLocalCloudData();
  current.highlights = current.highlights.filter((h) => h.verse_key !== verseKey);
  pushCurrentDataToCloud(user, current);
}

export function addOrUpdateNote(user: SyncUserLike, record: NoteRecord) {
  const current = getLocalCloudData();
  const index = current.notes.findIndex((n) => n.verse_key === record.verse_key);
  if (index >= 0) {
    current.notes[index] = record;
  } else {
    current.notes.push(record);
  }
  pushCurrentDataToCloud(user, current);
}

export function deleteNote(user: SyncUserLike, verseKey: string) {
  const current = getLocalCloudData();
  current.notes = current.notes.filter((n) => n.verse_key !== verseKey);
  pushCurrentDataToCloud(user, current);
}

export function addOrUpdatePrayer(user: SyncUserLike, prayer: PrayerRecord) {
  const current = getLocalCloudData();
  const index = current.prayers.findIndex((p) => String(p.id) === String(prayer.id));
  if (index >= 0) {
    current.prayers[index] = prayer;
  } else {
    current.prayers.unshift(prayer);
  }
  pushCurrentDataToCloud(user, current);
}

export function deletePrayer(user: SyncUserLike, id: string | number) {
  const current = getLocalCloudData();
  current.prayers = current.prayers.filter((p) => String(p.id) !== String(id));
  pushCurrentDataToCloud(user, current);
}
