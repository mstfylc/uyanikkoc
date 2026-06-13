# SADAKAT SPEC — Koç · Öğrencilerim (students)

Kaynak: `src/coach.jsx → CoachStudentsPage` (+ `AddStudentModal`, `MotivationSendModal`, `StudentsTable`).
Rota: `students`. Veri: `useRoster()`. Tam Türkçe.

## PageHead
- Başlık **`Öğrencilerim`** · alt **`Takip ettiğin tüm öğrenciler`**
- Sağ aksiyonlar: açık **`Motivasyon Gönder`** (heart) → `MotivationSendModal`;
  birincil **`Öğrenci ekle`** (plus) → `AddStudentModal`.

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `users`/primary · `{roster.length}` · **`Aktif öğrenci`**
   2. `target`/success · `%{avg}` · **`Ortalama tamamlama`**
   3. `alert`/danger · risk altı sayısı · **`Risk altında`**
   4. `star`/warning · mükemmel sayısı · **`Mükemmel`**
2. **`StudentsTable`** — tam öğrenci tablosu (kolonlar: öğrenci/tamamlama/durum/risk/işlem).

## AddStudentModal (`Öğrenci Ekle`)
- Başlık **`Öğrenci Ekle`** · alt **`Listene yeni öğrenci ekle`**.
- Alanlar: **`Ad Soyad`** (autofocus, ≥3 karakter) · `.grid.g-2` **`Sınıf`** (9–12/Mezun) + **`Alan`**
  (Sayısal/Eşit Ağırlık/Sözel/Dil) · `.grid.g-2` **`Şube (ops.)`** + **`Okul No (ops.)`** · **`Hedef (ops.)`**.
- Footer: **`Vazgeç`** / **`Öğrenci Ekle`**; eklenince toast kartı **`Öğrenci eklendi`** / **`Listene başarıyla eklendi`**.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Öğrencilerim`, `Öğrenci ekle`, `Mükemmel`.
- ❌ StatCard sırası/etiketleri; "Motivasyon Gönder" + "Öğrenci ekle" ikili aksiyonunu azaltmak.
- ❌ Alan seçeneklerini (Sayısal/Eşit Ağırlık/Sözel/Dil) veya sınıf listesini değiştirmek.
