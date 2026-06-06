# Tasarım ↔ Kod Eşleştirme Raporu

Kaynak: `design_handoff_uyanik_koc/` (Claude design handoff)

**Son güncelleme:** Alpha sonrası tur — bilinçli eksiklerin tamamı kapatıldı.

## Tam hizalanan ekranlar (alpha + post-alpha)

| Ekran | Route | Durum |
|-------|-------|-------|
| Koç Denemeler | `/coach/exams` | Sınıf görünümü, stat kartlar, modallar, CSV + **xlsx** import |
| Koç Konu Takibi | `/coach/topics` | Öğrenci strip, net gelişimi, haftalık hedef, Ödev Ata modal, topic rail, zayıf konular, bar chart, not pin/sil |
| Koç Randevular | `/coach/appointments` | Randevular + **Müsait Saatlerim** sekmesi, availability grid, ayar toggles |
| Koç Testler | `/coach/tests` | Stat kartlar, Test gönder modal, not UX |
| Koç Öğrencilerim | `/coach/students` | Öğrenci ekle modal + toast |
| Koç Raporlar | `/coach/reports` | Veli raporları, onay, sparkline, bar chart |
| Koç Ödev & Görev | `/coach/assignments` | Liste, hafta seg, stat kartlar |
| Koç Dashboard | `/coach/dashboard` | Net trend sparkline, haftalık tamamlama |
| Öğrenci Ödevlerim | `/student/assignments` | Stat satırı, hafta seçici, **Kaynaklarım** |
| Öğrenci Dashboard | `/student/dashboard` | Exam sparkline, yaklaşan denemeler paneli |
| Öğrenci Denemeler | `/student/exams` | Manuel giriş modal, sonuçlar sparkline + net breakdown |
| Öğrenci Program | `/student/schedule` | Blok ekle, haftalık bar chart |
| Öğrenci Konu Takibi | `/student/topics` | 3 durumlu ilerleme, rapor indir |
| Öğrenci Testler | `/student/tests` | Stat kartlar, tam ekran test modal |
| Öğrenci Randevular | `/student/appointments` | Müsait saat filtreli modal (gün/saat chip) |
| Öğrenci Motivasyon | `/student/motivation` | Hero seri, YKS geri sayım, rozet grid |
| Veli Denemeler / Dashboard | `/parent/*` | Önceki turda hizalandı |
| Ayarlar (tüm roller) | `/{role}/settings` | Tab shell: Müfredat / Profil / Bildirimler |
| Profil (tüm roller) | `/{role}/profile` | Hero rail layout, düzenlenebilir alanlar |
| Login | `/login` | Sol panel istatistikleri, footer linkleri |
| Bildirimler | `/{student,parent}/notifications` | uk-design panel |
| Destek / Mesajlar | `/{role}/support`, messages | Önceki turda hizalandı |

## Ortak bileşenler

- `UkSparkline`, `UkBarChart`, `UkNumStepper`
- `NotificationsPanel`, `ApptRequestModal`
- `CoachOdevAtaModal`, `TestSendModal`, `CoachAddStudentModal`
- `lib/design/coach-topic-metrics.ts`, `lib/coach/exam-xlsx-import.ts`
- `lib/design/student-resources.ts`, `lib/design/assignment-weeks.ts`

## Bilinen sınırlar (beta öncesi)

| Alan | Not |
|------|-----|
| Koç bildirim sayfası | Tasarımda yok; route eklenmedi |
| Ayarlar kaydet | Profil/bildirim toggles mock toast (backend yok) |
| xlsx import | ÖZDEBİR/ÖSYM sıralı liste formatı; isim eşleştirme roster ile |
| Öğrenci ekle | Mock roster; production DB için ayrı akış gerekir |

## Test durumu

- `pnpm test` — 33 test geçti
- `pnpm build` — ESLint + typecheck geçti
