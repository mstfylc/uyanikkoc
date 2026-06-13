/* ============================================================
   Mesajlaşma — rol bazlı, gruplu.
   • Koç: tüm öğrenci/veli birebir sohbetleri + tüm gruplar; grup oluşturur,
     üye ekler/çıkarır.
   • Öğrenci: yalnız koçuyla birebir + üyesi olduğu gruplar.
   • Veli: yalnız çocuğunun koçuyla birebir + üyesi olduğu gruplar.
   localStorage'da kalıcı.
   ============================================================ */

const COACH_NAME = "Dilek Emen";
const MSG_STUDENTS = ["Elif Yıldız", "Mert Demir", "Zeynep Kaya", "Can Aydın", "Ece Şahin", "Burak Çelik", "Selin Arslan", "Kaan Yılmaz"];
const MSG_PARENTS = [
  { name: "Ayşe Yıldız", child: "Elif Yıldız" }, { name: "Hakan Demir", child: "Mert Demir" },
  { name: "Sevgi Kaya", child: "Zeynep Kaya" }, { name: "Murat Aydın", child: "Can Aydın" },
  { name: "Deniz Şahin", child: "Ece Şahin" }, { name: "Aslı Çelik", child: "Burak Çelik" },
];
function parentRole(name) { return MSG_PARENTS.some((p) => p.name === name) ? "parent" : "student"; }

/* otomatik (canlı) yanıt havuzu — birebir sohbette karşı tarafı simüle eder */
const MSG_REPLIES = {
  coach:   ["Tamam, hemen bakıyorum.", "Eline sağlık, kontrol edip döneceğim.", "Güzel — bunu bu hafta önceliklendirelim.", "Not aldım, görüşmede detaylı konuşalım."],
  student: ["Tamam hocam 👍", "Anladım, hemen başlıyorum.", "Teşekkürler hocam!", "Bugün halledeceğim."],
  parent:  ["Teşekkür ederiz hocam.", "Bilgi için sağ olun.", "Takipteyiz, teşekkürler."],
};

const MSG_KEY = "uk_msg_v1";
function msgSeed() {
  const t = (h, m) => h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
  return {
    groups: [
      { id: "g1", name: "YKS Sayısal Grubu", desc: "11. sınıf sayısal öğrenciler", members: ["Elif Yıldız", "Mert Demir", "Can Aydın"], kind: "student" },
      { id: "g2", name: "11-A Veli Grubu", desc: "Veli duyuru ve bilgilendirme", members: ["Ayşe Yıldız", "Hakan Demir", "Sevgi Kaya"], kind: "parent" },
      { id: "g3", name: "Sınav Kampı 2026", desc: "Kamp katılımcıları ve velileri", members: ["Elif Yıldız", "Zeynep Kaya", "Ayşe Yıldız"], kind: "mixed" },
    ],
    threads: {
      "g1": [
        { from: COACH_NAME, role: "coach", t: "Bu hafta deneme analizlerini Cuma'ya kadar tamamlayalım 👍", time: t(9, 10) },
        { from: "Mert Demir", role: "student", t: "Hocam ben bitirdim, limitte hâlâ eksiğim var.", time: t(9, 24) },
        { from: "Elif Yıldız", role: "student", t: "Ben de bugün hallederim hocam.", time: t(9, 40) },
      ],
      "g2": [
        { from: COACH_NAME, role: "coach", t: "Sayın velilerimiz, bu haftaki gelişim raporları panele yüklendi.", time: t(18, 0) },
        { from: "Ayşe Yıldız", role: "parent", t: "Teşekkürler hocam, inceledik.", time: t(18, 22) },
      ],
      "g3": [
        { from: COACH_NAME, role: "coach", t: "Kamp programı pazartesi 09:00'da başlıyor, geç kalmayalım.", time: t(20, 5) },
      ],
      "dm:Elif Yıldız": [
        { from: COACH_NAME, role: "coach", t: "Elif, paragrafa biraz daha ağırlık verelim bu hafta.", time: t(11, 2) },
        { from: "Elif Yıldız", role: "student", t: "Tamam hocam, günde 2 paragraf testi çözüyorum.", time: t(11, 15) },
      ],
      "dm:Ayşe Yıldız": [
        { from: "Ayşe Yıldız", role: "parent", t: "Merhaba hocam, Elif'in bu haftaki gidişatı nasıl?", time: t(9, 12) },
        { from: COACH_NAME, role: "coach", t: "Merhaba, gayet iyi gidiyor. Matematik netleri yükseldi.", time: t(9, 20) },
      ],
      "dm:Mert Demir": [
        { from: "Mert Demir", role: "student", t: "Hocam AYT matematik denemesini yükledim, 34 net oldu.", time: t(13, 2) },
      ],
    },
  };
}

let _msg = (() => { try { const s = localStorage.getItem(MSG_KEY); if (s) return JSON.parse(s); } catch (e) {} return msgSeed(); })();
const _mListeners = new Set();
function persistMsg() { try { localStorage.setItem(MSG_KEY, JSON.stringify(_msg)); } catch (e) {} _mListeners.forEach((l) => l()); }
function useMsg() {
  const [, force] = React.useState(0);
  React.useEffect(() => { const l = () => force((x) => x + 1); _mListeners.add(l); return () => _mListeners.delete(l); }, []);
  return _msg;
}
function _msgRecipientRoles(channelId, senderRole) {
  if (channelId.indexOf("dm:") === 0) {
    const name = channelId.slice(3);
    return senderRole === "coach" ? [parentRole(name)] : ["coach"];
  }
  const g = (_msg.groups || []).find((x) => x.id === channelId);
  const roles = new Set();
  if (senderRole !== "coach") roles.add("coach");
  if (g) {
    if (g.members.some((m) => parentRole(m) === "student") && senderRole !== "student") roles.add("student");
    if (g.members.some((m) => parentRole(m) === "parent") && senderRole !== "parent") roles.add("parent");
  }
  return Array.from(roles);
}
function channelUnread(role, channelId) { return (_msg.unread && _msg.unread[role + "::" + channelId]) || 0; }
function markChannelRead(role, channelId) {
  const k = role + "::" + channelId;
  if (!_msg.unread || !_msg.unread[k]) return;
  const un = { ..._msg.unread }; delete un[k];
  _msg = { ..._msg, unread: un }; persistMsg();
}
function sendMsg(channelId, from, role, text, opts) {
  const time = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  const thread = _msg.threads[channelId] || [];
  const recips = _msgRecipientRoles(channelId, role);
  const un = { ...(_msg.unread || {}) };
  recips.forEach((r) => { const k = r + "::" + channelId; un[k] = (un[k] || 0) + 1; });
  _msg = { ..._msg, threads: { ..._msg.threads, [channelId]: [...thread, { from, role, t: text, time }] }, unread: un };
  persistMsg();
  if (!(opts && opts.silent) && typeof pushNotif === "function") {
    const isDm = channelId.indexOf("dm:") === 0;
    const g = isDm ? null : (_msg.groups || []).find((x) => x.id === channelId);
    const title = isDm ? (from + "’dan mesaj") : ((g ? g.name : "Grup") + " · " + from.split(" ")[0]);
    const desc = text.length > 64 ? text.slice(0, 64) + "…" : text;
    recips.forEach((r) => pushNotif(r, { icon: "message", tone: "info", title, desc, page: "messages" }));
  }
}
function createGroup(name, desc, members) {
  const id = "g" + Date.now();
  _msg = { ..._msg, groups: [..._msg.groups, { id, name, desc, members, kind: "custom" }] };
  persistMsg(); return id;
}
function updateGroupMembers(id, members) { _msg = { ..._msg, groups: _msg.groups.map((g) => g.id === id ? { ...g, members } : g) }; persistMsg(); }
function deleteGroup(id) { const th = { ..._msg.threads }; delete th[id]; _msg = { ..._msg, groups: _msg.groups.filter((g) => g.id !== id), threads: th }; persistMsg(); }

/* görünür kanallar (görünürlük = gönderme yetkisi) */
function channelsFor(me, role, msg) {
  const out = [];
  if (role === "coach") {
    msg.groups.forEach((g) => out.push({ id: g.id, type: "group", name: g.name, sub: g.members.length + " üye", members: g.members, group: g }));
    MSG_STUDENTS.forEach((s) => out.push({ id: "dm:" + s, type: "dm", name: s, sub: "Öğrenci", who: "Öğrenci" }));
    MSG_PARENTS.forEach((p) => out.push({ id: "dm:" + p.name, type: "dm", name: p.name, sub: "Veli · " + p.child.split(" ")[0] + "'in velisi", who: "Veli" }));
  } else {
    // koçla birebir
    out.push({ id: "dm:" + me, type: "dm", name: COACH_NAME, sub: "Koçun", who: "Koç", pinned: true });
    // üyesi olunan gruplar
    msg.groups.filter((g) => g.members.includes(me)).forEach((g) => out.push({ id: g.id, type: "group", name: g.name, sub: g.members.length + " üye", members: g.members, group: g }));
  }
  return out;
}

/* ---- Grup oluştur / üye yönet modalı (koç) ---- */
function GroupModal({ open, edit, onClose }) {
  const [name, setName] = useState(""); const [desc, setDesc] = useState("");
  const [members, setMembers] = useState([]);
  const [tab, setTab] = useState("student");
  useEffect(() => {
    if (open) { setName(edit ? edit.name : ""); setDesc(edit ? edit.desc : ""); setMembers(edit ? [...edit.members] : []); setTab("student"); }
  }, [open, edit]);
  if (!open) return null;
  const toggle = (n) => setMembers((m) => m.includes(n) ? m.filter((x) => x !== n) : [...m, n]);
  const pool = tab === "student" ? MSG_STUDENTS : MSG_PARENTS.map((p) => p.name);
  const ok = name.trim().length > 1 && members.length > 0;
  const save = () => {
    if (edit) { updateGroupMembers(edit.id, members); if (name.trim() !== edit.name || desc !== edit.desc) { _msg = { ..._msg, groups: _msg.groups.map((g) => g.id === edit.id ? { ...g, name: name.trim(), desc } : g) }; persistMsg(); } toast("Grup güncellendi"); }
    else { createGroup(name.trim(), desc.trim(), members); toast("Grup oluşturuldu: " + name.trim()); }
    onClose();
  };
  return ReactDOM.createPortal((
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 480, height: "min(620px, calc(100vh - 48px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}><span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}><Icon name="users" size={18} /></span><div><h3 style={{ fontSize: 15.5, fontWeight: 800 }}>{edit ? "Grubu Düzenle" : "Yeni Grup Oluştur"}</h3><div className="muted" style={{ fontSize: 12 }}>Öğrenci ve velileri gruba ata</div></div></div>
          <button className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat"><Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body" style={{ padding: "16px 20px", gap: 12 }}>
          <div className="field"><label className="label">Grup adı</label><input className="input" placeholder="ör. YKS Sayısal Grubu" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
          <div className="field"><label className="label">Açıklama (opsiyonel)</label><input className="input" placeholder="Kısa açıklama" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div>
            <div className="between" style={{ marginBottom: 8 }}>
              <label className="label" style={{ margin: 0 }}>Üyeler</label>
              <span className="badge badge-primary" style={{ height: 20, fontSize: 10.5 }}>{members.length} seçili</span>
            </div>
            <div className="seg" style={{ width: "fit-content", marginBottom: 8 }}>
              <button className={tab === "student" ? "on" : ""} onClick={() => setTab("student")}>Öğrenciler</button>
              <button className={tab === "parent" ? "on" : ""} onClick={() => setTab("parent")}>Veliler</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {pool.map((n) => {
                const on = members.includes(n);
                return (
                  <button key={n} className="src-item" style={{ background: on ? "var(--primary-soft)" : undefined }} onClick={() => toggle(n)}>
                    <Avatar name={n} size={28} />
                    <span style={{ flex: 1, textAlign: "left", fontWeight: 600, color: on ? "var(--primary-600)" : "var(--text)" }}>{n}</span>
                    <span className={`chk sm${on ? " done" : ""}`}><Icon name="check" size={11} stroke={3} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          {edit ? <button className="btn btn-ghost-danger" onClick={() => { if (confirm(`"${edit.name}" grubu silinsin mi?`)) { deleteGroup(edit.id); toast("Grup silindi"); onClose(); } }}>Grubu sil</button> : null}
          <button className="btn btn-primary" disabled={!ok} style={{ marginLeft: "auto", opacity: ok ? 1 : 0.5 }} onClick={save}><Icon name="check" size={16} />{edit ? "Kaydet" : "Grup Oluştur"}</button>
        </div>
      </div>
    </div>
  ), document.body);
}

/* ---- Ana mesajlar sayfası ---- */
function MessagesPage({ role }) {
  const msg = useMsg();
  const me = (typeof loadAuth === "function" && loadAuth()?.name) || (role === "coach" ? COACH_NAME : role === "parent" ? "Ayşe Yıldız" : "Elif Yıldız");
  const channels = channelsFor(me, role, msg);
  const [sel, setSel] = useState(channels[0]?.id);
  const [draft, setDraft] = useState("");
  const [groupModal, setGroupModal] = useState(null); // {edit} | {new:true}
  const [muted, setMuted] = useState(() => new Set());
  const [q, setQ] = useState("");
  const [typingCh, setTypingCh] = useState(null);
  const replyTimer = useRef(null);
  const bodyRef = useRef(null);

  const active = channels.find((c) => c.id === sel) || channels[0];
  const thread = (active && msg.threads[active.id]) || [];
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [thread.length, sel, typingCh]);
  useEffect(() => { if (active) markChannelRead(role, active.id); }, [sel, thread.length]); // eslint-disable-line
  useEffect(() => () => clearTimeout(replyTimer.current), []);

  const scheduleReply = (channel) => {
    if (muted.has(channel.id)) return;
    let otherName, otherRole;
    if (role === "coach") { otherName = channel.name; otherRole = parentRole(channel.name); }
    else { otherName = COACH_NAME; otherRole = "coach"; }
    setTypingCh(channel.id);
    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const pool = MSG_REPLIES[otherRole] || MSG_REPLIES.coach;
      sendMsg(channel.id, otherName, otherRole, pool[Math.floor(Math.random() * pool.length)]);
      setTypingCh(null);
    }, 1500 + Math.random() * 1200);
  };

  const send = (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    sendMsg(active.id, me, role, draft.trim());
    setDraft("");
    if (active.type === "dm") scheduleReply(active);
  };
  const filtered = channels.filter((c) => c.name.toLocaleLowerCase("tr-TR").includes(q.toLocaleLowerCase("tr-TR")));
  const groups = filtered.filter((c) => c.type === "group");
  const dms = filtered.filter((c) => c.type === "dm");

  const ChannelBtn = (c) => {
    const on = c.id === sel;
    const last = (msg.threads[c.id] || [])[(msg.threads[c.id] || []).length - 1];
    const un = channelUnread(role, c.id);
    return (
      <button key={c.id} onClick={() => setSel(c.id)} className={`chan-row${on ? " on" : ""}`}>
        {c.type === "group"
          ? <span className="chan-gico"><Icon name="users" size={18} /></span>
          : <Avatar name={c.name} size={42} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="between" style={{ gap: 6 }}>
            <b style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</b>
            {last ? <span style={{ fontSize: 11, color: un ? "var(--primary-600)" : "var(--faint)", flexShrink: 0 }}>{last.time}</span> : null}
          </div>
          <div className="between" style={{ gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 12, color: un ? "var(--text-2)" : "var(--muted)", fontWeight: un ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {last ? (last.from === me ? "Sen: " : (c.type === "group" ? last.from.split(" ")[0] + ": " : "")) + last.t : c.sub}
            </span>
            {un > 0 ? <span className="chan-unread">{un}</span> : null}
          </div>
        </div>
      </button>
    );
  };

  if (!active) return <div className="stack rise"><PageHead title="Mesajlar" sub="Henüz sohbet yok" /></div>;

  return (
    <div className="stack rise">
      <PageHead title="Mesajlar" sub={role === "coach" ? "Öğrenci, veli ve grup sohbetleri" : role === "parent" ? "Çocuğunun koçu ve grupların" : "Koçun ve grupların"} actions={role === "coach" ? <button className="btn btn-primary btn-sm" onClick={() => setGroupModal({ new: true })}><Icon name="plus" size={16} />Grup Oluştur</button> : null} />
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="msg-shell">
          {/* kanal listesi */}
          <div className="msg-list">
            <div style={{ padding: 12, borderBottom: "1px solid var(--border)" }}>
              <div className="searchbox" style={{ minWidth: 0, margin: 0, display: "flex" }}><Icon name="search" size={16} /><input placeholder="Sohbet ara..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
            </div>
            <div style={{ overflowY: "auto", flex: 1, padding: 8 }}>
              {groups.length > 0 ? <div className="msg-sec">Gruplar</div> : null}
              {groups.map(ChannelBtn)}
              {dms.length > 0 ? <div className="msg-sec">{role === "coach" ? "Birebir" : "Koçun"}</div> : null}
              {dms.map(ChannelBtn)}
            </div>
          </div>

          {/* sohbet */}
          <div className="msg-thread">
            <div className="row" style={{ gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
              {active.type === "group" ? <span className="chan-gico" style={{ width: 40, height: 40 }}><Icon name="users" size={18} /></span> : <Avatar name={active.name} size={40} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 14, fontWeight: 700 }}>{active.name}</b>
                <div style={{ fontSize: 12, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {active.type === "group" ? (active.members || []).map((m) => m.split(" ")[0]).join(", ") : active.sub}
                </div>
              </div>
              {active.type === "group" && role === "coach" ? <button className="btn btn-light btn-sm" onClick={() => setGroupModal({ edit: active.group })}><Icon name="users" size={14} />Üyeler</button> : null}
              <button className="icon-btn" style={{ width: 36, height: 36, color: muted.has(active.id) ? "var(--danger)" : undefined }} title={muted.has(active.id) ? "Bildirimleri aç" : "Bildirimleri sessize al"} onClick={() => { setMuted((s) => { const n = new Set(s); n.has(active.id) ? n.delete(active.id) : n.add(active.id); return n; }); toast(muted.has(active.id) ? "Bildirimler açıldı" : "Sohbet sessize alındı", { icon: "bell" }); }}><Icon name="bell" size={17} /></button>
            </div>

            <div ref={bodyRef} className="msg-body">
              {active.type === "group" ? <div className="msg-day">Grup · {(active.members || []).length} üye</div> : null}
              {thread.map((m, i) => {
                const mine = m.from === me;
                return (
                  <div key={i} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "74%" }}>
                    {!mine && active.type === "group" ? <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--primary-600)", margin: "0 0 3px 4px" }}>{m.from}{m.role === "coach" ? " · Koç" : m.role === "parent" ? " · Veli" : ""}</div> : null}
                    <div style={{ background: mine ? "var(--primary)" : "var(--surface)", color: mine ? "#fff" : "var(--text)", border: mine ? "none" : "1px solid var(--border)", padding: "10px 14px", borderRadius: mine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", fontSize: 13.5, lineHeight: 1.5, boxShadow: "var(--shadow-sm)" }}>{m.t}</div>
                    <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4, textAlign: mine ? "right" : "left" }}>{m.time}</div>
                  </div>
                );
              })}
              {typingCh === active.id ? (
                <div style={{ alignSelf: "flex-start", maxWidth: "74%" }}>
                  <div className="msg-typing"><span /><span /><span /></div>
                </div>
              ) : null}
            </div>

            <form onSubmit={send} className="row" style={{ gap: 10, padding: 14, borderTop: "1px solid var(--border)" }}>
              <input className="input" style={{ flex: 1 }} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={active.type === "group" ? active.name + " grubuna yaz..." : active.name + "'a mesaj yaz..."} />
              <button type="submit" className="btn btn-primary" style={{ width: 44, padding: 0, flexShrink: 0 }} disabled={!draft.trim()}><Icon name="send" size={17} /></button>
            </form>
          </div>
        </div>
      </div>

      <GroupModal open={!!groupModal} edit={groupModal?.edit} onClose={() => setGroupModal(null)} />
    </div>
  );
}

Object.assign(window, { MessagesPage, GroupModal, channelsFor, useMsg });
