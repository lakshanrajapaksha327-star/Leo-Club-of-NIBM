import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { useClubData } from '../context/ClubContext';
import { canRolePerform } from '../utils/clubLogic';
import { PageShell } from '../components/Reveal';
import { BRAND_ASSETS } from '../data/brand';

export function AdminLoginPage() {
  const {
    authReady,
    authLoading,
    firebaseUser,
    userProfile,
    authError,
    backendStatus,
    signInWithGoogle,
    signOutUser,
  } = useClubData();
  const navigate = useNavigate();

  const hasAdminAccess = Boolean(
    userProfile?.active && canRolePerform(userProfile.role, 'viewAdmin'),
  );

  useEffect(() => {
    if (authReady && hasAdminAccess) {
      navigate('/admin', { replace: true });
    }
  }, [authReady, hasAdminAccess, navigate]);

  return (
    <PageShell>
      <section className="min-h-[75vh] bg-[#080B13] bg-grid-architectural bg-d7-atmosphere py-16 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-white/12 bg-[#0B0F1A]/95 p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_ASSETS.clubLogoPrimary}
                alt="Leo Club of NIBM"
                className="h-11 w-11 rounded-xl bg-white p-1 object-contain"
              />
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-[#F3D754]">
                  Restricted Access
                </p>
                <h1 className="font-display text-xl font-bold text-white">
                  Club Admin Sign-In
                </h1>
              </div>
            </div>
            <Lock className="w-5 h-5 text-[#E8AF25]" aria-hidden="true" />
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Sign in with your invited Google account to manage projects, events, Executive Board profiles, magazines, gallery albums, awards, and membership enquiries for the Leo Club of NIBM.
          </p>

          {!backendStatus.authConnected && (
            <div
              role="alert"
              className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-xs text-amber-100"
            >
              Firebase Authentication is not configured in this build environment yet.
            </div>
          )}

          {authError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/35 bg-red-500/10 p-4 flex items-start gap-2.5 text-xs text-red-100 leading-relaxed"
            >
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{authError}</span>
            </div>
          )}

          {firebaseUser && !hasAdminAccess && !authLoading && (
            <div className="rounded-xl border border-white/12 bg-[#05070D] p-4 space-y-3 text-xs text-slate-300">
              <div>
                Signed in as <strong className="text-white">{firebaseUser.email}</strong>
              </div>
              <button
                type="button"
                onClick={() => void signOutUser()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white hover:bg-white/10"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign out and try another Google account</span>
              </button>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              disabled={!backendStatus.authConnected || authLoading}
              onClick={() => void signInWithGoogle()}
              className="w-full min-h-[46px] inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#05070D] hover:bg-[#F3D754] disabled:opacity-50 transition-all shadow-lg"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{authLoading ? 'Verifying Google account...' : 'Sign in with Google'}</span>
            </button>

            <Link
              to="/"
              className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Return to public website</span>
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
