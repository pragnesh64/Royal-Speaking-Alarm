import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Camera, Upload } from "lucide-react";
import { useState } from "react";
import { useCreateMedicine } from "@/hooks/use-medicines";
import { useUpload } from "@/hooks/use-upload";
import { cn } from "@/lib/utils";

export function MedicineModal() {
  const [open, setOpen] = useState(false);
  const createMedicine = useCreateMedicine();
  const upload = useUpload();
  
  const [formData, setFormData] = useState({
    name: "",
    timeOfDay: "morning",
    dosage: "1 Pill",
    photoUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMedicine.mutate(
      {
        ...formData,
        userId: 1, // Mock user ID
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload.mutate(file, {
        onSuccess: (data) => {
          setFormData(prev => ({ ...prev, photoUrl: data.url }));
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl px-6 py-6 bg-gradient-to-r from-[#00BAF2] to-[#002E6E] shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white font-semibold text-lg italic">
          <Plus className="w-5 h-5 mr-2" /> Add Medicine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-blue-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#002E6E] font-bold">Add Medicine</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Medicine Name</Label>
            <Input 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Paracetamol"
              required
              className="royal-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Time of Day</Label>
              <Select 
                value={formData.timeOfDay} 
                onValueChange={val => setFormData({ ...formData, timeOfDay: val })}
              >
                <SelectTrigger className="royal-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input 
                value={formData.dosage || ""}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="1 Tablet"
                className="royal-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Medicine Photo</Label>
            <div className="mt-2 flex justify-center rounded-xl border border-dashed border-blue-200 px-6 py-8 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="text-center">
                {formData.photoUrl ? (
                  <div className="relative">
                    <img src={formData.photoUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg mx-auto shadow-md" />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm h-8 w-8 text-red-500 hover:text-red-700 hover:bg-white"
                      onClick={() => setFormData({ ...formData, photoUrl: "" })}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <Camera className="mx-auto h-10 w-10 text-blue-300" aria-hidden="true" />
                    <div className="mt-2 flex text-sm text-blue-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-[#00BAF2] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#00BAF2] focus-within:ring-offset-2 hover:text-[#0090c2]"
                      >
                        <span>Upload a photo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-blue-400 mt-1 italic">PNG, JPG up to 5MB</p>
                  </>
                )}
                {upload.isPending && <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-500 mt-2" />}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={createMedicine.isPending || upload.isPending}
            className="w-full h-12 text-lg rounded-xl bg-[#002E6E] hover:bg-[#002E6E]/90 text-white font-semibold shadow-lg shadow-blue-900/10 italic"
          >
            {createMedicine.isPending ? <Loader2 className="animate-spin" /> : "Save Medicine"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
