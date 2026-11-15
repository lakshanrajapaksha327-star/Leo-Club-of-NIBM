import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canRolePerform,
  filterProjects,
  generateSlug,
  paginateItems,
  parseVideoEmbedUrl,
  validateContactMessage,
  validateMediaFile,
  validateMembershipEnquiry,
} from './clubLogic';
import type { Project } from '../types/club';

const sampleProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'p1',
  title: 'Test Initiative',
  slug: 'test-initiative',
  summary: 'Summary text',
  story: 'Story text',
  category: 'Community Service',
  leosticYear: '2026/27',
  startDate: '2026-08-10',
  location: 'Colombo 07',
  status: 'completed',
  publicationStatus: 'published',
  coverImage: '/assets/brand/Leo_Club_of_NIBM_D7_latest.jpeg',
  coverAlt: 'Cover',
  media: [],
  videoUrls: [],
  metrics: [],
  partners: [],
  featured: false,
  ...overrides,
});

test('generateSlug normalizes punctuation, spaces, and case', () => {
  assert.equal(generateSlug("Paw Patrol: Bruno's Second Chance!"), 'paw-patrol-brunos-second-chance');
  assert.equal(generateSlug('  NIBM   Green Drive 2026/27  '), 'nibm-green-drive-2026-27');
});

test('parseVideoEmbedUrl handles YouTube, youtu.be, Vimeo, direct video, and rejects invalid URLs', () => {
  assert.deepEqual(parseVideoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), {
    provider: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  });
  assert.deepEqual(parseVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), {
    provider: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  });
  assert.deepEqual(parseVideoEmbedUrl('https://vimeo.com/123456789'), {
    provider: 'vimeo',
    embedUrl: 'https://player.vimeo.com/video/123456789',
  });
  assert.equal(parseVideoEmbedUrl('javascript:alert(1)').provider, 'invalid');
  assert.equal(parseVideoEmbedUrl('not-a-url').provider, 'invalid');
});

test('filterProjects enforces publicOnly and multi-criteria filters', () => {
  const list = [
    sampleProject({ id: '1', title: 'Clean Coast', publicationStatus: 'published', category: 'Environment', leosticYear: '2026/27' }),
    sampleProject({ id: '2', title: 'Draft Drive', publicationStatus: 'draft', category: 'Environment', leosticYear: '2026/27' }),
    sampleProject({ id: '3', title: 'Youth Tech', publicationStatus: 'published', category: 'Youth Development', leosticYear: '2025/26' }),
  ];

  const publicOnly = filterProjects(list, { publicOnly: true });
  assert.equal(publicOnly.length, 2);

  const filtered = filterProjects(list, { publicOnly: true, category: 'Environment', search: 'coast' });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, '1');
});

test('paginateItems slices cleanly and computes hasMore', () => {
  const result = paginateItems([1, 2, 3, 4, 5], 3);
  assert.deepEqual(result.items, [1, 2, 3]);
  assert.equal(result.total, 5);
  assert.equal(result.hasMore, true);
});

test('validateMediaFile enforces JPG/PNG/WebP 20MB and MP4/WebM/MOV 100MB constraints', () => {
  assert.equal(validateMediaFile({ name: 'photo.jpg', type: 'image/jpeg', size: 1024 * 1024 }, 'image').valid, true);
  assert.equal(validateMediaFile({ name: 'huge.png', type: 'image/png', size: 21 * 1024 * 1024 }, 'image').valid, false);
  assert.equal(validateMediaFile({ name: 'bad.gif', type: 'image/gif', size: 1024 }, 'image').valid, false);
  assert.equal(validateMediaFile({ name: 'clip.mp4', type: 'video/mp4', size: 50 * 1024 * 1024 }, 'video').valid, true);
  assert.equal(validateMediaFile({ name: 'too-big.mp4', type: 'video/mp4', size: 105 * 1024 * 1024 }, 'video').valid, false);
});

test('canRolePerform restricts publish and user management appropriately', () => {
  assert.equal(canRolePerform('projectEditor', 'editContent'), true);
  assert.equal(canRolePerform('projectEditor', 'publish'), false);
  assert.equal(canRolePerform('president', 'publish'), true);
  assert.equal(canRolePerform('secretary', 'publish'), true);
  assert.equal(canRolePerform('president', 'manageUsers'), false);
  assert.equal(canRolePerform('superAdmin', 'manageUsers'), true);
  assert.equal(canRolePerform('viewer', 'editContent'), false);
});

test('validateMembershipEnquiry and validateContactMessage catch empty/invalid inputs', () => {
  const emptyEnquiry = validateMembershipEnquiry({
    fullName: '',
    email: 'bad',
    programme: '',
    batch: '',
    reason: 'short',
  });
  assert.ok(emptyEnquiry.fullName);
  assert.ok(emptyEnquiry.email);
  assert.ok(emptyEnquiry.programme);
  assert.ok(emptyEnquiry.batch);
  assert.ok(emptyEnquiry.reason);

  const validEnquiry = validateMembershipEnquiry({
    fullName: 'Kasun Perera',
    email: 'kasun@example.com',
    programme: 'BSc (Hons) Computing',
    batch: '26.1',
    reason: 'I want to contribute to community service projects at NIBM.',
  });
  assert.deepEqual(validEnquiry, {});

  const badContact = validateContactMessage({ name: '', email: 'x', subject: '', message: '' });
  assert.ok(badContact.name && badContact.email && badContact.subject && badContact.message);
});
