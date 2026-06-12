# Uyanık Koç Web v6 Final - Component Gap Map

Bu map final handoff içindeki 9 component spec'in tamamını canlı repo hedefleriyle eşler. Target path önerileri mevcut `apps/web` yapısına göre verilmiştir; P0'da kod yazılmadı.

| v6 component spec | Target component path | Mount edilen route | State listesi | Token bağı | Desktop PNG | Mobile/modal eksikliği | Durum |
|---|---|---|---|---|---|---|---|
| `yanlis-defteri.md` | `apps/web/components/student/mistakes/YanlisDefteriPage.tsx`, `MistakeAddModal.tsx`, `MistakeBatchModal.tsx`, `MistakeRow.tsx`; coach kartı için `apps/web/components/coach/CoachMistakesCard.tsx` | `/student/mistakes`, `/student/assignments`, `/student/exams`, `/coach/topics` | empty, loading, error, disabled, filtered-empty, add, batch, delete, lightbox | `.yd-*`, badge tone, subject colors, modal, form, button, `MIS_INTERVALS` | var: `exports/student/desktop-*/mistakes.png` | mobile yok; modal PNG yok | yeni, backend gerekli |
| `hata-frekansi.md` | `apps/web/components/shared/HataFrekansiCard.tsx` | `/student/mistakes`, `/coach/topics`, `/parent/dashboard` | total=0 placeholder/gizli, readonly, ranked bars | `.hf-*`, tone colors, `--muted`, `--surface-*`, subject colors | var dolaylı: student mistakes; parent dashboard hedef | mobile yok | yeni, backend gerekli |
| `zero-error-loop.md` | `apps/web/components/student/mistakes/ZeroErrorLoop.tsx`, `ZeroErrorReview.tsx`, `MistakeStageDots.tsx` | `/student/mistakes` | due-empty, due-list, expanded-more, review-card, skipped, completed | `.yd-due`, `.yd-rev-*`, modal, button, badge, `1 -> 3 -> 7 -> 21` | var: student mistakes | mobile yok; modal PNG yok | yeni, backend gerekli |
| `net-gain-map.md` | `apps/web/components/shared/NetGainMap.tsx` | `/student/exams`, `/coach/topics`, `/parent/dashboard` | null when empty, top cards, rest list, role CTA states | `.ngm-*`, subject colors, badge tone, `--success`, `--warning`, `--danger` | var dolaylı: student exams, parent dashboard; coach topics PNG yok | mobile yok | yeni, backend gerekli |
| `smart-odev-modal.md` | `apps/web/components/coach/SmartOdevModal.tsx` | `/coach/assignments` | open, generated, edited, empty-day, assigned, disabled, toggles | `.sm-*`, modal, segment, stepper, switch, subject colors | var: coach c-assignments page only | modal PNG yok, mobile yok | yeni, backend gerekli |
| `takvimim-card.md` | `apps/web/components/student/TakvimimCard.tsx` | `/student/dashboard` | agenda, week, month, filtered, agenda-empty, week-scroll, month-selected | `.ag-*`, segment, filters, badge tone, subject colors | var dolaylı: student dashboard hedef | mobile yok | yeni, backend gerekli |
| `messaging-notifications.md` | mevcut `apps/web/components/shared/MessagesPanel.tsx`, `NotificationBell.tsx`; ek `GroupModal`/mute/read state gerekebilir | `/student/messages`, `/coach/messages`, `/parent/messages`, global header | empty, read, unread, muted, typing, group-edit, loading, error | `.msg-*`, `.chan-*`, `.notif-*`, avatar, modal, badge | var: all role messages PNG | mobile yok; GroupModal PNG yok | mevcut, revize |
| `odev-plan-item.md` | mevcut `StudentAssignmentsPanel.tsx`, `CoachAssignmentsPanel.tsx`; ek `OdevResultModal`, `CoachNoteModal` ayrıştırma gerekebilir | `/student/assignments`, `/coach/assignments`, `/coach/exams` | pending, overdue, done-no-result, done-result, result-modal, note-modal, disabled | `.lrow`, `.lr-*`, `.odev-cal-*`, `.ata-srcinfo`, subject colors | var: student assignments, coach c-assignments | modal PNG yok, mobile yok | mevcut, revize, backend gerekli |
| `states-nav-modal-form-table.md` | mevcut design primitives: `components/design/*`, `styles/uk-design.css`, `components/layout/*` | tüm route'lar | button rest/hover/active/disabled, badge/chip, input focus, segment on, table hover, nav active, modal, toast, responsive | global tokens, `--r-*`, `--shadow-*`, `--sidebar-w`, `--header-h` | tüm desktop PNG'ler | mobile davranış gerçek browser ile doğrulanmalı | mevcut, revize |

## Mevcut Karşılıklar

- Design primitive dosyaları mevcut: `UkPageHead`, `UkSection`, `UkBadge`, `UkStatCard`, `UkAvatar`, `UkNumStepper`, `KiIcon`.
- Messaging ve notifications DB-backed kısmi mevcut: thread listeleme/gönderme ve notification read var.
- Ödev sonuç girişi DB-backed kısmi mevcut: `AssignmentResult` var.
- Koç ödev atama modalı mevcut: `CoachOdevAtaModal`.

## Gap Özeti

- Yanlış Defteri ailesi için model/service/repository/API/route yok.
- NetGainMap ve SmartOdev türetilmiş backend endpointleri yok.
- Takvimim aggregation endpointi yok.
- Messaging v6 unread/read/mute için `ThreadMember.lastReadAt`, `ThreadMember.muted` ve user-scoped notification genişletmesi gerekiyor.
- CSS v6 token parity yok; P1 gate zorunlu.
