import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import type {
  Achievement,
  ClubEvent,
  GalleryAlbum,
  GalleryPhoto,
  NewsArticle,
  Officer,
  Publication,
  PublicationStatus,
  SiteSettings,
  TaxonomyItem,
  UserProfile,
} from '../../types/club';
import { canRolePerform, canTransitionPublicationStatus, generateSlug } from '../../utils/clubLogic';
import {
  deleteCollectionRecord,
  saveAchievement,
  saveEvent,
  saveGalleryAlbum,
  saveNewsArticle,
  saveOfficer,
  savePublication,
} from '../../services/contentService';
import { formatFriendlyFirebaseError } from '../../lib/firebase';
import { MediaUploader } from './MediaUploader';

// ── 1. Events Manager ──
export function AdminEventsTab({
  userProfile,
  settings,
  events,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  events: ClubEvent[];
}) {
  const canEdit = canRolePerform(userProfile.role, 'editContent');
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    date: new Date().toISOString().slice(0, 10),
    endDate: '',
    location: 'NIBM, Sri Lanka',
    leosticYear: settings.currentLeosticYear,
    status: 'upcoming' as ClubEvent['status'],
    publicationStatus: 'draft' as PublicationStatus,
    posterUrl: '',
    registrationUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reset = () => {
    setSelectedId(null);
    setForm({
      title: '',
      summary: '',
      date: new Date().toISOString().slice(0, 10),
      endDate: '',
      location: 'NIBM, Sri Lanka',
      leosticYear: settings.currentLeosticYear,
      status: 'upcoming',
      publicationStatus: 'draft',
      posterUrl: '',
      registrationUrl: '',
    });
  };

  const handleSave = async (nextPub?: PublicationStatus) => {
    const pubStatus = nextPub || form.publicationStatus;
    if (!canTransitionPublicationStatus(userProfile.role, pubStatus)) {
      setMsg('Only President, Secretary, or Super Admin can publish.');
      return;
    }
    if (form.title.trim().length < 2 || form.summary.trim().length < 5) {
      setMsg('Enter an event title and short summary.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = await saveEvent(userProfile, {
        ...form,
        id: selectedId || undefined,
        publicationStatus: pubStatus,
      });
      setSelectedId(id);
      setForm((p) => ({ ...p, publicationStatus: pubStatus }));
      setMsg(`Event saved (${pubStatus}).`);
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Events ({events.length})</h2>
          {canEdit && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#05070D]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              New
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                setSelectedId(ev.id);
                setForm({
                  title: ev.title,
                  summary: ev.summary,
                  date: ev.date,
                  endDate: ev.endDate || '',
                  location: ev.location,
                  leosticYear: ev.leosticYear,
                  status: ev.status,
                  publicationStatus: ev.publicationStatus,
                  posterUrl: ev.posterUrl || '',
                  registrationUrl: ev.registrationUrl || '',
                });
              }}
              className={`rounded-xl border p-3 cursor-pointer ${
                selectedId === ev.id
                  ? 'border-[#E8AF25] bg-[#7A184D]/20'
                  : 'border-white/10 bg-[#05070D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{ev.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {ev.date} · <span className="text-[#F3D754]">{ev.publicationStatus}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteCollectionRecord(userProfile, 'events', ev.id, ev.title);
                      if (selectedId === ev.id) reset();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          {selectedId ? 'Edit Event' : 'Create Event'}
        </h2>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Event Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Location *"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={form.leosticYear}
            onChange={(e) => setForm({ ...form, leosticYear: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            {settings.availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ClubEvent['status'] })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="url"
            placeholder="Registration URL (optional)"
            value={form.registrationUrl}
            onChange={(e) => setForm({ ...form, registrationUrl: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Event summary *"
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <input
            type="url"
            placeholder="Poster Image URL (optional)"
            value={form.posterUrl}
            onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-xs text-white"
          />
          <MediaUploader
            kind="image"
            visibility="public"
            module="events"
            recordId={selectedId || 'new-event'}
            label="Upload Event Poster"
            onUploaded={({ url }) => setForm((p) => ({ ...p, posterUrl: url }))}
          />
        </div>
        <div className="flex flex-wrap gap-2.5 pt-2">
          {canEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('draft')}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
            >
              Save Draft
            </button>
          )}
          {canPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('published')}
              className="rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D]"
            >
              Publish Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 2. Executive Board Manager ──
export function AdminTeamTab({
  userProfile,
  settings,
  officers,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  officers: Officer[];
}) {
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    position: 'President',
    leosticYear: settings.currentLeosticYear,
    biography: '',
    photoUrl: '',
    displayOrder: 1,
    visible: true,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelectedId(null);
    setForm({
      name: '',
      position: '',
      leosticYear: settings.currentLeosticYear,
      biography: '',
      photoUrl: '',
      displayOrder: officers.length + 1,
      visible: true,
    });
  };

  const handleSave = async () => {
    if (!canPublish) {
      setMsg('Only President, Secretary, or Super Admin can modify Executive Board officers.');
      return;
    }
    if (form.name.trim().length < 2 || form.position.trim().length < 2) {
      setMsg('Enter both officer name and position.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = await saveOfficer(userProfile, { ...form, id: selectedId || undefined });
      setSelectedId(id);
      setMsg(`Saved officer "${form.name}" (${form.leosticYear}).`);
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Officers ({officers.length})</h2>
          {canPublish && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#05070D]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add Officer
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {officers.map((off) => (
            <div
              key={off.id}
              onClick={() => {
                setSelectedId(off.id);
                setForm({
                  name: off.name,
                  position: off.position,
                  leosticYear: off.leosticYear,
                  biography: off.biography || '',
                  photoUrl: off.photoUrl || '',
                  displayOrder: off.displayOrder,
                  visible: off.visible,
                });
              }}
              className={`rounded-xl border p-3 cursor-pointer ${
                selectedId === off.id
                  ? 'border-[#E8AF25] bg-[#7A184D]/20'
                  : 'border-white/10 bg-[#05070D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-white">{off.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {off.position} · <span className="text-[#F3D754]">{off.leosticYear}</span> · #{off.displayOrder}
                  </div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteCollectionRecord(userProfile, 'officers', off.id, off.name);
                      if (selectedId === off.id) reset();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          {selectedId ? 'Edit Officer' : 'Add Executive Board Officer'}
        </h2>
        <p className="text-xs text-slate-400">
          Officers are stored per Leostic year so adding {settings.currentLeosticYear} never overwrites prior terms.
        </p>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Role / Position (e.g. President, Secretary, Treasurer) *"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={form.leosticYear}
            onChange={(e) => setForm({ ...form, leosticYear: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            {settings.availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            placeholder="Display Order"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) || 1 })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Short officer biography (optional)"
          value={form.biography}
          onChange={(e) => setForm({ ...form, biography: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <input
            type="url"
            placeholder="Portrait Photo URL"
            value={form.photoUrl}
            onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-xs text-white"
          />
          <MediaUploader
            kind="image"
            visibility="public"
            module="officers"
            recordId={selectedId || 'officer'}
            label="Upload Officer Portrait"
            onUploaded={({ url }) => setForm((p) => ({ ...p, photoUrl: url }))}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => setForm({ ...form, visible: e.target.checked })}
          />
          <span>Visible on public Executive Board & Homepage</span>
        </label>
        <div>
          <button
            type="button"
            disabled={!canPublish || saving}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D] disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{saving ? 'Saving...' : 'Save Officer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 3. Gallery Manager ──
export function AdminGalleryTab({
  userProfile,
  settings,
  galleries,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  galleries: GalleryAlbum[];
}) {
  const canEdit = canRolePerform(userProfile.role, 'editContent');
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    leosticYear: settings.currentLeosticYear,
    date: new Date().toISOString().slice(0, 10),
    coverUrl: '',
    coverAlt: '',
    photos: [] as GalleryPhoto[],
    consentConfirmed: false,
    publicationStatus: 'draft' as PublicationStatus,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelectedId(null);
    setForm({
      title: '',
      description: '',
      leosticYear: settings.currentLeosticYear,
      date: new Date().toISOString().slice(0, 10),
      coverUrl: '',
      coverAlt: '',
      photos: [],
      consentConfirmed: false,
      publicationStatus: 'draft',
    });
  };

  const handleSave = async (nextPub?: PublicationStatus) => {
    const pubStatus = nextPub || form.publicationStatus;
    if (!canTransitionPublicationStatus(userProfile.role, pubStatus)) {
      setMsg('Only President, Secretary, or Super Admin can publish albums.');
      return;
    }
    if (pubStatus === 'published' && !form.consentConfirmed) {
      setMsg('Confirm participant photography consent before publishing a gallery album.');
      return;
    }
    if (form.title.trim().length < 2) {
      setMsg('Enter an album title.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = await saveGalleryAlbum(userProfile, {
        ...form,
        id: selectedId || undefined,
        publicationStatus: pubStatus,
      });
      setSelectedId(id);
      setForm((p) => ({ ...p, publicationStatus: pubStatus }));
      setMsg(`Album saved (${pubStatus}).`);
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  const movePhoto = (idx: number, delta: -1 | 1) => {
    setForm((prev) => {
      const arr = [...prev.photos];
      const next = idx + delta;
      if (next < 0 || next >= arr.length) return prev;
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return { ...prev, photos: arr.map((p, i) => ({ ...p, order: i + 1 })) };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Albums ({galleries.length})</h2>
          {canEdit && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#05070D]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              New
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {galleries.map((alb) => (
            <div
              key={alb.id}
              onClick={() => {
                setSelectedId(alb.id);
                setForm({
                  title: alb.title,
                  description: alb.description || '',
                  leosticYear: alb.leosticYear,
                  date: alb.date,
                  coverUrl: alb.coverUrl,
                  coverAlt: alb.coverAlt,
                  photos: alb.photos || [],
                  consentConfirmed: Boolean(alb.consentConfirmed),
                  publicationStatus: alb.publicationStatus,
                });
              }}
              className={`rounded-xl border p-3 cursor-pointer ${
                selectedId === alb.id
                  ? 'border-[#E8AF25] bg-[#7A184D]/20'
                  : 'border-white/10 bg-[#05070D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-white">{alb.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {alb.photos.length} photos · <span className="text-[#F3D754]">{alb.publicationStatus}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteCollectionRecord(userProfile, 'galleryAlbums', alb.id, alb.title);
                      if (selectedId === alb.id) reset();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          {selectedId ? 'Edit Gallery Album' : 'Create Gallery Album'}
        </h2>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Album Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="sm:col-span-2 min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={form.leosticYear}
            onChange={(e) => setForm({ ...form, leosticYear: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            {settings.availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Cover Alt Text"
            value={form.coverAlt}
            onChange={(e) => setForm({ ...form, coverAlt: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
        </div>
        <MediaUploader
          kind="image"
          visibility="public"
          module="gallery"
          recordId={selectedId || 'album'}
          multiple
          label="Upload Album Photos (JPG/PNG/WebP <= 20 MB)"
          onUploaded={({ url, storagePath, fileName }) => {
            const cleanName = fileName.replace(/\.[^.]+$/, '');
            setForm((prev) => ({
              ...prev,
              coverUrl: prev.coverUrl || url,
              coverAlt: prev.coverAlt || cleanName,
              photos: [
                ...prev.photos,
                {
                  id: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  url,
                  storagePath,
                  caption: '',
                  altText: cleanName,
                  order: prev.photos.length + 1,
                },
              ],
            }));
          }}
        />
        {form.photos.length > 0 && (
          <div className="space-y-2">
            {form.photos.map((photo, idx) => (
              <div key={photo.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#05070D] p-2.5">
                <img src={photo.url} alt={photo.altText} className="h-12 w-16 object-cover rounded" />
                <input
                  type="text"
                  placeholder="Caption"
                  value={photo.caption}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      photos: p.photos.map((x) => (x.id === photo.id ? { ...x, caption: e.target.value } : x)),
                    }))
                  }
                  className="flex-1 rounded-lg border border-white/12 bg-[#0B0F1A] px-2.5 py-1.5 text-xs text-white"
                />
                <button type="button" onClick={() => movePhoto(idx, -1)} className="p-1 text-slate-400 hover:text-white">
                  <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => movePhoto(idx, 1)} className="p-1 text-slate-400 hover:text-white">
                  <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, photos: p.photos.filter((x) => x.id !== photo.id) }))
                  }
                  className="p-1 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex items-center gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            checked={form.consentConfirmed}
            onChange={(e) => setForm({ ...form, consentConfirmed: e.target.checked })}
          />
          <span>I confirm participant photography & privacy consent is verified for every image.</span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {canEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('draft')}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
            >
              Save Draft
            </button>
          )}
          {canPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('published')}
              className="rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D]"
            >
              Publish Album
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 4. News Manager ──
export function AdminNewsTab({
  userProfile,
  settings,
  news,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  news: NewsArticle[];
}) {
  const canEdit = canRolePerform(userProfile.role, 'editContent');
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    date: new Date().toISOString().slice(0, 10),
    leosticYear: settings.currentLeosticYear,
    coverUrl: '',
    publicationStatus: 'draft' as PublicationStatus,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelectedId(null);
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      date: new Date().toISOString().slice(0, 10),
      leosticYear: settings.currentLeosticYear,
      coverUrl: '',
      publicationStatus: 'draft',
    });
  };

  const handleSave = async (nextPub?: PublicationStatus) => {
    const pubStatus = nextPub || form.publicationStatus;
    if (!canTransitionPublicationStatus(userProfile.role, pubStatus)) {
      setMsg('Only President, Secretary, or Super Admin can publish news.');
      return;
    }
    if (form.title.trim().length < 2 || form.excerpt.trim().length < 10 || form.body.trim().length < 10) {
      setMsg('Enter a title, excerpt (10+ chars), and article body (10+ chars).');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = await saveNewsArticle(userProfile, {
        ...form,
        id: selectedId || undefined,
        publicationStatus: pubStatus,
      });
      setSelectedId(id);
      setForm((p) => ({ ...p, publicationStatus: pubStatus }));
      setMsg(`News article saved (${pubStatus}).`);
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">News ({news.length})</h2>
          {canEdit && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#05070D]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              New
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setForm({
                  title: item.title,
                  slug: item.slug,
                  excerpt: item.excerpt,
                  body: item.body,
                  date: item.date,
                  leosticYear: item.leosticYear,
                  coverUrl: item.coverUrl || '',
                  publicationStatus: item.publicationStatus,
                });
              }}
              className={`rounded-xl border p-3 cursor-pointer ${
                selectedId === item.id
                  ? 'border-[#E8AF25] bg-[#7A184D]/20'
                  : 'border-white/10 bg-[#05070D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{item.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {item.date} · <span className="text-[#F3D754]">{item.publicationStatus}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteCollectionRecord(userProfile, 'news', item.id, item.title);
                      if (selectedId === item.id) reset();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          {selectedId ? 'Edit News Update' : 'Create News Update'}
        </h2>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Headline *"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
                slug: selectedId ? form.slug : generateSlug(e.target.value),
              })
            }
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="URL Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 font-mono text-xs text-[#F3D754]"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={form.leosticYear}
            onChange={(e) => setForm({ ...form, leosticYear: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            {settings.availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
        <textarea
          rows={2}
          placeholder="Short excerpt * (min 10 characters)"
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <textarea
          rows={5}
          placeholder="Full update body * (min 10 characters)"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <input
            type="url"
            placeholder="Cover Image URL (optional)"
            value={form.coverUrl}
            onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-xs text-white"
          />
          <MediaUploader
            kind="image"
            visibility="public"
            module="news"
            recordId={selectedId || form.slug || 'news'}
            label="Upload Cover Image"
            onUploaded={({ url }) => setForm((p) => ({ ...p, coverUrl: url }))}
          />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('draft')}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
            >
              Save Draft
            </button>
          )}
          {canPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('published')}
              className="rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D]"
            >
              Publish Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 5. Publications / Magazines Manager ──
export function AdminPublicationsTab({
  userProfile,
  settings,
  publications,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  publications: Publication[];
}) {
  const canEdit = canRolePerform(userProfile.role, 'editContent');
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    issue: '',
    type: 'newsletter' as Publication['type'],
    description: '',
    date: new Date().toISOString().slice(0, 10),
    leosticYear: settings.currentLeosticYear,
    coverUrl: '',
    pdfUrl: '',
    publicationStatus: 'draft' as PublicationStatus,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelectedId(null);
    setForm({
      title: '',
      issue: '',
      type: 'newsletter',
      description: '',
      date: new Date().toISOString().slice(0, 10),
      leosticYear: settings.currentLeosticYear,
      coverUrl: '',
      pdfUrl: '',
      publicationStatus: 'draft',
    });
  };

  const handleSave = async (nextPub?: PublicationStatus) => {
    const pubStatus = nextPub || form.publicationStatus;
    if (!canTransitionPublicationStatus(userProfile.role, pubStatus)) {
      setMsg('Only President, Secretary, or Super Admin can publish magazines.');
      return;
    }
    if (form.title.trim().length < 2 || form.description.trim().length < 5) {
      setMsg('Enter a title and description.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = await savePublication(userProfile, {
        ...form,
        id: selectedId || undefined,
        publicationStatus: pubStatus,
      });
      setSelectedId(id);
      setForm((p) => ({ ...p, publicationStatus: pubStatus }));
      setMsg(`Publication saved (${pubStatus}).`);
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            Magazines ({publications.length})
          </h2>
          {canEdit && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#05070D]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              New
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {publications.map((pub) => (
            <div
              key={pub.id}
              onClick={() => {
                setSelectedId(pub.id);
                setForm({
                  title: pub.title,
                  issue: pub.issue || '',
                  type: pub.type,
                  description: pub.description,
                  date: pub.date,
                  leosticYear: pub.leosticYear,
                  coverUrl: pub.coverUrl || '',
                  pdfUrl: pub.pdfUrl || '',
                  publicationStatus: pub.publicationStatus,
                });
              }}
              className={`rounded-xl border p-3 cursor-pointer ${
                selectedId === pub.id
                  ? 'border-[#E8AF25] bg-[#7A184D]/20'
                  : 'border-white/10 bg-[#05070D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-white">{pub.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {pub.type} · <span className="text-[#F3D754]">{pub.publicationStatus}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteCollectionRecord(userProfile, 'publications', pub.id, pub.title);
                      if (selectedId === pub.id) reset();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          {selectedId ? 'Edit Magazine / Publication' : 'Add Magazine / Publication'}
        </h2>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Issue Label (e.g. Vol. 04 · Issue 02)"
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as Publication['type'] })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            <option value="newsletter">Newsletter / Magazine</option>
            <option value="annual-report">Annual Report</option>
            <option value="bulletin">Bulletin</option>
          </select>
          <select
            value={form.leosticYear}
            onChange={(e) => setForm({ ...form, leosticYear: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            {settings.availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
        </div>
        <textarea
          rows={3}
          placeholder="Description *"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Cover Artwork URL"
              value={form.coverUrl}
              onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
              className="w-full min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
            />
            <MediaUploader
              kind="image"
              visibility="public"
              module="publications"
              recordId={selectedId || 'pub'}
              label="Upload Magazine Cover"
              onUploaded={({ url }) => setForm((p) => ({ ...p, coverUrl: url }))}
            />
          </div>
          <div className="space-y-2">
            <input
              type="url"
              placeholder="Public PDF URL"
              value={form.pdfUrl}
              onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
              className="w-full min-h-[40px] rounded-xl border border-white/12 bg-[#05070D] px-3 text-xs text-white"
            />
            <MediaUploader
              kind="document"
              visibility="public"
              module="publications"
              recordId={selectedId || 'pub'}
              label="Upload Public PDF"
              onUploaded={({ url }) => setForm((p) => ({ ...p, pdfUrl: url }))}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {canEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('draft')}
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white"
            >
              Save Draft
            </button>
          )}
          {canPublish && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave('published')}
              className="rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D]"
            >
              Publish Magazine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 6. Awards & Achievements Manager ──
export function AdminAwardsTab({
  userProfile,
  settings,
  achievements,
  awardCategories,
}: {
  userProfile: UserProfile;
  settings: SiteSettings;
  achievements: Achievement[];
  awardCategories: TaxonomyItem[];
}) {
  const canPublish = canRolePerform(userProfile.role, 'publish');
  const canDelete = canRolePerform(userProfile.role, 'delete');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    awardBody: 'Leo District 306 D7',
    category: awardCategories[0]?.name || '',
    leosticYear: settings.currentLeosticYear,
    date: '',
    description: '',
    visible: true,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setSelectedId(null);
    setForm({
      title: '',
      awardBody: 'Leo District 306 D7',
      category: awardCategories[0]?.name || '',
      leosticYear: settings.currentLeosticYear,
      date: '',
      description: '',
      visible: true,
    });
  };

  const handleSave = async () => {
    if (!canPublish) {
      setMsg('Only President, Secretary, or Super Admin can record verified awards.');
      return;
    }
    if (form.title.trim().length < 2 || form.awardBody.trim().length < 2) {
      setMsg('Enter an award title and awarding body.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const id = await saveAchievement(userProfile, { ...form, id: selectedId || undefined });
      setSelectedId(id);
      setMsg(`Saved award "${form.title}".`);
    } catch (err) {
      setMsg(formatFriendlyFirebaseError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0B0F1A] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Awards ({achievements.length})</h2>
          {canPublish && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#05070D]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add Award
            </button>
          )}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto">
          {achievements.map((aw) => (
            <div
              key={aw.id}
              onClick={() => {
                setSelectedId(aw.id);
                setForm({
                  title: aw.title,
                  awardBody: aw.awardBody,
                  category: aw.category || '',
                  leosticYear: aw.leosticYear,
                  date: aw.date || '',
                  description: aw.description || '',
                  visible: aw.visible,
                });
              }}
              className={`rounded-xl border p-3 cursor-pointer ${
                selectedId === aw.id
                  ? 'border-[#E8AF25] bg-[#7A184D]/20'
                  : 'border-white/10 bg-[#05070D]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-white">{aw.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {aw.awardBody} · <span className="text-[#F3D754]">{aw.leosticYear}</span>
                  </div>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteCollectionRecord(userProfile, 'achievements', aw.id, aw.title);
                      if (selectedId === aw.id) reset();
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0B0F1A] p-6 space-y-4">
        <h2 className="font-display text-xl font-bold text-white">
          {selectedId ? 'Edit Verified Award' : 'Record Verified Award'}
        </h2>
        {msg && <div className="rounded-xl border border-[#E8AF25]/35 bg-[#E8AF25]/10 px-4 py-2.5 text-xs text-white">{msg}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Award Citation Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Awarding Body (e.g. Leo District 306 D7) *"
            value={form.awardBody}
            onChange={(e) => setForm({ ...form, awardBody: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            <option value="">Select Award Category</option>
            {awardCategories.filter((c) => c.active).map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <select
            value={form.leosticYear}
            onChange={(e) => setForm({ ...form, leosticYear: e.target.value })}
            className="min-h-[42px] rounded-xl border border-white/12 bg-[#05070D] px-3.5 text-sm text-white"
          >
            {settings.availableYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
        <textarea
          rows={3}
          placeholder="Citation details (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-xl border border-white/12 bg-[#05070D] p-3 text-sm text-white"
        />
        <label className="inline-flex items-center gap-2 text-xs text-slate-200">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => setForm({ ...form, visible: e.target.checked })}
          />
          <span>Display publicly in Key Awards & /awards archive</span>
        </label>
        <div>
          <button
            type="button"
            disabled={!canPublish || saving}
            onClick={() => void handleSave()}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E8AF25] px-5 py-2 text-xs font-semibold text-[#05070D] disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{saving ? 'Saving...' : 'Save Award'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
