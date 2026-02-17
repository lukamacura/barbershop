"use client";

import type { ReactNode } from "react";
import Image from "next/image";

export function Hero({
  onBookClick,
  children,
}: {
  onBookClick: () => void;
  children?: ReactNode;
}) {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full overflow-hidden bg-black"
      aria-label="Hero section"
    >
      {/* Video Background with monochrome filter */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover grayscale"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      
      {/* Dark overlay for contrast - more intense */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content - centered vertically and horizontally */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        
        {/* Logo Image - responsive sizing (15% smaller) */}
        <div className="relative w-[680px] h-[213px] sm:w-[850px] sm:h-[264px] md:w-[1020px] md:h-[315px] lg:w-[1275px] lg:h-[391px] max-w-[90vw]">
          <Image
            src="/logobarber.png"
            alt="BARBERSHOP EST. 2020"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 90vw, (max-width: 1024px) 90vw, 1275px"
          />
        </div>
        
        {/* CTA Button - white bg default, gold on hover */}
        <button
          type="button"
          onClick={onBookClick}
          className="mt-6 cursor-pointer md:mt-8 font-bold rounded-md px-8 py-4 bg-white border border-white text-[#1a1a1a] text-[11px] tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#D4AF37] hover:border-[#D4AF37]"
        >
          ZAKAŽI TERMIN
        </button>
      </div>
      
      {children}
    </section>
  );
}
