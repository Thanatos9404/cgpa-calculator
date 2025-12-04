/**
 * Data migration helper - localStorage to database
 */
import { sessionAPI } from './api';
import { loadSession, clearSession } from './storage';

export async function migrateLocalDataToDatabase(): Promise<boolean> {
  try {
    console.log('[Migration] Starting localStorage → database migration...');

    // Load data from localStorage
    const localData = loadSession();

    if (!localData || !localData.semesters || localData.semesters.length === 0) {
      console.log('[Migration] No local data to migrate');
      return false;
    }

    console.log('[Migration] Found local data:', localData.semesters.length, 'semesters');

    // Save to database
    await sessionAPI.save(localData);

    console.log('[Migration] ✅ Data migrated successfully!');

    // Optionally clear localStorage (commented out for safety)
    // clearSession();

    return true;
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);
    return false;
  }
}

export async function loadDataFromDatabase() {
  try {
    const data = await sessionAPI.get();
    return data ? data.session_data : null;
  } catch (error) {
    console.error('[Migration] Failed to load from database:', error);
    return null;
  }
}

export async function syncDataToDatabase(sessionData: any) {
  try {
    await sessionAPI.save(sessionData);
    console.log('[Sync] Data synced to database');
  } catch (error) {
    console.error('[Sync] Failed to sync to database:', error);
  }
}
