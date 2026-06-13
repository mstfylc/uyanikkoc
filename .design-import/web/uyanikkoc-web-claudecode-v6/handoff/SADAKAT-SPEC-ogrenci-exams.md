# SADAKAT SPEC — Öğrenci · Denemeler (exams)

Kaynak: `src/student-pages.jsx → ExamsPage`. Rota: `exams`.
Veri: `EXAM_HISTORY`. Modaller: `ManualExamModal`, `DenemeKayitModal`. Tam Türkçe.

## PageHead
- Başlık **`Denemeler`** · alt **`Deneme sonuçların ve net analizin`**
- Sağ aksiyonlar: açık buton **`Denemeye kayıt ol`** (calendar) → `DenemeKayitModal`;
  birincil **`Sonuç gir`** (plus) → `ManualExamModal`.

## Sekmeler (`.seg`)
**`Sonuçlar`** (chart) | **`Analiz`** (target) | **`Online Deneme`** (notebook) — varsayılan `Sonuçlar`.
- `Analiz` → `StudentImportedAnalysis`; `Online Deneme` → `StudentOnlineExams`.
- Her sekmenin ÜSTÜNDE her zaman **`NetGainMap role="student"`** (Net Kaybı Haritası) render edilir.

## Sonuçlar sekmesi
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `chart`/primary · `{EXAM_HISTORY.length}` · **`Toplam deneme`**
   2. `target`/info · `{avg}` (ortalama net) · **`Ortalama net`**
   3. `award`/success · `{best}` · **`En yüksek net`**
   4. `trend`/warning · `{exam.rank}` · **`Sıralama tahmini`**
2. **`Section` — `Net Gelişimi`** · alt **`Son denemelerdeki TYT netlerin`** ·
   sağda `Badge` success **`+{Δ} net`** → `Sparkline` (primary, h 84).
3. **`.grid.col-main`**:
   - SOL `Section` **`Deneme Geçmişi`** · alt **`{n} sonuç`**: her satır seçilebilir `.lrow`
     (chart ikon, ad, tip badge + yayıncı + tarih, sağda büyük net + delta ok yukarı/aşağı).
     Seçili satır primary kenar + ring.
   - SAĞ `Section` **`Net Dağılımı`** · alt = seçili deneme adı · sağda `Badge` **`{net} net`**:
     her bölüm (`exam.parts`) için isim + `net / max`, `Bar`, ve `✓ {c} doğru · ✕ {w} yanlış · ○ {b} boş`.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Denemeler`, `Sonuc gir`, `Sıralama tahmini`.
- ❌ NetGainMap'i kaldırmak — her sekmenin üstünde durur.
- ❌ StatCard sırası/etiketlerini değiştirmek.
- ❌ Deneme Geçmişi'nde seçili satır vurgusunu (primary kenar + ring) atlamak.
- ❌ Net Dağılımı'nda doğru/yanlış/boş üçlü göstergesini eksik bırakmak.
