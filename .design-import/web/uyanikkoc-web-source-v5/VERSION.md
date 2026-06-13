# VERSIYON BEYANI

**EN GUNCEL kanonik surum budur: `uyanikkoc-web-source-v5`**
(Web Uygulamasi — Ogrenci / Koc / Veli. Canli "src/" + "konu-cizelge/" calisma kopyasinin
ASCII, eksiksiz, dogrulanmis paketi.)

> v6 GUNCELLEMESI (bu pakete dahil): Yanlis Defteri + Hata Frekansi + Sifir Hata Dongusu,
> Net Kaybi Haritasi, Akilli Odev Sistemi, Takvimim (Ajanda/Hafta/Ay), canli mesajlasma + bildirim,
> koc geri bildirim notu, kocun ogrenci yanlis defterini gorup odev atamasi, odev/deneme -> defter
> besleme, veli icgoru kartlari. Ayrintilar: handoff/YENI-OZELLIKLER-v6.md (+ build rehberi).
> Yeni dosyalar: src/{mistakes-store,yanlis-defteri,net-gain-map,coach-smart-odev,student-agenda}.jsx

Bu paket onceki tum web teslimlerini **birlestirir ve gecersiz kilar**:
- v4 (tam uygulama tabani)
- Giris Ekrani Yenileme v1 -> `auth.jsx` yeni login + `styles.css` `.auth-stage`/`.auth-*`
- Mobil Uyumluluk v1 -> `app.jsx` BottomNav + `styles.css` `.bottom-nav`/`.bn-*` + bozuk
  responsive blok temizligi
- Konu Cizelge modulu (`konu-cizelge/`) + ek moduller (`konu-store.jsx`, `kaynak-tracker.jsx`)

Token'lar yalnizca `src/styles.css`'ten uretilir; `tokens.json` bununla birebir esittir
(bkz. `VALIDATION.md`). Onceki v4 token'larina gore tek fark: `--muted` light degeri
`#767A90` -> **`#6B6F85`** olarak guncellendi (bu surumde dogru deger).

## Kanonik (GUNCEL — kullan)
| Dosya | Aciklama |
|---|---|
| `uyanik-koc-dashboard.html` | Kanonik HTML (tum ekranlar, yeni login, mobil alt cubuk; ASCII ad) |
| `src/styles.css` (+ billing/kaynak-tracker/odev-ata/coach-konu .css, konu-cizelge/cizelge.css) | Tasarim sistemi |
| `src/*.jsx` + `konu-cizelge/*.jsx` | Bilesenler, store'lar, ikonlar, rol sayfalari, cizelge |
| `tokens.json` | Tek dogruluk kaynagi token dosyasi (light + dark) |

## Eski / kapsam disi kopyalar (KULLANMA — referans/arsiv)
| Konum | Durum | Not |
|---|---|---|
| `Uyanik Koc — Web Uygulamasi v4/` | ESKI | v5'in tabani; yeni login/bottom-nav/cizelge YOK |
| `indir/Uyanik Koc — Giris Ekrani Yenileme v1/` | BIRLESTIRILDI | auth+styles v5'e alindi |
| `indir/Uyanik Koc — Mobil Uyumluluk Guncellemesi v1/` | BIRLESTIRILDI | bottom-nav+responsive v5'e alindi |
| `indir/Uyanik Koc — Mobil Uyumluluk Guncellemesi v2/` | FARKLI KAPSAM | Native mobil app (web degil) |
| `Uyanik Koc — Web Guncellemeleri v2/` | ESKI | Web, v4 oncesi |
| `Uyanik Koc — Ogrenci+Veli(+Koc) Uygulamasi v1/v2/` | FARKLI KAPSAM | Mobil prototip |
| `indir/Uyanik Koc — Web Paketi v1 / (Tam) v2/` | ESKI | v1/v2 web paketleri |
| `indir/Uyanik Koc — Yonetim Paneli v3/` , `admin/` | FARKLI KAPSAM | Admin paneli (ayri urun yuzeyi) |
| `apps/`, `packages/`, `_handoff/`, `design_handoff_uyanik_koc/` | ESKI/ISKELE | Onceki token export'lari, monorepo iskelesi |
| Kok dizindeki tekil eski `*.html` (Demo Ekranlari, Mobil Uygulama, Yonetim Paneli...) | ESKI / FARKLI YUZEY | Bagimsiz eski/ayri prototipler |

> Kisaca: **web app icin tek gecerli kaynak = `uyanikkoc-web-source-v5`.**
> Mobil ve Admin ayri urun yuzeyleridir; bu teslimin kapsami disindadir.
