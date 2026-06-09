// Süper Admin — Kurum detayı (drill-in). apps/web/components/admin/super/SuperOrgDetail.tsx
// Prototip kaynağı: admin/superadmin2.jsx (SAOrgDetail). Yeni: not + demo + detaylı yenileme.
"use client";

import Link from "next/link";
import { useState } from "react";

import {
  AdminTabs,
  ConfirmModal,
  Icon,
  LicenseHero,
  ModuleGrid,
  OrgLogo,
  RankBars,
  StatCard,
  StatusBadge,
  type TabDef,
} from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { canEdit } from "@/components/admin/selectors";
import { SubscriberNotes } from "./SubscriberNotes";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort, tl } from "@/lib/admin/format";
import { moduleName, ORG_PLANS } from "@/lib/admin/pricing";

export function SuperOrgDetail({ orgId }: { orgId: string }) {
  const { snapshot, mutate, toast } = useAdminStore();
  const [tab, setTab] = useState("ozet");
  const [confirm, setConfirm] = useState<string | null>(null);

  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;
  const o = snapshot.orgs.find((x) => x.id === orgId);
  if (!o) {
    return (
      <div className="stack rise">
        <Link href="/admin/orgs" className="link-btn">
          <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />
          Kurumlara dön
        </Link>
        <div className="empty-state">
          <Icon name="building" size={26} style={{ color: "var(--faint)" }} />
          <div style={{ fontWeight: 700 }}>Kurum bulunamadı</div>
        </div>
      </div>
    );
  }

  const editable = canEdit(snapshot.viewerAccess);
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);
  const TABS: TabDef[] = [
    { k: "ozet", label: "Özet", icon: "dashboard" },
    { k: "subeler", label: o.type === "franchise" ? "Şubeler" : "Şube", icon: "building", count: o.branches.length },
    { k: "lisans", label: "Lisans & Plan", icon: "shield" },
    { k: "moduller", label: "Modüller", icon: "bolt" },
  ];

  return (
    <div className="stack rise">
      <Link href="/admin/orgs" className="link-btn" style={{ alignSelf: "flex-start" }}>
        <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />
        Kurumlara dön
      </Link>

      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <OrgLogo name={o.name} tone={o.tone} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{o.name}</h1>
            <StatusBadge status={o.status} />
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            {o.type === "franchise" ? "Franchise ağı" : "Tek kurum"} · {o.city} · Sahip: {o.owner.name}
          </p>
        </div>
        {editable ? (
          <div className="row" style={{ gap: 9 }}>
            <button type="button" className="btn btn-light" onClick={() => toast(o.owner.email + " adresine yazıldı", { icon: "ki-messages" })}>
              <Icon name="message" size={16} />
              İletişim
            </button>
            {o.status === "suspended" ? (
              <button type="button" className="btn btn-primary" onClick={async () => { await mutate({ kind: "activateOrg", orgId: o.id }); toast("Lisans yeniden aktifleştirildi", { icon: "ki-check-circle" }); }}>
                <Icon name="refresh" size={16} />
                Aktifleştir
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={async () => { await mutate({ kind: "renewOrg", orgId: o.id }); toast("Lisans yenilendi", { icon: "ki-arrows-circle" }); }}>
                <Icon name="refresh" size={16} />
                Hızlı yenile
              </button>
            )}
          </div>
        ) : null}
      </div>

      <LicenseHero org={o} />
      <AdminTabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "ozet" ? (
        <div className="grid col-main">
          <div className="stack">
            <div className="grid g-3">
              <StatCard icon="cap" tone="primary" value={o.seats.used} label="Aktif öğrenci" />
              <StatCard icon="users" tone="info" value={o.coaches.used} label="Koç" />
              <StatCard icon="banknote" tone="success" value={tl(totalCollect)} label="Aylık tahsilat" />
            </div>
            <UkSection title="Şube performansı" sub="Aylık tahsilat karşılaştırması">
              <div className="card-body">
                <RankBars items={o.branches.map((b) => ({ l: b.name, v: b.collect }))} fmt={(v) => tl(v)} />
              </div>
            </UkSection>
            <SubscriberNotes
              subjectKind="org"
              subjectId={o.id}
              name={o.name}
              currentPlanId={o.planId}
              currentRenewsAt={o.renewsAt}
              giftedDemoUntil={o.giftedDemoUntil}
            />
          </div>
          <div className="stack">
            <UkSection title="Kurum bilgileri">
              <div className="card-body" style={{ padding: 0 }}>
                {[
                  ["Yetkili", o.owner.name],
                  ["E-posta", o.owner.email],
                  ["Telefon", o.owner.phone],
                  ["Sözleşme başlangıcı", fmtShort(o.startedAt)],
                ].map(([k, v]) => (
                  <div key={k} className="kpi-row" style={{ padding: "13px 18px" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>{k}</span>
                    <b style={{ fontSize: 13 }}>{v}</b>
                  </div>
                ))}
              </div>
            </UkSection>
            {editable ? (
              <UkSection title="Lisans işlemleri">
                <div className="card-body" style={{ gap: 9, display: "flex", flexDirection: "column" }}>
                  <button type="button" className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={() => setTab("lisans")}>
                    <Icon name="arrowUp" size={16} />
                    Planı yükselt / değiştir
                  </button>
                  <button type="button" className="btn btn-light" style={{ justifyContent: "flex-start" }} onClick={async () => { await mutate({ kind: "addOrgSeats", orgId: o.id, count: 25 }); toast("25 öğrenci koltuğu eklendi", { icon: "ki-plus" }); }}>
                    <Icon name="plus" size={16} />
                    Koltuk paketi ekle (+25)
                  </button>
                  <button type="button" className="btn btn-ghost-danger" style={{ justifyContent: "flex-start" }} onClick={() => setConfirm("suspend")}>
                    <Icon name="alert" size={16} />
                    Lisansı dondur
                  </button>
                </div>
              </UkSection>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === "subeler" ? (
        <UkSection
          title={o.type === "franchise" ? "Şubeler" : "Şube"}
          sub={`${o.branches.length} konum · toplam ${o.seats.used} öğrenci`}
        >
          <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
            <table className="tbl" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th>Şube</th>
                  <th>Öğrenci</th>
                  <th>Koç</th>
                  <th style={{ textAlign: "right" }}>Aylık tahsilat</th>
                  <th style={{ textAlign: "center" }}>Durum</th>
                </tr>
              </thead>
              <tbody>
                {o.branches.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="name">
                        <span className="org-logo" style={{ width: 34, height: 34, background: o.tone, fontSize: 12, borderRadius: 9 }}>
                          <Icon name="building" size={16} />
                        </span>
                        <div>
                          <b>{b.name}</b>
                          <span>{b.city}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="tnum" style={{ fontWeight: 700 }}>{b.students}</span></td>
                    <td><span className="tnum">{b.coaches}</span></td>
                    <td style={{ textAlign: "right" }}><span className="tnum" style={{ fontWeight: 700 }}>{tl(b.collect)}</span></td>
                    <td style={{ textAlign: "center" }}><StatusBadge status={b.status} sm /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </UkSection>
      ) : null}

      {tab === "lisans" ? (
        <UkSection title="Lisans planı" sub="Plan değişikliği anında kapasite ve modülleri günceller">
          <div className="card-body">
            <div className="grid g-3">
              {ORG_PLANS.map((pl) => {
                const sel = pl.id === o.planId;
                return (
                  <div
                    key={pl.id}
                    className={`lic-plan${sel ? " sel" : ""}`}
                    onClick={() => {
                      if (!sel && editable) {
                        void mutate({ kind: "changeOrgPlan", orgId: o.id, planId: pl.id });
                        toast(pl.name + " planına geçildi", { icon: "ki-check-circle" });
                      }
                    }}
                  >
                    {pl.popular ? <span className="lp-flag">Popüler</span> : null}
                    <h4>
                      <span className="plan-dot" style={{ background: pl.color }} />
                      {pl.name}
                    </h4>
                    <div className="lp-price tnum">
                      {tl(pl.monthly)}
                      <span className="per"> /ay</span>
                    </div>
                    <ul>
                      <li><Icon name="cap" size={14} />{pl.seats} öğrenci koltuğu</li>
                      <li><Icon name="users" size={14} />{pl.coaches} koç</li>
                      <li><Icon name="building" size={14} />{pl.branches} şubeye kadar</li>
                      <li><Icon name="bolt" size={14} />{pl.modules.length} modül</li>
                    </ul>
                    {sel ? (
                      <span className="badge badge-primary" style={{ alignSelf: "flex-start" }}>
                        <Icon name="check" size={13} />
                        Mevcut plan
                      </span>
                    ) : editable ? (
                      <span className="btn btn-outline btn-sm">Bu plana geç</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </UkSection>
      ) : null}

      {tab === "moduller" ? (
        <UkSection title="Modül erişimi" sub="Bu kuruma açık özellikleri yönet — değişiklikler anında uygulanır">
          <div className="card-body">
            <ModuleGrid
              modules={o.modules}
              readOnly={!editable}
              onToggle={(k) => {
                void mutate({ kind: "toggleOrgModule", orgId: o.id, moduleKey: k });
                toast(moduleName(k) + " " + (o.modules[k] ? "kapatıldı" : "açıldı"), { icon: "ki-flash" });
              }}
            />
          </div>
        </UkSection>
      ) : null}

      <ConfirmModal
        open={confirm === "suspend"}
        title="Lisansı dondur?"
        tone="danger"
        body={`${o.name} kurumunun tüm koç ve öğrenci erişimi geçici olarak durdurulacak. İstediğin zaman tekrar aktifleştirebilirsin.`}
        confirmLabel="Dondur"
        onConfirm={async () => {
          await mutate({ kind: "suspendOrg", orgId: o.id });
          toast("Lisans donduruldu", { icon: "ki-information-2", tone: "danger" });
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
