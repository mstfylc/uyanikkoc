# V6 Final All Areas Parity Matrix

Date: 2026-06-12

Source set:
- Claude web prototype: `.design-import/uyanikkoc-31/indir/Uyanik Koc - Web Paketi (Tam) v2/src/*`
- Coach topics canonical source: `.design-import/uyanikkoc-31/indir/Uyanik Koc - Web Paketi (Tam) v2/src/coach-konu.jsx` and `coach-konu.css`
- Live target: `apps/web/*`

| Alan / Route / Component | Claude Design kaynagi | Canli hedef dosya | Beklenen kullanici davranisi | Gorsel parite durumu | Backend/API durumu | RBAC durumu | Aksiyon |
|---|---|---|---|---|---|---|---|
| Global shell / tokens / responsive | `src/styles.css`, handoff tokens | `apps/web/styles/uk-design.css`, `apps/web/app/globals.css`, layout components | Light/dark tokens, nav states, modal/form/table states, mobile no-overflow | OK | OK | OK | verify |
| Student dashboard / Takvimim | `src/student.jsx`, `src/student-pages.jsx` | `apps/web/components/student/StudentDashboard.tsx`, `TakvimimCard.tsx` | Dashboard cards + agenda/week/month; item click to live routes | OK | OK | OK | verify |
| Student Yanlis Defteri | v6 mistake specs/flows, `src/student-extra.jsx` | `apps/web/app/student/mistakes/page.tsx`, mistake API/service/repo | Add/list/filter/review/ZeroError; safe topic-null fallback; no dataURL photo write | OK | OK | OK | verify |
| Student exams / NetGainMap / optik | `src/student-exam-analiz.jsx`, `src/online-deneme.jsx` | `StudentExamsPanel.tsx`, `NetGainMap.tsx`, online exam APIs | NetGainMap visible; optik wrong/blank ingests idempotent mistakes | OK | OK | OK | verify |
| Student assignments | `src/odev-student.jsx` | `StudentAssignmentsPanel.tsx`, assignment service | Existing result flow works; no fabricated question-level mistakes | OK | OK | OK | verify |
| Coach dashboard | `src/coach.jsx`, `src/coach-pages.jsx` | `CoachDashboard.tsx` | Risk/action/activity cards render with v6 tokens | OK | OK | OK | verify |
| Coach students / detail insight | `src/roster.jsx`, `src/coach-pages.jsx` | `CoachStudentRoster.tsx`, `CoachStudentDetail.tsx`, insight APIs | Roster scoped student insight; no out-of-roster data | OK | OK | OK | verify |
| Coach topics critical path | `src/coach-konu.jsx`, `src/coach-konu.css` | `CoachTopicsPanel.tsx`, `uk-design.css` | PageHead -> student strip -> NetGainMap -> mistakes/frequency -> stats -> net -> targets/analysis -> question tracking -> `.ktx` rail/cards -> one assign modal | OK | OK | OK | verify |
| Coach SmartOdev | `src/coach-odev-ata.jsx`, SmartOdev handoff | `SmartOdevModal.tsx`, `/api/coach/smart-assignments` | Preview without DB write; assign creates assignment through guarded flow | OK | OK | OK | verify |
| Coach assignments | `src/odev-store.jsx`, `src/coach-pages.jsx` | `CoachAssignmentsPanel.tsx`, assignment APIs | Existing create/list/filter/result states; SmartOdev assignment appears | OK | OK | OK | verify |
| Parent dashboard / insight | `src/parent.jsx` | `ParentDashboard.tsx`, parent mistake/net APIs | Read-only child mistake/net insights; own child only | OK | OK | OK | verify |
| Messaging | `src/messaging.jsx` | `MessagesPanel.tsx`, role message routes, thread-state API | Thread open marks read; mute persists; role-scoped threads only | OK | OK | OK | verify |
| Notifications | `src/notifications.jsx` | `NotificationsPanel.tsx`, role notification routes | Role scoped read/mark-all; coach DB scope | OK | OK | OK | verify |
| Modals / forms / tables / nav states | `src/ui.jsx`, `src/ui-actions.jsx`, component specs | `apps/web/components/**`, `uk-design.css` | Focus/hover/disabled/loading/error; mobile modal no overflow | OK | OK | OK | verify |

Browser QA result:
- PASS on live domain `https://koc.uyanik.com.tr`.
- 37 Playwright visual checks passed, 0 failed.
- Desktop light and mobile light screenshots were captured for all listed student/coach/parent routes.
- Desktop dark screenshots were captured for representative dashboard/notification routes per role.
- Coach topics order/modal check passed: `.ktx` count 1, `.ktx table` count 0, shared `Odev Ata` modal opened.
- Screenshots and machine-readable results are stored in `docs/cursor/visual-checks/`.

Known non-design operational risk:
- Password reset email delivery depends on a real production `RESEND_API_KEY`; design parity is not blocked by this.
