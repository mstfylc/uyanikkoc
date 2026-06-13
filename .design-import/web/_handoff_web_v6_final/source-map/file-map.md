# Source Map — Dosya → Hedef Eşlemesi (file-map)

> Kaynak kök: `indir/uyanikkoc-web-source-v5/`
> Hedef kök: `apps/web/`
> "Hedef" yolları öneridir; mevcut iskelet düzenine uyarlayın.

## Tasarım sistemi / global
| Kaynak | İçerik | Hedef |
|---|---|---|
| `src/styles.css` | TAM tasarım sistemi (`:root`+dark, tüm component sınıfları) | `apps/web/styles/uk-design.css` (birebir; `--muted` düzelt) |
| `src/billing.css` | faturalandırma stilleri | `styles/uk-design.css`'e ekle ya da `billing.css` modülü |
| `src/kaynak-tracker.css` | kaynak takip | aynı |
| `src/odev-ata.css` | ödev atama modal | aynı |
| `src/coach-konu.css` | koç konu takibi | aynı |
| `konu-cizelge/cizelge.css` | yıllık çizelge | aynı |
| `tokens.json` | token doğruluk kaynağı | `lib/design/tokens.ts` (+ bu paketteki tokens/*) |
| `src/icons.jsx` (ICON_PATHS) | line-icon SVG path seti | `lib/design/icon-paths.ts` (senkron) + `<Icon>` bileşeni |
| `src/logo.jsx` | marka logosu | `components/brand/Logo.tsx` |
| `src/ui.jsx` | UI primitifleri (Section, PageHead, Badge, StatCard, Avatar, NumStepper…) | `components/ui/*` |
| `src/ui-actions.jsx` | toast / ToastHost | `components/ui/Toast.tsx` (+ provider) |

## App shell / yönlendirme / kimlik
| Kaynak | İçerik | Hedef |
|---|---|---|
| `src/app.jsx` | MENUS/ROUTES/BOTTOM_NAV, Sidebar, Topbar, BottomNav, App | `components/layout/{Sidebar,Header,BottomNav,AppLayout}.tsx` + Next route ağacı |
| `src/auth.jsx` | LoginScreen, Üye ol, ProfilePage, DEMO_USERS, loadAuth/saveAuth | `components/auth/LoginForm.tsx` (+ providers, auth guard) |
| `src/settings.jsx` | Ayarlar | `components/settings/*` |
| `src/notifications.jsx` | NotifBell, pushNotif (uk_notif_v2) | `components/notifications/*` + store |

## v6 YENİ modüller (öncelik)
| Kaynak | İçerik | Hedef |
|---|---|---|
| `src/mistakes-store.jsx` | Yanlış Defteri veri+store, spaced repetition, hata frekansı | `lib/stores/mistakes.ts` (Zustand) + `lib/api/mistakes.ts` |
| `src/yanlis-defteri.jsx` | YanlisDefteriPage, HataFrekansiCard, ZeroErrorLoop/Review, MistakeAdd/BatchModal, MistakeRow, CoachMistakesCard | `components/student/mistakes/*` + `components/coach/CoachMistakesCard.tsx` |
| `src/net-gain-map.jsx` | NetGainMap | `components/shared/NetGainMap.tsx` (read-only endpoint) |
| `src/coach-smart-odev.jsx` | SmartOdevModal | `components/coach/SmartOdevModal.tsx` |
| `src/student-agenda.jsx` | TakvimimCard (Ajanda/Hafta/Ay) | `components/student/TakvimimCard.tsx` |
| `src/messaging.jsx` | MessagesPage, GroupModal, store (uk_msg_v1), sendMsg, unread | `components/messaging/*` + `lib/stores/messaging.ts` (WS/SSE) |
| `src/coach-pages.jsx` | CoachNoteModal, CoachAssignmentRow, CoachAssignmentsPage | `components/coach/*` |
| `src/coach-pages2.jsx` | ExamStudentDetail (Not gönder) | `components/coach/ExamStudentDetail.tsx` |
| `src/coach-konu.jsx` | CoachKonuPage (NetGainMap+CoachMistakesCard+HataFrekansi mount + OdevAtaModal) | `components/coach/CoachKonuPage.tsx` |
| `src/odev-student.jsx` | OdevCard, OdevResultModal (→MistakeBatch), OdevDailyPlan/Calendar/List, Kaynaklarım | `components/student/assignments/*` |
| `src/student-exam-analiz.jsx` | deneme analizi + "Yanlışları deftere ekle" | `components/student/ExamAnaliz.tsx` |
| `src/parent.jsx` | VeliDashboard (içgörü kartları), VeliDenemelerPage | `components/parent/*` |

## Diğer modüller (taşı)
| Kaynak | Hedef |
|---|---|
| `src/odev-store.jsx` | `lib/stores/assignments.ts` (+ sources, self-study) |
| `src/konu-store.jsx`, `src/curriculum.jsx` | `lib/stores/topics.ts`, `lib/data/curriculum.ts` |
| `src/appointments(.jsx/-ui)` | `components/appointments/*` + `lib/stores/appointments.ts` |
| `src/tests-store/tests-ui/manual-exam/deneme-import/deneme-kayit/online-deneme` | `components/exams/*` |
| `src/kaynak-catalog/kaynak-picker/kaynak-tracker` | `components/sources/*` |
| `src/billing-store/billing/billing-checkout/billing-branch` | `components/billing/*` |
| `src/reports.jsx`, `src/school-schedule.jsx`, `src/support.jsx`, `src/roster.jsx`, `src/motivation-send.jsx`, `src/coach-rating.jsx` | ilgili `components/*` |
| `konu-cizelge/*` | `components/cizelge/*` |
| `src/data.jsx`, `src/student-data.jsx`, `src/coach-data.jsx` | `lib/data/*` (demo seed → DB seed) |

## localStorage anahtarı → tablo
`uk_mistakes_v1`→mistakes · `uk_odevler_v1`→assignments · `uk_sources_v2`→student_sources · `uk_selfstudy_v1`→self_study · `uk_msg_v1`→messages/threads · `uk_notif_v2`→notifications · `uk_konu`→topic_status · `uk_topic_src_v2`→topic_sources · `uk_appointments_v1`→appointments · `uk_student_notes_v1`→student_notes · `uk_billing*`→billing · `uk_auth_v1`→auth/session · `uk_theme`/`uk_role`/`uk_page_*`→UI state (DB değil).
