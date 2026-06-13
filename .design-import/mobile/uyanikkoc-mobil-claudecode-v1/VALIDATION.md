# DOGRULAMA RAPORU — Mobil Uygulama

Paket: `uyanikkoc-mobil-source-v3` · Tarih: 2026-06-10
Yontem: canli prototip 3 rolde gezilerek (DOM/tikla) her ekran render + konsol
hatasi acisindan tarandi; token'lar uk-mobile.css'ten cozuldu (color-mix → flat).

## [x] Tema token sayisi = prototipte kullanilan degerler, birebir ayni
- tokens.json renk: light 25 + dark 25 anahtar; degerler uk-mobile.css'ten
  cozulmus (turetilen primary tonlari browser ile dogrulandi):
  primary-600 #47409D, -700 #38327C, -300 #9F9AD7, -soft #ECEBF7 (light) — eslesti.
- theme.ts ile tokens.json BIREBIR ayni degerler.

## [x] Marka token'i web ile tutarli
- `--primary` light #534AB7, dark #8079E6 — web (uyanikkoc-web-source-v5) ile ayni.
- Light semantik + neutral'lar web ile ayni (muted #6B6F85 dahil).
- Platform sapmasi: dark surface/border/muted (OLED) — tokens.json `$platformNotes`'ta acik.

## [x] Tum ekranlar JSX/HTML kaynaginda mevcut (liste ile eslesiyor)
Canli tarama (paket HTML'i, temiz state):
- **Ogrenci:** Login + 5 tab (Ana Sayfa, Odevler, Denemeler, Program, Profil) +
  5 sub (Konu, Kaynaklar, Randevu, Mesaj, Motivasyon) + Destek + ResultSheet —
  hepsi render, **cokme/bos ekran yok**.
- **Veli:** Login + 5 tab (Ana Sayfa, Odevler, Denemeler, Raporlar, Profil) +
  quick-access — hepsi render.
- **Koc:** Login + 5 tab (Bugun, Ogrenciler, Mesajlar, Program, Profil) +
  ogrenci detay + quick-access — hepsi render.
- Konsol: sadece Babel uyari (dev). Fatal hata yok.

## [x] Tab bar + sub navigasyon eksiksiz tanimli
- TabBar (uk-app.jsx): rol bazli 5 sekme. SubRouter: konu/kaynaklar/randevu/mesaj/
  motivasyon/destek. Veli=ParentShell, Koc=CoachShell. EKRANLAR.md'de tam hiyerarsi.

## [x] Islevsiz bos ekran / kirik buton kontrolu
- Tum tab ve sub gecisleri calisiyor; geri butonlari, sonuc girisi (D/Y/B),
  randevu slot secimi, mesaj gonder, yildiz degerlendirme, kaynak ekle calisiyor.
- Bos/aktif olmayan ekran veya olu buton BULUNMADI.

## Ekran uyumlulugu (responsive)
- En kucuk cihaz Android Kompakt (360×800) dahil tum profillerde tasma YOK;
  stat kartlari 2 sutun, tab bar sabit, safe-area dogru.
- Cihaz profilleri: iOS SE 375 → Pro Max 440, Android 360 → 432 (tokens.json).

## [x] Eski surumler "eski" isaretli, kanonik net
- VERSION.md tablosunda; kanonik = `uyanikkoc-mobil-source-v3`.

## [x] Hicbir path'te bosluk / Turkce karakter yok (ASCII)
- Tum klasor/dosya adlari ASCII; HTML adi `uyanik-koc-mobil.html`.

## Ciplak deger notu
- Tasarim sistemi tamamen token tabanli (uk-mobile.css degiskenleri).
- JSX icindeki literal renkler veridir (ders renkleri M_SUBJECT_COLORS,
  rozet/tonlar) — tasarim token'i degil, icerik. RN'de tema renk eslemesi onerilir.
