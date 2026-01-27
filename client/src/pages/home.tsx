import { Link } from "wouter";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const RoutineIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="royalBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a237e"/>
        <stop offset="50%" stopColor="#002E6E"/>
        <stop offset="100%" stopColor="#0d1b3e"/>
      </linearGradient>
      <linearGradient id="royalGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="30%" stopColor="#daa520"/>
        <stop offset="70%" stopColor="#b8860b"/>
        <stop offset="100%" stopColor="#8b6914"/>
      </linearGradient>
      <linearGradient id="royalFace" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fefefe"/>
        <stop offset="100%" stopColor="#f0f4f8"/>
      </linearGradient>
      <filter id="royalShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#0d1b3e" floodOpacity="0.4"/>
      </filter>
      <radialGradient id="royalShine" cx="35%" cy="25%" r="40%">
        <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="60" cy="112" rx="28" ry="6" fill="#0d1b3e" opacity="0.3"/>
    <g filter="url(#royalShadow)">
      <ellipse cx="28" cy="28" rx="14" ry="11" fill="url(#royalGold)"/>
      <ellipse cx="92" cy="28" rx="14" ry="11" fill="url(#royalGold)"/>
      <ellipse cx="28" cy="26" rx="8" ry="5" fill="#ffd700" opacity="0.5"/>
      <ellipse cx="92" cy="26" rx="8" ry="5" fill="#ffd700" opacity="0.5"/>
      <rect x="54" y="14" width="12" height="16" rx="4" fill="url(#royalBlue)"/>
      <circle cx="60" cy="64" r="42" fill="url(#royalBlue)"/>
      <circle cx="60" cy="64" r="36" fill="url(#royalFace)"/>
      <circle cx="60" cy="64" r="42" fill="url(#royalShine)"/>
    </g>
    <circle cx="60" cy="64" r="32" fill="none" stroke="url(#royalGold)" strokeWidth="2"/>
    <circle cx="60" cy="46" r="3" fill="url(#royalGold)"/>
    <circle cx="78" cy="64" r="3" fill="url(#royalGold)"/>
    <circle cx="60" cy="82" r="3" fill="url(#royalGold)"/>
    <circle cx="42" cy="64" r="3" fill="url(#royalGold)"/>
    <line x1="60" y1="64" x2="60" y2="48" stroke="#002E6E" strokeWidth="4" strokeLinecap="round"/>
    <line x1="60" y1="64" x2="74" y2="64" stroke="#002E6E" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="60" cy="64" r="5" fill="url(#royalGold)"/>
    <text x="96" y="16" fontSize="13" fill="#ffd700" fontWeight="bold" fontStyle="italic">Z</text>
    <text x="104" y="8" fontSize="10" fill="#daa520" fontWeight="bold" fontStyle="italic">z</text>
  </svg>
);

const MedicineIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="royalBottle" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a237e"/>
        <stop offset="50%" stopColor="#002E6E"/>
        <stop offset="100%" stopColor="#0d1b3e"/>
      </linearGradient>
      <linearGradient id="royalCap" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="50%" stopColor="#daa520"/>
        <stop offset="100%" stopColor="#8b6914"/>
      </linearGradient>
      <linearGradient id="royalPillRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c62828"/>
        <stop offset="50%" stopColor="#b71c1c"/>
        <stop offset="100%" stopColor="#7f0000"/>
      </linearGradient>
      <linearGradient id="royalPillGold" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="100%" stopColor="#b8860b"/>
      </linearGradient>
      <filter id="royalShadowM" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#0d1b3e" floodOpacity="0.4"/>
      </filter>
      <radialGradient id="royalShineM" cx="30%" cy="25%" r="40%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="60" cy="112" rx="32" ry="6" fill="#0d1b3e" opacity="0.3"/>
    <g filter="url(#royalShadowM)">
      <rect x="35" y="32" width="50" height="68" rx="10" fill="url(#royalBottle)"/>
      <rect x="35" y="32" width="50" height="68" rx="10" fill="url(#royalShineM)"/>
      <rect x="42" y="20" width="36" height="18" rx="6" fill="url(#royalCap)"/>
      <ellipse cx="60" cy="24" rx="14" ry="4" fill="#ffd700" opacity="0.5"/>
      <rect x="45" y="50" width="30" height="30" rx="5" fill="white" opacity="0.95"/>
      <path d="M52 60 L58 68 L72 54" fill="none" stroke="#ffd700" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <g filter="url(#royalShadowM)" transform="translate(8, 75) rotate(-20)">
      <ellipse cx="14" cy="7" rx="14" ry="7" fill="url(#royalPillRed)"/>
      <ellipse cx="20" cy="7" rx="8" ry="7" fill="white"/>
      <ellipse cx="10" cy="5" rx="4" ry="2" fill="white" opacity="0.4"/>
    </g>
    <g filter="url(#royalShadowM)" transform="translate(85, 60) rotate(25)">
      <ellipse cx="10" cy="6" rx="12" ry="6" fill="url(#royalPillGold)"/>
      <ellipse cx="16" cy="6" rx="6" ry="6" fill="white"/>
    </g>
    <g filter="url(#royalShadowM)">
      <path d="M104 28 C104 20 96 14 88 14 C80 14 74 20 74 26 C74 36 88 48 88 48 C88 48 104 36 104 28 Z" fill="url(#royalCap)"/>
    </g>
  </svg>
);

const MeetingIcon = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24">
    <defs>
      <linearGradient id="royalCalendar" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a237e"/>
        <stop offset="50%" stopColor="#002E6E"/>
        <stop offset="100%" stopColor="#0d1b3e"/>
      </linearGradient>
      <linearGradient id="royalCalTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd700"/>
        <stop offset="50%" stopColor="#daa520"/>
        <stop offset="100%" stopColor="#8b6914"/>
      </linearGradient>
      <linearGradient id="royalPerson1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1565c0"/>
        <stop offset="100%" stopColor="#0d47a1"/>
      </linearGradient>
      <linearGradient id="royalPerson2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c62828"/>
        <stop offset="100%" stopColor="#8b0000"/>
      </linearGradient>
      <linearGradient id="royalFace" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffe4c4"/>
        <stop offset="100%" stopColor="#deb887"/>
      </linearGradient>
      <filter id="royalShadowMt" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#0d1b3e" floodOpacity="0.4"/>
      </filter>
      <radialGradient id="royalShineMt" cx="30%" cy="20%" r="40%">
        <stop offset="0%" stopColor="white" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <ellipse cx="60" cy="112" rx="35" ry="6" fill="#0d1b3e" opacity="0.3"/>
    <g filter="url(#royalShadowMt)">
      <rect x="25" y="22" width="70" height="78" rx="8" fill="url(#royalCalendar)"/>
      <rect x="25" y="22" width="70" height="78" rx="8" fill="url(#royalShineMt)"/>
      <rect x="25" y="22" width="70" height="22" rx="8" fill="url(#royalCalTop)"/>
      <ellipse cx="60" cy="28" rx="25" ry="5" fill="#ffd700" opacity="0.4"/>
      <rect x="38" y="14" width="8" height="18" rx="4" fill="url(#royalCalendar)"/>
      <rect x="74" y="14" width="8" height="18" rx="4" fill="url(#royalCalendar)"/>
      <rect x="33" y="50" width="54" height="42" rx="4" fill="white" opacity="0.95"/>
    </g>
    <g filter="url(#royalShadowMt)">
      <circle cx="48" cy="66" r="10" fill="url(#royalFace)"/>
      <ellipse cx="48" cy="84" rx="10" ry="12" fill="url(#royalPerson1)"/>
      <ellipse cx="48" cy="76" rx="4" ry="2" fill="#ffd700"/>
    </g>
    <g filter="url(#royalShadowMt)">
      <circle cx="72" cy="66" r="10" fill="url(#royalFace)"/>
      <ellipse cx="72" cy="84" rx="10" ry="12" fill="url(#royalPerson2)"/>
      <ellipse cx="72" cy="76" rx="4" ry="2" fill="#ffd700"/>
    </g>
    <circle cx="45" cy="64" r="2" fill="#002E6E"/>
    <circle cx="51" cy="64" r="2" fill="#002E6E"/>
    <path d="M44 70 Q48 74 52 70" fill="none" stroke="#002E6E" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="69" cy="64" r="2" fill="#002E6E"/>
    <circle cx="75" cy="64" r="2" fill="#002E6E"/>
    <path d="M68 70 Q72 74 76 70" fill="none" stroke="#002E6E" strokeWidth="2" strokeLinecap="round"/>
    <path d="M56 56 L60 48 L64 56 L60 54 Z" fill="#ffd700"/>
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
