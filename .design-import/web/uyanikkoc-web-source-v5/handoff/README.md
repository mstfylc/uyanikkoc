# Uyanık Koç — Web Uygulaması · KANONİK KAYNAK (v6 durumu)

> Bu paket: `uyanik-koc-dashboard.html` + `src/` + `konu-cizelge/` + `tokens.json`.
> **Tek ve eksiksiz doğruluk kaynağıdır.** Aşağıdaki ekran listesi **kapalıdır** (tam set budur).

---

## ⛔ GELİŞTİRİCİ / CODEX TALİMATI — ÖNCE BUNU OKU
Bu kaynağı **gerçek koda BİREBİR taşıman (port)** için verildi. Kurallar:

1. **YENİ EKRAN, SAYFA, AKIŞ veya BİLEŞEN TASARLAMA.** Tasarım/UX kararları zaten verildi.
   Eksik/yarım gördüğün bir şey olsa bile **kendi başına icat etme** — sor.
2. **Mevcut UI'ı birebir uygula:** layout, bileşen yapısı, metinler (Türkçe), renkler,
   boşluklar, durumlar (hover/aktif/boş), modal akışları, koyu/açık tema. Kaynak = bu prototip.
3. **Tasarım sistemi = `src/styles.css` + `tokens.json`.** Renk/tipografi/spacing **buradan**;
   yeni token/renk üretme. `tokens.json`, `styles.css :root` ile birebir aynıdır (bkz. `VALIDATION.md`).
4. **Ekran seti aşağıdaki envanterle SINIRLIDIR.** Listede olmayan ekran ekleme.
5. **İş mantığı `src/*.jsx` store fonksiyonlarında izoledir** — davranışı oradan birebir taşı
   (durum geçişleri, hesaplamalar, spaced-repetition, net hesapları vb.).
6. Hedef mimari ve store→API eşlemesi: **`handoff/YENI-OZELLIKLER-v6.md` → Build Rehberi**.
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

## Handoff dosyaları (bu sürüm)
- **`handoff/README.md`** — bu belge (kanonik talimat + ekran envanteri + mimari).
- **`handoff/YENI-OZELLIKLER-v6.md`** — yeni modüllerin veri modeli + store API + entegrasyon
  + **gerçek koda geçiş (build) rehberi**. *(Codex için en kritik teknik belge.)*
- **`handoff/DEGISIKLIKLER.md`** — önceki sürüm değişiklik geçmişi (referans).
- Kök: `VERSION.md` (sürüm beyanı) · `VALIDATION.md` (token paritesi) · `manifest.txt` (dosya listesi) · `tokens.json`.
