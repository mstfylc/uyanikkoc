// Süper Admin — Kampanyalar & Promosyon Kodları. apps/web/components/admin/super/SuperCampaigns.tsx
// Yeni modül: kampanya/kod oluştur, kullanıcılara (kurum/koç) tanımla.
"use client";

import { useState } from "react";

import { EmptyState, Icon, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { CreateCampaignDialog, GrantCampaignDialog } from "@/components/admin/dialogs";
import { canEdit } from "@/components/admin/selectors";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort, tl } from "@/lib/admin/format";
import type { Campaign, CampaignStatus } from "@/lib/admin/types";

function valueLabel(c: Campaign): string {
  if (c.type === "percent") return `%${c.value}`;
  if (c.type === "amount") return tl(c.value);
  return `${c.value} gün`;
}
function audienceLabel(a: Campaign["audience"]): string {
  return a === "all" ? "Tümü" : a === "orgs" ? "Kurumlar" : "Bireysel koçlar";
}
const STATUS_META: Record<CampaignStatus, { label: string; tone: string }> = {
  active: { label: "Aktif", tone: "success" },
  scheduled: { label: "Planlandı", tone: "info" },
  ended: { label: "Sona erdi", tone: "muted" },
};

export function SuperCampaigns() {
  const { snapshot, mutate, toast } = useAdminStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [grantFor, setGrantFor] = useState<Campaign | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const editable = canEdit(snapshot.viewerAccess);
  const { campaigns, campaignGrants } = snapshot;
  const active = campaigns.filter((c) => c.status === "active").length;
  const totalRedemptions = campaigns.reduce((s, c) => s + c.redemptions, 0);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Kampanyalar & Kodlar"
        sub="İndirim kampanyaları ve promosyon kodları oluştur, kullanıcılara tanımla"
        actions={
          editable ? (
            <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
              <Icon name="plus" size={16} />
              Yeni kampanya
            </button>
          ) : null
        }
      />

      <div className="grid g-3">
        <StatCard icon="bolt" tone="primary" value={active} label="Aktif kampanya" />
        <StatCard icon="check" tone="success" value={totalRedemptions} label="Toplam kullanım" />
        <StatCard icon="users" tone="info" value={campaignGrants.length} label="Tanımlanan kod" />
      </div>

      <div className="grid g-2">
        {campaigns.map((c) => {
          const meta = STATUS_META[c.status];
          return (
            <div key={c.id} className="card">
              <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                <div className="row" style={{ gap: 12 }}>
                  <span className="stat-icon tone-primary" style={{ flexShrink: 0 }}>
                    <Icon name="bolt" size={20} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <b style={{ fontSize: 15, fontWeight: 800 }}>{c.name}</b>
                      <span className={`badge badge-${meta.tone}`} style={{ height: 21, fontSize: 11 }}>{meta.label}</span>
                    </div>
                    <span className="muted" style={{ fontSize: 12.5 }}>{audienceLabel(c.audience)} · {fmtShort(c.startsAt)} – {fmtShort(c.endsAt)}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-600)" }}>{valueLabel(c)}</div>
                    <div className="muted" style={{ fontSize: 11 }}>indirim</div>
                  </div>
                </div>

                <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <code style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, fontWeight: 800, letterSpacing: ".06em", background: "var(--surface-3)", padding: "6px 12px", borderRadius: 8, border: "1px dashed var(--border-strong)" }}>
                    {c.code}
                  </code>
                  <span className="muted tnum" style={{ fontSize: 12 }}>
                    {c.redemptions}{c.maxRedemptions ? `/${c.maxRedemptions}` : ""} kullanım
                  </span>
                </div>

                {c.note ? <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.45 }}>{c.note}</p> : null}

                {editable ? (
                  <div className="row" style={{ gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setGrantFor(c)}>
                      <Icon name="send" size={14} />Kullanıcıya ver
                    </button>
                    {c.status === "active" ? (
                      <button type="button" className="btn btn-light btn-sm" onClick={async () => { await mutate({ kind: "setCampaignStatus", campaignId: c.id, status: "ended" }); toast("Kampanya sonlandırıldı", { icon: "ki-information-2" }); }}>Sonlandır</button>
                    ) : (
                      <button type="button" className="btn btn-light btn-sm" onClick={async () => { await mutate({ kind: "setCampaignStatus", campaignId: c.id, status: "active" }); toast("Kampanya etkinleştirildi", { icon: "ki-check-circle" }); }}>Etkinleştir</button>
                    )}
                    <button type="button" className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} onClick={async () => { await mutate({ kind: "deleteCampaign", campaignId: c.id }); toast("Kampanya silindi", { icon: "ki-information-2", tone: "danger" }); }}>
                      <Icon name="alert" size={14} />Sil
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      {campaigns.length === 0 ? <EmptyState icon="bolt" title="Henüz kampanya yok" sub="Yeni kampanya oluştur" /> : null}

      <UkSection title="Son tanımlanan kodlar" sub={`${campaignGrants.length} kayıt`}>
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          {campaignGrants.length === 0 ? (
            <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Henüz bir kullanıcıya kod tanımlanmadı.</p>
          ) : (
            <table className="tbl" style={{ minWidth: 560 }}>
              <thead>
                <tr><th>Kullanıcı</th><th>Tür</th><th>Kampanya</th><th>Tarih</th><th style={{ textAlign: "center" }}>Durum</th></tr>
              </thead>
              <tbody>
                {campaignGrants.map((g) => {
                  const camp = campaigns.find((c) => c.id === g.campaignId);
                  return (
                    <tr key={g.id}>
                      <td><b style={{ fontSize: 13 }}>{g.subjectName}</b></td>
                      <td><span className="muted" style={{ fontSize: 12.5 }}>{g.subjectKind === "org" ? "Kurum" : "Bireysel koç"}</span></td>
                      <td><span className="badge badge-muted" style={{ height: 22 }}>{camp?.code ?? "—"}</span></td>
                      <td><span className="muted tnum" style={{ fontSize: 12.5 }}>{fmtShort(g.grantedAt)}</span></td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`badge badge-${g.redeemed ? "success" : "info"}`} style={{ height: 22 }}>{g.redeemed ? "Kullanıldı" : "Tanımlı"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </UkSection>

      {createOpen ? <CreateCampaignDialog onClose={() => setCreateOpen(false)} /> : null}
      {grantFor ? (
        <GrantCampaignDialog
          campaignId={grantFor.id}
          campaignName={grantFor.name}
          orgs={snapshot.orgs.map((o) => ({ id: o.id, name: o.name }))}
          coaches={snapshot.coaches.map((c) => ({ id: c.id, name: c.name }))}
          onClose={() => setGrantFor(null)}
        />
      ) : null}
    </div>
  );
}
