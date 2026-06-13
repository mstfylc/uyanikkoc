# SADAKAT SPEC — Süper Admin · Destek & Sistem (destek)

Kaynak: `admin/admin-extra3.jsx → SASupport` (override; SON tanım kazanır). Mod: `superadmin`, sayfa `destek`.
Veri: `useAdmin().tickets`, `team`, `viewerAccess`. Tam Türkçe. `fullAccess = viewerAccess === "full"`.

## PageHead
- Başlık **`Destek & Sistem Durumu`** · alt **`Açık talepler, sistem notları ve servis sağlığı`**
- Sağ aksiyon (demo görüntüleme rolü `.seg`): **`Tam yetki`** (shield) / **`Destek yetkilisi`** (message) →
  `setViewerAccess`. (RBAC demosu — tam yetki ekip yönetimi açar.)

## Bileşen sırası — `.grid.col-main`
- **SOL `.stack`:**
  1. `Section` **`Destek talepleri`** · alt **`{açık} açık · {toplam} toplam`** — talep satırları
     (ikon tonu önceliğe göre + konu + id·kurum·zaman + öncelik rozeti + **`Yanıtla`** → TicketThread).
  2. `Section` **`Sistem notları`** · alt **`Ekip içi duyuru ve bakım notları`** — not ekleme + liste
     (sabitlenmiş=flag/warning; sil).
- **SAĞ `.stack`:**
  1. `Section` **`Sistem durumu`** · sağda `Badge` success **`Çoğu servis çalışıyor`** — servis satırları
     (**`Çalışıyor`** success / **`Bakımda`** warning). Servisler: Uygulama (web), Mobil API,
     Ödeme servisi (iyzico), Bildirim servisi, Online deneme motoru, Raporlama.
  2. `Section` **`Ekip & Erişim`** · alt **`Platform ekibi ve yetki seviyeleri`** + (fullAccess ise) **`davet et`** —
     ekip üyeleri (erişim: **`Tam yetki`** primary / **`Destek`** muted; fullAccess'te düzenlenebilir/kaldırılabilir).
- Modaller: **`Platform ekibine davet et`** (InviteModal), `TicketThread`.

## RBAC
`fullAccess` değilse: ekip düzenleme/davet/kaldırma gizli; erişim rozetleri salt-görüntüleme.

## YAPMA
- ❌ ASCII: `Destek & Sistem Durumu`, `Sistem notları`, `Ekip & Erişim`, `Çalışıyor`/`Bakımda`.
- ❌ İki sütun düzenini (talepler+notlar / sistem+ekip) bozmak; viewerAccess gating'i atlamak.
- ❌ Servis listesini değiştirmek (iyzico dahil — gerçek ödeme sağlayıcı).
- ❌ Taban (`superadmin2`) sürümünü port etmek — **override (`admin-extra3`) esastır**.
