# SADAKAT SPEC — Süper Admin · Bireysel Koçlar (koclar) + Koç Profili (koc-detay)

Kaynak: `admin/admin-extra2.jsx → SACoaches` (override; satır tıklanır → koç profili) +
`SACoachProfile`. Mod: `superadmin`, sayfa `koclar` / `koc-detay`. Veri: `useAdmin().coaches`,
`coachPlanById`, `daysLeft`, `TRY`. Tam Türkçe.

## KOÇLAR (`koclar`) — SACoaches
- **PageHead:** başlık **`Bireysel Koç Lisansları`** · alt **`Kuruma bağlı olmadan tek başına lisans alan koçlar`** ·
  sağ aksiyon açık **`CSV indir`** (download → `bireysel-koclar.csv`).
- **`.grid.g-4`** — 4 StatCard (sıra): `users`/primary **`Aktif koç lisansı`** · `refresh`/info **`Deneme sürümünde`** ·
  `cap`/success **`Toplam öğrenci`** · `banknote`/warning **`Aylık koç geliri`** (`TRY`).
- **Filtre + arama:** `.seg` **`Tümü`** / **`Aktif`** / **`Deneme`** / **`Pasif`** + `.searchbox` **`Koç ara...`**.
- **Tablo** (`.tbl` min-width 820, satır tıklanır → koç profili): **`Koç`** (avatar+ad+şehir·★puan) · **`Plan`**
  (plan-dot+ad) · **`Öğrenci`** (used/total, 999=∞) · **`Durum`** (StatusBadge) · **`Yenileme`** (kalan gün renkli) ·
  **`Ücret`** (sağ) · işlem (**`Dondur`** / **`Aktifleştir`**). Boş: `EmptyState` **`Koç bulunamadı`**.

## KOÇ PROFİLİ (`koc-detay`) — SACoachProfile
- Üst: geri linki **`Koçlara dön`** + avatar + ad + StatusBadge.
- **`.grid.g-4`** — 4 StatCard: `cap`/primary **`Öğrenci`** · `banknote`/success **`Aylık ücret`** ·
  `star`/warning **`Ortalama puan`** · `refresh`/info **`Otomatik yenileme`** (Açık/Kapalı).
- **`.grid.col-main`**:
  - SOL: `Section` **`Kapasite & plan`** (Meter **`Öğrenci koltuğu`** + plan) + `Section` **`Faturalar`** · alt **`{n} kayıt`**
    (tablo: Fatura·Tarih·Tutar·Durum; boş: **`Henüz fatura yok (deneme sürümü).`**).
  - SAĞ: `Section` **`İletişim`** (E-posta/Telefon/Şehir/Üyelik başlangıcı) + `Section` **`Açık modüller`** (rozetler).

## YAPMA
- ❌ ASCII: `Bireysel Koç Lisansları`, `Koç Profili`, `Otomatik yenileme`, `Açık modüller`.
- ❌ StatCard sırası/etiketleri; tablo kolonları; filtre setini değiştirmek.
- ❌ 999 koltuk için `∞` göstermemek; yenileme renk kodunu (geçti=danger, ≤14=warning) bozmak.
