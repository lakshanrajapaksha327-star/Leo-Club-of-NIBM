import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { submitMembershipEnquiry } from '../services/repository';
import { validateMembershipEnquiry, type ValidationErrors } from '../utils/clubLogic';
import { PageShell } from '../components/Reveal';

export function JoinPage() {
  const { settings, backendStatus } = useClubData();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    programme: '',
    batch: '',
    reason: '',
    consentAccepted: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const nextErrors = validateMembershipEnquiry(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitMembershipEnquiry(form);
      if (result.accepted) {
        setFeedback({ type: 'success', message: result.message });
        setForm({
          fullName: '',
          email: '',
          programme: '',
          batch: '',
          reason: '',
          consentAccepted: false,
        });
      } else {
        setFeedback({ type: 'error', message: result.message });
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
            Membership {settings.currentLeosticYear}
          </p>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-white">
            Join the Leo Club of NIBM
          </h1>
          <p className="mt-3 text-base text-slate-300 max-w-2xl leading-relaxed">
            Open to motivated students at the National Institute of Business Management who want to serve communities and grow as leaders.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-[#080B13] bg-grid-architectural">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold text-white">
                How Membership Works
              </h2>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E8AF25] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Submit your membership enquiry with your NIBM programme and batch details.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E8AF25] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Your enquiry is reviewed privately by authorised club membership officers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#E8AF25] mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Attend an orientation session and begin participating in club projects.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#E8AF25] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <p className="font-semibold text-slate-200 mb-1">Privacy Guarantee</p>
                Membership enquiries are write-only from the public form and readable exclusively by authorised club officers. They are never published publicly.
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
                Membership Enquiry Form
              </h2>

              {!backendStatus.firestoreConnected && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#F3D754] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    Database connection is unavailable in this environment. Please contact club officers directly if submission fails.
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="join-fullName" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Full Name
                </label>
                <input
                  id="join-fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                />
                {errors.fullName && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="join-email" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Email Address
                </label>
                <input
                  id="join-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                />
                {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="join-programme" className="block text-sm font-medium text-slate-200 mb-1.5">
                    NIBM Programme
                  </label>
                  <input
                    id="join-programme"
                    type="text"
                    value={form.programme}
                    onChange={(e) => setForm({ ...form, programme: e.target.value })}
                    placeholder="e.g. BSc (Hons) Computing"
                    className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                  />
                  {errors.programme && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.programme}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="join-batch" className="block text-sm font-medium text-slate-200 mb-1.5">
                    Batch / Intake
                  </label>
                  <input
                    id="join-batch"
                    type="text"
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    placeholder="e.g. 26.1"
                    className="w-full min-h-[44px] rounded-xl border border-white/12 bg-[#05070D] px-4 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                  />
                  {errors.batch && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.batch}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="join-reason" className="block text-sm font-medium text-slate-200 mb-1.5">
                  Why do you want to join the Leo Club of NIBM?
                </label>
                <textarea
                  id="join-reason"
                  rows={4}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Share your service interests, skills, or what inspires you about Leoism..."
                  className="w-full rounded-xl border border-white/12 bg-[#05070D] p-4 text-sm text-white placeholder:text-slate-500 focus:border-[#E8AF25] focus:outline-none"
                />
                {errors.reason && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.reason}</p>
                )}
              </div>

              <div>
                <label className="flex items-start gap-3 text-xs text-slate-300 cursor-pointer">
                  <input
                    id="join-consent"
                    type="checkbox"
                    checked={form.consentAccepted}
                    onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-white/25 bg-[#05070D] text-[#E8AF25] focus:ring-[#E8AF25]"
                  />
                  <span>
                    I consent to the Leo Club of NIBM Executive Committee privately reviewing these details for membership orientation in accordance with our{' '}
                    <Link to="/privacy" className="text-[#F3D754] underline">
                      Privacy & Consent Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.consentAccepted && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.consentAccepted}</p>
                )}
              </div>

              {feedback && (
                <div
                  role="status"
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    feedback.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                      : 'border-red-500/35 bg-red-500/10 text-red-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-200"
              >
                {submitting ? 'Submitting...' : 'Submit Membership Enquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
