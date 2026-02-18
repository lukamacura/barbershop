"use client";

import { useState, useMemo } from "react";
import type { Barber, BarberAvailability, BarberAvailabilityInput } from "@/types/supabase";
import { upsertAvailability, deleteAvailability } from "@/app/admin/availability/actions";

type Props = {
  barbers: Barber[];
  initialAvailability: BarberAvailability[];
  initialBarberId: number;
  initialWeekStart: string; // YYYY-MM-DD
};

const SERBIAN_DAYS = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];

function formatSerbianDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function dateToString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeekDates(mondayStr: string): string[] {
  const monday = new Date(mondayStr + "T12:00:00");
  const dates: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(dateToString(d));
  }
  return dates;
}

export function AdminAvailabilityCalendar({ barbers, initialAvailability, initialBarberId, initialWeekStart }: Props) {
  const [selectedBarberId, setSelectedBarberId] = useState(initialBarberId);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [availability, setAvailability] = useState<Map<string, boolean>>(() => {
    const map = new Map<string, boolean>();
    initialAvailability.forEach((a) => {
      map.set(a.date, a.is_available);
    });
    return map;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekEndDate = weekDates[5];

  const handlePreviousWeek = () => {
    const monday = new Date(weekStart + "T12:00:00");
    monday.setDate(monday.getDate() - 7);
    const newWeekStart = dateToString(monday);
    setWeekStart(newWeekStart);
    fetchAvailabilityForWeek(selectedBarberId, newWeekStart);
  };

  const handleNextWeek = () => {
    const monday = new Date(weekStart + "T12:00:00");
    monday.setDate(monday.getDate() + 7);
    const newWeekStart = dateToString(monday);
    setWeekStart(newWeekStart);
    fetchAvailabilityForWeek(selectedBarberId, newWeekStart);
  };

  const handleBarberChange = (barberId: number) => {
    setSelectedBarberId(barberId);
    fetchAvailabilityForWeek(barberId, weekStart);
  };

  const fetchAvailabilityForWeek = async (barberId: number, mondayStr: string) => {
    const dates = getWeekDates(mondayStr);
    const endDate = dates[5];
    
    try {
      const response = await fetch(
        `/api/admin/availability?barberId=${barberId}&startDate=${mondayStr}&endDate=${endDate}`
      );
      const data = await response.json();
      
      if (data.ok) {
        const newMap = new Map<string, boolean>();
        data.availability.forEach((a: BarberAvailability) => {
          newMap.set(a.date, a.is_available);
        });
        setAvailability(newMap);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const toggleDay = (date: string) => {
    setAvailability((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(date) ?? true;
      newMap.set(date, !current);
      return newMap;
    });
  };

  const markAllUnavailable = () => {
    setAvailability((prev) => {
      const newMap = new Map(prev);
      weekDates.forEach((date) => {
        newMap.set(date, false);
      });
      return newMap;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Step 1: Find days that should be UNAVAILABLE (save these)
      const unavailableDays = weekDates.filter((date) => {
        const isAvailable = availability.get(date) ?? true;
        return !isAvailable; // Only include unavailable days
      });

      const unavailableRecords: BarberAvailabilityInput[] = unavailableDays.map((date) => ({
        barber_id: selectedBarberId,
        date,
        is_available: false,
        working_hours_start: "09:00:00",
        working_hours_end: "17:00:00",
      }));

      // Step 2: Find days that should be AVAILABLE (delete these records if they exist)
      const availableDays = weekDates.filter((date) => {
        const isAvailable = availability.get(date) ?? true;
        return isAvailable; // Only include available days
      });

      console.log("Unavailable days to save:", unavailableRecords);
      console.log("Available days to delete records for:", availableDays);

      // Save unavailable days
      if (unavailableRecords.length > 0) {
        const upsertResult = await upsertAvailability(unavailableRecords);
        if (!upsertResult.ok) {
          const errorMsg = upsertResult.error ? `${upsertResult.message}: ${upsertResult.error}` : upsertResult.message;
          setMessage({ text: errorMsg, type: "error" });
          setIsSaving(false);
          return;
        }
      }

      // Delete records for available days (to revert back to default available state)
      if (availableDays.length > 0) {
        const deleteResult = await deleteAvailability(selectedBarberId, availableDays);
        if (!deleteResult.ok) {
          console.warn("Failed to delete availability records:", deleteResult);
          // Don't show error to user, as the main operation succeeded
        }
      }

      setIsSaving(false);
      setMessage({ text: "Dostupnost sačuvana!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error during save:", error);
      setIsSaving(false);
      setMessage({ 
        text: `Greška: ${error instanceof Error ? error.message : "Unknown error"}`, 
        type: "error" 
      });
    }
  };

  return (
    <div className="admin-availability mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header - Premium design */}
      <header className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="font-heading text-[42px] text-white md:text-[48px] lg:text-[56px]">
            DOSTUPNOST BERBERA
          </h1>
          <span className="mt-3 block h-[3px] w-16 bg-[#D4AF37] origin-left" />
          <p className="mt-4 text-[15px] text-white/60 md:text-[16px]">
            Upravljanje radnim danima i dostupnošću
          </p>
        </div>
        <a href="/admin"
          className="flex items-center gap-2 min-h-[44px] rounded-full border-2 border-white/20 bg-transparent px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Nazad
        </a>
      </header>

      {/* Controls - Premium cards */}
      <div className="mb-10 space-y-6">
        <div className="rounded-[20px] border border-white/10 bg-white/3 backdrop-blur-sm p-6">
          <label className="mb-4 block font-heading text-[13px] uppercase tracking-widest text-[#D4AF37]">
            Izaberi berbera
          </label>
          <select
            value={selectedBarberId}
            onChange={(e) => handleBarberChange(Number(e.target.value))}
            className="w-full min-h-[48px] rounded-full border-2 border-white/20 bg-[#1a1a1a] px-5 py-3 text-sm font-medium text-white transition-all duration-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30"
          >
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/3 backdrop-blur-sm p-6">
          <button
            type="button"
            onClick={handlePreviousWeek}
            className="flex items-center gap-2 min-h-[48px] rounded-full border-2 border-white/20 bg-transparent px-5 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Prethodna
          </button>

          <span className="font-heading text-[14px] uppercase tracking-wider text-[#D4AF37]">
            {formatSerbianDate(weekStart)} - {formatSerbianDate(weekEndDate)}
          </span>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center gap-2 min-h-[48px] rounded-full border-2 border-white/20 bg-transparent px-5 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring"
          >
            Sledeća
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days Grid - Premium cards */}
      <div className="mb-10 space-y-4">
        {weekDates.map((date, index) => {
          const isAvailable = availability.get(date) ?? true;
          return (
            <div
              key={date}
              className={`rounded-[20px] border-2 p-6 backdrop-blur-sm transition-all duration-300 ${
                isAvailable
                  ? "border-[#D4AF37]/50 bg-[#D4AF37]/10"
                  : "border-white/10 bg-white/3"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-heading text-[16px] uppercase tracking-wider text-white md:text-[18px]">
                    {SERBIAN_DAYS[index]}
                  </p>
                  <p className="mt-1 text-[13px] text-white/60">
                    {formatSerbianDate(date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDay(date)}
                  className={`min-h-[48px] rounded-full px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 focus-ring ${
                    isAvailable
                      ? "bg-[#D4AF37] text-[#1a1a1a] hover:bg-[#c9a430] hover:scale-105"
                      : "border-2 border-white/20 bg-transparent text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                >
                  {isAvailable ? "Dostupan" : "Nedostupan"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions - Premium buttons */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={markAllUnavailable}
          className="flex items-center gap-2 min-h-[48px] rounded-full border-2 border-white/20 bg-transparent px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 focus-ring"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Markiraj nedostupno
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 min-h-[48px] rounded-full bg-[#D4AF37] px-8 py-2.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#1a1a1a] transition-all duration-300 hover:bg-[#c9a430] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Čuvanje...
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Sačuvaj promene
            </>
          )}
        </button>
      </div>

      {/* Message - Premium alert */}
      {message && (
        <div
          className={`mt-6 flex items-center gap-3 rounded-[20px] border-2 px-6 py-4 text-sm backdrop-blur-sm ${
            message.type === "success"
              ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]"
              : "border-red-500/50 bg-red-500/10 text-red-400"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {message.type === "success" ? (
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            ) : (
              <circle cx="12" cy="12" r="10" />
            )}
            {message.type === "success" ? (
              <polyline points="22 4 12 14.01 9 11.01" />
            ) : (
              <>
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          {message.text}
        </div>
      )}
    </div>
  );
}
