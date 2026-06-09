// Kurum — Dashboard. apps/web/components/admin/branch/BranchDashboard.tsx
// Prototip kaynağı: admin/kurum.jsx (KurumDashboard). activeOrg = yönetilen kurum.
"use client";

import Link from "next/link";

import { Icon, Meter, RankBars, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { getActiveOrg, visibleOrgCoaches } from "@/components/admin/selectors";
import { OrgSwitcher } from "./OrgSwitcher";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkSparkline } from "@/components/design/UkSparkline";
import { downloadCSV } from "@/lib/admin/csv";
import { daysLeft, fmtShort, tl } from "@/lib/admin/format";
import { orgPlanById } from "@/lib/admin/pricing";

export function BranchDashboard() {
  const { snapshot, activeOrgId, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const coaches = visibleOrgCoaches(snapshot, o);
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0);
  const avgNet = 96;
  const trend = [142, 151, 148, 163, 159, 172, 168, 181, 178, 190, 186, 198];
  const dl = daysLeft(o.renewsAt);

  return (
    <div className="stack rise">
      <UkPageHead
        title={`Merhaba, ${o.owner.name.split(" ")[0]} 👋`}
        sub={`${o.name} · ${o.type === "franchise" ? o.branches.length + " şube" : "tek kurum"} · ${o.city}`}
        actions={
          <div className="row" style={{ gap: 9 }}>
            <OrgSwitcher />
            <button type="button" className="btn btn-light" onClick={() => { downloadCSV("kurum-ozet.csv", [["Metrik", "Değer"], ["Öğrenci", o.seats.used], ["Koç", o.coaches.used], ["Aylık tahsilat", totalCollect]]); toast("Rapor indirildi", { icon: "ki-cloud-download" }); }}>
              <Icon name="download" size={16} />Rapor indir
            </button>
          </div>
        }
      />

      {(o.status === "expiring" || o.status === "overdue" || o.status === "trial") ? (
        <div className={`alert-strip ${o.status === "overdue" ? "danger" : "warn"}`}>
          <span className="as-ic"><Icon name={o.status === "overdue" ? "alert" : "clock"} size={18} /></span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13.5 }}>
              {o.status === "overdue" ? "Lisans ödemeniz gecikti" : o.status === "trial" ? "Deneme sürümündesiniz" : "Lisansınızın süresi yakında doluyor"}
            </b>
            <div className="muted" style={{ fontSize: 12.5 }}>
              {dl < 0 ? `${-dl} gün önce sona erdi.` : `${dl} gün kaldı.`} {o.status === "trial" ? "Kesintisiz devam için planınızı etkinleştirin." : "Kesinti yaşamamak için yenileyin."}
            </div>
          </div>
          <Link href="/branch/license" className="btn btn-sm btn-primary">Lisansı yönet<Icon name="chevronRight" size={15} /></Link>
        </div>
      ) : null}

      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={o.seats.used} label="Aktif öğrenci" delta={`${o.seats.total - o.seats.used} koltuk boş`} />
        <StatCard icon="users" tone="info" value={o.coaches.used} label="Koç" delta={`${o.coaches.total} kapasite`} deltaDir="flat" />
        <StatCard icon="banknote" tone="success" value={tl(totalCollect)} label="Aylık tahsilat" delta="+%6,2" />
        <StatCard icon="target" tone="warning" value={avgNet} label="Ortalama net (TYT)" delta="+4,1" />
      </div>

      <div className="grid col-main">
        <UkSection title="Öğrenci & gelir gelişimi" sub="Son 12 ay" action={<span className="badge badge-success"><Icon name="trend" size={13} />Büyüyor</span>}>
          <div className="card-body">
            <UkSparkline data={trend} width={640} height={120} color={o.tone} />
          </div>
        </UkSection>
        <UkSection title="Lisans kullanımı" action={<Link href="/branch/license" className="link-btn">Detay</Link>}>
          <div className="card-body" style={{ gap: 16, display: "flex", flexDirection: "column" }}>
            <Meter icon="cap" label="Öğrenci koltuğu" used={o.seats.used} total={o.seats.total} />
            <Meter icon="users" label="Koç" used={o.coaches.used} total={o.coaches.total} />
            {o.type === "franchise" ? <Meter icon="building" label="Şube" used={o.branches.length} total={orgPlanById(o.planId).branches} /> : null}
            <div className="between" style={{ paddingTop: 6, borderTop: "1px solid var(--border)" }}>
              <span className="muted" style={{ fontSize: 12.5 }}>Sonraki yenileme</span>
              <b className="tnum" style={{ fontSize: 13 }}>{fmtShort(o.renewsAt)}</b>
            </div>
          </div>
        </UkSection>
      </div>

      <div className="grid col-main">
        {o.type === "franchise" ? (
          <UkSection title="Şube karşılaştırması" sub="Aylık tahsilat" action={<Link href="/branch/branches" className="link-btn">Şubeler</Link>}>
            <div className="card-body">
              <RankBars items={o.branches.map((b) => ({ l: b.name, v: b.collect }))} fmt={(v) => tl(v)} color={o.tone} />
            </div>
          </UkSection>
        ) : (
          <UkSection title="En iyi koçlar" sub="Öğrenci memnuniyeti">
            <div className="card-body">
              <RankBars items={coaches.slice(0, 5).map((c) => ({ l: c.name, v: parseFloat(c.rating) }))} max={5} fmt={(v) => "★ " + v} color={o.tone} />
            </div>
          </UkSection>
        )}
        <UkSection title="Öne çıkan koçlar" action={<Link href="/branch/coaches" className="link-btn">Tümü</Link>}>
          <div className="card-body" style={{ padding: 0 }}>
            {coaches.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/branch/coaches/${c.id}`} className="list-row" style={{ textDecoration: "none", color: "inherit" }}>
                <UkAvatar name={c.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 13.5, display: "block" }}>{c.name}</b>
                  <span className="muted" style={{ fontSize: 12 }}>{c.branch} · {c.students} öğrenci</span>
                </div>
                <span className="badge badge-warning" style={{ height: 22 }}><Icon name="star" size={12} fill />{c.rating}</span>
              </Link>
            ))}
          </div>
        </UkSection>
      </div>
    </div>
  );
}
