"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Gallery images - 6 images matching PNG layout
const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop",
    alt: "Stilsko šišanje",
  },
  {
    src: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop",
    alt: "Oblikovanje brade",
  },
  {
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop",
    alt: "Klasičan rez",
  },
  {
    src: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop",
    alt: "Fade šišanje",
  },
  {
    src: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop",
    alt: "Precizno brijanje",
  },
  {
    src: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop",
    alt: "Barbershop atmosfera",
  },
];

export function Gallery() {
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
      id="galerija"
      className="bg-[#1a1a1a] py-16 md:py-20"
      aria-labelledby="gallery-heading"
    >
      {/* Heading - spans full width, overlaid style */}
      <div 
        className={`text-center mb-8 md:mb-10 px-5 transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2
          id="gallery-heading"
          className="font-heading text-[24px] text-white/80 leading-[1.3] sm:text-[28px] md:text-[36px] lg:text-[44px]"
        >
          LET YOUR HAIRSTYLE<br />
          DO THE TALKING
        </h2>
      </div>
      
      {/* Image grid - 3 columns on desktop, 2 on mobile */}
      <div 
        className={`grid grid-cols-2 sm:grid-cols-3 gap-1 transition-all duration-700 delay-150 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {galleryImages.map((image, index) => (
          <div
            key={image.src}
            className="relative aspect-square overflow-hidden group"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
              loading="lazy"
            />
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
}
