import { Link } from 'react-router-dom';
import { Camera, FileLock2, ShieldCheck, UserCheck } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { PageShell, Reveal } from '../components/Reveal';

export function PrivacyPage() {
  const { settings } = useClubData();

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
            Governance & Data Protection
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
            Privacy Policy & Content Consent
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            How the {settings.clubName} collects, protects, and publishes club records, enquiries, and media under Lions Clubs International and NIBM standards.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2.5 text-[#F3D754]">
                <FileLock2 className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-white">
                  1. Membership & Contact Enquiries (Private Collection)
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Details submitted through the Membership Enquiry (Join) or Contact forms—including your full name, email address, NIBM programme, intake batch, and message—are stored strictly in private Firestore collections. These records are write-only from public forms and readable exclusively by authorised club executives (Super Admin, President, and Secretary). They are never published on public pages or shared with unrelated third parties.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2.5 text-[#F3D754]">
                <Camera className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-white">
                  2. Photography, Video & Youth Safeguard Consent
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Before any project photograph, event video, or gallery album is published on this portal, club media editors and approving officers must confirm participant consent, add descriptive alt text, and verify that sensitive or private materials (such as internal approval letters, receipts, or personal student rosters) remain confined to private storage paths.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2.5 text-[#F3D754]">
                <UserCheck className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-white">
                  3. Administrator Authentication & Audit Trail
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Administrative access is restricted to verified Google accounts pre-approved on the club allowlist. Every create, update, publication approval, and role change is logged in an immutable audit trail for institutional accountability across Leostic years.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 text-[#F3D754]">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                <h2 className="font-display text-xl font-bold text-white">
                  4. Correction or Takedown Requests
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                If you appear in a published club photograph or wish to update or remove an enquiry you submitted, please reach out via our Contact page so an authorised officer can act promptly.
              </p>
              <div>
                <Link
                  to="/contact"
                  className="inline-flex items-center rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#05070D] hover:bg-[#F3D754] transition-colors"
                >
                  Contact Club Officers
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
