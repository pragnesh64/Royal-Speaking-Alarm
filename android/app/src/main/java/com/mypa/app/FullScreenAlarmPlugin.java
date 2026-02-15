package com.mypa.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Calendar;

/**
 * FullScreenAlarmPlugin - Capacitor plugin for scheduling full-screen alarms
 *
 * This plugin allows JavaScript to schedule alarms that will:
 * 1. Wake the screen even when device is asleep
 * 2. Show full-screen UI over lock screen
 * 3. Work reliably on Android 10+
 *
 * Usage from JavaScript:
 * await FullScreenAlarm.schedule({
 *   id: 123,
 *   title: "Wake up!",
 *   body: "Time to start your day",
 *   triggerAtMillis: Date.now() + 60000,
 *   type: "alarm"
 * });
 */
@CapacitorPlugin(name = "FullScreenAlarm")
public class FullScreenAlarmPlugin extends Plugin {
    private static final String TAG = "FullScreenAlarmPlugin";

    /**
     * Schedules a full-screen alarm
     *
     * Parameters:
     * - id (number): Unique alarm ID
     * - title (string): Alarm title
     * - body (string): Alarm message
     * - triggerAtMillis (number): Timestamp in milliseconds when alarm should trigger
     * - type (string): Alarm type (alarm, medicine, meeting)
     * - allowWhileIdle (boolean): Optional, allows alarm to fire even in Doze mode
     */
    @PluginMethod
    public void schedule(PluginCall call) {
        try {
            // Get parameters from JavaScript
            int alarmId = call.getInt("id", -1);
            String title = call.getString("title", "Alarm");
            String body = call.getString("body", "");
            Long triggerAtMillis = call.getLong("triggerAtMillis");
            String type = call.getString("type", "alarm");

            if (alarmId == -1) {
                call.reject("Alarm ID is required");
                return;
            }

            if (triggerAtMillis == null) {
                call.reject("triggerAtMillis is required");
                return;
            }

            Context context = getContext();

            // ═══════════════════════════════════════════════════════════════
            // CRITICAL: Check permissions BEFORE scheduling
            // ═══════════════════════════════════════════════════════════════
            // Without these permissions, alarms WILL NOT fire when app is killed!
            // ═══════════════════════════════════════════════════════════════

            if (!AlarmPermissionHelper.canScheduleExactAlarms(context)) {
                Log.e(TAG, "✗ SCHEDULE_EXACT_ALARM permission not granted!");
                call.reject("Exact alarm permission required. Please grant permission in app settings.");
                return;
            }

            if (!AlarmPermissionHelper.isBatteryOptimizationDisabled(context)) {
                Log.w(TAG, "⚠️ Battery optimization enabled - alarm may not work when app is killed!");
                // Don't reject - just warn. Battery optimization is optional but recommended.
            }

            Log.d(TAG, "Scheduling alarm " + alarmId + " at " + triggerAtMillis);

            // IMPROVED: Use helper class for consistent alarm scheduling
            boolean success = AlarmSchedulerHelper.scheduleExactAlarm(
                context,
                alarmId,
                triggerAtMillis,
                title,
                body,
                type
            );

            if (!success) {
                call.reject("Failed to schedule alarm");
                return;
            }

            // Return success
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("alarmId", alarmId);
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule alarm", e);
            call.reject("Failed to schedule alarm: " + e.getMessage());
        }
    }

    /**
     * Cancels a scheduled alarm
     *
     * Parameters:
     * - id (number): Alarm ID to cancel
     */
    @PluginMethod
    public void cancel(PluginCall call) {
        try {
            int alarmId = call.getInt("id", -1);

            if (alarmId == -1) {
                call.reject("Alarm ID is required");
                return;
            }

            Log.d(TAG, "Cancelling alarm " + alarmId);

            // IMPROVED: Use helper class for consistent alarm cancellation
            Context context = getContext();
            boolean success = AlarmSchedulerHelper.cancelAlarm(context, alarmId);

            // Also cancel any snooze alarm for this ID
            AlarmSchedulerHelper.cancelSnoozeAlarm(context, alarmId);

            JSObject result = new JSObject();
            result.put("success", success);
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Failed to cancel alarm", e);
            call.reject("Failed to cancel alarm: " + e.getMessage());
        }
    }

    /**
     * Schedules a repeating alarm (e.g., for recurring daily alarms)
     *
     * Parameters:
     * - id (number): Unique alarm ID
     * - title (string): Alarm title
     * - body (string): Alarm message
     * - hour (number): Hour (0-23)
     * - minute (number): Minute (0-59)
     * - type (string): Alarm type
     */
    @PluginMethod
    public void scheduleRepeating(PluginCall call) {
        try {
            int alarmId = call.getInt("id", -1);
            String title = call.getString("title", "Alarm");
            String body = call.getString("body", "");
            int hour = call.getInt("hour", 0);
            int minute = call.getInt("minute", 0);
            String type = call.getString("type", "alarm");

            if (alarmId == -1) {
                call.reject("Alarm ID is required");
                return;
            }

            // Calculate next occurrence
            Calendar calendar = Calendar.getInstance();
            calendar.setTimeInMillis(System.currentTimeMillis());
            calendar.set(Calendar.HOUR_OF_DAY, hour);
            calendar.set(Calendar.MINUTE, minute);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);

            // If time has passed today, schedule for tomorrow
            if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_MONTH, 1);
            }

            long triggerAtMillis = calendar.getTimeInMillis();

            Log.d(TAG, "Scheduling repeating alarm " + alarmId + " at " + hour + ":" + minute);

            // Create intent
            Context context = getContext();
            Intent intent = new Intent(context, AlarmReceiver.class);
            intent.putExtra("alarm_id", alarmId);
            intent.putExtra("alarm_title", title);
            intent.putExtra("alarm_body", body);
            intent.putExtra("alarm_type", type);

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                alarmId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            if (alarmManager != null) {
                // ═══════════════════════════════════════════════════════════════
                // CRITICAL FIX: Don't use setRepeating()!
                // ═══════════════════════════════════════════════════════════════
                // setRepeating() is INEXACT on Android 4.4+ (may be delayed/batched)
                // It does NOT work reliably when app is killed
                //
                // SOLUTION: Use setAlarmClock() for FIRST occurrence
                // When alarm fires, app will reschedule next occurrence (+24h)
                // This ensures EXACT timing for each alarm
                // ═══════════════════════════════════════════════════════════════

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    // Android 5.0+ (API 21+)
                    AlarmManager.AlarmClockInfo alarmClockInfo = new AlarmManager.AlarmClockInfo(
                        triggerAtMillis,
                        pendingIntent
                    );
                    alarmManager.setAlarmClock(alarmClockInfo, pendingIntent);
                    Log.d(TAG, "✓ Repeating alarm scheduled with setAlarmClock() [FIRST OCCURRENCE]");
                    Log.d(TAG, "⚠ NOTE: App must reschedule next occurrence when alarm fires");

                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                    alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                    Log.d(TAG, "✓ Repeating alarm scheduled with setExact()");

                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent);
                    Log.d(TAG, "✓ Repeating alarm scheduled with set()");
                }
            }

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("alarmId", alarmId);
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule repeating alarm", e);
            call.reject("Failed to schedule repeating alarm: " + e.getMessage());
        }
    }
}
