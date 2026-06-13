/* Randevu sistemi + öğrenci notları store'u. localStorage'da kalıcı. */

/* ---- Koç müsaitlik & ayarlar ---- */
const APPT_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const APPT_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const APPT_SETTINGS_KEY = "uk_appt_settings_v2";
const APPT_MODES = ["online", "yuzyuze", "telefon"];
let _apptSettings = (() => {
  try { const s = localStorage.getItem(APPT_SETTINGS_KEY); if (s) return JSON.parse(s); } catch (e) {}
  return {
    weeklyLimitStudent: 2,     // öğrenci haftalık max randevu (0 = sınırsız)
    weeklyLimitParent: 1,      // veli haftalık max randevu
    allowOnline: true,
    allowYuzyuze: true,
    allowTelefon: true,
    avail: {                   // gün -> { saat: [mod...] }
      "Pzt": { "16:00": ["online", "yuzyuze"], "17:00": ["online", "telefon"], "18:00": ["yuzyuze"] },
      "Sal": { "17:00": ["online"], "18:00": ["online", "telefon"], "19:00": ["yuzyuze"] },
      "Çar": { "16:00": ["online", "yuzyuze", "telefon"], "17:00": ["telefon"] },
      "Per": { "18:00": ["online"], "19:00": ["yuzyuze"], "20:00": ["online", "telefon"] },
      "Cum": { "16:00": ["online", "yuzyuze"], "17:00": ["online"], "18:00": ["telefon"] },
      "Cmt": { "10:00": ["yuzyuze"], "11:00": ["online", "yuzyuze"], "13:00": ["online"], "14:00": ["telefon"] },
    },
  };
})();
function allowedModes(s) { return APPT_MODES.filter((m) => s["allow" + m.charAt(0).toUpperCase() + m.slice(1)]); }
function availModes(s, day, slot) { const v = (s.avail || {})[day]; if (!v) return []; if (Array.isArray(v)) return v.includes(slot) ? allowedModes(s) : []; return v[slot] || []; }
function isAvail(s, day, slot) { return availModes(s, day, slot).length > 0; }
const _asListeners = new Set();
function getApptSettings() { return _apptSettings; }
function setApptSettings(patch) { _apptSettings = typeof patch === "function" ? patch(_apptSettings) : { ..._apptSettings, ...patch }; try { localStorage.setItem(APPT_SETTINGS_KEY, JSON.stringify(_apptSettings)); } catch (e) {} _asListeners.forEach((l) => l()); }
function toggleAvail(day, slot) {
  setApptSettings((s) => {
    const dayObj = Array.isArray(s.avail[day]) ? {} : { ...(s.avail[day] || {}) };
    if (Array.isArray(s.avail[day])) (s.avail[day] || []).forEach((sl) => { dayObj[sl] = allowedModes(s); });
    if (dayObj[slot]) delete dayObj[slot]; else dayObj[slot] = allowedModes(s);
    return { ...s, avail: { ...s.avail, [day]: dayObj } };
  });
}
function toggleSlotMode(day, slot, mode) {
  setApptSettings((s) => {
    const dayObj = Array.isArray(s.avail[day]) ? {} : { ...(s.avail[day] || {}) };
    if (Array.isArray(s.avail[day])) (s.avail[day] || []).forEach((sl) => { dayObj[sl] = allowedModes(s); });
    const cur = dayObj[slot] || [];
    const next = cur.includes(mode) ? cur.filter((x) => x !== mode) : [...cur, mode];
    if (next.length === 0) delete dayObj[slot]; else dayObj[slot] = next;
    return { ...s, avail: { ...s.avail, [day]: dayObj } };
  });
}
function useApptSettings() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _asListeners.add(l); return () => _asListeners.delete(l); }, []);
  return _apptSettings;
}

/* ---- Randevular ---- */
const APPT_KEY = "uk_appointments_v1";
let _appts = (() => { try { const s = localStorage.getItem(APPT_KEY); if (s) return JSON.parse(s); } catch (e) {} return [
  { id: "a1", student: "Elif Yıldız", day: "Pzt", slot: "17:00", mode: "yuzyuze", topic: "Türev konusunda zorlanıyorum", status: "approved", createdAt: Date.now() },
  { id: "a2", student: "Burak Demir", day: "Sal", slot: "18:00", mode: "online", topic: "AYT matematik strateji", status: "pending", createdAt: Date.now() },
  { id: "a3", student: "Zeynep Kaya", day: "Çar", slot: "16:00", mode: "online", topic: "Kimya net düşüşü", status: "pending", createdAt: Date.now() },
]; })();
const _apListeners = new Set();
function persistAppts() { try { localStorage.setItem(APPT_KEY, JSON.stringify(_appts)); } catch (e) {} _apListeners.forEach((l) => l()); }
function getAppts() { return _appts; }
function addAppt(a) { _appts = [{ id: "a" + Date.now(), createdAt: Date.now(), status: "pending", ...a }, ..._appts]; persistAppts(); }
function setApptStatus(id, status) { _appts = _appts.map((a) => a.id === id ? { ...a, status } : a); persistAppts(); }
function useAppts() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _apListeners.add(l); return () => _apListeners.delete(l); }, []);
  return _appts;
}
function weeklyApptCount(student) { return _appts.filter((a) => a.student === student && a.status !== "rejected" && a.status !== "cancelled").length; }

const APPT_MODE = { online: { label: "Online", icon: "ai", tone: "info" }, yuzyuze: { label: "Yüz yüze", icon: "users", tone: "primary" }, telefon: { label: "Telefon", icon: "phone", tone: "success" } };
const APPT_STATUS = {
  pending: { label: "Onay bekliyor", tone: "warning" },
  approved: { label: "Onaylandı", tone: "success" },
  rejected: { label: "Reddedildi", tone: "danger" },
  cancelled: { label: "İptal", tone: "muted" },
};

/* ---- Öğrenci notları (koç tarafı) ---- */
const NOTES_KEY = "uk_student_notes_v1";
let _notes = (() => { try { const s = localStorage.getItem(NOTES_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  "Elif Yıldız": [
    { id: "n1", text: "Türev konusunda görüşme yapıldı. Kural tekrarı için ek kaynak verildi.", kind: "gorusme", date: "1 Haz 2026", pinned: false },
    { id: "n2", text: "Deneme kaygısı var, sınav öncesi nefes egzersizi öner.", kind: "uyari", date: "28 May 2026", pinned: true },
  ],
}; })();
const _nListeners = new Set();
function persistNotes() { try { localStorage.setItem(NOTES_KEY, JSON.stringify(_notes)); } catch (e) {} _nListeners.forEach((l) => l()); }
function getNotes(student) { return _notes[student] || []; }
function addNote(student, note) { const cur = _notes[student] || []; _notes = { ..._notes, [student]: [{ id: "n" + Date.now(), date: new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }), pinned: false, ...note }, ...cur] }; persistNotes(); }
function removeNote(student, id) { _notes = { ..._notes, [student]: (_notes[student] || []).filter((n) => n.id !== id) }; persistNotes(); }
function togglePin(student, id) { _notes = { ..._notes, [student]: (_notes[student] || []).map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n) }; persistNotes(); }
function useNotes(student) {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _nListeners.add(l); return () => _nListeners.delete(l); }, []);
  return _notes[student] || [];
}
const NOTE_KINDS = { gorusme: { label: "Görüşme notu", tone: "primary", icon: "message" }, uyari: { label: "Uyarı", tone: "warning", icon: "alert" }, genel: { label: "Genel", tone: "muted", icon: "notebook" } };

Object.assign(window, {
  APPT_DAYS, APPT_SLOTS, APPT_MODE, APPT_STATUS, APPT_MODES,
  getApptSettings, setApptSettings, toggleAvail, toggleSlotMode, useApptSettings, allowedModes, availModes, isAvail,
  getAppts, addAppt, setApptStatus, useAppts, weeklyApptCount,
  getNotes, addNote, removeNote, togglePin, useNotes, NOTE_KINDS,
});
