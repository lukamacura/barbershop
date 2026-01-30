const iconClass = "h-5 w-5 text-white";

function LocationIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function Location() {
  return (
    <section
      id="visit"
      className="bg-[var(--surface-dark)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <h2
            id="location-heading"
            className="mb-4 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            Visit us
          </h2>
          <p className="mb-8 max-w-lg text-base leading-relaxed text-white/90">
            We&apos;re in the center of Novi Sad. Walk-ins welcome when we have free slots—otherwise book ahead to secure your spot.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 py-3.5 text-base font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)]"
          >
            Get directions
            <span aria-hidden>→</span>
          </a>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
              aria-hidden
            >
              <LocationIcon />
            </span>
            <div>
              <h3 className="font-serif text-sm font-semibold tracking-tight text-white">
                Address
              </h3>
              <p className="mt-1 text-base text-white/90">
                Example Street 1<br />
                21000 Novi Sad
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white"
              aria-hidden
            >
              <ClockIcon />
            </span>
            <div>
              <h3 className="font-serif text-sm font-semibold tracking-tight text-white">
                Hours & contact
              </h3>
              <p className="mt-1 text-base text-white/90">
                Mon–Fri 9:00–20:00<br />
                Sat 9:00–16:00
              </p>
              <a
                href="tel:+381123456789"
                className="mt-2 inline-block text-[var(--accent)] underline focus-ring rounded"
              >
                +381 12 345 6789
              </a>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div
            className="rounded-[var(--radius-card)] bg-[var(--surface-mid)] border border-[var(--border-subtle)] h-64 w-full overflow-hidden lg:h-80"
            aria-hidden
          >
            <div className="flex h-full w-full items-center justify-center text-[var(--foreground-muted)]">
              Map placeholder
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
