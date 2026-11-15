import type { SiteSettings } from '../types/club';
import demoHeroCampusFellowship from '../assets/images/demo_hero_campus_fellowship_1794747421064.jpg';
import demoHeroCommunityService from '../assets/images/demo_hero_community_service_1794747421646.jpg';
import demoHeroLeadershipGala from '../assets/images/demo_hero_leadership_gala_1794747423035.jpg';

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

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    kicker: 'Leo Club of NIBM · District 306 D7',
    headline: 'Empowering Youth',
    subline: 'Through service and leadership that shapes tomorrow at NIBM, Sri Lanka.',
    image: demoHeroCampusFellowship,
    imageAlt: 'Demo scene of university youth leaders collaborating in a sunlit modern auditorium',
    motionVariant: 'primary' as const,
  },
  {
    id: 'slide-2',
    kicker: 'Leadership · Experience · Opportunity',
    headline: 'Serving With Purpose',
    subline: 'Connecting NIBM undergraduates to community impact across Leo Multiple District 306.',
    image: demoHeroCommunityService,
    imageAlt: 'Demo scene of university volunteers planting trees together in golden hour sunlight',
    motionVariant: 'alt' as const,
  },
  {
    id: 'slide-3',
    kicker: 'Leostic Year 2026/27',
    headline: 'Building Our Legacy',
    subline: 'Documenting real club projects, publications, fellowship, and district excellence.',
    image: demoHeroLeadershipGala,
    imageAlt: 'Demo scene of a university leadership summit hall lit in royal plum and gold',
    motionVariant: 'primary' as const,
  },
] as const;

export const EXECUTIVE_BOARD_ROLES = [
  {
    key: 'president',
    position: 'President',
    initials: 'PR',
    note: 'Upload confirmed portrait & name in Admin → Team',
  },
  {
    key: 'secretary',
    position: 'Secretary',
    initials: 'SC',
    note: 'Upload confirmed portrait & name in Admin → Team',
  },
  {
    key: 'treasurer',
    position: 'Treasurer',
    initials: 'TR',
    note: 'Upload confirmed portrait & name in Admin → Team',
  },
] as const;

export const SERVICE_CATEGORIES = [
  'Community Service',
  'Education & Literacy',
  'Environment & Sustainability',
  'Health & Wellbeing',
  'Youth Leadership',
  'Animal Welfare',
  'Disaster Relief & Support',
  'Club Administration & Fellowship',
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
};
