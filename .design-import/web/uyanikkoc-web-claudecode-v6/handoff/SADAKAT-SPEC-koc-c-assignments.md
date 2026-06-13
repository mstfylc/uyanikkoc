# SADAKAT SPEC — Koç · Ödev & Görev (c-assignments)

Kaynak: `src/coach-pages.jsx → CoachAssignmentsPage` (+ `OdevAtaModal`, `SmartOdevModal`,
`CoachAssignmentRow`, `KaynakTracker`, `CoachSelfStudyPanel`). Rota: `c-assignments`.
Veri: `useRoster()`, `useOdevler()` (`uk_odevler_v1`). "bugün" = **2026-06-05**. Tam Türkçe.

## PageHead
- Başlık **`Ödev & Görev`** · alt **`Atadığın ödevler, kaynaklar ve öğrenci sonuçları`**
- Sağ aksiyonlar: **öğrenci select** (`Tüm öğrenciler` + roster) · **`Akıllı Ödev`** (bolt, `.btn-smart`) →
  `SmartOdevModal` · birincil **`Ödev Ata`** (plus) → `OdevAtaModal`.

## Bileşen sırası
1. **Hafta segmenti** (`.seg`, `WEEKS`): veri olmayan hafta pasif (opacity .4). Varsayılan `w0`.
2. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `clipboard`/primary · `{total}` · **`Atanan ödev`**
   2. `target`/success · `%{rate}` · **`Tamamlanma`**
   3. `chart`/info · sonuçlu · **`Sonuç girilen`**
   4. `alert`/danger · gecikmiş (due < 2026-06-05) · **`Gecikmiş`**
3. **`Section` — `Atanan Ödevler`** · alt **`{haftaAralığı} · {n} görev`** · sağda filtreler
   (`.filters`): **`Tümü`** · **`Bekleyen`** · **`Tamamlanan`** · **`Sonuçlu`**.
   - `CoachAssignmentRow` listesi; tamamlanan satırda **`Not gönder`** → `CoachNoteModal`.
   - Boş: **`Bu görünümde ödev yok. Konu Takibi sayfasından "Ödev Ata" ile ekleyebilirsin.`**
4. **Öğrenci seçili değilse** (`stu==="all"`): bilgi kartı **`Kaynak takibini ve ödev harici
   çalışmaları görmek için yukarıdan bir öğrenci seç.`**
   **Öğrenci seçiliyse:** `CoachSelfStudyPanel` + `KaynakTracker` (editable).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Ödev & Görev`, `Akıllı Ödev`, `Atanan Ödevler`, `Gecikmiş`.
- ❌ StatCard sırası/etiketleri; "Gecikmiş" eşiğini (2026-06-05) kaydırmak.
- ❌ Filtre seti (Tümü/Bekleyen/Tamamlanan/Sonuçlu) veya hafta segmenti pasiflik mantığını değiştirmek.
- ❌ Tüm-öğrenci vs tek-öğrenci görünüm ayrımını (kaynak takibi koşulu) kaldırmak.
- ❌ "Not gönder" (CoachNoteModal) köprüsünü atlamak.
