import { useMemo, useState } from 'react';
import { FolderKanban, Search, RotateCcw } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { filterProjects, paginateItems } from '../utils/clubLogic';
import type { ProjectStatus } from '../types/club';
import { PageShell } from '../components/Reveal';
import { ProjectCard } from '../components/ProjectCard';
import { EmptyState } from '../components/EmptyState';

const PAGE_SIZE = 6;

export function ProjectsPage() {
  const { projects, settings, serviceCategories, loading, error } = useClubData();
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const activeCategoryNames = useMemo(
    () =>
      serviceCategories
        .filter((item) => item.active)
        .sort((a, b) => a.order - b.order)
        .map((item) => item.name),
    [serviceCategories],
  );

  const filtered = useMemo(
    () =>
      filterProjects(projects, {
        search,
        year,
        category,
        status,
        publicOnly: true,
      }),
    [projects, search, year, category, status],
  );

  const featuredProject = useMemo(
    () => filtered.find((p) => p.featured) || null,
    [filtered],
  );

  const archiveProjects = useMemo(
    () => (featuredProject ? filtered.filter((p) => p.id !== featuredProject.id) : filtered),
    [filtered, featuredProject],
  );

  const paginated = useMemo(
    () => paginateItems(archiveProjects, visibleCount),
    [archiveProjects, visibleCount],
  );

  const hasActiveFilters =
    search.trim() !== '' || year !== 'all' || category !== 'all' || status !== 'all';

  const resetFilters = () => {
    setSearch('');
    setYear('all');
    setCategory('all');
    setStatus('all');
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <PageShell>
      {/* Editorial Archive Header */}
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
            Editorial Project Archive
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
            Club Service Projects
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-2xl leading-relaxed">
            Explore published service initiatives, community impact stories, photo galleries, and project reports led by the Leo Club of NIBM.
          </p>

          {/* Search & Filters Toolbar */}
          <div className="mt-8 rounded-2xl border border-white/12 bg-[#0B0F1A]/95 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 shadow-xl">
            <div className="lg:col-span-4 relative">
              <label htmlFor="project-search" className="sr-only">
                Search projects by title or summary
              </label>
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="project-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                placeholder="Search project title, summary, or location..."
                className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none transition-colors"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="filter-year" className="sr-only">
                Filter by Leostic year
              </label>
              <select
                id="filter-year"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-slate-100 focus:border-[#E8AF25] focus:outline-none transition-colors"
              >
                <option value="all">All Leostic years</option>
                {settings.availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label htmlFor="filter-category" className="sr-only">
                Filter by service category
              </label>
              <select
                id="filter-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-slate-100 focus:border-[#E8AF25] focus:outline-none transition-colors"
              >
                <option value="all">All service categories</option>
                {activeCategoryNames.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="filter-status" className="sr-only">
                Filter by activity status
              </label>
              <select
                id="filter-status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ProjectStatus | 'all');
                  setVisibleCount(PAGE_SIZE);
                }}
                className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-slate-100 focus:border-[#E8AF25] focus:outline-none transition-colors"
              >
                <option value="all">All statuses</option>
                <option value="planned">Planned</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="lg:col-span-1 flex items-center">
              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                aria-label="Reset project filters"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural min-h-[50vh]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-84 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FolderKanban className="w-6 h-6" aria-hidden="true" />}
              title={
                hasActiveFilters
                  ? 'No projects match these filters'
                  : 'No published projects yet'
              }
              description={
                hasActiveFilters
                  ? 'Try clearing your search or selecting another Leostic year, service category, or activity status.'
                  : 'Only projects reviewed and published by authorised Leo Club of NIBM officers appear in this public archive.'
              }
              actionLabel={hasActiveFilters ? undefined : 'Open Admin Portal'}
              actionTo={hasActiveFilters ? undefined : '/admin'}
            />
          ) : (
            <>
              {featuredProject && (
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[#F3D754] mb-4">
                    Featured Story
                  </p>
                  <ProjectCard project={featuredProject} />
                </div>
              )}

              {paginated.items.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginated.items.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>

                  {paginated.hasMore && (
                    <div className="mt-10 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                        className="rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white hover:border-[#E8AF25]/50 hover:text-[#F3D754] transition-colors"
                      >
                        Load more projects ({paginated.items.length} of {paginated.total})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
