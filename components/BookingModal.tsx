"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BARBERS = [
  {
    id: 1,
    name: "Radža",
    role: "Frizer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
  },
  {
    id: 2,
    name: "Luka",
    role: "Frizer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
  },
];

function getTodayPlusNextFiveWorkingDays(): { id: string; label: string; date: Date; isToday: boolean }[] {
  const days: { id: string; label: string; date: Date; isToday: boolean }[] = [];
  const dayNames = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
  const d = new Date();
  let count = 0;
  let isFirstDay = true;
  
  while (count < 6) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      days.push({
        id: `${y}-${m}-${day}`,
        label: dayNames[dayOfWeek],
        date: new Date(d),
        isToday: isFirstDay,
      });
      count++;
      isFirstDay = false;
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  const endTotalMin = endHour * 60 + endMin;
  
  while (currentHour * 60 + currentMin < endTotalMin) {
    slots.push(`${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`);
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour++;
    }
  }
  
  return slots;
}

function formatDayDate(d: Date): string {
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

type Service = {
  id: number;
  service_name: string;
  price_rsd: number;
  duration_minutes: number;
  active: boolean;
};

type Step = 1 | 2 | 3 | 4 | 5;
type DayOption = { id: string; label: string; date: Date; freeSlots: number; isToday?: boolean };
type ContactForm = { name: string; surname: string; mobile: string; email: string };

type AvailabilityRecord = {
  date: string;
  is_available: boolean;
  working_hours_start: string;
  working_hours_end: string;
};

type ReservationSlot = { start_time: string; end_time: string };

const initialContactForm: ContactForm = { name: "", surname: "", mobile: "", email: "" };

export function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedBarber, setSelectedBarber] = useState<(typeof BARBERS)[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOption | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(initialContactForm);
  const [reveal, setReveal] = useState(false);
  
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const [availabilityData, setAvailabilityData] = useState<{
    availability: AvailabilityRecord[];
    reservations: ReservationSlot[];
  } | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  
  const allWorkingDays = useMemo(() => getTodayPlusNextFiveWorkingDays(), []);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const availableDates = useMemo(() => {
    if (!selectedBarber || !availabilityData) return [];

    const filtered: DayOption[] = [];
    const now = new Date();
    const minBookableTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    for (const day of allWorkingDays) {
      const dateStr = day.id;
      const isToday = day.isToday;

      const availRecord = availabilityData.availability.find((a) => a.date === dateStr);
      if (availRecord && !availRecord.is_available) {
        continue;
      }

      const workingStart = availRecord?.working_hours_start || "10:00:00";
      const workingEnd = availRecord?.working_hours_end || "19:00:00";
      const allSlots = generateTimeSlots(workingStart.slice(0, 5), workingEnd.slice(0, 5));

      const dayReservations = availabilityData.reservations.filter((res) => {
        const resDate = new Date(res.start_time).toISOString().slice(0, 10);
        return resDate === dateStr;
      });

      const freeSlots = allSlots.filter((slotTime) => {
        const [hours, minutes] = slotTime.split(":").map(Number);
        const slotStart = new Date(day.date);
        slotStart.setHours(hours, minutes, 0, 0);

        if (isToday && slotStart < minBookableTime) {
          return false;
        }

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        const slotStartMs = slotStart.getTime();
        const slotEndMs = slotEnd.getTime();

        return !dayReservations.some((r) => {
          const resStart = new Date(r.start_time).getTime();
          const resEnd = new Date(r.end_time).getTime();
          return resStart < slotEndMs && resEnd > slotStartMs;
        });
      });

      if (freeSlots.length > 0) {
        filtered.push({ ...day, freeSlots: freeSlots.length, isToday });
      }
    }

    return filtered;
  }, [selectedBarber, availabilityData, allWorkingDays]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDay || !availabilityData) return [];

    const dateStr = selectedDay.id;
    const isToday = selectedDay.isToday;
    const now = new Date();
    const minBookableTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const availRecord = availabilityData.availability.find((a) => a.date === dateStr);
    const workingStart = availRecord?.working_hours_start || "10:00:00";
    const workingEnd = availRecord?.working_hours_end || "19:00:00";

    const allSlots = generateTimeSlots(workingStart.slice(0, 5), workingEnd.slice(0, 5));

    const dayReservations = availabilityData.reservations.filter((res) => {
      const resDate = new Date(res.start_time).toISOString().slice(0, 10);
      return resDate === dateStr;
    });

    return allSlots.filter((slotTime) => {
      const [hours, minutes] = slotTime.split(":").map(Number);
      const slotStart = new Date(selectedDay.date);
      slotStart.setHours(hours, minutes, 0, 0);

      if (isToday && slotStart < minBookableTime) {
        return false;
      }

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      const slotStartMs = slotStart.getTime();
      const slotEndMs = slotEnd.getTime();

      return !dayReservations.some((r) => {
        const resStart = new Date(r.start_time).getTime();
        const resEnd = new Date(r.end_time).getTime();
        return resStart < slotEndMs && resEnd > slotStartMs;
      });
    });
  }, [selectedDay, availabilityData]);

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
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [getFocusableElements]);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;
    const focusable = getFocusableElements();
    if (focusable.length > 0) (focusable[0] as HTMLElement).focus();
    const cleanup = trapFocus();
    return () => { cleanup?.(); previousActiveRef.current?.focus(); };
  }, [open, step, trapFocus, getFocusableElements]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => { document.removeEventListener("keydown", handleEscape); document.body.style.overflow = ""; };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setReveal(false);
      const t = requestAnimationFrame(() => { requestAnimationFrame(() => setReveal(true)); });
      return () => cancelAnimationFrame(t);
    } else { setReveal(false); }
  }, [open]);

  useEffect(() => { if (open && services.length === 0) fetchServices(); }, [open, services.length]);

  const fetchServices = async () => {
    setServicesLoading(true);
    setServicesError(null);
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.message || "Failed to load services");
      setServices(data.services || []);
    } catch (error) {
      setServicesError(error instanceof Error ? error.message : "Failed to load services");
    } finally { setServicesLoading(false); }
  };

  const handleOverlayClick = (e: React.MouseEvent) => { if (e.target === overlayRef.current) onClose(); };

  const resetAndClose = () => {
    setStep(1);
    setSelectedBarber(null);
    setSelectedDay(null);
    setSelectedTime(null);
    setSelectedService(null);
    setContactForm(initialContactForm);
    setBookingError(null);
    setReservationId(null);
    setAvailabilityData(null);
    onClose();
  };

  const handleConfirmBooking = async () => {
    if (!selectedBarber || !selectedDay || !selectedTime || !selectedService || !isContactValid) return;
    setBookingLoading(true); setBookingError(null);
    try {
      const dateStr = `${selectedDay.id}T${selectedTime}:00`;
      const startDateTime = new Date(dateStr);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + selectedService.duration_minutes);
      
      const email = contactForm.email?.trim();
      const payload = {
        barberId: Number(selectedBarber.id), serviceId: Number(selectedService.id),
        customerName: `${contactForm.name.trim()} ${contactForm.surname.trim()}`.trim(),
        customerPhone: contactForm.mobile.trim(), ...(email ? { customerEmail: email } : {}),
        startTime: startDateTime.toISOString(), endTime: endDateTime.toISOString(),
        bookingDate: selectedDay.id,
        bookingTime: selectedTime,
      };
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        const detail = data.errors?.map((e: { field: string; message: string }) => `${e.field}: ${e.message}`).join("; ");
        throw new Error(detail || data.message || "Failed to create reservation");
      }
      setReservationId(data.reservationId); setStep(5);
    } catch (error) { setBookingError(error instanceof Error ? error.message : "Failed to create reservation"); }
    finally { setBookingLoading(false); }
  };

  const updateContact = (field: keyof ContactForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isContactValid = contactForm.name.trim() !== "" && contactForm.surname.trim() !== "" &&
    contactForm.mobile.trim() !== "" && contactForm.email.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email.trim());

  const handleDaySelect = (day: DayOption) => {
    setSelectedDay(day);
    setSelectedTime(null);
  };

  useEffect(() => {
    if (!selectedBarber || !open) {
      setAvailabilityData(null);
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);

    const startDate = allWorkingDays[0]?.id;
    const endDate = allWorkingDays[allWorkingDays.length - 1]?.id;

    if (!startDate || !endDate) {
      setAvailabilityLoading(false);
      return;
    }

    fetch(`/api/booking-availability?barberId=${selectedBarber.id}&startDate=${startDate}&endDate=${endDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.ok) return;
        setAvailabilityData({
          availability: data.availability ?? [],
          reservations: data.reservations ?? [],
        });
      })
      .catch((error) => {
        console.error("Error fetching availability:", error);
        if (!cancelled) {
          setAvailabilityData({ availability: [], reservations: [] });
        }
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedBarber, open, allWorkingDays]);


  if (!open) return null;

  const stepLabels = ["BERBER", "TERMIN", "USLUGA", "PODACI"];

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay-enter fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 ${reveal ? "modal-overlay-visible" : ""}`}
      onClick={handleOverlayClick}
      role="dialog" aria-modal="true" aria-labelledby="booking-modal-title"
    >
      <div
        ref={modalRef}
        className={`modal-content-enter flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden bg-[#1a1a1a] shadow-2xl shadow-black/50 ring-1 ring-white/10 ${reveal ? "modal-content-visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <h2 id="booking-modal-title" className="font-heading text-[22px] text-white">
            ZAKAŽI TERMIN
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-8 w-8 items-center justify-center text-white/40 transition-colors hover:text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2"
            aria-label="Zatvori"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Step Indicator */}
          {step < 5 && (
            <div className="mb-7">
              <div className="flex gap-1">
                {([1, 2, 3, 4] as const).map((s) => (
                  <div key={s} className="flex-1">
                    <div className={`h-[2px] w-full transition-all duration-500 ${step >= s ? "bg-[#D4AF37]" : "bg-white/10"}`} />
                    <span className={`mt-1.5 block text-center text-[9px] transition-colors ${step >= s ? "text-[#D4AF37]" : "text-white/25"}`}>
                      {stepLabels[s - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Barber Selection */}
          {step === 1 && (
            <div>
              <h3 className="font-heading mb-5 text-[16px] text-white/70">IZABERITE BERBERA</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {BARBERS.map((barber) => (
                  <li key={barber.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedBarber(barber)}
                      className={`group flex w-full flex-col items-center p-5 text-center transition-all duration-300 border focus:outline-none focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2 ${
                        selectedBarber?.id === barber.id
                          ? "border-[#D4AF37] bg-[#D4AF37]/10"
                          : "border-white/10 hover:border-white/25 hover:bg-white/3"
                      }`}
                    >
                      <div className={`relative mb-3 h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 transition-all duration-300 ${
                        selectedBarber?.id === barber.id ? "ring-[#D4AF37]" : "ring-white/15 group-hover:ring-white/30"
                      }`}>
                        <Image src={barber.image} alt="" fill className="object-cover" sizes="64px" />
                      </div>
                      <span className="block text-[13px] font-semibold tracking-wide text-white">{barber.name}</span>
                      <span className="mt-0.5 block text-[11px] tracking-wide text-white/40">{barber.role}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 2: Day & Time Selection */}
          {step === 2 && (
            <div>
              <h3 className="font-heading mb-4 text-[16px] text-white/70">IZABERITE DAN</h3>

              {availabilityLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                  <span className="ml-3 text-[12px] tracking-wide text-white/40">Učitavanje...</span>
                </div>
              ) : availableDates.length === 0 ? (
                <div className="mb-4 border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-[12px] text-red-400">Nema slobodnih termina u narednih 6 dana.</p>
                </div>
              ) : (
                <ul className="mb-7 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {availableDates.map((day) => (
                    <li key={day.id} className="relative">
                      <button
                        type="button"
                        onClick={() => handleDaySelect(day)}
                        className={`w-full border px-2 py-3 text-center text-[11px] font-medium transition-all duration-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2 ${
                          selectedDay?.id === day.id
                            ? "border-[#D4AF37] bg-[#D4AF37] text-[#1a1a1a]"
                            : "border-white/10 text-white/80 hover:border-white/25 hover:bg-white/3"
                        }`}
                      >
                        {day.isToday && (
                          <span className="absolute -top-2 -right-1 bg-[#D4AF37] px-1.5 py-0.5 text-[7px] font-bold tracking-wider text-[#1a1a1a]">
                            DANAS
                          </span>
                        )}
                        <span className="block">{day.label}</span>
                        <span className={`block text-[10px] mt-0.5 ${selectedDay?.id === day.id ? "text-[#1a1a1a]/60" : "text-white/35"}`}>
                          {formatDayDate(day.date)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {selectedDay && availableTimeSlots.length > 0 && (
                <>
                  <h3 className="font-heading mb-4 text-[16px] text-white/70">IZABERITE VREME</h3>
                  <ul className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {availableTimeSlots.map((time) => (
                      <li key={time}>
                        <button
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`w-full border py-2.5 text-[12px] font-medium transition-all duration-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2 ${
                            selectedTime === time
                              ? "border-[#D4AF37] bg-[#D4AF37] text-[#1a1a1a]"
                              : "border-white/10 text-white/80 hover:border-white/25 hover:bg-white/3"
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

          {/* Step 3: Service Selection */}
          {step === 3 && (
            <div>
              <h3 className="font-heading mb-5 text-[16px] text-white/70">IZABERITE USLUGU</h3>
              {servicesLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent" />
                </div>
              )}
              {servicesError && (
                <div className="border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-[12px] text-red-400 mb-3">{servicesError}</p>
                  <button type="button" onClick={fetchServices} className="text-[11px] tracking-wide text-red-400 underline underline-offset-2 hover:text-red-300">
                    Pokušaj ponovo
                  </button>
                </div>
              )}
              {!servicesLoading && !servicesError && services.length > 0 && (
                <ul className="space-y-2">
                  {services.map((service) => (
                    <li key={service.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`flex w-full items-center justify-between border p-4 text-left transition-all duration-300 focus:outline-none focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2 ${
                          selectedService?.id === service.id
                            ? "border-[#D4AF37] bg-[#D4AF37]/10"
                            : "border-white/10 hover:border-white/25 hover:bg-white/3"
                        }`}
                      >
                        <span>
                          <span className="block text-[13px] font-medium text-white">{service.service_name}</span>
                          <span className="text-[11px] text-white/40">{service.duration_minutes} min</span>
                        </span>
                        <span className={`text-[14px] font-semibold ${selectedService?.id === service.id ? "text-[#D4AF37]" : "text-white/70"}`}>
                          {service.price_rsd} RSD
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Step 4: Confirmation & Contact */}
          {step === 4 && (
            <div>
              <h3 className="font-heading mb-5 text-[16px] text-white/70">POTVRDITE REZERVACIJU</h3>

              {/* Summary Card */}
              <div className="mb-6 border border-white/10 bg-white/3 p-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Berber</span>
                    <span className="font-medium text-white">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Dan</span>
                    <span className="font-medium text-white">{selectedDay ? `${selectedDay.label}, ${formatDayDate(selectedDay.date)}` : ""}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Vreme</span>
                    <span className="font-medium text-white">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Usluga</span>
                    <span className="font-medium text-white">{selectedService?.service_name}</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-[11px] tracking-widest text-white/40">UKUPNO</span>
                  <span className="text-[18px] font-bold text-[#D4AF37]">{selectedService?.price_rsd ?? 0} RSD</span>
                </div>
              </div>

              <h4 className="font-heading mb-4 text-[15px] text-white/70">VAŠI PODACI</h4>
              <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
                <label>
                  <span className="mb-1.5 block text-[11px] tracking-wide text-white/40">Ime</span>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={updateContact("name")}
                    placeholder="Ime"
                    className="w-full border border-white/10 bg-white/3 px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-[11px] tracking-wide text-white/40">Prezime</span>
                  <input
                    type="text"
                    value={contactForm.surname}
                    onChange={updateContact("surname")}
                    placeholder="Prezime"
                    className="w-full border border-white/10 bg-white/3 px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-[11px] tracking-wide text-white/40">Telefon</span>
                  <input
                    type="tel"
                    value={contactForm.mobile}
                    onChange={updateContact("mobile")}
                    placeholder="+381..."
                    className="w-full border border-white/10 bg-white/3 px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-[11px] tracking-wide text-white/40">Email</span>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={updateContact("email")}
                    placeholder="email@example.com"
                    className="w-full border border-white/10 bg-white/3 px-3 py-2.5 text-[13px] text-white placeholder:text-white/20 transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </label>
              </form>
              {bookingError && (
                <div className="mt-4 border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-[12px] text-red-400">{bookingError}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/30">
                  <svg className="h-7 w-7 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="font-heading mb-2 text-[24px] text-white">POTVRĐENO</h3>
              <p className="mb-6 text-[13px] text-white/40">Vidimo se uskoro.</p>
              <div className="mx-auto max-w-xs border border-white/10 bg-white/3 p-5 text-left">
                <p className="text-[10px] tracking-wide text-white/20 mb-3">ID: {reservationId}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Berber</span>
                    <span className="text-white">{selectedBarber?.name}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Kada</span>
                    <span className="text-white">{selectedDay ? `${selectedDay.label}, ${formatDayDate(selectedDay.date)} u ${selectedTime}` : ""}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">Usluga</span>
                    <span className="text-white">{selectedService?.service_name}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between text-[12px]">
                    <span className="text-white/40">Cena</span>
                    <span className="font-semibold text-[#D4AF37]">{selectedService?.price_rsd} RSD</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 border-t border-white/10 px-6 py-4">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as Step)}
              disabled={bookingLoading}
              className="px-5 py-2.5 text-[11px] font-medium tracking-widest text-white/50 border border-white/15 transition-all duration-300 hover:border-white/40 hover:text-white focus:outline-none focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2"
            >
              NAZAD
            </button>
          ) : <span />}
          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if ((step === 1 && selectedBarber) || (step === 2 && selectedDay && selectedTime) || (step === 3 && selectedService))
                  setStep((s) => (s + 1) as Step);
              }}
              disabled={(step === 1 && !selectedBarber) || (step === 2 && (!selectedDay || !selectedTime)) || (step === 3 && !selectedService)}
              className="px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] bg-[#D4AF37] text-[#1a1a1a] transition-all duration-300 hover:bg-[#c9a430] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              DALJE
            </button>
          ) : step === 4 ? (
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={!isContactValid || bookingLoading}
              className="px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] bg-[#D4AF37] text-[#1a1a1a] transition-all duration-300 hover:bg-[#c9a430] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {bookingLoading ? "REZERVIŠEM..." : "POTVRDI"}
            </button>
          ) : (
            <button
              type="button"
              onClick={resetAndClose}
              className="px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] bg-[#D4AF37] text-[#1a1a1a] transition-all duration-300 hover:bg-[#c9a430] focus:outline-none focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              ZATVORI
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
