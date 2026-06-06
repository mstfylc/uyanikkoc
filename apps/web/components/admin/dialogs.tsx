// Admin paylaşılan dialoglar (modallar). apps/web/components/admin/dialogs.tsx
"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "./AdminKit";
import { useAdminStore } from "./AdminStore";
import { tl, fmtShort } from "@/lib/admin/format";
import { COACH_PLANS, ORG_PLANS } from "@/lib/admin/pricing";
import type {
  AdminAccess,
  CampaignAudience,
  CampaignType,
  LicenseSubjectKind,
  OrgManagerRole,
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
