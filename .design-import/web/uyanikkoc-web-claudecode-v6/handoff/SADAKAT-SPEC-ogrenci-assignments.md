# SADAKAT SPEC — Öğrenci · Ödevlerim (assignments)

Kaynak: `src/student-extra.jsx → AssignmentsPage`. Rota: `assignments` (menüde count rozeti 4).
Veri: `useOdevler()` (store, `uk_odevler_v1`). "bugün" referansı = **2026-06-05**. Tam Türkçe.

## PageHead
- Başlık **`Ödevlerim`** · alt **`Koçunun atadığı görevler — sonucunu gir, takip et`**
- Sağ aksiyon: segment (`.seg`, role=tablist) — **`Liste`** (clipboard) | **`Günlük plan`** (checkCircle) |
  **`Takvim`** (calendar). **Varsayılan görünüm = `Günlük plan` ("gunluk")**.

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `clipboard`/primary · toplam · **`Toplam görev`**
   2. `checkCircle`/success · tamamlanan · **`Tamamlanan`**
   3. `clock`/warning · bekleyen · **`Bekleyen`**
   4. `alert`/danger · gecikmiş (due < 2026-06-05) · **`Gecikmiş`**
2. **Seçili görünüm**:
   - `gunluk` → `OdevDailyPlan` (günlük plan; varsayılan)
   - `liste` → `StudentOdevList`
   - `takvim` → `OdevCalendar`
3. **`KaynakTracker student={me} editable defaultExam="Tümü"`** (tam genişlik, kaynak takibi).

## Durumlar
- Ödev durumları: bekliyor / tamamlandı; gecikmiş = tamamlanmamış + son tarih geçmiş.
- Sonuç girince (D/Y/B) yanlış varsa **`MistakeBatchModal`** açılır (toplu yanlış → defter).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Odevlerim`, `Gunluk plan`, `Gecikmis`.
- ❌ Varsayılanı `Liste` yapmak — varsayılan **Günlük plan**.
- ❌ StatCard sırası/etiketlerini değiştirmek; "Gecikmiş" eşiğini (2026-06-05) kaydırmak.
- ❌ KaynakTracker'ı sayfadan çıkarmak.
- ❌ Sonuç girişinde yanlış→defter köprüsünü (MistakeBatchModal) atlamak.
