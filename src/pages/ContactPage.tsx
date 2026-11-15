import React, { useState } from 'react';
import { Building2, Info, Mail, Phone } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { submitContactEnquiry } from '../services/repository';
import { validateContactMessage, type ValidationErrors } from '../utils/clubLogic';
import { PageShell } from '../components/Reveal';

export function ContactPage() {
  const { settings, backendStatus } = useClubData();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const nextErrors = validateContactMessage(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await submitContactEnquiry(form);
      setFeedback(res.message);
      if (res.accepted) {
        setForm({ name: '', email: '', subject: '', message: '' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="border-b border-white/10 bg-[#05070D] bg-d7-atmosphere py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-wide text-[#F3D754]">
            Get In Touch
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
            Contact Us
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-2xl">
            Reach out for partnerships, joint service initiatives, sponsorship inquiries, or campus club information.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-5">
              <h2 className="font-display text-xl font-semibold text-white">
                Club Information
              </h2>

              <div className="flex items-start gap-3 text-sm">
                <Building2 className="w-4 h-4 text-[#E8AF25] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-medium text-white">Institution</div>
                  <div className="text-slate-300 mt-0.5">{settings.institutionName}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 text-[#E8AF25] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-medium text-white">Official Email</div>
                  <div className="text-slate-400 mt-0.5">
                    {settings.officialEmail || 'Pending verification in Club Site Settings'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 text-[#E8AF25] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-medium text-white">Telephone</div>
                  <div className="text-slate-400 mt-0.5">
                    {settings.officialPhone || 'Pending verification in Club Site Settings'}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-2.5 text-xs text-slate-400">
                <Info className="w-4 h-4 text-[#E8AF25] shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Unconfirmed telephone numbers, addresses, and social media handles are intentionally omitted until verified by the Executive Committee.
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              noValidate
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 sm:p-8 space-y-5"
            >
              <h2 className="font-display text-xl font-semibold text-white">
                Send a Message
              </h2>

              {!backendStatus.firestoreConnected && (
                <div className="rounded-xl border border-[#E8AF25]/30 bg-[#E8AF25]/10 px-4 py-3 text-xs text-slate-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#F3D754] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Firebase Firestore is not yet connected. Once Step 2 connects Firebase, messages will be routed directly to club officers.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white focus:border-[#E8AF25] focus:outline-none"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white focus:border-[#E8AF25] focus:outline-none"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white focus:border-[#E8AF25] focus:outline-none"
                />
                {errors.subject && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-white/12 bg-[#05070D] p-4 text-sm text-white focus:border-[#E8AF25] focus:outline-none"
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                )}
              </div>

              {feedback && (
                <div
                  role="status"
                  className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-3 text-sm text-slate-100"
                >
                  {feedback}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-200"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
