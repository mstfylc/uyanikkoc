# Uyanık Koç Web v6 Final - Screen Gap Map

P0 kapsamı: mevcut `apps/web` route/component yapısı esas alınmıştır. Handoff içindeki `/student`, `/coach`, `/parent` önerileri canlı repoda kullanılan `/student/dashboard`, `/coach/dashboard`, `/parent/dashboard` düzenine uyarlanmıştır.

## Kaynak Görsel Matrisi

| Rol | Desktop PNG | Mobile PNG | Modal PNG |
|---|---|---|---|
| Student | var: dashboard, assignments, exams, messages, mistakes, topics | yok | yok |
| Coach | var: dashboard, c-assignments, messages, reports, students | yok | yok |
| Parent | var: dashboard, messages, p-exams | yok | yok |

## Student Routes

| Mevcut route | Mevcut component | v6 hedefi | Desktop PNG | Mobile PNG | Modal spec | Durum |
|---|---|---|---|---|---|---|
| `/student/dashboard` | `StudentDashboard` | Dashboard + `TakvimimCard` mount | var: `exports/student/desktop-*/dashboard.png` | yok | yok | revize, backend gerekli |
| `/student/schedule` | `StudentSchedulePanel` | Program sayfası; NetGainMap student CTA buraya gider | yok | yok | yok | mevcut, revize |
| `/student/topics` | `StudentTopicPanel` | Konu takibi v6 shell/token uyumu | var: `exports/student/desktop-*/topics.png` | yok | yok | mevcut, revize |
| `/student/exams` | `StudentExamsPanel`, `StudentExamAnalysis` | Denemeler + `NetGainMap` + deneme analizi -> MistakeBatch | var: `exports/student/desktop-*/exams.png` | yok | `MistakeBatchModal` var | revize, backend gerekli |
| `/student/mistakes` | yok | `YanlisDefteriPage`, `ZeroErrorLoop`, `HataFrekansiCard` | var: `exports/student/desktop-*/mistakes.png` | yok | `MistakeAddModal`, `MistakeBatchModal`, `ZeroErrorReview` var | yeni, backend gerekli, risk |
| `/student/assignments` | `StudentAssignmentsPanel` | OdevDailyPlan default + sonuç -> MistakeBatch | var: `exports/student/desktop-*/assignments.png` | yok | `OdevResultModal`, `MistakeBatchModal` var | revize, backend gerekli |
| `/student/messages` | `StudentMessagesPanel` -> `MessagesPanel` | v6 unread/read/mute + DM/group görünürlüğü | var: `exports/student/desktop-*/messages.png` | yok | yok | revize, backend gerekli |
| `/student/appointments` | `AppointmentsPanel` | Takvimim randevu kaynağı | yok | yok | randevu modal mevcut | mevcut |
| `/student/tests` | `StudentTestsPanel` | v6 kapsam dışı, mevcut korunur | yok | yok | yok | mevcut |
| `/student/ai-coach` | AI Koç Yakında surface | Yakında korunur, canlı AI yok | yok | yok | yok | mevcut |
| `/student/motivation` | `MotivationPanel` | v6 kapsam dışı, mevcut korunur | yok | yok | yok | mevcut |
| `/student/billing` | `BillingPanel` | v6 kapsam dışı, mevcut korunur | yok | yok | billing modal mevcut | mevcut |
| `/student/settings`, `/student/support`, `/student/profile`, `/student/notifications` | shared panels | genel mevcut yüzeyler | yok | yok | yok | mevcut |

## Coach Routes

| Mevcut route | Mevcut component | v6 hedefi | Desktop PNG | Mobile PNG | Modal spec | Durum |
|---|---|---|---|---|---|---|
| `/coach/dashboard` | `CoachDashboard` | v6 dashboard token/shell parity | var: `exports/coach/desktop-*/dashboard.png` | yok | yok | mevcut, revize |
| `/coach/students` | `CoachStudentRoster` / `CoachStudentsTable` | öğrenci roster + detay geçişi | var: `exports/coach/desktop-*/students.png` | yok | öğrenci ekleme mevcut | mevcut, revize |
| `/coach/students/[id]` | `CoachStudentDetail` | öğrenci bağlam ekranı; v6 insights mount adayı | yok | yok | çeşitli mevcut | revize |
| `/coach/topics` | `CoachTopicsPanel` | `NetGainMap` -> `CoachMistakesCard` -> `HataFrekansiCard` -> konu tablosu | eksik: coach/c-topics PNG yok | yok | `CoachOdevAtaModal` mevcut | revize, backend gerekli, risk |
| `/coach/topics/annual` | `CoachAnnualTopicsPanel` / `KonuCizelge` | yıllık çizelge mevcut korunur | yok | yok | yok | mevcut |
| `/coach/assignments` | `CoachAssignmentsPanel` | SmartOdevModal + tamamlanan ödevde CoachNoteModal | var: `exports/coach/desktop-*/c-assignments.png` | yok | `SmartOdevModal`, `CoachNoteModal` var | revize, backend gerekli |
| `/coach/assignments/create` | create assignment page + `CoachOdevAtaModal` flow | mevcut ödev atama korunur | yok | yok | `OdevAtaModal` mevcut | mevcut, revize |
| `/coach/exams` | `CoachExamsPanel`, `CoachExamStudentDetailModal` | deneme detayında "Not gönder" | yok | yok | `CoachNoteModal` var | revize, backend gerekli |
| `/coach/messages` | `CoachMessagesPanel` -> `MessagesPanel`, `GroupCreateModal` | group modal + unread/read/mute | var: `exports/coach/desktop-*/messages.png` | yok | `GroupModal` var | revize, backend gerekli |
| `/coach/appointments` | `AppointmentsPanel` | randevu yönetimi mevcut | yok | yok | mevcut modal | mevcut |
| `/coach/tests` | `CoachTestsPanel` | v6 kapsam dışı, mevcut korunur | yok | yok | test modal mevcut | mevcut |
| `/coach/reports` | `CoachReportsPanel` | rapor yüzeyi | var: `exports/coach/desktop-*/reports.png` | yok | rapor modal mevcut | mevcut, revize |
| `/coach/feedback`, `/coach/revenue`, `/coach/license`, `/coach/invoices`, `/coach/settings`, `/coach/support`, `/coach/profile` | mevcut paneller | v6 kapsam dışı veya genel | yok | yok | çeşitli | mevcut |

## Parent Routes

| Mevcut route | Mevcut component | v6 hedefi | Desktop PNG | Mobile PNG | Modal spec | Durum |
|---|---|---|---|---|---|---|
| `/parent/dashboard` | `ParentDashboard` | `NetGainMap` parent read-only + `HataFrekansiCard` + `KaynakTracker` readonly | var: `exports/parent/desktop-*/dashboard.png` | yok | yok | revize, backend gerekli |
| `/parent/exams` | `ParentExamsPanel` | veli deneme sonuçları | var: `exports/parent/desktop-*/p-exams.png` | yok | yok | mevcut, revize |
| `/parent/reports` | `ParentReportsPanel` | gelişim raporları mevcut korunur | yok | yok | report detail mevcut | mevcut |
| `/parent/messages` | `MessagesPanel` | parent DM/group görünürlüğü + unread/read/mute | var: `exports/parent/desktop-*/messages.png` | yok | yok | revize, backend gerekli |
| `/parent/appointments` | `AppointmentsPanel` | çocuk randevuları readonly/request | yok | yok | randevu modal mevcut | mevcut |
| `/parent/billing`, `/parent/notifications`, `/parent/settings`, `/parent/support`, `/parent/profile` | shared panels | genel mevcut yüzeyler | yok | yok | çeşitli | mevcut |

## Global Shell

| Mevcut dosya | v6 hedefi | Durum |
|---|---|---|
| `components/layout/AppLayout.tsx` | Sidebar + Header + content + mobile nav shell | mevcut, revize |
| `components/layout/Header.tsx` | topbar, theme toggle, NotifBell, user pop; rol segment artefaktı kopyalanmayacak | mevcut, revize |
| `components/layout/Sidebar.tsx` | sidebar + bottom-nav; öğrenci nav'a `Yanlış Defteri` eklenecek | mevcut, revize |
| `styles/uk-design.css` | v6 token ve component class parity | revize, risk |

## P0 Sonucu

Ana eksikler: `/student/mistakes` route yok; v6 NetGainMap, TakvimimCard, SmartOdevModal, HataFrekansi/ZeroError bileşenleri canlı component ağacında yok; mobil/modal PNG yok; coach topics PNG yok. Sonraki faza geçmeden bu riskler `RISK_REPORT.md` içinde işaretlendi.
