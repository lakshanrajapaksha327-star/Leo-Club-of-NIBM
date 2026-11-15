import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DEFAULT_AWARD_CATEGORIES,
  DEFAULT_SITE_SETTINGS,
  SERVICE_CATEGORIES,
} from '../data/brand';
import type {
  Achievement,
  AuditLog,
  ClubEvent,
  ClubYear,
  ContactMessage,
  GalleryAlbum,
  MembershipEnquiry,
  NewsArticle,
  Officer,
  Project,
  Publication,
  SiteSettings,
  TaxonomyItem,
  UserProfile,
} from '../types/club';
import { generateSlug } from '../utils/clubLogic';
import { recordAuditLog } from './auditService';

function toMillis(val: unknown): number | undefined {
  if (val instanceof Timestamp) return val.toMillis();
  if (typeof val === 'number') return val;
  return undefined;
}

function cleanStr(val: string | undefined, max: number): string {
  return (val ?? '').trim().slice(0, max);
}

function cleanOptStr(val: string | undefined, max: number): string | undefined {
  const s = (val ?? '').trim().slice(0, max);
  return s.length > 0 ? s : undefined;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

// ── Public Data Subscriptions ──

export interface PublicStreamCallbacks {
  onSettings: (settings: SiteSettings) => void;
  onProjects: (projects: Project[]) => void;
  onEvents: (events: ClubEvent[]) => void;
  onOfficers: (officers: Officer[]) => void;
  onGalleries: (galleries: GalleryAlbum[]) => void;
  onPublications: (publications: Publication[]) => void;
  onNews: (news: NewsArticle[]) => void;
  onAchievements: (achievements: Achievement[]) => void;
  onClubYears: (years: ClubYear[]) => void;
  onServiceCategories: (items: TaxonomyItem[]) => void;
  onAwardCategories: (items: TaxonomyItem[]) => void;
  onError: (message: string) => void;
}

export function subscribePublicClubStreams(cb: PublicStreamCallbacks): () => void {
  if (!db) return () => {};
  const unsubs: Unsubscribe[] = [];

  // 1. Site Settings
  unsubs.push(
    onSnapshot(
      doc(db, 'siteSettings', 'main'),
      (snap) => {
        if (!snap.exists()) {
          cb.onSettings(DEFAULT_SITE_SETTINGS);
          return;
        }
        const d = snap.data();
        cb.onSettings({
          ...DEFAULT_SITE_SETTINGS,
          clubName: String(d.clubName || DEFAULT_SITE_SETTINGS.clubName),
          institutionName: String(d.institutionName || DEFAULT_SITE_SETTINGS.institutionName),
          districtName: String(d.districtName || DEFAULT_SITE_SETTINGS.districtName),
          multipleDistrictName: String(
            d.multipleDistrictName || DEFAULT_SITE_SETTINGS.multipleDistrictName,
          ),
          currentLeosticYear: String(
            d.currentLeosticYear || DEFAULT_SITE_SETTINGS.currentLeosticYear,
          ),
          availableYears: Array.isArray(d.availableYears) && d.availableYears.length > 0
            ? d.availableYears.map(String)
            : DEFAULT_SITE_SETTINGS.availableYears,
          annualTheme: d.annualTheme ? String(d.annualTheme) : undefined,
          charterDate: d.charterDate ? String(d.charterDate) : undefined,
          mission: d.mission ? String(d.mission) : undefined,
          vision: d.vision ? String(d.vision) : undefined,
          clubHistory: d.clubHistory ? String(d.clubHistory) : undefined,
          officialEmail: d.officialEmail ? String(d.officialEmail) : undefined,
          officialPhone: d.officialPhone ? String(d.officialPhone) : undefined,
          campusAddress: d.campusAddress ? String(d.campusAddress) : undefined,
          socialLinks: (d.socialLinks as SiteSettings['socialLinks']) || {},
          verifiedImpactMetrics: Array.isArray(d.verifiedImpactMetrics)
            ? d.verifiedImpactMetrics
            : [],
          heroSlides:
            Array.isArray(d.heroSlides) && d.heroSlides.length > 0
              ? d.heroSlides
              : DEFAULT_SITE_SETTINGS.heroSlides,
          privacyUpdatedAt: d.privacyUpdatedAt ? String(d.privacyUpdatedAt) : undefined,
          updatedAt: toMillis(d.updatedAt),
          updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
        });
      },
      (err) => {
        console.warn('siteSettings listener error:', err);
        cb.onSettings(DEFAULT_SITE_SETTINGS);
      },
    ),
  );

  // 2. Published Projects
  unsubs.push(
    onSnapshot(
      query(
        collection(db, 'projects'),
        where('publicationStatus', '==', 'published'),
        orderBy('startDate', 'desc'),
      ),
      (snap) => {
        cb.onProjects(snap.docs.map((d) => mapProjectDoc(d.id, d.data())));
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 3. Published Events
  unsubs.push(
    onSnapshot(
      query(
        collection(db, 'events'),
        where('publicationStatus', '==', 'published'),
        orderBy('date', 'asc'),
      ),
      (snap) => {
        cb.onEvents(snap.docs.map((d) => mapEventDoc(d.id, d.data())));
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 4. Visible Officers
  unsubs.push(
    onSnapshot(
      query(
        collection(db, 'officers'),
        where('visible', '==', true),
        orderBy('displayOrder', 'asc'),
      ),
      (snap) => {
        cb.onOfficers(snap.docs.map((d) => mapOfficerDoc(d.id, d.data())));
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 5. Published Gallery Albums
  unsubs.push(
    onSnapshot(
      query(
        collection(db, 'galleryAlbums'),
        where('publicationStatus', '==', 'published'),
      ),
      (snap) => {
        const items = snap.docs
          .map((d) => mapGalleryDoc(d.id, d.data()))
          .sort((a, b) => b.date.localeCompare(a.date));
        cb.onGalleries(items);
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 6. Published Publications
  unsubs.push(
    onSnapshot(
      query(
        collection(db, 'publications'),
        where('publicationStatus', '==', 'published'),
        orderBy('date', 'desc'),
      ),
      (snap) => {
        cb.onPublications(snap.docs.map((d) => mapPublicationDoc(d.id, d.data())));
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 7. Published News
  unsubs.push(
    onSnapshot(
      query(
        collection(db, 'news'),
        where('publicationStatus', '==', 'published'),
        orderBy('date', 'desc'),
      ),
      (snap) => {
        cb.onNews(snap.docs.map((d) => mapNewsDoc(d.id, d.data())));
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 8. Visible Achievements
  unsubs.push(
    onSnapshot(
      query(collection(db, 'achievements'), where('visible', '==', true)),
      (snap) => {
        const rows = snap.docs
          .map((d) => mapAchievementDoc(d.id, d.data()))
          .sort((a, b) => b.leosticYear.localeCompare(a.leosticYear));
        cb.onAchievements(rows);
      },
      (err) => {
        cb.onError(err.message);
      },
    ),
  );

  // 9. Club Years
  unsubs.push(
    onSnapshot(
      query(collection(db, 'clubYears'), orderBy('year', 'desc')),
      (snap) => {
        cb.onClubYears(snap.docs.map((d) => mapClubYearDoc(d.id, d.data())));
      },
      () => cb.onClubYears([]),
    ),
  );

  // 10. Service Categories (fallback to 21 MD 306 defaults if collection empty)
  unsubs.push(
    onSnapshot(
      query(collection(db, 'serviceCategories'), orderBy('order', 'asc')),
      (snap) => {
        if (snap.empty) {
          cb.onServiceCategories(
            SERVICE_CATEGORIES.map((name, idx) => ({
              id: `default-service-${idx + 1}`,
              name,
              order: idx + 1,
              active: true,
            })),
          );
          return;
        }
        cb.onServiceCategories(snap.docs.map((d) => mapTaxonomyDoc(d.id, d.data())));
      },
      () => {},
    ),
  );

  // 11. Award Categories
  unsubs.push(
    onSnapshot(
      query(collection(db, 'awardCategories'), orderBy('order', 'asc')),
      (snap) => {
        if (snap.empty) {
          cb.onAwardCategories(
            DEFAULT_AWARD_CATEGORIES.map((name, idx) => ({
              id: `default-award-${idx + 1}`,
              name,
              order: idx + 1,
              active: true,
            })),
          );
          return;
        }
        cb.onAwardCategories(snap.docs.map((d) => mapTaxonomyDoc(d.id, d.data())));
      },
      () => {},
    ),
  );

  return () => {
    unsubs.forEach((fn) => fn());
  };
}

// ── Mappers ──

function mapProjectDoc(id: string, d: Record<string, unknown>): Project {
  return {
    id,
    title: String(d.title || ''),
    slug: String(d.slug || ''),
    summary: String(d.summary || ''),
    story: String(d.story || ''),
    storySections: (d.storySections as Project['storySections']) || undefined,
    category: String(d.category || SERVICE_CATEGORIES[0]),
    secondaryCategory: d.secondaryCategory ? String(d.secondaryCategory) : undefined,
    leosticYear: String(d.leosticYear || '2026/27'),
    startDate: String(d.startDate || ''),
    endDate: d.endDate ? String(d.endDate) : undefined,
    location: String(d.location || ''),
    status: (d.status as Project['status']) || 'planned',
    publicationStatus: (d.publicationStatus as Project['publicationStatus']) || 'draft',
    coverImage: String(d.coverImage || ''),
    coverAlt: String(d.coverAlt || ''),
    media: Array.isArray(d.media) ? (d.media as Project['media']) : [],
    videoUrls: Array.isArray(d.videoUrls) ? d.videoUrls.map(String) : [],
    documents: Array.isArray(d.documents) ? (d.documents as Project['documents']) : undefined,
    metrics: Array.isArray(d.metrics) ? (d.metrics as Project['metrics']) : [],
    partners: Array.isArray(d.partners) ? d.partners.map(String) : [],
    projectChair: d.projectChair ? String(d.projectChair) : undefined,
    organisers: Array.isArray(d.organisers) ? d.organisers.map(String) : undefined,
    participatingLeos: d.participatingLeos ? String(d.participatingLeos) : undefined,
    beneficiaries: d.beneficiaries ? String(d.beneficiaries) : undefined,
    volunteerHours: d.volunteerHours ? String(d.volunteerHours) : undefined,
    fundsDisplayApproved:
      typeof d.fundsDisplayApproved === 'boolean' ? d.fundsDisplayApproved : undefined,
    evidenceNote: d.evidenceNote ? String(d.evidenceNote) : undefined,
    reviewNote: d.reviewNote ? String(d.reviewNote) : undefined,
    reviewedBy: d.reviewedBy ? String(d.reviewedBy) : undefined,
    reviewedAt: d.reviewedAt ? String(d.reviewedAt) : undefined,
    publishedAt: d.publishedAt ? String(d.publishedAt) : undefined,
    featured: Boolean(d.featured),
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapEventDoc(id: string, d: Record<string, unknown>): ClubEvent {
  return {
    id,
    title: String(d.title || ''),
    summary: String(d.summary || ''),
    date: String(d.date || ''),
    endDate: d.endDate ? String(d.endDate) : undefined,
    location: String(d.location || ''),
    leosticYear: String(d.leosticYear || '2026/27'),
    status: (d.status as ClubEvent['status']) || 'upcoming',
    publicationStatus: (d.publicationStatus as ClubEvent['publicationStatus']) || 'draft',
    posterUrl: d.posterUrl ? String(d.posterUrl) : undefined,
    registrationUrl: d.registrationUrl ? String(d.registrationUrl) : undefined,
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapOfficerDoc(id: string, d: Record<string, unknown>): Officer {
  return {
    id,
    name: String(d.name || ''),
    position: String(d.position || ''),
    leosticYear: String(d.leosticYear || '2026/27'),
    biography: d.biography ? String(d.biography) : undefined,
    photoUrl: d.photoUrl ? String(d.photoUrl) : undefined,
    displayOrder: typeof d.displayOrder === 'number' ? d.displayOrder : 1,
    visible: Boolean(d.visible),
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapGalleryDoc(id: string, d: Record<string, unknown>): GalleryAlbum {
  return {
    id,
    title: String(d.title || ''),
    description: d.description ? String(d.description) : undefined,
    leosticYear: String(d.leosticYear || '2026/27'),
    date: String(d.date || ''),
    coverUrl: String(d.coverUrl || ''),
    coverAlt: String(d.coverAlt || ''),
    photos: Array.isArray(d.photos) ? (d.photos as GalleryAlbum['photos']) : [],
    consentConfirmed: Boolean(d.consentConfirmed),
    publicationStatus: (d.publicationStatus as GalleryAlbum['publicationStatus']) || 'draft',
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapPublicationDoc(id: string, d: Record<string, unknown>): Publication {
  return {
    id,
    title: String(d.title || ''),
    issue: d.issue ? String(d.issue) : undefined,
    type: (d.type as Publication['type']) || 'newsletter',
    description: String(d.description || ''),
    date: String(d.date || ''),
    leosticYear: String(d.leosticYear || '2026/27'),
    coverUrl: d.coverUrl ? String(d.coverUrl) : undefined,
    pdfUrl: d.pdfUrl ? String(d.pdfUrl) : undefined,
    publicationStatus: (d.publicationStatus as Publication['publicationStatus']) || 'draft',
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapNewsDoc(id: string, d: Record<string, unknown>): NewsArticle {
  return {
    id,
    title: String(d.title || ''),
    slug: String(d.slug || ''),
    excerpt: String(d.excerpt || ''),
    body: String(d.body || ''),
    date: String(d.date || ''),
    leosticYear: String(d.leosticYear || '2026/27'),
    coverUrl: d.coverUrl ? String(d.coverUrl) : undefined,
    publicationStatus: (d.publicationStatus as NewsArticle['publicationStatus']) || 'draft',
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapAchievementDoc(id: string, d: Record<string, unknown>): Achievement {
  return {
    id,
    title: String(d.title || ''),
    awardBody: String(d.awardBody || ''),
    category: d.category ? String(d.category) : undefined,
    leosticYear: String(d.leosticYear || '2026/27'),
    date: d.date ? String(d.date) : undefined,
    description: d.description ? String(d.description) : undefined,
    visible: Boolean(d.visible),
    createdBy: d.createdBy ? String(d.createdBy) : undefined,
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

function mapClubYearDoc(id: string, d: Record<string, unknown>): ClubYear {
  return {
    id,
    year: String(d.year || ''),
    theme: d.theme ? String(d.theme) : undefined,
    status: (d.status as ClubYear['status']) || 'active',
    startDate: d.startDate ? String(d.startDate) : undefined,
    endDate: d.endDate ? String(d.endDate) : undefined,
    summary: d.summary ? String(d.summary) : undefined,
    isCurrent: Boolean(d.isCurrent),
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
    updatedBy: d.updatedBy ? String(d.updatedBy) : undefined,
  };
}

function mapTaxonomyDoc(id: string, d: Record<string, unknown>): TaxonomyItem {
  return {
    id,
    name: String(d.name || ''),
    description: d.description ? String(d.description) : undefined,
    order: typeof d.order === 'number' ? d.order : 1,
    active: Boolean(d.active),
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

// ── Admin Live Subscriptions (all statuses / private records) ──

export function subscribeAdminAllCollections(params: {
  canReadPrivateInquiries: boolean;
  onProjects: (items: Project[]) => void;
  onEvents: (items: ClubEvent[]) => void;
  onOfficers: (items: Officer[]) => void;
  onGalleries: (items: GalleryAlbum[]) => void;
  onPublications: (items: Publication[]) => void;
  onNews: (items: NewsArticle[]) => void;
  onAchievements: (items: Achievement[]) => void;
  onEnquiries: (items: MembershipEnquiry[]) => void;
  onMessages: (items: ContactMessage[]) => void;
  onAuditLogs: (items: AuditLog[]) => void;
  onError: (msg: string) => void;
}): () => void {
  if (!db) return () => {};
  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      query(collection(db, 'projects'), orderBy('updatedAt', 'desc')),
      (snap) => params.onProjects(snap.docs.map((d) => mapProjectDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'events'), orderBy('date', 'desc')),
      (snap) => params.onEvents(snap.docs.map((d) => mapEventDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'officers'), orderBy('displayOrder', 'asc')),
      (snap) => params.onOfficers(snap.docs.map((d) => mapOfficerDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'galleryAlbums'), orderBy('date', 'desc')),
      (snap) => params.onGalleries(snap.docs.map((d) => mapGalleryDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'publications'), orderBy('date', 'desc')),
      (snap) => params.onPublications(snap.docs.map((d) => mapPublicationDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'news'), orderBy('date', 'desc')),
      (snap) => params.onNews(snap.docs.map((d) => mapNewsDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'achievements'), orderBy('leosticYear', 'desc')),
      (snap) => params.onAchievements(snap.docs.map((d) => mapAchievementDoc(d.id, d.data()))),
      (err) => params.onError(err.message),
    ),
  );

  if (params.canReadPrivateInquiries) {
    unsubs.push(
      onSnapshot(
        query(collection(db, 'membershipEnquiries'), orderBy('createdAt', 'desc')),
        (snap) =>
          params.onEnquiries(
            snap.docs.map((d) => {
              const raw = d.data();
              return {
                id: d.id,
                fullName: String(raw.fullName || ''),
                email: String(raw.email || ''),
                programme: String(raw.programme || ''),
                batch: String(raw.batch || ''),
                reason: String(raw.reason || ''),
                consentAccepted: Boolean(raw.consentAccepted),
                status: (raw.status as MembershipEnquiry['status']) || 'new',
                internalNotes: raw.internalNotes ? String(raw.internalNotes) : undefined,
                createdAt: toMillis(raw.createdAt) || Date.now(),
                updatedAt: toMillis(raw.updatedAt),
              };
            }),
          ),
        (err) => params.onError(err.message),
      ),
    );
    unsubs.push(
      onSnapshot(
        query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc')),
        (snap) =>
          params.onMessages(
            snap.docs.map((d) => {
              const raw = d.data();
              return {
                id: d.id,
                name: String(raw.name || ''),
                email: String(raw.email || ''),
                subject: String(raw.subject || ''),
                message: String(raw.message || ''),
                consentAccepted: Boolean(raw.consentAccepted),
                status: (raw.status as ContactMessage['status']) || 'new',
                internalNotes: raw.internalNotes ? String(raw.internalNotes) : undefined,
                createdAt: toMillis(raw.createdAt) || Date.now(),
                updatedAt: toMillis(raw.updatedAt),
              };
            }),
          ),
        (err) => params.onError(err.message),
      ),
    );
    unsubs.push(
      onSnapshot(
        query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100)),
        (snap) =>
          params.onAuditLogs(
            snap.docs.map((d) => {
              const raw = d.data();
              return {
                id: d.id,
                actorUid: String(raw.actorUid || ''),
                actorEmail: String(raw.actorEmail || ''),
                actorRole: String(raw.actorRole || ''),
                action: String(raw.action || ''),
                entityType: String(raw.entityType || ''),
                entityId: String(raw.entityId || ''),
                summary: String(raw.summary || ''),
                createdAt: toMillis(raw.createdAt) || Date.now(),
              };
            }),
          ),
        (err) => params.onError(err.message),
      ),
    );
  }

  return () => {
    unsubs.forEach((fn) => fn());
  };
}

// ── Slug Collision Guard ──

async function ensureUniqueSlug(
  collectionName: 'projects' | 'news',
  candidateSlug: string,
  ignoreDocId?: string,
): Promise<string> {
  if (!db) return candidateSlug;
  const base = generateSlug(candidateSlug) || `${collectionName}-${Date.now()}`;
  const snap = await getDocs(query(collection(db, collectionName), where('slug', '==', base)));
  const conflict = snap.docs.some((d) => d.id !== ignoreDocId);
  if (!conflict) return base;
  return `${base.slice(0, 84)}-${Date.now().toString(36)}`;
}

// ── CRUD Operations ──

export async function saveSiteSettings(
  actor: UserProfile,
  next: SiteSettings,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = 'siteSettings/main';
  const payload = stripUndefined({
    clubName: cleanStr(next.clubName, 120) || DEFAULT_SITE_SETTINGS.clubName,
    institutionName: cleanStr(next.institutionName, 180) || DEFAULT_SITE_SETTINGS.institutionName,
    districtName: cleanStr(next.districtName, 120) || DEFAULT_SITE_SETTINGS.districtName,
    multipleDistrictName:
      cleanStr(next.multipleDistrictName, 140) || DEFAULT_SITE_SETTINGS.multipleDistrictName,
    currentLeosticYear: cleanStr(next.currentLeosticYear, 20) || '2026/27',
    availableYears:
      next.availableYears.length > 0
        ? next.availableYears.slice(0, 30)
        : DEFAULT_SITE_SETTINGS.availableYears,
    annualTheme: cleanOptStr(next.annualTheme, 200),
    charterDate: cleanOptStr(next.charterDate, 60),
    mission: cleanOptStr(next.mission, 2000),
    vision: cleanOptStr(next.vision, 2000),
    clubHistory: cleanOptStr(next.clubHistory, 10000),
    officialEmail: cleanOptStr(next.officialEmail, 160),
    officialPhone: cleanOptStr(next.officialPhone, 40),
    campusAddress: cleanOptStr(next.campusAddress, 300),
    socialLinks: next.socialLinks || {},
    verifiedImpactMetrics: (next.verifiedImpactMetrics || []).slice(0, 20),
    heroSlides: (next.heroSlides || []).slice(0, 10),
    privacyUpdatedAt: cleanOptStr(next.privacyUpdatedAt, 40),
    updatedAt: serverTimestamp(),
    updatedBy: actor.uid,
  });

  try {
    await setDoc(doc(db, 'siteSettings', 'main'), payload);
    await recordAuditLog({
      actor,
      action: 'settings.update',
      entityType: 'siteSettings',
      entityId: 'main',
      summary: `Updated global Site Settings (${payload.currentLeosticYear})`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveProject(
  actor: UserProfile,
  input: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> & {
    id?: string;
    createdBy?: string;
  },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const safeSlug = await ensureUniqueSlug('projects', input.slug || input.title, input.id);
  const payload = stripUndefined({
    title: cleanStr(input.title, 180),
    slug: safeSlug,
    summary: cleanStr(input.summary, 600),
    story: cleanStr(input.story, 20000),
    storySections: input.storySections,
    category: cleanStr(input.category, 120),
    secondaryCategory: cleanOptStr(input.secondaryCategory, 120),
    leosticYear: cleanStr(input.leosticYear, 20),
    startDate: cleanStr(input.startDate, 40),
    endDate: cleanOptStr(input.endDate, 40),
    location: cleanStr(input.location, 180),
    status: input.status,
    publicationStatus: input.publicationStatus,
    coverImage: cleanStr(input.coverImage, 1000),
    coverAlt: cleanStr(input.coverAlt, 300),
    media: (input.media || []).slice(0, 40),
    videoUrls: (input.videoUrls || []).slice(0, 12),
    documents: input.documents ? input.documents.slice(0, 20) : undefined,
    metrics: (input.metrics || []).slice(0, 12),
    partners: (input.partners || []).slice(0, 20),
    projectChair: cleanOptStr(input.projectChair, 140),
    organisers: input.organisers ? input.organisers.slice(0, 40) : undefined,
    participatingLeos: cleanOptStr(input.participatingLeos, 60),
    beneficiaries: cleanOptStr(input.beneficiaries, 60),
    volunteerHours: cleanOptStr(input.volunteerHours, 60),
    fundsDisplayApproved:
      typeof input.fundsDisplayApproved === 'boolean' ? input.fundsDisplayApproved : undefined,
    evidenceNote: cleanOptStr(input.evidenceNote, 1000),
    reviewNote: cleanOptStr(input.reviewNote, 1000),
    reviewedBy: cleanOptStr(input.reviewedBy, 128),
    reviewedAt: cleanOptStr(input.reviewedAt, 40),
    publishedAt:
      input.publicationStatus === 'published'
        ? cleanOptStr(input.publishedAt, 40) || new Date().toISOString().slice(0, 10)
        : cleanOptStr(input.publishedAt, 40),
    featured: Boolean(input.featured),
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });

  if (input.id) {
    const path = `projects/${input.id}`;
    try {
      await updateDoc(doc(db, 'projects', input.id), payload);
      await recordAuditLog({
        actor,
        action: `project.update.${input.publicationStatus}`,
        entityType: 'projects',
        entityId: input.id,
        summary: `Updated project "${payload.title}" (${input.publicationStatus})`,
      });
      return input.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    const path = 'projects';
    try {
      const ref = await addDoc(collection(db, 'projects'), {
        ...payload,
        createdBy: actor.uid,
        createdAt: serverTimestamp(),
      });
      await recordAuditLog({
        actor,
        action: `project.create.${input.publicationStatus}`,
        entityType: 'projects',
        entityId: ref.id,
        summary: `Created project "${payload.title}" (${input.publicationStatus})`,
      });
      return ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export async function deleteProject(actor: UserProfile, id: string, title: string): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
    await recordAuditLog({
      actor,
      action: 'project.delete',
      entityType: 'projects',
      entityId: id,
      summary: `Deleted project "${title}"`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveEvent(
  actor: UserProfile,
  input: Omit<ClubEvent, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const payload = stripUndefined({
    title: cleanStr(input.title, 180),
    summary: cleanStr(input.summary, 1200),
    date: cleanStr(input.date, 40),
    endDate: cleanOptStr(input.endDate, 40),
    location: cleanStr(input.location, 180),
    leosticYear: cleanStr(input.leosticYear, 20),
    status: input.status,
    publicationStatus: input.publicationStatus,
    posterUrl: cleanOptStr(input.posterUrl, 1000),
    registrationUrl: cleanOptStr(input.registrationUrl, 1000),
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  return saveGenericEntity(actor, 'events', input.id, payload, `event "${payload.title}"`);
}

export async function saveOfficer(
  actor: UserProfile,
  input: Omit<Officer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const payload = stripUndefined({
    name: cleanStr(input.name, 140),
    position: cleanStr(input.position, 120),
    leosticYear: cleanStr(input.leosticYear, 20),
    biography: cleanOptStr(input.biography, 1200),
    photoUrl: cleanOptStr(input.photoUrl, 1000),
    displayOrder: Number.isFinite(input.displayOrder) ? input.displayOrder : 1,
    visible: Boolean(input.visible),
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  return saveGenericEntity(actor, 'officers', input.id, payload, `officer "${payload.name}"`);
}

export async function saveGalleryAlbum(
  actor: UserProfile,
  input: Omit<GalleryAlbum, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const payload = stripUndefined({
    title: cleanStr(input.title, 160),
    description: cleanOptStr(input.description, 1000),
    leosticYear: cleanStr(input.leosticYear, 20),
    date: cleanStr(input.date, 40),
    coverUrl: cleanStr(input.coverUrl, 1000),
    coverAlt: cleanStr(input.coverAlt, 300),
    photos: (input.photos || []).slice(0, 60),
    consentConfirmed: Boolean(input.consentConfirmed),
    publicationStatus: input.publicationStatus,
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  return saveGenericEntity(actor, 'galleryAlbums', input.id, payload, `album "${payload.title}"`);
}

export async function savePublication(
  actor: UserProfile,
  input: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const payload = stripUndefined({
    title: cleanStr(input.title, 180),
    issue: cleanOptStr(input.issue, 80),
    type: input.type,
    description: cleanStr(input.description, 1000),
    date: cleanStr(input.date, 40),
    leosticYear: cleanStr(input.leosticYear, 20),
    coverUrl: cleanOptStr(input.coverUrl, 1000),
    pdfUrl: cleanOptStr(input.pdfUrl, 1000),
    publicationStatus: input.publicationStatus,
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  return saveGenericEntity(
    actor,
    'publications',
    input.id,
    payload,
    `publication "${payload.title}"`,
  );
}

export async function saveNewsArticle(
  actor: UserProfile,
  input: Omit<NewsArticle, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const safeSlug = await ensureUniqueSlug('news', input.slug || input.title, input.id);
  const payload = stripUndefined({
    title: cleanStr(input.title, 180),
    slug: safeSlug,
    excerpt: cleanStr(input.excerpt, 500),
    body: cleanStr(input.body, 20000),
    date: cleanStr(input.date, 40),
    leosticYear: cleanStr(input.leosticYear, 20),
    coverUrl: cleanOptStr(input.coverUrl, 1000),
    publicationStatus: input.publicationStatus,
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  return saveGenericEntity(actor, 'news', input.id, payload, `news "${payload.title}"`);
}

export async function saveAchievement(
  actor: UserProfile,
  input: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const payload = stripUndefined({
    title: cleanStr(input.title, 180),
    awardBody: cleanStr(input.awardBody, 160),
    category: cleanOptStr(input.category, 120),
    leosticYear: cleanStr(input.leosticYear, 20),
    date: cleanOptStr(input.date, 40),
    description: cleanOptStr(input.description, 1500),
    visible: Boolean(input.visible),
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  return saveGenericEntity(actor, 'achievements', input.id, payload, `award "${payload.title}"`);
}

export async function saveClubYear(
  actor: UserProfile,
  input: Omit<ClubYear, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const docId = input.id || input.year.replace(/[^a-zA-Z0-9_-]/g, '-');
  const payload = stripUndefined({
    year: cleanStr(input.year, 20),
    theme: cleanOptStr(input.theme, 200),
    status: input.status,
    startDate: cleanOptStr(input.startDate, 40),
    endDate: cleanOptStr(input.endDate, 40),
    summary: cleanOptStr(input.summary, 3000),
    isCurrent: Boolean(input.isCurrent),
    updatedBy: actor.uid,
    updatedAt: serverTimestamp(),
  });
  const path = `clubYears/${docId}`;
  try {
    await setDoc(doc(db, 'clubYears', docId), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    await recordAuditLog({
      actor,
      action: 'clubYear.save',
      entityType: 'clubYears',
      entityId: docId,
      summary: `Saved Leostic year ${payload.year}`,
    });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveTaxonomyItem(
  actor: UserProfile,
  collectionName: 'serviceCategories' | 'awardCategories',
  input: Omit<TaxonomyItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  const isCustomExisting = input.id && !input.id.startsWith('default-');
  const docId = isCustomExisting
    ? input.id!
    : generateSlug(input.name) || `${collectionName}-${Date.now()}`;
  const payload = stripUndefined({
    name: cleanStr(input.name, 120),
    description: cleanOptStr(input.description, 400),
    order: Number.isFinite(input.order) ? input.order : 1,
    active: Boolean(input.active),
    updatedAt: serverTimestamp(),
  });
  const path = `${collectionName}/${docId}`;
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    await recordAuditLog({
      actor,
      action: `${collectionName}.save`,
      entityType: collectionName,
      entityId: docId,
      summary: `Saved ${collectionName} item "${payload.name}"`,
    });
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateEnquiryStatus(
  actor: UserProfile,
  collectionName: 'membershipEnquiries' | 'contactMessages',
  id: string,
  status: string,
  internalNotes?: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `${collectionName}/${id}`;
  try {
    await updateDoc(
      doc(db, collectionName, id),
      stripUndefined({
        status,
        internalNotes: cleanOptStr(internalNotes, 1000),
        updatedAt: serverTimestamp(),
      }),
    );
    await recordAuditLog({
      actor,
      action: `${collectionName}.statusUpdate`,
      entityType: collectionName,
      entityId: id,
      summary: `Updated ${collectionName} (${id}) to status=${status}`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCollectionRecord(
  actor: UserProfile,
  collectionName:
    | 'events'
    | 'officers'
    | 'galleryAlbums'
    | 'publications'
    | 'news'
    | 'achievements'
    | 'clubYears'
    | 'membershipEnquiries'
    | 'contactMessages'
    | 'serviceCategories'
    | 'awardCategories',
  id: string,
  label: string,
): Promise<void> {
  if (!db) throw new Error('Firestore is not configured.');
  const path = `${collectionName}/${id}`;
  try {
    await deleteDoc(doc(db, collectionName, id));
    await recordAuditLog({
      actor,
      action: `${collectionName}.delete`,
      entityType: collectionName,
      entityId: id,
      summary: `Deleted ${collectionName} record "${label}"`,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

async function saveGenericEntity(
  actor: UserProfile,
  collectionName: string,
  id: string | undefined,
  payload: Record<string, unknown>,
  label: string,
): Promise<string> {
  if (!db) throw new Error('Firestore is not configured.');
  if (id) {
    const path = `${collectionName}/${id}`;
    try {
      await updateDoc(doc(db, collectionName, id), payload);
      await recordAuditLog({
        actor,
        action: `${collectionName}.update`,
        entityType: collectionName,
        entityId: id,
        summary: `Updated ${label}`,
      });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  } else {
    try {
      const ref = await addDoc(collection(db, collectionName), {
        ...payload,
        createdBy: actor.uid,
        createdAt: serverTimestamp(),
      });
      await recordAuditLog({
        actor,
        action: `${collectionName}.create`,
        entityType: collectionName,
        entityId: ref.id,
        summary: `Created ${label}`,
      });
      return ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, collectionName);
    }
  }
}
