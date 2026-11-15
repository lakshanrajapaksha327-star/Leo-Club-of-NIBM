import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Info } from 'lucide-react';
import { AFFILIATION_HIERARCHY, BRAND_ASSETS, LEO_PILLARS } from '../data/brand';
import { useClubData } from '../context/ClubContext';
import { PageShell, Reveal } from '../components/Reveal';

export function AboutPage() {
  const { settings } = useClubData();

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-16 md:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              About Leoism & Our Club
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold text-white leading-tight">
              {settings.clubName}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              An official university-based Leo Club at the{' '}
              <strong className="font-semibold text-white">{settings.institutionName}</strong>,
              operating under {settings.districtName} and {settings.multipleDistrictName}.
            </p>
          </div>
        </div>
      </section>

      {/* Organisational Relationship */}
      <section className="py-16 md:py-20 border-b border-white/10 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Organisational Hierarchy
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-400 max-w-2xl">
              Leo Clubs are the youth programme of Lions Clubs International. Here is how the Leo Club of NIBM connects from the global movement to campus.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-5">
            {AFFILIATION_HIERARCHY.map((step, i) => (
              <Reveal key={step.name} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#E8AF25]/45">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="tabular-nums font-medium text-[#F3D754]">
                      0{i + 1}. {step.tier}
                    </span>
                  </div>
                  <div className="my-5 h-16 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 p-2.5">
                    <img
                      src={step.logo}
                      alt={step.name}
                      referrerPolicy="no-referrer"
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                  <h3 className="font-display text-base font-semibold text-white">
                    {step.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed flex-1">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* L-E-O Pillars */}
      <section className="py-16 md:py-20 border-b border-white/10 bg-[#05070D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              What “Leo” Stands For
            </h2>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEO_PILLARS.map((pillar, idx) => (
              <Reveal key={pillar.title} delay={idx * 0.07}>
                <div className="h-full rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#E8AF25]/45">
                  <div className="font-display text-2xl font-extrabold text-[#F3D754]">
                    {pillar.letter} — {pillar.title}
                  </div>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Truthful Club Profile & Unverified Editable Fields */}
      <section className="py-16 md:py-20 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Reveal className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Club Identity & Official Records
            </h2>

            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-5">
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-[#F3D754]">
                  Charter Date & History
                </h3>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                  {settings.clubHistory ||
                    'Club charter date and verified historical milestones are maintained in Site Settings and will appear once confirmed by the Executive Committee.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-semibold tracking-wide text-[#F3D754]">
                  Club Mission
                </h3>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                  {settings.mission ||
                    'Official club mission statement is pending confirmation in Site Settings.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-semibold tracking-wide text-[#F3D754]">
                  Club Vision
                </h3>
                <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                  {settings.vision ||
                    'Official club vision statement is pending confirmation in Site Settings.'}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#E8AF25]" aria-hidden="true" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Verified Club Facts
                </h3>
              </div>

              <dl className="divide-y divide-white/10 text-sm">
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">Official Name</dt>
                  <dd className="text-white font-medium text-right">{settings.clubName}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">Institution</dt>
                  <dd className="text-white font-medium text-right">NIBM Sri Lanka</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">District</dt>
                  <dd className="text-white font-medium text-right">{settings.districtName}</dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">Current Year</dt>
                  <dd className="text-[#F3D754] font-semibold tabular-nums">
                    {settings.currentLeosticYear}
                  </dd>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">Charter Date</dt>
                  <dd className="text-slate-300 text-right">
                    {settings.charterDate || 'Unpublished — pending confirmation'}
                  </dd>
                </div>
              </dl>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#E8AF25] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Unconfirmed club records, charter details, and officer counts are never invented on this platform. Authorised officers can update them in the Admin Portal.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6">
              <img
                src={BRAND_ASSETS.officialLockup}
                alt="Leo Club of NIBM official lockup artwork"
                referrerPolicy="no-referrer"
                className="w-full h-auto rounded-xl object-contain bg-white p-2"
              />
              <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E8AF25] shrink-0" aria-hidden="true" />
                <span>Supplied NIBM & District 306 D7 brand artwork</span>
              </p>
            </div>

            <Link
              to="/join"
              className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Enquire About Membership</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
