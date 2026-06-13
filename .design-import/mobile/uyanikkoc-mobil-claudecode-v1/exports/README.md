# exports/mobil/ — Referans Ekran Görüntüleri (Öğrenci Mobil)

PNG'ler **yalnızca QA referansıdır** — doğruluk kaynağı `mobile/*` + `theme.ts` + `handoff/SADAKAT-SPEC-mobil-*`.

## İçerik (iOS · light · cihaz çerçeveli)
`exports/mobil/ios-light/`: **login · home · odevler · denemeler · program · profil** (v3 öğrenci çekirdeği).

## ⚠️ Bu sette OLMAYANLAR (üretim/araç sınırı)
- **Dark + Android (360×800) + iOS 390×844 tam set:** prototipte Tweaks panelinden tema/cihaz
  değiştirilip alınır (cihaz çerçeveli prototip bunu destekler); otomasyon bütçesi nedeniyle bu pakette
  yalnızca iOS-light çekirdek var.
- **Alt ekranlar** (Konu/Kaynaklarım/Randevular/Mesajlar/Motivasyon/Destek): prototipte Home/Profil
  kısayolundan açılır; spec `SADAKAT-SPEC-mobil-alt-ekranlar.md`.
- **Modaller (bottom-sheet: ResultSheet, Yanlış ekle, Randevu iste...):** açık halde gerçek cihazda/tweaks ile yakalanır.
- **v6-YENİ ekranlar** (Yanlış Defteri, Net Kaybı Haritası, Takvimim, Testler, Bildirimler, Abonelik,
  AI Koç...): **prototipte henüz YOK** → `handoff/V6-HIZALAMA-PLANI.md` build-spec'i ile üretilir.

## Yakalama (prototip)
`uyanik-koc-mobil.html` aç → Tweaks: rol **Öğrenci**, tema **light/dark**, cihaz **iOS/Android** →
giriş (telefon + SMS) → tab/alt ekran gezin. İsimlendirme: `exports/mobil/<platform>-<tema>/<route>.png`.
