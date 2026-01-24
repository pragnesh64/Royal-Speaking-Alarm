import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCreateAlarm } from "@/hooks/use-alarms";
import { useUpload } from "@/hooks/use-upload";
import { VoiceRecorder } from "@/components/voice-recorder";

export function AlarmModal() {
  const [open, setOpen] = useState(false);
  const createAlarm = useCreateAlarm();
  const upload = useUpload();
  
  const [formData, setFormData] = useState({
    title: "",
    time: "07:00",
    type: "speaking",
    textToSpeak: "",
    voiceGender: "female",
    voiceUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createAlarm.mutate(
      {
        ...formData,
        userId: "", // Handled by backend from session
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Default to daily for MVP
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  const handleRecording = async (blob: Blob) => {
    upload.mutate(blob, {
      onSuccess: (data) => {
        setFormData(prev => ({ ...prev, voiceUrl: data.url }));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl px-6 py-6 bg-gradient-to-r from-[#00BAF2] to-[#002E6E] shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white font-semibold text-lg italic">
          <Plus className="w-5 h-5 mr-2" /> New Alarm
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-white border-blue-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#002E6E] font-bold">Set New Alarm</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Alarm Name</Label>
              <Input 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Wake Up"
                required
                className="royal-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input 
                type="time" 
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                required
                className="royal-input num text-center text-lg font-bold"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Alarm Type</Label>
            <RadioGroup 
              value={formData.type} 
              onValueChange={val => setFormData({ ...formData, type: val })}
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-[#00BAF2]">
                <RadioGroupItem value="speaking" id="speaking" />
                <Label htmlFor="speaking" className="cursor-pointer">Speaking</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-[#00BAF2]">
                <RadioGroupItem value="custom_voice" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer">My Voice</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-[#00BAF2]">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="cursor-pointer">Text Msg</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.type === "custom_voice" && (
            <VoiceRecorder 
              onRecordingComplete={handleRecording} 
              isUploading={upload.isPending} 
            />
          )}

          {(formData.type === "speaking" || formData.type === "text") && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>Message to Speak</Label>
                <Input 
                  value={formData.textToSpeak || ""}
                  onChange={e => setFormData({ ...formData, textToSpeak: e.target.value })}
                  placeholder={formData.type === "text" ? "Type message..." : "Good morning..."}
                  className="royal-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Voice Preference</Label>
                <Select 
                  value={formData.voiceGender || "female"} 
                  onValueChange={val => setFormData({ ...formData, voiceGender: val })}
                >
                  <SelectTrigger className="royal-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female (Soft & Gentle)</SelectItem>
                    <SelectItem value="male">Male (Calm & Clear)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={createAlarm.isPending || (formData.type === "custom_voice" && !formData.voiceUrl) || upload.isPending}
            className="w-full h-12 text-lg rounded-xl bg-[#002E6E] hover:bg-[#002E6E]/90 text-white font-semibold shadow-lg shadow-blue-900/10 italic"
          >
            {createAlarm.isPending ? <Loader2 className="animate-spin" /> : "Set Alarm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
