import { registerPlugin } from '@capacitor/core';

export interface AlarmPermissionsPlugin {
  /**
   * Check if all alarm permissions are granted
   */
  checkPermissions(): Promise<{
    hasPermissions: boolean;
    canScheduleExactAlarms: boolean;
    batteryOptimizationDisabled: boolean;
  }>;

  /**
   * Request all critical alarm permissions
   * Opens system settings for user to grant permissions
   */
  requestPermissions(): Promise<{ success: boolean }>;

  /**
   * Get user-friendly explanation of required permissions
   */
  getPermissionExplanation(): Promise<{ message: string }>;
}

const AlarmPermissions = registerPlugin<AlarmPermissionsPlugin>('AlarmPermissions');

export default AlarmPermissions;
