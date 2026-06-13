# Uyanık Koç — ÖĞRENCİ MOBİL · CLAUDE CODE HANDOFF (React Native/Expo)

> Bu paket: `uyanik-koc-mobil.html` (cihaz-çerçeveli prototip) + `mobile/` + **`theme.ts`** (RN token köprüsü) + `tokens.json`.
> Hedef: **React Native / Expo** öğrenci uygulaması. Tasarım sistemi web v6 ile ORTAK (marka #534AB7).

## ⛔ ÖNCE OKU
1. **Birebir port et.** Native desenler zorunlu (5 sekme alt tab bar, safe-area, bottom-sheet, pull-to-refresh, iOS+Android).
2. **Metinler tam Türkçe** (`ç ğ ı İ ö ş ü`).
3. **Tasarım sistemi = `theme.ts`** (palette/typography/spacing/radius/elevation/devices). Yeni token üretme.
4. **v3 → v6:** prototip tabanı v3; bazı v6 ekranları henüz yok → **`handoff/V6-HIZALAMA-PLANI.md`** (kritik).
5. **Sadece öğrenci** · tek şube · AI Koç "Yakında" · veri uydurma yok → `handoff/RISKS_AND_GAPS.md`.

## Navigasyon (öğrenci)
**Alt tab bar (5):** Ana Sayfa · Ödevler · Denemeler · Program · Profil.
**Alt ekranlar (stack push, üstte geri):** Konu Takibi · Kaynaklarım · Randevular · Mesajlar · Motivasyon · Destek.
**v6 yeni:** Yanlış Defteri · Net Kaybı Haritası (Denemeler içi) · Takvimim (Ana Sayfa içi) · Testler ·
Bildirimler · Abonelik · Ayarlar · AI Koç (Yakında) — bkz. V6-HIZALAMA-PLANI.

## Kimlik
Native token oturumu (NextAuth'a paralel) — telefon+SMS OTP / e-posta; Expo SecureStore. (`data-contracts.md`)

## Çalıştırma (prototip)
`uyanik-koc-mobil.html` tarayıcıda aç → cihaz çerçevesi. Tweaks panelinden tema/cihaz/rol (Öğrenci) seç.

## Handoff dosyaları
- `README.md` (bu) · `V6-HIZALAMA-PLANI.md` (v3↔v6 boşluk + native uyarlama) · `EKRANLAR-v3.md` (mevcut envanter) ·
  `SADAKAT-SPEC-INDEX.md` + `SADAKAT-SPEC-mobil-<ekran>.md` · `data-contracts.md` · `RISKS_AND_GAPS.md`
- Kök: `CLAUDE.md` · `theme.ts` · `tokens.json` · `VALIDATION.md` · `manifest.txt`
- `exports/mobil/<platform>-<tema>/<route>.png` — referans kareler (v3'te var olan ekranlar).
