# RISKS & GAPS — Mobil

## Kesin sınırlar (DEĞİŞTİRME)
1. **Sadece öğrenci uygulaması.** Veli/koç prototipte referans olarak var ama **port kapsamı dışı** (ayrı ürün).
2. **Tek şube.** Öğrenci tek kuruma/şubeye bağlı; çoklu şube/kurum seçimi yok.
3. **Marka "Uyanık Koç"** sabit (#534AB7, Plus Jakarta Sans).
4. **AI Koç = "Yakında"** — tanıtım ekranı; aktif AI akışı/sohbet yok (input pasif).
5. **Veri uydurma yok** — yeni metrik/ekran/alan icat etme. Ekran seti EKRANLAR + V6-HIZALAMA-PLANI ile sınırlı.

## v3 → v6 boşluğu (en kritik)
Prototip **v3** tabanlıdır; şu v6 öğrenci ekranları **prototipte HENÜZ YOK** ve eklenmelidir
(tasarım yönergesi + içerik kaynağı `V6-HIZALAMA-PLANI.md`):
**Yanlış Defteri · Net Kaybı Haritası · Takvimim · Denemeler Analiz/Online · Testler · Bildirimler ·
Abonelik · Ayarlar (ayrı) · AI Koç (Yakında).**
> Bu yüzden `exports/` PNG'leri yalnızca v3'te var olan ekranları kapsar. Yeni ekranlar build-spec ile üretilir.

## Backend'e geçişte netleştirilecekler
- **Native oturum ↔ NextAuth** ortak imza/issuer; refresh token rotasyonu (data-contracts §1).
- **Push** (APNs/FCM) + derin link haritası ekran bazında tanımlanmalı.
- **Spaced repetition** `nextDue` sunucuda; yerel bildirim zamanlaması.
- **Mesajlaşma** gerçek-zaman (WebSocket/SSE); prototipteki simülasyon kaldırılır.
- **Ödeme** (Abonelik) sağlayıcı + App Store/Play faturalandırma politikası (IAP gereği?) değerlendirilmeli.

## Bilinen platform sapması (kasıtlı)
Dark nötr tonlar mobilde web'den hafif farklı (OLED) — `tokens.json $platformNotes`'ta belirtildi. Koru.

## Tasarım doğruluk kaynağı (KORU)
`theme.ts` + `tokens.json` (web v6 ile ortak) · `mobile/uk-mobile.css` (prototip stilleri) ·
`mobile/uk-data.jsx → M_ICONS` (ikon path'leri → RN `react-native-svg`).
Yeni v6 ekranları: `uyanikkoc-web-claudecode-v6` spec'lerini native'e uyarla (modal→bottom-sheet, tablo→liste).
