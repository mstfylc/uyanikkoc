# SADAKAT SPEC — Veli · Deneme Sonuçları (p-exams)

Kaynak: `src/parent.jsx → VeliDenemelerPage`. Rota: `p-exams`. Veri: `useExams()`, `CAT_ORDER`,
`CAT_COLOR`. `CHILD = "Elif Yıldız"`. Salt-okunur. Tam Türkçe.

## Boş durum
- Hiç deneme yoksa: PageHead **`Deneme Sonuçları`** · alt = çocuk adı + kart
  **`Henüz açıklanmış deneme sonucu yok.`**

## Deneme varsa
- **PageHead:** başlık **`Deneme Sonuçları`** · alt **`{çocuk} · {deneme}`**
- **`.grid.g-4`** — 4 StatCard (sıra birebir):
  1. `chart`/primary · toplam net · **`Toplam net`**
  2. `award`/success · puan · **`Puan`**
  3. `trend`/info · sıralama (`toLocaleString('tr-TR')`) · **`Sıralama`**
  4. `users`/warning · katılan · **`Katılan`**
- **`Section` — `Ders Bazında Net`** · alt **`Çocuğunuzun bu denemedeki dağılımı`**:
  her ders swatch + ad + `{net} / {max}` + `Bar` (max sınav türüne göre: LGS 20/10, YKS 40/20).
- **`Section` — `Tüm Denemeler`** · alt **`Çocuğunuzun içe aktarılan denemelerdeki ilerlemesi`** ·
  sağda `Badge` **`{n} deneme`** → `ExamHistoryList`.

## YAPMA
- ❌ ASCII: `Deneme Sonuçları`, `Ders Bazında Net`, `Sıralama`.
- ❌ StatCard sırası/etiketleri; sıralamayı `tr-TR` yerine düz sayı yazmak.
- ❌ Boş durum metnini atlamak; ders max değerinin sınav türüne göre değişmesini kaldırmak.
