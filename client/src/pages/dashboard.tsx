import Layout from "@/components/layout";
import { AlarmModal } from "@/components/alarm-modal";
import { useAlarms, useDeleteAlarm, useUpdateAlarm } from "@/hooks/use-alarms";
import { Switch } from "@/components/ui/switch";
import { Trash2, Mic, MessageSquare, PlayCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: alarms, isLoading, error } = useAlarms();
  const deleteAlarm = useDeleteAlarm();
  const updateAlarm = useUpdateAlarm();

  // Simple playback function
  const playPreview = (alarm: any) => {
    if (alarm.voiceUrl) {
      new Audio(alarm.voiceUrl).play();
    } else if (alarm.textToSpeak) {
      const utterance = new SpeechSynthesisUtterance(alarm.textToSpeak);
      // Rough gender mapping
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes(alarm.voiceGender === 'female' ? 'Female' : 'Male'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#00BAF2] animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#002E6E] mb-2">My Alarms</h1>
          <p className="text-slate-500 text-lg">Manage your daily reminders and voices.</p>
        </div>
        <AlarmModal />
      </div>

      {alarms?.length === 0 ? (
        <div className="royal-card p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Mic className="w-10 h-10 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-[#002E6E] mb-2">No Alarms Set</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create your first speaking alarm. You can even record your mom's voice!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alarms?.map((alarm) => (
            <div key={alarm.id} className="royal-card p-6 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {alarm.type === "custom_voice" && <Mic className="w-4 h-4 text-[#00BAF2]" />}
                    {alarm.type === "text" && <MessageSquare className="w-4 h-4 text-[#00BAF2]" />}
                    <span className="text-sm font-semibold text-[#00BAF2] uppercase tracking-wider">{alarm.title}</span>
                  </div>
                  <h2 className="text-5xl font-bold text-[#002E6E] num tracking-tight">{alarm.time}</h2>
                </div>
                <Switch 
                  checked={alarm.isActive || false}
                  onCheckedChange={(checked) => updateAlarm.mutate({ id: alarm.id, isActive: checked })}
                  className="data-[state=checked]:bg-[#00BAF2]"
                />
              </div>

              <div className="mt-6 space-y-4 z-10">
                <div className="flex gap-1">
                  {alarm.days?.map((day, i) => (
                    <span key={i} className="text-[10px] uppercase font-bold text-blue-300 bg-blue-50 px-1.5 py-1 rounded">
                      {day.slice(0, 1)}
                    </span>
                  )) || <span className="text-xs text-slate-400">Daily</span>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => playPreview(alarm)}
                    className="text-[#002E6E] hover:text-[#00BAF2] hover:bg-blue-50 px-2"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" /> Preview
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAlarm.mutate(alarm.id)}
                    className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full w-8 h-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
