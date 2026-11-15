import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell } from '../components/Reveal';
import { EmptyState } from '../components/EmptyState';
import { BrandImage } from '../components/BrandImage';

export function NewsPage() {
  const { news, settings, loading } = useClubData();
  const [selectedYear, setSelectedYear] = useState('all');

  const publishedNews = useMemo(
    () =>
      news
        .filter((n) => n.publicationStatus === 'published')
        .filter((n) => (selectedYear === 'all' ? true : n.leosticYear === selectedYear))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [news, selectedYear],
  );

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Club Dispatches & Updates
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
              News & Live Updates
            </h1>
            <p className="mt-3 text-base text-slate-300 max-w-2xl">
              Official announcements, fellowship recaps, and district updates from the {settings.clubName}.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse"
                />
              ))}
            </div>
          ) : publishedNews.length === 0 ? (
            <EmptyState
              icon={<Newspaper className="w-6 h-6" aria-hidden="true" />}
              title="No published news updates yet"
              description="Club announcements, induction highlights, and live updates published by authorised officers will appear here automatically."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedNews.map((item) => (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#E8AF25]/55"
                >
                  {item.coverUrl && (
                    <Link to={`/news/${item.slug}`} className="aspect-[16/10] overflow-hidden bg-[#111726] block">
                      <BrandImage
                        src={item.coverUrl}
                        alt={item.title}
                        fallbackLabel={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </Link>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs text-[#F3D754] tabular-nums">
                      {item.date} · {item.leosticYear}
                    </div>
                    <h2 className="mt-2 font-display text-lg font-bold text-white group-hover:text-[#F3D754] transition-colors">
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h2>
                    <p className="mt-2.5 text-sm text-slate-300 leading-relaxed line-clamp-3 flex-1">
                      {item.excerpt}
                    </p>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <Link
                        to={`/news/${item.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F3D754] hover:underline"
                      >
                        <span>Read full update</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
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
