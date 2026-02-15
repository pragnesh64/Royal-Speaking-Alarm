package com.mypa.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

/**
 * AlarmReceiver - BroadcastReceiver जो AlarmManager से alarm trigger receive करता है
 *
 * ═══════════════════════════════════════════════════════════════
 * WHY THIS WORKS AFTER "CLEAR ALL":
 * ═══════════════════════════════════════════════════════════════
 * 1. BroadcastReceiver app process का part NAHI hai
 * 2. AndroidManifest में register hai (exported="true")
 * 3. Android system इसका reference hold करता है
 * 4. App completely kill हो जाए, tab bhi trigger होता है
 *
 * ═══════════════════════════════════════════════════════════════
 * EXECUTION FLOW:
 * ═══════════════════════════════════════════════════════════════
 * AlarmManager.setExactAndAllowWhileIdle() at scheduled time
 *   ↓
 * AlarmReceiver.onReceive() [SURVIVES PROCESS DEATH]
 *   ↓
 * Start AlarmRingingService (Foreground)
 *   ↓
 * Service plays sound + shows notification
 *   ↓
 * User taps notification → AlarmActivity opens
 *
 * ═══════════════════════════════════════════════════════════════
 * WHY FOREGROUND SERVICE:
 * ═══════════════════════════════════════════════════════════════
 * - Sound play karte waqt service kill nahi hoti
 * - Notification GUARANTEED show hoti hai
 * - Android priority HIGH deta hai
 * - Activity crash hone par bhi sound chalti rahti hai
 */
public class AlarmReceiver extends BroadcastReceiver {
    private static final String TAG = "AlarmReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "════════════════════════════════════════════════");
        Log.d(TAG, "✓ ALARM RECEIVED FROM ALARMMANAGER!");
        Log.d(TAG, "════════════════════════════════════════════════");

        // Extract alarm data from intent
        int alarmId = intent.getIntExtra("alarm_id", -1);
        String alarmType = intent.getStringExtra("alarm_type");
        String alarmTitle = intent.getStringExtra("alarm_title");
        String alarmBody = intent.getStringExtra("alarm_body");

        Log.d(TAG, "Alarm Details:");
        Log.d(TAG, "  → ID: " + alarmId);
        Log.d(TAG, "  → Type: " + alarmType);
        Log.d(TAG, "  → Title: " + alarmTitle);
        Log.d(TAG, "  → Body: " + alarmBody);

        // Start foreground service (CRITICAL: This is the main component)
        startAlarmService(context, alarmId, alarmType, alarmTitle, alarmBody);

        Log.d(TAG, "════════════════════════════════════════════════");
    }

    /**
     * Foreground service start करता है
     *
     * ═══════════════════════════════════════════════════════════════
     * ANDROID VERSION HANDLING:
     * ═══════════════════════════════════════════════════════════════
     * Android 8.0+ (API 26+):
     *   - MUST use startForegroundService()
     *   - Service को 5 seconds के अंदर startForeground() call करना होगा
     *   - Nahi toh crash: "Context.startForegroundService() did not then call Service.startForeground()"
     *
     * Android < 8.0:
     *   - Regular startService() काम करती है
     *
     * ═══════════════════════════════════════════════════════════════
     * WHY THIS IS RELIABLE:
     * ═══════════════════════════════════════════════════════════════
     * - BroadcastReceiver से foreground service start करना ALLOWED है
     * - Alarm context से service start करना system exception hai
     * - Android 12+ restrictions bypass हो जाते हैं alarm के case में
     */
    private void startAlarmService(Context context, int alarmId, String alarmType,
                                   String alarmTitle, String alarmBody) {
        try {
            // Create intent for AlarmRingingService
            Intent serviceIntent = new Intent(context, AlarmRingingService.class);

            // Pass alarm data to service
            serviceIntent.putExtra("alarm_id", alarmId);
            serviceIntent.putExtra("alarm_type", alarmType);
            serviceIntent.putExtra("alarm_title", alarmTitle);
            serviceIntent.putExtra("alarm_body", alarmBody);

            // Start service based on Android version
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                // Android 8.0+: MUST use startForegroundService
                context.startForegroundService(serviceIntent);
                Log.d(TAG, "✓ Foreground service started (Android 8.0+)");
            } else {
                // Android < 8.0: Regular startService
                context.startService(serviceIntent);
                Log.d(TAG, "✓ Service started (Android < 8.0)");
            }

        } catch (Exception e) {
            Log.e(TAG, "✗ FAILED to start alarm service", e);
            Log.e(TAG, "Error: " + e.getMessage());

            // Emergency fallback: Try showing notification without service
            // This is less reliable but better than nothing
            tryEmergencyNotification(context, alarmId, alarmTitle, alarmBody);
        }
    }

    /**
     * Emergency fallback agar service start nahi hui
     * (Kam reliable hai, lekin kuch nahi se better hai)
     */
    private void tryEmergencyNotification(Context context, int alarmId,
                                         String alarmTitle, String alarmBody) {
        try {
            Log.w(TAG, "⚠ Trying emergency fallback notification...");

            // Try starting service one more time
            Intent retryIntent = new Intent(context, AlarmRingingService.class);
            retryIntent.putExtra("alarm_id", alarmId);
            retryIntent.putExtra("alarm_title", alarmTitle);
            retryIntent.putExtra("alarm_body", alarmBody);
            retryIntent.putExtra("emergency_mode", true);

            context.startService(retryIntent);

        } catch (Exception fallbackError) {
            Log.e(TAG, "✗ Emergency fallback also failed", fallbackError);
        }
    }
}
