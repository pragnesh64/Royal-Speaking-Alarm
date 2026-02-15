import { useAlarmPermissions } from '../hooks/useAlarmPermissions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

/**
 * AlarmPermissionBanner - Shows warning if critical permissions are missing
 *
 * Displays at top of dashboard when:
 * - SCHEDULE_EXACT_ALARM permission not granted (Android 12+)
 * - Battery optimization is enabled (alarms may not fire when app is killed)
 */
export function AlarmPermissionBanner() {
  const {
    hasPermissions,
    canScheduleExact,
    batteryOptDisabled,
    permissionMessage,
    isChecking,
    requestPermissions,
  } = useAlarmPermissions();

  // Don't show banner if still checking or all permissions granted
  if (isChecking || hasPermissions) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Alarm Permissions Required</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="whitespace-pre-line mb-3">{permissionMessage}</div>

        <div className="space-y-2 text-sm">
          {!canScheduleExact && (
            <div className="flex items-center gap-2">
              <span className="text-red-500">✗</span>
              <span>Exact Alarm Permission (Android 12+)</span>
            </div>
          )}
          {!batteryOptDisabled && (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⚠</span>
              <span>Battery Optimization (Recommended)</span>
            </div>
          )}
        </div>

        <Button
          onClick={requestPermissions}
          className="mt-4"
          variant="outline"
        >
          Grant Permissions
        </Button>
      </AlertDescription>
    </Alert>
  );
}
