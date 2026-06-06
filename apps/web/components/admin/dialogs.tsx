// Admin paylaşılan dialoglar (modallar). apps/web/components/admin/dialogs.tsx
"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "./AdminKit";
import { useAdminStore } from "./AdminStore";
import { UkAvatar } from "@/components/design/UkAvatar";
import { tl, fmtShort } from "@/lib/admin/format";
import { COACH_PLANS, ORG_PLANS } from "@/lib/admin/pricing";
import { orgCoaches, orgStudents } from "@/lib/admin/derive";
import { downloadCSV } from "@/lib/admin/csv";
import type {
  AdminAccess,
  CampaignAudience,
  CampaignType,
  LicenseStatus,
  LicenseSubjectKind,
  OrgManagerRole,
  OrgPlanId,
  OrgType,
  TaskPriority,
} from "@/lib/admin/types";

/* ---- genel modal kabuğu ---- */
export function Modal({
  title,
  sub,
  onClose,
  children,
  foot,
  width = 520,
}: {
  title: string;
  sub?: string;
  onClose: () => void;
  children: ReactNode;
  foot?: ReactNode;
  width?: number;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {sub ? <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</div> : null}
          </div>
          <button type="button" className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Kapat">
            <Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {children}
        </div>
        {foot ? <div className="modal-foot">{foot}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

const MONTH_OPTIONS = [
  { m: 1, l: "1 ay" },
  { m: 3, l: "3 ay" },
  { m: 6, l: "6 ay" },
  { m: 12, l: "12 ay" },
];

/* ---- lisans yenileme detay dialogu ---- */
export function RenewDialog({
  subjectKind,
  subjectId,
  currentPlanId,
  currentRenewsAt,
  name,
  onClose,
}: {
  subjectKind: LicenseSubjectKind;
  subjectId: string;
  currentPlanId: string;
  currentRenewsAt: number;
  name: string;
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const plans = subjectKind === "org" ? ORG_PLANS : COACH_PLANS;
  const [months, setMonths] = useState(12);
  const [planId, setPlanId] = useState(currentPlanId);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const monthly = "monthly" in plan ? plan.monthly : (plan as { monthly: number }).monthly;
  const annual = "annual" in plan ? (plan as { annual: number }).annual : monthly * 12;
  const total = months >= 12 ? Math.round((annual / 12) * months) : monthly * months;
  const from = Math.max(Date.now(), currentRenewsAt);
  const newDate = from + Math.round(months * 30.4 * 86_400_000);

  const apply = async () => {
    if (subjectKind === "org") {
      await mutate({ kind: "renewOrgPlan", orgId: subjectId, months, planId: planId as never });
    } else {
      await mutate({ kind: "renewCoachPlan", coachId: subjectId, months, planId: planId as never });
    }
    toast(`${name} lisansı ${months} ay uzatıldı`, { icon: "ki-arrows-circle" });
    onClose();
  };

  return (
    <Modal
      title="Lisansı yenile"
      sub={`${name} · mevcut bitiş ${fmtShort(currentRenewsAt)}`}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply}>
            <Icon name="refresh" size={16} />Yenile · {tl(total)}
          </button>
        </>
      }
    >
      <Field label="Uzatma süresi">
        <div className="seg" style={{ width: "100%" }}>
          {MONTH_OPTIONS.map((o) => (
            <button key={o.m} type="button" className={months === o.m ? "on" : ""} style={{ flex: 1 }} onClick={() => setMonths(o.m)}>
              {o.l}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Paket">
        <div className="stack" style={{ gap: 8 }}>
          {plans.map((p) => {
            const fee = "monthly" in p ? p.monthly : 0;
            return (
              <button
                key={p.id}
                type="button"
                className={`lic-plan${planId === p.id ? " sel" : ""}`}
                style={{ flexDirection: "row", alignItems: "center", padding: 14 }}
                onClick={() => setPlanId(p.id)}
              >
                <span className="plan-dot" style={{ background: p.color }} />
                <b style={{ fontSize: 13.5, flex: 1, textAlign: "left" }}>{p.name}</b>
                <span className="tnum muted" style={{ fontSize: 12.5 }}>{tl(fee)}/ay</span>
                {planId === p.id ? <Icon name="checkCircle" size={18} style={{ color: "var(--primary)" }} /> : null}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="alert-strip">
        <span className="as-ic"><Icon name="calendar" size={18} /></span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 13 }}>Yeni bitiş tarihi: {fmtShort(newDate)}</b>
          <div className="muted" style={{ fontSize: 12 }}>{plan.name} · {months} ay · toplam {tl(total)}</div>
        </div>
      </div>
    </Modal>
  );
}

/* ---- ücretsiz demo tanımlama ---- */
export function DemoDialog({
  subjectKind,
  subjectId,
  name,
  author,
  onClose,
}: {
  subjectKind: LicenseSubjectKind;
  subjectId: string;
  name: string;
  author: string;
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [days, setDays] = useState(14);
  const opts = [7, 14, 30, 60];
  const apply = async () => {
    await mutate({ kind: "grantDemo", subjectKind, subjectId, days, author });
    toast(`${name} için ${days} gün ücretsiz demo tanımlandı`, { icon: "ki-flash" });
    onClose();
  };
  return (
    <Modal
      title="Ücretsiz demo tanımla"
      sub={name}
      width={440}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply}>
            <Icon name="bolt" size={16} />{days} gün tanımla
          </button>
        </>
      }
    >
      <Field label="Demo süresi (gün)">
        <div className="seg" style={{ width: "100%" }}>
          {opts.map((d) => (
            <button key={d} type="button" className={days === d ? "on" : ""} style={{ flex: 1 }} onClick={() => setDays(d)}>
              {d} gün
            </button>
          ))}
        </div>
      </Field>
      <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        Lisans bitiş tarihi {days} gün ileri alınır ve aboneye ücretsiz demo notu eklenir. İstediğin zaman geri alabilirsin.
      </p>
    </Modal>
  );
}

/* ---- koça görev atama ---- */
export function AssignTaskDialog({
  orgId,
  coachId,
  coachName,
  onClose,
}: {
  orgId: string;
  coachId: string;
  coachName: string;
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [dueDays, setDueDays] = useState(7);
  const apply = async () => {
    if (!title.trim()) return;
    await mutate({
      kind: "assignTask",
      orgId,
      coachId,
      title: title.trim(),
      detail: detail.trim(),
      due: Date.now() + dueDays * 86_400_000,
      priority,
    });
    toast(`${coachName} için görev atandı`, { icon: "ki-check-circle" });
    onClose();
  };
  return (
    <Modal
      title="Görev ata"
      sub={coachName}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply} disabled={!title.trim()}>
            <Icon name="plus" size={16} />Görevi ata
          </button>
        </>
      }
    >
      <Field label="Görev başlığı">
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Risk altındaki öğrencilerle birebir" />
      </Field>
      <Field label="Açıklama">
        <textarea className="input" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Detay (opsiyonel)" style={{ resize: "vertical" }} />
      </Field>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Öncelik">
          <div className="seg" style={{ width: "100%" }}>
            {(["low", "med", "high"] as TaskPriority[]).map((p) => (
              <button key={p} type="button" className={priority === p ? "on" : ""} style={{ flex: 1 }} onClick={() => setPriority(p)}>
                {p === "low" ? "Düşük" : p === "med" ? "Orta" : "Yüksek"}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Son tarih">
          <select className="input" value={dueDays} onChange={(e) => setDueDays(Number(e.target.value))}>
            <option value={3}>3 gün</option>
            <option value={7}>1 hafta</option>
            <option value={14}>2 hafta</option>
            <option value={30}>1 ay</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

/* ---- kişi davet (kurum yöneticisi / süper admin ekip) ---- */
export function InvitePersonDialog({
  title,
  roleMode,
  onClose,
  onSubmit,
}: {
  title: string;
  roleMode: "orgManager" | "adminAccess";
  onClose: () => void;
  onSubmit: (data: { name: string; email: string; value: OrgManagerRole | AdminAccess }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [value, setValue] = useState<OrgManagerRole | AdminAccess>(roleMode === "orgManager" ? "manager" : "support");
  const ok = name.trim() && /.+@.+\..+/.test(email);
  return (
    <Modal
      title={title}
      width={460}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginLeft: "auto" }}
            disabled={!ok}
            onClick={() => {
              onSubmit({ name: name.trim(), email: email.trim(), value });
              onClose();
            }}
          >
            <Icon name="send" size={16} />Davet gönder
          </button>
        </>
      }
    >
      <Field label="Ad soyad">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Derya Soylu" />
      </Field>
      <Field label="E-posta">
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kisi@ornek.com" />
      </Field>
      <Field label={roleMode === "orgManager" ? "Rol" : "Erişim"}>
        <div className="seg" style={{ width: "100%" }}>
          {roleMode === "orgManager" ? (
            <>
              <button type="button" className={value === "manager" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("manager")}>Yönetici</button>
              <button type="button" className={value === "owner" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("owner")}>Sahip</button>
            </>
          ) : (
            <>
              <button type="button" className={value === "support" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("support")}>Destek yetkilisi</button>
              <button type="button" className={value === "full" ? "on" : ""} style={{ flex: 1 }} onClick={() => setValue("full")}>Tam yetki</button>
            </>
          )}
        </div>
      </Field>
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
        {roleMode === "orgManager"
          ? "Yönetici tüm kurum ekranlarını yönetebilir; Sahip ek olarak lisans ve faturalamayı düzenler."
          : "Destek yetkilisi yalnızca Destek & Sistem alanında işlem yapar, diğer ekranları görüntüler."}
      </p>
    </Modal>
  );
}

/* ---- kampanya oluştur ---- */
export function CreateCampaignDialog({ onClose }: { onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<CampaignType>("percent");
  const [value, setValue] = useState(20);
  const [audience, setAudience] = useState<CampaignAudience>("all");
  const [days, setDays] = useState(30);
  const [maxRedemptions, setMaxRedemptions] = useState(100);
  const [note, setNote] = useState("");
  const ok = name.trim() && code.trim();
  const apply = async () => {
    await mutate({
      kind: "createCampaign",
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      value,
      audience,
      startsAt: Date.now(),
      endsAt: Date.now() + days * 86_400_000,
      maxRedemptions,
      note: note.trim(),
    });
    toast("Kampanya oluşturuldu", { icon: "ki-flash" });
    onClose();
  };
  return (
    <Modal
      title="Yeni kampanya / kod"
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={apply}>
            <Icon name="plus" size={16} />Oluştur
          </button>
        </>
      }
    >
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Kampanya adı">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Yeni Dönem İndirimi" />
        </Field>
        <Field label="Promosyon kodu">
          <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="YENIDONEM25" style={{ textTransform: "uppercase" }} />
        </Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="İndirim türü">
          <div className="seg" style={{ width: "100%" }}>
            <button type="button" className={type === "percent" ? "on" : ""} style={{ flex: 1 }} onClick={() => setType("percent")}>% Yüzde</button>
            <button type="button" className={type === "amount" ? "on" : ""} style={{ flex: 1 }} onClick={() => setType("amount")}>₺ Tutar</button>
            <button type="button" className={type === "freeDays" ? "on" : ""} style={{ flex: 1 }} onClick={() => setType("freeDays")}>Gün</button>
          </div>
        </Field>
        <Field label={type === "percent" ? "Yüzde (%)" : type === "amount" ? "Tutar (₺)" : "Ücretsiz gün"}>
          <input className="input" type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} />
        </Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Hedef kitle">
          <select className="input" value={audience} onChange={(e) => setAudience(e.target.value as CampaignAudience)}>
            <option value="all">Tümü</option>
            <option value="orgs">Kurumlar</option>
            <option value="coaches">Bireysel koçlar</option>
          </select>
        </Field>
        <Field label="Geçerlilik (gün)">
          <input className="input" type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} />
        </Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Maks. kullanım (0 = sınırsız)">
          <input className="input" type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(Number(e.target.value))} />
        </Field>
        <Field label="Not">
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Açıklama" />
        </Field>
      </div>
    </Modal>
  );
}

/* ---- kampanyayı kullanıcıya ver ---- */
export function GrantCampaignDialog({
  campaignId,
  campaignName,
  orgs,
  coaches,
  onClose,
}: {
  campaignId: string;
  campaignName: string;
  orgs: { id: string; name: string }[];
  coaches: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [kind, setKind] = useState<LicenseSubjectKind>("org");
  const list = kind === "org" ? orgs : coaches;
  const [subjectId, setSubjectId] = useState(list[0]?.id ?? "");
  const apply = async () => {
    if (!subjectId) return;
    await mutate({ kind: "grantCampaign", campaignId, subjectKind: kind, subjectId });
    const target = list.find((x) => x.id === subjectId)?.name ?? "";
    toast(`${target} kullanıcısına kod tanımlandı`, { icon: "ki-flash" });
    onClose();
  };
  return (
    <Modal
      title="Kampanyayı uygula"
      sub={campaignName}
      width={460}
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={apply} disabled={!subjectId}>
            <Icon name="check" size={16} />Kullanıcıya ver
          </button>
        </>
      }
    >
      <Field label="Abone türü">
        <div className="seg" style={{ width: "100%" }}>
          <button type="button" className={kind === "org" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setKind("org"); setSubjectId(orgs[0]?.id ?? ""); }}>Kurum</button>
          <button type="button" className={kind === "coach" ? "on" : ""} style={{ flex: 1 }} onClick={() => { setKind("coach"); setSubjectId(coaches[0]?.id ?? ""); }}>Bireysel koç</button>
        </div>
      </Field>
      <Field label="Abone">
        <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          {list.map((x) => (
            <option key={x.id} value={x.id}>{x.name}</option>
          ))}
        </select>
      </Field>
    </Modal>
  );
}

/* ---- yeni şube ekle (zip-16) ---- */
export function AddBranchDialog({
  orgId,
  onClose,
}: {
  orgId: string;
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  async function save() {
    if (!name.trim() || !city.trim()) return;
    await mutate({ kind: "addBranch", orgId, name: name.trim(), city: city.trim() });
    toast(name.trim() + " şubesi eklendi", { icon: "ki-office-bag" });
    onClose();
  }

  return (
    <Modal
      title="Yeni şube ekle"
      sub="Franchise planı kapsamında yeni konum"
      onClose={onClose}
      foot={
        <>
          <button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => void save()} disabled={!name.trim() || !city.trim()}>
            <Icon name="plus" size={16} />Ekle
          </button>
        </>
      }
    >
      <Field label="Şube adı">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Kadıköy Şubesi" />
      </Field>
      <Field label="Şehir">
        <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="İstanbul" />
      </Field>
    </Modal>
  );
}

/* ---- şube yönetim modalı (zip-16) ---- */
export function BranchManageDialog({
  orgId,
  branchId,
  onClose,
}: {
  orgId: string;
  branchId: string;
  onClose: () => void;
}) {
  const { snapshot, mutate, toast } = useAdminStore();
  const o = snapshot?.orgs.find((x) => x.id === orgId);
  const live = o?.branches.find((b) => b.id === branchId);
  const [tab, setTab] = useState<"genel" | "koclar" | "ayarlar">("genel");
  const [name, setName] = useState(live?.name ?? "");
  const [city, setCity] = useState(live?.city ?? "");
  const [status, setStatus] = useState<LicenseStatus>(live?.status ?? "active");

  if (!o || !live || !snapshot) return null;

  const branch = live;
  const totalCollect = o.branches.reduce((s, b) => s + b.collect, 0) || 1;
  const cap = Math.max(branch.students + 8, Math.round((branch.students || 1) / 0.82));
  const occ = Math.min(100, Math.round((branch.students / cap) * 100));
  const share = Math.round((branch.collect / totalCollect) * 100);
  const coaches = orgCoaches(o).filter((c) => c.branchId === branch.id);
  const students = orgStudents(o).filter((s) => s.branch === branch.name);
  const risk = students.filter((s) => s.status === "risk");

  async function saveInfo() {
    await mutate({ kind: "updateBranch", orgId, branchId: branch.id, name, city, status });
    toast("Şube bilgileri güncellendi", { icon: "ki-check-circle" });
  }

  function exportBranch() {
    downloadCSV(`sube-${branch.id}.csv`, [
      ["Şube", branch.name],
      ["Şehir", branch.city],
      ["Öğrenci", branch.students],
      ["Koç", branch.coaches],
      ["Aylık tahsilat", branch.collect],
      ["Doluluk %", occ],
      ["Gelir payı %", share],
      [],
      ["Koç", "Öğrenci", "Puan", "Doluluk %"],
      ...coaches.map((c) => [c.name, c.students, c.rating, c.load]),
    ]);
    toast(branch.name + " raporu indirildi", { icon: "ki-cloud-download" });
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 640, height: "min(720px, calc(100vh - 36px))" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 12 }}>
            <span className="org-logo" style={{ width: 44, height: 44, background: o.tone, borderRadius: 12 }}>
              <Icon name="building" size={21} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>{branch.name}</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>{branch.city} · {o.name}</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <Icon name="plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-sub" style={{ gap: 8 }}>
          {(
            [
              ["genel", "Genel"],
              ["koclar", `Koçlar (${coaches.length})`],
              ["ayarlar", "Ayarlar"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" className={`seg-tab${tab === k ? " on" : ""}`} style={{ height: 32 }} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ padding: "16px 20px", gap: 16 }}>
          {tab === "genel" ? (
            <>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-primary"><Icon name="cap" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>{branch.students}</div><div className="stat-label">öğrenci · %{occ} doluluk</div></div></div></div>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-info"><Icon name="users" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>{branch.coaches}</div><div className="stat-label">koç</div></div></div></div>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-success"><Icon name="banknote" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>{tl(branch.collect)}</div><div className="stat-label">aylık tahsilat</div></div></div></div>
                <div className="card stat"><div className="card-pad" style={{ gap: 8 }}><span className="stat-icon tone-warning"><Icon name="pie" size={20} /></span><div><div className="stat-value tnum" style={{ fontSize: 22 }}>%{share}</div><div className="stat-label">kurum gelir payı</div></div></div></div>
              </div>
              <div>
                <div className="between" style={{ marginBottom: 7 }}>
                  <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Kapasite doluluğu</span>
                  <span className="tnum" style={{ fontSize: 12, fontWeight: 700 }}>{branch.students}/{cap}</span>
                </div>
                <div className="meter-bar"><span style={{ width: `${occ}%`, background: occ >= 85 ? "var(--success)" : occ >= 60 ? "var(--primary)" : "var(--warning)" }} /></div>
              </div>
              <div className="grid g-2" style={{ gap: 12 }}>
                <div className="kpi-row" style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12 }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>Öğrenci başına gelir</span>
                  <b className="tnum">{tl(Math.round(branch.collect / Math.max(1, branch.students)))}</b>
                </div>
                <div className="kpi-row" style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 12 }}>
                  <span className="muted" style={{ fontSize: 12.5 }}>Risk altında</span>
                  <b className="tnum" style={{ color: risk.length ? "var(--danger)" : "var(--text)" }}>{risk.length} öğrenci</b>
                </div>
              </div>
              {risk.length ? (
                <div className="alert-strip warn">
                  <span className="as-ic"><Icon name="alert" size={16} /></span>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 13 }}>{risk.length} öğrenci risk altında</b>
                    <div className="muted" style={{ fontSize: 12 }}>{risk.slice(0, 3).map((s) => s.name).join(", ")}{risk.length > 3 ? ` +${risk.length - 3}` : ""}</div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {tab === "koclar" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {coaches.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5 }}>Bu şubeye atanmış koç yok.</p>
              ) : (
                coaches.map((c) => (
                  <div key={c.id} className="lrow" style={{ padding: "11px 13px" }}>
                    <UkAvatar name={c.name} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="lr-title" style={{ fontSize: 13 }}>{c.name}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{c.students} öğrenci · %{c.load} doluluk</div>
                    </div>
                    <span className="row" style={{ gap: 4, fontWeight: 700, fontSize: 12.5 }}>
                      <Icon name="star" size={13} fill style={{ color: "var(--warning)" }} />
                      {c.rating}
                    </span>
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ width: 32, height: 32 }}
                      title="Mesaj"
                      aria-label="Mesaj gönder"
                      onClick={() => toast(c.name + " koçuna mesaj gönderildi", { icon: "ki-send" })}
                    >
                      <Icon name="message" size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {tab === "ayarlar" ? (
            <>
              <Field label="Şube adı">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Şehir">
                <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="Durum">
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as LicenseStatus)}>
                  <option value="active">Aktif</option>
                  <option value="expiring">Düşük doluluk</option>
                  <option value="suspended">Donduruldu</option>
                </select>
              </Field>
              <button type="button" className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => void saveInfo()}>
                <Icon name="check" size={16} />Kaydet
              </button>
            </>
          ) : null}
        </div>

        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={() => toast(branch.name + " müdürüne mesaj gönderildi", { icon: "ki-messages" })}>
            <Icon name="message" size={16} />Müdüre yaz
          </button>
          <button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={exportBranch}>
            <Icon name="download" size={16} />Şube raporu
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ---- yeni kurum ekle (süper admin) ---- */
export function CreateOrgDialog({ onClose }: { onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<OrgType>("kurum");
  const [planId, setPlanId] = useState<OrgPlanId>("baslangic");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  async function save() {
    if (!name.trim() || !city.trim() || !ownerName.trim() || !ownerEmail.trim()) return;
    await mutate({
      kind: "createOrg",
      name: name.trim(),
      city: city.trim(),
      type,
      planId,
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim(),
      ownerPhone: ownerPhone.trim(),
    });
    toast(name.trim() + " kurumu oluşturuldu", { icon: "ki-office-bag" });
    onClose();
  }

  return (
    <Modal title="Yeni kurum ekle" sub="Deneme lisansı ile başlatılır" width={520} onClose={onClose}
      foot={<><button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button><button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => void save()} disabled={!name.trim() || !ownerEmail.trim()}><Icon name="plus" size={16} />Oluştur</button></>}
    >
      <Field label="Kurum adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Şehir"><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></Field>
        <Field label="Tür">
          <select className="input" value={type} onChange={(e) => setType(e.target.value as OrgType)}>
            <option value="kurum">Tek kurum</option>
            <option value="franchise">Franchise</option>
          </select>
        </Field>
      </div>
      <Field label="Plan">
        <select className="input" value={planId} onChange={(e) => setPlanId(e.target.value as OrgPlanId)}>
          {ORG_PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field label="Yetkili adı"><input className="input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} /></Field>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="E-posta"><input className="input" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} /></Field>
        <Field label="Telefon"><input className="input" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

export function InviteCoachDialog({
  orgId,
  branches,
  onClose,
}: {
  orgId: string;
  branches: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");

  async function save() {
    if (!name.trim() || !email.trim()) return;
    await mutate({ kind: "inviteOrgCoach", orgId, name: name.trim(), email: email.trim(), branchId: branchId || undefined });
    toast(name.trim() + " için davet gönderildi", { icon: "ki-send" });
    onClose();
  }

  return (
    <Modal title="Koç davet et" sub="E-posta ile davet bağlantısı gönderilir" onClose={onClose}
      foot={<><button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button><button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => void save()} disabled={!name.trim() || !email.trim()}><Icon name="send" size={16} />Davet gönder</button></>}
    >
      <Field label="Ad soyad"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="E-posta"><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      {branches.length > 1 ? (
        <Field label="Şube">
          <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
      ) : null}
    </Modal>
  );
}

export function InviteStudentDialog({
  orgId,
  branches,
  onClose,
}: {
  orgId: string;
  branches: { id: string; name: string }[];
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const [name, setName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");

  async function save() {
    if (!name.trim() || !parentEmail.trim()) return;
    await mutate({ kind: "inviteStudent", orgId, name: name.trim(), parentEmail: parentEmail.trim(), branchId: branchId || undefined });
    toast(name.trim() + " kaydı oluşturuldu", { icon: "ki-plus" });
    onClose();
  }

  return (
    <Modal title="Öğrenci ekle" sub="Veli e-postasına kayıt daveti gönderilir" onClose={onClose}
      foot={<><button type="button" className="btn btn-light" onClick={onClose}>Vazgeç</button><button type="button" className="btn btn-primary" style={{ marginLeft: "auto" }} onClick={() => void save()} disabled={!name.trim() || !parentEmail.trim()}><Icon name="plus" size={16} />Ekle</button></>}
    >
      <Field label="Öğrenci adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Veli e-postası"><input className="input" type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} /></Field>
      {branches.length > 1 ? (
        <Field label="Şube">
          <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
      ) : null}
    </Modal>
  );
}
