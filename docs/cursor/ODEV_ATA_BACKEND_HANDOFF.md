# Ödev Ata — Backend (Codex) yapılacaklar · web-v6.0

> UI tarafı (Cursor) `coach-odev-ata.jsx` modalını **birebir** port edecek. Bunun için backend'in
> aşağıdaki sözleşmeyi üretmesi/tüketmesi gerekiyor. Şu anki `POST /api/coach/assignments` yalnızca
> tek öğrenci + `title/description/type(homework…)/priority` kabul ediyor; prototip şekli **eksik**.
> Kaynak şekil: `data-contracts/assignments.json` + `kaynak/src/odev-store.jsx` + `coach-odev-ata.jsx`.

## 0. Sınır
- Sadece backend: `prisma/`, `app/api/coach/assignments/*`, `server/services/assignment.service.ts`, ilgili enum/migration.
- UI/TSX, ikon, stil = Cursor. NextAuth/CRM'e dokunma.

## 1. Enum: ODEV_TYPES (prototip türleri)
Mevcut `AssignmentType` (homework/exam_prep/reading/practice/other) prototiple uyumsuz. Prototip türleri:

| key | label | needsResult | not |
|---|---|---|---|
| `soru` | Soru Çözümü | true | birim: soru |
| `video` | Video İzleme | false | — |
| `konu` | Konu Çalışması | false | — |
| `test` | Deneme/Test | true | sabit soru (EXAM_SORU) |

Yap: assignment'a prototip türünü taşıyan alan ekle. Öneri (mevcut `type`'ı bozmadan):
- `odevType` : enum `soru|video|konu|test` (required)
- `odevTypes` : `string[]` (opsiyonel, çoklu tür — UI birden çok seçebilir)

Migration serbest (veri test düzeyinde, gerekirse reset+seed → `Demo Veri Tohumu (Seed) v1`).

## 2. assignment alanları (eklenecek/garanti edilecek)
`data-contracts/assignments.json → odev.fields` ile birebir:
- `subject` (string, required) — var
- `topic` (string, required) — **ekle** (şu an yok)
- `source` (string) — **ekle** (kaynak etiketi)
- `count` (int) — **ekle** (soru/test hedefi)
- `note` (string) — `description`'a map edilebilir ama ayrı `note` tercih
- `due` ('YYYY-MM-DD') — `dueDate` var, koru
- `week` (enum w0..w3, opsiyonel)
- `status` enum `pending|done` (prototip) — mevcut status map'i koru, UI'ya `pending/done` dön
- `result` `{ d:int, y:int, b:int } | null` — öğrenci sonuç girişi (ayrı PATCH)
- `assignedAt` (epoch ms)

## 3. POST /api/coach/assignments — TOPLU atama
UI tek istekte (öğrenci × konu) çarpımı kadar kayıt üretir. İstek gövdesi:

```jsonc
{
  "studentIds": ["stu_1", "stu_2"],      // 1+ öğrenci (toplu atama)
  "items": [
    {
      "subject": "Matematik",
      "topic": "Türev",
      "source": "Apotemi AYT Matematik Soru Bankası",
      "count": 40,
      "type": "soru",                     // birincil ODEV_TYPES
      "types": ["soru"],                  // çoklu tür
      "note": "Karma test, süreli çöz",
      "due": "2026-06-06"                 // opsiyonel
    }
  ]
}
```

Davranış: her `studentId × item` için bir assignment kaydı (prototip `addOdevler(records)` ile aynı).
Yanıt:

```jsonc
{ "created": 2, "assignments": [ /* oluşturulan kayıtlar, GET ile aynı şekil */ ] }
```

> Geriye dönük uyum: mevcut tekil `{ studentId, title, ... }` gövdesini kırma (eski çağrı varsa). Yeni
> `studentIds + items` yolu eklensin; ikisi de 200 dönsün.

## 4. GET /api/coach/assignments
Dönen her assignment yeni alanları içersin: `topic, source, count, odevType (type), odevTypes (types), note, due, status(pending|done), result, assignedAt`. Mevcut `assignments` anahtarı korunur.

## 5. Öğrenci kaynakları (kaynak seçici için)
UI kaynak popover'ı `GET /api/coach/students/{id}/sources` kullanıyor (mevcut). Dönüş `tracker.items[] = { name, status(beklemede|aktif|bitti), progress 0..100 }` olmalı (`KAYNAK_DURUM`). Bu uçta sapma varsa düzelt.

## 6. Sözleşme/şekil
- `useOdevler()/getOdevler()/addOdevler()/updateOdev()` imza ve dönüş **şekli** sabit (SOZLESME.md).
- Alan key'leri ASCII; görünen metin/label UI'da (Cursor) tam Türkçe.

## 7. Kabul kriteri
- [ ] POST toplu (studentIds[] × items[]) çalışır, `created` döner
- [ ] `odevType/odevTypes/topic/source/count/note/due` kaydedilir ve GET'te döner
- [ ] sources ucu `{name,status,progress}` döner
- [ ] test/typecheck geçer; `pnpm --filter @uyanik/web test:e2e` ödev akışı yeşil
