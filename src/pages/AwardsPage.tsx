import { useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { EmptyState } from '../components/EmptyState';

export function AwardsPage() {
  const { achievements, settings, loading } = useClubData();
  const [selectedYear, setSelectedYear] = useState('all');

  const visibleAchievements = useMemo(
    () =>
      achievements
        .filter((a) => a.visible)
        .filter((a) => (selectedYear === 'all' ? true : a.leosticYear === selectedYear)),
    [achievements, selectedYear],
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Recognition Archive
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
              Awards & Achievements
            </h1>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Verified club, project, and officer recognitions across District 306 D7 and Multiple District 306.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedYear('all')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedYear === 'all'
                  ? 'bg-[#E8AF25] text-[#080B12]'
                  : 'border border-white/12 bg-[#0B0F1A] text-slate-300 hover:text-white'
              }`}
            >
              All years
            </button>
            {settings.availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === yr
                    ? 'bg-[#E8AF25] text-[#080B12]'
                    : 'border border-white/12 bg-[#0B0F1A] text-slate-300 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="h-64 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse" />
          ) : visibleAchievements.length === 0 ? (
            <EmptyState
              icon={<Award className="w-6 h-6" aria-hidden="true" />}
              title="No verified awards recorded yet"
              description="Club and officer awards are published strictly from verified district and multiple district citations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleAchievements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-2.5"
                >
                  <div className="text-xs text-[#F3D754] tabular-nums">
                    {item.leosticYear} · {item.awardBody}
                  </div>
                  <h2 className="font-display text-lg font-semibold text-white">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
