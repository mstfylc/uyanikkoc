"use client";

import type { AssignmentPriority, AssignmentType } from "@uyanik/database";
import { FormEvent, useEffect, useState } from "react";

type CreatedAssignment = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  subject: string | null;
  dueDate: string | null;
};

type CoachStudent = {
  studentId: string;
  displayName: string;
  email: string;
};

const TYPE_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: "homework", label: "Ödev" },
  { value: "exam_prep", label: "Sınav hazırlığı" },
  { value: "reading", label: "Okuma" },
  { value: "practice", label: "Alıştırma" },
  { value: "other", label: "Diğer" },
];

const PRIORITY_OPTIONS: { value: AssignmentPriority; label: string }[] = [
  { value: "low", label: "Düşük" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yüksek" },
];

const SUBJECT_OPTIONS = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Tarih", "Coğrafya"];

const TYPE_LABELS: Record<AssignmentType, string> = Object.fromEntries(
  TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AssignmentType, string>;

const PRIORITY_LABELS: Record<AssignmentPriority, string> = Object.fromEntries(
  PRIORITY_OPTIONS.map((option) => [option.value, option.label]),
) as Record<AssignmentPriority, string>;

function formatDueDate(value: string | null): string {
  if (!value) {
    return "Belirtilmedi";
  }

  return new Date(value).toLocaleDateString("tr-TR");
}

function validateForm(input: {
  title: string;
  description: string;
  dueDate: string;
}): string | null {
  const title = input.title.trim();
  if (title.length < 2) {
    return "Başlık en az 2 karakter olmalı.";
  }

  if (input.description.length > 500) {
    return "Açıklama en fazla 500 karakter olabilir.";
  }

  if (input.dueDate) {
    const parsed = new Date(input.dueDate);
    if (Number.isNaN(parsed.getTime())) {
      return "Son tarih geçersiz.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    if (parsed < today) {
      return "Son tarih bugünden önce olamaz.";
    }
  }

  return null;
}

export function CreateAssignmentPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AssignmentType>("homework");
  const [priority, setPriority] = useState<AssignmentPriority>("medium");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [created, setCreated] = useState<CreatedAssignment | null>(null);
  const [students, setStudents] = useState<CoachStudent[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      const response = await fetch("/api/coach/students", { credentials: "same-origin" });
      if (!response.ok) {
        if (active) {
          setIsLoadingStudents(false);
        }
        return;
      }

      const data = (await response.json()) as { students: CoachStudent[] };
      if (active) {
        setStudents(data.students);
        setIsLoadingStudents(false);
      }
    }

    void loadStudents();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreated(null);

    const validationError = validateForm({ title, description, dueDate });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    const student = students[0];

    if (!student) {
      setIsSubmitting(false);
      setError("Ödev atanacak öğrenci bulunamadı.");
      return;
    }

    const response = await fetch("/api/coach/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        type,
        priority,
        subject: subject || null,
        studentId: student.studentId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Ödev oluşturulamadı.");
      return;
    }

    const data = (await response.json()) as { assignment: CreatedAssignment };
    setCreated(data.assignment);
    setTitle("");
    setDescription("");
    setType("homework");
    setPriority("medium");
    setSubject("");
    setDueDate("");
  }

  return (
    <section className="stack">
      <form onSubmit={handleSubmit} className="stack" style={{ gap: 14 }}>
        <div className="field">
          <label htmlFor="title">Başlık *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Matematik tekrar ödevi"
            className="input"
          />
        </div>

        <div className="field">
          <label htmlFor="description">Açıklama</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ödev detayları..."
            className="textarea"
          />
        </div>

        <div className="field">
          <label htmlFor="type">Tür</label>
          <select
            id="type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as AssignmentType)}
            className="select"
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priority">Öncelik</label>
          <select
            id="priority"
            name="priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as AssignmentPriority)}
            className="select"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="subject">Ders</label>
          <select
            id="subject"
            name="subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="select"
          >
            <option value="">Seçiniz</option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dueDate">Son tarih</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isLoadingStudents || students.length === 0}
          className="btn btn-primary"
          style={{ width: "fit-content" }}
        >
          {isSubmitting ? "Kaydediliyor..." : isLoadingStudents ? "Öğrenciler yükleniyor..." : "Ödevi kaydet"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="badge badge-danger" style={{ width: "fit-content" }}>
          {error}
        </p>
      ) : null}

      {created ? (
        <div
          data-testid="created-assignment"
          className="card"
        >
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>Oluşturuldu: {created.title}</b>
          <dl className="stack" style={{ gap: 6, fontSize: 13, margin: 0 }}>
            <div>
              <dt className="muted" style={{ display: "inline" }}>Tür: </dt>
              <dd style={{ display: "inline", margin: 0 }}>{TYPE_LABELS[created.type]}</dd>
            </div>
            <div>
              <dt className="muted" style={{ display: "inline" }}>Öncelik: </dt>
              <dd style={{ display: "inline", margin: 0 }}>{PRIORITY_LABELS[created.priority]}</dd>
            </div>
            <div>
              <dt className="muted" style={{ display: "inline" }}>Ders: </dt>
              <dd style={{ display: "inline", margin: 0 }}>{created.subject ?? "Belirtilmedi"}</dd>
            </div>
            <div>
              <dt className="muted" style={{ display: "inline" }}>Son tarih: </dt>
              <dd style={{ display: "inline", margin: 0 }}>{formatDueDate(created.dueDate)}</dd>
            </div>
            {created.description ? (
              <div>
                <dt className="muted">Açıklama: </dt>
                <dd style={{ margin: 0 }}>{created.description}</dd>
              </div>
            ) : null}
          </dl>
          </div>
        </div>
      ) : null}
    </section>
  );
}
