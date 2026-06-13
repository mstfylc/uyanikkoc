# SADAKAT SPEC — Bireysel Koç · Geri Bildirimlerim (bk-feedback) + Profil (profile) — KISA

## GERİ BİLDİRİMLERİM (`bk-feedback`) — CoachFeedback (`admin/admin-extra4.jsx`)
Mod: `coach`. Veri: `getMyCoach()`, `coachFeedback(coachId)`, `coachFbAvg`. Tam Türkçe.
- **PageHead:** başlık **`Geri Bildirimlerim`** · alt = kuruma/öğrenciye dair değerlendirme özeti.
- Ortalama puan + geri bildirim **`fb-card`** kartları (öğrenci/veli değerlendirmeleri, tarih, puan, alıntı).
- Boş: **`Henüz geri bildirim yok.`**

## PROFİL (`profile`) — AdminProfile (`admin/admin-app.jsx`)
Tüm modlarda ortak; topbar kullanıcı menüsünden açılır. `adminIdentity(mode)` (bkz. data-contracts §8).
- **PageHead:** başlık **`Profil`** · alt **`Hesap bilgilerin ve tercihlerin`**.
- **`.grid.col-rail`** (sol kimlik kartı + sağ form):
  - SOL: degrade başlık + avatar + ad + `id.sub` + **mod rozeti** (`MODES[mode].label`: Süper Admin /
    Kurum Yöneticisi / Bireysel Koç).
  - SAĞ: `Section` **`Hesap Bilgileri`** (ad/e-posta/telefon) + `Section` **`Tercihler`** (koyu tema toggle).

## YAPMA
- ❌ ASCII: `Geri Bildirimlerim`, `Profil`, `Hesap Bilgileri`, `Tercihler`, mod adları.
- ❌ Profili sidebar rotası yapmak (kullanıcı menüsünden açılır); mod rozetini yanlış mod ile göstermek.
- ❌ Geri bildirim verisini uydurmak (yalnızca `coachFeedback` — RISKS).
