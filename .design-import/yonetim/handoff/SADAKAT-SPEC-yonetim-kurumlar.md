# SADAKAT SPEC — Süper Admin · Kurumlar & Franchise (kurumlar) + Yeni Kurum modalı

Kaynak: `admin/superadmin.jsx → SAOrgs`. Mod: `superadmin`, sayfa `kurumlar`.
Veri: `useAdmin().orgs`, `orgPlanById`, `daysLeft`, `TRY`. Karta tıklayınca `kurum-detay`. Tam Türkçe.

## PageHead
- Başlık **`Kurumlar & Franchise'lar`** · alt **`{n} kurum · {n} franchise ağı`**
- Sağ aksiyon: birincil **`Yeni kurum ekle`** (plus) → `Modal`.

## Bileşen sırası
1. **Filtre + arama satırı** (`.between`):
   - `.seg` filtre: **`Tümü`** · **`Franchise`** · **`Tek kurum`**
   - `.searchbox` **`Kurum ara...`** (max 280px)
2. **`.grid.g-2`** — kurum kartları (`.card`, tıklanır → detay):
   - Üst: `OrgLogo` (46) + ad + `StatusBadge` (active/expiring/trial/overdue) + tür·şube·şehir + sağda plan rozeti.
   - `Meter` icon=cap **`Öğrenci koltuğu`** (used/total).
   - Alt satır: **`Koç`** (used/total) · **`Platform ücreti`** ({TRY}/ay) · **`Yenileme`** (kalan gün, renkli) +
     sağda **`Yönet`** (→ detay).
   - Boş: `EmptyState` **`Kurum bulunamadı`** / **`Arama veya filtreyi değiştir`**.

## Yeni Kurum Ekle (`Modal`)
- Başlık **`Yeni kurum ekle`** · alt **`Kurum panele eklenir ve kurulum daveti gönderilir`** (genişlik 480).
- Alanlar: **`Kurum adı`** · **`Kurum türü`** (`.seg`: Tek kurum / Franchise) ·
  `.grid.g-2` **`Yetkili adı`** + **`Yetkili e-posta`** · `.grid.g-2` **`Şehir`** + **`Başlangıç planı`** (orgPlans select).
- Footer: **`Vazgeç`** / **`Kurum ekle`** (ad dolu + geçerli e-posta ise aktif). Eklenince toast
  **`{ad} kuruma eklendi · kurulum daveti panoya kopyalandı`** + detaya gider.

## YAPMA
- ❌ ASCII: `Kurumlar & Franchise'lar`, `Yeni kurum ekle`, `Öğrenci koltuğu`, `Platform ücreti`.
- ❌ Kart yapısını (logo+durum+meter+koç/ücret/yenileme) değiştirmek; filtre setini azaltmak.
- ❌ Kurum türü/plan seçeneklerini `data-contracts`'tan farklı yapmak.
- ❌ Yenileme renk kodunu (geçti=danger, <14=warning) değiştirmek.
