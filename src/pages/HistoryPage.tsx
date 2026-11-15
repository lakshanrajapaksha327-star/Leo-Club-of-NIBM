import { Link } from 'react-router-dom';
import { Award, History, Users } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell, Reveal } from '../components/Reveal';

export function HistoryPage() {
  const { settings, projects, officers, achievements } = useClubData();

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
            Club Heritage & Archives
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
            Club History & Leostic Years
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-2xl leading-relaxed">
            Every committee term, project record, and district honour of the Leo Club of NIBM is archived by Leostic year without overwriting past leadership.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Charter & Narrative */}
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-7 md:p-9 space-y-4">
              <div className="flex items-center gap-2.5 text-[#F3D754]">
                <History className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-white">
                  Charter & Institutional Record
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                {settings.clubHistory ||
                  'Confirmed charter date, founding committee notes, and club historical milestones will appear here once entered and approved by the Executive Board in Site Settings.'}
              </p>
              <div className="pt-2 text-xs text-slate-400">
                Charter Date:{' '}
                <span className="text-slate-200">
                  {settings.charterDate || 'Unpublished — pending official confirmation'}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Preserved Leostic Years */}
          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-6">
              Preserved Leostic Years
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {settings.availableYears.map((yr) => {
                const yearProjects = projects.filter(
                  (p) => p.publicationStatus === 'published' && p.leosticYear === yr,
                ).length;
                const yearOfficers = officers.filter(
                  (o) => o.visible && o.leosticYear === yr,
                ).length;
                const yearAwards = achievements.filter(
                  (a) => a.visible && a.leosticYear === yr,
                ).length;
                const isCurrent = yr === settings.currentLeosticYear;

                return (
                  <div
                    key={yr}
                    className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 flex flex-col justify-between space-y-5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#E8AF25]/45"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-display text-2xl font-extrabold text-[#F3D754] tabular-nums">
                          {yr}
                        </span>
                        <span className="text-xs text-slate-400">
                          {isCurrent ? 'Current Term' : 'Archived Term'}
                        </span>
                      </div>
                      <dl className="mt-4 space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <dt className="text-slate-400">Published Projects</dt>
                          <dd className="tabular-nums font-medium">{yearProjects}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-400">Confirmed Officers</dt>
                          <dd className="tabular-nums font-medium">{yearOfficers}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-400">Verified Awards</dt>
                          <dd className="tabular-nums font-medium">{yearAwards}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center gap-4 text-xs font-medium">
                      <Link
                        to="/team"
                        className="inline-flex items-center gap-1.5 text-slate-200 hover:text-[#F3D754]"
                      >
                        <Users className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Committee</span>
                      </Link>
                      <Link
                        to="/awards"
                        className="inline-flex items-center gap-1.5 text-slate-200 hover:text-[#F3D754]"
                      >
                        <Award className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Awards</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
