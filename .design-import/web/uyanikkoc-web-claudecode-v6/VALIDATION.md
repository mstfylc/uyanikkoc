# DOGRULAMA RAPORU (otomatik)

Paket: `uyanikkoc-web-source-v5` · Tarih: 2026-06-10
Yontem: `src/styles.css` `:root` / `[data-theme=dark]` parse edilip `tokens.json`
PROGRAMATIK olarak ayni dosyadan uretildi ve geri-karsilastirildi.

## [x] styles.css :root deger sayisi = tokens.json token sayisi, degerler ayni
- CSS `:root` token sayisi: **38**
- `tokens.json` (light) token sayisi: **38**
- Eksik: yok · Fazla: yok · Deger uyumsuzlugu: **yok**

Dokum (38): renk 28 · golge 4 · yaricap 4 · yerlesim 2 · font 1.

## [x] light + dark icin tum semantik token'lar tam
- CSS `[data-theme=dark]` override sayisi: **31** · `tokens.json` dark: 31/31 esit, uyumsuzluk **yok**.
- Dark'ta yeniden tanimlanmayan 7 token (yaricap*4, yerlesim*2, font*1) moddan
  bagimsizdir; `:root`'tan miras alinir (beklenen davranis).
- `--muted`: light `#6B6F85`, dark `#969BB4` (bu surumun guncel degerleri).

## [x] Canonical HTML tum ekranlari iceriyor (ogrenci / koc / veli)
- `uyanik-koc-dashboard.html` 48 betik + 6 stil dosyasi yukler.
- Ogrenci: student*.jsx, odev-student, student-exam-analiz
- Koc: coach*.jsx, roster, coach-konu, coach-odev-ata
- Veli: parent.jsx
- Yeni login (`auth.jsx` `.auth-stage`) + mobil alt cubuk (`app.jsx` BottomNav) dahil.
- Ek moduller: konu-cizelge (yillik cizelge), konu-store, kaynak-tracker.

## [x] Eski surumler "eski/birlestirildi" olarak isaretli, kanonik net
- `VERSION.md` tablosunda; kanonik = `uyanikkoc-web-source-v5`.
- Giris Ekrani Yenileme v1 ve Mobil Uyumluluk v1 -> "BIRLESTIRILDI" (v5'e dahil).

## [x] Hicbir path'te bosluk / Turkce karakter yok (ASCII)
- Tum klasor/dosya adlari ASCII; HTML adi `uyanik-koc-dashboard.html`.

## Acik not — z-index token'lari (durust beyan)
- `styles.css` icinde z-index token DEGIL; literal: topbar 20, sidebar 30, user-pop 50,
  modal-overlay 100, toast 120, sidebar(mobil) 200/210, billing toast-host 9999.
- `tokens.json > zindex` altinda mevcut olcek belgelendi; tokenlestirme onerilir.
  "Yaklasik" deger verilmedi; gercek literal'ler listelendi.

## Surum dogrulama notu
- v4 paketi (onceki teslim) ESKI idi: yeni login, bottom-nav ve konu-cizelge icermiyordu;
  `--muted` eski degerdeydi. Bu v5 paketi canli `src/` + `konu-cizelge/` kopyasindan
  yeniden uretildi ve tum yukaridaki kontrollerden gecti.
