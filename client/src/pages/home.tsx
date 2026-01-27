import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const RoutineIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="clockBodyR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e3f2fd"/>
        <stop offset="50%" stopColor="#bbdefb"/>
        <stop offset="100%" stopColor="#90caf9"/>
      </linearGradient>
      <linearGradient id="bellGradR" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd54f"/>
        <stop offset="100%" stopColor="#ffb300"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="108" rx="22" ry="5" fill="#90caf9" opacity="0.4"/>
    <ellipse cx="28" cy="28" rx="12" ry="10" fill="url(#bellGradR)" stroke="#f57c00" strokeWidth="2"/>
    <ellipse cx="92" cy="28" rx="12" ry="10" fill="url(#bellGradR)" stroke="#f57c00" strokeWidth="2"/>
    <rect x="56" y="18" width="8" height="12" rx="2" fill="#1565c0"/>
    <circle cx="60" cy="62" r="38" fill="url(#clockBodyR)" stroke="#1565c0" strokeWidth="3"/>
    <path d="M42 55 Q45 52 48 55" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M72 55 Q75 52 78 55" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M50 75 Q60 82 70 75" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="38" cy="62" r="6" fill="#ffcdd2" opacity="0.6"/>
    <circle cx="82" cy="62" r="6" fill="#ffcdd2" opacity="0.6"/>
    <text x="88" y="20" fontSize="11" fill="#1976d2" fontWeight="bold" fontStyle="italic">Z</text>
    <text x="96" y="12" fontSize="9" fill="#42a5f5" fontWeight="bold" fontStyle="italic">z</text>
    <text x="102" y="6" fontSize="7" fill="#64b5f6" fontWeight="bold" fontStyle="italic">z</text>
  </svg>
);

const MedicineIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="clockBodyM" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e3f2fd"/>
        <stop offset="50%" stopColor="#bbdefb"/>
        <stop offset="100%" stopColor="#90caf9"/>
      </linearGradient>
      <linearGradient id="bellGradM" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd54f"/>
        <stop offset="100%" stopColor="#ffb300"/>
      </linearGradient>
      <linearGradient id="pillRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ef5350"/>
        <stop offset="50%" stopColor="#ef5350"/>
        <stop offset="50%" stopColor="#fff9c4"/>
        <stop offset="100%" stopColor="#fff9c4"/>
      </linearGradient>
      <linearGradient id="bottleM" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a5d6a7"/>
        <stop offset="100%" stopColor="#66bb6a"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="108" rx="22" ry="5" fill="#90caf9" opacity="0.4"/>
    <ellipse cx="28" cy="28" rx="12" ry="10" fill="url(#bellGradM)" stroke="#f57c00" strokeWidth="2"/>
    <ellipse cx="92" cy="28" rx="12" ry="10" fill="url(#bellGradM)" stroke="#f57c00" strokeWidth="2"/>
    <rect x="56" y="18" width="8" height="12" rx="2" fill="#1565c0"/>
    <circle cx="60" cy="62" r="38" fill="url(#clockBodyM)" stroke="#1565c0" strokeWidth="3"/>
    <path d="M42 55 Q45 52 48 55" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M72 55 Q75 52 78 55" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M50 75 Q60 82 70 75" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="38" cy="62" r="6" fill="#ffcdd2" opacity="0.6"/>
    <circle cx="82" cy="62" r="6" fill="#ffcdd2" opacity="0.6"/>
    <rect x="8" y="70" width="18" height="30" rx="4" fill="url(#bottleM)" stroke="#388e3c" strokeWidth="2"/>
    <rect x="10" y="65" width="14" height="8" rx="2" fill="#2e7d32"/>
    <rect x="12" y="78" width="10" height="8" rx="1" fill="white" opacity="0.7"/>
    <ellipse cx="100" cy="80" rx="12" ry="6" fill="url(#pillRed)" stroke="#c62828" strokeWidth="1.5" transform="rotate(-25 100 80)"/>
  </svg>
);

const MeetingIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="clockBodyMt" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e3f2fd"/>
        <stop offset="50%" stopColor="#bbdefb"/>
        <stop offset="100%" stopColor="#90caf9"/>
      </linearGradient>
      <linearGradient id="bellGradMt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd54f"/>
        <stop offset="100%" stopColor="#ffb300"/>
      </linearGradient>
      <linearGradient id="notebookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff8e1"/>
        <stop offset="100%" stopColor="#ffecb3"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="108" rx="22" ry="5" fill="#90caf9" opacity="0.4"/>
    <ellipse cx="28" cy="28" rx="12" ry="10" fill="url(#bellGradMt)" stroke="#f57c00" strokeWidth="2"/>
    <ellipse cx="92" cy="28" rx="12" ry="10" fill="url(#bellGradMt)" stroke="#f57c00" strokeWidth="2"/>
    <rect x="56" y="18" width="8" height="12" rx="2" fill="#1565c0"/>
    <circle cx="60" cy="62" r="38" fill="url(#clockBodyMt)" stroke="#1565c0" strokeWidth="3"/>
    <path d="M42 55 Q45 52 48 55" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M72 55 Q75 52 78 55" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M50 75 Q60 82 70 75" fill="none" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="38" cy="62" r="6" fill="#ffcdd2" opacity="0.6"/>
    <circle cx="82" cy="62" r="6" fill="#ffcdd2" opacity="0.6"/>
    <rect x="85" y="60" width="24" height="32" rx="3" fill="url(#notebookGrad)" stroke="#f57c00" strokeWidth="2"/>
    <line x1="90" y1="68" x2="104" y2="68" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="90" y1="74" x2="104" y2="74" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="90" y1="80" x2="100" y2="80" stroke="#1565c0" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="97" cy="88" r="3" fill="#1565c0"/>
    <line x1="60" y1="62" x2="60" y2="45" stroke="#1565c0" strokeWidth="3" strokeLinecap="round"/>
    <line x1="60" y1="62" x2="72" y2="62" stroke="#1565c0" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="60" cy="62" r="3" fill="#1565c0"/>
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
