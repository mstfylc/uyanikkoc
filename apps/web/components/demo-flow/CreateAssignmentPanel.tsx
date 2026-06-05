"use client";

import type { AssignmentPriority, AssignmentType, AssignmentTemplateRecord } from "@uyanik/database";
import { FormEvent, useEffect, useState } from "react";

import { UkPageHead } from "@/components/design/UkPageHead";

type CreatedAssignment = {
  id: string;
  title: string;
  description: string | null;
  type: AssignmentType;
  priority: AssignmentPriority;
  subject: string | null;
  dueDate: string | null;
};

const TYPE_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: "homework", label: "Odev" },
  { value: "exam_prep", label: "Sinav hazirligi" },
  { value: "reading", label: "Okuma" },
  { value: "practice", label: "Alistirma" },
  { value: "other", label: "Diger" },
];

const PRIORITY_OPTIONS: { value: AssignmentPriority; label: string }[] = [
  { value: "low", label: "Dusuk" },
  { value: "medium", label: "Orta" },
  { value: "high", label: "Yuksek" },
];

const SUBJECT_OPTIONS = ["Matematik", "Fizik", "Kimya", "Biyoloji", "Turkce", "Tarih", "Cografya"];

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
    return "Baslik en az 2 karakter olmali.";
  }

  if (input.description.length > 500) {
    return "Aciklama en fazla 500 karakter olabilir.";
  }

  if (input.dueDate) {
    const parsed = new Date(input.dueDate);
    if (Number.isNaN(parsed.getTime())) {
      return "Son tarih gecersiz.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    if (parsed < today) {
      return "Son tarih bugunden once olamaz.";
    }
  }

  return null;
}

export function CreateAssignmentPanel() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [studentId, setStudentId] = useState("");
  const [students, setStudents] = useState<Array<{ studentId: string; displayName: string }>>([]);
  const [type, setType] = useState<AssignmentType>("homework");
  const [priority, setPriority] = useState<AssignmentPriority>("medium");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<AssignmentTemplateRecord[]>([]);
  const [created, setCreated] = useState<CreatedAssignment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      const response = await fetch("/api/coach/templates", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as { templates: AssignmentTemplateRecord[] };
        setTemplates(data.templates);
      }
    }

    async function loadStudents() {
      const response = await fetch("/api/coach/students", { credentials: "same-origin" });
      if (response.ok) {
        const data = (await response.json()) as {
          students: Array<{ studentId: string; displayName: string }>;
        };
        setStudents(data.students);
        if (data.students[0]) {
          setStudentId(data.students[0].studentId);
        }
      }
    }

    void loadTemplates();
    void loadStudents();
  }, []);

  function applyTemplate(selectedId: string) {
    setTemplateId(selectedId);
    const template = templates.find((item) => item.id === selectedId);
    if (!template) {
      return;
    }

    setTitle(template.title);
    setDescription(template.description ?? "");
    setType(template.type);
    setPriority(template.priority);
    setSubject(template.subject ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreated(null);

    const validationError = validateForm({ title, description, dueDate });
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!studentId) {
      setError("Ogrenci seciniz.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/coach/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        title: title.trim(),
        studentId,
        description: description.trim() || null,
        type,
        priority,
        subject: subject || null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Odev olusturulamadi.");
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
    setTemplateId("");
  }

  return (
    <div className="stack rise">
      <UkPageHead title="Odev Olustur" sub="Ogrenciye yeni gorev ata" />

      <div className="card">
        <form onSubmit={handleSubmit} className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="template">
              Sablon
            </label>
            <select
              id="template"
              name="template"
              value={templateId}
              onChange={(event) => applyTemplate(event.target.value)}
              className="select"
            >
              <option value="">Sablon seciniz (opsiyonel)</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="student">
              Ogrenci *
            </label>
            <select
              id="student"
              name="student"
              required
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="select"
            >
              <option value="">Ogrenci seciniz</option>
              {students.map((student) => (
                <option key={student.studentId} value={student.studentId}>
                  {student.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="title">
              Baslik *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Matematik tekrar odevi"
              className="input"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="description">
              Aciklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Odev detaylari..."
              className="input"
              style={{ minHeight: 88, resize: "vertical" }}
            />
          </div>

          <div className="grid g-2">
            <div className="field">
              <label className="label" htmlFor="type">
                Tur
              </label>
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
              <label className="label" htmlFor="priority">
                Oncelik
              </label>
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
          </div>

          <div className="grid g-2">
            <div className="field">
              <label className="label" htmlFor="subject">
                Ders
              </label>
              <select
                id="subject"
                name="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="select"
              >
                <option value="">Seciniz</option>
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label" htmlFor="dueDate">
                Son tarih
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="input"
              />
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || !studentId} className="btn btn-primary w-fit">
            {isSubmitting ? "Kaydediliyor..." : "Odevi kaydet"}
          </button>
        </form>
      </div>

      {error ? (
        <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
          {error}
        </p>
      ) : null}

      {created ? (
        <div data-testid="created-assignment" className="card">
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ fontWeight: 700 }}>Olusturuldu: {created.title}</p>
            <dl style={{ display: "grid", gap: 4, fontSize: 13 }}>
              <div>
                <dt className="muted" style={{ display: "inline" }}>
                  Tur:{" "}
                </dt>
                <dd style={{ display: "inline" }}>{TYPE_LABELS[created.type]}</dd>
              </div>
              <div>
                <dt className="muted" style={{ display: "inline" }}>
                  Oncelik:{" "}
                </dt>
                <dd style={{ display: "inline" }}>{PRIORITY_LABELS[created.priority]}</dd>
              </div>
              <div>
                <dt className="muted" style={{ display: "inline" }}>
                  Ders:{" "}
                </dt>
                <dd style={{ display: "inline" }}>{created.subject ?? "Belirtilmedi"}</dd>
              </div>
              <div>
                <dt className="muted" style={{ display: "inline" }}>
                  Son tarih:{" "}
                </dt>
                <dd style={{ display: "inline" }}>{formatDueDate(created.dueDate)}</dd>
              </div>
              {created.description ? (
                <div>
                  <dt className="muted">Aciklama: </dt>
                  <dd>{created.description}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
