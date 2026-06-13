# SADAKAT SPEC — Süper Admin · Ayarlar (ayarlar) — KISA

Kaynak: `admin/settings.jsx → SASettings`. Mod: `superadmin`, sayfa `ayarlar`. `ACCESS_META`. Tam Türkçe.
`editable = viewerAccess === "full"`.

- **PageHead:** başlık **`Ayarlar`** · alt **`Panel erişimi, roller ve başvuru kaynağı entegrasyonları`**.
- **Düzenleme yoksa** (destek yetkilisi): üstte salt-görüntüleme uyarısı.
- **`.seg-tabs`:** **`Ekip & Erişim`** (users, count) · **`Başvuru Kaynakları`** (bolt, count).
- **Ekip & Erişim sekmesi:**
  - `Section` **`Süper admin erişimi`** · alt **`Panele erişebilecek kullanıcıları ve rollerini yönetin`** +
    (editable) **`Kullanıcı davet et`** — kullanıcı satırları (rol: Tam yetki / Destek yetkilisi).
  - `Section` **`Roller ve yetkiler`** — `ACCESS_META`: **`Tam yetki`** (primary, *"Tüm ekranlar · lisans ·
    faturalama · ekip & ayarlar dahil her şey."*) · **`Destek yetkilisi`** (info, *"Destek & Sistem +
    Demo & Üyelik taleplerini yönetir; diğer ekranlar salt görüntüleme."*).
- **Başvuru Kaynakları sekmesi:** lead kaynak entegrasyon ayarları (form/landing vb.).

## YAPMA
- ❌ ASCII: `Ayarlar`, `Ekip & Erişim`, `Başvuru Kaynakları`, `Tam yetki`, `Destek yetkilisi`.
- ❌ Rol tanımlarını (Tam yetki ↔ Destek yetkilisi yetki kapsamı) değiştirmek; editable gating'i atlamak.
