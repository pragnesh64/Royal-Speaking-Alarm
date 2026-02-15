import { registerPlugin } from '@capacitor/core';

export interface FullScreenAlarmPlugin {
  /**
   * Schedules a one-time full-screen alarm
   *
   * @param options - Alarm configuration
   * @param options.id - Unique alarm ID
   * @param options.title - Alarm title
   * @param options.body - Alarm message
   * @param options.triggerAtMillis - Timestamp in milliseconds when alarm should trigger
   * @param options.type - Alarm type ('alarm', 'medicine', 'meeting')
   * @param options.allowWhileIdle - Allow alarm to fire even in Doze mode (default: true)
   * @returns Promise resolving to { success: boolean, alarmId: number }
   */
  schedule(options: {
    id: number;
    title: string;
    body: string;
    triggerAtMillis: number;
    type?: string;
    allowWhileIdle?: boolean;
  }): Promise<{ success: boolean; alarmId: number }>;

  /**
   * Schedules a daily repeating full-screen alarm
   *
   * @param options - Alarm configuration
   * @param options.id - Unique alarm ID
   * @param options.title - Alarm title
   * @param options.body - Alarm message
   * @param options.hour - Hour (0-23)
   * @param options.minute - Minute (0-59)
   * @param options.type - Alarm type
   * @returns Promise resolving to { success: boolean, alarmId: number }
   */
  scheduleRepeating(options: {
    id: number;
    title: string;
    body: string;
    hour: number;
    minute: number;
    type?: string;
  }): Promise<{ success: boolean; alarmId: number }>;

  /**
   * Cancels a scheduled alarm
   *
   * @param options - Options containing alarm ID
   * @param options.id - Alarm ID to cancel
   * @returns Promise resolving to { success: boolean }
   */
  cancel(options: { id: number }): Promise<{ success: boolean }>;
}

const FullScreenAlarm = registerPlugin<FullScreenAlarmPlugin>('FullScreenAlarm', {
  web: () => import('./FullScreenAlarmWeb').then(m => new m.FullScreenAlarmWeb()),
});

export default FullScreenAlarm;
