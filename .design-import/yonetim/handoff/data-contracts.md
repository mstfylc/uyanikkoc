# DATA CONTRACTS — Yönetim Paneli (RBAC + veri modeli)

Kaynak: `admin/admin-data.jsx` (tohum veri + yardımcılar). Gerçek koda geçişte bu sözleşme
backend API + RBAC katmanına eşlenir. Tüm para ₺ (`TRY`, tr-TR); tarih `tr-TR` locale.

## 1) Roller / Mod → Yetki (RBAC)
| Mod | Kapsam | Görür / Yönetir | GÖREMEZ |
|---|---|---|---|
| **Süper Admin** (`superadmin`) | Platform geneli | Tüm kurumlar+franchise, bireysel koçlar, lisans takibi, **modül bayrakları**, lisans türleri (planlar), platform geliri (MRR/ARR), demo/lead'ler, kampanyalar, raporlar, destek+sistem, platform ayarları | — (tam yetki) |
| **Kurum Yöneticisi** (`kurum`) | **Yalnızca aktif kurum** (`getActiveOrg()`) | Kendi koçları, öğrencileri, **şubeleri**, lisans & kapasite (tüketim), kurum geliri & tahsilat, öğrenci paketleri, kurum raporları, çoklu **yönetici** yönetimi, kurum ayarları (marka rengi) | Diğer kurumların verisi · modül **paketini değiştiremez** (süper admin belirler) · platform geliri · lisans türü tanımlama |
| **Bireysel Koç** (`coach`) | **Yalnızca kendi lisansı** (`getMyCoach()`) | Lisansım (kapasite/yenileme), geri bildirimlerim, planlar & yükselt (checkout), öğrenci paketlerim, faturalarım | Kurum/platform verisi · başka koç · modül bayrakları |

> **Kritik kural:** Modül erişimi (feature flags) **yukarıdan aşağıya** akar:
> Süper Admin plana/kuruma modül atar → Kurum o modülleri **tüketir** (açamaz) → Koç plan modülünü tüketir.
> Kurum yöneticisi kendi modül/lisans paketini **yükseltemez**, yalnızca süper admine talep eder.

## 2) Modül kataloğu (feature flags) — `MODULES`
`denemeAnaliz` (Deneme Analizi) · `raporlar` (Raporlar) · `mesajlasma` · `randevu` · `veliPaneli` ·
`onlineDeneme` · `aiKoc` (**AI Koç — "Yakında", bkz. RISKS**) · `envanter` (premium).
Plan → modül eşlemesi `modulesFromPlan(planModules)` ile org/coach `modules` objesine yazılır.

## 3) Kurum (org) — B2B varlık
```
{ id, name, city, type:'franchise'|'kurum',
  planId:'baslangic'|'pro'|'franchise', status:'active'|'expiring'|'trial'|'overdue',
  cycle:'monthly'|'annual', startedAt, renewsAt, feeMonthly,
  seats:{used,total}, coaches:{used,total},
  modules:{<modülKey>:bool}, owner:{name,email,phone},
  managers:[{id,name,email,role:'owner'|'manager',addedAt,status}],
  branches:[{...}], tone }
```
- **status renkleri:** active=success, expiring=warning, trial=info, overdue=danger.
- `daysLeft(renewsAt)` → yenilemeye kalan gün; ≤ eşik ise lisans uyarı şeridi.

## 4) Kurum lisans planları (B2B) — `ORG_PLANS`
| plan | aylık (₺) | seats | coaches | branches | modüller |
|---|---|---|---|---|---|
| Kurum Başlangıç | 4.900 | 50 | 5 | 1 | denemeAnaliz, raporlar, mesajlasma, randevu |
| Kurum Pro (popüler) | 11.900 | 150 | 12 | 1 | + veliPaneli, onlineDeneme |
| Franchise | 24.900 | 400 | 40 | 8 | + aiKoc, envanter |

## 5) Bireysel koç planları — `COACH_PLANS`
| plan | aylık/yıllık (₺) | seats | modüller |
|---|---|---|---|
| Başlangıç | 499 / 4.990 | 15 | denemeAnaliz, mesajlasma |
| Pro (popüler) | 999 / 9.990 | 40 | + raporlar, veliPaneli, randevu, onlineDeneme |
| Sınırsız | 1.799 / 17.990 | 999 | + aiKoc, envanter |

Koç varlığı: `{ id, name, city, planId, status, cycle, startedAt, renewsAt, feeMonthly, autoRenew,
seats:{used,total}, rating, email, phone, modules:{}, invoices:[inv(no, daysAgo, tutar, plan, 'paid')] }`.

## 6) Platform metrikleri — `platformMetrics()`
Kurum sayısı, aktif koç, toplam öğrenci, **MRR/ARR**, abone dağılımı (plan bazında donut),
lisans uyarıları (doluyor/dolan), yaklaşan yenilemeler, yeni franchise trendi. Süper Admin Genel Bakış'ı besler.

## 7) Store / kalıcılık
- `localStorage`: `uk_admin_mode`, `uk_admin_pages` (JSON `{mod:sayfa}`), `uk_theme`, demo veri anahtarları.
- Backend'e geçiş: orgs→`organizations`, coaches→`coaches`, plans→`plans`, modules→`org_modules`/`coach_modules`
  (feature flags), invoices→`invoices`, managers→`org_managers` (RBAC join), leads→`leads`, campaigns→`campaigns`.
- RBAC: her endpoint mod + kaynak sahipliği doğrular (kurum yöneticisi yalnızca `org_id`'si eşleşen kayıtlar).

## 8) Demo kimlikleri (`adminIdentity`)
- Süper Admin: "Uyanık Koç" · admin@uyanikkoc.com · "Platform yöneticisi"
- Kurum: aktif kurumun `owner` (örn. İncisel Emen · KAMPÜS) · "Kurum yöneticisi · {kurum}"
- Bireysel Koç: `getMyCoach()` (örn. Selin Yılmaz) · "Bireysel koç"
