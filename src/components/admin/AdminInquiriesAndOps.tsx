import { useState } from 'react';
import { Plus, Save, Trash2, UserPlus } from 'lucide-react';
import type {
  AdminInvite,
  AuditLog,
  ClubYear,
  ContactMessage,
  MembershipEnquiry,
  SiteSettings,
  TaxonomyItem,
  UserProfile,
  UserRole,
} from '../../types/club';
import { canRolePerform } from '../../utils/clubLogic';
import {
  deleteCollectionRecord,
  saveClubYear,
  saveSiteSettings,
  saveTaxonomyItem,
  updateEnquiryStatus,
} from '../../services/contentService';
import {
  createOrUpdateAdminInvite,
  deleteAdminInvite,
  updateUserRoleOrStatus,
} from '../../services/authService';
import { formatFriendlyFirebaseError } from '../../lib/firebase';
import { MediaUploader } from './MediaUploader';

// ── 1. Private Membership Enquiries Inbox ──
export function AdminEnquiriesTab({
  userProfile,
  enquiries,
}: {
  userProfile: UserProfile;
  enquiries: MembershipEnquiry[];
}) {
  const canView = canRolePerform(userProfile.role, 'viewPrivateInquiries');
  const canDelete = canRolePerform(userProfile.role, 'delete');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);

  if (!canView) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 text-sm text-slate-300">
        Membership enquiries contain student PII and are restricted to Super Admin, President, and Secretary.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-white">
        Private Membership Enquiries ({enquiries.length})
      </h2>
      {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2 text-xs text-white">{msg}</div>}
      {enquiries.length === 0 ? (
        <p className="text-sm text-slate-400">No membership enquiries received yet.</p>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="rounded-xl border border-white/10 bg-[#05070D] p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">{enq.fullName}</div>
                  <div className="text-xs text-[#F3D754]">{enq.email}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {enq.programme} · Batch {enq.batch} · {new Date(enq.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Status for ${enq.fullName}`}
                    value={enq.status}
                    onChange={async (e) => {
                      if (!enq.id) return;
                      try {
                        await updateEnquiryStatus(
                          userProfile,
                          'membershipEnquiries',
                          enq.id,
                          e.target.value,
                          notes[enq.id] ?? enq.internalNotes,
                        );
                        setMsg(`Updated ${enq.fullName} -> ${e.target.value}`);
                      } catch (err) {
                        setMsg(formatFriendlyFirebaseError(err));
                      }
                    }}
                    className="rounded-lg border border-white/15 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="new">new</option>
                    <option value="reviewed">reviewed</option>
                    <option value="contacted">contacted</option>
                    <option value="archived">archived</option>
                  </select>
                  {canDelete && enq.id && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteCollectionRecord(
                          userProfile,
                          'membershipEnquiries',
                          enq.id!,
                          enq.fullName,
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{enq.reason}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Internal officer notes..."
                  value={notes[enq.id || ''] ?? enq.internalNotes ?? ''}
                  onChange={(e) => setNotes({ ...notes, [enq.id || '']: e.target.value })}
                  className="flex-1 rounded-lg border border-white/12 bg-[#0B0F1A] px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!enq.id) return;
                    await updateEnquiryStatus(
                      userProfile,
                      'membershipEnquiries',
                      enq.id,
                      enq.status,
                      notes[enq.id] ?? enq.internalNotes,
                    );
                    setMsg(`Saved note for ${enq.fullName}`);
                  }}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white"
                >
                  Save Note
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 2. Private Contact Messages Inbox ──
export function AdminMessagesTab({
  userProfile,
  messages,
}: {
  userProfile: UserProfile;
  messages: ContactMessage[];
}) {
  const canView = canRolePerform(userProfile.role, 'viewPrivateInquiries');
  const canDelete = canRolePerform(userProfile.role, 'delete');
  const [msg, setMsg] = useState<string | null>(null);

  if (!canView) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 text-sm text-slate-300">
        Contact messages are restricted to Super Admin, President, and Secretary.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-white">
        Contact Messages ({messages.length})
      </h2>
      {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2 text-xs text-white">{msg}</div>}
      {messages.length === 0 ? (
        <p className="text-sm text-slate-400">No contact messages received yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-[#05070D] p-4 space-y-2.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">{item.subject}</div>
                  <div className="text-xs text-[#F3D754]">
                    {item.name} ({item.email}) · {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={async (e) => {
                      if (!item.id) return;
                      await updateEnquiryStatus(
                        userProfile,
                        'contactMessages',
                        item.id,
                        e.target.value,
                        item.internalNotes,
                      );
                      setMsg(`Updated "${item.subject}" -> ${e.target.value}`);
                    }}
                    className="rounded-lg border border-white/15 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="new">new</option>
                    <option value="reviewed">reviewed</option>
                    <option value="replied">replied</option>
                    <option value="archived">archived</option>
                  </select>
                  {canDelete && item.id && (
                    <button
                      type="button"
                      onClick={() =>
                        void deleteCollectionRecord(
                          userProfile,
                          'contactMessages',
                          item.id!,
                          item.subject,
                        )
                      }
                      className="p-1.5 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 3. Club Years & Archives ──
export function AdminYearsTab({
  userProfile,
  clubYears,
}: {
  userProfile: UserProfile;
  clubYears: ClubYear[];
}) {
  const canManage = canRolePerform(userProfile.role, 'manageSettings');
  const [form, setForm] = useState({
    year: '2026/27',
    theme: '',
    status: 'active' as ClubYear['status'],
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    summary: '',
    isCurrent: true,
  });
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <h2 className="font-display text-lg font-bold text-white">Preserved Leostic Years</h2>
        {clubYears.length === 0 ? (
          <p className="text-xs text-slate-400">
            Add club years here to preserve historical terms and annual themes.
          </p>
        ) : (
          clubYears.map((yr) => (
            <div
              key={yr.id}
              onClick={() =>
                setForm({
                  year: yr.year,
                  theme: yr.theme || '',
                  status: yr.status,
                  startDate: yr.startDate || '',
                  endDate: yr.endDate || '',
                  summary: yr.summary || '',
                  isCurrent: yr.isCurrent,
                })
              }
              className="rounded-xl border border-white/10 bg-[#05070D] p-3.5 cursor-pointer hover:border-[#E8AF25]/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-white">{yr.year}</span>
                <span className="text-[11px] text-[#F3D754]">
                  {yr.isCurrent ? 'Current Term' : yr.status}
                </span>
              </div>
              {yr.theme && <div className="text-xs text-slate-400 mt-1">{yr.theme}</div>}
            </div>
          ))
        )}
      </div>

      <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">Add / Update Leostic Year</h2>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Leostic Year (e.g. 2026/27)"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Annual Theme (optional)"
            value={form.theme}
            onChange={(e) => setForm({ ...form, theme: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Term summary or presidential note"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <div className="flex items-center gap-6">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ClubYear['status'] })}
            className="min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
          >
            <option value="active">active</option>
            <option value="archived">archived</option>
          </select>
          <label className="inline-flex items-center gap-2 text-xs text-slate-200">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
            />
            <span>Mark as current term</span>
          </label>
        </div>
        <button
          type="button"
          disabled={!canManage}
          onClick={async () => {
            try {
              await saveClubYear(userProfile, form);
              setMsg(`Saved Leostic year ${form.year}.`);
            } catch (err) {
              setMsg(formatFriendlyFirebaseError(err));
            }
          }}
          className="rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D] disabled:opacity-50"
        >
          Save Year Record
        </button>
      </div>
    </div>
  );
}

// ── 4. Site Settings & Taxonomies (21 Service Causes + Award Categories) ──
export function AdminSettingsTab({
  userProfile,
  settings,
  serviceCategories,
  awardCategories,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  serviceCategories: TaxonomyItem[];
  awardCategories: TaxonomyItem[];
}) {
  const canManage = canRolePerform(userProfile.role, 'manageSettings');
  const [form, setForm] = useState<SiteSettings>(settings);
  const [yearsText, setYearsText] = useState(settings.availableYears.join(', '));
  const [newServiceCat, setNewServiceCat] = useState('');
  const [newAwardCat, setNewAwardCat] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!canManage) return;
    setSaving(true);
    setMsg(null);
    try {
      const years = yearsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await saveSiteSettings(userProfile, {
        ...form,
        availableYears: years.length > 0 ? years : settings.availableYears,
      });
      setMsg('Site Settings updated live.');
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">
            Club Identity, Contacts, History & Hero Backdrop
          </h2>
          {canManage && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D]"
            >
              <Save className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          )}
        </div>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Current Leostic Year</label>
            <input
              type="text"
              value={form.currentLeosticYear}
              onChange={(e) => setForm({ ...form, currentLeosticYear: e.target.value })}
              className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Available Years (comma-separated)</label>
            <input
              type="text"
              value={yearsText}
              onChange={(e) => setYearsText(e.target.value)}
              className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Annual Theme</label>
            <input
              type="text"
              value={form.annualTheme || ''}
              onChange={(e) => setForm({ ...form, annualTheme: e.target.value })}
              className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Verified Charter Date</label>
            <input
              type="text"
              value={form.charterDate || ''}
              onChange={(e) => setForm({ ...form, charterDate: e.target.value })}
              placeholder="Only enter verified charter date"
              className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Official Club Email</label>
            <input
              type="email"
              value={form.officialEmail || ''}
              onChange={(e) => setForm({ ...form, officialEmail: e.target.value })}
              className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Official Phone</label>
            <input
              type="text"
              value={form.officialPhone || ''}
              onChange={(e) => setForm({ ...form, officialPhone: e.target.value })}
              className="w-full min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <textarea
            rows={3}
            placeholder="Club Mission Statement"
            value={form.mission || ''}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
            className="rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
          />
          <textarea
            rows={3}
            placeholder="Club Vision Statement"
            value={form.vision || ''}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            className="rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
          />
        </div>
        <textarea
          rows={4}
          placeholder="Verified Club History & Charter Milestones"
          value={form.clubHistory || ''}
          onChange={(e) => setForm({ ...form, clubHistory: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/10">
          {(['facebook', 'instagram', 'linkedin', 'youtube'] as const).map((net) => (
            <input
              key={net}
              type="url"
              placeholder={`${net} URL`}
              value={form.socialLinks?.[net] || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, [net]: e.target.value },
                })
              }
              className="min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
            />
          ))}
        </div>

        {/* Verified Hero Backdrop Upload */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="font-display text-sm font-semibold text-white">
            Homepage Hero Slides (Replace Placeholder Backdrops With Verified Club Photos)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(form.heroSlides || []).map((slide, idx) => (
              <div key={slide.id} className="rounded-xl border border-white/10 bg-[#05070D] p-3 space-y-2">
                <img src={slide.image} alt={slide.imageAlt} className="h-24 w-full object-cover rounded-lg" />
                <input
                  type="text"
                  value={slide.headline}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      heroSlides: (form.heroSlides || []).map((s, i) =>
                        i === idx ? { ...s, headline: e.target.value } : s,
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-white/12 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                />
                <MediaUploader
                  kind="image"
                  visibility="public"
                  module="site"
                  recordId={`hero-${idx + 1}`}
                  label={`Replace Slide ${idx + 1} Photo`}
                  onUploaded={({ url, fileName }) => {
                    setForm((prev) => ({
                      ...prev,
                      heroSlides: (prev.heroSlides || []).map((s, i) =>
                        i === idx
                          ? {
                              ...s,
                              image: url,
                              imageAlt: fileName.replace(/\.[^.]+$/, ''),
                              isPlaceholder: false,
                            }
                          : s,
                      ),
                    }));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Configurable 21 Service Causes & Separate Award Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">
            MD 306 Service Causes ({serviceCategories.length})
          </h3>
          {canManage && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom service cause..."
                value={newServiceCat}
                onChange={(e) => setNewServiceCat(e.target.value)}
                className="flex-1 min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newServiceCat.trim()) return;
                  await saveTaxonomyItem(userProfile, 'serviceCategories', {
                    name: newServiceCat.trim(),
                    order: serviceCategories.length + 1,
                    active: true,
                  });
                  setNewServiceCat('');
                }}
                className="rounded-xl bg-white px-4 text-xs font-semibold text-[#05070D]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
          <div className="max-h-72 overflow-y-auto divide-y divide-white/10 text-xs">
            {serviceCategories.map((cat) => (
              <div key={cat.id} className="py-2 flex items-center justify-between gap-2">
                <span className={cat.active ? 'text-slate-200' : 'text-slate-500 line-through'}>
                  {cat.order}. {cat.name}
                </span>
                {canManage && !cat.id.startsWith('default-') && (
                  <button
                    type="button"
                    onClick={() =>
                      void deleteCollectionRecord(
                        userProfile,
                        'serviceCategories',
                        cat.id,
                        cat.name,
                      )
                    }
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
          <h3 className="font-display text-lg font-bold text-white">
            Award Categories ({awardCategories.length})
          </h3>
          {canManage && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add award category..."
                value={newAwardCat}
                onChange={(e) => setNewAwardCat(e.target.value)}
                className="flex-1 min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
              />
              <button
                type="button"
                onClick={async () => {
                  if (!newAwardCat.trim()) return;
                  await saveTaxonomyItem(userProfile, 'awardCategories', {
                    name: newAwardCat.trim(),
                    order: awardCategories.length + 1,
                    active: true,
                  });
                  setNewAwardCat('');
                }}
                className="rounded-xl bg-white px-4 text-xs font-semibold text-[#05070D]"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}
          <div className="max-h-72 overflow-y-auto divide-y divide-white/10 text-xs">
            {awardCategories.map((cat) => (
              <div key={cat.id} className="py-2 flex items-center justify-between gap-2">
                <span className="text-slate-200">{cat.name}</span>
                {canManage && !cat.id.startsWith('default-') && (
                  <button
                    type="button"
                    onClick={() =>
                      void deleteCollectionRecord(
                        userProfile,
                        'awardCategories',
                        cat.id,
                        cat.name,
                      )
                    }
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 5. Admin Users & Invite Allowlist (Super Admin only) ──
export function AdminUsersTab({
  userProfile,
  users,
  invites,
}: {
  userProfile: UserProfile;
  users: UserProfile[];
  invites: AdminInvite[];
}) {
  const isSuper = canRolePerform(userProfile.role, 'manageUsers');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('projectEditor');
  const [msg, setMsg] = useState<string | null>(null);

  if (!isSuper) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 text-sm text-slate-300">
        User & Role Management is restricted to Super Admin accounts.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#E8AF25]" aria-hidden="true" />
          <span>Invite Authorised Officer (Allowlist)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Only pre-approved Google email addresses added here can activate an admin profile upon Google Sign-In. Public self-signup is strictly blocked.
        </p>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2 text-xs text-white">{msg}</div>}
        <div className="flex flex-wrap gap-3">
          <input
            type="email"
            placeholder="officer@gmail.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 min-w-[220px] min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            <option value="projectEditor">projectEditor</option>
            <option value="mediaEditor">mediaEditor</option>
            <option value="secretary">secretary</option>
            <option value="president">president</option>
            <option value="viewer">viewer</option>
            <option value="superAdmin">superAdmin</option>
          </select>
          <button
            type="button"
            onClick={async () => {
              try {
                await createOrUpdateAdminInvite(userProfile, inviteEmail, inviteRole, true);
                setMsg(`Invited ${inviteEmail} as ${inviteRole}.`);
                setInviteEmail('');
              } catch (err) {
                setMsg(formatFriendlyFirebaseError(err));
              }
            }}
            className="rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D]"
          >
            Add / Update Invite
          </button>
        </div>

        {invites.length > 0 && (
          <div className="divide-y divide-white/10 pt-2">
            {invites.map((inv) => (
              <div key={inv.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-white font-medium">{inv.email}</span>{' '}
                  <span className="font-mono text-[#F3D754]">({inv.role})</span>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteAdminInvite(userProfile, inv.id)}
                  className="text-slate-400 hover:text-red-400"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-white">
          Active & Registered Admin Accounts ({users.length})
        </h3>
        <div className="divide-y divide-white/10">
          {users.map((u) => (
            <div key={u.uid} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="text-sm font-semibold text-white">{u.displayName || u.email}</div>
                <div className="text-slate-400">{u.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={u.role}
                  onChange={(e) =>
                    void updateUserRoleOrStatus(userProfile, u.uid, {
                      role: e.target.value as UserRole,
                      active: u.active,
                    })
                  }
                  className="rounded-lg border border-white/15 bg-[#05070D] px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="superAdmin">superAdmin</option>
                  <option value="president">president</option>
                  <option value="secretary">secretary</option>
                  <option value="projectEditor">projectEditor</option>
                  <option value="mediaEditor">mediaEditor</option>
                  <option value="viewer">viewer</option>
                </select>
                <label className="inline-flex items-center gap-1.5 text-slate-200">
                  <input
                    type="checkbox"
                    checked={u.active}
                    onChange={(e) =>
                      void updateUserRoleOrStatus(userProfile, u.uid, {
                        role: u.role,
                        active: e.target.checked,
                      })
                    }
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 6. Immutable Audit Log ──
export function AdminAuditLogTab({
  userProfile,
  logs,
}: {
  userProfile: UserProfile;
  logs: AuditLog[];
}) {
  if (!canRolePerform(userProfile.role, 'publish')) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 text-sm text-slate-300">
        Audit logs are readable by Super Admin, President, and Secretary.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
      <h2 className="font-display text-xl font-bold text-white">
        Immutable Audit Log (Latest {logs.length})
      </h2>
      {logs.length === 0 ? (
        <p className="text-sm text-slate-400">No admin mutations recorded yet.</p>
      ) : (
        <div className="divide-y divide-white/10 max-h-[560px] overflow-y-auto text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[#F3D754]">{log.action}</span> ·{' '}
                <span className="text-white">{log.summary}</span>
                <div className="text-slate-400 mt-0.5">
                  By {log.actorEmail} ({log.actorRole})
                </div>
              </div>
              <span className="text-slate-500 tabular-nums">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
