# Uyanık Koç — Web Uygulaması · CLAUDE CODE HANDOFF (kanonik kaynak)

> Bu paket: `uyanik-koc-dashboard.html` + `src/` + `konu-cizelge/` + `tokens.json`.
> **Tek ve eksiksiz doğruluk kaynağıdır.** Aşağıdaki ekran listesi **kapalıdır** (tam set budur).
> Eski sürümler/paketler bu pakete dahil DEĞİLDİR; sadece güncel kaynak verilmiştir.

---

## ⛔ ÖNCE BUNU OKU — GELİŞTİRME TALİMATI
Bu kaynak, **gerçek koda BİREBİR taşınman (port)** için verildi. Kurallar:

1. **YENİ EKRAN, SAYFA, AKIŞ veya BİLEŞEN TASARLAMA.** Tasarım/UX kararları zaten verildi.
   Eksik/yarım gördüğün bir şey olsa bile **kendi başına icat etme** — sor.
2. **Mevcut UI'ı birebir uygula:** layout, bileşen yapısı, metinler (Türkçe), renkler,
   boşluklar, durumlar (hover/aktif/boş), modal akışları, koyu/açık tema. Kaynak = bu prototip.
3. **Tasarım sistemi = `src/styles.css` + `tokens.json`.** Renk/tipografi/spacing **buradan**;
   yeni token/renk üretme. `tokens.json`, `styles.css :root` ile birebir aynıdır (bkz. `VALIDATION.md`).
4. **Ekran seti aşağıdaki envanterle SINIRLIDIR.** Listede olmayan ekran ekleme.
5. **İş mantığı `src/*.jsx` store fonksiyonlarında izoledir** — davranışı oradan birebir taşı
   (durum geçişleri, hesaplamalar, spaced-repetition, net hesapları vb.).
6. Hedef mimari ve store→API eşlemesi: **`handoff/TEKNIK-REHBER-ve-VERI-MODELI.md` → Build Rehberi**.
   Oradaki adımları izle; mimariyi kendin değiştirme, önce öner.

---

## Çalıştırma (prototip)
1. `uyanik-koc-dashboard.html` dosyasını tarayıcıda aç (React/Babel CDN — internet gerekir).
2. Giriş ekranında rol seç → "Demo bilgileriyle doldur" → "Giriş Yap". (Ya da "Üye ol".)
   - Öğrenci `elif@uyanikkoc.com` · Koç `dilek@uyanikkoc.com` · Veli `ayse@uyanikkoc.com`
3. Tüm durum `localStorage`'da kalıcı (rol, sayfa, tema + tüm veri store'ları).

## EKRAN / ROTA ENVANTERİ  (tam set — `src/app.jsx` MENUS+ROUTES)
**Öğrenci:** dashboard (Takvimim dâhil) · schedule (Çalışma Programı) · topics (Konu Takibi) ·
exams (Denemeler + Analiz/Online) · **mistakes (Yanlış Defteri)** · assignments (Ödevlerim) ·
messages · appointments · tests (Testlerim) · ai-coach · motivation · billing · support · settings.
**Koç:** dashboard · students (Öğrencilerim) · c-topics (Konu Takibi: Net Kaybı Haritası +
Öğrencinin Yanlış Defteri + Hata Frekansı + Soru Takibi) · c-cizelge (Yıllık Çizelge) ·
c-assignments (Ödev & Görev: Akıllı Ödev + Ödev Ata) · c-exams (Denemeler) · c-online ·
messages · appointments · tests · reports · revenue · support · settings.
**Veli:** dashboard (Genel Bakış: Net Kaybı Haritası + Hata Frekansı, salt-görüntüleme) ·
p-exams (Deneme Sonuçları) · p-reports (Gelişim Raporları) · messages · appointments · billing.
**Ortak modal/akışlar:** Ödev Ata, Akıllı Ödev, Yanlış ekle, Toplu yanlış→defter, Odak Tekrar,
Grup oluştur, Randevu iste, Deneme içe aktar/oluştur, Manuel deneme, Koç notu gönder, Geri bildirim.

## Mimari (özet)
- Her `src/*.jsx` ayrı `<script type="text/babel">`; paylaşılan bileşen/fonksiyonlar
  `Object.assign(window, {...})` ile global'e yazılır (`useState` vb. `ui.jsx`'ten paylaşılır).
- **Store deseni:** modül-içi `let _state` + `localStorage` + dinleyici seti + `useXxx()` hook.
- Rol bazlı yönlendirme: `src/app.jsx` → `MENUS` + `ROUTES`. Tema: `[data-theme]` + CSS değişkenleri.
- **localStorage anahtarları:** `uk_mistakes_v1`, `uk_odevler_v1`, `uk_sources_v2`, `uk_msg_v1`,
  `uk_notif_v2`, `uk_konu`, `uk_topic_src_v2`, `uk_appointments_v1`, `uk_billing*`, `uk_theme` …

## DOSYA HARİTASI
**Giriş & sistem:** `uyanik-koc-dashboard.html` (tüm ekranların girişi), `src/styles.css`
(tam tasarım sistemi), `tokens.json` (token tek doğruluk kaynağı), `src/app.jsx` (rol yönlendirme +
shell + mobil alt çubuk), `src/auth.jsx` (giriş + üye ol), `src/ui.jsx` (paylaşılan UI primitifleri +
hook re-export), `src/icons.jsx` / `src/logo.jsx` (ikon seti + logo), `src/settings.jsx`,
`src/notifications.jsx`, `src/ui-actions.jsx` (toast/aksiyon).

**Öğrenci:** `student.jsx`, `student-data.jsx`, `student-pages.jsx` (Konu Takibi ısı haritası +
ders sekmeleri), `student-extra.jsx` (Ödevlerim — günlük plan), `student-exam-analiz.jsx`,
`odev-student.jsx`, `student-agenda.jsx` (Takvimim).

**Koç:** `coach.jsx`, `coach-data.jsx`, `coach-pages.jsx`, `coach-pages2.jsx`, `coach-konu.jsx`
(+ `coach-konu.css`), `coach-odev-ata.jsx` (+ `odev-ata.css`), `coach-smart-odev.jsx` (Akıllı Ödev),
`coach-rating.jsx`, `roster.jsx`.

**Veli:** `parent.jsx` (Net Kaybı Haritası + Hata Frekansı içgörüleri, salt-görüntüleme).

**Paylaşılan modüller:** `mistakes-store.jsx` + `yanlis-defteri.jsx` (Yanlış Defteri + Hata Frekansı +
Sıfır Hata Döngüsü), `net-gain-map.jsx` (Net Kaybı Haritası), `curriculum.jsx`, `konu-store.jsx`,
`kaynak-catalog.jsx` / `kaynak-picker.jsx` / `kaynak-tracker.jsx` (+ `kaynak-tracker.css`),
`odev-store.jsx`, `appointments.jsx` / `appointments-ui.jsx`, `tests-store.jsx` / `tests-ui.jsx`,
`manual-exam.jsx` / `deneme-import.jsx` / `deneme-kayit.jsx` / `online-deneme.jsx`,
`messaging.jsx` (canlı iletim + bildirim), `motivation-send.jsx`, `reports.jsx`,
`school-schedule.jsx`, `support.jsx`, `billing-store.jsx` / `billing.jsx` / `billing-checkout.jsx` /
`billing-branch.jsx` (+ `billing.css`).

**Yıllık Çizelge modülü:** `konu-cizelge/cizelge-data.jsx`, `cizelge-app.jsx`,
`coach-cizelge-page.jsx`, `cizelge-shell.jsx`, `icons.jsx`, `cizelge.css` / `styles.css`.

## Asset / Font
- İkonlar: SVG path olarak `src/icons.jsx` (+ `konu-cizelge/icons.jsx`). Harici ikon dosyası yok.
- Font: **Plus Jakarta Sans** — Google Fonts (HTML `<head>`).
- Görsel: CSS gradient/SVG; harici raster görsel bağımlılığı yok.

## ⚠️ Türkçe karakter notu
Dosya **adları** ASCII'dir (Türkçe karakter/boşluk içermez) — bu yalnızca araç/path kısıtıdır.
**Arayüz metinleri tam Türkçe'dir (diakritikli)** ve doğruluk kaynağı `.jsx` dosyalarıdır.
Kodlarken `ç ğ ı İ ö ş ü`'yu ASCII'ye düşürme; detay → `CLAUDE.md`.

## Handoff dosyaları (bu sürüm)
- **`handoff/README.md`** — bu belge (kanonik talimat + envanter + dosya haritası + mimari).
- **`handoff/ENVANTER-HARITASI.md`** — istenen her öğenin gerçek kaynağı (rota/modal/panel/alt-sekme).
- **`handoff/SADAKAT-SPEC-INDEX.md`** — tüm ekran-bazlı birebir yerleşim spec'lerinin indeksi
  (`SADAKAT-SPEC-<rol>-<ekran>.md`; 25+ ekran, 3 rol + ortak). Sapma kilitleme belgeleri.
- **`handoff/QA-CAPTURE-RECETESI.md`** — PNG curated set (`exports/`) + tam matris için
  boot-direct + DevTools "Capture full size screenshot" reçetesi (light/dark × desktop/mobile + modaller).
- **`handoff/TEKNIK-REHBER-ve-VERI-MODELI.md`** — modüllerin veri modeli + store API + entegrasyon
  + **gerçek koda geçiş (build) rehberi**. *(En kritik teknik belge.)*
- Kök: `CLAUDE.md` (Claude Code kalıcı talimatları) · `VALIDATION.md` (token paritesi) ·
  `manifest.txt` (dosya listesi) · `tokens.json`.
