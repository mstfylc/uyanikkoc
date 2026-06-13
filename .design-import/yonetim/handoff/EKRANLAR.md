# EKRAN LISTESI — Uyanik Koc Yonetim Paneli

Kaynak: `admin/admin-app.jsx` (MODES + renderPage). Panel **3 mod** icerir.
Not: Promptta "2 rol (Sube Yoneticisi + Super Admin)" denmis; canli uygulamada
**3 mod** var: **Super Admin**, **Kurum Yoneticisi** (= prompt'taki "Sube/Kurum
yoneticisi"; subeler bu modun alt ekranidir), **Bireysel Koc**. Asagida gercek
kanonik anahtar adlar + amac + ana bilesenler listelenmistir.

Mod gecisi topbar'daki `.mode-seg` (Super Admin / Kurum / Koc). Tema + profil
her modda ortak. Veriler `localStorage`'da (`uk_admin_mode`, `uk_admin_pages`).

---

## 1) SUPER ADMIN  (mod anahtari: `superadmin`)  — bilesen: admin-app.jsx > MODES.superadmin
| # | key | Menu adi | Bilesen (dosya) | Amac / ana bilesenler |
|---|-----|----------|-----------------|------------------------|
| 1 | `genel` | Genel Bakis | SAOverview (superadmin.jsx) | Platform stat kartlari (kurum, koc, ogrenci, MRR), gelir gelisimi grafigi, abone dagilimi (donut), lisans uyari seridi, yaklasan yenilemeler, yeni franchise grafigi |
| 2 | `kurumlar` | Kurumlar & Franchise | SAOrgs (superadmin.jsx) | Kurum/franchise kartlari (koltuk metre, koc, platform ucreti, yenileme), Tumu/Franchise/Tek kurum filtresi, arama, "Yeni kurum ekle" modal |
| 2b | `kurum-detay` | Kurum Detayi | SAOrgDetail (admin-extra3.jsx) | Kurum drill-in: abone notu, demo, detayli yenileme, sube/koc ozeti |
| 3 | `lisanslar` | Lisans Takibi | SALicenses (admin-extra4.jsx) | Lisans durum sekmeleri/tablo (aktif/doluyor/dolan), koc satiri -> koc profili |
| 4 | `koclar` | Bireysel Koclar | SACoaches (admin-extra2.jsx) | Bireysel koc listesi, arama/filtre, koc profiline link |
| 4b | `koc-detay` | Koc Profili | SACoachProfile (admin-extra2.jsx) | Koc profili: not, demo, yenileme |
| 5 | `gelir` | Gelir & Faturalama | SARevenue (superadmin2.jsx) | MRR/ARR metrikleri, kurum/bireysel gelir kirilimi, fatura ozetleri |
| 6 | `raporlar` | Raporlar | SAReports (sa-reports.jsx) | Rapor sekmeleri (buyume, lisans sagligi...), grafikler |
| 7 | `talepler` | Demo & Uyelikler | SALeads (leads.jsx) | Demo talepleri / lead listesi, durum yonetimi |
| 8 | `kampanyalar` | Kampanyalar | SACampaigns (admin-extra2.jsx) | Kampanya listesi (aktif/planli/bitti) + "kampanya olustur" modal |
| 9 | `lisans-turleri` | Lisans Turleri | SAPlans (plans-packages.jsx) | Kurum/koc plan sekmeleri, plan kartlari |
| 10 | `moduller` | Modul Bayraklari | SAModules (superadmin2.jsx) | Platform geneli modul erisim switch'leri (feature flags) |
| 11 | `destek` | Destek & Sistem | SASupport (admin-extra3.jsx) | Destek talepleri + sistem durumu, ekip & erisim |
| 12 | `ayarlar` | Ayarlar | SASettings (settings.jsx) | Platform ayarlari (erisim seviyesine gore duzenlenebilir) |
| — | `profile` | Profil | AdminProfile (admin-app.jsx) | Hesap bilgileri, avatar secici, tema |

## 2) KURUM YONETICISI  (mod anahtari: `kurum`)  — MODES.kurum
Topbar'da aktif kurum secici (org switcher) bulunur.
| # | key | Menu adi | Bilesen (dosya) | Amac / ana bilesenler |
|---|-----|----------|-----------------|------------------------|
| 1 | `k-dashboard` | Dashboard | KurumDashboard (kurum.jsx) | Kurum ozeti: koltuk/koc kapasitesi, gelir, uyarilar |
| 2 | `k-koclar` | Koclar | KurumCoaches (admin-extra4.jsx) | Koc listesi: gorev ata, cikar, detaya git |
| 2b | `k-coach-detay` | Koc Detayi | KurumCoachDetail (admin-extra4.jsx) | Koc raporu: geri bildirimler + gorevler |
| 3 | `k-ogrenciler` | Ogrenciler | KurumStudents (admin-extra4.jsx) | Ogrenci listesi, detaya git |
| 3b | `k-student-detay` | Ogrenci Detayi | KurumStudentDetail (admin-extra4.jsx) | Ogrenci raporu |
| 4 | `k-subeler` | Subeler | KurumBranches (kurum2.jsx) | Sube listesi/yonetimi (kapasite, adres) |
| 5 | `k-lisans` | Lisans & Kapasite | KurumLicense (admin-extra4.jsx) | Lisans ozeti + detayli yenileme |
| 6 | `k-gelir` | Gelir & Tahsilat | KurumRevenue (kurum2.jsx) | Kurum geliri, tahsilat durumu |
| 7 | `k-paketler` | Ogrenci Paketleri | KurumPackages (plans-packages.jsx) | Ogrencilere satilan kocluk paketleri paneli |
| 8 | `k-raporlar` | Raporlar | KurumReports (kurum2.jsx) | Donem secimli kurum raporlari, ders bazli ilerleme |
| 9 | `k-yoneticiler` | Yoneticiler | KurumManagers (admin-extra4.jsx) | Coklu kurum yoneticisi yonetimi |
| 10 | `k-ayarlar` | Ayarlar | KurumSettings (kurum2.jsx) | Kurum profili, marka rengi |
| — | `profile` | Profil | AdminProfile (admin-app.jsx) | Hesap bilgileri, avatar, tema |

## 3) BIREYSEL KOC  (mod anahtari: `coach`)  — MODES.coach
| # | key | Menu adi | Bilesen (dosya) | Amac / ana bilesenler |
|---|-----|----------|-----------------|------------------------|
| 1 | `bk-lisans` | Lisansim | CoachMyLicense (coach-license.jsx) | Aktif lisan ozeti, kapasite, yenileme |
| 2 | `bk-feedback` | Geri Bildirimlerim | CoachFeedback (admin-extra4.jsx) | Kuruma/ogrenciye dair geri bildirim kartlari |
| 3 | `bk-planlar` | Planlar & Yukselt | CoachPlans (coach-license.jsx) | Plan satin alma / yukseltme (billing-checkout) |
| 4 | `bk-paketler` | Ogrenci Paketleri | CoachPackages (plans-packages.jsx) | Koca ait ogrenci kocluk paketleri |
| 5 | `bk-faturalar` | Faturalar | CoachInvoices (coach-license.jsx) | Fatura gecmisi |
| — | `profile` | Profil | AdminProfile (admin-app.jsx) | Hesap bilgileri, avatar, tema |

---

## Prompt ekran listesi ile eslesme notu
- Prompt "Sube Yoneticisi" ekranlari (dashboard, koclar, ogrenciler, subeler,
  lisans-kapasite, gelir-tahsilat, raporlar, yoneticiler, ayarlar) = **Kurum
  Yoneticisi** modu (yukaridaki 10 ekran) ile birebir karsilanir.
- Prompt "Super Admin" listesindeki `subeler` / ayri `ogrenciler` ekranlari:
  canli panelde Super Admin'de ayri sayfa DEGIL; kurum detayinin (`kurum-detay`)
  alt bilgisidir. Geri kalan tum Super Admin ekranlari mevcuttur.
- Promptta olmayan ek mod: **Bireysel Koc** (5 ekran) — canli panelde vardir.

## Kapsam disi / kullanilmayan (pakete ALINMADI)
Asagidaki dosyalar eski veri modeli (`CURRENT_KURUM`, `BRANCHES`) kullanir,
yeni `getActiveOrg()/useAdmin()` modeliyle degistirilmistir; hicbir kanonik HTML
yuklemez: `kurum-pages.jsx`, `kurum-pages2.jsx`, `solo-pages.jsx`,
`super-pages.jsx`, `super-pages2.jsx`, `super-pages3.jsx`.
