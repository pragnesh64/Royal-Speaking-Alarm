import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen royal-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur shadow-2xl border-0">
        <CardHeader className="text-center pt-10 pb-2">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Mic className="w-10 h-10 text-[#002E6E]" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#002E6E] italic">PA Alarm</CardTitle>
          <p className="text-slate-500 italic">Your Personal Voice Assistant</p>
        </CardHeader>
        <CardContent className="space-y-6 pb-10 px-8">
          <div className="space-y-2 text-center text-sm text-slate-600 mb-6">
            <p>• Speaking Alarms in your voice</p>
            <p>• Visual Medicine Reminders</p>
            <p>• Family Voice Sharing</p>
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full h-12 text-lg bg-[#002E6E] hover:bg-[#002E6E]/90 text-white font-bold shadow-lg shadow-blue-900/20 italic"
          >
            Login / Sign Up
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
