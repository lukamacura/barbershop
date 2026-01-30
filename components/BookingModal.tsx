"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BARBERS = [
  {
    id: "barber-1",
    name: "Marko",
    role: "Master Barber",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: "barber-2",
    name: "Stefan",
    role: "Senior Barber",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
  },
  {
    id: "barber-3",
    name: "Nikola",
    role: "Barber",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
  },
];

/** Next 5 weekdays from today (Mon–Fri) */
function getNextFiveWeekdays(): { id: string; label: string; date: Date }[] {
  const days: { id: string; label: string; date: Date }[] = [];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let d = new Date();
  let count = 0;
  while (count < 5) {
    d.setDate(d.getDate() + 1);
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      days.push({
        id: d.toISOString().slice(0, 10),
        label: dayNames[dayOfWeek],
        date: new Date(d),
      });
      count++;
    }
  }
  return days;
}

function formatDayDate(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const SERVICES = [
  { id: "haircut", name: "Haircut", price: 40, duration: "30 min" },
  { id: "shave", name: "Shave", price: 35, duration: "25 min" },
  { id: "haircut-shave", name: "Haircut + Shave", price: 70, duration: "55 min" },
  { id: "beard", name: "Beard trim", price: 15, duration: "15 min" },
];

type Step = 1 | 2 | 3 | 4;

type DayOption = { id: string; label: string; date: Date };

type ContactForm = {
  name: string;
  surname: string;
  mobile: string;
  email: string;
};

const initialContactForm: ContactForm = {
  name: "",
  surname: "",
  mobile: "",
  email: "",
};

export function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedBarber, setSelectedBarber] = useState<(typeof BARBERS)[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOption | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<(typeof SERVICES)[0] | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(initialContactForm);
  const [reveal, setReveal] = useState(false);
  const weekDays = useMemo(() => getNextFiveWeekdays(), [open]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const focusableSelector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = useCallback(() => {
    const el = modalRef.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>(focusableSelector));
  }, []);

  const trapFocus = useCallback(() => {
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [getFocusableElements]);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      (focusable[0] as HTMLElement).focus();
    }
    const cleanup = trapFocus();
    return () => {
      cleanup?.();
      previousActiveRef.current?.focus();
    };
  }, [open, step, trapFocus, getFocusableElements]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setReveal(false);
      const t = requestAnimationFrame(() => {
        requestAnimationFrame(() => setReveal(true));
      });
      return () => cancelAnimationFrame(t);
    } else {
      setReveal(false);
    }
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setSelectedBarber(null);
    setSelectedDay(null);
    setSelectedTime(null);
    setSelectedService(null);
    setContactForm(initialContactForm);
    onClose();
  };

  const updateContact = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isContactValid =
    contactForm.name.trim() !== "" &&
    contactForm.surname.trim() !== "" &&
    contactForm.mobile.trim() !== "" &&
    contactForm.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim());

  const handleDaySelect = (day: DayOption) => {
    setSelectedDay(day);
    setSelectedTime(null);
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay-enter fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 ${reveal ? "modal-overlay-visible" : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        ref={modalRef}
        className={`modal-content-enter flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-card)] bg-[var(--surface-elevated)] border border-[var(--border-muted)] shadow-xl ${reveal ? "modal-content-visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
          <h2 id="booking-modal-title" className="text-lg font-bold text-[var(--foreground)]">
            Book appointment
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground-muted)] transition-default focus-ring hover:bg-[var(--surface-mid)] hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Step indicator */}
          <div className="mb-6 flex gap-2">
            {([1, 2, 3, 4] as const).map((s) => (
              <span
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${step >= s ? "bg-[var(--accent)]" : "bg-[var(--surface-beige)]"}`}
                aria-hidden
              />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 className="mb-4 font-semibold text-[var(--foreground)]">
                Choose your barber
              </h3>
              <ul className="grid gap-3 sm:grid-cols-3">
                {BARBERS.map((barber) => (
                  <li key={barber.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedBarber(barber)}
                      className={`flex w-full flex-col items-center rounded-[var(--radius-card)] border-2 p-4 text-center transition-default focus-ring ${
                        selectedBarber?.id === barber.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/15"
                          : "border-[var(--border-muted)] hover:border-[var(--foreground-muted)]"
                      }`}
                    >
                      <span className="block font-semibold text-[var(--foreground)]">
                        {barber.name}
                      </span>
                      <div className="relative my-2 h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[var(--border-muted)] bg-[var(--surface-mid)]">
                        <Image
                          src={barber.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <span className="block text-sm text-[var(--foreground-muted)]">{barber.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="mb-3 font-semibold text-[var(--foreground)]">
                Pick a day
              </h3>
              <p className="mb-3 text-sm text-[var(--foreground-muted)]">
                Choose one of the next 5 weekdays
              </p>
              <ul className="mb-6 grid grid-cols-5 gap-2">
                {weekDays.map((day) => (
                  <li key={day.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleDaySelect(day)}
                      className={`w-full min-w-0 rounded-[var(--radius-btn)] border-2 px-2 py-2.5 text-center text-xs font-medium transition-default focus-ring sm:px-3 sm:text-sm ${
                        selectedDay?.id === day.id
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border-muted)] text-[var(--foreground)] hover:border-[var(--foreground-muted)]"
                      }`}
                    >
                      <span className="block">{day.label}</span>
                      <span className="mt-0.5 block text-[10px] font-normal opacity-90 sm:text-xs">
                        {formatDayDate(day.date)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              {selectedDay && (
                <>
                  <h3 className="mb-3 font-semibold text-[var(--foreground)]">
                    Pick a time
                  </h3>
                  <p className="mb-3 text-sm text-[var(--foreground-muted)]">
                    Available slots for {selectedDay.label}, {formatDayDate(selectedDay.date)}
                  </p>
                  <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {TIME_SLOTS.map((time) => (
                      <li key={time} className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`flex h-11 w-full min-w-0 items-center justify-center rounded-[var(--radius-btn)] border-2 py-2.5 text-sm font-medium transition-default focus-ring ${
                            selectedTime === time
                              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                              : "border-[var(--border-muted)] text-[var(--foreground)] hover:border-[var(--foreground-muted)]"
                          }`}
                        >
                          {time}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="mb-4 font-semibold text-[var(--foreground)]">
                Select service
              </h3>
              <ul className="space-y-2">
                {SERVICES.map((service) => (
                  <li key={service.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedService(service)}
                      className={`flex w-full items-center justify-between rounded-[var(--radius-card)] border-2 p-4 text-left transition-default focus-ring ${
                        selectedService?.id === service.id
                          ? "border-[var(--accent)] bg-[var(--accent)]/15"
                          : "border-[var(--border-muted)] hover:border-[var(--foreground-muted)]"
                      }`}
                    >
                      <span>
                        <span className="block font-medium text-[var(--foreground)]">
                          {service.name}
                        </span>
                        <span className="text-sm text-[var(--foreground-muted)]">{service.duration}</span>
                      </span>
                      <span className="font-bold text-[var(--accent)]">
                        €{service.price}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="mb-4 font-semibold text-[var(--foreground)]">
                Confirm booking
              </h3>
              <div className="rounded-[var(--radius-card)] bg-[var(--surface-mid)] border border-[var(--border-subtle)] p-4">
                <p className="text-sm text-[var(--foreground-muted)]">
                  <strong className="text-[var(--foreground)]">Barber:</strong>{" "}
                  {selectedBarber?.name}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  <strong className="text-[var(--foreground)]">Day:</strong>{" "}
                  {selectedDay
                    ? `${selectedDay.label}, ${formatDayDate(selectedDay.date)}`
                    : ""}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  <strong className="text-[var(--foreground)]">Time:</strong>{" "}
                  {selectedTime}
                </p>
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  <strong className="text-[var(--foreground)]">Service:</strong>{" "}
                  {selectedService?.name} — €{selectedService?.price}
                </p>
                <p className="mt-4 text-lg font-bold text-[var(--foreground)]">
                  Total: €{selectedService?.price ?? 0}
                </p>
              </div>

              <h4 className="mt-6 mb-3 font-medium text-[var(--foreground)]">
                Your details
              </h4>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                <label className="sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium text-[var(--foreground-muted)]">
                    Name
                  </span>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={updateContact("name")}
                    placeholder="Your first name"
                    className="w-full rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-default focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    autoComplete="given-name"
                  />
                </label>
                <label className="sm:col-span-1">
                  <span className="mb-1 block text-sm font-medium text-[var(--foreground-muted)]">
                    Surname
                  </span>
                  <input
                    type="text"
                    value={contactForm.surname}
                    onChange={updateContact("surname")}
                    placeholder="Your surname"
                    className="w-full rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-default focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    autoComplete="family-name"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-[var(--foreground-muted)]">
                    Mobile number
                  </span>
                  <input
                    type="tel"
                    value={contactForm.mobile}
                    onChange={updateContact("mobile")}
                    placeholder="e.g. +381 60 123 4567"
                    className="w-full rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-default focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    autoComplete="tel"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-sm font-medium text-[var(--foreground-muted)]">
                    Email
                  </span>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={updateContact("email")}
                    placeholder="your@email.com"
                    className="w-full rounded-[var(--radius-btn)] border border-[var(--border-muted)] bg-[var(--surface-mid)] px-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-default focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                    autoComplete="email"
                  />
                </label>
              </form>

              <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                This is a demo. No booking is sent. Fill in your details and click &quot;Confirm&quot; to close.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="rounded-[var(--radius-btn)] border-2 border-[var(--border-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition-default focus-ring hover:border-[var(--foreground-muted)]"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (
                  (step === 1 && selectedBarber) ||
                  (step === 2 && selectedDay && selectedTime) ||
                  (step === 3 && selectedService)
                ) {
                  setStep((s) => (s + 1) as Step);
                }
              }}
              disabled={
                (step === 1 && !selectedBarber) ||
                (step === 2 && (!selectedDay || !selectedTime)) ||
                (step === 3 && !selectedService)
              }
              className="rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={resetAndClose}
              disabled={!isContactValid}
              className="rounded-[var(--radius-btn)] bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition-default focus-ring hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
