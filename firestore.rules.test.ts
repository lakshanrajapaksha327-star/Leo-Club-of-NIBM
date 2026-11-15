/**
 * Firestore Security Rules Emulator Test Suite ("Dirty Dozen" + Positive Paths)
 *
 * Run against Firebase Local Emulator Suite in CI / local dev with Java installed:
 *   npm install -D @firebase/rules-unit-testing
 *   firebase emulators:exec --only firestore "npx tsx --test firestore.rules.test.ts"
 */
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

interface EmulatorFirestoreDoc {
  set(data: Record<string, unknown>): Promise<unknown>;
  update(data: Record<string, unknown>): Promise<unknown>;
  get(): Promise<unknown>;
  delete(): Promise<unknown>;
}

interface EmulatorFirestoreCollection {
  get(): Promise<unknown>;
  add(data: Record<string, unknown>): Promise<unknown>;
}

interface EmulatorFirestore {
  doc(path: string): EmulatorFirestoreDoc;
  collection(path: string): EmulatorFirestoreCollection;
}

interface RulesTestContext {
  firestore(): EmulatorFirestore;
}

interface RulesTestEnvironment {
  withSecurityRulesDisabled(fn: (ctx: RulesTestContext) => Promise<void>): Promise<void>;
  unauthenticatedContext(): RulesTestContext;
  authenticatedContext(uid: string, tokenOptions?: Record<string, unknown>): RulesTestContext;
  cleanup(): Promise<void>;
}

interface RulesUnitTestingModule {
  initializeTestEnvironment(config: {
    projectId: string;
    firestore: { rules: string };
  }): Promise<RulesTestEnvironment>;
  assertFails(pr: Promise<unknown>): Promise<unknown>;
  assertSucceeds(pr: Promise<unknown>): Promise<unknown>;
}

async function loadEmulatorSuite(): Promise<RulesUnitTestingModule | null> {
  try {
    const pkgName = '@firebase/rules-unit-testing';
    return (await import(pkgName)) as RulesUnitTestingModule;
  } catch {
    return null;
  }
}

test('Firestore Rules Dirty Dozen Adversarial Suite (Emulator)', async (t) => {
  const rut = await loadEmulatorSuite();
  if (!rut) {
    t.skip('@firebase/rules-unit-testing and Firebase Java Emulator are required to run live rule assertions.');
    return;
  }

  const { initializeTestEnvironment, assertFails, assertSucceeds } = rut;
  const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId: 'leo-nibm-rules-test',
    firestore: { rules },
  });

  const superAdminUid = 'uid-superadmin';
  const editorUid = 'uid-editor';
  const outsiderUid = 'uid-outsider';

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    const now = new Date();
    await db.doc(`users/${superAdminUid}`).set({
      uid: superAdminUid,
      email: 'lakshanrajapaksha327@gmail.com',
      role: 'superAdmin',
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    await db.doc(`users/${editorUid}`).set({
      uid: editorUid,
      email: 'editor@nibm.lk',
      role: 'projectEditor',
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    await db.doc('projects/draft-proj').set({
      title: 'Confidential Draft Project',
      slug: 'confidential-draft-project',
      summary: 'Pending executive review before publication.',
      story: 'Internal project notes',
      category: 'Education & Literacy',
      leosticYear: '2026/27',
      startDate: '2026-08-12',
      location: 'NIBM Colombo',
      status: 'planned',
      publicationStatus: 'draft',
      coverImage: '',
      coverAlt: '',
      media: [],
      videoUrls: [],
      metrics: [],
      partners: [],
      featured: false,
      createdBy: editorUid,
      updatedBy: editorUid,
      createdAt: now,
      updatedAt: now,
    });
    await db.doc('membershipEnquiries/enq-1').set({
      fullName: 'Applicant Example',
      email: 'applicant@example.com',
      programme: 'BSc Computing',
      batch: '26.1',
      reason: 'Interested in serving with Leo Club of NIBM.',
      consentAccepted: true,
      status: 'new',
      createdAt: now,
    });
    await db.doc('auditLogs/log-1').set({
      actorUid: superAdminUid,
      actorEmail: 'lakshanrajapaksha327@gmail.com',
      actorRole: 'superAdmin',
      action: 'create',
      entityType: 'project',
      entityId: 'draft-proj',
      summary: 'Seed log',
      createdAt: now,
    });
  });

  const anonDb = testEnv.unauthenticatedContext().firestore();
  const editorDb = testEnv
    .authenticatedContext(editorUid, { email: 'editor@nibm.lk', email_verified: true })
    .firestore();
  const unverifiedOwnerDb = testEnv
    .authenticatedContext('spoof-uid', { email: 'lakshanrajapaksha327@gmail.com', email_verified: false })
    .firestore();
  const outsiderDb = testEnv
    .authenticatedContext(outsiderUid, { email: 'outsider@gmail.com', email_verified: true })
    .firestore();
  const superAdminDb = testEnv
    .authenticatedContext(superAdminUid, { email: 'lakshanrajapaksha327@gmail.com', email_verified: true })
    .firestore();

  // 1. Unauthenticated draft read denied
  await assertFails(anonDb.doc('projects/draft-proj').get());

  // 2. Public PII scrape denied
  await assertFails(anonDb.doc('membershipEnquiries/enq-1').get());
  await assertFails(anonDb.collection('contactMessages').get());

  // 3. Self-assigned superAdmin escalation denied
  await assertFails(
    outsiderDb.doc(`users/${outsiderUid}`).set({
      uid: outsiderUid,
      email: 'outsider@gmail.com',
      role: 'superAdmin',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  );

  // 4. Profile role mutation denied
  await assertFails(
    editorDb.doc(`users/${editorUid}`).update({
      role: 'superAdmin',
      updatedAt: new Date(),
    }),
  );

  // 5. Unverified email spoofing denied
  await assertFails(unverifiedOwnerDb.doc('membershipEnquiries/enq-1').get());

  // 6. Shadow field injection on public enquiry denied
  await assertFails(
    anonDb.collection('membershipEnquiries').add({
      fullName: 'Injected User',
      email: 'user@example.com',
      programme: 'BBA',
      batch: '26.2',
      reason: 'Attempting to inject shadow verification field.',
      consentAccepted: true,
      status: 'new',
      isVerified: true,
      createdAt: new Date(),
    }),
  );

  // 7. Editor bypassing approval gate (setting published directly) denied
  await assertFails(
    editorDb.doc('projects/draft-proj').update({
      publicationStatus: 'published',
      updatedBy: editorUid,
      updatedAt: new Date(),
    }),
  );

  // 8. Resource exhaustion / invalid ID denied
  const oversizedId = 'a'.repeat(180);
  await assertFails(editorDb.doc(`projects/${oversizedId}`).set({ title: 'Bad ID' }));

  // 9. Client timestamp forgery denied
  await assertFails(
    anonDb.collection('contactMessages').add({
      name: 'Backdated Sender',
      email: 'sender@example.com',
      subject: 'Test Subject',
      message: 'Testing timestamp forgery prevention rule.',
      consentAccepted: true,
      status: 'new',
      createdAt: new Date('2020-01-01T00:00:00Z'),
    }),
  );

  // 10. Audit log tampering denied even for superAdmin
  await assertFails(superAdminDb.doc('auditLogs/log-1').delete());
  await assertFails(superAdminDb.doc('auditLogs/log-1').update({ summary: 'Tampered' }));

  // 11. Identity spoofing on create denied
  await assertFails(
    editorDb.doc('projects/spoofed-proj').set({
      title: 'Spoofed Creator',
      slug: 'spoofed-creator',
      summary: 'Testing creator UID enforcement.',
      story: 'Story body',
      category: 'Education & Literacy',
      leosticYear: '2026/27',
      startDate: '2026-09-01',
      location: 'Colombo',
      status: 'planned',
      publicationStatus: 'draft',
      coverImage: '',
      coverAlt: '',
      media: [],
      videoUrls: [],
      metrics: [],
      partners: [],
      featured: false,
      createdBy: superAdminUid,
      updatedBy: editorUid,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  );

  // 12. Non-superAdmin listing /users denied
  await assertFails(editorDb.collection('users').get());

  // Sanity: Super Admin can read enquiries
  await assertSucceeds(superAdminDb.doc('membershipEnquiries/enq-1').get());

  await testEnv.cleanup();
  assert.ok(true);
});
