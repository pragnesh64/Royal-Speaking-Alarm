import { useEffect, useState } from 'react';
import AlarmPermissions from '../plugins/alarmPermissions';

/**
 * Hook to check and request alarm permissions
 *
 * CRITICAL: Without these permissions, alarms WILL NOT fire when app is killed!
 *
 * Permissions needed:
 * 1. SCHEDULE_EXACT_ALARM (Android 12+) - Required for exact timing
 * 2. Battery Optimization Exemption - Prevents system from killing alarm receiver
 */
export function useAlarmPermissions() {
  const [hasPermissions, setHasPermissions] = useState(true);
  const [canScheduleExact, setCanScheduleExact] = useState(true);
  const [batteryOptDisabled, setBatteryOptDisabled] = useState(true);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setIsChecking(true);

      const result = await AlarmPermissions.checkPermissions();

      setHasPermissions(result.hasPermissions);
      setCanScheduleExact(result.canScheduleExactAlarms);
      setBatteryOptDisabled(result.batteryOptimizationDisabled);

      if (!result.hasPermissions) {
        const explanation = await AlarmPermissions.getPermissionExplanation();
        setPermissionMessage(explanation.message);
      }
    } catch (error) {
      console.error('Failed to check alarm permissions:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const requestPermissions = async () => {
    try {
      await AlarmPermissions.requestPermissions();
      // Re-check after user returns from settings
      setTimeout(() => {
        checkPermissions();
      }, 1000);
    } catch (error) {
      console.error('Failed to request alarm permissions:', error);
    }
  };

  return {
    hasPermissions,
    canScheduleExact,
    batteryOptDisabled,
    permissionMessage,
    isChecking,
    checkPermissions,
    requestPermissions,
  };
}
