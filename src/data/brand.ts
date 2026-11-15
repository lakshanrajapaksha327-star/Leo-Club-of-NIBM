import type { HeroSlide, SiteSettings } from '../types/club';
import placeholderArchitecturalPaths from '../assets/images/hero_slide_leadership_1794746748735.jpg';
import placeholderArchitecturalCampus from '../assets/images/hero_slide_service_1794746748611.jpg';
import placeholderArchitecturalRibbon from '../assets/images/hero_slide_legacy_1794746749851.jpg';

export const BOOTSTRAPPED_SUPER_ADMIN_EMAIL = 'lakshanrajapaksha327@gmail.com';

export const BRAND_ASSETS = {
  clubLogoPrimary: '/assets/brand/Leo_Club_of_NIBM_D7_latest.jpeg',
  clubLogoLegacy: '/assets/brand/Leo_Club_of_NIBM_logo_transparent.png',
  officialLockup: '/assets/brand/Leo_NIBM_official_brand_lockup_2026-10-27.jpeg',
  nibmLogo: '/assets/brand/NIBM_logo_transparent.png',
  leoEmblem: '/assets/brand/Leo_Logo.png',
  lionsEmblem: '/assets/brand/Lion_Logo.png',
  md306Logo: '/assets/brand/Leos_of_Sri_Lanka_&_Maldives_Primary_Version.png',
  d7WhiteLogo: '/assets/brand/Leos_of_D7_White_Version.png',
  d7BlackLogo: '/assets/brand/Leos_of_D7_Black_Version.png',
} as const;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    kicker: 'Leo Club of NIBM · District 306 D7',
    headline: 'Empowering Youth',
    subline: 'Through service and leadership that shapes tomorrow at NIBM, Sri Lanka.',
    image: placeholderArchitecturalPaths,
    imageAlt: 'Placeholder — Neutral architectural light-trail backdrop for Leo Club of NIBM',
    isPlaceholder: true,
    motionVariant: 'primary',
  },
  {
    id: 'slide-2',
    kicker: 'Leadership · Experience · Opportunity',
    headline: 'Serving With Purpose',
    subline: 'Connecting NIBM undergraduates to community impact across Leo Multiple District 306.',
    image: placeholderArchitecturalCampus,
    imageAlt: 'Placeholder — Neutral architectural glass facade backdrop in dusk light',
    isPlaceholder: true,
    motionVariant: 'alt',
  },
  {
    id: 'slide-3',
    kicker: 'Leostic Year 2026/27',
    headline: 'Building Our Legacy',
    subline: 'Documenting verified club projects, publications, fellowship, and district excellence.',
    image: placeholderArchitecturalRibbon,
    imageAlt: 'Placeholder — Neutral architectural gold and plum geometric light ribbon backdrop',
    isPlaceholder: true,
    motionVariant: 'primary',
  },
];

export const EXECUTIVE_BOARD_ROLES = [
  {
    key: 'president',
    position: 'President',
    initials: 'PR',
    note: 'Upload confirmed portrait & name in Admin → Executive Board',
  },
  {
    key: 'secretary',
    position: 'Secretary',
    initials: 'SC',
    note: 'Upload confirmed portrait & name in Admin → Executive Board',
  },
  {
    key: 'treasurer',
    position: 'Treasurer',
    initials: 'TR',
    note: 'Upload confirmed portrait & name in Admin → Executive Board',
  },
] as const;

/**
 * 21 Service Causes aligned with Leo Multiple District 306 (Sri Lanka & Maldives).
 * Administrators can add, edit, reorder, or deactivate items via Admin → Taxonomies.
 */
export const SERVICE_CATEGORIES = [
  'Animal Welfare',
  'Clean Water & Sanitation',
  'Community & Rural Development',
  'Crime & Drug Prevention',
  'Cultural & Heritage Preservation',
  'Diabetes Awareness & Screening',
  'Differently Abled & Accessibility Support',
  'Disaster Preparedness & Relief',
  'Education & Literacy',
  'Elderly Care & Senior Citizens',
  'Entrepreneurship & Career Guidance',
  'Environment & Climate Action',
  'Gender Equality & Women Empowerment',
  'Healthcare & Medical Aid',
  'Hunger Relief & Food Security',
  'Mental Health & Wellbeing',
  'Peace, Harmony & Civic Leadership',
  'Pediatric Cancer Support',
  'Public Relations & Leo Branding',
  'Sports & Youth Recreation',
  'Vision & Sight Preservation',
] as const;

export const DEFAULT_AWARD_CATEGORIES = [
  'Most Outstanding Club',
  'Most Outstanding Service Project',
  'Best Club President / Secretary / Treasurer',
  'District & Multiple District Recognition',
  'Club Excellence & Reporting',
  'PR, Publications & Editorial',
] as const;

export const LEO_PILLARS = [
  {
    letter: 'L',
    title: 'Leadership',
    subtitle: 'Lead by example',
    description:
      'Developing young NIBM undergraduates into principled leaders by planning, chairing, and delivering meaningful service initiatives.',
  },
  {
    letter: 'E',
    title: 'Experience',
    subtitle: 'Learn through service',
    description:
      'Gaining hands-on teamwork, governance, communication, and community engagement experience alongside fellow Leos across District 306 D7.',
  },
  {
    letter: 'O',
    title: 'Opportunity',
    subtitle: 'Grow & connect',
    description:
      'Opening doors to personal growth, fellowship across Sri Lanka & Maldives, and lifelong civic impact under Lions Clubs International.',
  },
] as const;

export const AFFILIATION_HIERARCHY = [
  {
    tier: 'International',
    name: 'Lions Clubs International',
    description: 'Global service organisation uniting clubs worldwide under the motto “We Serve”.',
    logo: BRAND_ASSETS.lionsEmblem,
  },
  {
    tier: 'Multiple District',
    name: 'Leo Multiple District 306',
    description: 'National coordinating body for Leo Clubs across Sri Lanka & Maldives.',
    logo: BRAND_ASSETS.md306Logo,
  },
  {
    tier: 'District',
    name: 'Leo District 306 D7',
    description: 'Regional district overseeing campus and community-based Leo Clubs in our jurisdiction.',
    logo: BRAND_ASSETS.d7WhiteLogo,
  },
  {
    tier: 'Club',
    name: 'Leo Club of NIBM',
    description: 'University-based Leo Club at the National Institute of Business Management, Sri Lanka.',
    logo: BRAND_ASSETS.clubLogoPrimary,
  },
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  clubName: 'Leo Club of NIBM',
  institutionName: 'National Institute of Business Management (NIBM), Sri Lanka',
  districtName: 'Leo District 306 D7',
  multipleDistrictName: 'Leo Multiple District 306 (Sri Lanka & Maldives)',
  currentLeosticYear: '2026/27',
  availableYears: ['2026/27', '2025/26', '2024/25'],
  annualTheme: undefined,
  charterDate: undefined,
  mission: undefined,
  vision: undefined,
  clubHistory: undefined,
  officialEmail: undefined,
  officialPhone: undefined,
  campusAddress: 'National Institute of Business Management (NIBM), Sri Lanka',
  socialLinks: {},
  verifiedImpactMetrics: [],
  heroSlides: HERO_SLIDES,
};
