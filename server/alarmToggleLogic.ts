/**
 * Alarm Toggle Logic
 *
 * Determines if an alarm should be active based on whether it has future occurrences.
 *
 * Rules:
 * 1. When alarm is updated → toggle TRUE if future trigger time exists
 * 2. Multiple days → if one day rings but future days exist, toggle stays TRUE
 * 3. Snooze → toggle stays TRUE (handled separately)
 * 4. Toggle FALSE only when NO future alarms exist
 */

interface AlarmData {
  time: string;      // HH:mm format (24-hour)
  date?: string | null;    // YYYY-MM-DD format (optional)
  days?: string[] | null;  // ["Mon", "Tue", ...]  (optional)
}

/**
 * Checks if an alarm has any future occurrences
 * @param alarm - Alarm data with time, date, and days
 * @returns true if alarm has future occurrences, false otherwise
 */
export function hasFutureOccurrence(alarm: AlarmData): boolean {
  const now = new Date();
  const currentTime = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\s/g, '');

  const currentDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
  const currentDay = now.toLocaleDateString('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short'
  });

  // Case 1: Specific date alarm
  if (alarm.date) {
    // If alarm date is in the future, return true
    if (alarm.date > currentDate) {
      return true;
    }
    // If alarm date is today, check if time hasn't passed yet
    if (alarm.date === currentDate) {
      return alarm.time > currentTime;
    }
    // Alarm date is in the past
    return false;
  }

  // Case 2: Recurring alarm (has days specified)
  if (alarm.days && alarm.days.length > 0) {
    // Get day of week mapping
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDayIndex = dayOrder.indexOf(currentDay);

    // Check if today is in the alarm days
    const hasTodayInDays = alarm.days.includes(currentDay);

    // If today is an alarm day and time hasn't passed, return true
    if (hasTodayInDays && alarm.time > currentTime) {
      return true;
    }

    // Check if there are any future days in this week or next week
    // Since it's recurring, there's always a future occurrence
    return true;
  }

  // Case 3: One-time alarm (no date, no days)
  // Check if time today hasn't passed yet
  return alarm.time > currentTime;
}

/**
 * Automatically sets the alarm's isActive status based on future occurrences
 * @param alarmData - Alarm data to process
 * @returns Updated alarm data with correct isActive status
 */
export function setAlarmActiveStatus(alarmData: any): any {
  // Check if alarm has future occurrences
  const shouldBeActive = hasFutureOccurrence({
    time: alarmData.time,
    date: alarmData.date,
    days: alarmData.days,
  });

  // If isActive is explicitly set to false by user (manual toggle off), respect that
  // But if it's a new alarm or update, calculate automatically
  return {
    ...alarmData,
    isActive: alarmData.isActive === false ? false : shouldBeActive,
  };
}

/**
 * Smart toggle logic for manual toggle changes
 * - If user manually turns ON → set to true (user override)
 * - If user manually turns OFF → set to false (user override)
 * - If alarm update (not manual toggle) → calculate based on future occurrences
 */
export function handleAlarmToggle(
  alarmData: any,
  isManualToggle: boolean = false
): any {
  if (isManualToggle) {
    // User manually toggled - respect their choice
    return alarmData;
  }

  // Auto-calculate based on future occurrences
  return setAlarmActiveStatus(alarmData);
}
