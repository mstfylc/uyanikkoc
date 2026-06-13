# ENVANTER HARİTASI — istenen öğe → gerçek kaynak (rota / modal / panel / alt-sekme)

> Kanonik kural: **olmayan ekran uydurma.** Aşağıda her öğenin gerçekte ne olduğu ve hangi
> dosyada tanımlandığı yazılıdır. "Rota" = sidebar'dan açılan tam sayfa; diğerleri panel/modal/
> alt-sekmedir, **ayrı sayfa olarak tasarlanmaz**. Eşleme `src/app.jsx` `ROUTES`/`MENUS`'ten doğrulandı.

## ÖĞRENCI (role = student)
| İstenen | Tür | Bileşen | Dosya |
|---|---|---|---|
| dashboard | rota | `StudentDashboard` | `src/student.jsx` |
| schedule (Çalışma Programı) | rota | `SchedulePage` | `src/student-pages.jsx` |
| topics (Konu Takibi) | rota | `TopicsPage` | `src/student-pages.jsx` |
| exams (Denemeler) | rota | `ExamsPage` | `src/student-pages.jsx` |
| mistakes (Yanlış Defteri) | rota | `YanlisDefteriPage` | `src/yanlis-defteri.jsx` |
| assignments (Ödevlerim) | rota | `AssignmentsPage` | `src/student-extra.jsx` |
| messages (Mesajlar) | rota | `MessagesPage` | `src/messaging.jsx` |
| appointments (Randevular) | rota | `StudentAppointmentsPage` | `src/appointments-ui.jsx` |
| tests (Testlerim) | rota | `StudentTestsPage` | `src/tests-ui.jsx` |
| ai-coach (AI Koç) | rota | `AiCoachPage` | `src/student-extra.jsx` |
| motivation (Motivasyon) | rota | `MotivationPage` | `src/student-extra.jsx` |
| billing (Abonelik) | rota | `BillingPage` | `src/billing.jsx` |
| **support (Destek)** | rota (GENEL) | `SupportPage({role})` | `src/support.jsx` |
| **settings (Ayarlar)** | rota (GENEL) | `SettingsPage` | `src/settings.jsx` |
| **notifications** | ⚠️ PANEL (rota değil) | topbar zil → `NotificationsPanel` | `src/notifications.jsx` |
| **profile** | ⚠️ kullanıcı menüsü/sayfa | `ProfilePage` | `src/auth.jsx` |

## KOÇ (role = coach)
| İstenen | Tür | Bileşen | Dosya |
|---|---|---|---|
| dashboard | rota | `CoachDashboard` | `src/coach.jsx` |
| students (Öğrencilerim) | rota | `CoachStudentsPage` | `src/coach.jsx` |
| c-topics (Konu Takibi) | rota | `CoachKonuPage` | `src/coach-konu.jsx` |
| c-cizelge (Yıllık Çizelge) | rota | `CoachKonuCizelgePage` | `konu-cizelge/coach-cizelge-page.jsx` |
| c-assignments (Ödev & Görev) | rota | `CoachAssignmentsPage` | `src/coach-pages.jsx` |
| c-exams (Denemeler) | rota | `CoachExamsPage` | `src/coach-pages2.jsx` |
| c-online (Online Denemeler) | rota | `CoachOnlineExams` | `src/online-deneme.jsx` |
| messages (Mesajlar) | rota | `MessagesPage` | `src/messaging.jsx` |
| appointments (Randevular) | rota | `CoachAppointmentsPage` | `src/appointments-ui.jsx` |
| tests (Envanter & Testler) | rota | `CoachTestsPage` | `src/tests-ui.jsx` |
| reports (Raporlar) | rota | `CoachReportsPage` | `src/coach-pages.jsx` |
| revenue (Gelir & Tahsilat) | rota | `CoachRevenueGate` → gelir paneli | `src/online-deneme.jsx` + `src/billing-branch.jsx` |
| support / settings | rota (GENEL) | `SupportPage` / `SettingsPage` | `src/support.jsx` / `src/settings.jsx` |
| **profile / notifications** | ⚠️ menü/panel | `ProfilePage` / `NotificationsPanel` | `src/auth.jsx` / `src/notifications.jsx` |
| **feedback (Geri bildirim)** | ⚠️ MODAL | `CoachNoteModal` (koç notu) + Destek geri bildirim formu | `src/coach-pages.jsx` / `src/support.jsx` |
| **invoices (Faturalar)** | ⚠️ ALT-SEKME | Gelir & Tahsilat içinde fatura/tahsilat listesi | `src/billing-branch.jsx` |
| **license (Lisans)** | ⚠️ ALT-SEKME/SAYFA | koç lisans/abonelik | `admin/coach-license.jsx` (admin) · koç tarafı `src/settings.jsx` lisans sekmesi |

> NOT: `feedback`, `invoices`, `license` koç **sidebar'ında ayrı rota değildir.** Var olan
> yerleri yukarıdadır; ayrı sayfa olarak tasarlama. (License'ın asıl yeri Yönetim Paneli'dir.)

## VELİ (role = parent)
| İstenen | Tür | Bileşen | Dosya |
|---|---|---|---|
| dashboard (Genel Bakış) | rota | `VeliDashboard` | `src/parent.jsx` |
| p-exams (Deneme Sonuçları) | rota | `VeliDenemelerPage` | `src/parent.jsx` |
| p-reports (Gelişim Raporları) | rota | `ParentReportsPage` | `src/reports.jsx` |
| messages | rota | `MessagesPage` | `src/messaging.jsx` |
| appointments | rota | `StudentAppointmentsPage` (paylaşılan) | `src/appointments-ui.jsx` |
| billing (Abonelik) | rota | `BillingPage` | `src/billing.jsx` |
| support / settings | rota (GENEL) | `SupportPage` / `SettingsPage` | `src/support.jsx` / `src/settings.jsx` |
| **profile / notifications** | ⚠️ menü/panel | `ProfilePage` / `NotificationsPanel` | `src/auth.jsx` / `src/notifications.jsx` |

## MODALLER (açık-hal PNG kapsamı — hepsi mevcut)
| Modal | Bileşen | Dosya | Tetikleyici |
|---|---|---|---|
| Ödev Ata | `OdevAtaModal` | `src/coach-odev-ata.jsx` | Koç → Ödev & Görev / Konu Takibi "Ödev ata" |
| Akıllı Ödev | `SmartOdevModal` | `src/coach-smart-odev.jsx` | Koç → Ödev & Görev "Akıllı Ödev" |
| Yanlış ekle | `MistakeAddModal` | `src/yanlis-defteri.jsx` | Öğrenci → Yanlış Defteri "Yanlış ekle" |
| Toplu yanlış→defter | `MistakeBatchModal` | `src/yanlis-defteri.jsx` | Ödev sonucu / deneme analizi |
| Odak Tekrar | `ZeroErrorReview` | `src/yanlis-defteri.jsx` | Yanlış Defteri "Odak tekrar" |
| Koç notu | `CoachNoteModal` | `src/coach-pages.jsx` | Tamamlanan ödev / deneme detayı "Not gönder" |
| Grup oluştur | grup modali | `src/coach-pages.jsx` / `roster.jsx` | Koç → Öğrencilerim "Grup oluştur" |
| Randevu iste | randevu modali | `src/appointments-ui.jsx` | "Randevu iste/al" |
| Deneme içe aktar | `DenemeImportModal` | `src/deneme-import.jsx` | Denemeler "İçe aktar" |
| Deneme oluştur/kayıt | `DenemeKayitModal` | `src/deneme-kayit.jsx` | Denemeler "Sonuç gir" |
| Manuel deneme | `ManualExamModal` | `src/manual-exam.jsx` | Denemeler "Manuel ekle" |
| Geri bildirim | Destek formu / `CoachNoteModal` | `src/support.jsx` | Destek sayfası |
| Optik form | `OnlineExamPlayer`/optik | `src/online-deneme.jsx` | Online deneme çöz |
| Öğrenci/Çocuk ekle | `AddStudentModal` | `src/coach.jsx` / `roster.jsx` | Koç → Öğrencilerim "Öğrenci ekle" |

> Modal bileşen adlarını kodlamadan önce ilgili dosyada **doğrula** (adlandırma değişebilir);
> tetikleyiciyi prototipte açıp aç-kapa davranışını birebir izle.
