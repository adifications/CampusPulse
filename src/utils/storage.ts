import { NoticeItem } from '../types';

const STORAGE_KEY = 'campuspulse_circulars_v2';
export const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Calculates when a circular should naturally expire:
 * 1. If it has a specific deadline cutoff, use deadline + 24 hours (so students still see it through cutoff day)
 * 2. If no deadline or non-parsable, default to exactly 2 weeks (14 days) from scan time
 */
export function computeCircularExpiry(notice: NoticeItem, addedAt: number): {
  expiresAt: number;
  expiryNote: string;
} {
  // Check if any deadline has a parsable date
  let latestDeadlineTimestamp = 0;
  let latestDeadlineStr = '';

  if (notice.deadlines && notice.deadlines.length > 0) {
    for (const d of notice.deadlines) {
      if (!d.date) continue;
      const parsed = Date.parse(d.date);
      if (!isNaN(parsed)) {
        // add 24 hours to cover entire deadline day
        const endOfDay = parsed + 24 * 60 * 60 * 1000;
        if (endOfDay > latestDeadlineTimestamp) {
          latestDeadlineTimestamp = endOfDay;
          latestDeadlineStr = d.date;
        }
      }
    }
  }

  // If deadline exists and is further than 2 weeks, or within reasonable future
  if (latestDeadlineTimestamp > addedAt) {
    return {
      expiresAt: latestDeadlineTimestamp,
      expiryNote: `Expires after deadline (${latestDeadlineStr})`,
    };
  }

  // Default: Two weeks retention
  const defaultExpiry = addedAt + TWO_WEEKS_MS;
  const daysLeft = 14;
  return {
    expiresAt: defaultExpiry,
    expiryNote: `Auto-expires in ${daysLeft} days (2-week retention)`,
  };
}

/**
 * Loads saved circulars from localStorage and auto-purges any that have expired
 */
export function loadSavedCirculars(): NoticeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const items: NoticeItem[] = JSON.parse(raw);
    if (!Array.isArray(items)) return [];

    const now = Date.now();
    let hasPurged = false;

    const activeItems = items.filter((item) => {
      // If no expiresAt, assign default 2 weeks from addedAt or now
      if (!item.expiresAt) {
        const added = item.addedAt || now;
        const { expiresAt, expiryNote } = computeCircularExpiry(item, added);
        item.addedAt = added;
        item.expiresAt = expiresAt;
        item.expiryNote = expiryNote;
      }

      if (now > (item.expiresAt || 0)) {
        hasPurged = true;
        return false; // Auto-expired!
      }
      return true;
    });

    if (hasPurged || activeItems.length !== items.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeItems));
    }

    return activeItems;
  } catch (e) {
    console.error('Failed to read saved circulars from localStorage:', e);
    return [];
  }
}

/**
 * Saves new scanned circulars into localStorage
 */
export function saveNewCirculars(newNotices: NoticeItem[]): NoticeItem[] {
  const current = loadSavedCirculars();
  const now = Date.now();

  const prepared = newNotices.map((notice) => {
    const addedAt = notice.addedAt || now;
    const { expiresAt, expiryNote } = computeCircularExpiry(notice, addedAt);
    return {
      ...notice,
      id: notice.id || `notice-${now}-${Math.random().toString(36).slice(2, 7)}`,
      addedAt,
      expiresAt: notice.expiresAt || expiresAt,
      expiryNote: notice.expiryNote || expiryNote,
    };
  });

  // Deduplicate by ID or exact title match
  const mergedMap = new Map<string, NoticeItem>();
  for (const item of current) {
    mergedMap.set(item.id, item);
  }
  for (const item of prepared) {
    // If an item with identical title already exists, replace it with the fresh scan
    let existingId: string | null = null;
    for (const [id, ex] of mergedMap.entries()) {
      if (ex.title.trim().toLowerCase() === item.title.trim().toLowerCase()) {
        existingId = id;
        break;
      }
    }
    if (existingId) {
      mergedMap.delete(existingId);
    }
    mergedMap.set(item.id, item);
  }

  const result = Array.from(mergedMap.values());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.error('Failed to save circulars to localStorage:', e);
  }

  return result;
}

/**
 * Manually removes a circular by ID
 */
export function removeCircularById(id: string): NoticeItem[] {
  const current = loadSavedCirculars();
  const filtered = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove circular:', e);
  }
  return filtered;
}

/**
 * Format remaining time until circular expires
 */
export function formatExpiryRemaining(expiresAt?: number): string {
  if (!expiresAt) return '2-week retention';
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  }
  return `${hours}h remaining`;
}
