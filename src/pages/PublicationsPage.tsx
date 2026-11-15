import { useMemo, useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { EmptyState } from '../components/EmptyState';
import { BrandImage } from '../components/BrandImage';

export function PublicationsPage() {
  const { publications, news, settings, loading } = useClubData();
  const [selectedYear, setSelectedYear] = useState('all');

  const publishedItems = useMemo(
    () =>
      publications
        .filter((p) => p.publicationStatus === 'published')
        .filter((p) => (selectedYear === 'all' ? true : p.leosticYear === selectedYear)),
    [publications, selectedYear],
  );

  const publishedNews = useMemo(
    () =>
      news
        .filter((n) => n.publicationStatus === 'published')
        .filter((n) => (selectedYear === 'all' ? true : n.leosticYear === selectedYear)),
    [news, selectedYear],
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Editorial & Reports
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
              Publications & Newsletters
            </h1>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Official club newsletters, annual reports, and editorial dispatches from the Leo Club of NIBM.
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {loading ? (
            <div className="h-64 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse" />
          ) : publishedItems.length === 0 && publishedNews.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-6 h-6" aria-hidden="true" />}
              title="No publications or newsletters released yet"
              description="Club newsletters, annual reports, and editorial bulletins will appear here once published by the Editorial & Executive team."
            />
          ) : (
            <>
              {publishedItems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {publishedItems.map((pub) => (
                    <article
                      key={pub.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] flex flex-col"
                    >
                      <div className="aspect-[3/4] bg-[#151C2C]">
                        <BrandImage
                          src={pub.coverUrl}
                          alt={pub.title}
                          fallbackLabel={pub.title}
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs text-slate-400">
                          <span className="text-[#F3D754] capitalize">{pub.type}</span> ·{' '}
                          <span className="tabular-nums">{pub.leosticYear}</span> · {pub.date}
                        </div>
                        <h2 className="mt-2 font-display text-lg font-semibold text-white">
                          {pub.title}
                        </h2>
                        <p className="mt-2 text-sm text-slate-300 flex-1">{pub.description}</p>
                        {pub.pdfUrl && (
                          <a
                            href={pub.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#F3D754] hover:underline"
                          >
                            <span>Read PDF</span>
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {publishedNews.length > 0 && (
                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-white">Club News</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {publishedNews.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6"
                      >
                        <div className="text-xs text-slate-400 tabular-nums">
                          {item.date} · {item.leosticYear}
                        </div>
                        <h3 className="mt-2 font-display text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                          {item.excerpt}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
