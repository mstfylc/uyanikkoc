/* ============================================================
   Yönetim Paneli — Lisans Türleri (süper admin) + Öğrenci Paketleri (kurum/koç)
   admin-data.jsx + admin-extra.jsx (Modal, Field) üzerine kurulur.
   ============================================================ */
const { useState: ppS } = React;

const PLAN_COLORS = ["var(--primary)", "var(--success)", "var(--warning)", "var(--info)", "var(--danger)", "#8b5cf6", "#ec4899", "#0ea5e9"];

/* renk seçici */
function ColorSwatches({ value, onChange }) {
  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      {PLAN_COLORS.map((c) => (
        <button key={c} type="button" onClick={() => onChange(c)} aria-label={c}
          style={{ width: 30, height: 30, borderRadius: 9, background: c, cursor: "pointer", border: value === c ? "3px solid var(--text)" : "3px solid transparent", boxShadow: "0 0 0 1px var(--border)" }} />
      ))}
    </div>
  );
}

/* özellik listesi düzenleyici */
function FeatureEditor({ items, onChange }) {
  const set = (i, v) => { const n = [...items]; n[i] = v; onChange(n); };
  const add = () => onChange([...items, ""]);
  const del = (i) => onChange(items.filter((_, x) => x !== i));
  return (
    <div className="stack" style={{ gap: 8 }}>
      {items.map((f, i) => (
        <div key={i} className="row" style={{ gap: 8 }}>
          <span className="stat-icon tone-primary" style={{ width: 28, height: 28, flexShrink: 0 }}><Icon name="check" size={14} /></span>
          <input className="input" value={f} onChange={(e) => set(i, e.target.value)} placeholder="Özellik açıklaması" style={{ flex: 1 }} />
          <button className="icon-btn" style={{ width: 32, height: 32, flexShrink: 0 }} title="Kaldır" onClick={() => del(i)}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
      ))}
      <button className="btn btn-light btn-sm" style={{ alignSelf: "flex-start" }} onClick={add}><Icon name="plus" size={14} />Özellik ekle</button>
    </div>
  );
}

/* modül seçici (dizi tabanlı) */
function PlanModulePicker({ selected, onToggle }) {
  return (
    <div className="mod-grid">
      {MODULES.map((m) => {
        const on = selected.includes(m.key);
        return (
          <div key={m.key} className={`mod-card${on ? " on" : ""}`} onClick={() => onToggle(m.key)} style={{ cursor: "pointer" }}>
            <span className="mod-ic"><Icon name={m.icon} size={20} /></span>
            <div className="mod-body"><b>{m.name}{m.premium ? <span className="mod-prem">Premium</span> : null}</b><p>{m.desc}</p></div>
            <Icon name={on ? "checkCircle" : "plus"} size={18} style={{ color: on ? "var(--success)" : "var(--faint)", flexShrink: 0 }} />
          </div>
        );
      })}
    </div>
  );
}

/* ---- lisans planı düzenleyici (kurum veya koç) ---- */
function PlanEditorModal({ kind, plan, onClose }) {
  const isOrg = kind === "org";
  const editing = !!plan;
  const [name, setName] = ppS(plan ? plan.name : "");
  const [color, setColor] = ppS(plan ? plan.color : "var(--primary)");
  const [monthly, setMonthly] = ppS(plan ? plan.monthly : 0);
  const [annual, setAnnual] = ppS(plan ? (plan.annual || plan.monthly * 10) : 0);
  const [seats, setSeats] = ppS(plan ? plan.seats : 50);
  const [coaches, setCoaches] = ppS(plan ? (plan.coaches || 5) : 5);
  const [branches, setBranches] = ppS(plan ? (plan.branches || 1) : 1);
  const [tagline, setTagline] = ppS(plan ? (plan.tagline || "") : "");
  const [popular, setPopular] = ppS(plan ? !!plan.popular : false);
  const [modules, setModules] = ppS(plan ? [...(plan.modules || [])] : ["denemeAnaliz", "raporlar"]);
  const [features, setFeatures] = ppS(plan ? [...(plan.features || [])] : []);
  const toggleMod = (k) => setModules((m) => m.includes(k) ? m.filter((x) => x !== k) : [...m, k]);
  const ok = name.trim().length > 1;

  const save = () => {
    if (!ok) return;
    const base = { name: name.trim(), color, monthly: +monthly, seats: +seats, tagline: tagline.trim(), popular, modules };
    if (isOrg) {
      const data = { ...base, coaches: +coaches, branches: +branches };
      if (editing) updateOrgPlan(plan.id, data); else addOrgPlan(data);
    } else {
      const data = { ...base, annual: +annual, features };
      if (editing) updateCoachPlan(plan.id, data); else addCoachPlan(data);
    }
    toast(editing ? "Lisans türü güncellendi" : "Yeni lisans türü oluşturuldu", { icon: "checkCircle" });
    onClose();
  };

  return (
    <Modal title={editing ? "Lisans türünü düzenle" : (isOrg ? "Yeni kurum lisansı" : "Yeni koç lisansı")} sub={isOrg ? "Kurum / franchise planı" : "Bireysel koç planı"} width={620} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={save}><Icon name="check" size={16} />{editing ? "Kaydet" : "Oluştur"}</button></>}>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Plan adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={isOrg ? "Örn. Kurum Pro" : "Örn. Pro"} /></Field>
        <Field label="Etiket / açıklama"><input className="input" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Kısa tanım" /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Aylık ücret (₺)"><input className="input" type="number" min="0" value={monthly} onChange={(e) => setMonthly(e.target.value)} /></Field>
        {isOrg
          ? <Field label="Öğrenci koltuğu"><input className="input" type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} /></Field>
          : <Field label="Yıllık ücret (₺)"><input className="input" type="number" min="0" value={annual} onChange={(e) => setAnnual(e.target.value)} /></Field>}
      </div>
      {isOrg ? (
        <div className="grid g-3" style={{ gap: 12 }}>
          <Field label="Koç kapasitesi"><input className="input" type="number" min="1" value={coaches} onChange={(e) => setCoaches(e.target.value)} /></Field>
          <Field label="Şube sayısı"><input className="input" type="number" min="1" value={branches} onChange={(e) => setBranches(e.target.value)} /></Field>
          <Field label="Öne çıkan"><button type="button" className={`switch${popular ? " on" : ""}`} onClick={() => setPopular((p) => !p)} style={{ alignSelf: "flex-start" }}><span /></button></Field>
        </div>
      ) : (
        <div className="grid g-2" style={{ gap: 12 }}>
          <Field label="Öğrenci koltuğu"><input className="input" type="number" min="1" value={seats} onChange={(e) => setSeats(e.target.value)} /></Field>
          <Field label="Öne çıkan plan"><button type="button" className={`switch${popular ? " on" : ""}`} onClick={() => setPopular((p) => !p)} style={{ alignSelf: "flex-start" }}><span /></button></Field>
        </div>
      )}
      <Field label="Renk"><ColorSwatches value={color} onChange={setColor} /></Field>
      {!isOrg ? <Field label="Öne çıkan özellikler (pricing kartında listelenir)"><FeatureEditor items={features} onChange={setFeatures} /></Field> : null}
      <Field label="Dahil modüller"><PlanModulePicker selected={modules} onToggle={toggleMod} /></Field>
    </Modal>
  );
}

/* tek plan kartı */
function PlanCard({ kind, plan, onEdit }) {
  const isOrg = kind === "org";
  const inUse = isOrg ? orgPlanInUse(plan.id) : coachPlanInUse(plan.id);
  const [confirm, setConfirm] = ppS(false);
  const doDelete = () => {
    const ok = isOrg ? deleteOrgPlan(plan.id) : deleteCoachPlan(plan.id);
    if (ok) toast(plan.name + " lisans türü silindi", { icon: "alert", tone: "danger" });
    else toast("Bu plan kullanımda olduğu için silinemez", { icon: "alert", tone: "danger" });
  };
  return (
    <div className="card" style={{ overflow: "hidden", borderTop: `3px solid ${plan.color}` }}>
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="between" style={{ alignItems: "flex-start" }}>
          <div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <span className="plan-dot" style={{ background: plan.color }} />
              <b style={{ fontSize: 16 }}>{plan.name}</b>
              {plan.popular ? <span className="badge badge-primary" style={{ height: 20, fontSize: 10.5 }}>Öne çıkan</span> : null}
            </div>
            {plan.tagline ? <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{plan.tagline}</div> : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="tnum" style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-600)" }}>{TRY(plan.monthly)}</div>
            <div className="muted" style={{ fontSize: 11 }}>/ay{!isOrg && plan.annual ? ` · ${TRY(plan.annual)}/yıl` : ""}</div>
          </div>
        </div>
        <div className="row" style={{ gap: 14, flexWrap: "wrap", fontSize: 12.5 }}>
          <span className="muted"><Icon name="cap" size={14} /> {plan.seats >= 999 ? "Sınırsız" : plan.seats} öğrenci</span>
          {isOrg ? <span className="muted"><Icon name="users" size={14} /> {plan.coaches} koç</span> : null}
          {isOrg ? <span className="muted"><Icon name="building" size={14} /> {plan.branches} şube</span> : null}
          <span className="muted"><Icon name="bolt" size={14} /> {(plan.modules || []).length} modül</span>
        </div>
        <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
          {(plan.modules || []).slice(0, 6).map((k) => <span key={k} className="badge badge-muted" style={{ height: 22, fontSize: 11 }}>{moduleName(k)}</span>)}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 2 }}>
          <button className="btn btn-light btn-sm" onClick={onEdit}><Icon name="settings" size={15} />Düzenle</button>
          <button className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} title={inUse ? "Kullanımda — silinemez" : "Sil"} disabled={inUse} onClick={() => setConfirm(true)}>
            <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />{inUse ? "Kullanımda" : "Sil"}
          </button>
        </div>
      </div>
      <ConfirmModal open={confirm} title="Lisans türünü sil?" tone="danger"
        body={`${plan.name} kalıcı olarak silinecek. Bu işlem geri alınamaz.`} confirmLabel="Sil"
        onConfirm={doDelete} onClose={() => setConfirm(false)} />
    </div>
  );
}

/* ---- SÜPER ADMIN: Lisans Türleri ---- */
function SAPlans() {
  const a = useAdmin();
  const [tab, setTab] = ppS("org");
  const [editor, setEditor] = ppS(null); // {plan} | "new"
  const isOrg = tab === "org";
  const list = isOrg ? orgPlans() : coachPlans();
  return (
    <div className="stack rise">
      <PageHead title="Lisans Türleri" sub="Kurum ve bireysel koç lisans planlarını, fiyatlarını, kapasitelerini ve modüllerini yönet"
        actions={<button className="btn btn-primary" onClick={() => setEditor("new")}><Icon name="plus" size={16} />{isOrg ? "Yeni kurum lisansı" : "Yeni koç lisansı"}</button>} />
      <Tabs tabs={[{ k: "org", label: "Kurum Lisansları", icon: "building", count: orgPlans().length }, { k: "coach", label: "Koç Lisansları", icon: "users", count: coachPlans().length }]} active={tab} onChange={setTab} />
      <div className="grid g-3">
        {list.map((p) => <PlanCard key={p.id} kind={tab} plan={p} onEdit={() => setEditor({ plan: p })} />)}
      </div>
      {list.length === 0 ? <EmptyState icon="card" title="Henüz plan yok" sub="Yeni bir lisans türü oluşturun." /> : null}
      {editor ? <PlanEditorModal kind={tab} plan={editor === "new" ? null : editor.plan} onClose={() => setEditor(null)} /> : null}
    </div>
  );
}

/* ============================================================
   ÖĞRENCİ PAKETLERİ — kurum & bireysel koç (öğrencisine sattığı paketler)
   ============================================================ */

/* ---- paket düzenleyici ---- */
function PackageEditorModal({ kind, ownerId, pkg, onClose }) {
  const editing = !!pkg;
  const [name, setName] = ppS(pkg ? pkg.name : "");
  const [price, setPrice] = ppS(pkg ? pkg.price : 0);
  const [cycle, setCycle] = ppS(pkg ? pkg.cycle : "monthly");
  const [color, setColor] = ppS(pkg ? pkg.color : "var(--primary)");
  const [popular, setPopular] = ppS(pkg ? !!pkg.popular : false);
  const [features, setFeatures] = ppS(pkg ? [...(pkg.features || [])] : [""]);
  const ok = name.trim().length > 1;
  const save = () => {
    if (!ok) return;
    const data = { name: name.trim(), price: +price, cycle, color, popular, features };
    if (editing) updateStudentPackage(kind, ownerId, pkg.id, data);
    else addStudentPackage(kind, ownerId, data);
    toast(editing ? "Paket güncellendi" : "Yeni paket oluşturuldu", { icon: "checkCircle" });
    onClose();
  };
  return (
    <Modal title={editing ? "Paketi düzenle" : "Yeni öğrenci paketi"} sub="Öğrencilerinize sunduğunuz koçluk paketi" width={560} onClose={onClose}
      foot={<><button className="btn btn-light" onClick={onClose}>Vazgeç</button><button className="btn btn-primary" style={{ marginLeft: "auto" }} disabled={!ok} onClick={save}><Icon name="check" size={16} />{editing ? "Kaydet" : "Oluştur"}</button></>}>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Paket adı"><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Aylık Koçluk" /></Field>
        <Field label="Ücret (₺)"><input className="input" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
      </div>
      <div className="grid g-2" style={{ gap: 12 }}>
        <Field label="Ödeme dönemi"><select className="input" value={cycle} onChange={(e) => setCycle(e.target.value)}>{Object.keys(PKG_CYCLES).map((k) => <option key={k} value={k}>{PKG_CYCLES[k]}</option>)}</select></Field>
        <Field label="Öne çıkan paket"><button type="button" className={`switch${popular ? " on" : ""}`} onClick={() => setPopular((p) => !p)} style={{ alignSelf: "flex-start" }}><span /></button></Field>
      </div>
      <Field label="Renk"><ColorSwatches value={color} onChange={setColor} /></Field>
      <Field label="Paket özellikleri"><FeatureEditor items={features} onChange={setFeatures} /></Field>
    </Modal>
  );
}

/* ---- tek paket kartı ---- */
function PackageCard({ kind, ownerId, pkg, onEdit }) {
  const [confirm, setConfirm] = ppS(false);
  return (
    <div className="card" style={{ overflow: "hidden", borderTop: `3px solid ${pkg.color}`, position: "relative" }}>
      {pkg.popular ? <span className="badge badge-primary" style={{ position: "absolute", top: 12, right: 12, height: 20, fontSize: 10.5 }}>Öne çıkan</span> : null}
      <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="row" style={{ gap: 8, alignItems: "center" }}><span className="plan-dot" style={{ background: pkg.color }} /><b style={{ fontSize: 16 }}>{pkg.name}</b></div>
          <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 8 }}>
            <span className="tnum" style={{ fontSize: 24, fontWeight: 800 }}>{TRY(pkg.price)}</span>
            <span className="muted" style={{ fontSize: 12.5 }}>/ {PKG_CYCLES[pkg.cycle] || pkg.cycle}</span>
          </div>
        </div>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, margin: 0, padding: 0 }}>
          {(pkg.features || []).map((f, i) => (
            <li key={i} className="row" style={{ gap: 8, fontSize: 13, alignItems: "flex-start" }}>
              <Icon name="check" size={15} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} /><span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="row" style={{ gap: 8, marginTop: 2 }}>
          <button className="btn btn-light btn-sm" onClick={onEdit}><Icon name="settings" size={15} />Düzenle</button>
          <button className="btn btn-ghost-danger btn-sm" style={{ marginLeft: "auto" }} title="Sil" onClick={() => setConfirm(true)}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />Sil</button>
        </div>
      </div>
      <ConfirmModal open={confirm} title="Paketi sil?" tone="danger" body={`${pkg.name} paketi kaldırılacak. Bu işlem geri alınamaz.`} confirmLabel="Sil"
        onConfirm={() => { deleteStudentPackage(kind, ownerId, pkg.id); toast(pkg.name + " silindi", { icon: "alert", tone: "danger" }); }} onClose={() => setConfirm(false)} />
    </div>
  );
}

/* ---- öğrenci paketleri yönetim paneli (kurum/koç ortak) ---- */
function StudentPackagesPanel({ kind, ownerId, title, sub }) {
  const a = useAdmin();
  const pkgs = listStudentPackages(kind, ownerId);
  const [editor, setEditor] = ppS(null); // "new" | {pkg}
  return (
    <div className="stack rise">
      <PageHead title={title || "Öğrenci Paketleri"} sub={sub || "Öğrencilerinize sunduğunuz koçluk paketlerini, fiyat ve özelliklerini yönetin"}
        actions={<button className="btn btn-primary" onClick={() => setEditor("new")}><Icon name="plus" size={16} />Yeni paket</button>} />
      <div className="alert-strip"><span className="as-ic"><Icon name="wallet" size={18} /></span>
        <div style={{ flex: 1 }}><b style={{ fontSize: 13 }}>{pkgs.length} aktif paket</b><div className="muted" style={{ fontSize: 12 }}>Bu paketler öğrenci & veli uygulamasındaki “Paketler” ekranında listelenir.</div></div>
      </div>
      <div className="grid g-3">
        {pkgs.map((p) => <PackageCard key={p.id} kind={kind} ownerId={ownerId} pkg={p} onEdit={() => setEditor({ pkg: p })} />)}
      </div>
      {pkgs.length === 0 ? <EmptyState icon="wallet" title="Henüz paket yok" sub="Öğrencilerinize sunmak için bir paket oluşturun." /> : null}
      {editor ? <PackageEditorModal kind={kind} ownerId={ownerId} pkg={editor === "new" ? null : editor.pkg} onClose={() => setEditor(null)} /> : null}
    </div>
  );
}

function KurumPackages() {
  const a = useAdmin();
  const o = getActiveOrg();
  return <StudentPackagesPanel kind="org" ownerId={o.id} sub={`${o.name} · öğrencilerinize sattığınız koçluk paketleri`} />;
}
function CoachPackages() {
  const a = useAdmin();
  const c = getMyCoach();
  return <StudentPackagesPanel kind="coach" ownerId={c.id} sub="Öğrencilerinize sunduğunuz koçluk paketleri" />;
}

Object.assign(window, { ColorSwatches, FeatureEditor, PlanModulePicker, PlanEditorModal, PlanCard, SAPlans, PackageEditorModal, PackageCard, StudentPackagesPanel, KurumPackages, CoachPackages });
