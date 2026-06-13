# Source Map — Genel Bakış

> Bu klasör, **kanonik prototip** (`indir/uyanikkoc-web-source-v5/`) dosyalarını/bileşenlerini **hedef Next.js projesi** (`apps/web`) içindeki rotalara/bileşenlere eşler.
> Amaç: Codex'in pixel-perfect uygulamasını birebir yönlendirmek.

## Kaynak ↔ Hedef
- **Kaynak (doğruluk kaynağı):** `indir/uyanikkoc-web-source-v5/` — React+Babel SPA, `localStorage` kalıcılık, tek HTML giriş (`uyanik-koc-dashboard.html`).
- **Hedef:** `apps/web/` — Next.js (App Router). Şu an **erken iskelet**: yalnızca login + 3 dashboard stub'ı + layout + `styles/uk-design.css` var. v6 modüllerinin ÇOĞU hedefte HENÜZ YOK; prototipe göre oluşturulmalı.

## Mimari geçiş (özet — handoff/YENI-OZELLIKLER-v6.md "BUILD REHBERİ")
- `Object.assign(window, {...})` global paylaşımı → ES `import/export`.
- `<script type="text/babel">` zinciri → modül grafiği (Next derler).
- Store deseni (`let _state` + localStorage + listener + `useXxx()`) → **Zustand** (veya Context) + **React Query**.
- `localStorage` → REST/GraphQL + DB (Prisma/Postgres). Anahtar→tablo eşlemesi `data-contracts/*` ve aşağıda.
- Gerçek-zaman: mesaj/bildirim WebSocket/SSE; spaced-repetition `nextDue` sunucuda.

## Rota eşleme tablosu
| Rol | Prototip page key | Hedef rota (öneri) | Hedef bileşen (oluşturulacak) |
|---|---|---|---|
| student | dashboard | `/student` | StudentDashboard (TakvimimCard içerir) |
| student | schedule | `/student/schedule` | SchedulePage |
| student | topics | `/student/topics` | TopicsPage (ısı haritası + ders sekmeleri) |
| student | exams | `/student/exams` | ExamsPage (+ NetGainMap + ExamAnaliz→batch) |
| student | mistakes | `/student/mistakes` | YanlisDefteriPage |
| student | assignments | `/student/assignments` | AssignmentsPage (OdevDailyPlan default) |
| student | messages | `/student/messages` | MessagesPage |
| student | appointments | `/student/appointments` | StudentAppointmentsPage |
| student | tests | `/student/tests` | StudentTestsPage |
| student | ai-coach | `/student/ai-coach` | AiCoachPage (Yakında — stub var) |
| student | motivation | `/student/motivation` | MotivationPage |
| student | billing | `/student/billing` | BillingPage |
| coach | dashboard | `/coach` | CoachDashboard |
| coach | students | `/coach/students` | CoachStudentsPage |
| coach | c-topics | `/coach/topics` | CoachKonuPage (NetGainMap+CoachMistakesCard+HataFrekansi) |
| coach | c-cizelge | `/coach/cizelge` | CoachKonuCizelgePage |
| coach | c-assignments | `/coach/assignments` | CoachAssignmentsPage (SmartOdevModal) |
| coach | c-exams | `/coach/exams` | CoachExamsPage (ExamStudentDetail→CoachNoteModal) |
| coach | c-online | `/coach/online-exams` | CoachOnlineExams |
| coach | messages | `/coach/messages` | MessagesPage |
| coach | appointments | `/coach/appointments` | CoachAppointmentsPage |
| coach | tests | `/coach/tests` | CoachTestsPage |
| coach | reports | `/coach/reports` | CoachReportsPage |
| coach | revenue | `/coach/revenue` | CoachRevenueGate |
| parent | dashboard | `/parent` | VeliDashboard (NetGainMap+HataFrekansi+KaynakTracker readonly) |
| parent | p-exams | `/parent/exams` | VeliDenemelerPage |
| parent | p-reports | `/parent/reports` | ParentReportsPage |
| parent | messages | `/parent/messages` | MessagesPage |
| parent | appointments | `/parent/appointments` | StudentAppointmentsPage (paylaşılan) |
| parent | billing | `/parent/billing` | BillingPage |
| ortak | settings/support/profile | `/<rol>/settings` vb. | SettingsPage / SupportPage / ProfilePage |

> Rota desenleri öneridir; mevcut iskelet `/student`, `/coach`(yok—`components/coach`), `/parent` düzenini izler. App shell rol+sayfa yönlendirmesi `app.jsx`'tedir (MENUS/ROUTES/BOTTOM_NAV).

## Hedefte hazır olan / değiştirilecek
| Hedef dosya | Durum | Aksiyon |
|---|---|---|
| `apps/web/styles/uk-design.css` | VAR (v4 tabanlı) | **`--muted` #767A90 → #6B6F85 düzelt**; v6 `.yd-*/.hf-*/.ngm-*/.ag-*/.sm-*/.msg-*` sınıflarını ekle (kaynak styles.css + modül css'leri) |
| `apps/web/app/globals.css` | VAR | reset/temel; çakışmayı kontrol et |
| `apps/web/app/layout.tsx` | VAR | font + AuthProvider hazır; `data-theme` toggle ekle |
| `apps/web/components/layout/{AppLayout,Header,Sidebar}.tsx` | VAR (stub) | app.jsx Sidebar/Topbar/BottomNav'a göre tamamla |
| `apps/web/lib/design/icon-paths.ts` | VAR | `src/icons.jsx · ICON_PATHS` ile senkron tut |
| `apps/web/components/{coach,parent,student}/*Dashboard.tsx` | VAR (stub) | prototip dashboard'larına göre yeniden yaz |

Detay: `file-map.md`, `component-map.md`.
