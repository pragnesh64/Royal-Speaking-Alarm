import { useEffect, useState, useRef, useCallback } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useAlarms, useUpdateAlarm } from "@/hooks/use-alarms";
import { useMedicines } from "@/hooks/use-medicines";
import { useTranslations } from "@/hooks/use-translations";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Users, X } from "lucide-react";

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  location?: string;
  textToSpeak?: string;
  enabled: boolean;
}

interface ActiveAlarmData {
  id: number;
  type: 'alarm' | 'medicine' | 'meeting';
  alarmType?: string;
  title: string;
  message: string;
  imageUrl?: string;
  voiceUrl?: string;
  audio?: HTMLAudioElement;
  language?: string;
}

const langMap: Record<string, string> = {
  english: 'en-US', hindi: 'hi-IN', marathi: 'mr-IN', spanish: 'es-ES',
  french: 'fr-FR', german: 'de-DE', chinese: 'zh-CN', japanese: 'ja-JP',
  arabic: 'ar-SA', russian: 'ru-RU', portuguese: 'pt-PT', bengali: 'bn-IN',
  telugu: 'te-IN', tamil: 'ta-IN', gujarati: 'gu-IN', kannada: 'kn-IN',
  malayalam: 'ml-IN', punjabi: 'pa-IN'
};

export function GlobalAlarmHandler() {
  const { user } = useAuth();
  const { data: alarms } = useAlarms();
  const { data: medicines } = useMedicines();
  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings'],
    enabled: !!user,
    refetchInterval: 60000,
  });
  const updateAlarm = useUpdateAlarm();
  const t = useTranslations();

  const [activeAlarms, setActiveAlarms] = useState<Set<number>>(new Set());
  const [activeMeds, setActiveMeds] = useState<Set<number>>(new Set());
  const [activeMeetings, setActiveMeetings] = useState<Set<number>>(new Set());
  const [dismissedAlarms, setDismissedAlarms] = useState<Map<number, string>>(new Map());
  const [dismissedMeds, setDismissedMeds] = useState<Map<number, string>>(new Map());
  const [dismissedMeetings, setDismissedMeetings] = useState<Map<number, string>>(new Map());
  const [activeAlarmPopup, setActiveAlarmPopup] = useState<ActiveAlarmData | null>(null);
  const [snoozeTimeout, setSnoozeTimeout] = useState<NodeJS.Timeout | null>(null);
  const vibrateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef<boolean>(false);

  const speakTTS = useCallback((textToSpeak: string, language: string, voiceGender: string, shouldLoop: boolean) => {
    isSpeakingRef.current = true;

    const speak = () => {
      if (!isSpeakingRef.current) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langMap[language] || 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)) && v.name.includes(voiceGender === 'male' ? 'Male' : 'Female')) ||
                        voices.find((v) => v.lang.startsWith(utterance.lang.slice(0, 2)));

      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        if (shouldLoop && isSpeakingRef.current) {
          setTimeout(speak, 500);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    speak();
  }, []);

  const triggerAlarm = useCallback((item: any, type: 'alarm' | 'medicine' | 'meeting') => {
    console.log(`[GlobalAlarm] Triggering ${type}:`, item.id);
    const duration = (item.duration || 30) * 1000;
    const shouldLoop = item.loop !== false;
    let audio: HTMLAudioElement | undefined;

    const message = item.textToSpeak || item.title || (type === 'medicine' ? `Time for medicine: ${item.name}` : type === 'meeting' ? `Meeting: ${item.title}${item.location ? ` at ${item.location}` : ''}` : 'Alarm');

    setActiveAlarmPopup({
      id: item.id,
      type,
      alarmType: item.type || 'speaking',
      title: item.title || item.name || 'Alarm',
      message,
      imageUrl: item.imageUrl || item.photoUrl,
      voiceUrl: item.voiceUrl,
      language: item.language || user?.language || 'english',
    });

    if (item.type === "vibration") {
      if ('vibrate' in navigator) {
        const vibratePattern = () => {
          navigator.vibrate([500, 200, 500, 200, 500]);
        };
        vibratePattern();
        if (vibrateIntervalRef.current) clearInterval(vibrateIntervalRef.current);
        vibrateIntervalRef.current = setInterval(vibratePattern, 2000);
        setTimeout(() => {
          if (vibrateIntervalRef.current) {
            clearInterval(vibrateIntervalRef.current);
            vibrateIntervalRef.current = null;
          }
        }, duration);
      }
    } else if ((item.type === "custom_voice" || item.type === "music") && item.voiceUrl) {
      audio = new Audio(item.voiceUrl);
      audio.loop = shouldLoop;
      audio.play().catch(err => {
        console.error("[GlobalAlarm] Audio playback failed:", err);
        const ttsText = item.textToSpeak || item.title || item.name || t.alarm;
        speakTTS(ttsText, item.language || user?.language || 'english', item.voiceGender || 'female', shouldLoop);
      });

      setActiveAlarmPopup(prev => prev ? { ...prev, audio } : null);

      setTimeout(() => {
        audio?.pause();
        if (audio) audio.src = "";
      }, duration);
    } else if (item.textToSpeak || type === 'medicine' || item.type === 'speaking') {
      const msg = item.textToSpeak || (type === 'medicine' ? `${t.timeForMedicine}: ${item.name}` : item.title || t.alarm);
      if (msg) {
        speakTTS(msg, item.language || user?.language || 'english', item.voiceGender || 'female', shouldLoop);
        setTimeout(() => {
          window.speechSynthesis.cancel();
        }, duration);
      }
    }
  }, [user, speakTTS, t]);

  const triggerFromPushData = useCallback((data: any) => {
    console.log('[GlobalAlarm] Triggering from push data:', data);
    const isMedicine = data.type === 'medicine';
    const isMeeting = data.type === 'meeting';
    const medDosage = data.dosage ? ` (${data.dosage})` : '';
    const medName = data.title || t.medicine;
    const defaultMedText = `${t.timeForMedicine}: ${medName}${medDosage}`;
    
    const item = {
      id: data.id || data.alarmId || 0,
      title: data.title || (isMeeting ? t.myMeetings : isMedicine ? t.medicineReminder : t.alarm),
      name: data.title || (isMedicine ? t.medicine : t.alarm),
      textToSpeak: data.textToSpeak || data.body || (isMedicine ? defaultMedText : isMeeting ? `Meeting: ${data.title}` : undefined),
      type: data.alarmType || 'speaking',
      voiceUrl: data.voiceUrl,
      imageUrl: data.imageUrl || data.photoUrl,
      photoUrl: data.photoUrl,
      location: data.location,
      language: data.language || 'english',
      duration: data.duration || 30,
      loop: data.loop !== false,
      voiceGender: data.voiceGender || 'female',
    };
    const alarmKind: 'alarm' | 'medicine' | 'meeting' = isMeeting ? 'meeting' : isMedicine ? 'medicine' : 'alarm';
    triggerAlarm(item, alarmKind);
  }, [triggerAlarm, t]);

  const dismissAlarm = useCallback(() => {
    isSpeakingRef.current = false;
    window.speechSynthesis.cancel();

    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if ('vibrate' in navigator) navigator.vibrate(0);

    if (activeAlarmPopup) {
      if (activeAlarmPopup.audio) {
        activeAlarmPopup.audio.pause();
        activeAlarmPopup.audio.src = "";
      }

      const currentTime = format(new Date(), "HH:mm");

      if (activeAlarmPopup.type === 'alarm') {
        setActiveAlarms(prev => {
          const next = new Set(prev);
          next.delete(activeAlarmPopup.id);
          return next;
        });
        setDismissedAlarms(prev => {
          const next = new Map(prev);
          next.set(activeAlarmPopup.id, currentTime);
          return next;
        });
      } else if (activeAlarmPopup.type === 'meeting') {
        setActiveMeetings(prev => {
          const next = new Set(prev);
          next.delete(activeAlarmPopup.id);
          return next;
        });
        setDismissedMeetings(prev => {
          const next = new Map(prev);
          next.set(activeAlarmPopup.id, currentTime);
          return next;
        });
      } else {
        setActiveMeds(prev => {
          const next = new Set(prev);
          next.delete(activeAlarmPopup.id);
          return next;
        });
        setDismissedMeds(prev => {
          const next = new Map(prev);
          next.set(activeAlarmPopup.id, currentTime);
          return next;
        });
      }
      setActiveAlarmPopup(null);
    }
    if (snoozeTimeout) {
      clearTimeout(snoozeTimeout);
      setSnoozeTimeout(null);
    }
  }, [activeAlarmPopup, snoozeTimeout]);

  const snoozeAlarm = useCallback((minutes: number = 5) => {
    isSpeakingRef.current = false;
    window.speechSynthesis.cancel();

    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
    }
    if ('vibrate' in navigator) navigator.vibrate(0);

    if (activeAlarmPopup) {
      if (activeAlarmPopup.audio) {
        activeAlarmPopup.audio.pause();
        activeAlarmPopup.audio.src = "";
      }

      const alarmData = activeAlarmPopup;
      setActiveAlarmPopup(null);

      const timeout = setTimeout(() => {
        const item = alarmData.type === 'alarm'
          ? alarms?.find(a => a.id === alarmData.id)
          : medicines?.find(m => m.id === alarmData.id);
        if (item) {
          triggerAlarm(item, alarmData.type);
        } else {
          triggerFromPushData({
            id: alarmData.id,
            title: alarmData.title,
            textToSpeak: alarmData.message,
            alarmType: alarmData.alarmType,
            voiceUrl: alarmData.voiceUrl,
            imageUrl: alarmData.imageUrl,
            language: alarmData.language,
            type: alarmData.type,
          });
        }
      }, minutes * 60 * 1000);

      setSnoozeTimeout(timeout);
    }
  }, [activeAlarmPopup, alarms, medicines, triggerAlarm, triggerFromPushData]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = format(now, "HH:mm");
      const currentDay = format(now, "EEE");
      const currentDate = format(now, "yyyy-MM-dd");

      alarms?.forEach(alarm => {
        if (!alarm.isActive) return;

        const isTimeMatch = alarm.time === currentTime;
        const isDayMatch = alarm.days?.includes(currentDay);
        const isDateMatch = alarm.date === currentDate;
        const wasDismissedThisMinute = dismissedAlarms.get(alarm.id) === currentTime;

        if (isTimeMatch && (isDayMatch || isDateMatch || (!alarm.days?.length && !alarm.date))) {
          if (!activeAlarms.has(alarm.id) && !wasDismissedThisMinute) {
            triggerAlarm(alarm, 'alarm');
            setActiveAlarms(prev => new Set(prev).add(alarm.id));
            if (isDateMatch) updateAlarm.mutate({ id: alarm.id, isActive: false });
          }
        } else {
          if (activeAlarms.has(alarm.id) && !activeAlarmPopup) {
            setActiveAlarms(prev => {
              const next = new Set(prev);
              next.delete(alarm.id);
              return next;
            });
          }
          if (dismissedAlarms.has(alarm.id) && dismissedAlarms.get(alarm.id) !== currentTime) {
            setDismissedAlarms(prev => {
              const next = new Map(prev);
              next.delete(alarm.id);
              return next;
            });
          }
        }
      });

      medicines?.forEach(med => {
        const isTimeMatch = med.times?.includes(currentTime);
        const wasDismissedThisMinute = dismissedMeds.get(med.id) === currentTime;

        if (isTimeMatch) {
          if (!activeMeds.has(med.id) && !wasDismissedThisMinute) {
            triggerAlarm(med, 'medicine');
            setActiveMeds(prev => new Set(prev).add(med.id));
          }
        } else {
          if (activeMeds.has(med.id) && !activeAlarmPopup) {
            setActiveMeds(prev => {
              const next = new Set(prev);
              next.delete(med.id);
              return next;
            });
          }
          if (dismissedMeds.has(med.id) && dismissedMeds.get(med.id) !== currentTime) {
            setDismissedMeds(prev => {
              const next = new Map(prev);
              next.delete(med.id);
              return next;
            });
          }
        }
      });

      meetings?.forEach(meeting => {
        if (!meeting.enabled) return;
        const isTimeMatch = meeting.time === currentTime;
        const isDateMatch = meeting.date === currentDate;
        const wasDismissedThisMinute = dismissedMeetings.get(meeting.id) === currentTime;

        if (isTimeMatch && isDateMatch) {
          if (!activeMeetings.has(meeting.id) && !wasDismissedThisMinute) {
            const meetingItem = {
              ...meeting,
              type: 'speaking' as const,
              textToSpeak: meeting.textToSpeak || `Meeting: ${meeting.title}${meeting.location ? ` at ${meeting.location}` : ''}`,
              language: user?.language || 'english',
              duration: 30,
              loop: true,
              voiceGender: 'female',
            };
            triggerAlarm(meetingItem, 'meeting');
            setActiveMeetings(prev => new Set(prev).add(meeting.id));
          }
        } else {
          if (activeMeetings.has(meeting.id) && !activeAlarmPopup) {
            setActiveMeetings(prev => {
              const next = new Set(prev);
              next.delete(meeting.id);
              return next;
            });
          }
          if (dismissedMeetings.has(meeting.id) && dismissedMeetings.get(meeting.id) !== currentTime) {
            setDismissedMeetings(prev => {
              const next = new Map(prev);
              next.delete(meeting.id);
              return next;
            });
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, medicines, meetings, activeAlarms, activeMeds, activeMeetings, activeAlarmPopup, dismissedAlarms, dismissedMeds, dismissedMeetings, triggerAlarm, user]);

  useEffect(() => {
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ALARM_TRIGGER') {
        triggerFromPushData(event.data.data);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
    };
  }, [triggerFromPushData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const alarmId = params.get('alarm_id');
    const alarmType = params.get('alarm_type');

    if (alarmId) {
      const data = {
        id: parseInt(alarmId),
        type: alarmType || 'alarm',
        alarmType: params.get('alarm_sound_type') || 'speaking',
        title: params.get('alarm_title') || 'Alarm',
        textToSpeak: params.get('alarm_text'),
        body: params.get('alarm_body'),
        voiceUrl: params.get('alarm_voice_url'),
        imageUrl: params.get('alarm_image_url'),
        photoUrl: params.get('alarm_photo_url'),
        dosage: params.get('alarm_dosage'),
        language: params.get('alarm_language') || 'english',
        duration: params.get('alarm_duration') ? parseInt(params.get('alarm_duration')!) : 30,
        voiceGender: params.get('alarm_voice_gender') || 'female',
      };

      localStorage.setItem('pendingAlarmTrigger', JSON.stringify({ ...data, storedAt: Date.now() }));

      setTimeout(() => triggerFromPushData(data), 500);

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else {
      const pending = localStorage.getItem('pendingAlarmTrigger');
      if (pending) {
        try {
          const data = JSON.parse(pending);
          localStorage.removeItem('pendingAlarmTrigger');
          const age = Date.now() - (data.storedAt || 0);
          if (age < 5 * 60 * 1000) {
            setTimeout(() => triggerFromPushData(data), 500);
          }
        } catch (e) {
          localStorage.removeItem('pendingAlarmTrigger');
        }
      }
    }
  }, [triggerFromPushData]);

  useEffect(() => {
    const handleCustomAlarm = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { alarm, type } = customEvent.detail;
      if (alarm) {
        triggerAlarm(alarm, type || 'alarm');
      }
    };

    window.addEventListener('trigger-alarm', handleCustomAlarm);
    return () => {
      window.removeEventListener('trigger-alarm', handleCustomAlarm);
    };
  }, [triggerAlarm]);

  return (
    <Dialog open={!!activeAlarmPopup} onOpenChange={(open) => !open && dismissAlarm()}>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden z-[9999]">
        <div className="bg-gradient-to-br from-[#002E6E] to-[#001a40] p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {activeAlarmPopup?.type === 'meeting' ? <Users className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <span className="text-lg font-bold">{activeAlarmPopup?.type === 'alarm' ? t.alarm : activeAlarmPopup?.type === 'meeting' ? t.myMeetings : t.medicineReminder}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismissAlarm}
              className="text-white hover:bg-white/20 rounded-full"
              data-testid="button-dismiss-alarm-x"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="text-2xl font-bold mb-2">{activeAlarmPopup?.title}</h2>
          <p className="text-blue-200 text-lg">{activeAlarmPopup?.message}</p>
        </div>

        {activeAlarmPopup?.imageUrl && (
          <div className="p-4">
            <img
              src={activeAlarmPopup.imageUrl}
              alt="Reminder"
              className="w-full rounded-xl object-contain max-h-64 bg-slate-50"
            />
          </div>
        )}

        <div className="p-6 pt-2 space-y-3">
          <Button
            onClick={() => snoozeAlarm(5)}
            variant="outline"
            className="w-full h-12 text-lg rounded-xl border-2 border-[#00BAF2] text-[#00BAF2] hover:bg-[#00BAF2]/10 font-semibold"
            data-testid="button-remind-later"
          >
            {t.remindMeLater}
          </Button>
          <Button
            onClick={dismissAlarm}
            className="w-full h-12 text-lg rounded-xl bg-[#002E6E] hover:bg-[#002E6E]/90 text-white font-semibold"
            data-testid="button-done"
          >
            {t.done}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
