import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowUp, ChevronDown, Menu, Shield, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_ASSETS } from '../data/brand';
import { useClubData } from '../context/ClubContext';

interface DropdownGroup {
  label: string;
  items: { label: string; to: string; description: string }[];
}

const ABOUT_GROUP: DropdownGroup = {
  label: 'About Us',
  items: [
    { label: 'About Leoism & Club', to: '/about', description: 'Identity, L-E-O pillars, and D7 affiliation' },
    { label: 'Executive Board', to: '/team', description: 'President, Secretary, Treasurer & Board' },
    { label: 'Contact Us', to: '/contact', description: 'Reach club officers and campus office' },
  ],
};

const INITIATIVES_GROUP: DropdownGroup = {
  label: 'Service',
  items: [
    { label: 'Projects Archive', to: '/projects', description: 'Editorial project stories and impact' },
    { label: 'Events & Calendar', to: '/events', description: 'Upcoming meetings and service drives' },
    { label: 'Photo Gallery', to: '/gallery', description: 'Approved photography from club service' },
  ],
};

const HISTORY_GROUP: DropdownGroup = {
  label: 'History',
  items: [
    { label: 'Club History', to: '/history', description: 'Milestones and preserved Leostic years' },
    { label: 'Awards & Achievements', to: '/awards', description: 'District and Multiple District honours' },
    { label: 'Admin Portal', to: '/admin', description: 'Manage projects, board, and publications' },
  ],
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { settings } = useClubData();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) {
        setScrollPct(0);
      } else {
        setScrollPct(Math.min(100, Math.round((y / max) * 100)));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const ringRadius = 19;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - scrollPct / 100);

  return (
    <div className="min-h-screen flex flex-col bg-[#05070D] text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#E8AF25] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#05070D]"
      >
        Skip to main content
      </a>

      {/* Sticky Translucent 3-Zone Header */}
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/15 bg-[#05070D]/92 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl'
            : 'border-white/10 bg-[#05070D]/75 backdrop-blur-md'
        }`}
      >
        {/* Subtle top D7 Plum -> Gold hairline accent */}
        <div
          aria-hidden="true"
          className="h-[2px] w-full bg-gradient-to-r from-[#7A184D] via-[#E8AF25]/80 to-[#3C2399]"
        />

        <div
          ref={navRef}
          className="mx-auto flex h-16 md:h-20 max-w-7xl items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 lg:px-8"
        >
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-3 whitespace-nowrap shrink-0 group"
          >
            <img
              src={BRAND_ASSETS.clubLogoPrimary}
              alt="Leo Club of NIBM logo"
              referrerPolicy="no-referrer"
              className="h-9 w-9 md:h-10 md:w-10 rounded-lg object-contain bg-white p-0.5 ring-1 ring-[#E8AF25]/30 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-display text-base md:text-lg font-bold tracking-tight text-white group-hover:text-[#F3D754] transition-colors whitespace-nowrap shrink-0">
              Leo Club of NIBM
            </span>
          </Link>

          {/* Zone 2: Desktop Navigation (5 concise single-line links/dropdowns) */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7"
          >
            <NavLink to="/" end>
              {({ isActive }) => (
                <span
                  className={`relative inline-block py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-[#F3D754]' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Home
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#E8AF25] to-[#F3D754]"
                    />
                  )}
                </span>
              )}
            </NavLink>

            {[ABOUT_GROUP, INITIATIVES_GROUP, HISTORY_GROUP].map((group) => {
              const isOpen = openMenu === group.label;
              const isGroupActive = group.items.some((item) =>
                location.pathname.startsWith(item.to),
              );
              return (
                <div key={group.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenMenu(isOpen ? null : group.label)}
                    className={`relative inline-flex items-center gap-1 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                      isGroupActive || isOpen
                        ? 'text-[#F3D754]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                    {isGroupActive && (
                      <motion.span
                        layoutId="nav-active-underline"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#E8AF25] to-[#F3D754]"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-0 top-full mt-3 w-76 rounded-2xl border border-white/12 bg-[#0B0F1A]/98 p-2 shadow-2xl backdrop-blur-xl"
                      >
                        {group.items.map((item) => {
                          const itemActive = location.pathname === item.to;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setOpenMenu(null)}
                              className={`block rounded-xl px-3.5 py-2.5 transition-colors ${
                                itemActive
                                  ? 'bg-[#7A184D]/25 border border-[#E8AF25]/30'
                                  : 'hover:bg-white/[0.06] border border-transparent'
                              }`}
                            >
                              <div className={`text-sm font-medium ${itemActive ? 'text-[#F3D754]' : 'text-white'}`}>
                                {item.label}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {item.description}
                              </div>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <NavLink to="/publications">
              {({ isActive }) => (
                <span
                  className={`relative inline-block py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-[#F3D754]' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Magazines
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#E8AF25] to-[#F3D754]"
                    />
                  )}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Zone 3: High-contrast Become a Leo Pill CTA + Mobile Drawer Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/join"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs md:text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] hover:-translate-y-0.5 shadow-sm hover:shadow-[0_6px_20px_rgba(243,215,84,0.28)] transition-all duration-200 whitespace-nowrap shrink-0"
            >
              Become a Leo
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] text-slate-100 hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Animated Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Mobile navigation"
              className="lg:hidden overflow-hidden border-t border-white/10 bg-[#080B13]/98 backdrop-blur-xl px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto"
            >
              {[
                { label: 'Home', to: '/' },
                { label: 'About Us', to: '/about' },
                { label: 'Executive Board', to: '/team' },
                { label: 'Projects Archive', to: '/projects' },
                { label: 'Events & Calendar', to: '/events' },
                { label: 'Photo Gallery', to: '/gallery' },
                { label: 'Magazines & Publications', to: '/publications' },
                { label: 'Club History', to: '/history' },
                { label: 'Awards & Achievements', to: '/awards' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Admin Portal', to: '/admin' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center min-h-[44px] rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#7A184D]/30 border border-[#E8AF25]/35 text-[#F3D754]'
                        : 'text-slate-200 hover:bg-white/[0.05]'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="pt-3 mt-2 border-t border-white/10">
                <Link
                  to="/join"
                  className="flex min-h-[44px] w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] transition-colors"
                >
                  Become a Leo
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Route Body */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Animated Circular Scroll-to-Top Button with SVG Progress Ring */}
      <AnimatePresence>
        {scrollPct > 10 && (
          <motion.button
            type="button"
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll back to top"
            className="fixed bottom-5 left-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#0B0F1A]/92 text-[#F3D754] shadow-2xl backdrop-blur-md hover:bg-[#141A2B] hover:scale-105 transition-all"
          >
            <svg
              aria-hidden="true"
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 44 44"
            >
              <circle
                cx="22"
                cy="22"
                r={ringRadius}
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
              />
              <circle
                cx="22"
                cy="22"
                r={ringRadius}
                fill="none"
                stroke="#F3D754"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-[stroke-dashoffset] duration-150 ease-out"
              />
            </svg>
            <ArrowUp className="relative z-10 w-4 h-4" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Institutional Footer */}
      <footer className="border-t border-white/10 bg-[#04050A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            {/* Brand & Affiliation Summary */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={BRAND_ASSETS.clubLogoPrimary}
                  alt="Leo Club of NIBM logo"
                  referrerPolicy="no-referrer"
                  className="h-12 w-12 rounded-xl object-contain bg-white p-1 border border-white/15"
                />
                <img
                  src={BRAND_ASSETS.nibmLogo}
                  alt="National Institute of Business Management logo"
                  referrerPolicy="no-referrer"
                  className="h-10 w-auto object-contain bg-white/95 rounded-lg px-2 py-1"
                />
              </div>

              <div>
                <h2 className="font-display text-lg font-bold text-white">
                  {settings.clubName}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {settings.institutionName} · {settings.districtName}
                </p>
              </div>

              <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                Empowering NIBM undergraduates through Leadership, Experience, and Opportunity under{' '}
                {settings.multipleDistrictName} and Lions Clubs International.
              </p>

              <p className="text-xs text-slate-500">
                Current Leostic Year:{' '}
                <span className="text-slate-300 tabular-nums">{settings.currentLeosticYear}</span>
              </p>
            </div>

            {/* Club Links */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400">
                Club
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/about" className="hover:text-[#F3D754] transition-colors">About Us</Link></li>
                <li><Link to="/team" className="hover:text-[#F3D754] transition-colors">Executive Board</Link></li>
                <li><Link to="/history" className="hover:text-[#F3D754] transition-colors">Club History</Link></li>
                <li><Link to="/awards" className="hover:text-[#F3D754] transition-colors">Club Awards</Link></li>
              </ul>
            </div>

            {/* Programmes */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400">
                Archive
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><Link to="/projects" className="hover:text-[#F3D754] transition-colors">Projects</Link></li>
                <li><Link to="/events" className="hover:text-[#F3D754] transition-colors">Events</Link></li>
                <li><Link to="/gallery" className="hover:text-[#F3D754] transition-colors">Gallery</Link></li>
                <li><Link to="/publications" className="hover:text-[#F3D754] transition-colors">Magazines</Link></li>
              </ul>
            </div>

            {/* Official Contact & Admin */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-semibold tracking-wider text-slate-400">
                Reach Us
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p className="text-slate-400">
                  {settings.officialEmail || 'Official club email will appear once verified in Site Settings.'}
                </p>
                {settings.officialPhone && (
                  <p className="text-slate-300 tabular-nums">{settings.officialPhone}</p>
                )}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link to="/contact" className="text-sm font-medium text-[#F3D754] hover:underline">
                    Contact Us
                  </Link>
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Admin Portal</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © {new Date().getFullYear()} {settings.clubName}. Affiliated with {settings.districtName}.
            </p>
            <p>Leadership · Experience · Opportunity</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
