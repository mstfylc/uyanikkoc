# SADAKAT SPEC — Mobil · Profil (profil)

Kaynak: `mobile/uk-screens2.jsx → ProfilScreen`. PNG: `exports/mobil/ios-light/profil.png`. Tab: **Profil**.
Tam Türkçe.

## Bileşen sırası
1. **Avatar** (düzenlenebilir + seçici) + ad + sınıf/hedef.
2. **Tercihler:** bildirim switch + **tema (Koyu)** switch.
3. **Başarımlar / rozetler** kısayolu.
4. **Alt ekran kısayolları** (Konu Takibi · Kaynaklarım · Randevular · Mesajlar · Motivasyon · Destek).
5. **Çıkış Yap** (danger; token iptal + SecureStore temizliği).

## v6 EKLENECEK
- **Ayarlar** ayrı ekrana ayrılır (Hesap/Görünüm/Bildirimler/Gizlilik) — web `settings`.
- **Abonelik** kısayolu (web `billing`).

## YAPMA
- ❌ ASCII: `Profil`, `Çıkış Yap`, `Başarımlar`.
- ❌ Tema/bildirim switch'lerini kaldırmak; çıkışta token temizliğini atlamak.
