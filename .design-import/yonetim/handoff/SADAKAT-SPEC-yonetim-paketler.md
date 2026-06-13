# SADAKAT SPEC — Öğrenci Paketleri (k-paketler / bk-paketler) — KISA

Kaynak: `admin/plans-packages.jsx → KurumPackages` (kurum) / `CoachPackages` (bireysel koç) →
ortak `StudentPackagesPanel`. Mod: `kurum` (`k-paketler`) / `coach` (`bk-paketler`). Tam Türkçe.

- **PageHead:** başlık **`Öğrenci Paketleri`** · alt: kurum **`{kurum} · öğrencilerinize sattığınız koçluk
  paketleri`** / koç **`öğrencilerinize sunduğunuz koçluk paketleri`** · sağ aksiyon **`Yeni paket`**.
- **Bilgi şeridi** (`.alert-strip`, wallet): öğrencilere satılan koçluk paketleri hakkında açıklama.
- **Paket kartları/listesi:** her paket ad + fiyat + özellikler + düzenle; `StudentPackagesPanel`
  (`kind="org"` ownerId=kurum / `kind="coach"` ownerId=koç). Veri sahibe göre filtreli (RBAC).
- **Boş durum:** paket yoksa ekleme çağrısı.

## YAPMA
- ❌ ASCII: `Öğrenci Paketleri`, `Yeni paket`.
- ❌ Kurum ve koç paketlerini karıştırmak (sahibe göre `ownerId` filtreli — kendi paketleri).
- ❌ Para birimini ₺/tr-TR dışına çıkarmak.
