# exports/uyum/ — 3 ince madde referans kareleri

`SADAKAT-SPEC-ek-*.md` için QA referansı. Doğruluk kaynağı `src/*.jsx` + spec.

## İçerik (desktop 1440 · light + dark)
- `schedule-gun.png` — Çalışma Programı Gün görünümü (SOL bloklar | SAĞ 2 StatCard + Haftalık Çalışma BarChart)
- `settings-gizlilik.png` — Ayarlar · Gizlilik & Güvenlik sekmesi (**mevcut** hal: Şifre Değiştir + Oturum;
  spec'teki Oturum&Cihazlar/KVKK/Görünürlük bölümleri **hedef** — henüz prototipte yok)
- `c-online.png` — Koç Online Denemeler (CoachAccessPanel + liste)
- `c-online-kilit.png` — paket kapalı → LockBanner ("Online deneme paketi kapalı")

## Yakalanamayanlar (portal modal — gerçek DevTools ile)
- **AddBlockModal** ("Çalışma Bloğu Ekle") ve **OnlineDenemeOlusturModal** ("Online Deneme Oluştur"):
  `createPortal`+`position:fixed` olduğundan tarayıcı-içi araç yakalayamıyor. Aç-yakala:
  schedule → "Çalışma bloğu ekle"; c-online → "Online Deneme Oluştur" → DevTools "Capture full size screenshot".
