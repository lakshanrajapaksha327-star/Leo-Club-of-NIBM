# Leo Club of NIBM — Official Website & Content Management Platform

Official website and Firebase-backed editorial CMS for the **Leo Club of NIBM** (National Institute of Business Management, Sri Lanka), affiliated with **Leo District 306 D7**, **Leo Multiple District 306 (Sri Lanka & Maldives)**, and **Lions Clubs International**.

---

## Architecture Overview

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, React Router 7, Motion, Lucide Icons
- **Database**: Cloud Firestore (real-time `onSnapshot` public & admin streams)
- **Authentication**: Firebase Auth with Google Sign-In (`signInWithPopup`) + verified email allowlist (`adminInvites`)
- **Media Storage**: Firebase Cloud Storage (`/public/...` vs `/private/...` segregated paths with MIME & byte-size validation)
- **Editorial Workflow**: `draft` → `submitted` → `underReview` → `approved` → `published` → `archived` / `rejected`
- **Role Tiers**: `superAdmin`, `president`, `secretary`, `projectEditor`, `mediaEditor`, `viewer`
- **Multi-Year Preservation**: Content is tagged by `leosticYear` (default `2026/27`) and managed via `clubYears` + `siteSettings/main` without overwriting historical records.

---

## Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero reel, L-E-O pillars, impact strip, Executive Board highlights, Magazines, Projects, News & Awards |
| `/about` | Leoism pillars, NIBM & District 306 D7 affiliation |
| `/projects` | Searchable, filterable editorial project archive (no map interface) |
| `/projects/:slug` | Full long-form project story, gallery lightbox, embedded/uploaded videos, approved docs |
| `/events` | Upcoming & past club calendar |
| `/team` | Executive Board filterable by Leostic year |
| `/gallery` | Consent-verified photo albums with lightbox |
| `/publications` | Magazines, newsletters, annual reports & Witness-style bulletins |
| `/news` & `/news/:slug` | Official club dispatches & live announcements |
| `/history` | Milestones and preserved Leostic years |
| `/awards` | District & Multiple District honours archive |
| `/join` & `/contact` | Consent-gated private membership & contact forms |
| `/privacy` | Privacy, youth safeguard media consent, and takedown policy |
| `/admin/login` & `/admin` | Role-gated 14-module Club Admin Portal |

---

## First-Time Admin Setup & Bootstrap

1. Open **`/admin/login`** and click **Sign in with Google**.
2. Sign in using the bootstrapped Super Admin Google account configured for this workspace (`lakshanrajapaksha327@gmail.com`).
3. Once signed in, navigate to **`Admin → Users & Invites`** to invite additional officers by Google email and role (`president`, `secretary`, `projectEditor`, `mediaEditor`, `viewer`).
   - Invited officers must sign in with their invited Google account (`email_verified == true`) to activate their admin profile.
4. Go to **`Admin → Settings`** to verify and save:
   - Official email, phone number, campus address, and verified social media links
   - Club Mission, Vision, Annual Theme, and Charter Date
   - Hero background slides (replace the default architectural placeholders with approved club photography)
5. Go to **`Admin → Executive Board`** to upload portraits and confirm officers for `2026/27`.

---

## Firebase Deployment & Storage Notes

### 1. Deploy Firestore Rules, Indexes & Storage Rules

```bash
# Lint Firestore security rules locally
npm run rules:lint

# Deploy Firestore security rules, composite indexes, and Storage rules
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 2. Cloud Storage Billing Requirement (Blaze Plan)

Firebase Cloud Storage requires your Firebase project (`gen-lang-client-0619088444`) to be on the **Blaze (pay-as-you-go)** billing plan and initialized in **Firebase Console → Storage → Get Started**.
- Until Storage is enabled on Blaze in Firebase Console, direct file uploads in the Admin CMS will display an actionable setup error, while pasting approved `https://` image/PDF/YouTube/Vimeo URLs works immediately.
- Note: Because this applet uses a named Firestore database (`ai-studio-leoclubofnibm-c2045c36-47c6-4def-8a40-bb77fde55410`), `storage.rules` restricts writes to verified authenticated staff (`request.auth.token.email_verified == true`) and enforces strict `/public` vs `/private` separation, MIME allowlists, and file size caps (20 MB images, 100 MB videos, 25 MB PDFs).

---

## Local Development & Verification Commands

```bash
npm install
npm run dev         # Start local Vite dev server on http://localhost:3000
npm run lint        # TypeScript check (tsc --noEmit)
npm run test        # Run unit tests (tsx --test src/utils/*.test.ts)
npm run rules:lint  # Lint firestore.rules with @firebase/eslint-plugin-security-rules
npm run build       # Production Vite bundle build
```

### Running Firestore Emulator Rule Tests

When Java and Firebase Emulator Suite are installed in CI or locally:

```bash
npm install -D @firebase/rules-unit-testing
firebase emulators:exec --only firestore "npx tsx --test firestore.rules.test.ts"
```

---

## Backups & Data Preservation

Schedule regular Firestore managed exports in Google Cloud Console (`gcloud firestore export gs://<backup-bucket> --database=ai-studio-leoclubofnibm-c2045c36-47c6-4def-8a40-bb77fde55410`) or export JSON snapshots before major Leostic year transitions. Never delete past `clubYears` documents so archived board lists, awards, and projects remain accessible across years.
