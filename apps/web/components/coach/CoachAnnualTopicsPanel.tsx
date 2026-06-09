"use client";

/* Kaynak: .design-import/handoff-28/.../konu-cizelge/coach-cizelge-page.jsx */

import { KonuCizelge } from "@/components/coach/KonuCizelge";
import { KiIcon } from "@/components/design/KiIcon";
import { UkPageHead } from "@/components/design/UkPageHead";

export function CoachAnnualTopicsPanel() {
  return (
    <div className="stack rise">
      <UkPageHead
        title="Yıllık Konu Takip Çizelgesi"
        sub="Tüm yılın oturum oturum çalışma kaydı · Tekrar / Günlük / Haftalık görünüm"
        actions={
          <button type="button" className="btn btn-light">
            <KiIcon name="ki-download" size={16} />
            Dışa aktar
          </button>
        }
      />
      <KonuCizelge maxHeight="64vh" />
    </div>
  );
}
