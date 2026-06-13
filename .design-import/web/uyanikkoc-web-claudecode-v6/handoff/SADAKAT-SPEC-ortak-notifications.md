# SADAKAT SPEC — Ortak · Bildirimler (notifications) — KISA

⚠️ **Ayrı rota DEĞİL.** İki yerde yaşar: (1) topbar zil paneli, (2) Ayarlar → Bildirimler tercihleri.
Kaynak: `src/notifications.jsx`. Store: `useNotifs(role)` (`uk_notif_v2`). Tam Türkçe.

## 1) Topbar zil paneli — `NotifBell({role, goPage})`
- Zil ikonu (`icon-btn`); okunmamış varsa `.notif-badge` sayaç (9+ üstü "9+").
- Açılır panel `.notif-pop`:
  - Başlık satırı: **`Bildirimler`** + okunmamış rozeti **`{n} yeni`**; sağda **`Tümünü okundu işaretle`** (markAll).
  - `.notif-list` — her bildirim ikon + metin + zaman; tıklayınca `markRead` + ilgili sayfaya gider (`goPage`).
  - Boş: "Henüz bildirim yok" tarzı boş metin.

## 2) Ayarlar → Bildirimler — `NotificationSettings({role})`
- `Section` **`Bildirim Tercihleri`** · alt **`Hangi bildirimleri hangi kanaldan alacağını seç`** +
  **`Tercihleri kaydet`** aksiyonu: kanal × tür matrisi (`NOTIF_CHANNELS`: uygulama/e-posta/SMS toggle'ları).
- `Section` **`Rahatsız Etme Saatleri`** · alt **`Bu aralıkta uygulama ve SMS bildirimleri ertelenir`**:
  aç/kapa + **`Başlangıç`**/**`Bitiş`** (time) + not **`Acil tahsilat/randevu bildirimleri istisna`**.

## YAPMA
- ❌ Bunu sidebar'da ayrı sayfa yapmak — zil paneli + ayarlar sekmesi.
- ❌ ASCII: `Bildirimler`, `Tümünü okundu işaretle`, `Rahatsız Etme Saatleri`.
- ❌ Okunmamış sayaç rozetini / "Tümünü okundu işaretle" aksiyonunu atlamak.
