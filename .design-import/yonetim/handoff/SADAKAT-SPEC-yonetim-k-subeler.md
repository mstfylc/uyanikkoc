# SADAKAT SPEC — Kurum Yöneticisi · Şubeler (k-subeler)

Kaynak: `admin/kurum2.jsx → KurumBranches`. Mod: `kurum`, sayfa `k-subeler`.
Veri: `getActiveOrg().branches`, `orgPlanById(...).branches` (kapasite). Tam Türkçe.

## İki durum
**Tek kurum (type !== franchise):** PageHead **`Şube`** · alt **`Tek kurum — tüm öğrenci ve koçlar bu
konuma bağlı`** + `.alert-strip` (franchise'a yükselt CTA) + `.grid.g-3` StatCard (`cap` **`Öğrenci`** ·
`users` **`Koç`** · `banknote` **`Aylık tahsilat`**).

**Franchise:** 
- PageHead **`Şubeler`** · alt **`{n} şube · {kapasite} şube kapasitesi`** · sağ: **`CSV indir`** +
  **`Şube ekle`** (kapasite dolduysa pasif).
- **`.grid.g-4`** StatCard (sıra): `building`/primary **`Aktif şube`** · `cap`/info **`Toplam öğrenci`** ·
  `users`/success **`Toplam koç`** · `banknote`/warning **`Aylık tahsilat`**.
- Şube listesi/tablosu (Şube·Şehir·Öğrenci·Koç·Aylık tahsilat·yönet → `BranchManageModal`).

## YAPMA
- ❌ ASCII: `Şubeler`, `Aktif şube`, `Aylık tahsilat`, `Şube ekle`.
- ❌ Tek kurum / franchise iki durumunu birleştirmek; şube kapasitesi dolu iken "Şube ekle"yi aktif bırakmak.
- ❌ StatCard sırası/etiketleri.
