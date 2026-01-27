import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const RoutineIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="clockBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e3f2fd"/>
        <stop offset="100%" stopColor="#bbdefb"/>
      </linearGradient>
      <linearGradient id="bellGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffcc80"/>
        <stop offset="100%" stopColor="#ffb74d"/>
      </linearGradient>
    </defs>
    <ellipse cx="22" cy="32" rx="14" ry="10" fill="url(#bellGrad)" stroke="#e65100" strokeWidth="2"/>
    <ellipse cx="98" cy="32" rx="14" ry="10" fill="url(#bellGrad)" stroke="#e65100" strokeWidth="2"/>
    <circle cx="60" cy="65" r="38" fill="url(#clockBody)" stroke="#1565c0" strokeWidth="4"/>
    <circle cx="60" cy="65" r="30" fill="white" stroke="#1976d2" strokeWidth="2"/>
    <line x1="60" y1="65" x2="60" y2="42" stroke="#1565c0" strokeWidth="4" strokeLinecap="round"/>
    <line x1="60" y1="65" x2="78" y2="65" stroke="#1976d2" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="60" cy="65" r="4" fill="#1565c0"/>
    <rect x="54" y="20" width="12" height="10" rx="3" fill="#1565c0"/>
    <ellipse cx="60" cy="108" rx="20" ry="4" fill="#90caf9" opacity="0.5"/>
    <text x="100" y="28" fontSize="14" fill="#1976d2" fontWeight="bold" fontStyle="italic">z</text>
    <text x="108" y="20" fontSize="12" fill="#42a5f5" fontWeight="bold" fontStyle="italic">z</text>
  </svg>
);

const MedicineIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="pillGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef5350"/>
        <stop offset="100%" stopColor="#e53935"/>
      </linearGradient>
      <linearGradient id="pillGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff9c4"/>
        <stop offset="100%" stopColor="#fff59d"/>
      </linearGradient>
      <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#81d4fa"/>
        <stop offset="100%" stopColor="#4fc3f7"/>
      </linearGradient>
    </defs>
    <rect x="35" y="35" width="50" height="70" rx="8" fill="url(#bottleGrad)" stroke="#0288d1" strokeWidth="3"/>
    <rect x="40" y="25" width="40" height="15" rx="4" fill="#0288d1"/>
    <rect x="45" y="50" width="30" height="20" rx="4" fill="white" opacity="0.9"/>
    <text x="52" y="64" fontSize="10" fill="#0288d1" fontWeight="bold">Rx</text>
    <ellipse cx="25" cy="45" rx="15" ry="8" fill="url(#pillGrad1)" stroke="#c62828" strokeWidth="2" transform="rotate(-30 25 45)"/>
    <ellipse cx="25" cy="45" rx="7" ry="8" fill="url(#pillGrad2)" stroke="#f9a825" strokeWidth="1" transform="rotate(-30 25 45)"/>
    <circle cx="95" cy="85" r="12" fill="#66bb6a" stroke="#388e3c" strokeWidth="2"/>
    <text x="91" y="90" fontSize="14" fill="white" fontWeight="bold">+</text>
    <ellipse cx="60" cy="112" rx="25" ry="4" fill="#81d4fa" opacity="0.4"/>
  </svg>
);

const MeetingIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="person1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7986cb"/>
        <stop offset="100%" stopColor="#5c6bc0"/>
      </linearGradient>
      <linearGradient id="person2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4db6ac"/>
        <stop offset="100%" stopColor="#26a69a"/>
      </linearGradient>
      <linearGradient id="person3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffb74d"/>
        <stop offset="100%" stopColor="#ffa726"/>
      </linearGradient>
    </defs>
    <circle cx="60" cy="35" r="16" fill="#ffcc80" stroke="#e65100" strokeWidth="2"/>
    <ellipse cx="60" cy="75" rx="22" ry="25" fill="url(#person1)" stroke="#3949ab" strokeWidth="2"/>
    <circle cx="60" cy="30" r="3" fill="#5d4037"/>
    <path d="M54 38 Q60 44 66 38" fill="none" stroke="#5d4037" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="25" cy="50" r="12" fill="#ffcc80" stroke="#e65100" strokeWidth="2"/>
    <ellipse cx="25" cy="85" rx="16" ry="20" fill="url(#person2)" stroke="#00897b" strokeWidth="2"/>
    <circle cx="95" cy="50" r="12" fill="#ffcc80" stroke="#e65100" strokeWidth="2"/>
    <ellipse cx="95" cy="85" rx="16" ry="20" fill="url(#person3)" stroke="#f57c00" strokeWidth="2"/>
    <ellipse cx="60" cy="108" rx="35" ry="4" fill="#9fa8da" opacity="0.4"/>
    <circle cx="45" cy="20" r="4" fill="#ec407a"/>
    <circle cx="75" cy="18" r="3" fill="#42a5f5"/>
    <circle cx="85" cy="25" r="2" fill="#66bb6a"/>
  </svg>
);

export default function Home() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const h = hours % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getAmPm = (date: Date) => date.getHours() >= 12 ? 'PM' : 'AM';

  const getDayName = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const cards = [
    { href: "/routine", title: "Set Your Routine", icon: RoutineIcon },
    { href: "/medicines", title: "Set Your Medicine", icon: MedicineIcon },
    { href: "/meetings", title: "Set Your Meeting", icon: MeetingIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="text-center pt-8 pb-4 px-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl royal-gradient flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#002E6E] tracking-wide uppercase">
            Your Personal Assistant
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center px-4">
        <div className="text-center mb-8 mt-4">
          <div className="relative inline-block">
            <span 
              className="text-7xl md:text-8xl font-bold text-[#002E6E] tracking-tight"
              style={{ fontFamily: 'Cambria, Georgia, serif' }}
              data-testid="text-current-time"
            >
              {formatTime(time)}
            </span>
            <span 
              className="absolute -top-1 -right-14 md:-right-16 text-base md:text-lg font-semibold text-[#002E6E]/70"
              style={{ fontFamily: 'Cambria, Georgia, serif' }}
              data-testid="text-ampm"
            >
              {getDayName(time)}
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-5 pb-8">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.href} href={card.href} data-testid={`link-${card.href.slice(1)}`}>
                <div 
                  className="bg-white rounded-2xl py-5 px-4 shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300 cursor-pointer group text-center"
                  data-testid={`card-${card.href.slice(1)}`}
                >
                  <div className="flex justify-center mb-2 group-hover:scale-105 transition-transform">
                    <IconComponent />
                  </div>
                  <h2 className="text-lg font-bold text-[#002E6E] italic">
                    {card.title}
                  </h2>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
