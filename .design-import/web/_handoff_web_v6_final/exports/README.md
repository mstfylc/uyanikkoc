# PNG Exports — Kapsam & Yöntem

> Bu klasördeki PNG'ler, kanonik prototip (`indir/uyanikkoc-web-source-v5/`) canlı çalıştırılarak yakalanan **gerçek ekran referanslarıdır**. Görsel parite için birincil doğruluk kaynağı yine prototip kodu + `tokens/` + `components/` spec'leridir; PNG'ler görsel hedef/QA referansıdır.

## Yakalama koşulları
- Veri: prototip seed (Elif Yıldız / Dilek Emen / Ayşe Yıldız), "bugün" sabiti 2026-06-05.
- Yakalama genişliği: ~909px (kompakt masaüstü). Bu genişlikte topbar arama gizli, `.g-4` 2 kolon.
- Her sayfa üstten (above-the-fold) çerçevedir; sayfanın tamamı için prototipi açın ve kaydırın.

## Kapsam (mevcut)
| Rol | desktop-light | desktop-dark |
|---|---|---|
| **student** | dashboard, mistakes, exams, assignments, topics, messages | aynı |
| **coach** | dashboard, c-assignments, students, messages, reports | aynı |
| **parent** | dashboard, p-exams, messages | aynı |

- `exams` → Net Kaybı Haritası dahil. `dashboard (student)` → Takvimim. `dashboard (parent)` → içgörü kartları. `mistakes` → Yanlış Defteri + Sıfır Hata + Hata Frekansı. `c-assignments` → Akıllı Ödev butonu görünür.

## ⚠️ Bilinen yakalama artefaktı (içeriği etkilemez)
- **Topbar rol segmenti (Öğrenci/Koç/Veli) aktif "pill"'i bu otomatik PNG'lerde yanlış görünebilir** (çoğunlukla "Koç" vurgulu). Bu bir **yakalama aracı artefaktıdır** (sticky topbar'daki dinamik `.on` sınıfı doğru serileştirilmiyor). **Canlı prototip + spec doğrudur:** aktif rol = o anki role göre vurgulanır (`components/states-nav-modal-form-table.md` · `.seg button.on`). Codex bu artefaktı KOPYALAMAMALI. Sayfa içeriği/düzeni/renkleri PNG'lerde doğrudur; yalnız bu küçük topbar rozeti güvenilmezdir.

## EKSİK / yakalanamayan (ortam kısıtı — bkz. ../RISKS_AND_GAPS.md)
1. **mobile-light / mobile-dark:** Yakalama ortamının görünüm penceresi sabit (~924px) ve ≤880px mobil kırılımına indirilemiyor. Mobil çerçeveler **bu ortamda üretilemedi**.
2. **Modallar** (SmartOdevModal, MistakeAddModal, MistakeBatchModal, ZeroErrorReview, CoachNoteModal, GroupModal): Yakalama aracı `position:fixed` portal overlay'leri serileştiremiyor — modal PNG'leri üretilemedi. (Hepsi `components/*` içinde tam specli.)
3. **coach/c-topics (CoachKonuPage):** Sayfa canlıda sorunsuz; ancak yakalama aracı bu ağır DOM'u serileştiremedi. (Spec: `components/net-gain-map.md`, `yanlis-defteri.md`, flow 05.)

## Bu eksikleri YENİDEN ÜRETME (gerçek tarayıcı — pixel-perfect)
1. `indir/uyanikkoc-web-source-v5/uyanik-koc-dashboard.html` dosyasını Chrome'da aç.
2. Giriş: rol seç (Öğrenci/Koç/Veli) → "Giriş Yap".
3. **Mobil:** DevTools → Device Toolbar → 390×844 (veya iPhone/Pixel preset). Tema: topbar ay/güneş ikonu.
4. Her rota + modal için tam-sayfa ekran görüntüsü (DevTools "Capture full size screenshot").
5. İsimlendirme: `exports/<rol>/<viewport>-<tema>/<route>.png` düzenini koru.
