// Süper Admin — Lisans Türleri (kurum + bireysel koç plan kataloğu, CRUD).
// apps/web/components/admin/super/SuperPlans.tsx
// Tasarım kaynağı: admin/plans-packages.jsx (SAPlans, PlanCard, PlanEditorModal).
"use client";

import { useState, type ReactNode } from "react";

import { AdminTabs, ConfirmModal, EmptyState, Icon } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { Modal } from "@/components/admin/dialogs";
import { canEdit } from "@/components/admin/selectors";
import { UkPageHead } from "@/components/design/UkPageHead";
import { tl } from "@/lib/admin/format";
import { MODULES, moduleName } from "@/lib/admin/pricing";
import type { CoachPlan, ModuleKey, OrgPlan } from "@/lib/admin/types";

const PLAN_COLORS = [
  "var(--primary)",
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--primary-600)",
];

type PlanTab = "org" | "coach";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}

function ColorSwatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      {PLAN_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: c,
            border: value === c ? "2px solid var(--text)" : "2px solid transparent",
            cursor: "pointer",
          }}
        />
      ))}
    </div>
  );
}

function ModulePicker({ selected, onToggle }: { selected: ModuleKey[]; onToggle: (k: ModuleKey) => void }) {
  return (
    <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
      {MODULES.map((m) => {
        const on = selected.includes(m.key);
        return (
          <button
            key={m.key}
            type="button"
            className={`badge ${on ? "badge-primary" : "badge-muted"}`}
            style={{ cursor: "pointer", height: 26 }}
            onClick={() => onToggle(m.key)}
          >
            {m.name}
          </button>
        );
      })}
    </div>
  );
}

function FeatureEditor({ items, onChange }: { items: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="stack" style={{ gap: 7 }}>
      {items.map((f, i) => (
        <div key={i} className="row" style={{ gap: 7 }}>
          <input
            className="input"
            value={f}
            placeholder="Özellik"
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
          />
          <button
            type="button"
            className="btn btn-light btn-sm"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            aria-label="Kaldır"
          >
            <Icon name="plus" size={14} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => onChange([...items, ""])}>
        <Icon name="plus" size={14} />Özellik ekle
      </button>
    </div>
  );
}

function PlanEditorModal({ tab, plan, onClose }: { tab: PlanTab; plan: OrgPlan | CoachPlan | null; onClose: () => void }) {
  const { mutate, toast } = useAdminStore();
  const isOrg = tab === "org";
  const editing = !!plan;
  const [name, setName] = useState(plan?.name ?? "");
  const [color, setColor] = useState(plan?.color ?? "var(--primary)");
  const [monthly, setMonthly] = useState(plan?.monthly ?? 0);
  const [annual, setAnnual] = useState((plan as CoachPlan | null)?.annual ?? (plan?.monthly ?? 0) * 10);
  const [seats, setSeats] = useState(plan?.seats ?? 50);
  const [coaches, setCoaches] = useState((plan as OrgPlan | null)?.coaches ?? 5);
  const [branches, setBranches] = useState((plan as OrgPlan | null)?.branches ?? 1);
  const [tagline, setTagline] = useState(plan?.tagline ?? "");
  const [popular, setPopular] = useState(!!plan?.popular);
  const [modules, setModules] = useState<ModuleKey[]>([...(plan?.modules ?? ["denemeAnaliz", "raporlar"])]);
  const [features, setFeatures] = useState<string[]>([...((plan as CoachPlan | null)?.features ?? [])]);

  const ok = name.trim().length > 1;
  const toggleModule = (k: ModuleKey) => setModules((m) => (m.includes(k) ? m.filter((x) => x !== k) : [...m, k]));

  const save = () => {
    if (!ok) return;
    if (isOrg) {
      const data: Omit<OrgPlan, "id"> = {
        name: name.trim(),
        color,
        monthly: +monthly,
        seats: +seats,
        coaches: +coaches,
        branches: +branches,
        tagline: tagline.trim(),
        modules,
        popular,
      };
      if (editing && plan) void mutate({ kind: "updateOrgPlan", planId: plan.id, patch: data });
      else void mutate({ kind: "addOrgPlan", data });
    } else {
      const data: Omit<CoachPlan, "id"> = {
        name: name.trim(),
        color,
        monthly: +monthly,
        annual: +annual,
        seats: +seats,
        tagline: tagline.trim(),
        features: features.map((f) => f.trim()).filter(Boolean),
        modules,
        popular,
      };
      if (editing && plan) void mutate({ kind: "updateCoachPlan", planId: plan.id, patch: data });
      else void mutate({ kind: "addCoachPlan", data });
    }
    toast(editing ? "Lisans türü güncellendi" : "Yeni lisans türü oluşturuldu", { icon: "ki-check-circle" });
    onClose();
  };

  return (
    <Modal
      title={editing ? "Lisans türünü düzenle" : isOrg ? "Yeni kurum lisansı" : "Yeni koç lisansı"}
      sub={isOrg ? "Kurum / franchise planı" : "Bireysel koç planı"}
      width={620}
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-light" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={save}>
            <Icon name="check" size={16} />{editing ? "Kaydet" : "Oluştur"}
          </button>
        </>
      }
    >
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Plan adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Kurum Pro" /></Field>
        <Field label="Aylık ücret (₺)"><input className="input" type="number" min="0" value={monthly} onChange={(e) => setMonthly(+e.target.value)} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        {isOrg ? (
          <Field label="Öğrenci koltuğu"><input className="input" type="number" min="0" value={seats} onChange={(e) => setSeats(+e.target.value)} /></Field>
        ) : (
          <Field label="Yıllık ücret (₺)"><input className="input" type="number" min="0" value={annual} onChange={(e) => setAnnual(+e.target.value)} /></Field>
        )}
        {isOrg ? (
          <Field label="Koç sayısı"><input className="input" type="number" min="0" value={coaches} onChange={(e) => setCoaches(+e.target.value)} /></Field>
        ) : (
          <Field label="Öğrenci koltuğu"><input className="input" type="number" min="0" value={seats} onChange={(e) => setSeats(+e.target.value)} /></Field>
        )}
      </div>
      {isOrg ? (
        <div className="grid g-2" style={{ gap: 12 }}>
          <Field label="Şube sayısı"><input className="input" type="number" min="0" value={branches} onChange={(e) => setBranches(+e.target.value)} /></Field>
          <Field label="Öne çıkan plan">
            <button type="button" className={`switch${popular ? " on" : ""}`} onClick={() => setPopular((p) => !p)} style={{ alignSelf: "flex-start" }}><span /></button>
          </Field>
        </div>
      ) : (
        <Field label="Öne çıkan plan">
          <button type="button" className={`switch${popular ? " on" : ""}`} onClick={() => setPopular((p) => !p)} style={{ alignSelf: "flex-start" }}><span /></button>
        </Field>
      )}
      <Field label="Kısa açıklama"><input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Örn. Büyüyen kurumlar için" /></Field>
      <Field label="Renk"><ColorSwatches value={color} onChange={setColor} /></Field>
      <Field label="Modüller"><ModulePicker selected={modules} onToggle={toggleModule} /></Field>
      {!isOrg ? <Field label="Plan özellikleri"><FeatureEditor items={features} onChange={setFeatures} /></Field> : null}
    </Modal>
  );
}

function PlanCard({ tab, plan, editable, onEdit }: { tab: PlanTab; plan: OrgPlan | CoachPlan; editable: boolean; onEdit: () => void }) {
  const { snapshot, mutate, toast } = useAdminStore();
  const [confirm, setConfirm] = useState(false);
  const isOrg = tab === "org";
  const inUse = isOrg
    ? !!snapshot?.orgs.some((o) => o.planId === plan.id)
    : !!snapshot?.coaches.some((c) => c.planId === plan.id);
  const orgPlan = isOrg ? (plan as OrgPlan) : null;

  const del = () => {
    if (inUse) {
      toast("Bu plan kullanımda olduğu için silinemez", { icon: "ki-information-5", tone: "danger" });
      return;
    }
    void mutate(isOrg ? { kind: "deleteOrgPlan", planId: plan.id } : { kind: "deleteCoachPlan", planId: plan.id });
    toast(plan.name + " lisans türü silindi", { icon: "ki-trash", tone: "danger" });
  };

  return (
    <div className="card" style={{ overflow: "hidden", borderTop: `3px solid ${plan.color}` }}>
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: plan.color, display: "inline-block" }} />
              <b style={{ fontSize: 16 }}>{plan.name}</b>
              {plan.popular ? <span className="badge badge-primary" style={{ height: 20, fontSize: 10.5 }}>Öne çıkan</span> : null}
            </div>
            {plan.tagline ? <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{plan.tagline}</div> : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-600)" }}>{tl(plan.monthly)}</div>
            <div className="muted" style={{ fontSize: 11 }}>/ay{!isOrg && (plan as CoachPlan).annual ? ` · ${tl((plan as CoachPlan).annual)}/yıl` : ""}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 14, flexWrap: "wrap", fontSize: 12.5 }}>
          <span className="muted"><Icon name="cap" size={14} /> {plan.seats >= 999 ? "Sınırsız" : plan.seats} öğrenci</span>
          {orgPlan ? <span className="muted"><Icon name="users" size={14} /> {orgPlan.coaches} koç</span> : null}
          {orgPlan ? <span className="muted"><Icon name="building" size={14} /> {orgPlan.branches} şube</span> : null}
          <span className="muted"><Icon name="bolt" size={14} /> {plan.modules.length} modül</span>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {plan.modules.slice(0, 6).map((k) => (
            <span key={k} className="badge badge-muted" style={{ height: 22, fontSize: 11 }}>{moduleName(k)}</span>
          ))}
        </div>
        {editable ? (
          <div className="row" style={{ gap: 8, marginTop: 2 }}>
            <button className="btn btn-light btn-sm" onClick={onEdit}><Icon name="settings" size={15} />Düzenle</button>
            <button className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => setConfirm(true)}>
              <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />Sil
            </button>
          </div>
        ) : null}
      </div>
      <ConfirmModal
        open={confirm}
        title="Lisans türünü sil?"
        tone="danger"
        body={`${plan.name} kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        onConfirm={del}
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}

export function SuperPlans() {
  const { snapshot } = useAdminStore();
  const [tab, setTab] = useState<PlanTab>("org");
  const [editor, setEditor] = useState<{ plan: OrgPlan | CoachPlan | null } | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const editable = canEdit(snapshot.viewerAccess);
  const list: (OrgPlan | CoachPlan)[] = tab === "org" ? snapshot.orgPlans : snapshot.coachPlans;

  return (
    <div className="stack rise">
      <UkPageHead
        title="Lisans Türleri"
        sub="Kurum ve bireysel koç lisans planlarını, fiyatlarını, kapasitelerini ve modüllerini yönet"
        actions={
          editable ? (
            <button className="btn btn-primary" onClick={() => setEditor({ plan: null })}>
              <Icon name="plus" size={16} />Yeni lisans türü
            </button>
          ) : undefined
        }
      />
      <AdminTabs
        tabs={[
          { k: "org", label: "Kurum Planları", count: snapshot.orgPlans.length },
          { k: "coach", label: "Bireysel Koç Planları", count: snapshot.coachPlans.length },
        ]}
        active={tab}
        onChange={(k) => setTab(k as PlanTab)}
      />
      <div className="grid g-3">
        {list.map((p) => (
          <PlanCard key={p.id} tab={tab} plan={p} editable={editable} onEdit={() => setEditor({ plan: p })} />
        ))}
      </div>
      {list.length === 0 ? <EmptyState icon="card" title="Henüz plan yok" sub="Yeni bir lisans türü oluşturun." /> : null}
      {editor ? <PlanEditorModal tab={tab} plan={editor.plan} onClose={() => setEditor(null)} /> : null}
    </div>
  );
}
