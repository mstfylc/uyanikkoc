// Süper Admin — Platform Genel Bakış. apps/web/components/admin/super/SuperOverview.tsx
// Prototip kaynağı: admin/superadmin.jsx (SAOverview).
"use client";

import Link from "next/link";

import { Donut, Icon, Legend, OrgLogo, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkBarChart } from "@/components/design/UkBarChart";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { platformMetrics } from "@/lib/admin/derive";
import { daysLeft, fmtShort, tl } from "@/lib/admin/format";

export function SuperOverview() {
  const { snapshot } = useAdminStore();
  if (!snapshot) {
    return (
      <div className="stack rise">
        <UkPageHead
          title="Platform Genel Bakış"
          sub="Uyanık Koç — tüm kurumlar, koçlar ve abonelik geliri tek ekranda"
        />
        <div className="card card-pad muted">Yükleniyor...</div>
      </div>
    );
  }
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const m = platformMetrics(snapshot.orgs, snapshot.coaches);
  const mrrSeries = [612, 640, 661, 698, 724, 770, 812, 848, 879, 910, 952, Math.round(m.mrr / 1000)];
  const newOrgs = [
    { label: "Şub", value: 1 },
    { label: "Mar", value: 0 },
    { label: "Nis", value: 2 },
    { label: "May", value: 1 },
    { label: "Haz", value: 1 },
    { label: "Tem", value: 1 },
  ];
  const segByType = [
    { l: "Franchise", v: snapshot.orgs.filter((o) => o.type === "franchise").length, color: "var(--primary)" },
    { l: "Tek kurum", v: snapshot.orgs.filter((o) => o.type === "kurum").length, color: "var(--info)" },
    { l: "Bireysel koç", v: snapshot.coaches.filter((c) => c.status !== "canceled").length, color: "var(--warning)" },
  ];
  const renewals = [
    ...snapshot.orgs.map((o) => ({ name: o.name, type: o.type, ts: o.renewsAt, fee: o.feeMonthly, tone: o.tone, kind: "org" as const })),
    ...snapshot.coaches
      .filter((c) => c.status === "active" || c.status === "trial")
      .map((c) => ({ name: c.name, type: "coach" as const, ts: c.renewsAt, fee: c.feeMonthly, tone: undefined, kind: "coach" as const })),
  ]
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 6);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Platform Genel Bakış"
        sub="Uyanık Koç — tüm kurumlar, koçlar ve abonelik geliri tek ekranda"
        actions={
          <Link href="/admin/orgs" className="btn btn-primary">
            <Icon name="building" size={16} />
            Kurumları yönet
          </Link>
        }
      />

      <div className="grid g-4">
        <StatCard icon="building" tone="primary" value={m.orgs} label="Kurum / Franchise" delta={`${m.franchises} franchise`} />
        <StatCard icon="users" tone="info" value={m.activeCoaches} label="Aktif bireysel koç" delta={`${m.totalCoaches} toplam`} />
        <StatCard icon="cap" tone="success" value={m.students.toLocaleString("tr-TR")} label="Toplam öğrenci" delta="+184 / ay" />
        <StatCard icon="banknote" tone="warning" value={tl(m.mrr)} label="Aylık gelir (MRR)" delta="+%8,4" />
      </div>

      <div className="grid col-main">
        <UkSection
          title="Gelir gelişimi (MRR)"
          sub="Son 12 ay · ₺ bin"
          action={
            <span className="badge badge-success">
              <Icon name="trend" size={13} />
              ARR {tl(m.arr)}
            </span>
          }
        >
          <div className="card-body">
            <UkSparkline data={mrrSeries} width={640} height={120} />
            <div className="between" style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Kurum gelirleri</div>
                <div className="tnum" style={{ fontWeight: 800, fontSize: 16 }}>
                  {tl(m.orgMrr)}
                  <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ay</span>
                </div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Bireysel koç gelirleri</div>
                <div className="tnum" style={{ fontWeight: 800, fontSize: 16 }}>
                  {tl(m.coachMrr)}
                  <span className="muted" style={{ fontSize: 11, fontWeight: 500 }}>/ay</span>
                </div>
              </div>
              <div>
                <div className="muted" style={{ fontSize: 12 }}>Tahmini yıllık (ARR)</div>
                <div className="tnum" style={{ fontWeight: 800, fontSize: 16, color: "var(--success)" }}>{tl(m.arr)}</div>
              </div>
            </div>
          </div>
        </UkSection>

        <UkSection title="Abone dağılımı">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Donut slices={segByType} center={{ v: m.orgs + m.totalCoaches, l: "abone" }} />
            <Legend items={segByType.map((s) => ({ l: s.l, color: s.color, v: s.v }))} />
          </div>
        </UkSection>
      </div>

      {m.atRisk > 0 ? (
        <div className="alert-strip warn">
          <span className="as-ic">
            <Icon name="alert" size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>{m.atRisk} lisans dikkat gerektiriyor</b>
            <div className="muted" style={{ fontSize: 12.5 }}>Süresi dolan, ödemesi geciken veya dondurulmuş lisanslar var.</div>
          </div>
          <Link href="/admin/licenses" className="btn btn-sm btn-primary">
            Lisans takibine git
            <Icon name="chevronRight" size={15} />
          </Link>
        </div>
      ) : null}

      <div className="grid col-main">
        <UkSection
          title="Yaklaşan yenilemeler"
          sub="Lisans bitiş tarihine göre"
          action={
            <Link href="/admin/licenses" className="link-btn">
              Tümü
            </Link>
          }
        >
          <div className="card-body" style={{ padding: 0 }}>
            {renewals.map((r, i) => {
              const dl = daysLeft(r.ts);
              return (
                <div key={i} className="list-row">
                  {r.kind === "org" ? <OrgLogo name={r.name} tone={r.tone} size={38} /> : <UkAvatar name={r.name} size={38} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: 13.5, display: "block" }}>{r.name}</b>
                    <span className="muted" style={{ fontSize: 12 }}>
                      {r.type === "franchise" ? "Franchise" : r.type === "kurum" ? "Tek kurum" : "Bireysel koç"} · {tl(r.fee)}/ay
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="tnum"
                      style={{ fontSize: 13.5, fontWeight: 700, color: dl < 0 ? "var(--danger)" : dl < 14 ? "var(--warning)" : "var(--text)" }}
                    >
                      {dl < 0 ? `${-dl} gün geçti` : `${dl} gün`}
                    </div>
                    <div className="muted" style={{ fontSize: 11 }}>{fmtShort(r.ts)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </UkSection>

        <UkSection title="Bu ay yeni katılan" sub="Kurum ve franchise">
          <div className="card-body">
            <UkBarChart data={newOrgs} peakIdx={2} />
            <div className="kpi-row">
              <span className="muted" style={{ fontSize: 12.5 }}>Dönüşüm (deneme → ücretli)</span>
              <b className="tnum">%62</b>
            </div>
            <div className="kpi-row">
              <span className="muted" style={{ fontSize: 12.5 }}>Aylık kayıp (churn)</span>
              <b className="tnum" style={{ color: "var(--success)" }}>%1,8</b>
            </div>
            <div className="kpi-row">
              <span className="muted" style={{ fontSize: 12.5 }}>Ortalama kurum büyüklüğü</span>
              <b className="tnum">164 öğrenci</b>
            </div>
          </div>
        </UkSection>
      </div>
    </div>
  );
}
