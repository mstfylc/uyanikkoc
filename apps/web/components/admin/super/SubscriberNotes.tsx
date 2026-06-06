// Lisanslı abone (kurum/koç) profilinde süper admin notları + ücretsiz demo kartı.
// apps/web/components/admin/super/SubscriberNotes.tsx
"use client";

import { useState } from "react";

import { Icon } from "@/components/admin/AdminKit";
import { useAdminStore } from "@/components/admin/AdminStore";
import { DemoDialog, RenewDialog } from "@/components/admin/dialogs";
import { canEdit } from "@/components/admin/selectors";
import { UkSection } from "@/components/design/UkSection";
import { fmtShort } from "@/lib/admin/format";
import type { LicenseSubjectKind } from "@/lib/admin/types";

const AUTHOR = "Platform Ekibi";

export function SubscriberNotes({
  subjectKind,
  subjectId,
  name,
  currentPlanId,
  currentRenewsAt,
  giftedDemoUntil,
}: {
  subjectKind: LicenseSubjectKind;
  subjectId: string;
  name: string;
  currentPlanId: string;
  currentRenewsAt: number;
  giftedDemoUntil?: number;
}) {
  const { snapshot, mutate, toast } = useAdminStore();
  const [text, setText] = useState("");
  const [renewOpen, setRenewOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const editable = snapshot ? canEdit(snapshot.viewerAccess) : false;

  const notes = (snapshot?.licenseNotes ?? [])
    .filter((n) => n.subjectKind === subjectKind && n.subjectId === subjectId)
    .sort((a, b) => b.date - a.date);

  const addNote = async () => {
    if (!text.trim()) return;
    await mutate({ kind: "addLicenseNote", subjectKind, subjectId, text: text.trim(), author: AUTHOR });
    setText("");
    toast("Not eklendi", { icon: "ki-notepad-edit" });
  };

  return (
    <>
      <UkSection
        title="Lisans işlemleri"
        sub="Yenileme, ücretsiz demo ve abone notları"
        action={
          giftedDemoUntil ? (
            <span className="badge badge-info">
              <Icon name="bolt" size={13} />
              Demo · {fmtShort(giftedDemoUntil)}
            </span>
          ) : null
        }
      >
        <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {editable ? (
            <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setRenewOpen(true)}>
                <Icon name="refresh" size={15} />
                Lisansı yenile
              </button>
              <button type="button" className="btn btn-light btn-sm" onClick={() => setDemoOpen(true)}>
                <Icon name="bolt" size={15} />
                Ücretsiz demo tanımla
              </button>
            </div>
          ) : (
            <div className="alert-strip">
              <span className="as-ic"><Icon name="lock" size={16} /></span>
              <div style={{ flex: 1 }}>
                <b style={{ fontSize: 13 }}>Salt görüntüleme</b>
                <div className="muted" style={{ fontSize: 12 }}>Destek yetkilisi yalnızca görüntüler; lisans işlemi yapamaz.</div>
              </div>
            </div>
          )}

          <div>
            <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 9 }}>
              Abone notları
            </div>
            {editable ? (
              <div className="row" style={{ gap: 8, marginBottom: 12, alignItems: "flex-start" }}>
                <textarea
                  className="input"
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Bu abone için iç not ekle…"
                  style={{ flex: 1, resize: "vertical" }}
                />
                <button type="button" className="btn btn-primary" onClick={addNote} disabled={!text.trim()} style={{ flexShrink: 0 }}>
                  <Icon name="plus" size={16} />
                  Ekle
                </button>
              </div>
            ) : null}

            <div className="stack" style={{ gap: 9 }}>
              {notes.length === 0 ? (
                <p className="muted" style={{ fontSize: 12.5 }}>Henüz not yok.</p>
              ) : (
                notes.map((n) => (
                  <div key={n.id} className="fb-card">
                    <div className="fb-head">
                      <span className="stat-icon tone-primary" style={{ width: 30, height: 30 }}>
                        <Icon name="notebook" size={15} />
                      </span>
                      <div style={{ flex: 1 }}>
                        <b style={{ fontSize: 12.5 }}>{n.author}</b>
                        <div className="muted" style={{ fontSize: 11 }}>{fmtShort(n.date)}</div>
                      </div>
                      {editable ? (
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ width: 30, height: 30 }}
                          title="Sil"
                          onClick={async () => {
                            await mutate({ kind: "deleteLicenseNote", noteId: n.id });
                            toast("Not silindi", { icon: "ki-information-2", tone: "warning" });
                          }}
                        >
                          <Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} />
                        </button>
                      ) : null}
                    </div>
                    <p className="fb-quote">{n.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </UkSection>

      {renewOpen ? (
        <RenewDialog
          subjectKind={subjectKind}
          subjectId={subjectId}
          currentPlanId={currentPlanId}
          currentRenewsAt={currentRenewsAt}
          name={name}
          onClose={() => setRenewOpen(false)}
        />
      ) : null}
      {demoOpen ? (
        <DemoDialog subjectKind={subjectKind} subjectId={subjectId} name={name} author={AUTHOR} onClose={() => setDemoOpen(false)} />
      ) : null}
    </>
  );
}
