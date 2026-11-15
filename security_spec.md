# Security Specification — Leo Club of NIBM Portal

## 1. Data Invariants
1. **Default-Deny Baseline**: Every unspecified collection or path is denied by default (`/{document=**}`).
2. **Public vs. Draft Segregation**: Public visitors may only `get` or `list` records whose `publicationStatus == 'published'` (or `visible == true` for `officers` and `achievements`). Drafts, submitted items, under-review items, rejected items, and archived items are never publicly readable.
3. **Strict PII Isolation**: `membershipEnquiries`, `contactMessages`, `users`, `adminInvites`, and `auditLogs` are never publicly readable. Public visitors may only `create` `membershipEnquiries` and `contactMessages` with `status == 'new'`, `consentAccepted == true`, and server timestamp `createdAt == request.time`.
4. **No Self-Assigned Admin Roles**: Uninvited users cannot create `users/{uid}` with an admin role. Only:
   - the verified bootstrapped owner email (`lakshanrajapaksha327@gmail.com` with `email_verified == true`),
   - an existing active `superAdmin`, OR
   - a user with an active matching document in `adminInvites` (`email == request.auth.token.email && email_verified == true && active == true`) whose `role` matches the invite
   can register a role in `users/{uid}`.
5. **Email Spoofing Guard**: All email-based checks strictly require `request.auth.token.email_verified == true`.
6. **Workflow Separation & Role Tiers**:
   - `projectEditor` and `mediaEditor` can create/update drafts and submit for review (`draft` / `submitted`), but cannot set `publicationStatus` to `approved`, `published`, `archived`, or `rejected`.
   - Only `superAdmin`, `president`, and `secretary` can approve, publish, archive, or reject records, manage `siteSettings`/`clubYears`/`officers`/`achievements`/`taxonomies`, and review private enquiries.
   - Only `superAdmin` can create/update/delete `users` or `adminInvites`.
7. **Immutable Fields & Temporal Integrity**:
   - `createdAt`, `createdBy`, `uid`, `actorUid` are immutable after creation.
   - `createdAt == request.time` on create and `updatedAt == request.time` on update.
   - `auditLogs` are append-only (`update` and `delete` strictly forbidden).
8. **Storage Segregation**:
   - Public published assets live under `/public/{module}/{recordId}/{fileName}` and are limited by MIME type (JPG/PNG/WebP/MP4/WebM/MOV/PDF) and byte limits (20 MB images, 100 MB videos, 25 MB PDFs).
   - Internal/private files live under `/private/{module}/{recordId}/{fileName}` and are never readable by the public.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Draft Read**: Unauthenticated client requests `list` on `/projects` without `where('publicationStatus', '==', 'published')` -> `PERMISSION_DENIED`.
2. **Public PII Scrape**: Unauthenticated or viewer-level user tries `get` or `list` on `/membershipEnquiries` or `/contactMessages` -> `PERMISSION_DENIED`.
3. **Self-Assigned SuperAdmin Escalation**: Authenticated non-invited user tries `set` on `/users/{uid}` with `{ role: 'superAdmin', active: true }` -> `PERMISSION_DENIED`.
4. **Profile Role Mutation**: Existing `projectEditor` tries `update` on own `/users/{uid}` changing `role` from `'projectEditor'` to `'superAdmin'` -> `PERMISSION_DENIED`.
5. **Email Spoofing**: User with matching email claim but `email_verified: false` tries admin read/write -> `PERMISSION_DENIED`.
6. **Shadow Field Injection on Public Form**: Anonymous client submits `/membershipEnquiries` with extra ghost field `{ isVerified: true }` or `{ status: 'reviewed' }` -> `PERMISSION_DENIED`.
7. **Editor Bypassing Approval Gate**: `projectEditor` attempts to create or update `/projects/{id}` directly with `publicationStatus: 'published'` -> `PERMISSION_DENIED`.
8. **Resource Exhaustion / ID Poisoning**: Authenticated editor attempts write to `/projects/{200_char_invalid_id}` or injects >200 KB `title` string -> `PERMISSION_DENIED`.
9. **Client Timestamp Forgery**: Client submits `createdAt` set to a forged past date instead of server `request.time` -> `PERMISSION_DENIED`.
10. **Audit Log Tampering**: Even a `superAdmin` attempts `update` or `delete` on `/auditLogs/{id}` -> `PERMISSION_DENIED`.
11. **Identity Spoofing on Create**: Editor creates `/projects/{id}` with `createdBy: 'someone-else-uid'` instead of `request.auth.uid` -> `PERMISSION_DENIED`.
12. **PII Leak via `users` List**: Non-superAdmin authenticated user tries `list` on `/users` to harvest officer emails -> `PERMISSION_DENIED`.
