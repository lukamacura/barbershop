import Image from "next/image";
import type { ReactNode } from "react";

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
      className="relative min-h-[90vh] w-full overflow-hidden sm:min-h-[85vh]"
      aria-label="Hero section"
    >
      <div className="absolute inset-0 bg-[var(--surface-dark)]/70 z-10" />
      <Image
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80"
        alt="Barber at work in the shop"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="relative z-20 mx-auto flex min-h-[90vh] max-w-7xl flex-col justify-between px-4 py-12 sm:min-h-[85vh] sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <div className="flex flex-1 flex-col justify-center lg:max-w-lg">
          <div className="rounded-[var(--radius-card)] bg-[var(--surface-elevated)]/95 p-6 shadow-[var(--shadow-card)] backdrop-blur border border-[var(--border-subtle)] sm:p-8">
            <h2 className="mb-4 font-serif text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              Make an appointment
            </h2>
            <p className="mb-6 text-base leading-relaxed text-[var(--foreground-muted)] sm:text-lg">
              Pick your preferred barber and time. We&apos;ll confirm your slot.
            </p>
            <button
              type="button"
              onClick={onBookClick}
              className="w-full rounded-[var(--radius-btn)] bg-[var(--accent)] py-4 text-base font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] active:scale-[0.99] sm:text-lg"
            >
              Book appointment
            </button>
          </div>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
            A place where classic barbering meets today&apos;s style. Quality cuts and a relaxed atmosphere in the heart of Novi Sad.
          </p>
        </div>
        <div className="mt-8 flex items-center lg:mt-0 lg:flex-1 lg:justify-end">
          <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Where tradition meets modern style
          </h1>
        </div>
      </div>
      {children}
    </section>
  );
}
