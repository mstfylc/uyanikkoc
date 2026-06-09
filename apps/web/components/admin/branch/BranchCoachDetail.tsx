// Kurum — Koç detay / rapor. apps/web/components/admin/branch/BranchCoachDetail.tsx
// Yeni ekran: koç raporu + öğrenci/veli geri bildirimleri + görev atama/çıkarma.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmModal, Icon, PriorityBadge, RankBars, StarRow, StatCard, StatusBadge } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { AssignTaskDialog } from "@/components/admin/dialogs";
import { coachFeedback, coachTasks, getActiveOrg, visibleOrgCoaches } from "@/components/admin/selectors";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkSection } from "@/components/design/UkSection";
import { coachRatingAverage, orgStudents } from "@/lib/admin/derive";
import { fmtShort } from "@/lib/admin/format";

export function BranchCoachDetail({ coachId }: { coachId: string }) {
  const { snapshot, activeOrgId, mutate, toast } = useAdminStore();
  const router = useRouter();
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const o = getActiveOrg(snapshot, activeOrgId);
  const coach = visibleOrgCoaches(snapshot, o).find((c) => c.id === coachId);
  if (!coach) {
    return (
      <div className="stack rise">
        <Link href="/branch/coaches" className="link-btn">
          <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Koçlara dön
        </Link>
        <div className="empty-state">
          <Icon name="users" size={26} style={{ color: "var(--faint)" }} />
          <div style={{ fontWeight: 700 }}>Koç bulunamadı veya sistemden çıkarıldı</div>
        </div>
      </div>
    );
  }

  const feedback = coachFeedback(snapshot, coachId);
  const tasks = coachTasks(snapshot, coachId);
  const avg = coachRatingAverage(feedback);
  const students = orgStudents(o).filter((s) => s.coach === coach.name);
  const openTasks = tasks.filter((t) => t.status === "open").length;
  const avgNet = students.length ? Math.round(students.reduce((s, x) => s + x.net, 0) / students.length) : 0;

  return (
    <div className="stack rise">
      <Link href="/branch/coaches" className="link-btn" style={{ alignSelf: "flex-start" }}>
        <Icon name="chevronRight" size={15} style={{ transform: "rotate(180deg)" }} />Koçlara dön
      </Link>

      <div className="row" style={{ gap: 15, flexWrap: "wrap" }}>
        <UkAvatar name={coach.name} size={56} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className="row" style={{ gap: 9 }}>
            <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{coach.name}</h1>
            <StatusBadge status={coach.status} />
          </div>
          <p className="muted" style={{ fontSize: 13 }}>{coach.branch} · {coach.students} öğrenci · doluluk %{coach.load}</p>
        </div>
        <div className="row" style={{ gap: 9 }}>
          <button type="button" className="btn btn-primary" onClick={() => setAssignOpen(true)}>
            <Icon name="flag" size={16} />Görev ata
          </button>
          <button type="button" className="btn btn-ghost-danger" onClick={() => setRemoveOpen(true)}>
            <Icon name="logout" size={16} />Sistemden çıkar
          </button>
        </div>
      </div>

      <div className="grid g-4">
        <StatCard icon="cap" tone="primary" value={coach.students} label="Atanan öğrenci" />
        <StatCard icon="star" tone="warning" value={avg || coach.rating} label="Geri bildirim puanı" />
        <StatCard icon="target" tone="success" value={avgNet || "—"} label="Öğrenci ort. net" />
        <StatCard icon="flag" tone="info" value={openTasks} label="Açık görev" />
      </div>

      <div className="grid col-main">
        <div className="stack">
          <UkSection
            title="Öğrenci & veli geri bildirimleri"
            sub={`${feedback.length} değerlendirme · ortalama ${avg || "—"}`}
            action={<span className="badge badge-warning" style={{ height: 24 }}><Icon name="star" size={13} fill />{avg || "—"}</span>}
          >
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {feedback.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5 }}>Henüz geri bildirim yok.</p>
              ) : (
                feedback.map((f) => (
                  <div key={f.id} className="fb-card">
                    <div className="fb-head">
                      <UkAvatar name={f.author} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ fontSize: 12.5 }}>{f.author}</b>
                        <div className="muted" style={{ fontSize: 11 }}>
                          {f.role === "parent" ? "Veli" : "Öğrenci"} · {fmtShort(f.date)}
                        </div>
                      </div>
                      <StarRow value={f.rating} />
                    </div>
                    <p className="fb-quote">“{f.comment}”</p>
                  </div>
                ))
              )}
            </div>
          </UkSection>

          <UkSection title="Atanan öğrenciler" sub={`${students.length} öğrenci`}>
            <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
              {students.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Bu koça atanmış öğrenci bulunamadı.</p>
              ) : (
                <table className="tbl" style={{ minWidth: 480 }}>
                  <thead>
                    <tr><th>Öğrenci</th><th>Sınıf</th><th>Net</th><th>Devam</th></tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 12).map((s) => (
                      <tr key={s.id} style={{ cursor: "pointer" }} onClick={() => router.push(`/branch/students/${s.id}`)}>
                        <td>
                          <div className="name">
                            <UkAvatar name={s.name} size={30} />
                            <div><b>{s.name}{s.status === "risk" ? <span className="badge badge-danger" style={{ height: 18, fontSize: 9.5, marginLeft: 7 }}>Risk</span> : null}</b></div>
                          </div>
                        </td>
                        <td><span className="muted" style={{ fontSize: 12.5 }}>{s.grade}</span></td>
                        <td><span className="tnum" style={{ fontWeight: 700 }}>{s.net}</span></td>
                        <td><span className="tnum">%{s.attend}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </UkSection>
        </div>

        <div className="stack">
          <UkSection
            title="Görevler"
            sub={`${openTasks} açık · ${tasks.length} toplam`}
            action={<button type="button" className="btn btn-light btn-sm" onClick={() => setAssignOpen(true)}><Icon name="plus" size={15} />Görev</button>}
          >
            <div className="card-body" style={{ padding: 0 }}>
              {tasks.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>Henüz görev atanmadı.</p>
              ) : (
                tasks.map((t) => (
                  <div key={t.id} className={`task-row${t.status === "done" ? " done" : ""}`}>
                    <button
                      type="button"
                      className={`task-check${t.status === "done" ? " on" : ""}`}
                      onClick={async () => { await mutate({ kind: "completeTask", taskId: t.id }); }}
                      aria-label="Tamamla"
                    >
                      <Icon name="check" size={13} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 8 }}>
                        <span className="task-title">{t.title}</span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      {t.detail ? <div className="task-detail">{t.detail}</div> : null}
                      <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>Son tarih: {fmtShort(t.due)}</div>
                    </div>
                    <button type="button" className="icon-btn" style={{ width: 30, height: 30 }} title="Sil" onClick={async () => { await mutate({ kind: "deleteTask", taskId: t.id }); toast("Görev silindi", { icon: "ki-information-2", tone: "warning" }); }}>
                      <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </UkSection>

          <UkSection title="Performans">
            <div className="card-body">
              <RankBars
                items={[
                  { l: "Doluluk", v: coach.load },
                  { l: "Memnuniyet", v: Math.round((avg || parseFloat(coach.rating)) * 20) },
                  { l: "Görev tamamlama", v: tasks.length ? Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100) : 0 },
                ]}
                max={100}
                fmt={(v) => `%${v}`}
                color={o.tone}
              />
            </div>
          </UkSection>
        </div>
      </div>

      {assignOpen ? <AssignTaskDialog orgId={o.id} coachId={coach.id} coachName={coach.name} onClose={() => setAssignOpen(false)} /> : null}
      <ConfirmModal
        open={removeOpen}
        title="Koçu sistemden çıkar?"
        tone="danger"
        body={`${coach.name} kurumdan çıkarılacak. İstediğin zaman Koçlar ekranından geri alabilirsin.`}
        confirmLabel="Çıkar"
        onConfirm={async () => {
          await mutate({ kind: "removeOrgCoach", coachId: coach.id });
          toast(coach.name + " sistemden çıkarıldı", { icon: "ki-information-2", tone: "danger" });
          router.push("/branch/coaches");
        }}
        onClose={() => setRemoveOpen(false)}
      />
    </div>
  );
}
