# Component Spec — Sıfır Hata Döngüsü (ZeroErrorLoop + ZeroErrorReview)

> Kaynak: `src/yanlis-defteri.jsx` (`ZeroErrorLoop`, `ZeroErrorReview`), store: `src/mistakes-store.jsx` (`dueMistakes`, `reviewMistake`, `MIS_INTERVALS`)
> Stiller: `.yd-due`, `.yd-dmain`, `.yd-dtitle`, `.yd-dmeta`, `.yd-due-btn`, `.yd-more`, `.yd-rev-*`, `.yd-clear` (`src/styles.css`)
> Mount: Öğrenci Yanlış Defteri (YanlisDefteriPage).

## Konsept
Spaced repetition: `MIS_INTERVALS = [1, 3, 7, 21]` gün. Her "Tekrar ettim" yanlışı bir sonraki aralığa taşır (`stage++`). Son aralık (21 gün) sonrası `status="kapandi"` (sıfır hata). `nextDue` = createdAt/son-tekrar + sıradaki aralık.

## `ZeroErrorLoop`
`Section`:
- **title** "Sıfır Hata Döngüsü"
- **Boşken sub** "1 → 3 → 7 → 21 gün otomatik tekrar takvimi"; **doluyken sub** "Bugün tekrar edilecekler — bitirince bir sonraki aralığa geçer".
- **action (doluyken):** `Badge warning` clock "{N} tekrar" + **`btn btn-primary btn-sm`** icon `ai` "Odak tekrar" → `ZeroErrorReview` açar (snapshot = o anki due listesi).

Body:
- **Boş** (`dueMistakes()` boş): `.yd-clear` — checkCircle ikon + "Bugün tekrar edilecek yanlış yok — döngü temiz."
- **Dolu:** ilk 5 `.yd-due` satırı (ders renk noktası `.sw`, başlık konu·ders·altkonu, meta = hata tipi badge + `MistakeStageDots` + "{aralık}. gün tekrarı"), sağda **`btn btn-light btn-sm yd-due-btn`** "Tekrar ettim" → `reviewMistake(id)`. Tekrar sonrası toast: son aralıksa "{konu} · kapandı 🎯 sıfır hata!" yoksa "{konu} tekrar edildi".
- 5'ten fazlaysa `.yd-more` → "+{N-5} tekrar daha göster" / "Daha az göster".

## `ZeroErrorReview` (Odak Tekrar — kart kart modal)
- Portal modal `max-width: 520`. Head: `lr-icon` 38 primary-soft + `ai` ikon, başlık "Odak Tekrar", alt: bitti değilse "{idx+1} / {N} · sıfır hata döngüsü", bittiyse "Tamamlandı".
- **Üst ilerleme** `.yd-rev-prog` (dolum = `idx/list.length`).
- **Kart gövdesi (her yanlış):**
  - rozet satırı: ders adı (renk swatch), hata tipi badge, soru türü `badge-muted`.
  - `.yd-rev-topic` — konu (+ muted alt konu).
  - foto varsa `.yd-rev-photo`.
  - not varsa `.yd-rev-note` ("Çözüm notun"), yoksa `.empty` — "Bu yanlışta not yok — doğru çözümü zihninden geçir, sonra işaretle."
  - alt satır: `MistakeStageDots` + "{aralık}. gün tekrarı" (veya "son tekrar") · kaynak.
  - Foot: `btn-ghost` **Atla** (idx++ yalnız) · `btn-primary` **Tekrar ettim** (`reviewMistake` + idx++).
- **Bitiş ekranı:** ortalı success `lr-icon` 60 + "Tekrar turu bitti 🎯" + "{reviewed} yanlışı tekrar ettin. Bir sonraki aralıkta sistem otomatik hatırlatacak." + `btn-primary` Kapat.

## `dueMistakes(student)`
`status !== "kapandi"` ve `nextDue <= bugün` olanlar; `nextDue` artan sıralı.

## Backend notu
`nextDue` ve kapanma sunucuda hesaplanmalı; push hatırlatma (cron/queue). Prototipte istemci tarafı.
