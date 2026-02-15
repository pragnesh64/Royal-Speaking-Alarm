package com.mypa.app;

import android.content.Context;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * AlarmPermissionsPlugin - Capacitor plugin for managing alarm permissions
 *
 * Exposes alarm permission checks to JavaScript/TypeScript
 *
 * Usage from JavaScript:
 *
 * // Check permissions
 * const { hasPermissions } = await AlarmPermissions.checkPermissions();
 *
 * // Request permissions
 * await AlarmPermissions.requestPermissions();
 *
 * // Get explanation
 * const { message } = await AlarmPermissions.getPermissionExplanation();
 */
@CapacitorPlugin(name = "AlarmPermissions")
public class AlarmPermissionsPlugin extends Plugin {
    private static final String TAG = "AlarmPermissionsPlugin";

    /**
     * Check if all alarm permissions are granted
     */
    @PluginMethod
    public void checkPermissions(PluginCall call) {
        try {
            Context context = getContext();

            boolean canScheduleExact = AlarmPermissionHelper.canScheduleExactAlarms(context);
            boolean batteryOptDisabled = AlarmPermissionHelper.isBatteryOptimizationDisabled(context);
            boolean hasAll = canScheduleExact && batteryOptDisabled;

            JSObject result = new JSObject();
            result.put("hasPermissions", hasAll);
            result.put("canScheduleExactAlarms", canScheduleExact);
            result.put("batteryOptimizationDisabled", batteryOptDisabled);

            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Failed to check permissions", e);
            call.reject("Failed to check permissions: " + e.getMessage());
        }
    }

    /**
     * Request all critical alarm permissions
     */
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        try {
            Context context = getContext();

            AlarmPermissionHelper.ensureAllAlarmPermissions(context);

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Failed to request permissions", e);
            call.reject("Failed to request permissions: " + e.getMessage());
        }
    }

    /**
     * Get user-friendly explanation of required permissions
     */
    @PluginMethod
    public void getPermissionExplanation(PluginCall call) {
        try {
            Context context = getContext();
            String message = AlarmPermissionHelper.getPermissionExplanation(context);

            JSObject result = new JSObject();
            result.put("message", message);
            call.resolve(result);

        } catch (Exception e) {
            Log.e(TAG, "Failed to get explanation", e);
            call.reject("Failed to get explanation: " + e.getMessage());
        }
    }
}
