# Design Apply — uyanikkoc-web-source-v5 (Aşama 1: Web)

**Kaynak:** `uyanikkoc-web-source-v5` (kanonik; `tokens.json` = `src/styles.css`, doğrulanmış).
**Tarih:** 2026-06-10 · **Branch:** `claude/youthful-turing-r4dx7y`

## Özet

Aşama 1 hedefi: v5 web tasarımını canlıya (`apps/web`) uygulamak ve tasarım↔canlı
drift'ini kapatmak. **Yapısal denetim, canlı app'in v5 ile zaten hizalı olduğunu
gösterdi**; tek gerçek drift TOKEN değerleriydi ve kapatıldı.

## 1. Token tek doğruluk kaynağı (uygulandı — commit `7740b5b`)

- `apps/web/styles/uk-tokens.json` ← v5 `tokens.json` (canonical, light+dark).
- `apps/web/styles/uk-design.css` `:root`+dark blokları artık `scripts/gen-tokens-css.mjs`
  ile bu dosyadan **üretilir** (`@tokens:start/@tokens:end`). Elle düzenlenmez.
- `prebuild` → `gen-tokens-css.mjs --check` (sapma build'i kırar). `tokens:gen` / `tokens:check` script'leri.
- Kapatılan drift: light `--muted` (#767A90→#6B6F85) + dark surface/border/text-2/muted/faint
  (8 değer — v5 "karanlık mod kontrastı ayrıştırma"). **Parite: 69 token, 0 fark.**
- Gözle doğrulandı (dark mode render), kalite kapısı yeşil (typecheck/lint/prebuild).

## 2. Yapısal denetim — v5 DEGISIKLIKLER (24 madde) vs canlı

Yöntem: 3 paralel inceleme; her madde için canlı kodda `dosya:satır` kanıtı.

### Öğrenci — 8/8 VAR
| Madde | Kanıt |
|---|---|
| Yeni login (cam preview kartları + stat) | `components/auth/LoginForm.tsx:142-214` |
| Üye ol akışı (role→info→plan→verify→done) | `components/auth/SignUpFlow.tsx:10-184` |
| Program: Başla→Devam→Bitir (3 durum) | `components/student/StudentSchedulePanel.tsx:263-275` |
| Blok ekle (kaynak + soru/doğru/yanlış, net otomatik) | `StudentSchedulePanel.tsx:384-514` |
| Ders listesi YKS/LGS (`studentSinav`) | `lib/design/student-exam.ts:27-80` |
| Konu Takibi: sınav türü filtre + kaynak "bitirdim" | `components/student/StudentTopicPanel.tsx:64-405` |
| Motivasyon: 12 rozet (madalya, renk+ikon) | `components/student/MotivationPanel.tsx:12-374` |
| Profil hazır ikonlar (roket/kupa/…) | `lib/design/profile-icons.ts:7-20` |

### Koç — 8/8 VAR
| Madde | Kanıt |
|---|---|
| Konu Takibi: çoklu kaynak + chip filtre | `components/coach/CoachTopicsPanel.tsx:66,188-196,735-752` |
| Soru Takibi grafiği (gün/hafta/ay + offset, gradient) | `CoachTopicsPanel.tsx:68-69,625-651` · `lib/design/coach-topic-metrics.ts:183-237` |
| Deneme Oluştur + kayıt sayısı + ödeme/katılım | `components/coach/CoachDenemeManager.tsx:64-177` |
| Ödev: "Soru"/"Test" birimi | `components/coach/CoachOdevAtaModal.tsx:44,242-253` |
| Öğrenci satırı → detay sayfası | `CoachStudentsTable.tsx:140-147` · `app/coach/students/[id]/page.tsx` |
| Kolon başlığıyla sıralama | `CoachStudentsTable.tsx:36-64,95-120` |
| Raporlar: en çok gelişen / ilgi gerektiren + filtre | `components/coach/CoachReportsPanel.tsx:147-216` |
| Yıllık konu-çizelge | `components/coach/KonuCizelge.tsx` · `app/coach/topics/annual/page.tsx` |

### Paylaşılan / Veli — 7 VAR + 1 KISMİ
| Madde | Sonuç | Kanıt / Not |
|---|---|---|
| Ayarlar 5-6 sekme (Müfredat/Hesap/Görünüm/Bildirim/Gizlilik/Abonelik) | VAR | `components/shared/SettingsPanel.tsx:74-89` |
| Destek/SSS arama + kategori + rol setleri | VAR | `components/shared/SupportPanel.tsx:34-177` · `lib/design/support-faq.ts` |
| Veli deneme sonuçları + gelişim raporları (demo) | VAR | `components/parent/ParentExamsPanel.tsx` · `ParentReportsPanel.tsx` |
| Üyelik 2 plan (Yüz Yüze / Kargo) + online optik | VAR | `lib/design/deneme-plans.ts:15-46` · `components/student/OptikFormModal.tsx` · `DenemeUyelikSection.tsx` |
| Mobil bottom-nav (≤880px) | VAR | `components/layout/Sidebar.tsx:66-227` · `uk-design.css:1248-1300` |
| Ayarlar>Görünüm tema seçimi (`data-theme`) | VAR | `SettingsPanel.tsx:22-34,337-357` |
| Responsive (tablo yatay scroll, grid tek kolon) | VAR | `uk-design.css:108-123,796-813` |
| Profil tercih toggle'ları | KISMİ | Bildirim/tema toggle'ları ProfilePanel'de değil, Ayarlar sekmelerinde; ProfilePanel oraya yönlendirir. Tasarıma uygun yerleşim — gerçek boşluk değil. |

## Sonuç

- Web ekran/özellik yapısı v5 ile hizalı (24/24 işlevsel olarak mevcut).
- Tek gerçek drift = token değerleri → düzeltildi + tekrarı önleyen pipeline kuruldu.
- **Aşama 1 (web) tamam.** Sıradaki: Aşama 2 (yönetim paneli).
