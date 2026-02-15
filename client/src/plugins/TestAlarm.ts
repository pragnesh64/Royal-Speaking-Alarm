import FullScreenAlarm from './FullScreenAlarm';

/**
 * Test function to schedule an alarm 30 seconds from now
 * Call this from browser console: window.testAlarm()
 */
export async function testAlarm() {
  try {
    const triggerTime = Date.now() + 30000; // 30 seconds from now

    console.log('[TestAlarm] Scheduling test alarm for:', new Date(triggerTime).toLocaleString());

    const result = await FullScreenAlarm.schedule({
      id: 999,
      title: 'TEST ALARM',
      body: 'This is a test alarm to verify screen wake functionality',
      triggerAtMillis: triggerTime,
      type: 'alarm',
      allowWhileIdle: true
    });

    console.log('[TestAlarm] Schedule result:', result);
    console.log('[TestAlarm] Test alarm scheduled! Lock your phone now. It will ring in 30 seconds.');

    return result;
  } catch (error) {
    console.error('[TestAlarm] Failed to schedule test alarm:', error);
    throw error;
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testAlarm = testAlarm;
  console.log('[TestAlarm] Test function available: window.testAlarm()');
}
