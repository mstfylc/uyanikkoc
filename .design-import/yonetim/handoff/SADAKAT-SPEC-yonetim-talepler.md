# SADAKAT SPEC — Süper Admin · Demo & Üyelikler (talepler)

Kaynak: `admin/leads.jsx → SALeads` (+ `DemoCard`). Mod: `superadmin`, sayfa `talepler`.
Veri: `useAdmin().demoRequests`, signups. ⚠️ **Panel-içi lead listesidir — harici CRM DEĞİL** (RISKS). Tam Türkçe.

## PageHead
- Başlık **`Demo & Üyelik Takibi`** · alt **`Gelen demo taleplerini takip et, yeni üyelik ve satın almaları izle`**
- Sağ aksiyon: açık **`CSV indir`** (aktif sekmeye göre demo/signup).

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra): `clock`/warning **`Açık demo talebi`** (sub: yeni) · `users`/success
   **`Yeni üyelik (30 gün)`** · `banknote`/primary **`Satın alma (30 gün)`** · `trend`/info **`Demo dönüşüm oranı`**.
2. **`.seg-tabs`**: **`Demo talepleri`** (clipboard, count) · **`Yeni üyelik & satın alma`** (card, count).
3. **Demo sekmesi** (`.grid.col-main`): SOL filtre/arama + `DemoCard` listesi (durum yönetimi; boş:
   `EmptyState` **`Talep bulunamadı`**); SAĞ `Section` **`Talep hunisi`** (`RankBars`) + `Section` **`Kaynaklar`**
   (talep nereden geliyor).
4. **Üyelik sekmesi:** `Section` **`Son üyelikler & satın almalar`** · alt **`{n} işlem (son 30 gün) · {TRY}`** —
   tablo: **`Üye`** · **`Plan`** · **`İşlem`** · **`Yöntem`** · **`Tarih`** · **`Tutar`** (sağ).

## YAPMA
- ❌ ASCII: `Demo & Üyelik Takibi`, `Demo talepleri`, `Talep hunisi`, `Kaynaklar`.
- ❌ Bunu harici **CRM entegrasyonu** gibi tasarlamak — yalnızca panel-içi lead/demo listesi (RISKS).
- ❌ StatCard/sekme sırasını; tablo kolonlarını değiştirmek.
