import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, List, MapPin } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { EmptyState } from '../components/EmptyState';
import { BrandImage } from '../components/BrandImage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EventsPage() {
  const { events, settings, loading } = useClubData();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [calendarDate, setCalendarDate] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const publishedEvents = useMemo(
    () =>
      events
        .filter((e) => e.publicationStatus === 'published')
        .filter((e) => (statusFilter === 'all' ? true : e.status === statusFilter))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, statusFilter],
  );

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarDate.year, calendarDate.month, 1).getDay();
    const totalDays = new Date(calendarDate.year, calendarDate.month + 1, 0).getDate();
    const cells: { day: number | null; isoDate: string | null }[] = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, isoDate: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const mm = String(calendarDate.month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      cells.push({ day: d, isoDate: `${calendarDate.year}-${mm}-${dd}` });
    }
    return cells;
  }, [calendarDate]);

  const monthLabel = new Date(calendarDate.year, calendarDate.month, 1).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' },
  );

  const shiftMonth = (delta: number) => {
    setCalendarDate((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Leostic Year {settings.currentLeosticYear}
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
              Events & Calendar
            </h1>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              General meetings, service drives, fellowships, and district engagements of the Leo Club of NIBM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-xl border border-white/12 bg-[#0B0F1A] p-1">
              {(['all', 'upcoming', 'completed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === st
                      ? 'bg-[#E8AF25] text-[#080B12]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-xl border border-white/12 bg-[#0B0F1A] p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'list'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" aria-hidden="true" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  viewMode === 'calendar'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="h-64 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse" />
          ) : viewMode === 'calendar' ? (
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-white">{monthLabel}</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftMonth(-1)}
                    className="rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    className="rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((cell, index) => {
                  const dayEvents = cell.isoDate
                    ? publishedEvents.filter((e) => e.date.startsWith(cell.isoDate!))
                    : [];
                  return (
                    <div
                      key={index}
                      className={`min-h-[88px] rounded-xl border p-2 text-left ${
                        cell.day
                          ? 'border-white/10 bg-[#05070D]'
                          : 'border-transparent bg-transparent'
                      }`}
                    >
                      {cell.day && (
                        <>
                          <div className="text-xs font-medium text-slate-400 tabular-nums">
                            {cell.day}
                          </div>
                          <div className="mt-1 space-y-1">
                            {dayEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="rounded bg-[#E8AF25]/15 px-1.5 py-0.5 text-[11px] font-medium text-[#F3D754] truncate"
                                title={ev.title}
                              >
                                {ev.title}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {publishedEvents.length === 0 && (
                <p className="mt-6 text-center text-sm text-slate-400">
                  No published events scheduled for this period yet.
                </p>
              )}
            </div>
          ) : publishedEvents.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="w-6 h-6" aria-hidden="true" />}
              title="No published events yet"
              description="Club events and meeting schedules are published by authorised officers once confirmed. Switch to Calendar view to browse upcoming months."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedEvents.map((ev) => (
                <article
                  key={ev.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] flex flex-col"
                >
                  {ev.posterUrl && (
                    <div className="aspect-[16/9]">
                      <BrandImage src={ev.posterUrl} alt={ev.title} />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-[#F3D754] tabular-nums">
                      {ev.date} · <span className="capitalize">{ev.status}</span>
                    </div>
                    <h2 className="mt-2 font-display text-lg font-semibold text-white">
                      {ev.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300 flex-1">{ev.summary}</p>
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E8AF25]" aria-hidden="true" />
                        <span>{ev.location}</span>
                      </span>
                      {ev.registrationUrl && (
                        <a
                          href={ev.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#F3D754] hover:underline"
                        >
                          Register
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
