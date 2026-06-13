# SADAKAT SPEC — EK · Ayarlar: Gizlilik & Güvenlik sekmesi

Kaynak: `src/settings.jsx → SettingsPage` (`SETTINGS_TABS`), `SettingsAccountTab`, `SettingsPrivacyTab`.
Rota: `settings` (GENEL). Tam Türkçe. (Ana spec: `SADAKAT-SPEC-ortak-settings.md`.)

## ⚠️ MEVCUT DURUM vs HEDEF (önce oku)
- **Kanonik kaynakta ŞU AN:** şifre değiştirme **`Gizlilik & Güvenlik`** (`gizlilik`) sekmesindedir
  (`SettingsPrivacyTab`: **`Şifre Değiştir`** + **`Oturum`**/Çıkış Yap). `Hesap` sekmesi (`SettingsAccountTab`)
  = profil bilgileri + **`Profili düzenle`**.
- **HEDEF (bu maddenin istediği):** şifre değiştirme **`Hesap`** sekmesine taşınır; **`Gizlilik & Güvenlik`**
  sekmesi gerçek güvenlik/gizlilik içeriğiyle doldurulur (aşağıda). Aşağıdaki yeni bölümler **önerilen
  yapıdır** — onay gerektirir; veri/metin uydurma değil, UI iskeletidir (RISKS).

## Sekme sırası (değişmez)
**`Müfredat`** (yalnız koç) · **`Hesap`** · **`Görünüm`** · **`Bildirimler`** · **`Gizlilik & Güvenlik`** (lock).

## HEDEF — `Gizlilik & Güvenlik` sekmesi içeriği (`.stack`)
1. **`Section` — `Şifre Değiştir`** · alt **`Hesabını güvende tut`** *(eğer Hesap'a taşınmadıysa burada kalır;
   taşındıysa bu bölüm Hesap'tadır)*: Mevcut şifre · Yeni şifre (**`En az 6 karakter`**) · Yeni şifre (tekrar,
   **`Şifreler eşleşmiyor`**) · **`Şifreyi güncelle`** (geçerli: mevcut dolu + yeni ≥6 + eşleşir).
2. **`Section` — `Oturum & Cihazlar`** · alt **`Hesabının açık olduğu cihazlar`** *(önerilen)*:
   aktif oturum satırları (cihaz/tarayıcı + son etkinlik + "Bu cihaz" rozeti) + **`Diğer oturumları kapat`**.
   Varsayılan: yalnızca mevcut cihaz listelenir.
3. **`Section` — `Veri & Gizlilik (KVKK)`** · alt **`Verilerin ve onayların`** *(önerilen)*:
   **`Verilerimi indir`** (dışa aktarma talebi) · **`Açık rıza / aydınlatma metni`** linki ·
   **`Hesabı sil`** (danger, onaylı — KVKK silme talebi). Varsayılan: rıza açık.
4. **`Section` — `Görünürlük tercihleri`** · alt **`Profilinin koç/veli tarafından görünürlüğü`** *(önerilen)*:
   toggle'lar (örn. **`Çalışma serisini koça göster`**, **`İlerlememi velime göster`**). Varsayılan: açık.
5. **`Section` — `Oturum`**: **`Çıkış Yap`** (danger, logout).

## 5 zorunlu alan
- **Bileşen sırası:** (Şifre) → Oturum & Cihazlar → Veri & Gizlilik (KVKK) → Görünürlük → Oturum/Çıkış. `.stack`, tam genişlik Section'lar.
- **StatCard:** yok (form/ayar sekmesi).
- **Başlık/alt metinleri:** yukarıda birebir (önerilenler *italik* işaretli).
- **Liste/satır yapısı:** cihaz satırları (cihaz + son etkinlik + "Bu cihaz"); toggle satırları.
- **Boş/durum:** tek cihaz → yalnızca "Bu cihaz"; şifre geçersiz → buton pasif; "Hesabı sil"/"Diğer oturumları kapat" onaylı.

## PNG
`exports/uyum/settings-gizlilik.png` (light+dark, 1440). NOT: PNG **mevcut** sekme halini (Şifre Değiştir + Oturum)
gösterir; yukarıdaki Oturum&Cihazlar / KVKK / Görünürlük bölümleri **hedef** olduğundan henüz prototipte yoktur.

## YAPMA
- ❌ ASCII: `Gizlilik & Güvenlik`, `Şifre Değiştir`, `Oturum & Cihazlar`, `Veri & Gizlilik (KVKK)`, `Çıkış Yap`.
- ❌ Şifreyi hem Hesap hem Gizlilik'te göstermek (tek yerde — hedefte Hesap).
- ❌ Önerilen bölümleri onay almadan "varmış gibi" final saymak; gerçek KVKK metnini uydurmak (link/onay akışı, hukuk onaylı).
