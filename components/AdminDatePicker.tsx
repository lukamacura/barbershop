"use client";

import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

type Props = {
  value: string;
  onChange: (dateStr: string) => void;
  datesWithReservations?: Set<string>;
  className?: string;
};

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AdminDatePicker({ value, onChange, datesWithReservations = new Set(), className = "" }: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const [y, m] = value.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const selectedDate = new Date(value + "T12:00:00");
  const today = new Date();
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const goToToday = () => { const now = new Date(); setViewDate(new Date(now.getFullYear(), now.getMonth(), 1)); onChange(toDateStr(now)); };
  const handleDayClick = (day: number) => onChange(toDateStr(new Date(year, month, day)));

  const isToday = (day: number) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  const isSelected = (day: number) => selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

  const days: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className={`admin-date-picker rounded-[20px] border border-white/10 bg-[#1a1a1a] p-6 ${className}`}>
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="font-heading text-[16px] uppercase tracking-wider text-white/90 md:text-[18px]">{MONTHS[month]} {year}</h3>
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] hover:text-white focus-ring"
            aria-label="Previous month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] hover:text-white focus-ring"
            aria-label="Next month">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center font-heading text-[9px] uppercase tracking-widest text-white/60">{d}</div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = toDateStr(new Date(year, month, day));
          const hasReservations = datesWithReservations.has(dateStr);
          const todayClass = isToday(day);
          const selectedClass = isSelected(day);
          return (
            <button key={day} type="button" onClick={() => handleDayClick(day)}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 focus-ring
                ${selectedClass ? "bg-[#404040] text-white shadow-md scale-105"
                  : todayClass ? "border-2 border-[#525252] text-white/90 hover:bg-white/5"
                  : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              {day}
              {hasReservations && !selectedClass && (
                <span className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${todayClass ? "bg-white/70" : "bg-white/50"}`} />
              )}
            </button>
          );
        })}
      </div>

      <button type="button" onClick={goToToday}
        className="w-full min-h-[44px] rounded-full border-2 border-white/20 bg-transparent py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white/80 transition-all duration-300 hover:border-[#525252] hover:bg-[#404040] hover:text-white focus-ring">
        Danas
      </button>
    </div>
  );
}
