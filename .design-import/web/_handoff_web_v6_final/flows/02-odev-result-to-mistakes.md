# Flow — Ödev Sonucu → Yanlış Defteri Beslemesi

> Rol: **öğrenci** · Rota: `assignments` → Sonuç modalı · Store: `uk_odevler_v1` + `uk_mistakes_v1`
> Kaynak: `odev-student.jsx · OdevResultModal`, `yanlis-defteri.jsx · MistakeBatchModal`

## Adımlar
1. Öğrenci bekleyen ödevde **"Sonuç Gir"** → `OdevResultModal` (sadece `needsResult` türlerde: soru/test).
2. Doğru / Yanlış / Boş girilir; canlı **net** = `d − y/4`.
3. **"Sonucu Kaydet"** → `updateOdev(id, { status:"done", result:{d,y,b} })` + toast "Sonuç kaydedildi · net {…}".
4. **Koşul:** `needs && y > 0` ise → **`MistakeBatchModal` otomatik açılır**.
   - `batchSlots = min(y, 12)` adet `{ subject: ödev.subject, topic: ödev.topic, qType:"klasik" }`.
   - `source = ödev.source`.
5. Toplu modalda öğrenci her yanlışa hata tipi seçer (bulk "Hepsine uygula" + satır bazlı), istemediğini checkbox ile hariç bırakır.
6. **"{N} yanlışı ekle"** → her satır `addMistake({...})` → toast "{N} yanlış deftere eklendi · tekrar takvimi açıldı" → modal kapanır → ödev modalı da kapanır.
7. `y === 0` ise: batch açılmaz, "Kaydedildi" gösterip 900ms sonra kapanır.

## Durumlar
- **empty (y=0):** beslemе tetiklenmez.
- **cap:** 12'den fazla yanlış olsa bile en fazla 12 slot üretilir (prototip kısıtı — backend'de tümü desteklenebilir).
- Eklenen yanlışlar **aynı ders+konu** ile gelir; alt konu boş; öğrenci defterde düzenleyebilir.

## Backend
Ödev sonucu kaydı `assignments.result`; toplu yanlış `mistakes` tablosuna batch insert; kaynak ve qType taşınır.
