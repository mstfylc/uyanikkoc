# exports/yonetim/ — QA Ekran Görüntüleri (Yönetim Paneli)

PNG'ler **yalnızca QA referansıdır** — doğruluk kaynağı `admin/*.jsx` + `handoff/SADAKAT-SPEC-*.md`.
Tam matris (mobil, modaller, kalan dark) için: **`handoff/QA-CAPTURE-RECETESI.md`**.

## İçerik (full-sayfa, boot-direct ile alındı)
**desktop-light (tüm rotalar, 3 mod):**
- Süper Admin: genel · kurumlar · lisanslar · koclar · gelir · raporlar · talepler · kampanyalar ·
  lisans-turleri · moduller · destek · ayarlar
- Kurum: k-dashboard · k-koclar · k-ogrenciler · k-subeler · k-lisans · k-gelir · k-paketler ·
  k-raporlar · k-yoneticiler · k-ayarlar
- Bireysel Koç: bk-lisans · bk-feedback · bk-planlar · bk-paketler · bk-faturalar

**desktop-dark (temsilî — dark token-sürücülü, layout değişmez):**
genel · kurumlar · k-dashboard · bk-lisans

## İsimlendirme
`exports/yonetim/<viewport>-<tema>/<route>.png` — örn. `exports/yonetim/desktop-light/kurumlar.png`.

## ⚠️ Bu sette OLMAYANLAR (araç sınırı — reçeteyle alınır)
- **Detay sayfaları** (kurum-detay/koc-detay/k-coach-detay/k-student-detay): bir karttan/satırdan
  drill-in ile açılır; reçetedeki boot + tıklama ile al.
- **Modaller** (Yeni kurum, plan editör, davet, checkout...): tarayıcı-içi html-to-image portal+fixed
  modalleri yakalayamaz → **gerçek Chrome DevTools** ile al (reçete §6).
- **Mobil (390px)** ve **kalan dark route'lar:** DevTools Device Toolbar + `ukAdminGo(mode,page,'dark')` (reçete §0–3).

## Not (yöntem)
Tüm kareler **boot-direct** (`ukAdminGo`) veya aynı mod içinde sidebar gezinmesiyle alındı; sidebar
aktif vurgusu + içerik tutarlı. Kesin kare için her zaman boot-direct kullan.
