// İstemci tarafı dışa aktarma yardımcıları. apps/web/lib/admin/csv.ts
// Prototip kaynağı: src/ui-actions.jsx (downloadCSV, downloadText).
"use client";

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadCSV(filename: string, rows: (string | number)[][]): void {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? "");
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(";"),
    )
    .join("\n");
  // Excel TR için BOM + noktalı virgül ayraç
  triggerDownload(filename, new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
}

export function downloadText(filename: string, text: string): void {
  triggerDownload(filename, new Blob([text], { type: "text/plain;charset=utf-8" }));
}
