# Tasarım ↔ Kod Eşleştirme Raporu

Kaynak: `design_handoff_uyanik_koc/` (Claude design handoff)

**Son güncelleme:** Tam ekran denetimi + kritik uyumsuzlukların giderilmesi.

## Bu turda hizalanan ekranlar

| Ekran | Route | Yapılan |
|-------|-------|---------|
| Koç Denemeler | `/coach/exams` | Sınıf görünümü, stat kartlar, ders ort., sıralı tablo, modallar, trend grafiği |
| Koç Raporlar | `/coach/reports` | Veli raporları tablosu, onay akışı, sparkline, haftalık bar, risk dağılımı |
| Koç Ödev & Görev | `/coach/assignments` | Liste sayfası: hafta seg, stat kartlar, filtreler (create ayrı route) |
| Koç Dashboard | `/coach/dashboard` | Net trend sparkline sütunu, haftalık tamamlama grafiği, layout |
| Veli Denemeler | `/parent/exams` | Ders bazında net barları, puan/sıralama stat kartları |
| Veli Dashboard | `/parent/dashboard` | Tasarım layout (ödevler sol, not/randevu sağ), doğru stat satırı |
| Destek (tüm roller) | `/{role}/support` | SSS akordeon, iletişim kartları, kategori chip’leri |
| Mesajlar | `/{role}/messages` | Sohbet arama, mesaj saat damgaları |
| Motivasyon | `/student/motivation` | Hero seri, YKS geri sayım halkası, rozet grid’i |

## Ortak bileşenler (yeni)

- `UkSparkline` — dashboard / rapor trend çizgileri
- `UkBarChart` — sınıf ve haftalık grafikler
- `lib/design/support-faq.ts` — rol bazlı SSS
- `lib/design/coach-exam-sessions.ts` — deneme oturumu gruplama

## Hâlâ kısmi / bilinçli alpha sınırı

| Alan | Durum |
|------|--------|
| Excel (.xlsx) deneme import | CSV + modal (xlsx dropzone yok) |
| Koç Konu Takibi (tam) | Net gelişimi, haftalık soru hedefi, Ödev Ata modalı, topic rail tablosu — **henüz eksik** |
| Koç Randevu müsait saat ızgarası | Müsait Saatlerim sekmesi — **henüz eksik** |
| Koç Testler modal gönderim | Stat kart + inline form (tasarım modal picker değil) |
| Öğrenci Ödevlerim Kaynaklarım | **henüz eksik** |
| Öğrenci Dashboard sparkline / yaklaşan denemeler | **henüz eksik** |
| Öğrenci Denemeler manuel giriş + sparkline | Analiz sekmesi var; sonuçlar sekmesi kısmi |
| Ayarlar tab shell (Profil/Bildirim) | Koç müfredat editörü var; tab navigasyonu kısmi |
| Login sol panel istatistikleri | **henüz eksik** |
| Profil hero düzeni | Basit kart (tasarım rail layout değil) |
| Veli / öğrenci bildirim sayfası | Tasarımda yok; Metronic stil |

## Test durumu

- `pnpm test` — 33 test geçti
- `pnpm build` — ESLint + typecheck geçti

## Öncelikli kalan iş (sonraki tur)

1. Koç Konu Takibi — `coach-konu.jsx` tam set
2. Koç Randevular — Müsait Saatlerim + availability grid
3. Öğrenci Ödevlerim — Kaynaklarım + hafta seçici + stat satırı
4. Öğrenci Dashboard — exam sparkline + upcoming exams paneli
5. Login / Profil — tasarım hero ve footer linkleri
