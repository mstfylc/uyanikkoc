# SADAKAT SPEC — İNDEKS (ekran-bazlı birebir uygulama belgeleri)

Her ekran için `src/*.jsx` kaynağından doğrulanmış birebir yerleşim spec'i. **Hibrit derinlik:**
veri-yoğun ekranlar tam detay; basit ekranlar ~kısa (ama 5 zorunlu alan hep var: bileşen sırası +
grid sınıfı · StatCard ikon/tone/etiket/sıra · bölüm başlık/alt-başlık metni · tablo/satır yapısı ·
boş/yükleniyor durumları). Tüm metinler **tam Türkçe**.

## Önce oku
- `ENVANTER-HARITASI.md` — istenen her öğenin gerçek kaynağı (rota / modal / panel / alt-sekme).
  `notifications/profile/feedback/invoices/license` **ayrı rota değildir** — burada açıklanır.
- `SADAKAT-SPEC-ogrenci-dashboard.md` — referans format (hero/rozet/streak/grid sırası).

## ÖĞRENCİ
| Ekran | Dosya |
|---|---|
| dashboard | `SADAKAT-SPEC-ogrenci-dashboard.md` |
| schedule (Çalışma Programı) | `SADAKAT-SPEC-ogrenci-schedule.md` |
| topics (Konu Takibi) | `SADAKAT-SPEC-ogrenci-topics.md` |
| exams (Denemeler) | `SADAKAT-SPEC-ogrenci-exams.md` |
| mistakes (Yanlış Defteri) | `SADAKAT-SPEC-ogrenci-mistakes.md` |
| assignments (Ödevlerim) | `SADAKAT-SPEC-ogrenci-assignments.md` |
| motivation (Motivasyon) | `SADAKAT-SPEC-ogrenci-motivation.md` |
| ai-coach (AI Koç) | `SADAKAT-SPEC-ogrenci-ai-coach.md` |
| tests (Testlerim) | `SADAKAT-SPEC-ogrenci-tests.md` |

## KOÇ
| Ekran | Dosya |
|---|---|
| dashboard | `SADAKAT-SPEC-koc-dashboard.md` |
| students (Öğrencilerim) | `SADAKAT-SPEC-koc-students.md` |
| c-topics (Konu Takibi) | `SADAKAT-SPEC-koc-c-topics.md` |
| c-cizelge (Yıllık Çizelge) | `SADAKAT-SPEC-koc-c-cizelge.md` |
| c-assignments (Ödev & Görev) | `SADAKAT-SPEC-koc-c-assignments.md` |
| c-exams (Denemeler) | `SADAKAT-SPEC-koc-c-exams.md` |
| c-online (Online Denemeler) | `SADAKAT-SPEC-koc-c-online.md` |
| reports (Raporlar) | `SADAKAT-SPEC-koc-reports.md` |
| revenue (Gelir & Tahsilat) | `SADAKAT-SPEC-koc-revenue.md` |
| tests (Envanter & Testler) | `SADAKAT-SPEC-koc-tests.md` |

## VELİ
| Ekran | Dosya |
|---|---|
| dashboard (Genel Bakış) | `SADAKAT-SPEC-veli-dashboard.md` |
| p-exams (Deneme Sonuçları) | `SADAKAT-SPEC-veli-p-exams.md` |
| p-reports (Gelişim Raporları) | `SADAKAT-SPEC-veli-p-reports.md` |

## ORTAK (3 rolde aynı bileşen / GENEL menü / panel)
| Ekran | Dosya |
|---|---|
| messages (Mesajlar) | `SADAKAT-SPEC-ortak-messages.md` |
| appointments (Randevular) | `SADAKAT-SPEC-ortak-appointments.md` |
| billing (Abonelik) | `SADAKAT-SPEC-ortak-billing.md` |
| support (Destek) | `SADAKAT-SPEC-ortak-support.md` |
| settings (Ayarlar) | `SADAKAT-SPEC-ortak-settings.md` |
| profile (Profil — panel/menü) | `SADAKAT-SPEC-ortak-profile.md` |
| notifications (zil paneli + ayar) | `SADAKAT-SPEC-ortak-notifications.md` |

## feedback / invoices / license
Ayrı rota değildir — gerçek yerleri `ENVANTER-HARITASI.md`'de: feedback = `CoachNoteModal` /
Destek formu; invoices = Gelir & Tahsilat + Abonelik fatura listesi; license = Ayarlar lisans
sekmesi / Yönetim Paneli. Bu yüzden ayrı spec dosyası yoktur.

## PNG / QA
`exports/` (curated set) + `QA-CAPTURE-RECETESI.md` (tam matris için boot-direct + DevTools reçetesi).
