# Design Apply — uyanikkoc-admin-source-v4 (Aşama 2: Yönetim Paneli)

**Kaynak:** `uyanikkoc-admin-source-v4` (kanonik). Tasarım sistemi web ile ORTAK;
`tokens.json` web ile birebir aynı. Panel 3 mod: Süper Admin, Kurum Yöneticisi, Bireysel Koç.
**Tarih:** 2026-06-10 · **Branch:** `claude/youthful-turing-r4dx7y`

## 1. Token + CSS (uygulandı — commit `e22c03d`)

- **admin `tokens.json` == web `uk-tokens.json` (birebir).** Aşama 1 token foundation (uk-design.css üretimi) paneli de kapsıyor.
- `uk-admin.css` token temizliği: `.lic-hero.warn/.danger/.info` çıplak hex → `var(--warning/danger/info)` + `color-mix` (v4 kaynak temizliği); modal-overlay scrim `#0b1020` → `#0B0E18`.
- Toast ikon renkleri (`#34d399/#fbbf24/#f87171`) KASITLI bırakıldı — koyu hap üzerinde kontrast; tokenlenirse light modda okunmaz.

## 2. Yapısal denetim (3 mod, 29 ekran)

Yöntem: 2 paralel inceleme; her ekran canlı `components/admin/*` + `app/yonetim|coach/*` ile eşlendi.

### Süper Admin (14) — 12 VAR, 2 boşluk
VAR: Genel Bakış, Kurumlar&Franchise, Kurum Detayı, Lisans Takibi, Bireysel Koçlar, Koç Profili,
Gelir&Faturalama, Demo&Üyelikler, Kampanyalar, Modül Bayrakları, Destek&Sistem, Ayarlar.
- ⚠️ **Raporlar**: `/yonetim/reports` süper admin için de `BranchReports` (kurum raporu) render ediyor; süper-admin'e özel `SuperReports` (büyüme / lisans sağlığı / gelir trendi — kaynak `sa-reports.jsx`) **yok**.
- ⚠️ **Lisans Türleri**: ayrı ekran/route yok; plan kartları yalnız `SuperOrgDetail` içinde gömülü. Kaynak `plans-packages.jsx > SAPlans` (kurum/koç plan CRUD).

### Kurum Yöneticisi (12) — 11 VAR, 1 boşluk
VAR: Dashboard, Koçlar, Koç Detayı, Öğrenciler, Öğrenci Detayı, Şubeler, Lisans&Kapasite,
Gelir&Tahsilat, Raporlar, Yöneticiler, Ayarlar.
- ⚠️ **Öğrenci Paketleri** (`k-paketler`, kaynak `plans-packages.jsx > KurumPackages`): **yok**.

### Bireysel Koç (5) — 4 VAR, 1 boşluk (+1 kabul edilebilir kısmi)
VAR: Lisansım, Geri Bildirimlerim, Faturalar.
- ✓ **Planlar & Yükselt**: ayrı route yok ama `CoachLicensePanel` içinde sekme olarak tam işlevsel (plan kartları + checkout) — **kabul edilebilir**.
- ⚠️ **Öğrenci Paketleri** (`bk-paketler`, kaynak `plans-packages.jsx > CoachPackages`): **yok**.

## 3. Gerçek boşluklar ve backend etkisi

Canlı admin **API+snapshot backed** (`/api/admin/snapshot` + `/api/admin/mutate`, `AdminStore`).
Mevcut planlar SABİT enum (`OrgPlanId`, `CoachPlanId`, `StudentPlanId` — `lib/admin/types.ts`).

| Gap | Backend | Efor / Risk |
|-----|---------|-------------|
| SuperReports | Mevcut snapshot'tan hesap (`lib/admin/reports.ts` var) | Orta / düşük |
| Lisans Türleri (SAPlans CRUD) | Plan enum → düzenlenebilir entity + snapshot/mutate | Yüksek / şema |
| Öğrenci Paketleri (Kurum) | Yeni entity + CRUD | Yüksek / şema |
| Öğrenci Paketleri (Koç) | Yeni entity + CRUD | Yüksek / şema |

## Durum

- Token/CSS parite: **tamam** (drift'in kök nedeni — kapandı).
- 25/29 ekran yapısal olarak hizalı.
- 4 boşluk = tasarımın `plans-packages.jsx` + `sa-reports.jsx` yüzeyleri. 3'ü düzenlenebilir
  veri-modeli (şema) gerektiriyor → uygulama scope'u kullanıcı onayına bırakıldı.
