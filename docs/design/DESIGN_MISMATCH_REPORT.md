# Tasarım ↔ Kod Eşleştirme Raporu

Kaynak: `uyanikkoc.zip` → `design_handoff_uyanik_koc/`

**Güncelleme:** Tasarımı olan tüm alpha ekranlar kodlandı (in-memory mock + API + uk-design UI).

## Tamamlanan ekranlar

| Tasarım | Route | Backend |
|---------|-------|---------|
| Login | `/login` | NextAuth |
| App shell | `AppLayout` | — |
| Öğrenci Dashboard | `/student/dashboard` | mevcut API |
| Çalışma Programı | `/student/schedule` | `/api/student/schedule` |
| Konu Takibi (öğrenci) | `/student/topics` | `/api/student/topics` |
| Denemeler (öğrenci) | `/student/exams` | `/api/student/exams` |
| Ödevlerim | `/student/assignments` | `/api/student/assignments` |
| Randevular (öğrenci) | `/student/appointments` | `/api/student/appointments` |
| Testlerim | `/student/tests` | `/api/student/tests` |
| Mesajlar | `/student/messages` | `/api/student/messages` |
| Motivasyon | `/student/motivation` | `/api/student/motivation` |
| AI Koç (yakında) | `/student/ai-coach` | statik |
| Koç Dashboard | `/coach/dashboard` | mevcut API |
| Öğrencilerim | `/coach/students` | `/api/coach/students` |
| Koç Konu Takibi | `/coach/topics` | `/api/coach/students/topics`, `/api/coach/notes` |
| Ödev & Görev | `/coach/assignments/create` | `/api/coach/assignments` |
| Denemeler (koç) | `/coach/exams` | `/api/coach/exams` + `/api/coach/exams/import` (CSV) |
| Mesajlar (koç) | `/coach/messages` | `/api/coach/messages` |
| Randevular (koç) | `/coach/appointments` | `/api/coach/appointments` |
| Envanter & Testler | `/coach/tests` | `/api/coach/tests` |
| Raporlar | `/coach/reports` | `/api/coach/reports` |
| Veli Genel Bakış | `/parent/dashboard` | `/api/parent/summary` |
| Veli Deneme Sonuçları | `/parent/exams` | `/api/parent/exams` |
| Randevular (veli) | `/parent/appointments` | `/api/parent/appointments` |
| Destek | `/{role}/support` | `/api/support` |
| Ayarlar / Müfredat | `/{role}/settings` | `/api/coach/curriculum` (koç) |
| Profil | `/{role}/profile` | session |

## Kod var — tasarım yok (dokunulmadı)

| Route | Açıklama |
|-------|----------|
| `/branch/dashboard` | Şube alpha shell |
| `/admin/dashboard` | Admin alpha shell |
| `/parent/notifications` | Bildirim listesi |
| `/student/notifications` | Bildirim listesi |

## Alpha sınırları (bilinçli)

| Özellik | Durum |
|---------|--------|
| Excel (.xlsx) deneme import | CSV toplu import (tasarım akışının sadeleştirilmiş hali) |
| Koç Konu Takibi (tam modal set) | Konu özeti + notlar + okul programı görüntüleme |
| Öğrenci deneme analizi (projeksiyon) | Liste + ders tablosu + trend özeti |
| Ayarlar (öğrenci/veli) | Profil tercihleri placeholder |
| Prisma modelleri | Yeni alanlar in-memory mock; DB migration sonraki faz |

## Sidebar

Menü `uk-nav.ts` ile tasarımdaki tüm alpha route'ları gösterir; Genel bölümünde Destek ve Ayarlar; footer'da Profil linki.
