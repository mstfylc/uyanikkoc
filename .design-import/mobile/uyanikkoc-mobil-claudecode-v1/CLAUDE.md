# CLAUDE.md — Uyanık Koç ÖĞRENCİ MOBİL (React Native/Expo) · kalıcı talimatlar

Bu paket, öğrenci **mobil uygulamasının** tasarım kaynağıdır. Hedef: **React Native / Expo**.
İçerik bir HTML **prototiptir** (cihaz çerçevesi içinde) + **`theme.ts`** (RN token köprüsü) +
ekran-bazlı SADAKAT-SPEC'ler. Görevin: bunu RN/Expo'ya **birebir** taşımak.

> Ayrı ürün ama **tasarım sistemi ORTAK**: `tokens.json` web (v6) ile uyumlu, marka **#534AB7**,
> Plus Jakarta Sans, açık+koyu. Web/Admin ayrı pakettedir.

## ⚠️ ÖNEMLİ — v3 prototip + v6 hizalama
Bu prototipin **çalışan tabanı v3**'tür (öğrenci/veli/koç). **v6 öğrenci modüllerinin bir kısmı
prototipte HENÜZ YOK** ve eklenecektir — tam liste + tasarım yönergesi: **`handoff/V6-HIZALAMA-PLANI.md`**.
- **v3'te var:** Login · Ana Sayfa · Ödevler · Denemeler · Program · Profil + alt ekranlar
  (Konu Takibi · Kaynaklarım · Randevular · Mesajlar · Motivasyon · Destek).
- **v6'da eklenecek:** Takvimim (Ana Sayfa) · Çalışma Serisi · Yanlış Defteri (Odak Tekrar + Hata Frekansı) ·
  Net Kaybı Haritası (Denemeler) · Analiz + Online (Denemeler) · Testler · Bildirimler · Abonelik · AI Koç (Yakında).
  Bunların içerik/davranış kaynağı **web v6 spec'leridir** (`uyanikkoc-web-claudecode-v6`), native desene uyarlanır.

## 🔴 SADECE ÖĞRENCİ
Üretim uygulaması **yalnızca öğrenci**dir. Prototipte veli/koç kabukları da var (referans) ama
**port kapsamı = öğrenci**. Veli/koç ayrı ürün/pakettir.

## 🔴 TÜRKÇE KARAKTER + SADAKAT
Tüm metinler tam Türkçe (`ç ğ ı İ ö ş ü`) — ASCII'ye düşürme. Dosya adları ASCII (path kısıtı).
Yerleşim/sıra/etiket/native desen prototiple birebir; ekran spec'leri `handoff/SADAKAT-SPEC-mobil-<ekran>.md`.

## Tasarım sistemi = theme.ts (RN) — TEK KÖPRÜ
`theme.ts`: `palette.light/dark` · `typography.scale` · `spacing` · `radiusBase`+`radiusScale` ·
`iconSize` · `elevation` (iOS shadow* + Android elevation) · `devices` (cihaz profilleri).
Renk/tipografi/spacing **buradan** gelir; yeni token üretme. `tokens.json` ile birebir.

## Native desenler (zorunlu)
- **5 sekmeli alt tab bar** (Ana Sayfa · Ödevler · Denemeler · Program · Profil); diğer ekranlar
  alt ekran (stack push, üstte geri) veya tab içi.
- **Safe-area:** `react-native-safe-area-context` (`env(safe-area-inset-*)` prototip karşılığı).
- **Bottom-sheet:** web'deki modaller native'de **alt sheet** olur (ResultSheet, Yanlış ekle, Randevu iste, vb.).
- **Pull-to-refresh**, **iOS + Android** ton farkları (dark OLED — tokens.json `$platformNotes`).
- İkonlar: `M_ICONS` (uk-data.jsx) SVG path → RN'de `react-native-svg` (lucide-react-native eşdeğeri).

## Kimlik / oturum
**Native token oturumu** (NextAuth'a paralel) — bkz. `handoff/data-contracts.md`. Telefon+SMS OTP (ana) /
e-posta (alternatif). Token secure storage (Expo SecureStore); web NextAuth ile aynı backend.

## Sınırlar (bkz. `handoff/RISKS_AND_GAPS.md`)
Sadece öğrenci · tek şube · marka "Uyanık Koç" · **AI Koç "Yakında"** · veri uydurma yok.

## Çalıştırma (prototip)
`uyanik-koc-mobil.html` tarayıcıda aç (cihaz çerçevesi). Tweaks panelinden tema/cihaz/rol değiştir.

## Belge sırası
1. `handoff/README.md` · 2. `handoff/V6-HIZALAMA-PLANI.md` (v3↔v6 boşluk) · 3. `handoff/EKRANLAR-v3.md` ·
4. `handoff/SADAKAT-SPEC-INDEX.md` · 5. `handoff/data-contracts.md` · 6. `handoff/RISKS_AND_GAPS.md` ·
7. `theme.ts` + `VALIDATION.md`.
