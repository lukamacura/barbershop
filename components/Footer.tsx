"use client";

export function Footer({ onBookClick }: { onBookClick?: () => void }) {
  return (
    <footer
      className="bg-[#1a1a1a] border-t border-white/5 py-8 md:py-10"
      role="contentinfo"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {/* STAY SHARP. tagline - exactly as PNG */}
        <div className="text-center">
          <p className="text-[11px] tracking-[0.3em] text-white/50 md:text-[12px]">
            STAY SHARP.
          </p>
        </div>
      </div>
    </footer>
  );
}
