# Flow — Deneme Analizi → Yanlış Defteri Beslemesi

> Rol: **öğrenci** · Rota: `exams` (deneme analiz detayı) · Store: `uk_mistakes_v1`
> Kaynak: `student-exam-analiz.jsx`, `yanlis-defteri.jsx · MistakeBatchModal`

## Bağlam
Deneme analiz detayında **"Öncelikli Konular"** Section'ı; zayıf derslerden + müfredattan otomatik belirlenen, kayıp-puan sıralı konu listesi (1./2./3. öncelik tier'ları, her satır D/Y/Net/Başarı tablosu).

## Adımlar
1. "Öncelikli Konular" başlık aksiyonunda — **yalnız `pri.some(p => p.y > 0)` ise** — **"Yanlışları deftere ekle"** (`btn-light btn-sm`, icon `alert`) görünür.
2. Tıklama → `MistakeBatchModal` açılır:
   - `slots = pri.filter(p => p.y > 0).slice(0, 14)` → `{ subject: findCurrKey(ders) || ders, topic: konu, qType:"klasik" }`.
   - `source = exam.name` (deneme adı).
3. Öğrenci her konuya hata tipi atar (bulk + satır), istemediğini hariç bırakır.
4. **Ekle** → her satır `addMistake({...})` (kaynak = deneme adı) → toast "{N} yanlış deftere eklendi · tekrar takvimi açıldı".

## Durumlar
- **CTA gizli:** hiçbir öncelikli konuda yanlış yoksa (`y=0`) buton görünmez.
- **cap:** en fazla 14 öncelikli konu slot'u.
- Eklenen yanlışlar deftere `acik` durumda, 1 gün sonra ilk tekrarla girer.

## Backend
Deneme analizi sunucu hesaplı (kayıp puan, öncelik tier'ları); seçilen yanlışlar `mistakes`'a batch insert; `source` = sınav adı.
