/* Öğrenci → koç değerlendirme & geri bildirim. Öğrenci yıldız verir + yorum
   yazar; koç ortalamayı ve yorumları görür. localStorage'da kalıcı. */

const RATING_KEY = "uk_coach_ratings_v1";
let _ratings = (() => { try { const s = localStorage.getItem(RATING_KEY); if (s) return JSON.parse(s); } catch (e) {} return {
  "Mert Demir": { stars: 5, comment: "Hocam çok ilgili, her sorumu hemen yanıtlıyor. Netlerim ciddi yükseldi!", at: Date.now() - 3 * 86400000 },
  "Zeynep Kaya": { stars: 4, comment: "Program çok düzenli ama bazen randevu bulmakta zorlanıyorum.", at: Date.now() - 6 * 86400000 },
  "Can Aydın": { stars: 5, comment: "Motivasyonumu hep yüksek tutuyor, teşekkürler.", at: Date.now() - 9 * 86400000 },
}; })();
const _raListeners = new Set();
function persistRatings() { try { localStorage.setItem(RATING_KEY, JSON.stringify(_ratings)); } catch (e) {} _raListeners.forEach((l) => l()); }
function useRatings() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _raListeners.add(l); return () => _raListeners.delete(l); }, []);
  return _ratings;
}
function setRating(student, stars, comment) {
  _ratings = { ..._ratings, [student]: { stars, comment: comment.trim(), at: Date.now() } };
  persistRatings();
  if (typeof pushNotif === "function") pushNotif("coach", { icon: "star", tone: "warning", title: "Yeni değerlendirme", desc: `${student} koçluğunu ${stars} yıldızla puanladı`, page: "students" });
}
function ratingStats() {
  const list = Object.entries(_ratings).map(([student, r]) => ({ student, ...r })).sort((a, b) => b.at - a.at);
  const avg = list.length ? list.reduce((a, r) => a + r.stars, 0) / list.length : 0;
  return { list, avg, count: list.length };
}

function Stars({ value, size = 18, onPick }) {
  return (
    <div className="row" style={{ gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        onPick
          ? <button key={n} type="button" onClick={() => onPick(n)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", lineHeight: 0, color: n <= value ? "var(--warning)" : "var(--faint)" }} aria-label={n + " yıldız"}><Icon name="star" size={size + 8} fill={n <= value} /></button>
          : <Icon key={n} name="star" size={size} fill={n <= Math.round(value)} style={{ color: n <= Math.round(value) ? "var(--warning)" : "var(--faint)" }} />
      ))}
    </div>
  );
}

/* ---- Öğrenci: Koçunu Değerlendir ---- */
function CoachRatingCard({ student, coachName }) {
  const ratings = useRatings();
  const existing = ratings[student];
  const [stars, setStars] = useState(existing?.stars || 0);
  const [comment, setComment] = useState(existing?.comment || "");
  const [editing, setEditing] = useState(!existing);
  useEffect(() => { setStars(existing?.stars || 0); setComment(existing?.comment || ""); }, [student]); // eslint-disable-line
  const save = () => { if (!stars) return; setRating(student, stars, comment); setEditing(false); if (typeof toast === "function") toast("Değerlendirmen kaydedildi · teşekkürler!", { icon: "star" }); };
  return (
    <Section title="Koçunu Değerlendir" sub={`${coachName || "Dilek Emen"} hakkındaki görüşlerin koçunun gelişimine yardımcı olur`} action={existing && !editing ? <Badge tone="success" icon="check">Gönderildi</Badge> : null}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {existing && !editing ? (
          <>
            <div className="row" style={{ gap: 12 }}><Stars value={existing.stars} size={20} /><span className="tnum" style={{ fontWeight: 800, fontSize: 15 }}>{existing.stars}.0</span></div>
            {existing.comment ? <div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.5, background: "var(--surface-3)", padding: "11px 14px", borderRadius: 11 }}>{existing.comment}</div> : null}
            <button className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => setEditing(true)}><Icon name="settings" size={14} />Değerlendirmeni düzenle</button>
          </>
        ) : (
          <>
            <div>
              <div className="muted" style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>PUANIN</div>
              <Stars value={stars} size={22} onPick={setStars} />
            </div>
            <div className="field"><label className="label">Geri bildirimin <span className="muted" style={{ fontWeight: 500 }}>(opsiyonel)</span></label>
              <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Koçunla ilgili görüş ve önerilerini yaz..." />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn btn-primary" disabled={!stars} onClick={save} style={{ opacity: stars ? 1 : 0.5 }}><Icon name="send" size={16} />Gönder</button>
              {existing ? <button className="btn btn-ghost" onClick={() => { setEditing(false); setStars(existing.stars); setComment(existing.comment); }}>Vazgeç</button> : null}
            </div>
          </>
        )}
      </div>
    </Section>
  );
}

/* ---- Koç: Öğrenci Geri Bildirimleri ---- */
function CoachRatingsSummary() {
  useRatings();
  const { list, avg, count } = ratingStats();
  return (
    <Section title="Öğrenci Geri Bildirimleri" sub={`${count} öğrenci değerlendirmesi`} action={<div className="row" style={{ gap: 8 }}><Stars value={avg} size={15} /><span className="tnum" style={{ fontWeight: 800, fontSize: 14 }}>{avg.toFixed(1)}</span></div>}>
      <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {list.length === 0 ? <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Henüz değerlendirme yok.</div>
          : list.map((r) => (
            <div key={r.student} className="lrow" style={{ alignItems: "flex-start" }}>
              <Avatar name={r.student} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="between"><b style={{ fontSize: 13, fontWeight: 700 }}>{r.student}</b><Stars value={r.stars} size={13} /></div>
                {r.comment ? <div style={{ fontSize: 12.5, color: "var(--text-2)", marginTop: 4, lineHeight: 1.45 }}>{r.comment}</div> : null}
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{new Date(r.at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</div>
              </div>
            </div>
          ))}
      </div>
    </Section>
  );
}

Object.assign(window, { useRatings, setRating, ratingStats, Stars, CoachRatingCard, CoachRatingsSummary });
