# SADAKAT SPEC — İNDEKS (Yönetim Paneli, ekran-bazlı birebir uygulama)

Her ekran için `admin/*.jsx` kaynağından doğrulanmış birebir yerleşim spec'i. Hibrit derinlik
(veri-yoğun = tam, basit = kısa ama 5 zorunlu alan: bileşen sırası+grid · StatCard ikon/tone/etiket/sıra ·
bölüm başlık/alt-başlık · tablo/satır yapısı · boş/durum metinleri). Tüm metinler **tam Türkçe**.

> Önce oku: `EKRANLAR.md` (envanter) · `data-contracts.md` (RBAC/veri) · `RISKS_AND_GAPS.md` (sınırlar).

## SÜPER ADMIN (mod: superadmin)
| Ekran | Dosya |
|---|---|
| genel (Genel Bakış) | `SADAKAT-SPEC-yonetim-genel.md` |
| kurumlar (+ kurum-detay) | `SADAKAT-SPEC-yonetim-kurumlar.md` · `SADAKAT-SPEC-yonetim-kurum-detay.md` |
| lisanslar (Lisans Takibi) | `SADAKAT-SPEC-yonetim-lisanslar.md` |
| koclar (+ koc-detay) | `SADAKAT-SPEC-yonetim-koclar.md` |
| gelir (Gelir & Faturalama) | `SADAKAT-SPEC-yonetim-gelir.md` |
| raporlar | `SADAKAT-SPEC-yonetim-raporlar.md` |
| talepler (Demo & Üyelikler) | `SADAKAT-SPEC-yonetim-talepler.md` |
| kampanyalar | `SADAKAT-SPEC-yonetim-kampanyalar.md` |
| lisans-turleri (Lisans Türleri) | `SADAKAT-SPEC-yonetim-lisans-turleri.md` |
| moduller (Modül Bayrakları) | `SADAKAT-SPEC-yonetim-moduller.md` |
| destek (Destek & Sistem) | `SADAKAT-SPEC-yonetim-destek.md` |
| ayarlar | `SADAKAT-SPEC-yonetim-ayarlar.md` |

## KURUM YÖNETİCİSİ (mod: kurum)
| Ekran | Dosya |
|---|---|
| k-dashboard | `SADAKAT-SPEC-yonetim-k-dashboard.md` |
| k-koclar (+ k-coach-detay) | `SADAKAT-SPEC-yonetim-k-koclar.md` |
| k-ogrenciler (+ k-student-detay) | `SADAKAT-SPEC-yonetim-k-ogrenciler.md` |
| k-subeler (Şubeler) | `SADAKAT-SPEC-yonetim-k-subeler.md` |
| k-lisans (Lisans & Kapasite) | `SADAKAT-SPEC-yonetim-k-lisans.md` |
| k-gelir (Gelir & Tahsilat) | `SADAKAT-SPEC-yonetim-k-gelir.md` |
| k-raporlar | `SADAKAT-SPEC-yonetim-k-raporlar.md` |
| k-yoneticiler (Yöneticiler) | `SADAKAT-SPEC-yonetim-k-yoneticiler.md` |
| k-paketler / bk-paketler (Öğrenci Paketleri) | `SADAKAT-SPEC-yonetim-paketler.md` |
| k-ayarlar | `SADAKAT-SPEC-yonetim-k-ayarlar.md` |

## BİREYSEL KOÇ (mod: coach)
| Ekran | Dosya |
|---|---|
| bk-lisans (Lisansım) | `SADAKAT-SPEC-yonetim-bk-lisans.md` |
| bk-planlar (Planlar & Yükselt) + bk-faturalar | `SADAKAT-SPEC-yonetim-bk-planlar.md` |
| bk-paketler (Öğrenci Paketleri) | `SADAKAT-SPEC-yonetim-paketler.md` |
| bk-feedback (Geri Bildirimlerim) + profile | `SADAKAT-SPEC-yonetim-bk-feedback-profile.md` |

## PNG / QA
`exports/yonetim/` (curated set) + `QA-CAPTURE-RECETESI.md` (boot-direct + DevTools reçetesi).
