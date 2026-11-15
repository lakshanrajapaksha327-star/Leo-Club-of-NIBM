import type { Project, ProjectStatus, UserRole } from '../types/club';

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_DOCUMENT_TYPES = new Set(['application/pdf']);

export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

export interface ParsedVideo {
  provider: 'youtube' | 'vimeo' | 'direct' | 'invalid';
  embedUrl: string | null;
}

export function parseVideoEmbedUrl(rawUrl: string): ParsedVideo {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { provider: 'invalid', embedUrl: null };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { provider: 'invalid', embedUrl: null };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { provider: 'invalid', embedUrl: null };
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const vParam = url.searchParams.get('v');
    if (vParam && /^[a-zA-Z0-9_-]{6,20}$/.test(vParam)) {
      return {
        provider: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${vParam}`,
      };
    }
    const pathMatch = url.pathname.match(/^\/(embed|shorts)\/([a-zA-Z0-9_-]{6,20})/);
    if (pathMatch) {
      return {
        provider: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${pathMatch[2]}`,
      };
    }
    return { provider: 'invalid', embedUrl: null };
  }

  if (host === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '').split('/')[0];
    if (id && /^[a-zA-Z0-9_-]{6,20}$/.test(id)) {
      return {
        provider: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      };
    }
    return { provider: 'invalid', embedUrl: null };
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const match = url.pathname.match(/\/(?:video\/)?(\d{5,15})/);
    if (match) {
      return {
        provider: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
      };
    }
    return { provider: 'invalid', embedUrl: null };
  }

  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url.pathname)) {
    return {
      provider: 'direct',
      embedUrl: trimmed,
    };
  }

  return { provider: 'invalid', embedUrl: null };
}

export interface ProjectFilterOptions {
  search?: string;
  year?: string;
  category?: string;
  status?: ProjectStatus | 'all';
  publicOnly?: boolean;
}

export function filterProjects(projects: Project[], options: ProjectFilterOptions): Project[] {
  const searchTerm = (options.search ?? '').trim().toLowerCase();
  const yearFilter = options.year && options.year !== 'all' ? options.year : null;
  const categoryFilter = options.category && options.category !== 'all' ? options.category : null;
  const statusFilter = options.status && options.status !== 'all' ? options.status : null;
  const publicOnly = options.publicOnly !== false;

  return projects.filter((project) => {
    if (publicOnly && project.publicationStatus !== 'published') {
      return false;
    }
    if (yearFilter && project.leosticYear !== yearFilter) {
      return false;
    }
    if (
      categoryFilter &&
      project.category !== categoryFilter &&
      project.secondaryCategory !== categoryFilter
    ) {
      return false;
    }
    if (statusFilter && project.status !== statusFilter) {
      return false;
    }
    if (searchTerm) {
      const haystack = `${project.title} ${project.summary} ${project.location} ${project.category}`.toLowerCase();
      if (!haystack.includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export function paginateItems<T>(items: T[], visibleCount: number): PaginatedResult<T> {
  const safeCount = Math.max(0, visibleCount);
  const sliced = items.slice(0, safeCount);
  return {
    items: sliced,
    total: items.length,
    hasMore: sliced.length < items.length,
  };
}

export interface FileValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateMediaFile(
  file: { name: string; type: string; size: number },
  kind: 'image' | 'video' | 'document',
): FileValidationResult {
  if (file.size <= 0) {
    return { valid: false, reason: `${file.name} appears to be empty.` };
  }

  if (kind === 'image') {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return { valid: false, reason: `${file.name} must be a JPG, PNG, or WebP image.` };
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return { valid: false, reason: `${file.name} exceeds the 20 MB image limit.` };
    }
    return { valid: true };
  }

  if (kind === 'video') {
    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      return { valid: false, reason: `${file.name} must be an MP4, WebM, or MOV video.` };
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return {
        valid: false,
        reason: `${file.name} exceeds the 100 MB video limit. Use a YouTube or Vimeo link for larger videos.`,
      };
    }
    return { valid: true };
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return { valid: false, reason: `${file.name} must be a PDF document.` };
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { valid: false, reason: `${file.name} exceeds the 25 MB document limit.` };
  }
  return { valid: true };
}

export function canRolePerform(
  role: UserRole | null | undefined,
  action: 'viewAdmin' | 'editContent' | 'publish' | 'manageUsers' | 'delete',
): boolean {
  if (!role) return false;
  switch (action) {
    case 'viewAdmin':
      return ['superAdmin', 'president', 'secretary', 'projectEditor', 'mediaEditor', 'viewer'].includes(role);
    case 'editContent':
      return ['superAdmin', 'president', 'secretary', 'projectEditor', 'mediaEditor'].includes(role);
    case 'publish':
      return ['superAdmin', 'president', 'secretary'].includes(role);
    case 'delete':
      return ['superAdmin', 'president'].includes(role);
    case 'manageUsers':
      return role === 'superAdmin';
    default:
      return false;
  }
}

export interface ValidationErrors {
  [field: string]: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMembershipEnquiry(input: {
  fullName: string;
  email: string;
  programme: string;
  batch: string;
  reason: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }
  if (!EMAIL_REGEX.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (input.programme.trim().length < 2) {
    errors.programme = 'Please specify your NIBM academic programme.';
  }
  if (input.batch.trim().length < 1) {
    errors.batch = 'Please enter your batch or intake.';
  }
  if (input.reason.trim().length < 15) {
    errors.reason = 'Please share a brief note (at least 15 characters) on why you want to join.';
  }
  return errors;
}

export function validateContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};
  if (input.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }
  if (!EMAIL_REGEX.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (input.subject.trim().length < 3) {
    errors.subject = 'Please add a short subject.';
  }
  if (input.message.trim().length < 10) {
    errors.message = 'Please write a message of at least 10 characters.';
  }
  return errors;
}
