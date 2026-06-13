# CLAUDE.md — Uyanık Koç YÖNETİM PANELİ (Claude Code için kalıcı talimatlar)

Bu paket, **çalışan bir tasarım prototipidir** (Yönetim Paneli) ve görevin onu **birebir (1:1)
gerçek koda taşımaktır**. Yeni tasarım YAPMA — tasarım/UX kararları verildi.

> Bu, öğrenci/koç/veli **web uygulamasından AYRI** bir üründür ama **tasarım sistemi ORTAKtır**
> (aynı `src/styles.css` token'ları, `tokens.json` web ile birebir, marka **#534AB7**, Plus Jakarta Sans).

## Panel 3 mod içerir (tek uygulama, topbar'dan geçiş)
- **Süper Admin** (`superadmin`) — platform/franchise yönetimi
- **Kurum Yöneticisi** (`kurum`) — kurum + şubeler (prompt'taki "şube yöneticisi" bu moddur)
- **Bireysel Koç** (`coach`) — koç lisans/abonelik self-servis
Mod state `localStorage`: `uk_admin_mode`; sayfa `uk_admin_pages` (JSON `{mod: sayfa}`); tema `uk_theme`.

## 🔴 TÜRKÇE KARAKTER KURALI
TÜM kullanıcı-yüzü metinleri **tam Türkçe** (`ç ğ ı İ ö ş ü`). ASCII'ye düşürme
(`Genel Bakış` ✓ / `Genel Bakis` ✗). UI string'lerini `admin/*.jsx`'ten **birebir kopyala**.
Dosya ADLARI ASCII'dir (araç/path kısıtı) — bu ASCII stili arayüze sızdırılmaz. Tüm dosyalar UTF-8;
her HTML `<head>`'inde `<meta charset="UTF-8">`. Türkçe "i": `toLocaleLowerCase('tr-TR')` / DB `utf8mb4_turkish_ci`.

## 🔴 SADAKAT KURALI
Bileşen sırası, grid sınıfları (`col-main`/`g-4`/`g-3`/`g-2`), StatCard ikon/tone/etiket/sıra,
bölüm başlıkları, tablo kolonları, modal akışları — prototiple **birebir**. Sapma = hata.
Ekran-bazlı kesin yerleşim: `handoff/SADAKAT-SPEC-yonetim-<ekran>.md` (+ `SADAKAT-SPEC-INDEX.md`).
Ekran seti `handoff/EKRANLAR.md` ile **kapalıdır** — yeni ekran ekleme.

## Tasarım sistemi = paylaşılan primitifler
- Renk/tipografi/spacing: `src/styles.css` `:root` + `[data-theme=dark]` ve `tokens.json` (yeni token üretme).
- Primitifler: `AdminSidebar`/`AdminTopbar` (admin-app.jsx), `PageHead`/`Section`/`Modal`/`Field`/
  `Meter`/`StatusBadge`/`OrgLogo`/`EmptyState`/`Avatar` (admin-ui.jsx), `StatCard`/`Badge`/`.tbl`/
  `.seg`/`.card`/`toast` (src/styles.css + ui.jsx), ikonlar `src/icons.jsx`.

## Override deseni (DİKKAT)
Bazı bileşenler önce taban dosyada (`superadmin.jsx`/`kurum.jsx`), sonra `admin-extra2/3/4.jsx`'te
**yeniden tanımlanır**; HTML'de **SON yüklenen kazanır**. `uyanik-koc-yonetim-paneli.html`'deki
yükleme sırası korunmalı. Bir bileşeni port ederken **en son tanımı** esas al (EKRANLAR.md'de dosya verilir).

## RBAC (özet — detay: `handoff/data-contracts.md`)
- **Süper Admin:** platform geneli tam yetki (kurumlar, lisanslar, modüller, gelir, planlar).
- **Kurum Yöneticisi:** yalnızca **aktif kurumunun** verisi (`getActiveOrg()`); şubeler bu modun altıdır;
  modül/lisans **paketini süper admin belirler** (kurum sadece tüketir).
- **Bireysel Koç:** yalnızca kendi lisans/fatura/paket verisi.

## Sınırlar (bkz. `handoff/RISKS_AND_GAPS.md`)
Marka **"Uyanık Koç"** sabit · **AI Koç "Yakında"** · harici **CRM'e dokunma** · **veri uydurma**
(yeni metrik/ekran/alan icat etme) — eksikse RISKS'e yaz ve sor.

## Çalıştırma
`uyanik-koc-yonetim-paneli.html` tarayıcıda aç (React/Babel CDN). Topbar mod switcher ile geç.
Veri `localStorage`'da; "Demo verilerini sıfırla" ile sıfırlanır.

## Belge sırası
1. `handoff/README.md` · 2. `handoff/EKRANLAR.md` (envanter) · 3. `handoff/SADAKAT-SPEC-INDEX.md` ·
4. `handoff/data-contracts.md` (RBAC) · 5. `handoff/RISKS_AND_GAPS.md` · 6. `VALIDATION.md` (token paritesi).
