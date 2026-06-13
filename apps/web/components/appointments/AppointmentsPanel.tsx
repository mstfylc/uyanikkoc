"use client";

import { KiIcon } from "@/components/design/KiIcon";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ApptRequestModal } from "@/components/appointments/ApptRequestModal";
import { UkBadge } from "@/components/design/UkBadge";
import { UkNumStepper } from "@/components/design/UkNumStepper";
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
  cancelled: { label: "İptal", tone: "muted" },
};

const MODE_LABELS: Record<AppointmentMode, string> = {
  online: "Online",
  in_person: "Yuz yuze",
  phone: "Telefon",
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
          {coachView ? appointment.studentName : "Koç görüşmesi"}{" "}
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
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/student/appointments", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        appointments: AppointmentRecord[];
        settings: AppointmentSettingsRecord | null;
      };
      setAppointments(data.appointments);
      setSettings(data.settings);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const used = useMemo(
    () => appointments.filter((item) => item.status !== "rejected" && item.status !== "cancelled").length,
    [appointments],
  );
  const limit = settings?.weeklyLimitStudent ?? settings?.weeklyLimit ?? 0;
  const canRequest = limit === 0 || used < limit;

  async function handleRequest(payload: {
    day: AppointmentDay;
    slot: string;
    mode: AppointmentMode;
    topic: string;
  }) {
    setError(null);
    const response = await fetch("/api/student/appointments", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Randevu oluşturulamadı.");
      return;
    }

    const data = (await response.json()) as {
      appointment: AppointmentRecord;
      settings: AppointmentSettingsRecord;
    };
    setSettings(data.settings);
    await load();
  }

  return (
    <>
      <UkPageHead
        title="Randevular"
        sub="Koçunla online, yüz yüze veya telefonla görüşme planla"
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canRequest || !settings}
            onClick={() => setShowModal(true)}
            style={{ opacity: canRequest && settings ? 1 : 0.5 }}
          >
            <KiIcon name="ki-plus" />
            Randevu İste
          </button>
        }
      />

      {settings ? (
        <div className="card">
          <div className="card-pad row" style={{ gap: 16, flexWrap: "wrap" }}>
            <span className="stat-icon tone-primary" style={{ width: 46, height: 46, borderRadius: 13 }}>
              <KiIcon name="ki-target text-xl" />
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {limit === 0 ? "Sınırsız randevu hakkın var" : `Bu hafta ${used}/${limit} randevu kullandın`}
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {canRequest
                  ? "Koçunun müsait saatlerinden seçim yapabilirsin."
                  : "Haftalık randevu hakkın doldu. Gelecek hafta tekrar dene."}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
          {error}
        </p>
      ) : null}

      <UkSection title="Randevularım" sub={`${appointments.length} talep`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Henüz randevu talebin yok.
            </div>
          ) : (
            appointments.map((item) => <ApptRow key={item.id} appointment={item} />)
          )}
        </div>
      </UkSection>

      {settings ? (
        <ApptRequestModal
          open={showModal}
          onClose={() => setShowModal(false)}
          settings={settings}
          onSubmit={handleRequest}
        />
      ) : null}
    </>
  );
}

function CoachAvailability({
  settings,
  onChange,
}: {
  settings: AppointmentSettingsRecord;
  onChange: (patch: Partial<Omit<AppointmentSettingsRecord, "coachId">>) => void;
}) {
  const [selectedCell, setSelectedCell] = useState<{ day: AppointmentDay; slot: string } | null>(null);

  function allowedModes(): AppointmentMode[] {
    const modes: AppointmentMode[] = [];
    if (settings.allowOnline) modes.push("online");
    if (settings.allowInPerson) modes.push("in_person");
    if (settings.allowPhone) modes.push("phone");
    return modes;
  }

  function toggleSlot(day: AppointmentDay, slot: string) {
    const current = settings.availability[day] ?? [];
    const isOn = current.includes(slot);

    if (!isOn) {
      onChange({
        availability: {
          ...settings.availability,
          [day]: [...current, slot].sort(),
        },
        slotModes: {
          ...settings.slotModes,
          [day]: {
            ...(settings.slotModes[day] ?? {}),
            [slot]: allowedModes(),
          },
        },
      });
      setSelectedCell({ day, slot });
      return;
    }

    if (selectedCell?.day === day && selectedCell.slot === slot) {
      const nextDayModes = { ...(settings.slotModes[day] ?? {}) };
      delete nextDayModes[slot];
      onChange({
        availability: {
          ...settings.availability,
          [day]: current.filter((item) => item !== slot),
        },
        slotModes: {
          ...settings.slotModes,
          [day]: nextDayModes,
        },
      });
      setSelectedCell(null);
      return;
    }

    setSelectedCell({ day, slot });
  }

  function toggleSlotMode(day: AppointmentDay, slot: string, mode: AppointmentMode) {
    const current = settings.slotModes[day]?.[slot] ?? [];
    const next = current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode];
    if (next.length === 0) {
      const avail = settings.availability[day] ?? [];
      const nextDayModes = { ...(settings.slotModes[day] ?? {}) };
      delete nextDayModes[slot];
      onChange({
        availability: {
          ...settings.availability,
          [day]: avail.filter((item) => item !== slot),
        },
        slotModes: {
          ...settings.slotModes,
          [day]: nextDayModes,
        },
      });
      setSelectedCell(null);
      return;
    }
    onChange({
      slotModes: {
        ...settings.slotModes,
        [day]: {
          ...(settings.slotModes[day] ?? {}),
          [slot]: next,
        },
      },
    });
  }

  return (
    <>
      <UkSection title="Randevu Ayarları" sub="Öğrenci taleplerini bu kurallara göre sınırla">
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="between" style={{ padding: "10px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                <KiIcon name="ki-technology-2" size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Online randevu</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Öğrenciler online görüşme isteyebilir
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`switch${settings.allowOnline ? " on" : ""}`}
              onClick={() => onChange({ allowOnline: !settings.allowOnline })}
              aria-label="Online randevu"
            >
              <span />
            </button>
          </div>
          <hr className="hr" />
          <div className="between" style={{ padding: "10px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                <KiIcon name="ki-people" size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Yüz yüze randevu</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Öğrenciler yüz yüze görüşme isteyebilir
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`switch${settings.allowInPerson ? " on" : ""}`}
              onClick={() => onChange({ allowInPerson: !settings.allowInPerson })}
              aria-label="Yüz yüze randevu"
            >
              <span />
            </button>
          </div>
          <hr className="hr" />
          <div className="between" style={{ padding: "10px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                <KiIcon name="ki-phone" size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Telefon randevu</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Öğrenciler telefon görüşmesi isteyebilir
                </div>
              </div>
            </div>
            <button
              type="button"
              className={`switch${settings.allowPhone ? " on" : ""}`}
              onClick={() => onChange({ allowPhone: !settings.allowPhone })}
              aria-label="Telefon randevu"
            >
              <span />
            </button>
          </div>
          <hr className="hr" />
          <div className="between" style={{ padding: "12px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                <KiIcon name="ki-profile-circle" size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Öğrenci haftalık limiti</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Öğrenci başına haftalık randevu limiti
                </div>
              </div>
            </div>
            <UkNumStepper
              value={settings.weeklyLimitStudent}
              onChange={(value) => onChange({ weeklyLimitStudent: value })}
              step={1}
              min={0}
              max={14}
              size="sm"
            />
          </div>
          <hr className="hr" />
          <div className="between" style={{ padding: "12px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                <KiIcon name="ki-people" size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Veli haftalık limiti</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Veli başına haftalık randevu limiti
                </div>
              </div>
            </div>
            <UkNumStepper
              value={settings.weeklyLimitParent}
              onChange={(value) => onChange({ weeklyLimitParent: value })}
              step={1}
              min={0}
              max={14}
              size="sm"
            />
          </div>
          <hr className="hr" />
          <div className="between" style={{ padding: "12px 0" }}>
            <div className="row" style={{ gap: 12 }}>
              <span className="lr-icon" style={{ width: 38, height: 38, background: "var(--surface-3)" }}>
                <KiIcon name="ki-target" size={18} />
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Haftalık randevu limiti</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Bir öğrencinin haftada isteyebileceği maks. randevu (0 = sınırsız)
                </div>
              </div>
            </div>
            <UkNumStepper
              value={settings.weeklyLimit}
              onChange={(value) => onChange({ weeklyLimit: value })}
              step={1}
              min={0}
              max={14}
              size="sm"
            />
          </div>
        </div>
      </UkSection>

      <UkSection title="Müsait Saatlerim" sub="Öğrenciler yalnızca seçili saatlerden randevu alabilir">
        <div className="card-body" style={{ overflowX: "auto" }}>
          <div className="avail-grid">
            <div />
            {APPOINTMENT_DAYS.map((day) => (
              <div key={day} className="avail-day">
                {day}
              </div>
            ))}
            {APPOINTMENT_SLOTS.map((slot) => (
              <div key={slot} style={{ display: "contents" }}>
                <div className="avail-slot">{slot}</div>
                {APPOINTMENT_DAYS.map((day) => {
                  const on = (settings.availability[day] ?? []).includes(slot);
                  const selected = selectedCell?.day === day && selectedCell.slot === slot;
                  return (
                    <button
                      key={`${day}-${slot}`}
                      type="button"
                      className={`avail-cell${on ? " on" : ""}${selected ? " ring-primary" : ""}`}
                      onClick={() => toggleSlot(day, slot)}
                      aria-label={`${day} ${slot}`}
                    >
                      {on ? <KiIcon name="ki-check" size={13} /> : ""}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <KiIcon name="ki-flash-circle" size={13} />
            Hücreye tıklayarak müsait saat aç/kapat; açık hücreye tekrar tıklayarak mod seç.
          </div>

          {selectedCell && (settings.availability[selectedCell.day] ?? []).includes(selectedCell.slot) ? (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div className="label" style={{ marginBottom: 8 }}>
                {selectedCell.day} {selectedCell.slot} · randevu modları
              </div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {allowedModes().map((mode) => {
                  const active = (settings.slotModes[selectedCell.day]?.[selectedCell.slot] ?? []).includes(mode);
                  return (
                    <button
                      key={mode}
                      type="button"
                      className={`type-chip${active ? " on" : ""}`}
                      onClick={() => toggleSlotMode(selectedCell.day, selectedCell.slot, mode)}
                    >
                      {MODE_LABELS[mode]}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </UkSection>
    </>
  );
}

function CoachAppointmentsView() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [settings, setSettings] = useState<AppointmentSettingsRecord | null>(null);
  const [tab, setTab] = useState<"liste" | "musait">("liste");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/coach/appointments", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        appointments: AppointmentRecord[];
        settings: AppointmentSettingsRecord;
      };
      setAppointments(data.appointments);
      setSettings(data.settings);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = useMemo(() => appointments.filter((item) => item.status === "pending"), [appointments]);
  const approved = useMemo(() => appointments.filter((item) => item.status === "approved"), [appointments]);

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

  async function patchSettings(patch: Partial<Omit<AppointmentSettingsRecord, "coachId">>) {
    const response = await fetch("/api/coach/appointments", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (response.ok) {
      const data = (await response.json()) as { settings: AppointmentSettingsRecord };
      setSettings(data.settings);
    }
  }

  return (
    <>
      <UkPageHead title="Randevular" sub="Görüşme taleplerini yönet ve müsait saatlerini belirle" />

      <div className="seg" style={{ width: "fit-content" }}>
        <button type="button" className={tab === "liste" ? "on" : ""} onClick={() => setTab("liste")}>
          <KiIcon name="ki-calendar" size={16} />
          Randevular
          {pending.length > 0 ? (
            <span className="nav-count tnum" style={{ minWidth: 18, height: 18, fontSize: 10.5 }}>
              {pending.length}
            </span>
          ) : null}
        </button>
        <button type="button" className={tab === "musait" ? "on" : ""} onClick={() => setTab("musait")}>
          <KiIcon name="ki-time" size={16} />
          Müsait Saatlerim
        </button>
      </div>

      {tab === "liste" ? (
        <>
          <div className="grid g-4">
            <UkStatCard icon="ki-time" tone="warning" value={pending.length} label="Onay bekleyen" />
            <UkStatCard icon="ki-check-circle" tone="success" value={approved.length} label="Onaylı randevu" />
            <UkStatCard
              icon="ki-technology-2"
              tone="info"
              value={approved.filter((item) => item.mode === "online").length}
              label="Online"
            />
            <UkStatCard
              icon="ki-people"
              tone="primary"
              value={approved.filter((item) => item.mode === "in_person").length}
              label="Yuz yuze"
            />
          </div>

          {pending.length > 0 ? (
            <UkSection
              title="Onay Bekleyenler"
              sub={`${pending.length} talep`}
              action={<UkBadge tone="warning">{pending.length}</UkBadge>}
            >
              <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pending.map((item) => (
                  <ApptRow
                    key={item.id}
                    appointment={item}
                    coachView
                    onApprove={() => void setStatus(item.id, "approved")}
                    onReject={() => void setStatus(item.id, "rejected")}
                  />
                ))}
              </div>
            </UkSection>
          ) : null}

          <UkSection title="Yaklaşan Randevular" sub={`${approved.length} onaylı`}>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {isLoading ? (
                <p className="muted" style={{ fontSize: 13 }}>
                  Yükleniyor...
                </p>
              ) : approved.length === 0 ? (
                <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                  Onaylı randevu yok.
                </div>
              ) : (
                approved.map((item) => <ApptRow key={item.id} appointment={item} coachView />)
              )}
            </div>
          </UkSection>
        </>
      ) : settings ? (
        <CoachAvailability settings={settings} onChange={(patch) => void patchSettings(patch)} />
      ) : null}
    </>
  );
}

function ParentAppointmentsView() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [settings, setSettings] = useState<AppointmentSettingsRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch("/api/parent/appointments", { credentials: "same-origin" });
    if (response.ok) {
      const data = (await response.json()) as {
        appointments: AppointmentRecord[];
        settings: AppointmentSettingsRecord | null;
      };
      setAppointments(data.appointments);
      setSettings(data.settings);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const used = useMemo(
    () =>
      appointments.filter(
        (item) =>
          item.requesterRole === "parent" &&
          item.status !== "rejected" &&
          item.status !== "cancelled",
      ).length,
    [appointments],
  );
  const limit = settings?.weeklyLimitParent ?? 0;
  const canRequest = limit === 0 || used < limit;

  async function handleRequest(payload: {
    day: AppointmentDay;
    slot: string;
    mode: AppointmentMode;
    topic: string;
  }) {
    setError(null);
    const response = await fetch("/api/parent/appointments", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Randevu oluşturulamadı.");
      return;
    }

    const data = (await response.json()) as {
      settings: AppointmentSettingsRecord;
    };
    setSettings(data.settings);
    await load();
  }

  return (
    <>
      <UkPageHead
        title="Randevular"
        sub="Çocuğunun koçuyla online, yüz yüze veya telefonla görüşme planla"
        actions={
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canRequest || !settings}
            onClick={() => setShowModal(true)}
            style={{ opacity: canRequest && settings ? 1 : 0.5 }}
          >
            <KiIcon name="ki-plus" />
            Randevu İste
          </button>
        }
      />

      {settings ? (
        <div className="card">
          <div className="card-pad row" style={{ gap: 16, flexWrap: "wrap" }}>
            <span className="stat-icon tone-primary" style={{ width: 46, height: 46, borderRadius: 13 }}>
              <KiIcon name="ki-target text-xl" />
            </span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {limit === 0 ? "Sınırsız veli randevu hakkın var" : `Bu hafta ${used}/${limit} veli randevusu kullandın`}
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {canRequest
                  ? "Koçun müsait saatlerinden veli görüşmesi talep edebilirsin."
                  : "Haftalık veli randevu hakkın doldu."}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
          {error}
        </p>
      ) : null}

      <UkSection title="Randevularım" sub={`${appointments.length} talep`}>
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {isLoading ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Yükleniyor...
            </p>
          ) : appointments.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              Henüz randevu talebin yok.
            </div>
          ) : (
            appointments.map((item) => <ApptRow key={item.id} appointment={item} />)
          )}
        </div>
      </UkSection>

      {settings ? (
        <ApptRequestModal
          open={showModal}
          onClose={() => setShowModal(false)}
          settings={settings}
          onSubmit={handleRequest}
        />
      ) : null}
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
