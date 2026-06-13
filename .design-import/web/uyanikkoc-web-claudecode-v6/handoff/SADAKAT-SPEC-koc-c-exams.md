# SADAKAT SPEC — Koç · Denemeler (c-exams)

Kaynak: `src/coach-pages2.jsx → CoachExamsPage` (+ `CoachDenemeManager`, `DenemeImportModal`,
`ManualExamModal`). Rota: `c-exams`. Veri: `useExams()`, `CAT_ORDER`, `CAT_COLOR`. Tam Türkçe.

## PageHead
- Başlık **`Denemeler`** · alt **`Deneme sonuçlarını içe aktar ve analiz et`**
- Sağ aksiyonlar: açık **`Manuel Giriş`** (notebook) → `ManualExamModal`; birincil
  **`Deneme İçe Aktar`** (plus) → `DenemeImportModal`.

## Bileşen sırası
1. **`CoachDenemeManager`** (varsa) — içe aktarılan deneme yönetimi.
2. **Boş durum** (hiç deneme yoksa): kart **`Henüz içe aktarılmış deneme yok`** +
   **`Yayınevinden gelen sonuç Excel'ini (.xlsx) yükleyerek tüm öğrencilerin sonuçlarını tek tıkla işle.`** +
   **`Excel Yükle`** butonu.
3. **Deneme varsa:**
   - Birden çok deneme varsa **`Deneme seç`** select.
   - **`.grid.g-4`** — 4 StatCard (sıra birebir):
     1. `users`/primary · katılan · **`Katılan öğrenci`**
     2. `target`/info · sınıf ort. net · **`Sınıf ortalaması (net)`**
     3. `award`/success · en yüksek net · **`En yüksek · {ad}`**
     4. `chart`/warning · en yüksek TYT puanı · **`En yüksek TYT puanı`**
   - **`Section` — `Ders Ortalamaları`** · alt **`{deneme} · {sınavTürü} · sınıf geneli`**:
     her ders satırı swatch + ad + `{ort} / {max}` + `Bar` (LGS/YKS'ye göre max değişir).
   - **`Section` — `Sıralı Sonuç Listesi`** · alt **`{deneme} · {n} öğrenci`** + arama
     (`Öğrenci / şube ara...`, `toLocaleLowerCase('tr-TR')`).

## Sıralı Sonuç tablosu (`.tbl`, min-width 720)
- Kolonlar: **`#`** · **`Öğrenci`** · **`Şube`** · her ders (`cats`, ortalı) · **`Net`** (sağ) · **`Puan`** (sağ).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Denemeler`, `Deneme İçe Aktar`, `Sınıf ortalaması (net)`.
- ❌ Boş durumdaki Excel yükleme yönergesini atlamak.
- ❌ StatCard sırası/etiketleri; ders max değerlerinin sınav türüne (LGS/YKS) göre değişmesini kaldırmak.
- ❌ Arama filtresinde düz `toLowerCase` (i/ı hatası).
