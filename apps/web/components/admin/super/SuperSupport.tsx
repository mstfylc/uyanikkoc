// Süper Admin — Destek & Sistem + Ekip & Erişim. apps/web/components/admin/super/SuperSupport.tsx
// Prototip kaynağı: admin/superadmin2.jsx (SASupport). Yeni: sistem notları, ekip & erişim rolleri,
// "Destek yetkilisi" rolü (yalnızca burada yazabilir).
"use client";

import { useState } from "react";

import { Icon, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { InvitePersonDialog } from "@/components/admin/dialogs";
import { TicketStatusBadge, TicketThread } from "./TicketThread";
import { canEdit } from "@/components/admin/selectors";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort } from "@/lib/admin/format";
import type { AdminAccess, SupportTicket } from "@/lib/admin/types";

const SERVICES = [
  { l: "Uygulama (web)", up: true },
  { l: "Mobil API", up: true },
  { l: "Ödeme servisi (iyzico)", up: true },
  { l: "Bildirim servisi", up: true },
  { l: "Online deneme motoru", up: false },
  { l: "Raporlama", up: true },
];
const AUTHOR = "Platform Ekibi";

export function SuperSupport() {
  const { snapshot, mutate, toast, setViewerAccess } = useAdminStore();
  const [note, setNote] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const fullAccess = canEdit(snapshot.viewerAccess);
  const openTickets = snapshot.tickets.filter((t) => t.status !== "resolved");
  // açık modaldaki bilet güncel snapshot'tan tazelenir
  const liveTicket = activeTicket ? snapshot.tickets.find((t) => t.id === activeTicket.id) ?? null : null;

  const addNote = async () => {
    if (!note.trim()) return;
    await mutate({ kind: "addSystemNote", text: note.trim(), author: AUTHOR });
    setNote("");
    toast("Sistem notu eklendi", { icon: "ki-notepad-edit" });
  };

  return (
    <div className="stack rise">
      <UkPageHead
        title="Destek & Sistem Durumu"
        sub="Açık talepler, sistem notları ve servis sağlığı"
        actions={
          <div className="seg" role="tablist" aria-label="Görüntüleme rolü" title="Demo: görüntüleme rolü">
            <button type="button" className={fullAccess ? "on" : ""} onClick={() => setViewerAccess("full")}>
              <Icon name="shield" size={15} />Tam yetki
            </button>
            <button type="button" className={!fullAccess ? "on" : ""} onClick={() => setViewerAccess("support")}>
              <Icon name="message" size={15} />Destek yetkilisi
            </button>
          </div>
        }
      />

      {!fullAccess ? (
        <div className="alert-strip">
          <span className="as-ic"><Icon name="lock" size={16} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>Destek yetkilisi modu</b>
            <div className="muted" style={{ fontSize: 12.5 }}>Bu rol yalnızca destek taleplerini yanıtlar ve sistem notu ekler; diğer ekranlar salt görüntülenir.</div>
          </div>
        </div>
      ) : null}

      <div className="grid col-main">
        <div className="stack">
          <UkSection
            title="Destek talepleri"
            sub={`${openTickets.length} açık · ${snapshot.tickets.length} toplam`}
          >
            <div className="card-body" style={{ padding: 0 }}>
              {snapshot.tickets.map((t) => {
                const last = t.messages[t.messages.length - 1];
                return (
                  <button key={t.id} type="button" className="list-row" style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setActiveTicket(t)}>
                    <span className={`stat-icon tone-${t.tone}`} style={{ width: 38, height: 38 }}>
                      <Icon name="message" size={18} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13.5, display: "block" }}>{t.subj}</b>
                      <span className="muted" style={{ fontSize: 12, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.id} · {t.org} · {last ? (last.role === "agent" ? "Siz: " : "") + last.text : ""}
                      </span>
                    </div>
                    <div className="row" style={{ gap: 7 }}>
                      <span className={`badge badge-${t.tone}`} style={{ height: 22 }}>{t.priority}</span>
                      <TicketStatusBadge status={t.status} />
                      {t.messages.length > 1 ? <span className="muted tnum" style={{ fontSize: 11 }}><Icon name="message" size={12} /> {t.messages.length}</span> : null}
                    </div>
                    <Icon name="chevronRight" size={16} style={{ color: "var(--faint)" }} />
                  </button>
                );
              })}
            </div>
          </UkSection>

          <UkSection title="Sistem notları" sub="Ekip içi duyuru ve bakım notları">
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="row" style={{ gap: 8, alignItems: "flex-start" }}>
                <textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Yeni sistem notu / duyuru ekle…" style={{ flex: 1, resize: "vertical" }} />
                <button type="button" className="btn btn-primary" onClick={addNote} disabled={!note.trim()} style={{ flexShrink: 0 }}>
                  <Icon name="plus" size={16} />Ekle
                </button>
              </div>
              <div className="stack" style={{ gap: 9 }}>
                {snapshot.systemNotes.map((n) => (
                  <div key={n.id} className="fb-card">
                    <div className="fb-head">
                      <span className={`stat-icon tone-${n.pinned ? "warning" : "primary"}`} style={{ width: 30, height: 30 }}>
                        <Icon name={n.pinned ? "flag" : "notebook"} size={15} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 12.5 }}>{n.author}</b>
                        <div className="muted" style={{ fontSize: 11 }}>{fmtShort(n.date)}</div>
                      </div>
                      <button type="button" className="icon-btn" style={{ width: 30, height: 30 }} title="Sil" onClick={async () => { await mutate({ kind: "deleteSystemNote", noteId: n.id }); toast("Not silindi", { icon: "ki-information-2", tone: "warning" }); }}>
                        <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />
                      </button>
                    </div>
                    <p className="fb-quote">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </UkSection>
        </div>

        <div className="stack">
          <UkSection title="Sistem durumu" action={<span className="badge badge-success"><span className="dot-live" />Çoğu servis çalışıyor</span>}>
            <div className="card-body" style={{ padding: 0 }}>
              {SERVICES.map((s, i) => (
                <div key={i} className="kpi-row" style={{ padding: "13px 18px" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.l}</span>
                  <span className={`badge badge-${s.up ? "success" : "warning"}`} style={{ height: 22 }}>
                    {s.up ? <><span className="dot-live" />Çalışıyor</> : <><Icon name="alert" size={12} />Bakımda</>}
                  </span>
                </div>
              ))}
            </div>
          </UkSection>

          <UkSection
            title="Ekip & Erişim"
            sub="Platform ekibi ve yetki seviyeleri"
            action={fullAccess ? <button type="button" className="btn btn-light btn-sm" onClick={() => setInviteOpen(true)}><Icon name="plus" size={15} />Üye davet et</button> : null}
          >
            <div className="card-body" style={{ padding: 0 }}>
              {snapshot.team.map((member) => (
                <div key={member.id} className="list-row">
                  <UkAvatar name={member.name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>
                      {member.name}
                      {member.status === "invited" ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Davetli</span> : null}
                    </b>
                    <span className="muted" style={{ fontSize: 12 }}>{member.email}</span>
                  </div>
                  {fullAccess ? (
                    <select
                      className="input"
                      style={{ width: 150, height: 34, fontSize: 12.5 }}
                      value={member.access}
                      onChange={async (e) => { await mutate({ kind: "setAdminAccess", memberId: member.id, access: e.target.value as AdminAccess }); toast("Erişim güncellendi", { icon: "ki-shield-tick" }); }}
                    >
                      <option value="full">Tam yetki</option>
                      <option value="support">Destek yetkilisi</option>
                    </select>
                  ) : (
                    <span className={`badge badge-${member.access === "full" ? "primary" : "muted"}`} style={{ height: 22 }}>
                      {member.access === "full" ? "Tam yetki" : "Destek"}
                    </span>
                  )}
                  {fullAccess ? (
                    <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} title="Kaldır" onClick={async () => { await mutate({ kind: "removeAdminMember", memberId: member.id }); toast("Üye kaldırıldı", { icon: "ki-information-2", tone: "warning" }); }}>
                      <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </UkSection>
        </div>
      </div>

      {inviteOpen ? (
        <InvitePersonDialog
          title="Platform ekibine davet et"
          roleMode="adminAccess"
          onClose={() => setInviteOpen(false)}
          onSubmit={async ({ name, email, value }) => {
            await mutate({ kind: "inviteAdminMember", name, email, access: value as AdminAccess });
            toast("Davet gönderildi", { icon: "ki-send" });
          }}
        />
      ) : null}
      {liveTicket ? <TicketThread ticket={liveTicket} onClose={() => setActiveTicket(null)} /> : null}
    </div>
  );
}
