"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { UkBadge } from "@/components/design/UkBadge";
import { UkPageHead } from "@/components/design/UkPageHead";
import { UkSection } from "@/components/design/UkSection";
import { UkStatCard } from "@/components/design/UkStatCard";
import { UkAvatar } from "@/components/design/UkAvatar";
import { APPOINTMENT_DAYS, APPOINTMENT_SLOTS } from "@/mocks/appointments";
import type {
  AppointmentDay,
  AppointmentMode,
  AppointmentRecord,
  AppointmentSettingsRecord,
  AppointmentStatus,
} from "@uyanik/database";

type AppointmentsPanelProps = {
  role: "student" | "coach" | "parent";
};

const STATUS_LABELS: Record<AppointmentStatus, { label: string; tone: "warning" | "success" | "danger" | "muted" }> = {
  pending: { label: "Bekliyor", tone: "warning" },
  approved: { label: "Onaylandi", tone: "success" },
  rejected: { label: "Reddedildi", tone: "danger" },
  cancelled: { label: "Iptal", tone: "muted" },
};

const MODE_LABELS: Record<AppointmentMode, string> = {
  online: "Online",
  in_person: "Yuz yuze",
};

function ApptRow({
  appointment,
  coachView,
  onApprove,
  onReject,
}: {
  appointment: AppointmentRecord;
  coachView?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const st = STATUS_LABELS[appointment.status];

  return (
    <div className="lrow" style={{ alignItems: "flex-start" }}>
      {coachView ? (
        <UkAvatar name={appointment.studentName} size={38} />
      ) : (
        <span className="lr-icon" style={{ background: "var(--primary-soft)", color: "var(--primary-600)" }}>
          <KiIcon name="ki-calendar" />
        </span>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lr-title">
          {coachView ? appointment.studentName : "Koc gorusmesi"}{" "}
          <span className="muted" style={{ fontWeight: 500 }}>
            · {appointment.day} {appointment.slot}
          </span>
        </div>
        <div className="lr-meta">
          <UkBadge tone={appointment.mode === "online" ? "info" : "primary"}>
            {MODE_LABELS[appointment.mode]}
          </UkBadge>
          {appointment.topic ? <span className="d">{appointment.topic}</span> : null}
        </div>
      </div>
      {coachView && appointment.status === "pending" && onApprove && onReject ? (
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={onApprove}>
            <KiIcon name="ki-check" />
            Onayla
          </button>
          <button type="button" className="btn btn-light btn-sm" onClick={onReject}>
            Reddet
          </button>
        </div>
      ) : (
        <UkBadge tone={st.tone} dot>
          {st.label}
        </UkBadge>
      )}
    </div>
  );
}

function StudentAppointmentsView() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [settings, setSettings] = useState<AppointmentSettingsRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [day, setDay] = useState<AppointmentDay>("Pzt");
  const [slot, setSlot] = useState(APPOINTMENT_SLOTS[0] ?? "09:00");
  const [mode, setMode] = useState<AppointmentMode>("online");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/appointments", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { appointments: AppointmentRecord[] };
      setAppointments(data.appointments);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const used = useMemo(
    () => appointments.filter((a) => a.status !== "rejected" && a.status !== "cancelled").length,
    [appointments],
  );
  const limit = settings?.weeklyLimit ?? 0;
  const canRequest = limit === 0 || used < limit;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!topic.trim()) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/student/appointments", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, slot, mode, topic: topic.trim() }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Randevu olusturulamadi.");
      return;
    }

    const data = (await response.json()) as {
      appointment: AppointmentRecord;
      settings: AppointmentSettingsRecord;
    };
    setSettings(data.settings);
    setTopic("");
    setShowForm(false);
    await load();
  }

  return (
    <>
      <UkPageHead
        title="Randevular"
        sub="Kocunla online veya yuz yuze gorusme planla"
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canRequest}
            onClick={() => setShowForm(true)}
            style={{ opacity: canRequest ? 1 : 0.5 }}
          >
            <KiIcon name="ki-plus" />
            Randevu Iste
          </button>
        }
      />

      {settings && limit > 0 ? (
        <div className="card">
          <div className="card-pad row" style={{ gap: 16, flexWrap: "wrap" }}>
            <span className="stat-icon tone-primary" style={{ width: 46, height: 46, borderRadius: 13 }}>
              <KiIcon name="ki-target text-xl" />
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                Bu hafta {used}/{limit} randevu kullandin
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {canRequest
                  ? "Kocunun musait saatlerinden secim yapabilirsin."
                  : "Haftalik randevu hakkin doldu."}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <UkSection title="Yeni randevu">
          <form onSubmit={handleSubmit} className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="grid g-2">
              <div className="field">
                <label className="label" htmlFor="appt-day">
                  Gun
                </label>
                <select id="appt-day" className="select" value={day} onChange={(e) => setDay(e.target.value as AppointmentDay)}>
                  {APPOINTMENT_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="appt-slot">
                  Saat
                </label>
                <select id="appt-slot" className="select" value={slot} onChange={(e) => setSlot(e.target.value)}>
                  {APPOINTMENT_SLOTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label" htmlFor="appt-mode">
                Gorusme turu
              </label>
              <select id="appt-mode" className="select" value={mode} onChange={(e) => setMode(e.target.value as AppointmentMode)}>
                <option value="online">Online</option>
                <option value="in_person">Yuz yuze</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="appt-topic">
                Konu
              </label>
              <input
                id="appt-topic"
                className="input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Gorusmek istedigin konu"
              />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                {isSubmitting ? "Gonderiliyor..." : "Talep gonder"}
              </button>
              <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>
                Iptal
              </button>
            </div>
            {error ? (
              <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
                {error}
              </p>
            ) : null}
          </form>
        </UkSection>
      ) : null}

      <UkSection title="Randevularim" sub={`${appointments.length} talep`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Henuz randevu talebin yok.
            </div>
          ) : (
            appointments.map((a) => <ApptRow key={a.id} appointment={a} />)
          )}
        </div>
      </UkSection>
    </>
  );
}

function CoachAppointmentsView() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/coach/appointments", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as { appointments: AppointmentRecord[] };
      setAppointments(data.appointments);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(() => appointments.filter((a) => a.status === "pending"), [appointments]);
  const approved = useMemo(() => appointments.filter((a) => a.status === "approved"), [appointments]);

  async function setStatus(appointmentId: string, status: AppointmentStatus) {
    const response = await fetch("/api/coach/appointments/status", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, status }),
    });
    if (response.ok) {
      await load();
    }
  }

  return (
    <>
      <UkPageHead title="Randevular" sub="Gorusme taleplerini yonet" />

      <div className="grid g-4">
        <UkStatCard icon="ki-time" tone="warning" value={pending.length} label="Onay bekleyen" />
        <UkStatCard icon="ki-check-circle" tone="success" value={approved.length} label="Onayli randevu" />
        <UkStatCard
          icon="ki-technology-2"
          tone="info"
          value={approved.filter((a) => a.mode === "online").length}
          label="Online"
        />
        <UkStatCard
          icon="ki-people"
          tone="primary"
          value={approved.filter((a) => a.mode === "in_person").length}
          label="Yuz yuze"
        />
      </div>

      {pending.length > 0 ? (
        <UkSection title="Onay Bekleyenler" sub={`${pending.length} talep`} action={<UkBadge tone="warning">{pending.length}</UkBadge>}>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((a) => (
              <ApptRow
                key={a.id}
                appointment={a}
                coachView
                onApprove={() => void setStatus(a.id, "approved")}
                onReject={() => void setStatus(a.id, "rejected")}
              />
            ))}
          </div>
        </UkSection>
      ) : null}

      <UkSection title="Yaklasan Randevular" sub={`${approved.length} onayli`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : approved.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Onayli randevu yok.
            </div>
          ) : (
            approved.map((a) => <ApptRow key={a.id} appointment={a} coachView />)
          )}
        </div>
      </UkSection>
    </>
  );
}

function ParentAppointmentsView() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/parent/appointments", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { appointments: AppointmentRecord[] };
        setAppointments(data.appointments);
      }
      setIsLoading(false);
    }
    void load();
  }, []);

  return (
    <>
      <UkPageHead title="Randevular" sub="Ogrencinin koc gorusmeleri" />

      <UkSection title="Randevu listesi" sub={`${appointments.length} kayit`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yukleniyor...
            </p>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Randevu kaydi yok.
            </div>
          ) : (
            appointments.map((a) => <ApptRow key={a.id} appointment={a} />)
          )}
        </div>
      </UkSection>
    </>
  );
}

export function AppointmentsPanel({ role }: AppointmentsPanelProps) {
  return (
    <div className="stack rise" data-testid={`appointments-panel-${role}`}>
      {role === "student" ? <StudentAppointmentsView /> : null}
      {role === "coach" ? <CoachAppointmentsView /> : null}
      {role === "parent" ? <ParentAppointmentsView /> : null}
    </div>
  );
}
