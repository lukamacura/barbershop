"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Scissors icon for divider
function ScissorsIcon({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export function Barbers() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="tim"
      className="bg-[#1a1a1a] py-20 md:py-28 lg:py-32"
      aria-labelledby="team-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          
          {/* Left - Image with arch top (rounded-t-full) */}
          <div 
            className={`transition-all duration-700 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[50%] mx-auto max-w-[380px] lg:max-w-none">
              <Image
                src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=800&fit=crop"
                alt="Profesionalni berber na poslu"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
          
          {/* Right - Text content */}
          <div 
            className={`text-center lg:text-left transition-all duration-700 delay-150 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {/* Scissors divider */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
              <span className="h-[1px] w-10 bg-white/60" />
              <ScissorsIcon className="h-4 w-4 text-white/60" />
              <span className="h-[1px] w-10 bg-white/60" />
            </div>
            
            {/* Heading */}
            <h2
              id="team-heading"
              className="font-heading text-[42px] text-white md:text-[48px]"
            >
              NAŠ TIM
            </h2>
            
            {/* Subheading - italic style */}
            <p className="mt-5 text-[16px] font-medium italic text-white/90 md:text-[18px]">
              Mladi tim, sveža energija i preciznost u svakom potezu.
            </p>
            
            {/* Body text */}
            <p className="mt-4 text-[14px] leading-[1.8] text-white/70 md:text-[15px]">
              Kombinujemo znanje, ambiciju i savremene trendove, stvarajući balans tradicije i modernog stila. Svakom klijentu pristupamo individualno, sa fokusom na detalje, stil i vrhunski rezultat.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
