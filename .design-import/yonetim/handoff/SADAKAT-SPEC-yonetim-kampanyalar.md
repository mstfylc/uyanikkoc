# SADAKAT SPEC — Süper Admin · Kampanyalar (kampanyalar)

Kaynak: `admin/admin-extra2.jsx → SACampaigns`. Mod: `superadmin`, sayfa `kampanyalar`.
Veri: `useAdmin().campaigns`, `campaignGrants`, `CMP_STATUS`. Tam Türkçe.

## PageHead
- Başlık **`Kampanyalar & Kodlar`** · alt **`İndirim kampanyaları ve promosyon kodları oluştur, kullanıcılara tanımla`**
- Sağ aksiyon: birincil **`Yeni kampanya`** (plus) → kampanya oluştur modalı.

## Bileşen sırası
1. **`.grid.g-3`** — 3 StatCard (sıra): `bolt`/primary **`Aktif kampanya`** · `check`/success **`Toplam kullanım`** ·
   `users`/info **`Tanımlanan kod`**.
2. **`.grid.g-2`** — kampanya kartları: durum rozeti (`CMP_STATUS`: aktif=success **`Aktif`** / scheduled=info
   **`Planlandı`** / ended=muted **`Sona erdi`**), indirim, kod, kullanım. Boş: `EmptyState` **`Henüz kampanya yok`** / **`Yeni kampanya oluştur`**.
3. **`Section` — `Son tanımlanan kodlar`** · alt **`{n} kayıt`**: tablo (min-width 560) kolonlar
   **`Kullanıcı`** · **`Tür`** (Kurum / Bireysel koç) · **`Kampanya`** · **`Tarih`** · **`Durum`** (ortalı).
   Boş: **`Henüz bir kullanıcıya kod tanımlanmadı.`**

## YAPMA
- ❌ ASCII: `Kampanyalar & Kodlar`, `Yeni kampanya`, `Son tanımlanan kodlar`, `Planlandı`.
- ❌ Durum etiketleri/renkleri (Aktif/Planlandı/Sona erdi) ve StatCard sırasını değiştirmek.
- ❌ Tablo kolon sırasını değiştirmek.
