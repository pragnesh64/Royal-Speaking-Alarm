import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * One-time cleanup function to cancel ALL old LocalNotifications alarms
 * These are causing issues because they don't have full-screen intent capability
 *
 * Run this from browser console: window.cleanupOldAlarms()
 */
export async function cleanupOldAlarms() {
  try {
    console.log('[CleanupOldAlarms] Starting cleanup of old LocalNotifications alarms...');

    // Get all pending notifications from LocalNotifications
    const pending = await LocalNotifications.getPending();
    console.log(`[CleanupOldAlarms] Found ${pending.notifications.length} old alarms`);

    if (pending.notifications.length > 0) {
      // Cancel all old LocalNotifications
      const ids = pending.notifications.map(n => n.id);
      await LocalNotifications.cancel({ notifications: ids.map(id => ({ id })) });
      console.log(`[CleanupOldAlarms] ✓ Canceled ${ids.length} old alarms`);
      console.log('[CleanupOldAlarms] Old alarms:', ids);
    } else {
      console.log('[CleanupOldAlarms] No old alarms to clean up');
    }

    console.log('[CleanupOldAlarms] ✓ Cleanup complete!');
    console.log('[CleanupOldAlarms] Now please recreate your alarms in the app UI');
    console.log('[CleanupOldAlarms] The new alarms will use full-screen intent and wake the screen');

    return {
      success: true,
      canceledCount: pending.notifications.length
    };
  } catch (error) {
    console.error('[CleanupOldAlarms] Failed to cleanup old alarms:', error);
    throw error;
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).cleanupOldAlarms = cleanupOldAlarms;
  console.log('[CleanupOldAlarms] Cleanup function available: window.cleanupOldAlarms()');
}
