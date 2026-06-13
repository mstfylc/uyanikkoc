# EKRAN LISTESI & NAVIGASYON — Uyanik Koc Mobil

Kaynak: `mobile/uk-app.jsx` (router + TabBar + SubRouter) + `uk-screens*.jsx`,
`uk-parent.jsx`, `uk-coach*.jsx`, `uk-v4.jsx`. **3 rol**: Ogrenci · Veli · Koc
(prototipte Tweaks > "Gorunum" ile secilir; uretimde kullanici rolune gore).

Cihaz cercevesi (iOS/Android) prototip icindir; uretimde RN ekran. Safe-area
`--safe-top/--safe-bottom` (uretimde `env(safe-area-inset-*)`).

---

## GIRIS (tum roller ortak) — `LoginScreen` (uk-screens.jsx)
Telefon + SMS (ana) / E-posta (alternatif) / Kayit / Sifremi unuttum.
- `enter`: telefon no + "SMS Kodu Gonder" (no gecerli olunca aktif) / "E-posta ile giris"
- `otp`: tek-kutu kod girisi → giris
- `register` / `forgot`: kayit ve sifre sifirlama adimlari
- "Beni hatirla", "Kurumundan davet iste"

---

## ROL 1 — OGRENCI  (varsayilan)
### Alt tab bar (5) — `TabBar` (uk-app.jsx)
| key | Etiket | Bilesen (dosya) | Amac / ana bilesenler |
|-----|--------|-----------------|------------------------|
| `home` | Ana Sayfa | HomeScreen (uk-screens.jsx) | Selam + seri (streak), "Bugun N odevin var" hero, net/sure stat kartlari, bugunun odevleri, hizli erisim (sub ekranlar) |
| `odevler` | Odevler | OdevlerScreen (uk-screens.jsx) | Haftalik secici, odev listesi, "Sonuc Gir" → ResultSheet (D/Y/B → net) |
| `denemeler` | Denemeler | DenemelerScreen (uk-screens2.jsx) | Deneme gecmisi, net trendi grafigi, detay, "Deneme kaydet" |
| `program` | Program | ProgramScreen (uk-screens2.jsx) | Gunluk ders programi blok gorunumu, gun secici |
| `profil` | Profil | ProfilScreen (uk-screens2.jsx) | Avatar (duzenlenebilir + secici), bildirim/tema switch, basarimlar, sub ekran kisayollari, cikis |

### Alt ekranlar (sub) — `SubRouter` (uk-app.jsx) · header + geri (chevronLeft)
Home hizli erisim / Profil'den acilir; tab bar gizlenir, ust solda geri.
| sub | Etiket | Bilesen (dosya) | Amac |
|-----|--------|-----------------|------|
| `konu` | Konu Takibi | KonuScreen (uk-screens3.jsx) | Ders sekmeleri, konu ilerleme listesi (tamamlandi/%..) |
| `kaynaklar` | Kaynaklarim (Kaynak Takibim) | KaynaklarimScreen (uk-screens3.jsx) | Kitap/kaynak takibi: aktif/bitti/beklemede + %, "Ekle" |
| `randevu` | Randevular | RandevularScreen (uk-screens3.jsx) | Yaklasan randevular + yeni randevu (Yuz yuze/Online/Telefon, slot) |
| `mesaj` | Mesajlar | MesajScreen (uk-screens3.jsx) | Koc ile sohbet (baloncuk + giris) |
| `motivasyon` | Motivasyon | MotivasyonScreen (uk-screens3.jsx) | Kocun motivasyon notu + koc degerlendirme (5 yildiz) |
| `destek` | Destek | DestekScreen (uk-v4.jsx) | SSS + destek talebi (role gore) |
- ResultSheet (uk-screens.jsx): odev sonucu D/Y/B → net, bottom sheet.

## ROL 2 — VELI  — `ParentShell` (uk-parent.jsx, veri: uk-data-parent.jsx)
### Alt tab bar (5)
| Etiket | Amac / ana bilesenler |
|--------|------------------------|
| Ana Sayfa | Selam, cocuk secici (coklu cocuk), "bu hafta %.. tamamladi" hero, stat kartlari, hizli erisim (Raporlar / Koca Mesaj / Randevu / Odeme / Odevler / Denemeler), bugunun odevleri |
| Odevler | Cocugun odev durumlari (salt-okunur izleme) |
| Denemeler | Cocugun deneme gecmisi + net trendi |
| Raporlar | Haftalik/donemlik gelisim raporlari, ders bazli ilerleme |
| Profil | Veli profili, cocuk yonetimi, bildirim/tema, cikis |
- Quick-access ekranlari: Koca Mesaj (mesajlasma), Randevu, Odeme (fatura/odeme).

## ROL 3 — KOC  — `CoachShell` (uk-coach.jsx..uk-coach5.jsx, veri: uk-data-coach.jsx)
### Alt tab bar (5)
| Etiket | Amac / ana bilesenler |
|--------|------------------------|
| Bugun | Selam, "Bugun N randevun var" hero, aktif ogrenci / risk altinda / ort. tamamlama / randevu stat kartlari, hizli erisim (Duyuru / Gorevler / Deneme ata), bugunun randevulari |
| Ogrenciler | Ogrenci listesi → ogrenci detay (rapor, odev, deneme, mesaj, randevu) |
| Mesajlar | Ogrenci/veli sohbet listesi + sohbet |
| Program | Kocun gunluk programi / randevu takvimi |
| Profil | Koc profili, ayarlar, cikis |
- Derin akislar: ogrenci detay, deneme atama, odev atama, duyuru, gorevler (uk-coach2..5.jsx).

---

## IKON SETI
- Kaynak: `mobile/uk-data.jsx` → `M_ICONS` (Lucide tarzi cizgi ikon, 24×24 viewBox,
  stroke 2). Render: `<MIcon name size stroke fill />`.
- Adlar: home, clipboard, chart, calendar, user, bell, flame, book, notebook, ai,
  target, check, checkCircle, clock, chevronRight, chevronLeft, chevronDown,
  arrowUp, arrowDown, trend, plus, award, star, bolt, phone, mail, message,
  settings, moon, shield, logout, help, play, edit, cap, send, heart, users,
  card, refresh.
- Harici ikon kutuphanesi YOK; tum ikonlar SVG path olarak gomulu. RN'de
  react-native-svg ile ayni path'ler kullanilabilir (lucide-react-native esdeger).

## NAVIGASYON OZETI
- Kok: `Root` → cihaz cercevesi + `MobileApp`. Auth yoksa `LoginScreen`.
- Auth sonrasi rol kabuklari: Ogrenci (tab + sub), Veli (`ParentShell`), Koc (`CoachShell`).
- Ogrenci: 5 tab + 6 sub (SubRouter); sub'larda tab bar gizli, ust geri butonu.
- Veli/Koc: 5'er tab + quick-access + detay ekranlari.
- Durum: React state (prototip). Tema (light/dark) + aksan + font + radius + cihaz
  Tweaks'ten (uretimde kullanici tercihi / cihaz API).

## CIHAZ HEDEFI
- Hedef: iPhone 16 Pro (402×874). Desteklenen: iOS SE 375 → Pro Max 440,
  Android Kompakt 360 → Buyuk 432 (bkz. tokens.json > device.profiles).
- Safe-area uretim: `--safe-top: max(env(safe-area-inset-top),20px)`,
  `--safe-bottom: max(env(safe-area-inset-bottom),12px)`; viewport `viewport-fit=cover`.
