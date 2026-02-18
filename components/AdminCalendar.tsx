"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminDatePicker } from "@/components/AdminDatePicker";

const HOUR_START = 9;
const HOUR_END = 20;
const SLOT_MINUTES = 30;

type Barber = { id: number; name: string };
type Service = { id: number; service_name: string; price_rsd: number };
type Reservation = {
  id: number;
  barber_id: number;
  service_id: number | null;
  service_ids: number[] | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  start_time: string;
  end_time: string;
};

type Props = {
  barbers: Barber[];
  services: Service[];
  reservations: Reservation[];
  dateStr: string;
  barberFilter: string;
  fetchError: string | null;
};

function getLocalTimeString(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function timeSlots(): string[] {
  const slots: string[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

function pixelPerMinute(): number { return 2.2; }
function dayColumnHeightPx(): number { return (HOUR_END - HOUR_START) * 60 * pixelPerMinute(); }

export function AdminCalendar({ barbers, services, reservations, dateStr, barberFilter, fetchError }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const SLOT_DURATION = 30;
  const [selectedReservation, setSelectedReservation] = useState<{
    r: Reservation;
    services: Service[];
    totalPriceRsd: number;
    barber?: Barber;
  } | null>(null);

  const date = new Date(dateStr + "T12:00:00");
  const dayLabel = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  const updateParams = (updates: { date?: string; barber?: string }) => {
    const p = new URLSearchParams(searchParams.toString());
    if (updates.date !== undefined) p.set("date", updates.date);
    if (updates.barber !== undefined) p.set("barber", updates.barber);
    router.push(`/admin?${p.toString()}`);
  };

  const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const prevDay = () => { const d = new Date(date); d.setDate(d.getDate() - 1); updateParams({ date: toDateStr(d) }); };
  const nextDay = () => { const d = new Date(date); d.setDate(d.getDate() + 1); updateParams({ date: toDateStr(d) }); };

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));
  const displayBarbers = barberFilter === "all" || !barberFilter ? barbers : barbers.filter((b) => String(b.id) === barberFilter);
  const columns = displayBarbers.length || 1;
  const slots = timeSlots();
  const dayStartMinutes = HOUR_START * 60;
  const pxPerMin = pixelPerMinute();

  const getBlockStyle = (r: Reservation) => {
    const startDate = new Date(r.start_time);
    const endDate = new Date(r.end_time);
    const startM = startDate.getHours() * 60 + startDate.getMinutes() - dayStartMinutes;
    const durationM = (endDate.getTime() - startDate.getTime()) / 60000;
    return { top: `${startM * pxPerMin}px`, height: `${Math.max(durationM * pxPerMin, 28)}px` };
  };

  const handleLogout = async () => { await fetch("/api/admin/auth", { method: "DELETE" }); router.push("/admin/login"); router.refresh(); };
  const datesWithReservations = new Set(reservations.length > 0 ? [dateStr] : []);

  return (
    <div className="admin-dashboard mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header - Premium design matching landing page */}
      <header className="mb-12 flex flex-wrap items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="font-heading text-[42px] text-white md:text-[48px] lg:text-[56px]">ADMIN PANEL</h1>
          <span className="mt-3 block h-[3px] w-16 bg-[#D4AF37] origin-left" />
          <p className="mt-4 text-[15px] text-white/60 md:text-[16px]">Upravljanje rezervacijama i rasporedom</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/admin/availability"
            className="flex items-center gap-2 min-h-[44px] rounded-full border-2 border-white/20 bg-transparent px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Dostupnost
          </a>
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-2 min-h-[44px] rounded-full border-2 border-white/20 bg-transparent px-6 py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Odjavi se
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Sidebar - Premium cards */}
        <aside className="shrink-0 lg:w-80">
          <div className="sticky top-6 space-y-6">
            <AdminDatePicker value={dateStr} onChange={(d) => updateParams({ date: d })} datesWithReservations={datesWithReservations} />

            <div className="rounded-[20px] border border-white/10 bg-white/3 p-6 backdrop-blur-sm">
              <label className="mb-4 block font-heading text-[13px] uppercase tracking-widest text-[#D4AF37]">Filtriraj po berberu</label>
              <select value={barberFilter} onChange={(e) => updateParams({ barber: e.target.value })}
                className="w-full min-h-[48px] rounded-full border-2 border-white/20 bg-[#1a1a1a] px-5 py-3 text-sm font-medium text-white transition-all duration-300 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30">
                <option value="all">Svi berberi</option>
                {barbers.map((b) => (<option key={b.id} value={String(b.id)}>{b.name}</option>))}
              </select>
            </div>

            <div className="flex items-center gap-2 rounded-[20px] border border-white/10 bg-white/3 p-2 backdrop-blur-sm">
              <button type="button" onClick={prevDay}
                className="flex flex-1 items-center justify-center gap-2 min-h-[48px] rounded-full border-2 border-white/20 bg-transparent py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                Prethodni
              </button>
              <button type="button" onClick={nextDay}
                className="flex flex-1 items-center justify-center gap-2 min-h-[48px] rounded-full border-2 border-white/20 bg-transparent py-2.5 text-[11px] font-bold tracking-[0.15em] uppercase text-white transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1a1a1a] focus-ring">
                Sledeći
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
          {fetchError && (
            <div className="admin-alert mb-6 flex items-center gap-3 rounded-[20px] border-2 border-red-500/50 bg-red-500/10 backdrop-blur-sm px-6 py-4 text-sm text-red-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{fetchError}</span>
            </div>
          )}

          <div className="admin-schedule-card overflow-hidden rounded-[20px] border border-white/10 bg-white/3 backdrop-blur-sm shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#1a1a1a] to-[#1a1a1a]/80 px-8 py-6">
              <div>
                <h2 className="font-heading text-[28px] text-white md:text-[32px]">RASPORED</h2>
                <p className="mt-1 text-[14px] text-white/60">{dayLabel}</p>
              </div>
              <span className="rounded-full bg-[#D4AF37] px-5 py-2 text-[12px] font-black tracking-wider text-[#1a1a1a] uppercase">
                {reservations.length} {reservations.length === 1 ? "zakazivanje" : reservations.length >= 2 && reservations.length <= 4 ? "zakazivanja" : "zakazivanja"}
              </span>
            </div>

            <div className="overflow-x-auto">
              {reservations.length === 0 && !fetchError ? (
                <div className="admin-empty-state flex flex-col items-center justify-center px-6 py-24 text-center">
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="font-heading text-[18px] text-white md:text-[20px]">NEMA REZERVACIJA</p>
                  <p className="mt-2 text-[13px] text-white/50">Izaberite drugi datum ili proverite kasnije</p>
                </div>
              ) : (
                <div className="admin-schedule-grid grid min-w-[580px]"
                  style={{ gridTemplateColumns: `72px repeat(${columns}, minmax(150px, 1fr))`, gridTemplateRows: `auto repeat(${slots.length}, ${SLOT_MINUTES * pxPerMin}px)` }}>
                  <div className="border-r border-b border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#1a1a1a]/50 p-2" style={{ gridColumn: 1, gridRow: 1 }} />
                  {displayBarbers.map((b, colIndex) => (
                    <div key={b.id} className="border-b border-r border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#1a1a1a]/50 px-4 py-4 text-center font-heading text-[13px] uppercase tracking-wider text-[#D4AF37]"
                      style={{ gridColumn: colIndex + 2, gridRow: 1 }}>{b.name}</div>
                  ))}
                  {displayBarbers.length === 0 && (
                    <div className="border-b border-r border-white/10 px-3 py-4 text-center text-sm text-white/40" style={{ gridColumn: 2, gridRow: 1 }}>—</div>
                  )}
                  {slots.map((slot, rowIndex) => (
                    <div key={slot} className="border-r border-b border-white/10 py-2 pr-3 text-right text-[11px] font-medium tracking-wider text-white/50"
                      style={{ gridColumn: 1, gridRow: rowIndex + 2 }}>{slot}</div>
                  ))}
                  {displayBarbers.length > 0 && displayBarbers.map((barber, colIndex) => {
                    const colReservations = reservations.filter((r) => r.barber_id === barber.id);
                    return (
                      <div key={barber.id} className="relative border-r border-[#2A2A2F] last:border-r-0"
                        style={{ gridColumn: colIndex + 2, gridRow: "2 / -1", minHeight: `${dayColumnHeightPx()}px`, overflow: "visible" }}>
                        {colReservations.map((r) => {
                          const ids = (r.service_ids && r.service_ids.length > 0) ? r.service_ids : (r.service_id != null ? [r.service_id] : []);
                          const reservationServices = ids.map((id) => serviceMap[id]).filter(Boolean) as Service[];
                          const serviceLabel = reservationServices.length > 0
                            ? reservationServices.map((s) => s.service_name).join(", ")
                            : "Usluga";
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setSelectedReservation({
                                r,
                                services: reservationServices,
                                totalPriceRsd: reservationServices.reduce((sum, s) => sum + Number(s.price_rsd ?? 0), 0),
                                barber,
                              })}
                              className="admin-reservation-block absolute left-2 right-2 rounded-lg border-2 border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/10 px-4 py-2.5 text-left text-xs backdrop-blur-sm transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/30 hover:shadow-lg hover:shadow-[#D4AF37]/20 focus-ring"
                              style={getBlockStyle(r)}
                            >
                              <span className="block truncate font-semibold text-[#F5F5F7]">{r.customer_name || r.customer_phone || "—"}</span>
                              <span className="block truncate text-[#A1A1A6]">{serviceLabel}</span>
                              <span className="block truncate text-[10px] text-[#6B6B70]">{getLocalTimeString(r.start_time)}–{getLocalTimeString(r.end_time)}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <section className="mt-12" aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="mb-5 text-xl font-bold tracking-tight text-[#F5F5F7]">Pregled</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-6">
                <p className="text-3xl font-bold text-[#F5F5F7]">{reservations.length}</p>
                <p className="mt-1 text-sm text-[#A1A1A6]">Današnja zakazivanja</p>
              </div>
              <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-6">
                <p className="text-3xl font-bold text-[#F5F5F7]">{barbers.length}</p>
                <p className="mt-1 text-sm text-[#A1A1A6]">Aktivni berberi</p>
              </div>
              <div className="rounded-[14px] border border-[#2A2A2F] bg-[#141417] p-6">
                <p className="text-3xl font-bold text-[#F5F5F7]">{services.length}</p>
                <p className="mt-1 text-sm text-[#A1A1A6]">Ponuđene usluge</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Reservation details modal - Premium design */}
      {selectedReservation && (
        <div className="admin-modal-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={() => setSelectedReservation(null)} role="dialog" aria-modal="true" aria-labelledby="reservation-dialog-title">
          <div className="admin-modal-content w-full max-w-lg rounded-[24px] border-2 border-white/10 bg-[#1a1a1a] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-8 flex items-start justify-between border-b border-white/10 pb-6">
              <div>
                <h3 id="reservation-dialog-title" className="font-heading text-[24px] text-white md:text-[28px]">DETALJI REZERVACIJE</h3>
                <span className="mt-2 block h-[3px] w-16 bg-[#D4AF37] origin-left" />
                <p className="mt-4 text-[14px] text-white/60">{getLocalTimeString(selectedReservation.r.start_time)} – {getLocalTimeString(selectedReservation.r.end_time)}</p>
              </div>
              <button type="button" onClick={() => setSelectedReservation(null)}
                className="rounded-full p-2 text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white focus-ring" aria-label="Zatvori">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <dl className="space-y-6">
              <div>
                <dt className="mb-2 font-heading text-[10px] uppercase tracking-widest text-[#D4AF37]">Korisnik</dt>
                <dd className="text-[15px] font-medium text-white">{selectedReservation.r.customer_name}</dd>
              </div>
              <div>
                <dt className="mb-2 font-heading text-[10px] uppercase tracking-widest text-[#D4AF37]">Telefon</dt>
                <dd className="text-[15px] text-white">
                  <a href={`tel:${selectedReservation.r.customer_phone}`} className="text-[#D4AF37] hover:text-[#c9a430] hover:underline transition-colors">{selectedReservation.r.customer_phone}</a>
                </dd>
              </div>
              {selectedReservation.r.customer_email && (
                <div>
                  <dt className="mb-2 font-heading text-[10px] uppercase tracking-widest text-[#D4AF37]">Imejl</dt>
                  <dd className="text-[15px] text-white">
                    <a href={`mailto:${selectedReservation.r.customer_email}`} className="text-[#D4AF37] hover:text-[#c9a430] hover:underline transition-colors">{selectedReservation.r.customer_email}</a>
                  </dd>
                </div>
              )}
              <div className="flex gap-8 pt-2 border-t border-white/10">
                <div>
                  <dt className="mb-2 font-heading text-[10px] uppercase tracking-widest text-[#D4AF37]">Berber</dt>
                  <dd className="text-[15px] font-medium text-white">{selectedReservation.barber?.name ?? "—"}</dd>
                </div>
                <div className="flex-1">
                  <dt className="mb-2 font-heading text-[10px] uppercase tracking-widest text-[#D4AF37]">Usluge</dt>
                  <dd className="text-[15px] text-white">
                    {selectedReservation.services.length > 0
                      ? selectedReservation.services.map((s) => s.service_name).join(", ")
                      : "—"}
                    {selectedReservation.services.length > 0 && (
                      <span className="ml-2 font-bold text-[#D4AF37]">({SLOT_DURATION} min · {selectedReservation.totalPriceRsd} RSD)</span>
                    )}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
