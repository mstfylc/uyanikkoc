// Öğrenci Paketleri — kurum & bireysel koç (öğrencisine sattığı koçluk paketleri, CRUD).
// apps/web/components/admin/StudentPackages.tsx
// Tasarım kaynağı: admin/plans-packages.jsx (StudentPackagesPanel, KurumPackages, CoachPackages).
"use client";

import { useState, type ReactNode } from "react";

import { AlertStrip, ConfirmModal, EmptyState, Icon } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { Modal } from "@/components/admin/dialogs";
import { canEdit } from "@/components/admin/selectors";
import { UkPageHead } from "@/components/design/UkPageHead";
import { tl } from "@/lib/admin/format";
import type { PackageCycle, PackageOwnerKind, StudentPackage } from "@/lib/admin/types";

const PKG_CYCLES: Record<PackageCycle, string> = {
  monthly: "Aylık",
  term: "Dönemlik",
  annual: "Yıllık",
  once: "Tek seferlik",
};

const PKG_COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--info)", "var(--danger)"];

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
      {PKG_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => onChange(c)}
          style={{ width: 26, height: 26, borderRadius: 8, background: c, border: value === c ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer" }}
        />
      ))}
    </div>
  );
}

function FeatureEditor({ items, onChange }: { items: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="stack" style={{ gap: 7 }}>
      {items.map((f, i) => (
        <div key={i} className="row" style={{ gap: 7 }}>
          <input className="input" value={f} placeholder="Özellik" onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className="btn btn-light btn-sm" aria-label="Kaldır" onClick={() => onChange(items.filter((_, j) => j !== i))}>
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

function PackageEditorModal({
  ownerKind,
  ownerId,
  pkg,
  onClose,
}: {
  ownerKind: PackageOwnerKind;
  ownerId: string;
  pkg: StudentPackage | null;
  onClose: () => void;
}) {
  const { mutate, toast } = useAdminStore();
  const editing = !!pkg;
  const [name, setName] = useState(pkg?.name ?? "");
  const [price, setPrice] = useState(pkg?.price ?? 0);
  const [cycle, setCycle] = useState<PackageCycle>(pkg?.cycle ?? "monthly");
  const [color, setColor] = useState(pkg?.color ?? "var(--primary)");
  const [popular, setPopular] = useState(!!pkg?.popular);
  const [features, setFeatures] = useState<string[]>(pkg ? [...pkg.features] : [""]);
  const ok = name.trim().length > 1;

  const save = () => {
    if (!ok) return;
    const data = { name: name.trim(), price: +price, cycle, color, popular, features: features.map((f) => f.trim()).filter(Boolean) };
    if (editing && pkg) void mutate({ kind: "updateStudentPackage", packageId: pkg.id, patch: data });
    else void mutate({ kind: "addStudentPackage", ownerKind, ownerId, data });
    toast(editing ? "Paket güncellendi" : "Yeni paket oluşturuldu", { icon: "ki-check-circle" });
    onClose();
  };

  return (
    <Modal
      title={editing ? "Paketi düzenle" : "Yeni öğrenci paketi"}
      sub="Öğrencilerinize sunduğunuz koçluk paketi"
      width={560}
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
        <Field label="Paket adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Aylık Koçluk" /></Field>
        <Field label="Ücret (₺)"><input className="input" type="number" min="0" value={price} onChange={(e) => setPrice(+e.target.value)} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Ödeme dönemi">
          <select className="input" value={cycle} onChange={(e) => setCycle(e.target.value as PackageCycle)}>
            {(Object.keys(PKG_CYCLES) as PackageCycle[]).map((k) => <option key={k} value={k}>{PKG_CYCLES[k]}</option>)}
          </select>
        </Field>
        <Field label="Öne çıkan paket">
          <button type="button" className={`switch${popular ? " on" : ""}`} onClick={() => setPopular((p) => !p)} style={{ alignSelf: "flex-start" }}><span /></button>
        </Field>
      </div>
      <Field label="Renk"><ColorSwatches value={color} onChange={setColor} /></Field>
      <Field label="Paket özellikleri"><FeatureEditor items={features} onChange={setFeatures} /></Field>
    </Modal>
  );
}

function PackageCard({ pkg, editable, onEdit }: { pkg: StudentPackage; editable: boolean; onEdit: () => void }) {
  const { mutate, toast } = useAdminStore();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="card" style={{ overflow: "hidden", borderTop: `3px solid ${pkg.color}`, position: "relative" }}>
      {pkg.popular ? <span className="badge badge-primary" style={{ position: "absolute", top: 12, right: 12, height: 20, fontSize: 10.5 }}>Öne çıkan</span> : null}
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: pkg.color, display: "inline-block" }} />
            <b style={{ fontSize: 16 }}>{pkg.name}</b>
          </div>
          <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <span className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>{tl(pkg.price)}</span>
            <span className="muted" style={{ fontSize: 12.5 }}>/ {PKG_CYCLES[pkg.cycle]}</span>
          </div>
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, margin: 0, padding: 0 }}>
          {pkg.features.map((f, i) => (
            <li key={i} className="row" style={{ gap: 8, fontSize: 13, alignItems: "flex-start" }}>
              <Icon name="check" size={15} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} /><span>{f}</span>
            </li>
          ))}
        </ul>
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
        title="Paketi sil?"
        tone="danger"
        body={`${pkg.name} paketi kaldırılacak. Bu işlem geri alınamaz.`}
        confirmLabel="Sil"
        onConfirm={() => {
          void mutate({ kind: "deleteStudentPackage", packageId: pkg.id });
          toast(pkg.name + " silindi", { icon: "ki-trash", tone: "danger" });
        }}
        onClose={() => setConfirm(false)}
      />
    </div>
  );
}

function StudentPackagesPanel({ ownerKind, ownerId, sub }: { ownerKind: PackageOwnerKind; ownerId: string; sub?: string }) {
  const { snapshot } = useAdminStore();
  const [editor, setEditor] = useState<{ pkg: StudentPackage | null } | null>(null);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const editable = canEdit(snapshot.viewerAccess);
  const pkgs = snapshot.studentPackages.filter((p) => p.ownerKind === ownerKind && p.ownerId === ownerId);

  return (
    <div className="stack rise">
      <UkPageHead
        title="Öğrenci Paketleri"
        sub={sub ?? "Öğrencilerinize sunduğunuz koçluk paketlerini, fiyat ve özelliklerini yönetin"}
        actions={
          editable ? (
            <button className="btn btn-primary" onClick={() => setEditor({ pkg: null })}>
              <Icon name="plus" size={16} />Yeni paket
            </button>
          ) : undefined
        }
      />
      <AlertStrip
        tone="info"
        icon="card"
        title={`${pkgs.length} aktif paket`}
        body="Bu paketler öğrenci & veli uygulamasındaki “Paketler” ekranında listelenir."
      />
      <div className="grid g-3">
        {pkgs.map((p) => <PackageCard key={p.id} pkg={p} editable={editable} onEdit={() => setEditor({ pkg: p })} />)}
      </div>
      {pkgs.length === 0 ? <EmptyState icon="card" title="Henüz paket yok" sub="Öğrencilerinize sunmak için bir paket oluşturun." /> : null}
      {editor ? <PackageEditorModal ownerKind={ownerKind} ownerId={ownerId} pkg={editor.pkg} onClose={() => setEditor(null)} /> : null}
    </div>
  );
}

export function KurumPackages() {
  const { snapshot } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;
  const org = snapshot.orgs.find((o) => o.id === snapshot.activeOrgId) ?? snapshot.orgs[0];
  return <StudentPackagesPanel ownerKind="org" ownerId={org.id} sub={`${org.name} · öğrencilerinize sattığınız koçluk paketleri`} />;
}

export function CoachPackages() {
  const { snapshot } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;
  return <StudentPackagesPanel ownerKind="coach" ownerId={snapshot.myCoachId} sub="Öğrencilerinize sunduğunuz koçluk paketleri" />;
}
