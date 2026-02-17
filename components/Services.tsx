"use client";

import { useEffect, useRef, useState } from "react";

// Icons matching PNG design
function ScissorsIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function BeardIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 5 5 5 9v3c0 4 2 7 7 11 5-4 7-7 7-11V9c0-4-3-7-7-7z" />
      <path d="M9 12c0 2 1.5 4 3 5 1.5-1 3-3 3-5" />
    </svg>
  );
}

function RazorIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="18" height="6" rx="1" />
      <line x1="7" y1="10" x2="7" y2="16" />
      <path d="M3 13h4" />
    </svg>
  );
}

function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const services = [
  {
    icon: ScissorsIcon,
    title: "Muško šišanje",
    description: "Precizno šišanje prilagođeno tvom stilu.",
  },
  {
    icon: BeardIcon,
    title: "Trimovanje brade",
    description: "Uređivanje brade uz savršenu definiciju i čiste linije.",
  },
  {
    icon: RazorIcon,
    title: "Brijanje britvom",
    description: "Precizno brijanje britvom za besprekoran rezultat.",
  },
  {
    icon: StarIcon,
    title: "Premium proizvodi",
    description: "Koristimo proverene premium proizvode za negu kose i brade.",
  },
];

export function Services({ onBookClick }: { onBookClick?: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="usluge"
      className="bg-white py-20 md:py-28 lg:py-32"
      aria-labelledby="services-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          
          {/* Left - Text content */}
          <div 
            className={`transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Heading - matches PNG */}
            <h2
              id="services-heading"
              className="font-heading text-[42px] text-[#1a1a1a] md:text-[48px]"
            >
              USLUGE
            </h2>
            
            {/* Subheading */}
            <p className="mt-5 text-[16px] font-medium text-[#1a1a1a] md:text-[17px]">
              Profesionalan pristup, savremeni trendovi i osećaj premium nege.
            </p>
            
            {/* Body text */}
            <p className="mt-4 text-[14px] leading-[1.8] text-[#666666] md:text-[15px]">
              Od preciznog šišanja i besprekornog fade-a do detaljnog oblikovanja i brijanja brade, svaki tretman izvodimo sa maksimalnom posvećenošću i vrhunskom tehnikom.
            </p>
            
            {/* CTA Button */}
            <button
              type="button"
              onClick={onBookClick}
              className="mt-8 btn-outline-dark"
            >
              ZAKAŽI TERMIN
            </button>
          </div>
          
          {/* Right - 2x2 Service grid with proper borders */}
          <div 
            className={`grid grid-cols-2 border border-[#e5e5e5] transition-all duration-700 delay-150 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {services.map((service, index) => (
              <div
                key={service.title}
                className={`flex flex-col items-center text-center p-6 md:p-8 ${
                  index % 2 === 0 ? "border-r border-[#e5e5e5]" : ""
                } ${
                  index < 2 ? "border-b border-[#e5e5e5]" : ""
                }`}
              >
                <service.icon className="h-8 w-8 text-[#1a1a1a] mb-4 md:h-10 md:w-10" />
                <h3 className="font-heading text-[15px] text-[#1a1a1a] mb-2 md:text-[16px]">
                  {service.title}
                </h3>
                <p className="text-[12px] text-[#666666] leading-[1.6] md:text-[13px]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
