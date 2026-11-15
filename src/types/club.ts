export type ProjectStatus = 'planned' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type PublicationStatus = 'draft' | 'submitted' | 'published' | 'archived';

export type MediaType = 'image' | 'video';

export type UserRole =
  | 'superAdmin'
  | 'president'
  | 'secretary'
  | 'projectEditor'
  | 'mediaEditor'
  | 'viewer';

export interface ProjectMedia {
  id: string;
  url: string;
  storagePath?: string;
  thumbnailUrl?: string;
  type: MediaType;
  caption: string;
  altText: string;
  order: number;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectDocument {
  id: string;
  title: string;
  url: string;
  storagePath?: string;
  publicApproved: boolean;
}

export interface ProjectStorySections {
  background?: string;
  need?: string;
  objectives?: string;
  whatWeDid?: string;
  outcomes?: string;
  reflection?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  story: string;
  storySections?: ProjectStorySections;
  category: string;
  secondaryCategory?: string;
  leosticYear: string;
  startDate: string;
  endDate?: string;
  location: string;
  status: ProjectStatus;
  publicationStatus: PublicationStatus;
  coverImage: string;
  coverAlt: string;
  media: ProjectMedia[];
  videoUrls: string[];
  documents?: ProjectDocument[];
  metrics: ProjectMetric[];
  partners: string[];
  projectChair?: string;
  organisers?: string[];
  featured: boolean;
  createdAt?: number;
  updatedAt?: number;
  createdBy?: string;
  updatedBy?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  summary: string;
  date: string;
  endDate?: string;
  location: string;
  leosticYear: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  publicationStatus: PublicationStatus;
  posterUrl?: string;
  registrationUrl?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface Officer {
  id: string;
  name: string;
  position: string;
  leosticYear: string;
  biography?: string;
  photoUrl?: string;
  displayOrder: number;
  visible: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  altText: string;
  order: number;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description?: string;
  leosticYear: string;
  date: string;
  coverUrl: string;
  coverAlt: string;
  photos: GalleryPhoto[];
  publicationStatus: PublicationStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface Publication {
  id: string;
  title: string;
  issue?: string;
  type: 'newsletter' | 'annual-report' | 'bulletin';
  description: string;
  date: string;
  leosticYear: string;
  coverUrl?: string;
  pdfUrl?: string;
  publicationStatus: PublicationStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  date: string;
  leosticYear: string;
  coverUrl?: string;
  publicationStatus: PublicationStatus;
  createdAt?: number;
  updatedAt?: number;
}

export interface Achievement {
  id: string;
  title: string;
  awardBody: string;
  category?: string;
  leosticYear: string;
  date?: string;
  description?: string;
  visible: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface MembershipEnquiry {
  id?: string;
  fullName: string;
  email: string;
  programme: string;
  batch: string;
  reason: string;
  status: 'new' | 'reviewed' | 'contacted' | 'archived';
  createdAt: number;
}

export interface SiteSettings {
  clubName: string;
  institutionName: string;
  districtName: string;
  multipleDistrictName: string;
  currentLeosticYear: string;
  availableYears: string[];
  annualTheme?: string;
  charterDate?: string;
  mission?: string;
  vision?: string;
  clubHistory?: string;
  officialEmail?: string;
  officialPhone?: string;
  campusAddress?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  verifiedImpactMetrics: ProjectMetric[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  active: boolean;
}
