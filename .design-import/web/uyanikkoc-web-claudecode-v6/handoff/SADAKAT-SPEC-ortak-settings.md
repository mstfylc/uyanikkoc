# SADAKAT SPEC — Ortak · Ayarlar (settings) — KISA

Kaynak: `src/settings.jsx → SettingsPage`. GENEL menü öğesi. Sekmeler `SETTINGS_TABS`. Tam Türkçe.

- **PageHead:** başlık **`Ayarlar`** · alt: koç **`Hesap, görünüm ve müfredat yapılandırması`**,
  diğer **`Hesap ve görünüm ayarların`**
- **Sekmeler (`.seg`) — sıra ve etiketler birebir:**
  - **`Müfredat`** (book) — **yalnızca koç** (`coachOnly`) → `CurriculumEditor`
  - **`Hesap`** (users) → `SettingsAccountTab` (şifre değiştir + Çıkış Yap)
  - **`Görünüm`** (sun) → `SettingsAppearanceTab` (tema: açık/koyu)
  - **`Bildirimler`** (bell) → `NotificationSettings` (bkz. notifications spec)
  - **`Gizlilik & Güvenlik`** (lock) → `SettingsPrivacyTab`
- **Hesap sekmesi alanları:** Mevcut şifre · Yeni şifre (**`En az 6 karakter`**) · Yeni şifre (tekrar)
  (**`Şifreler eşleşmiyor`** uyarısı) · **`Şifreyi güncelle`**; ayrı `Section` **`Oturum`** → **`Çıkış Yap`** (danger).
- **Boş/durum:** geçersiz şifre → buton pasif (opacity .5).

## YAPMA
- ❌ ASCII: `Ayarlar`, `Görünüm`, `Gizlilik & Güvenlik`. ❌ Sekme sırasını değiştirmek.
- ❌ `Müfredat` sekmesini öğrenci/veliye göstermek (yalnızca koç).
