"use client";

import { useState } from "react";

import { ConfirmModal, Icon, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore, useSnapshot } from "@/components/admin/AdminStore";
import { InvitePersonDialog, Modal } from "@/components/admin/dialogs";
import { KiIcon } from "@/components/design/KiIcon";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import type { AdminAccess, Integration } from "@/lib/admin/types";

const ACCESS_META: Record<AdminAccess, { label: string; tone: "primary" | "info"; icon: string; desc: string }> = {
  full: {
    label: "Tam yetki",
    tone: "primary",
    icon: "shield",
    desc: "Tum ekranlar, lisans, faturalama, ekip ve ayarlar dahil her sey.",
  },
  support: {
    label: "Destek yetkilisi",
    tone: "info",
    icon: "message",
    desc: "Destek & Sistem ve Demo & Uyelik taleplerini yonetir; diger ekranlarda salt goruntuleme.",
  },
};

function timeAgo(ts: number | null): string {
  if (!ts) return "-";
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "az once";
  if (h < 24) return `${h} saat once`;
  return `${Math.floor(h / 24)} gun once`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="muted" style={{ fontSize: 11.5, fontWeight: 700 }}>{label}</span>
      {children}
    </label>
  );
}

function IntegrationLogo({ item }: { item: Integration }) {
  return (
    <span style={{ width: 44, height: 44, borderRadius: 13, background: item.tone, color: "#fff", display: "grid", placeItems: "center", flexShrink: 0 }}>
      <Icon name={item.icon} size={20} />
    </span>
  );
}

function IntegrationModal({ item, onClose }: { item: Integration; onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const isWebhook = item.id === "webhook";
  const isJotform = item.id === "jotform";
  const [account, setAccount] = useState(item.account);
  const [formName, setFormName] = useState(item.formName);
  const [apiKey, setApiKey] = useState("");
  const ok = isWebhook || (isJotform ? apiKey.trim() && formName.trim() : account.trim() && formName.trim());

  async function apply() {
    if (isWebhook) {
      onClose();
      return;
    }
    await mutate({
      kind: "connectIntegration",
      integrationId: item.id,
      account: isJotform ? "jotform: bagli" : account,
      formName,
    });
    toast(`${item.name} baglandi`, { icon: "ki-check-circle", tone: "success" });
    onClose();
  }

  if (isWebhook) {
    return (
      <Modal title="Web Formu (Webhook)" sub="Kendi sitendeki formu bu adrese bagla" width={540} onClose={onClose} foot={<button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={onClose}>Tamam</button>}>
        <Field label="Webhook adresi (POST)">
          <input className="input" readOnly value={item.webhookUrl ?? ""} style={{ fontFamily: "monospace", fontSize: 12.5 }} />
        </Field>
        <div className="alert-strip">
          <span className="as-ic"><Icon name="bolt" size={18} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13 }}>Form alanlari</b>
            <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>ad, email, telefon, tip, plan ve not alanlari Demo & Uyelikler sayfasina yeni talep olarak duser.</div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={`${item.name} bagla`}
      sub={item.desc}
      width={500}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgec</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={() => void apply()}>
            <Icon name="check" size={16} />Bagla
          </button>
        </>
      }
    >
      {isJotform ? (
        <Field label="Jotform API anahtari"><input className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} /></Field>
      ) : (
        <Field label={item.id === "meta" ? "Reklam hesabi" : "Google Ads hesabi"}><input className="input" value={account} onChange={(e) => setAccount(e.target.value)} /></Field>
      )}
      <Field label="Baglanacak form"><input className="input" value={formName} onChange={(e) => setFormName(e.target.value)} /></Field>
      <div className="alert-strip">
        <span className="as-ic"><Icon name="bolt" size={18} /></span>
        <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>Otomatik aktarim</b><div className="muted" style={{ fontSize: 12 }}>Bu formdan gelen basvurular Demo & Uyelikler sayfasina duser.</div></div>
      </div>
    </Modal>
  );
}

function IntegrationCard({ item, editable, onManage, onDisconnect }: { item: Integration; editable: boolean; onManage: (item: Integration) => void; onDisconnect: (item: Integration) => void }) {
  return (
    <div className="card">
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        <div className="row" style={{ alignItems: "flex-start", gap: 13 }}>
          <IntegrationLogo item={item} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <b style={{ fontSize: 15, fontWeight: 800 }}>{item.name}</b>
              <span className={`badge badge-${item.connected ? "success" : "muted"}`} style={{ height: 21, fontSize: 11 }}>
                {item.connected ? <><span className="dot-live" />Bagli</> : "Bagli degil"}
              </span>
            </div>
            <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 5 }}>{item.desc}</p>
          </div>
        </div>
        {item.connected ? (
          <div className="stack" style={{ gap: 0, background: "var(--surface-2)", borderRadius: 12, padding: "4px 14px" }}>
            <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Bagli form</span><b style={{ fontSize: 12.5 }}>{item.formName || "-"}</b></div>
            <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Hesap</span><b style={{ fontSize: 12.5 }}>{item.account || "-"}</b></div>
            <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Son senkron</span><b className="tnum" style={{ fontSize: 12.5 }}>{timeAgo(item.lastSync)}</b></div>
            <div className="kpi-row" style={{ padding: "11px 0" }}><span className="muted" style={{ fontSize: 12.5 }}>Gelen basvuru</span><b className="tnum" style={{ fontSize: 13, color: "var(--primary-600)" }}>{item.leadCount}</b></div>
          </div>
        ) : null}
        {editable ? (
          <div className="row" style={{ gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <button type="button" className={item.connected ? "btn btn-light btn-sm" : "btn btn-primary btn-sm"} onClick={() => onManage(item)}>
              <Icon name={item.connected ? "settings" : "plus"} size={14} />{item.connected ? "Yonet" : "Bagla"}
            </button>
            {item.connected && item.id !== "webhook" ? <button type="button" className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => onDisconnect(item)}><Icon name="alert" size={14} />Baglantiyi kes</button> : null}
          </div>
        ) : (
          <div className="muted" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: 12 }}><Icon name="lock" size={13} /> Degisiklik icin tam yetki gerekir</div>
        )}
      </div>
    </div>
  );
}

export function SuperSettings() {
  const snapshot = useSnapshot();
  const { mutate, toast } = useAdminStore();
  const [tab, setTab] = useState<"team" | "sources">("team");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [manage, setManage] = useState<Integration | null>(null);
  const [disconnect, setDisconnect] = useState<Integration | null>(null);

  if (!snapshot) return <div className="card card-pad muted">Yukleniyor...</div>;

  const editable = snapshot.viewerAccess === "full";
  const fulls = snapshot.team.filter((member) => member.access === "full").length;
  const supports = snapshot.team.filter((member) => member.access === "support").length;
  const invited = snapshot.team.filter((member) => member.status === "invited").length;
  const connected = snapshot.integrations.filter((item) => item.connected).length;
  const totalLeads = snapshot.integrations.reduce((sum, item) => sum + (item.connected ? item.leadCount : 0), 0);

  return (
    <div className="stack rise">
      <UkPageHead title="Ayarlar" sub="Panel erisimi, roller ve basvuru kaynagi entegrasyonlari" />

      {!editable ? (
        <div className="alert-strip">
          <span className="as-ic"><Icon name="lock" size={16} /></span>
          <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Salt goruntuleme</b><div className="muted" style={{ fontSize: 12 }}>Destek yetkilisi ayarlari goruntuleyebilir; degisiklik icin tam yetki gerekir.</div></div>
        </div>
      ) : null}

      <div className="seg-tabs">
        <button type="button" className={`seg-tab${tab === "team" ? " on" : ""}`} onClick={() => setTab("team")}><Icon name="users" size={16} />Ekip & Erisim<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{snapshot.team.length}</span></button>
        <button type="button" className={`seg-tab${tab === "sources" ? " on" : ""}`} onClick={() => setTab("sources")}><Icon name="bolt" size={16} />Basvuru Kaynaklari<span className="tnum" style={{ marginLeft: 4, opacity: .6 }}>{connected}</span></button>
      </div>

      {tab === "team" ? (
        <div className="stack">
          <div className="grid g-3">
            <StatCard icon="shield" tone="primary" value={fulls} label="Tam yetkili" />
            <StatCard icon="message" tone="info" value={supports} label="Destek yetkilisi" />
            <StatCard icon="send" tone="warning" value={invited} label="Davet bekleyen" />
          </div>
          <div className="card">
            <div className="card-head">
              <div><h3>Super admin erisimi</h3><p className="sub">Panele erisebilecek kullanicilari ve rollerini yonetin</p></div>
              {editable ? <button type="button" className="btn btn-primary btn-sm" onClick={() => setInviteOpen(true)}><KiIcon name="ki-plus" />Kullanici davet et</button> : null}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {snapshot.team.map((member) => (
                <div key={member.id} className="list-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
                  <UkAvatar name={member.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{member.name}{member.status === "invited" ? <span className="badge badge-info" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Davet edildi</span> : null}</b>
                    <span className="muted" style={{ fontSize: 12 }}>{member.email} · {member.status === "invited" ? "henuz katilmadi" : `son giris ${timeAgo(member.lastActive)}`}</span>
                  </div>
                  {editable ? (
                    <select className="input" style={{ width: 168, height: 36, fontSize: 12.5 }} value={member.access} onChange={(e) => void mutate({ kind: "setAdminAccess", memberId: member.id, access: e.target.value as AdminAccess }).then(() => toast("Rol guncellendi", { icon: "ki-shield-tick" }))}>
                      <option value="full">Tam yetki</option>
                      <option value="support">Destek yetkilisi</option>
                    </select>
                  ) : (
                    <span className={`badge badge-${ACCESS_META[member.access].tone}`} style={{ height: 24 }}><Icon name={ACCESS_META[member.access].icon} size={12} />{ACCESS_META[member.access].label}</span>
                  )}
                  {editable ? <button type="button" className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => void mutate({ kind: "removeAdminMember", memberId: member.id }).then(() => toast("Kullanici kaldirildi", { icon: "ki-trash", tone: "warning" }))}><Icon name="plus" size={16} style={{ transform: "rotate(45deg)" }} /></button> : null}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-head"><div><h3>Roller ve yetkiler</h3><p className="sub">Tam yetki ve destek yetkilisi farklari</p></div></div>
            <div className="card-body stack" style={{ gap: 12 }}>
              {Object.entries(ACCESS_META).map(([key, role]) => (
                <div key={key} className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                  <span className={`stat-icon tone-${role.tone}`} style={{ width: 38, height: 38, flexShrink: 0 }}><Icon name={role.icon} size={18} /></span>
                  <div><b style={{ fontSize: 13.5 }}>{role.label}</b><p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 2 }}>{role.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div className="grid g-3">
            <StatCard icon="bolt" tone="primary" value={`${connected}/${snapshot.integrations.length}`} label="Bagli kaynak" />
            <StatCard icon="users" tone="success" value={totalLeads} label="Toplam gelen basvuru" />
            <StatCard icon="refresh" tone="info" value={snapshot.integrations.length - connected} label="Baglanabilir kaynak" />
          </div>
          <div className="alert-strip">
            <span className="as-ic"><Icon name="bell" size={16} /></span>
            <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>Basvurular tek yerde</b><div className="muted" style={{ fontSize: 12 }}>Bagli kaynaklardan gelen tum basvurular Demo & Uyelikler sayfasinda demo talebi olarak listelenir.</div></div>
          </div>
          <div className="grid g-2">
            {snapshot.integrations.map((item) => <IntegrationCard key={item.id} item={item} editable={editable} onManage={setManage} onDisconnect={setDisconnect} />)}
          </div>
        </div>
      )}

      {inviteOpen ? (
        <InvitePersonDialog
          title="Super admin ekibine davet et"
          roleMode="adminAccess"
          onClose={() => setInviteOpen(false)}
          onSubmit={({ name, email, value }) => void mutate({ kind: "inviteAdminMember", name, email, access: value as AdminAccess }).then(() => toast(`${name} davet edildi`, { icon: "ki-send", tone: "success" }))}
        />
      ) : null}
      {manage ? <IntegrationModal item={manage} onClose={() => setManage(null)} /> : null}
      <ConfirmModal
        open={!!disconnect}
        title="Baglantiyi kes?"
        tone="danger"
        body={disconnect ? `${disconnect.name} baglantisi kesilecek; bu kaynaktan yeni basvuru aktarimi duracak.` : ""}
        confirmLabel="Baglantiyi kes"
        onConfirm={() => { if (disconnect) void mutate({ kind: "disconnectIntegration", integrationId: disconnect.id }).then(() => toast("Baglanti kesildi", { icon: "ki-shield-cross", tone: "warning" })); }}
        onClose={() => setDisconnect(null)}
      />
    </div>
  );
}
