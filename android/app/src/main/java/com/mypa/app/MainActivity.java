package com.mypa.app;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

/**
 * MainActivity - Main entry point for the app
 *
 * Registers custom Capacitor plugins and handles normal app launches
 */
public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "MainActivity onCreate - registering plugins");

        // Register custom plugins BEFORE calling super.onCreate()
        registerPlugin(FullScreenAlarmPlugin.class);
        registerPlugin(AlarmPermissionsPlugin.class);

        super.onCreate(savedInstanceState);

        Log.d(TAG, "MainActivity onCreate complete - Plugins registered");

        // CRITICAL: Request alarm permissions on first launch
        // This ensures alarms work when app is killed
        AlarmPermissionHelper.ensureAllAlarmPermissions(this);
    }
}
