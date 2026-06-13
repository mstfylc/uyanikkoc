# SADAKAT SPEC — Kurum Yöneticisi · Lisans & Kapasite (k-lisans)

Kaynak: `admin/kurum2.jsx → KurumLicense`. Mod: `kurum`, sayfa `k-lisans`.
Veri: `getActiveOrg()`, `orgPlanById`. Tam Türkçe. **Modül paketi salt-okunur** (RBAC).

## PageHead
- Başlık **`Lisans & Kapasite`** · alt **`Planınızı, koltuk kullanımınızı ve modüllerinizi görüntüleyin`** (aksiyon yok)

## Bileşen sırası
1. **`LicenseHero`** — plan/kapasite/yenileme hero.
2. **`.grid.col-main`**:
   - SOL `.stack`:
     - `Section` **`Kapasite kullanımı`**: `Meter` koltuk/koç(/şube franchise'ta); doluluk %85 üstüyse
       `.alert-strip.warn` (kapasite uyarısı).
     - `Section` **`Açık modüller`** · alt **`Lisansınıza dahil özellikler — açma talebi için süper admine
       başvurun`**: `ModuleGrid readOnly` (**kurum modül AÇAMAZ** — bkz. data-contracts §1).
   - SAĞ `.stack`:
     - `Section` **`Plan & yenileme`**: mevcut plan + yenileme tarihi.
     - `Section` **`Üst plan: Franchise`**: **`Daha fazla şube, koç ve öğrenci koltuğu + AI Koç ve Envanter
       modülleri.`** + yükselt CTA.

## YAPMA
- ❌ ASCII: `Lisans & Kapasite`, `Kapasite kullanımı`, `Açık modüller`, `Plan & yenileme`.
- ❌ `ModuleGrid`'i düzenlenebilir yapmak — kurum tarafında **salt-okunur** (yalnızca süper admin açar).
- ❌ Kapasite uyarı eşiğini (%85) değiştirmek; iki sütun düzenini bozmak.
