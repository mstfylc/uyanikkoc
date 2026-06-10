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

## 4. Boşlukların uygulanması (tamam — entegre, şema dahil)

Onaylanan "hepsini uygula" kararıyla 4 ekran eklendi. Admin paneli memory-store
(`@/mocks/admin`) tabanlı olduğundan veri modeli **AdminSnapshot + memory store**
katmanında genişletildi (Prisma değil — kardeş özelliklerle tutarlı).

**Veri katmanı:**
- `lib/admin/types.ts`: `StudentPackage` + `PackageCycle/PackageOwnerKind`; `OrgPlan/CoachPlan.id` genişletildi; `AdminSnapshot`'a `orgPlans/coachPlans/studentPackages`; 9 yeni `AdminMutation` (plan + paket CRUD).
- `mocks/admin.ts`: Store alanları + seed (`ORG_PLANS/COACH_PLANS` + `defaultStudentPackages`) + `mock*` CRUD + `orgPlanInUse/coachPlanInUse`.
- `server/services/admin.service.ts`: 9 mutasyon case'i.
- `lib/admin/mutation-scope.ts`: lisans türleri yalnız süper admin; paketler sahip-scoped (kurum kendi org'u, koç kendi id'si).

**Ekranlar + route'lar:**
- **Lisans Türleri** → `SuperPlans.tsx` · `/yonetim/plans` (süper admin nav).
- **Öğrenci Paketleri** → `StudentPackages.tsx` (KurumPackages/CoachPackages) · `/yonetim/packages` + `/coach/packages`.
- **SuperReports** → `SuperReports.tsx` · `/yonetim/reports` artık rol'e göre (admin→SuperReports, branch→BranchReports).

**Doğrulama:** typecheck ✓ · lint ✓ · unit 96/96 (7 yeni) ✓ · prod build derleme+tip ✓
(page-data toplama, sandbox'ta üretim env guard'ı nedeniyle koşmuyor — kodla ilgisiz).
4 ekran dev'de status 200 render edildi (görsel doğrulandı).

## Durum

- Token/CSS parite: **tamam**. 29/29 ekran hizalı (4 boşluk uygulandı).
- **Aşama 2 (yönetim paneli) tamam.** Sıradaki: Aşama 3 (mobil).
