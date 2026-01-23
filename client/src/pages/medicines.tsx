import Layout from "@/components/layout";
import { MedicineModal } from "@/components/medicine-modal";
import { useMedicines, useDeleteMedicine } from "@/hooks/use-medicines";
import { Trash2, Sun, Moon, Sunset, Coffee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const TimeSection = ({ title, icon: Icon, medicines, onDelete }: any) => {
  if (!medicines || medicines.length === 0) return null;
  
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-6 border-b border-blue-100 pb-2">
        <div className="bg-blue-50 p-2 rounded-lg text-[#00BAF2]">
          <Icon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-[#002E6E]">{title}</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {medicines.map((med: any) => (
          <div key={med.id} className="royal-card overflow-hidden group">
            <div className="h-32 bg-slate-100 relative">
              {med.photoUrl ? (
                <img src={med.photoUrl} alt={med.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                  <span className="text-xs">No Photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <button 
                onClick={() => onDelete(med.id)}
                className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-400 hover:text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-[#002E6E] text-lg truncate">{med.name}</h3>
              <p className="text-sm text-[#00BAF2] mt-1">{med.dosage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Medicines() {
  const { data: medicines, isLoading } = useMedicines();
  const deleteMedicine = useDeleteMedicine();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#00BAF2] animate-spin" />
        </div>
      </Layout>
    );
  }

  const grouped = {
    morning: medicines?.filter(m => m.timeOfDay === 'morning'),
    afternoon: medicines?.filter(m => m.timeOfDay === 'afternoon'),
    evening: medicines?.filter(m => m.timeOfDay === 'evening'),
    night: medicines?.filter(m => m.timeOfDay === 'night'),
  };

  const hasMedicines = medicines && medicines.length > 0;

  return (
    <Layout>
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[#002E6E] mb-2">Medicine Box</h1>
          <p className="text-slate-500 text-lg">Keep track of your daily doses.</p>
        </div>
        <MedicineModal />
      </div>

      {!hasMedicines && (
        <div className="royal-card p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Coffee className="w-10 h-10 text-blue-300" />
          </div>
          <h3 className="text-xl font-bold text-[#002E6E] mb-2">No Medicines Added</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Add your medicines with photos to avoid confusion.</p>
        </div>
      )}

      <TimeSection title="Morning" icon={Sun} medicines={grouped.morning} onDelete={deleteMedicine.mutate} />
      <TimeSection title="Afternoon" icon={Sun} medicines={grouped.afternoon} onDelete={deleteMedicine.mutate} />
      <TimeSection title="Evening" icon={Sunset} medicines={grouped.evening} onDelete={deleteMedicine.mutate} />
      <TimeSection title="Night" icon={Moon} medicines={grouped.night} onDelete={deleteMedicine.mutate} />
    </Layout>
  );
}
