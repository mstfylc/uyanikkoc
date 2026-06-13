# exports/ — QA Ekran Görüntüleri

PNG'ler **yalnızca QA referansıdır** — doğruluk kaynağı `src/*.jsx` + `handoff/SADAKAT-SPEC-*.md`.
Eksik varyantlar (mobil, modaller, kalan dark) için: **`handoff/QA-CAPTURE-RECETESI.md`**.

## İçerik (rota PNG'leri — full sayfa)
**desktop-light (neredeyse tüm rotalar):**
- `coach/desktop-light/`: dashboard, students, c-topics, c-cizelge, c-assignments, c-exams, c-online, reports, revenue, tests
- `student/desktop-light/`: dashboard, schedule, topics, exams, mistakes, assignments, motivation, tests, messages, appointments, billing, support, settings, ai-coach
- `parent/desktop-light/`: dashboard, p-exams, p-reports, messages, appointments, billing

**desktop-dark (temsilî — dark token-sürücülü, layout değişmez):**
- `coach/desktop-dark/`: dashboard, c-topics · `student/desktop-dark/`: dashboard, mistakes · `parent/desktop-dark/`: dashboard

## ⚠️ Bu sette OLMAYANLAR (araç sınırı — reçeteyle alınır)
- **Modaller:** bu repo'daki tarayıcı-içi yakalama aracı (html-to-image) `createPortal` +
  `position:fixed` modalleri **render etmiyor** — açık modal yerine alttaki sayfayı yakalıyordu,
  o yüzden modal kareleri dahil edilmedi. Modalleri **gerçek Chrome DevTools** ile al (reçete §4):
  sayfaya boot et → tetikleyiciye tıkla → "Capture full size screenshot".
- **Mobil (390px):** medya sorguları gerçek viewport genişliğine bağlı; otomasyon önizlemesinde
  üretilemedi. DevTools **Device Toolbar** (Cmd/Ctrl+Shift+M, 390px) ile al (reçete §3).
  Kilit mobil ekranlar: Ana Sayfa, Ödevler, Yanlış Defteri, Denemeler (alt navigasyon görünür).
- **Kalan dark route'lar:** reçetedeki `ukGo(role,page,'dark')` ile dakikalar içinde tamamlanır.

## İsimlendirme
`exports/<rol>/<viewport>-<tema>/<route>.png` — örn. `exports/coach/desktop-light/c-topics.png`.

## Not (capture yöntemi)
Tüm kareler **boot-direct** yöntemiyle alındı (`ukGo` → reload → capture), böylece sidebar aktif
vurgusu + içerik + crumb tutarlı. Sayfa-içi gezinmeli yakalamada sidebar vurgusu bayatlayabilir;
kesin kare için her zaman boot-direct kullan (reçete §0).
