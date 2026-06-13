# SADAKAT SPEC — Kurum Yöneticisi · Yöneticiler (k-yoneticiler)

Kaynak: `admin/admin-extra4.jsx → KurumManagers`. Mod: `kurum`, sayfa `k-yoneticiler`.
Veri: `getActiveOrg().managers`. Tam Türkçe. **Yalnızca aktif kurum** (RBAC).

## PageHead
- Başlık **`Yöneticiler`** · alt **`{kurum} · {n} yönetici · tek kuruma birden fazla yönetici atayabilirsiniz`**
- Sağ aksiyon: birincil **`Yönetici davet et`** (plus) → InviteModal.

## Bileşen sırası
1. **`.grid.g-3`** — 3 StatCard (sıra): `users`/primary **`Toplam yönetici`** · `shield`/warning **`Sahip yetkisi`** ·
   `checkCircle`/success **`Aktif`**.
2. **`Section` — `Kurum yöneticileri`** · alt **`Sahip: lisans + faturalama dahil tüm yetkiler · Yönetici:
   operasyonel ekranlar`**: yönetici satırları (`.list-row`: avatar + ad + e-posta + rol rozeti
   **`Sahip`**/**`Yönetici`** + durum + kaldır).

## RBAC (rol farkı — data-contracts)
- **Sahip (owner):** lisans + faturalama dahil tüm yetkiler.
- **Yönetici (manager):** yalnızca operasyonel ekranlar (lisans/faturalama yok).

## YAPMA
- ❌ ASCII: `Yöneticiler`, `Yönetici davet et`, `Sahip yetkisi`.
- ❌ StatCard sırası/etiketleri; sahip↔yönetici yetki ayrımını bozmak.
- ❌ Başka kurumun yöneticilerini göstermek (yalnızca `getActiveOrg()`).
