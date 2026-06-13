# Component Spec — Yanlış Defteri (Mistake Notebook)

> Kanonik kaynak: `src/yanlis-defteri.jsx`, `src/mistakes-store.jsx`
> Stiller: `src/styles.css` (`.yd-*`, `.hf-*` sınıfları — satır ~1180–1270)
> Öğrenci rotası: `mistakes` (menü etiketi "Yanlış Defteri", `tag:"Yeni"`)
> Store anahtarı: `localStorage uk_mistakes_v1`

---

## 1. `YanlisDefteriPage` (öğrenci ana sayfa)
Dikey stack (`.stack.rise`), sıra:
1. **PageHead** — title "Yanlış Defteri", sub "Hatalarını kaydet, sistem unutturmadan tekrar ettirsin", sağ aksiyon: **`btn btn-primary`** → "Yanlış ekle" (icon `plus`).
2. **Özet şeridi** `.yd-summary` — 4 adet `.yd-sum` kutusu, her biri `stat-icon tone-<x>` (40×40) + büyük sayı (`.v.tnum`) + etiket (`.l`):
   - `alert` / danger → **Toplam yanlış** (`all.length`)
   - `clock` / warning → **Açık · takipte** (`status !== "kapandi"`)
   - `checkCircle` / success → **Kapandı · sıfır hata** (`status === "kapandi"`)
   - `ai` / info → **Bugün tekrar** (`dueMistakes().length`)
3. **`ZeroErrorLoop`** (bkz. zero-error-loop.md)
4. **`HataFrekansiCard`** role="student" (bkz. hata-frekansi.md)
5. **Section "Tüm Yanlışlar"** — sub `${shown.length} kayıt`. Card-body içinde:
   - **Toolbar** `.yd-toolbar` — 3 adet `select` (height 34, font 12.5): Ders / Hata tipi / Durum filtreleri ("Tüm …" default).
   - Boşsa: ortalı muted metin "Bu filtrede yanlış yok."
   - Doluysa: `MistakeRow` listesi.
6. `MistakeAddModal` (kapalı; "Yanlış ekle" açar).

## 2. `MistakeRow`
Layout: `.yd-item > .yd-irow` (flex):
- **Thumbnail** (`.yd-thumb`, ~44px kare): foto varsa `<img>` (tıklayınca tam ekran lightbox modal-overlay), yoksa placeholder `.ph` — arka `color-mix(in srgb, <ders rengi> 12%, transparent)`, ikon `alert`, renk = ders rengi.
- **Orta**: başlık `.yd-ititle` (ders renk noktası `.sw` + konu + muted alt konu), meta `.yd-imeta` (hata tipi badge `badge-<tone>` + ders + kaynak + soru türü), varsa not `.yd-inote`.
- **Sağ** `.yd-iright`: durum badge (`TEKRAR_DURUM`), `MistakeStageDots` (4 nokta), sil butonu (`mini-btn danger`, 45° döndürülmüş plus ikonu = ×).

## 3. `MistakeAddModal` (öğrenci — yanlış ekle)
- Portal modal, `max-width: 560`. Head: `lr-icon` 38×38 `danger-soft`/`danger` + `alert` ikon, başlık "Yanlış ekle", alt "Hatayı kaydet — sistem tekrarını otomatik açar".
- Gövde alanları (sırayla):
  1. `.yd-frow` (2 kolon): **Ders** select (müfredattan) · **Konu** select ("Konu seç…" + ders konuları).
  2. `.yd-frow`: **Alt konu** input (ör. "Yaş problemi") · **Soru türü** select (`SORU_TURU`).
  3. **Hata tipi** — `.yd-types` içinde 6 toggle buton (`HATA_TIPI`): seçili olan border+renk = `var(--<tone>)`.
  4. **Kaynak (bağımsız)** — `input` + `datalist` (öğrenci kaynakları).
  5. **Çözüm notu** — textarea (min-height 64).
  6. **Fotoğraf (opsiyonel)** — yoksa `.yd-photo-add` (dropzone), varsa `.yd-photo` önizleme + kaldır. Foto `misResizeImage(file, 520, …)` ile ~520px'e küçültülür → dataURL.
- Foot: sol muted "Tekrar takvimi: 1 → 3 → 7 → 21 gün"; sağ `btn-ghost` Vazgeç + `btn-primary` "Deftere ekle" (disabled: `!subject || !topic`).
- Kayıt: `addMistake({...})` → toast "Yanlış deftere eklendi · 1 gün sonra tekrar".

## 4. `MistakeBatchModal` (toplu ekleme — ödev/deneme beslemesi)
- Portal modal `max-width: 540`. Props: `student`, `source`, `slots[]` (`{subject, topic, qType}`).
- **Bulk şeridi** `.yd-batch-bulk`: "Hepsine uygula:" + 6 hata-tipi toggle (`.short` etiketi).
- **Liste** `.yd-batch-list`: her satır `.yd-batch-row` — checkbox (`chk sm`, dahil/hariç), ders renk noktası, konu+ders, satır-bazlı hata tipi select. `off` class dahil edilmeyende.
- Foot: sol muted (kaynak adı ya da "1 → 3 → 7 → 21 gün tekrar açılır"); sağ `btn-primary` "{N} yanlışı ekle" (disabled: seçili 0).
- Kayıt: seçili satırlar için `addMistake(...)` → toast "{N} yanlış deftere eklendi · tekrar takvimi açıldı".

## 5. `CoachMistakesCard` (koç görünümü — Konu Takibi'nde mount)
- Section "Öğrencinin Yanlış Defteri", sub "Açık yanlışlar — konuya göre doğrudan ödev atayabilirsin".
- Sağ aksiyon: `Badge danger` "{açık} açık" + (varsa) `Badge warning` "{N} tekrar bekliyor".
- Açık yanlışları `subject::topic` ile gruplar; her grup satırı `.yd-due`: ders renk noktası, başlık (konu·ders), meta (baskın hata tipi badge + "{n} yanlış" + alt konular), sağda **`btn btn-light btn-sm`** "Ödev ata" → `onAssign(subject, topic)`.
- Boş: "Bu öğrenci henüz yanlış eklemedi."

## 6. `MistakeStageDots`
`.yd-dots` içinde `MIS_INTERVALS.length` (=4) nokta; `i < stage` olanlar `.on`. Title: `{stage}/4 tekrar tamam`.

---
### Veri & enum referansı
`HATA_TIPI` (6): bilgi/islem/sure/dikkat/yorum/unutma — bkz. data-contracts/mistakes.json
`SORU_TURU` (5): yeninesil/klasik/islem/yorum/grafik
`TEKRAR_DURUM` (3): acik(warning)/tekrar(info)/kapandi(success)
`MIS_INTERVALS = [1,3,7,21]` gün — spaced repetition.
Demo "bugün" sabiti: `MIS_TODAY = 2026-06-05`.
