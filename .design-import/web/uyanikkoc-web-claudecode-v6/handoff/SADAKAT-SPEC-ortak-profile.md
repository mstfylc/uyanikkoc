# SADAKAT SPEC — Ortak · Profil (profile) — KISA

Kaynak: `src/auth.jsx → ProfilePage`. ⚠️ Sidebar rotası DEĞİL — topbar kullanıcı menüsünden açılır.
`localStorage: uk_pref_notif`. Tam Türkçe.

- **PageHead:** başlık **`Profil`** · alt **`Hesap bilgilerin ve tercihlerin`**
- **Bileşen sırası — `.grid.col-rail`** (sol dar kart + sağ ana):
  - **SOL kart:** primary degrade başlık + avatar (76px) + ad + `u.sub` + rol rozeti
    (**`Koç`** primary / **`Öğrenci`** success / **`Veli`**). Altında istatistik satırları
    (öğrenci: **`11. Sınıf · Sayısal`** · **`Hedef: YKS 2026`** · **`12 gün seri`**;
    koç: **`18 öğrenci`** · **`%74 ort. tamamlama`** · **`Üye: Eyl 2024`**).
  - **SAĞ `.stack`:**
    1. `Section` **`Profil Fotoğrafı`** · alt **`Hazır bir ikon seç ya da kendi fotoğrafını yükle`** → `AvatarPicker`
    2. `Section` **`Hesap Bilgileri`** + **`Kaydet`** aksiyonu: `.grid.g-2` **`Ad Soyad`** / **`Telefon`**,
       altında **`E-posta`**; öğrenci/veli için pasif **`Koç`** = "Dilek Emen". Kayıt → toast **`Profil güncellendi`**.
    3. `Section` **`Tercihler`**: **`Koyu tema`** (switch) + **`Bildirimler`** (switch, `uk_pref_notif`).
- **Durum:** kaydet sonrası buton anlık **`Kaydedildi`**.

## YAPMA
- ❌ ASCII: `Profil`, `Hesap Bilgileri`, `Koyu tema`. ❌ Bunu sidebar rotası yapmak (kullanıcı menüsü/üst menü).
- ❌ Sol kimlik kartı + sağ form (`col-rail`) iki sütununu tek sütuna indirmek.
