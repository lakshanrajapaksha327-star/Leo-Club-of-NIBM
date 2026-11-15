import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Users } from 'lucide-react';
import { EXECUTIVE_BOARD_ROLES } from '../data/brand';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { EmptyState } from '../components/EmptyState';
import { BrandImage } from '../components/BrandImage';

export function TeamPage() {
  const { officers, settings, loading } = useClubData();
  const [selectedYear, setSelectedYear] = useState(settings.currentLeosticYear);

  const visibleOfficers = useMemo(
    () =>
      officers
        .filter((o) => o.visible && o.leosticYear === selectedYear)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [officers, selectedYear],
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Club Leadership
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
              Executive Committee
            </h1>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Executive Board officers (President, Secretary, Treasurer, Vice Presidents, and Directors) across current and preserved prior Leostic years.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {settings.availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                  selectedYear === yr
                    ? 'bg-[#E8AF25] text-[#05070D]'
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse"
                />
              ))}
            </div>
          ) : visibleOfficers.length === 0 ? (
            <>
              <div>
                <h2 className="font-display text-xl font-bold text-white mb-5">
                  Executive Board Structure ({selectedYear})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {EXECUTIVE_BOARD_ROLES.map((slot) => (
                    <article
                      key={slot.key}
                      className="overflow-hidden rounded-2xl border border-white/12 bg-[#0B0F1A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#E8AF25]/55"
                    >
                      <div className="aspect-[3/4] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#151B2C] to-[#080B13]">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#E8AF25]/35 bg-[#05070D] text-[#F3D754]">
                          <UserRound className="w-9 h-9" aria-hidden="true" />
                        </div>
                        <div className="mt-4 text-xs font-semibold text-[#F3D754]">
                          {slot.position}
                        </div>
                        <h3 className="mt-1 font-display text-lg font-bold text-white">
                          Pending Confirmation
                        </h3>
                        <p className="mt-2 text-xs text-slate-400 max-w-xs">
                          {slot.note}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <EmptyState
                icon={<Users className="w-6 h-6" aria-hidden="true" />}
                title={`Awaiting confirmed officers for ${selectedYear}`}
                description="No fake officer names or borrowed portraits are shown. Authorised admins can add the President, Secretary, Treasurer, and Board members with real club portraits once confirmed."
                actionLabel="Open Admin Portal"
                actionTo="/admin"
              />
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleOfficers.map((officer) => (
                <article
                  key={officer.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] flex flex-col"
                >
                  <div className="aspect-[3/4] bg-[#151C2C]">
                    <BrandImage
                      src={officer.photoUrl}
                      alt={`${officer.name} — ${officer.position}`}
                      fallbackLabel={officer.name}
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-medium text-[#F3D754]">
                      {officer.position} · <span className="tabular-nums">{officer.leosticYear}</span>
                    </div>
                    <h2 className="mt-1.5 font-display text-lg font-semibold text-white">
                      {officer.name}
                    </h2>
                    {officer.biography && (
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {officer.biography}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/history"
              className="text-xs font-medium text-slate-400 hover:text-[#F3D754] transition-colors"
            >
              Browse archived Leostic year records →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
