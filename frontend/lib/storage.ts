import { Session } from '@/types/schema';

const STORAGE_KEY = 'cgpa-session';

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

export function loadSession(): Session | null {
  if (!isBrowser) {
    console.log('[Storage] Not in browser, skipping load');
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('[Storage] No stored session found');
      return null;
    }

    const parsed = JSON.parse(stored);
    console.log('[Storage] ✅ Loaded session:', {
      semesters: parsed.semesters?.length || 0,
      timestamp: new Date().toISOString()
    });
    return parsed;
  } catch (error) {
    console.error('[Storage] ❌ Failed to load session:', error);
    return null;
  }
}

export function saveSession(session: Session): void {
  if (!isBrowser) {
    console.log('[Storage] Not in browser, skipping save');
    return;
  }

  try {
    const json = JSON.stringify(session);
    localStorage.setItem(STORAGE_KEY, json);
    console.log('[Storage] ✅ Saved session:', {
      semesters: session.semesters.length,
      size: Math.round(json.length / 1024) + 'KB',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Storage] ❌ Failed to save session:', error);
  }
}

export function clearSession(): void {
  if (!isBrowser) {
    console.log('[Storage] Not in browser, skipping clear');
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] ✅ Cleared session');
  } catch (error) {
    console.error('[Storage] ❌ Failed to clear session:', error);
  }
}
