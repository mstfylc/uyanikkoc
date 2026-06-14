"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { CardBrandBadge } from "@/components/shared/billing/CardBrandBadge";
import { KiIcon } from "@/components/design/KiIcon";
import {
  brandFromNumber,
  fmtCardExpInput,
  fmtCardNum,
  parseCardExp,
} from "@/lib/design/billing-ui";

type BillingAddCardModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
};

function CardVisual({
  number,
  holder,
  exp,
  brand,
}: {
  number: string;
  holder: string;
  exp: string;
  brand: "visa" | "mastercard";
}) {
  return (
    <div className="cc-visual">
      <div className="cc-chip" />
      <CardBrandBadge brand={brand} />
      <div className="cc-number tnum">{number || "•••• •••• •••• ••••"}</div>
      <div className="cc-row">
        <div>
          <span className="cc-cap">Kart Sahibi</span>
          <div className="cc-val">{holder || "AD SOYAD"}</div>
        </div>
        <div>
          <span className="cc-cap">Son Kul.</span>
          <div className="cc-val tnum">{exp || "AA/YY"}</div>
        </div>
      </div>
    </div>
  );
}

export function BillingAddCardModal({ open, onClose, onSaved }: BillingAddCardModalProps) {
  const [num, setNum] = useState("");
  const [holder, setHolder] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNum("");
      setHolder("");
      setExp("");
      setCvc("");
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const brand = brandFromNumber(num);
  const canSave =
    num.replace(/\s/g, "").length >= 15 &&
    holder.trim().length > 2 &&
    exp.length === 5 &&
    cvc.length >= 3;

  async function save() {
    const parsed = parseCardExp(exp);
    if (!parsed || !canSave) return;
    setIsSaving(true);
    const response = await fetch("/api/billing/payment-methods", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        brand,
        last4: num.replace(/\s/g, "").slice(-4),
        holder: holder.trim(),
        expMonth: parsed.expMonth,
        expYear: parsed.expYear,
        makeDefault: true,
      }),
    });
    setIsSaving(false);
    if (response.ok) {
      await onSaved();
      onClose();
    }
  }

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="row" style={{ gap: 11 }}>
            <span className="stat-icon tone-primary" style={{ width: 38, height: 38 }}>
              <KiIcon name="ki-wallet" size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800 }}>Kart Ekle</h3>
              <div className="muted" style={{ fontSize: 12 }}>Kartlarin guvenle saklanir</div>
            </div>
          </div>
          <button type="button" className="icon-btn" style={{ width: 36, height: 36 }} onClick={onClose} aria-label="Kapat">
            <KiIcon name="ki-plus" size={18} style={{ transform: "rotate(45deg)" }} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: 20, gap: 12 }}>
          <CardVisual number={fmtCardNum(num)} holder={holder} exp={exp} brand={brand} />
          <div className="field">
            <label className="label">Kart Numarasi</label>
            <div className="input-icon">
              <input
                className="input tnum"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={fmtCardNum(num)}
                onChange={(e) => setNum(fmtCardNum(e.target.value))}
              />
              <CardBrandBadge brand={brand} size="sm" />
            </div>
          </div>
          <div className="field">
            <label className="label">Kart Uzerindeki Isim</label>
            <input
              className="input"
              placeholder="Ad Soyad"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toLocaleUpperCase("tr-TR"))}
            />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">Son Kullanim</label>
              <input
                className="input tnum"
                inputMode="numeric"
                placeholder="AA/YY"
                value={exp}
                onChange={(e) => setExp(fmtCardExpInput(e.target.value))}
              />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label className="label">CVC</label>
              <input
                className="input tnum"
                inputMode="numeric"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canSave || isSaving}
            onClick={() => void save()}
            style={{ opacity: canSave ? 1 : 0.5, marginLeft: "auto" }}
          >
            <KiIcon name="ki-check" size={16} />
            {isSaving ? "Kaydediliyor..." : "Kartı Kaydet"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
