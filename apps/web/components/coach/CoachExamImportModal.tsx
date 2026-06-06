"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { KiIcon } from "@/components/design/KiIcon";
import { UkBadge } from "@/components/design/UkBadge";
import { parseCsvExamImport } from "@/lib/coach/exam-import";
import {
  getPreviewCellValue,
  mapDenemeXlsxToImportFormat,
  parseDenemeXlsx,
  type DenemeXlsxResult,
} from "@/lib/coach/exam-xlsx-import";
import type { CoachRosterEntry, ResultExamType } from "@uyanik/database";

type CoachExamImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
  roster?: CoachRosterEntry[];
};

type ImportStage = "idle" | "parsing" | "preview" | "error" | "csv";

export function CoachExamImportModal({ open, onClose, onImported, roster = [] }: CoachExamImportModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<ImportStage>("idle");
  const [parsed, setParsed] = useState<DenemeXlsxResult | null>(null);
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState<"TYT" | "AYT" | "LGS">("TYT");
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setStage("idle");
      setParsed(null);
      setExamName("");
      setExamType("TYT");
      setCsvText("");
      setError(null);
    }
  }, [open]);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setStage("parsing");
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = await parseDenemeXlsx(buffer, file.name);
      if (result.students.length === 0) {
        throw new Error("Dosyada ogrenci satiri bulunamadi.");
      }
      setParsed(result);
      setExamName(result.name);
      setExamType(result.examType);
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya okunamadi.");
      setStage("error");
    }
  }

  async function submitExams(exams: ReturnType<typeof parseCsvExamImport>) {
    if (exams.length === 0) {
      setError("Gecerli satir bulunamadi.");
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/coach/exams/import", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exams }),
    });
    setIsSubmitting(false);

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      setError(data.error ?? "Import basarisiz.");
      return;
    }

    onImported();
    onClose();
  }

  async function handleXlsxImport() {
    if (!parsed) {
      return;
    }

    const exams = mapDenemeXlsxToImportFormat(parsed, roster, {
      label: examName || parsed.name,
      examType,
    });

    if (exams.length === 0) {
      setError("Roster ile eslesen ogrenci bulunamadi.");
      return;
    }

    await submitExams(exams);
  }

  async function handleCsvImport(event: FormEvent) {
    event.preventDefault();
    setError(null);
    await submitExams(parseCsvExamImport(csvText));
  }

  if (!open || !mounted) {
    return null;
  }

  const avg = parsed
    ? (parsed.students.reduce((sum, student) => sum + student.toplamNet, 0) / parsed.students.length).toFixed(1)
    : "0";

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 720 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 9 }}>
            <span className="stat-icon tone-success" style={{ width: 36, height: 36 }}>
              <KiIcon name="ki-chart-pie-simple" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>Deneme Sonucu Ice Aktar</h3>
              <div className="muted" style={{ fontSize: 12.5 }}>
                Excel (.xlsx) veya CSV ile toplu sonuc yukle
              </div>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 36, height: 36 }}
            onClick={onClose}
            aria-label="Kapat"
          >
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          {stage === "idle" || stage === "error" ? (
            <>
              <div className="dropzone" onClick={() => fileRef.current?.click()}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={(event) => void handleFile(event.target.files?.[0])}
                />
                <span className="stat-icon tone-primary" style={{ width: 54, height: 54, borderRadius: 16 }}>
                  <KiIcon name="ki-plus" size={26} />
                </span>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 4 }}>Excel dosyasini sec</div>
                <div className="muted" style={{ fontSize: 12.5 }}>
                  Sirali liste formati (OZDEBIR / OSYM TG) · D / Y / N sutunlari
                </div>
                {stage === "error" && error ? (
                  <span className="badge badge-danger" style={{ marginTop: 8 }}>
                    <KiIcon name="ki-information-2" size={13} />
                    {error}
                  </span>
                ) : null}
              </div>
              <button type="button" className="btn btn-light w-fit" onClick={() => setStage("csv")}>
                CSV ile devam et
              </button>
            </>
          ) : null}

          {stage === "parsing" ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: 13.5 }}>
              Dosya isleniyor...
            </div>
          ) : null}

          {stage === "preview" && parsed ? (
            <>
              <div className="field">
                <label className="label" htmlFor="import-exam-name">
                  Deneme adi
                </label>
                <input
                  id="import-exam-name"
                  className="input"
                  value={examName}
                  onChange={(event) => setExamName(event.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">Sinav turu</label>
                <div className="seg" style={{ width: "fit-content" }}>
                  {(["TYT", "AYT", "LGS"] as ResultExamType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={examType === type ? "on" : ""}
                      onClick={() => setExamType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <UkBadge tone="success">{parsed.students.length} ogrenci okundu</UkBadge>
                <UkBadge tone="muted">{parsed.subjects.length} ders</UkBadge>
                <UkBadge tone="primary">{parsed.examType} · Ort. {avg} net</UkBadge>
              </div>
              <div className="card" style={{ overflow: "hidden" }}>
                <div className="card-body" style={{ padding: 0, maxHeight: 280, overflowY: "auto" }}>
                  <table className="tbl" style={{ minWidth: 520 }}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ad Soyad</th>
                        <th>Sube</th>
                        {parsed.previewColumns.map((column) => (
                          <th key={column} style={{ textAlign: "center" }}>
                            {column}
                          </th>
                        ))}
                        <th style={{ textAlign: "right" }}>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.students.slice(0, 12).map((student, index) => (
                        <tr key={`${student.ad}-${index}`}>
                          <td>
                            <span className="tnum muted">{index + 1}</span>
                          </td>
                          <td>
                            <b style={{ fontSize: 12.5 }}>{student.ad}</b>
                          </td>
                          <td>
                            <span className="muted" style={{ fontSize: 11.5 }}>
                              {student.sube}
                            </span>
                          </td>
                          {parsed.previewColumns.map((column) => (
                            <td key={column} style={{ textAlign: "center" }}>
                              <span className="tnum" style={{ fontSize: 12 }}>
                                {getPreviewCellValue(student, column, parsed.examType)
                                  .toFixed(2)
                                  .replace(/\.00$/, "")}
                              </span>
                            </td>
                          ))}
                          <td style={{ textAlign: "right" }}>
                            <b className="tnum">{student.toplamNet.toFixed(2).replace(/\.00$/, "")}</b>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {parsed.students.length > 12 ? (
                <div className="muted" style={{ fontSize: 11.5, textAlign: "center" }}>
                  +{parsed.students.length - 12} ogrenci daha...
                </div>
              ) : null}
              {error ? (
                <p className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
                  {error}
                </p>
              ) : null}
            </>
          ) : null}

          {stage === "csv" ? (
            <form onSubmit={handleCsvImport} className="stack" style={{ gap: 12 }}>
              <p className="muted" style={{ fontSize: 12.5 }}>
                Her satir: studentId,examType,label,takenAt,subject,correct,wrong
              </p>
              <div className="field">
                <label className="label" htmlFor="import-csv-text">
                  CSV icerigi
                </label>
                <textarea
                  id="import-csv-text"
                  className="input"
                  rows={8}
                  value={csvText}
                  onChange={(event) => setCsvText(event.target.value)}
                />
              </div>
              {error ? (
                <p role="alert" className="badge badge-danger" style={{ height: "auto", padding: "10px 12px" }}>
                  {error}
                </p>
              ) : null}
              <div className="row" style={{ gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-light" onClick={() => setStage("idle")}>
                  Geri
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? "Aktariliyor..." : "CSV ice aktar"}
                </button>
              </div>
            </form>
          ) : null}
        </div>

        {stage === "preview" ? (
          <div className="modal-foot" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Vazgec
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={() => void handleXlsxImport()}
            >
              <KiIcon name="ki-check-circle" />
              {isSubmitting ? "Aktariliyor..." : `Ice Aktar (${parsed?.students.length ?? 0})`}
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
