// Koç — Geri Bildirimlerim. apps/web/components/coach/CoachFeedbackPanel.tsx
"use client";

import { Icon, PriorityBadge, StarRow, StatCard } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { coachFeedback, coachTasks, getActiveOrg, visibleOrgCoaches } from "@/components/admin/selectors";
import { UkAvatar } from "@/components/design/UkAvatar";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { coachRatingAverage } from "@/lib/admin/derive";
import { fmtShort } from "@/lib/admin/format";

export function CoachFeedbackPanel() {
  const { snapshot, mutate, toast } = useAdminStore();
  if (!snapshot) return <div className="card card-pad muted">Yükleniyor…</div>;

  const coachId = snapshot.activeOrgCoachId || snapshot.myCoachId;
  const org = getActiveOrg(snapshot, snapshot.activeOrgId);
  const me = visibleOrgCoaches(snapshot, org).find((c) => c.id === coachId);
  const feedback = coachFeedback(snapshot, coachId);
  const tasks = coachTasks(snapshot, coachId);
  const avg = coachRatingAverage(feedback);
  const fromStudents = feedback.filter((f) => f.role === "student").length;
  const fromParents = feedback.filter((f) => f.role === "parent").length;
  const openTasks = tasks.filter((t) => t.status === "open").length;

  return (
    <div className="stack rise">
      <UkPageHead
        title="Geri Bildirimlerim"
        sub={`${org.name} · öğrenci ve velilerinden gelen değerlendirmeler`}
        actions={
          <span className="badge badge-warning" style={{ height: 28 }}>
            <Icon name="star" size={15} fill />
            {avg || "—"} ortalama
          </span>
        }
      />

      <div className="grid g-4">
        <StatCard icon="star" tone="warning" value={avg || "—"} label="Ortalama puan" />
        <StatCard icon="heart" tone="primary" value={feedback.length} label="Toplam değerlendirme" />
        <StatCard icon="cap" tone="info" value={fromStudents} label="Öğrenci geri bildirimi" />
        <StatCard icon="users" tone="success" value={fromParents} label="Veli geri bildirimi" />
      </div>

      <div className="grid col-main">
        <UkSection title="Öğrenci & veli geri bildirimleri" sub="En yeni önce">
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {feedback.length === 0 ? (
              <p className="muted" style={{ fontSize: 12.5 }}>
                Henüz geri bildirim yok. Öğrenci ve velilerin değerlendirmeleri burada görünecek.
              </p>
            ) : (
              feedback.map((f) => (
                <div key={f.id} className="fb-card">
                  <div className="fb-head">
                    <UkAvatar name={f.author} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13 }}>{f.author}</b>
                      <div className="muted" style={{ fontSize: 11 }}>
                        {f.role === "parent" ? "Veli" : "Öğrenci"} · {fmtShort(f.date)}
                      </div>
                    </div>
                    <StarRow value={f.rating} size={15} />
                  </div>
                  <p className="fb-quote">“{f.comment}”</p>
                </div>
              ))
            )}
          </div>
        </UkSection>

        <UkSection
          title="Kurumdan gelen görevler"
          sub={`${openTasks} açık görev`}
          action={
            <span className="badge badge-info" style={{ height: 24 }}>
              {org.name}
            </span>
          }
        >
          <div className="card-body" style={{ padding: 0 }}>
            {tasks.length === 0 ? (
              <p className="muted" style={{ fontSize: 12.5, padding: "16px 18px" }}>
                Kurum henüz görev atamadı.
              </p>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className={`task-row${t.status === "done" ? " done" : ""}`}>
                  <button
                    type="button"
                    className={`task-check${t.status === "done" ? " on" : ""}`}
                    onClick={async () => {
                      await mutate({ kind: "completeTask", taskId: t.id });
                      toast(t.status === "done" ? "Görev yeniden açıldı" : "Görev tamamlandı", {
                        icon: "ki-check-circle",
                      });
                    }}
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
                    <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>
                      Son tarih: {fmtShort(t.due)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </UkSection>
      </div>

      {me ? (
        <div className="alert-strip">
          <span className="as-ic" style={{ background: org.tone, color: "#fff" }}>
            <Icon name="heart" size={16} />
          </span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 13 }}>
              {me.branch} · {me.students} öğrenci
            </b>
            <div className="muted" style={{ fontSize: 12 }}>
              Geri bildirimler kurum yöneticinizle paylaşılır; gelişiminizi birlikte takip edersiniz.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
