import Layout from "@/components/layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [language, setLanguage] = useState("english");

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#002E6E] mb-2">Settings</h1>
        <p className="text-slate-500 text-lg">Customize your assistant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Language Settings */}
        <section className="space-y-6">
          <div className="royal-card p-6">
            <h3 className="text-xl font-bold text-[#002E6E] mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#00BAF2]" /> Language
            </h3>
            <div className="space-y-2">
              <Label>App Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="royal-input bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="marathi">Marathi (मराठी)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-400 italic mt-2">
                This will change the spoken language for alarms and interface.
              </p>
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="space-y-6">
          <div className="bg-gradient-to-br from-[#002E6E] to-[#001a40] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-yellow-400" />
                <h3 className="text-2xl font-bold tracking-wide italic">Premium Plan</h3>
              </div>
              <p className="text-blue-200 mb-8">Unlock unlimited alarms and family voice sharing.</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00BAF2]" />
                  </div>
                  <span>Unlimited Speaking Alarms</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00BAF2]" />
                  </div>
                  <span>Medicine Photo Library</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00BAF2]" />
                  </div>
                  <span>Family Voice Sharing</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center mb-6 border border-white/5">
                <div>
                  <p className="text-sm text-blue-200">Current Plan</p>
                  <p className="font-bold text-lg">30 Days Free Trial</p>
                </div>
                <span className="text-[#00BAF2] bg-[#00BAF2]/10 px-3 py-1 rounded-full text-sm font-bold border border-[#00BAF2]/20">Active</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-white text-[#002E6E] hover:bg-blue-50 font-bold">
                  ₹30 / Month
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  ₹365 / Year
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
