import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  FolderKanban,
  Pause,
  Play,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AFFILIATION_HIERARCHY,
  BRAND_ASSETS,
  EXECUTIVE_BOARD_ROLES,
  HERO_SLIDES,
  LEO_PILLARS,
} from '../data/brand';
import { useClubData } from '../context/ClubContext';
import { PageShell, Reveal } from '../components/Reveal';
import { ProjectCard } from '../components/ProjectCard';
import { BrandImage } from '../components/BrandImage';

const SLIDE_DURATION_MS = 6500;
const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

export function HomePage() {
  const {
    settings,
    projects,
    officers,
    publications,
    news,
    achievements,
    loading,
  } = useClubData();
  const prefersReducedMotion = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides =
    settings.heroSlides && settings.heroSlides.length > 0 ? settings.heroSlides : HERO_SLIDES;

  useEffect(() => {
    if (prefersReducedMotion || !isAutoPlaying || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isAutoPlaying, slides.length]);

  const safeSlideIndex = slideIndex % slides.length;
  const activeSlide = slides[safeSlideIndex] || HERO_SLIDES[0];

  const publishedProjects = projects.filter((p) => p.publicationStatus === 'published');
  const featuredProjects = publishedProjects.filter((p) => p.featured).slice(0, 3);
  const latestProjects =
    featuredProjects.length > 0 ? featuredProjects : publishedProjects.slice(0, 3);

  const currentOfficers = officers
    .filter((o) => o.visible && o.leosticYear === settings.currentLeosticYear)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const latestPublications = publications
    .filter((p) => p.publicationStatus === 'published')
    .slice(0, 3);

  const latestNews = news
    .filter((n) => n.publicationStatus === 'published')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const visibleAwards = achievements
    .filter((a) => a.visible && a.leosticYear === settings.currentLeosticYear)
    .slice(0, 4);

  const marqueeItems =
    latestPublications.length > 0 || latestNews.length > 0
      ? [
          ...latestPublications.map((m) => `${m.title} · ${m.leosticYear}`),
          ...latestNews.map((n) => `${n.title} · ${n.date}`),
        ]
      : [
          `Leostic Year ${settings.currentLeosticYear}`,
          'Leo Club of NIBM',
          'Leo District 306 D7',
          'Leadership · Experience · Opportunity',
          'National Institute of Business Management, Sri Lanka',
        ];

  const impactCards =
    settings.verifiedImpactMetrics.length > 0
      ? settings.verifiedImpactMetrics.slice(0, 4)
      : [
          {
            value: String(publishedProjects.length).padStart(2, '0'),
            label: 'Published Projects',
          },
          {
            value: String(currentOfficers.length).padStart(2, '0'),
            label: 'Confirmed Officers',
          },
          {
            value: settings.currentLeosticYear,
            label: 'Active Leostic Year',
          },
          {
            value: '306 D7',
            label: 'Leo District',
          },
        ];

  const goPrevSlide = () =>
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goNextSlide = () => setSlideIndex((prev) => (prev + 1) % slides.length);

  return (
    <PageShell>
      {/* SECTION 0: Full-Viewport Auto-Playing Demo Backdrop Reel Hero */}
      <section
        aria-label="Hero slideshow"
        className="relative min-h-[640px] lg:h-[88vh] flex flex-col justify-between overflow-hidden bg-[#05070D]"
      >
        {/* Cross-dissolving Ken Burns Background Reel (overlapping slides = zero black flash) */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={activeSlide.id}
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.15, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.imageAlt}
                className={`h-full w-full object-cover opacity-75 ${
                  prefersReducedMotion
                    ? ''
                    : activeSlide.motionVariant === 'alt'
                    ? 'animate-ken-burns-alt'
                    : 'animate-ken-burns'
                }`}
              />
            </motion.div>
          </AnimatePresence>

          {/* Balanced Cinematic Scrims + D7 Plum/Gold Ambient Tint */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070D]/92 via-[#05070D]/60 to-[#05070D]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/20 to-[#05070D]/45" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(122,24,77,0.28),transparent_52%)]"
          />
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10 lg:pt-20 flex-1 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center w-full">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-4 text-xs sm:text-sm font-medium text-[#F3D754] tabular-nums">
                <span>{settings.currentLeosticYear}</span>
                <span className="h-3.5 w-px bg-white/25" aria-hidden="true" />
                <span>
                  0{safeSlideIndex + 1} / 0{slides.length}
                </span>
                <span className="h-3.5 w-px bg-white/25 hidden sm:inline-block" aria-hidden="true" />
                <span className="hidden sm:inline text-slate-200">{activeSlide.kicker}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: SMOOTH_EASE }}
                  className="space-y-4"
                >
                  <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-white leading-[1.06] drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
                    {activeSlide.headline}
                  </h1>
                  <p className="text-base sm:text-xl text-slate-100 leading-relaxed max-w-2xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                    {activeSlide.subline}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/join"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] hover:-translate-y-0.5 shadow-lg hover:shadow-[0_10px_28px_rgba(243,215,84,0.25)] transition-all duration-200 whitespace-nowrap shrink-0"
                >
                  <span>Join Now</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-[#05070D]/55 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md hover:border-[#F3D754] hover:text-[#F3D754] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap shrink-0"
                >
                  <span>Explore Projects</span>
                </Link>
              </div>
            </div>

            {/* Right Harmonized Orbital Crest Medallion */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="relative flex h-72 w-72 sm:h-88 sm:w-88 items-center justify-center">
                {/* Outer clockwise gold dashed orbit */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 360 360"
                  className={`absolute inset-0 h-full w-full ${
                    prefersReducedMotion ? '' : 'animate-[spin_42s_linear_infinite]'
                  }`}
                >
                  <circle
                    cx="180"
                    cy="180"
                    r="168"
                    fill="none"
                    stroke="rgba(243,215,84,0.35)"
                    strokeWidth="1.25"
                    strokeDasharray="6 10"
                  />
                  <circle cx="180" cy="12" r="4.5" fill="#F3D754" />
                </svg>

                {/* Inner counter-rotating D7 Plum orbit */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 360 360"
                  className={`absolute inset-0 h-full w-full ${
                    prefersReducedMotion ? '' : 'animate-[spin_30s_linear_infinite_reverse]'
                  }`}
                >
                  <circle
                    cx="180"
                    cy="180"
                    r="138"
                    fill="none"
                    stroke="rgba(122,24,77,0.65)"
                    strokeWidth="1.5"
                    strokeDasharray="24 12"
                  />
                  <circle cx="180" cy="42" r="3.5" fill="#832D90" />
                </svg>

                <div className="relative z-10 flex flex-col items-center rounded-3xl border border-white/15 bg-[#0B0F1A]/85 px-7 py-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                  <div className="flex h-32 w-32 sm:h-36 sm:w-36 items-center justify-center rounded-full bg-white p-3.5 ring-4 ring-[#7A184D]/55 shadow-[0_0_32px_rgba(232,175,37,0.22)]">
                    <img
                      src={BRAND_ASSETS.clubLogoPrimary}
                      alt="Leo Club of NIBM District 306 D7 emblem"
                      referrerPolicy="no-referrer"
                      className="h-full w-full rounded-full object-contain"
                    />
                  </div>
                  <p className="mt-4 text-sm font-semibold tracking-wide text-white">
                    Leo Club of NIBM
                  </p>
                  <p className="text-[11px] text-[#F3D754] mt-0.5 tabular-nums">
                    District 306 D7 · {settings.currentLeosticYear}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Reel Controls + Continuous Marquee Strip */}
        <div className="relative z-10 border-t border-white/10 bg-[#05070D]/85 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3 shrink-0">
              <div role="tablist" aria-label="Slide selectors" className="flex items-center gap-2">
                {slides.map((s, idx) => {
                  const isActive = safeSlideIndex === idx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={() => setSlideIndex(idx)}
                      className={`relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                        isActive ? 'w-11 bg-white/25' : 'w-2.5 bg-white/30 hover:bg-white/60'
                      }`}
                    >
                      {isActive && (
                        <span
                          key={`${s.id}-${isAutoPlaying ? 'run' : 'pause'}`}
                          className={`absolute inset-0 rounded-full bg-[#F3D754] ${
                            isAutoPlaying && !prefersReducedMotion ? 'animate-slide-progress' : ''
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center gap-1 border-l border-white/15 pl-3">
                <button
                  type="button"
                  onClick={goPrevSlide}
                  aria-label="Previous background slide"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoPlaying((prev) => !prev)}
                  aria-label={isAutoPlaying ? 'Pause background reel' : 'Play background reel'}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-[#F3D754] transition-colors"
                >
                  {isAutoPlaying ? (
                    <Pause className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <Play className="w-3 h-3" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={goNextSlide}
                  aria-label="Next background slide"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden flex-1 text-xs text-slate-300">
              <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
                {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                  <span key={`${item}-${idx}`} className="inline-flex items-center gap-3">
                    <span className="text-[#F3D754]" aria-hidden="true">◆</span>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            <span className="hidden md:inline text-[11px] text-slate-400 whitespace-nowrap shrink-0">
              {activeSlide.isPlaceholder ? 'Placeholder backdrop' : 'Club highlight'}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 1: Our Legacy Of Service & Success + L-E-O Pillars */}
      <section className="py-16 md:py-24 border-b border-white/10 bg-[#080B13] bg-grid-architectural bg-d7-atmosphere">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-14">
            <Reveal className="lg:col-span-7 space-y-4">
              <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
                Our Identity
              </p>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Our Legacy Of Service & Success
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Representing the National Institute of Business Management (NIBM), Sri Lanka within{' '}
                {settings.districtName} and {settings.multipleDistrictName}, we bring undergraduates together to turn compassion into measurable community action.
              </p>
            </Reveal>

            <Reveal delay={0.08} className="lg:col-span-5">
              <div className="rounded-2xl border border-white/12 bg-[#0B0F1A]/95 p-6 space-y-4 shadow-xl">
                <img
                  src={BRAND_ASSETS.officialLockup}
                  alt="Leo Club of NIBM and District 306 D7 brand lockup"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-xl bg-white p-2.5 object-contain"
                />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>NIBM Sri Lanka</span>
                  <Link
                    to="/about"
                    className="font-medium text-[#F3D754] hover:underline inline-flex items-center gap-1"
                  >
                    <span>About Our Club</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEO_PILLARS.map((pillar, idx) => (
              <Reveal key={pillar.title} delay={idx * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F1A]/95 p-7 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#E8AF25]/60 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E8AF25]/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-3xl font-extrabold text-[#F3D754]">
                      {pillar.letter}
                    </span>
                    <span className="text-xs text-slate-400">{pillar.subtitle}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold tracking-wide text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: "Where There’s a Need, There’s a Leo." (4-Card Impact Strip) */}
      <section className="py-16 md:py-22 border-b border-white/10 bg-[#05070D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-center font-display text-3xl sm:text-4xl font-black tracking-tight text-white">
              Where There’s a Need, There’s a Leo.
            </h2>
            <p className="mt-3 text-center text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Verified club figures for {settings.currentLeosticYear} update directly from approved records in the club database.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {impactCards.map((card, idx) => (
              <Reveal key={card.label} delay={idx * 0.06}>
                <div className="group rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#E8AF25]/45">
                  <div className="font-display text-2xl sm:text-4xl font-extrabold text-[#F3D754] tabular-nums">
                    {card.value}
                  </div>
                  <div className="mt-2 text-xs sm:text-sm font-medium text-slate-300">
                    {card.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: EXECUTIVE BOARD — "We Are Leaders Who Work Together!" (President, Secretary, Treasurer slots) */}
      <section className="py-16 md:py-24 border-b border-white/10 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-5 space-y-5">
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Executive Board · {settings.currentLeosticYear}
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              We Are Leaders Who Work Together!
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We believe in youth leadership through service. Our Executive Board guides and empowers NIBM Leos to plan, serve, and lead with integrity.
            </p>
            <div className="pt-2">
              <Link
                to="/team"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white hover:border-[#F3D754] hover:text-[#F3D754] hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>View Our Leadership</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {EXECUTIVE_BOARD_ROLES.map((slot, idx) => {
              const matchedOfficer = currentOfficers.find((o) =>
                o.position.toLowerCase().includes(slot.key),
              );

              return (
                <Reveal key={slot.key} delay={idx * 0.08}>
                  <article className="group overflow-hidden rounded-2xl border border-white/12 bg-[#0B0F1A] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#E8AF25]/60 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                    <div className="aspect-[3/4] relative bg-gradient-to-b from-[#171B2E] via-[#101424] to-[#080B13] flex flex-col">
                      {matchedOfficer?.photoUrl ? (
                        <>
                          <BrandImage
                            src={matchedOfficer.photoUrl}
                            alt={`${matchedOfficer.name} — ${matchedOfficer.position}`}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 text-left">
                            <div className="text-xs font-semibold text-[#F3D754]">
                              {matchedOfficer.position}
                            </div>
                            <h3 className="mt-0.5 font-display text-base font-bold text-white">
                              {matchedOfficer.name}
                            </h3>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 flex flex-col items-center justify-center px-5 pt-6 pb-2 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#E8AF25]/40 bg-[#05070D]/80 text-[#F3D754] transition-transform duration-300 group-hover:scale-105 group-hover:border-[#F3D754]">
                              <UserRound className="w-7 h-7" aria-hidden="true" />
                            </div>
                            <p className="mt-3.5 text-xs font-medium text-slate-300 leading-relaxed">
                              {slot.note}
                            </p>
                          </div>
                          <div className="border-t border-white/10 bg-black/50 p-4 text-left">
                            <div className="text-xs font-semibold text-[#F3D754]">
                              {matchedOfficer ? matchedOfficer.position : slot.position}
                            </div>
                            <h3 className="mt-0.5 font-display text-base font-bold text-white">
                              {matchedOfficer ? matchedOfficer.name : 'Pending Confirmation'}
                            </h3>
                          </div>
                        </>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: LIVE UPDATES — Latest Magazines */}
      <section className="py-16 md:py-24 border-b border-white/10 bg-[#05070D] bg-grid-architectural bg-d7-atmosphere">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-[#F3D754]" aria-hidden="true" />
              <span>Live Updates</span>
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-[#F3D754]">
              Latest Magazines
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Stories of creativity, fellowship, and service from the Leo Club of NIBM.
            </p>
          </Reveal>

          {latestPublications.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestPublications.map((pub, idx) => (
                <Reveal key={pub.id} delay={idx * 0.07}>
                  <article className="group overflow-hidden rounded-2xl border border-[#E8AF25]/25 bg-[#0B0F1A] hover:border-[#F3D754] hover:-translate-y-1.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div className="aspect-[3/4] overflow-hidden bg-[#111726]">
                      <BrandImage
                        src={pub.coverUrl}
                        alt={pub.title}
                        fallbackLabel={pub.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="p-5 flex items-center justify-between gap-3 border-t border-white/10">
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold text-white truncate">
                          {pub.title}
                        </h3>
                        <p className="text-xs text-slate-400 tabular-nums mt-0.5">
                          {pub.date} · {pub.leosticYear}
                        </p>
                      </div>
                      <Link
                        to="/publications"
                        className="text-xs font-semibold text-[#F3D754] hover:underline whitespace-nowrap shrink-0"
                      >
                        Read Now →
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((issueSlot, idx) => (
                <Reveal key={issueSlot} delay={idx * 0.07}>
                  <div className="group rounded-2xl border border-white/12 bg-[#0B0F1A]/95 p-6 flex flex-col justify-between aspect-[4/3] md:aspect-[3/4] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-[#E8AF25]/45">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-[#F3D754] tabular-nums">
                        {settings.currentLeosticYear}
                      </span>
                      <span>Issue Slot 0{issueSlot}</span>
                    </div>
                    <div className="my-auto text-center space-y-3 py-6">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#F3D754] transition-transform duration-300 group-hover:scale-105">
                        <BookOpen className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="font-display text-base font-bold text-white">
                        Club Magazine Issue {issueSlot}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                        Upload your own club newsletter cover artwork and public PDF link in Admin → Publications.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Awaiting upload</span>
                      <Link to="/admin" className="font-medium text-[#F3D754] hover:underline">
                        Manage →
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white hover:border-[#F3D754] hover:text-[#F3D754] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>View All Magazines</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE UPDATES — Latest Projects */}
      <section className="py-16 md:py-24 border-b border-white/10 bg-[#080B13]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-300">
              <Compass className="w-3.5 h-3.5 text-[#F3D754]" aria-hidden="true" />
              <span>Live Updates</span>
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold text-white">
              Latest Projects
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-300">
              Service, leadership, and impact—fresh from the field.
            </p>
          </Reveal>

          <div className="mt-10">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-80 rounded-2xl border border-white/10 bg-[#0B0F1A] animate-pulse"
                  />
                ))}
              </div>
            ) : latestProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestProjects.map((project, idx) => (
                  <Reveal key={project.id} delay={idx * 0.07}>
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] px-6 py-12 text-center max-w-2xl mx-auto space-y-3">
                  <FolderKanban className="w-7 h-7 text-[#F3D754] mx-auto" aria-hidden="true" />
                  <h3 className="font-display text-lg font-bold text-white">
                    No recent published projects yet
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Published club initiatives with cover photos, galleries, videos, and impact stories will appear here as soon as they are uploaded and approved.
                  </p>
                </div>
              </Reveal>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-2.5 text-sm font-semibold text-white hover:border-[#F3D754] hover:text-[#F3D754] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>View All Projects</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-6 py-2.5 text-sm font-medium text-slate-200 hover:border-[#E8AF25]/60 hover:text-[#F3D754] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Club News & Notices</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <section className="py-14 border-b border-white/10 bg-[#05070D]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
                  Official Dispatches
                </p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-white">
                  Latest News & Notices
                </h2>
              </div>
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F3D754] hover:underline"
              >
                <span>All news updates</span>
                <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 flex flex-col justify-between space-y-4 hover:border-[#E8AF25]/45 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="text-xs text-[#F3D754] tabular-nums">
                      {item.date} · {item.leosticYear}
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">
                      <Link to={`/news/${item.slug}`} className="hover:text-[#F3D754] transition-colors">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                  <Link
                    to={`/news/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F3D754] hover:underline"
                  >
                    <span>Read update</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 6: Latest Achievement — Our Key Awards */}
      <section className="py-16 md:py-24 border-b border-white/10 bg-[#05070D]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-[#121625] via-[#260D1E] to-[#05070D] p-8 aspect-[4/3] flex flex-col justify-between shadow-2xl">
              <div className="flex items-center justify-between">
                <img
                  src={BRAND_ASSETS.d7WhiteLogo}
                  alt="Leo District 306 D7 emblem"
                  referrerPolicy="no-referrer"
                  className="h-12 w-auto object-contain"
                />
                <span className="font-display text-xl font-extrabold text-[#F3D754] tabular-nums">
                  {settings.currentLeosticYear}
                </span>
              </div>
              <div className="space-y-2">
                <Award className="w-8 h-8 text-[#F3D754]" aria-hidden="true" />
                <h3 className="font-display text-2xl font-bold text-white">
                  District & Club Honours
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Official award citations and recognitions archived per Leostic year.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7 space-y-5">
            <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
              Latest Achievement
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Our Key Awards
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Verified honours earned by the Leo Club of NIBM and its officers at District 306 D7 and Multiple District 306 conferences.
            </p>

            {visibleAwards.length > 0 ? (
              <ul className="divide-y divide-white/10 border-y border-white/10">
                {visibleAwards.map((award) => (
                  <li key={award.id} className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-white">{award.title}</span>
                    <span className="text-xs text-[#F3D754] shrink-0">{award.awardBody}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-white/10 bg-[#0B0F1A] p-5 text-sm text-slate-300">
                No awards recorded for {settings.currentLeosticYear} yet. Verified citations added in the Admin Portal will appear here automatically.
              </div>
            )}

            <div className="pt-2">
              <Link
                to="/awards"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>View All Club Awards</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SECTION 7: District & Lions Affiliations */}
      <section className="py-16 md:py-20 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold tracking-wide text-[#E8AF25]">
              Institutional & Leo Hierarchy
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-white">
              Our Affiliations
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AFFILIATION_HIERARCHY.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.06}>
                <div className="group h-full rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 flex flex-col items-center text-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#E8AF25]/45">
                  <div className="h-20 w-full flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/10 p-3">
                    <img
                      src={item.logo}
                      alt={`${item.name} emblem`}
                      referrerPolicy="no-referrer"
                      className="max-h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-4 text-[11px] font-semibold tracking-wider text-[#F3D754]">
                    {item.tier}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold text-white">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-[#F3D754] transition-colors"
            >
              <Users className="w-4 h-4 text-[#E8AF25]" aria-hidden="true" />
              <span>Explore Upcoming Events & Calendar</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
