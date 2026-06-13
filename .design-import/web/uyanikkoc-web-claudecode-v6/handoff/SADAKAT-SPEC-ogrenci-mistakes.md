# SADAKAT SPEC — Öğrenci · Yanlış Defteri (mistakes)

Kaynak: `src/yanlis-defteri.jsx → YanlisDefteriPage` (+ `ZeroErrorLoop`, `HataFrekansiCard`,
`MistakeRow`, `MistakeAddModal`). Rota: `mistakes` (menüde "Yeni" etiketi). `localStorage: uk_mistakes_v1`.

## PageHead
- Başlık **`Yanlış Defteri`** · alt **`Hatalarını kaydet, sistem unutturmadan tekrar ettirsin`**
- Sağ aksiyon: birincil **`Yanlış ekle`** (plus) → `MistakeAddModal`.

## Bileşen sırası
1. **Özet şeridi `.yd-summary`** — 4 kutu (`.yd-sum`, ikon + büyük sayı + etiket), sıra birebir:
   1. `alert`/danger · `{all.length}` · **`Toplam yanlış`**
   2. `clock`/warning · açık sayısı · **`Açık · takipte`**
   3. `checkCircle`/success · kapanan · **`Kapandı · sıfır hata`**
   4. `ai`/info · bugün tekrar · **`Bugün tekrar`**
2. **`ZeroErrorLoop`** — `Section` **`Sıfır Hata Döngüsü`**:
   - Tekrar varsa alt: **`Bugün tekrar edilecekler — bitirince bir sonraki aralığa geçer`** +
     sağda `Badge` warning **`{n} tekrar`** + odak tekrar tetikleyici.
   - Boşsa alt: **`1 → 3 → 7 → 21 gün otomatik tekrar takvimi`** + **`Bugün tekrar edilecek
     yanlış yok — döngü temiz.`** (`.yd-clear`, checkCircle).
   - Liste ilk 5 kayıt; "tümünü gör" ile açılır. Aralıklar `MIS_INTERVALS = [1,3,7,21]`.
3. **`HataFrekansiCard` role="student"** — `Section` **`Hata Frekansı`** ·
   alt **`Son 14 günde hangi tür hatayı daha çok yapıyorsun`** · sağda `Badge` primary **`{total}`**.
   Boşsa: **`Henüz yanlış eklenmedi…`** mesajı. Hata tipleri `HATA_TIPI`: bilgi/işlem/süre/dikkat/yorum/unutma.
4. **`Section` — `Tüm Yanlışlar`** · alt **`{n} kayıt`**:
   - `.yd-toolbar` 3 filtre select: **`Tüm dersler`** · **`Tüm hata tipleri`** · **`Tüm durumlar`**.
   - `MistakeRow` listesi; boşsa **`Bu filtrede yanlış yok.`**
   - Durumlar `TEKRAR_DURUM`: açık / tekrar / kapandı.

## MistakeAddModal (`Yanlış ekle`)
Alanlar: ders · konu/alt konu · **hata tipi** (HATA_TIPI) · kaynak + **soru türü**
(`yeninesil/klasik/işlem/yorum/grafik`) · not · **fotoğraf** (~520px'e küçültülüp dataURL).
Kaydedince yeni yanlış `status="acik"`, döngü `stage=0`, `nextDue` = +1 gün.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Yanlis Defteri`, `Sifir Hata Dongusu`, `Hata Frekansi`.
- ❌ Özet şeridini StatCard grid'ine çevirmek — `.yd-summary` 4 kutu düzeni.
- ❌ Sıfır Hata Döngüsü aralıklarını değiştirmek (1→3→7→21).
- ❌ Sıralamayı bozmak: özet → döngü → frekans → tüm yanlışlar.
- ❌ Fotoğrafı orijinal boyutta saklamak (cihazda ~520px dataURL; backend'de S3+URL).
