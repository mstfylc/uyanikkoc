# SADAKAT SPEC — Süper Admin · Lisans Takibi (lisanslar)

Kaynak: `admin/admin-extra4.jsx → SALicenses` (override; satır → abone profili). Mod: `superadmin`, sayfa `lisanslar`.
Veri: kurumlar + bireysel koçlar birleşik satırlar; `daysLeft`, `statusMeta`. Tam Türkçe.

## PageHead
- Başlık **`Lisans Takibi`** · alt **`Tüm kurum, franchise ve bireysel koç lisanslarının durumu — satıra tıklayarak abone profiline gidin`**
- Sağ aksiyon: açık **`CSV indir`** (download → `lisans-takip.csv`).

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra): `shield`/success **`Aktif lisans`** · `clock`/warning
   **`14 gün içinde doluyor`** · `alert`/danger **`Ödeme gecikti`** · `refresh`/info **`Deneme sürümünde`**.
2. **`Tabs`**: **`Tüm lisanslar`** · **`Süresi doluyor`** (clock) · **`Ödeme gecikti`** (alert) · **`Pasif`** (count'lu).
3. **`Section`** → tablo `.tbl` (min-width 800, satır tıklanır → kurum detay / koç profili):
   kolonlar **`Abone`** (logo/avatar+ad+tür) · **`Plan`** · **`Kapasite`** (used/total, 999=∞) · **`Durum`** ·
   **`Yenileme`** (kalan gün renkli + tarih) · **`Ücret`** (sağ) · işlem (**`Yenile`** overdue/expiring'de).
   Boş: `EmptyState` **`Bu kategoride lisans yok`**.

## YAPMA
- ❌ ASCII: `Lisans Takibi`, `Süresi doluyor`, `Ödeme gecikti`, `Deneme sürümünde`.
- ❌ StatCard/Tab sırası/etiketleri; tablo kolonları; yenileme renk kodu (geçti=danger, ≤14=warning).
- ❌ Taban (`superadmin.jsx`) sürümünü port etmek — **override (`admin-extra4`) esastır** (satır tıklanır).
