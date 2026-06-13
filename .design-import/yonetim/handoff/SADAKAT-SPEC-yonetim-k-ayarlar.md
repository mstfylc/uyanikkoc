# SADAKAT SPEC — Kurum Yöneticisi · Ayarlar (k-ayarlar) — KISA

Kaynak: `admin/kurum2.jsx → KurumSettings`. Mod: `kurum`, sayfa `k-ayarlar`. `getActiveOrg()`. Tam Türkçe.

- **PageHead:** başlık **`Ayarlar`** · alt **`Kurum profili, marka ve faturalama bilgileri`**.
- **`.grid.col-main`:**
  - SOL `.stack`: `Section` **`Kurum profili`** (logo + kurum adı/bilgileri) + `Section` **`Marka rengi`** ·
    alt **`Panel ve raporlarda kullanılır`** (renk seçenekleri).
  - SAĞ `.stack`: `Section` **`Faturalama bilgileri`** (Plan + yenileme + ücret) + `Section` **`Tehlikeli bölge`**
    (`.alert-strip`, hassas işlemler).

## YAPMA
- ❌ ASCII: `Ayarlar`, `Kurum profili`, `Marka rengi`, `Faturalama bilgileri`, `Tehlikeli bölge`.
- ❌ İki sütun düzenini bozmak; marka rengini `#534AB7` Uyanık Koç markası ile karıştırmak
  (marka rengi yalnızca kurumun kendi panel vurgusudur, ürün markası sabittir — RISKS).
- ❌ Başka kurumun ayarlarını göstermek (yalnızca `getActiveOrg()`).
