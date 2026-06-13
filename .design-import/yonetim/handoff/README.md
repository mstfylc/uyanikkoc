# Uyanık Koç — YÖNETİM PANELİ · CLAUDE CODE HANDOFF (kanonik kaynak)

> Bu paket: `uyanik-koc-yonetim-paneli.html` + `src/` (web ile ORTAK tasarım sistemi) + `admin/` + `tokens.json`.
> **Tek ve eksiksiz doğruluk kaynağıdır.** Eski admin sürümleri dahil DEĞİLDİR.
> Öğrenci/koç/veli web uygulaması ayrı pakettedir; **tasarım sistemi (token'lar) ORTAKtır**.

## ⛔ ÖNCE BUNU OKU
1. **Birebir port et — yeni ekran/akış tasarlama.** Ekran seti `handoff/EKRANLAR.md` ile kapalıdır.
2. **Metinler tam Türkçe** (`ç ğ ı İ ö ş ü`) — ASCII'ye düşürme. UI string'lerini `admin/*.jsx`'ten kopyala (CLAUDE.md).
3. **Tasarım sistemi = `src/styles.css` + `tokens.json`** (web ile ortak, marka `#534AB7`). Yeni token üretme.
4. **Override deseni:** bazı bileşenler `admin-extra2/3/4.jsx`'te yeniden tanımlı — **SON yüklenen kazanır**
   (HTML sırası korunmalı). Spec'lerde hangi dosyanın esas olduğu yazılıdır.
5. **RBAC + sınırlar:** `handoff/data-contracts.md` + `handoff/RISKS_AND_GAPS.md`.

## 3 MOD (topbar mod switcher · `.mode-seg`)
- **Süper Admin** (`superadmin`) — platform/franchise
- **Kurum Yöneticisi** (`kurum`) — kurum + şubeler (prompt'taki "şube yöneticisi")
- **Bireysel Koç** (`coach`) — lisans self-servis
State: `localStorage` `uk_admin_mode` · `uk_admin_pages` (JSON `{mod:sayfa}`) · `uk_theme`.

## EKRAN ENVANTERİ (özet — tam: `EKRANLAR.md`)
**Süper Admin:** genel · kurumlar (+kurum-detay) · lisanslar · koclar (+koc-detay) · gelir · raporlar ·
talepler · kampanyalar · lisans-turleri · moduller · destek · ayarlar · profile.
**Kurum Yöneticisi:** k-dashboard · k-koclar (+detay) · k-ogrenciler (+detay) · k-subeler · k-lisans ·
k-gelir · k-paketler · k-raporlar · k-yoneticiler · k-ayarlar · profile.
**Bireysel Koç:** bk-lisans · bk-feedback · bk-planlar · bk-paketler · bk-faturalar · profile.

## Çalıştırma
`uyanik-koc-yonetim-paneli.html` tarayıcıda aç (React/Babel CDN). Topbar mod switcher ile geç.
Veri `localStorage`'da; "Demo verilerini sıfırla" ile sıfırlanır.

## Handoff dosyaları
- **`README.md`** — bu belge · **`EKRANLAR.md`** — ekran envanteri (3 mod, amaç + bileşenler)
- **`SADAKAT-SPEC-INDEX.md`** — tüm ekran-bazlı birebir yerleşim spec'lerinin indeksi
- **`SADAKAT-SPEC-yonetim-<ekran>.md`** — ekran spec'leri (sapma kilitleme)
- **`data-contracts.md`** — RBAC + veri modeli (org/coach/plan/modül)
- **`RISKS_AND_GAPS.md`** — sınırlar (marka, AI Koç Yakında, CRM yok, veri uydurma yok)
- **`QA-CAPTURE-RECETESI.md`** — PNG curated set (`exports/`) + tam matris reçetesi
- Kök: `CLAUDE.md` · `VALIDATION.md` (token paritesi) · `manifest.txt` · `tokens.json`
