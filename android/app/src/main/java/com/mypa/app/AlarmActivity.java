package com.mypa.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;
import android.util.Log;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * AlarmActivity - OPTIONAL UI जो user notification tap करने पर खुलती है
 *
 * ═══════════════════════════════════════════════════════════════
 * IMPORTANT: YE ACTIVITY SOUND/VIBRATION NAHI PLAY KARTI!
 * ═══════════════════════════════════════════════════════════════
 *
 * Sound/Vibration = AlarmRingingService की responsibility
 * This activity = Only UI for user interaction
 *
 * User yahaan se:
 * - Alarm details dekh sakta hai
 * - Dismiss button press kar sakta hai
 * - Snooze button press kar sakta hai
 *
 * Service notification se bhi ye sab ho sakta hai (PRIMARY way)
 */
public class AlarmActivity extends Activity {
    private static final String TAG = "AlarmActivity";
    private PowerManager.WakeLock wakeLock;

    private int alarmId;
    private String alarmTitle;
    private String alarmBody;
    private String alarmType;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Log.d(TAG, "════════════════════════════════════════════════");
        Log.d(TAG, "✓ AlarmActivity opened by user");
        Log.d(TAG, "════════════════════════════════════════════════");

        // Set window flags for lock screen
        setupWindowFlags();

        // Acquire wake lock
        acquireWakeLock();

        // Load native XML layout
        setContentView(R.layout.activity_alarm);

        // Get alarm data
        extractAlarmData();

        // Setup UI
        setupUI();

        // Setup buttons
        setupButtons();

        Log.d(TAG, "✓ AlarmActivity ready");
        Log.d(TAG, "════════════════════════════════════════════════");
    }

    private void setupWindowFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            getWindow().addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            );
        }

        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        );

        Log.d(TAG, "Window flags set");
    }

    private void acquireWakeLock() {
        try {
            PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK |
                    PowerManager.ACQUIRE_CAUSES_WAKEUP,
                    "AlarmApp:AlarmActivityWakeLock"
                );
                wakeLock.acquire(5 * 60 * 1000L);
                Log.d(TAG, "Wake lock acquired");
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to acquire wake lock", e);
        }
    }

    private void extractAlarmData() {
        Intent intent = getIntent();
        if (intent != null) {
            alarmId = intent.getIntExtra("alarm_id", -1);
            alarmTitle = intent.getStringExtra("alarm_title");
            alarmBody = intent.getStringExtra("alarm_body");
            alarmType = intent.getStringExtra("alarm_type");

            if (alarmTitle == null) alarmTitle = "Alarm";
            if (alarmBody == null) alarmBody = "";

            Log.d(TAG, "Alarm: " + alarmTitle);
        }
    }

    private void setupUI() {
        try {
            // Make status bar dark to match background
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                getWindow().setStatusBarColor(0xFF0D1B3E);
                getWindow().setNavigationBarColor(0xFF0D1B3E);
            }

            // ═══════════════════════════════════════════════════
            // TIME DISPLAY (12-hour format with AM/PM)
            // ═══════════════════════════════════════════════════
            SimpleDateFormat timeFormat = new SimpleDateFormat("hh:mm a", Locale.getDefault());
            String currentTime = timeFormat.format(new Date());

            TextView timeTextView = findViewById(R.id.alarm_time);
            if (timeTextView != null) {
                timeTextView.setText(currentTime);
            }

            // ═══════════════════════════════════════════════════
            // DATE DISPLAY (e.g. "Sunday, 15 Feb 2026")
            // ═══════════════════════════════════════════════════
            SimpleDateFormat dateFormat = new SimpleDateFormat("EEEE, dd MMM yyyy", Locale.getDefault());
            String currentDate = dateFormat.format(new Date());

            TextView dateTextView = findViewById(R.id.alarm_date);
            if (dateTextView != null) {
                dateTextView.setText(currentDate);
            }

            // ═══════════════════════════════════════════════════
            // ALARM TITLE
            // ═══════════════════════════════════════════════════
            TextView titleTextView = findViewById(R.id.alarm_title);
            if (titleTextView != null) {
                String title = "Alarm";
                if (alarmTitle != null && !alarmTitle.isEmpty()) {
                    title = alarmTitle;
                } else if (alarmType != null) {
                    switch (alarmType) {
                        case "medicine": title = "💊 Medicine Reminder"; break;
                        case "meeting":  title = "📅 Meeting Reminder"; break;
                        default:         title = "⏰ Wake Up Alarm"; break;
                    }
                }
                titleTextView.setText(title);
                titleTextView.setVisibility(View.VISIBLE);
            }

            // ═══════════════════════════════════════════════════
            // ALARM BODY / MESSAGE
            // ═══════════════════════════════════════════════════
            TextView bodyTextView = findViewById(R.id.alarm_body);
            if (bodyTextView != null) {
                if (alarmBody != null && !alarmBody.isEmpty()) {
                    bodyTextView.setText(alarmBody);
                } else {
                    bodyTextView.setText("Tap DISMISS to stop or SNOOZE to ring again");
                }
                bodyTextView.setVisibility(View.VISIBLE);
            }

            // ═══════════════════════════════════════════════════
            // ALARM TYPE BADGE
            // ═══════════════════════════════════════════════════
            TextView typeTextView = findViewById(R.id.alarm_type);
            if (typeTextView != null) {
                String typeText = "🔔 Sound Alarm";
                if (alarmType != null) {
                    switch (alarmType) {
                        case "medicine": typeText = "💊 Medicine"; break;
                        case "meeting":  typeText = "📅 Meeting"; break;
                        case "alarm":    typeText = "⏰ Daily Alarm"; break;
                        default:         typeText = "🔔 " + alarmType; break;
                    }
                }
                typeTextView.setText(typeText);
                typeTextView.setVisibility(View.VISIBLE);
            }

            Log.d(TAG, "✓ UI ready — Time: " + currentTime + ", Title: " + alarmTitle + ", Type: " + alarmType);
        } catch (Exception e) {
            Log.e(TAG, "✗ Failed to setup UI", e);
        }
    }

    private void setupButtons() {
        Button dismissButton = findViewById(R.id.btn_dismiss);
        if (dismissButton != null) {
            dismissButton.setOnClickListener(v -> dismissAlarm());
        }

        Button snoozeButton = findViewById(R.id.btn_snooze);
        if (snoozeButton != null) {
            snoozeButton.setOnClickListener(v -> snoozeAlarm());
        }

        Log.d(TAG, "Buttons setup complete");
    }

    /**
     * Alarm dismiss - service को bhi stop karo
     */
    private void dismissAlarm() {
        Log.d(TAG, "✓ Dismiss button pressed");

        // Stop the service (this stops sound/vibration)
        Intent serviceIntent = new Intent(this, AlarmRingingService.class);
        serviceIntent.setAction(AlarmRingingService.ACTION_DISMISS);
        startService(serviceIntent);

        releaseWakeLock();

        // CRITICAL: Close activity WITHOUT opening MainActivity
        // This prevents double UI issue
        finish();

        // Move app to background (don't open MainActivity)
        moveTaskToBack(true);
    }

    /**
     * Alarm snooze - service ko bhi stop karo
     */
    private void snoozeAlarm() {
        Log.d(TAG, "✓ Snooze button pressed");

        // Stop the service
        Intent serviceIntent = new Intent(this, AlarmRingingService.class);
        serviceIntent.setAction(AlarmRingingService.ACTION_SNOOZE);
        startService(serviceIntent);

        releaseWakeLock();

        // CRITICAL: Close activity WITHOUT opening MainActivity
        // This prevents double UI issue
        finish();

        // Move app to background (don't open MainActivity)
        moveTaskToBack(true);
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
                wakeLock = null;
                Log.d(TAG, "Wake lock released");
            } catch (Exception e) {
                Log.e(TAG, "Failed to release wake lock", e);
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        releaseWakeLock();
        Log.d(TAG, "AlarmActivity destroyed");
    }

    @Override
    public void onBackPressed() {
        Log.d(TAG, "Back button disabled");
        // Disable back button - user must dismiss or snooze
    }
}
