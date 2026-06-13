# exports/ — QA Ekran Görüntüleri (curated set)

PNG'ler **yalnızca QA referansıdır** — doğruluk kaynağı `src/*.jsx` + `handoff/SADAKAT-SPEC-*.md`.
Tam matris (light/dark × desktop/mobile + tüm modaller) için: **`handoff/QA-CAPTURE-RECETESI.md`**.

## İçindeki set (desktop · light)
- **coach/desktop-light/**: dashboard · students yok* · c-topics · c-cizelge · c-assignments · c-exams · reports
- **student/desktop-light/**: dashboard · schedule · topics · exams · mistakes · assignments
- **parent/desktop-light/**: dashboard · p-exams · p-reports

\* Bu set "en yüksek değerli + sapma riskli" ekranları kapsar (dashboard'lar, veri-yoğun ekranlar).
Kalan rotalar, **dark** ve **mobile (390px)** kareleri reçetedeki boot-direct + DevTools yöntemiyle
dakikalar içinde üretilir (kullanıcı talebine göre tamamlanır).

## İsimlendirme
`exports/<rol>/<viewport>-<tema>/<route>.png` — örn. `exports/coach/desktop-light/c-topics.png`.

## ⚠️ Bilinen artefakt
Bazı karelerde **sidebar aktif vurgusu** içerikle anlık uyuşmayabilir (tarayıcı-içi yakalama
zamanlaması; canlı uygulama doğru çalışır — crumb + içerik doğrudur). Kesin kare için reçetedeki
**boot-direct** yöntemini kullan: `ukGo(role,page,theme)` → reload → DevTools "Capture full size screenshot".
