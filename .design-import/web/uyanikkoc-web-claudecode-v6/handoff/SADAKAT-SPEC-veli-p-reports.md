# SADAKAT SPEC — Veli · Gelişim Raporları (p-reports) — KISA

Kaynak: `src/reports.jsx → ParentReportsPage` (+ `ReportDetailModal`). Rota: `p-reports`.
Veri: `useReports()` (yalnızca `parent===me && status==="approved"`). Salt-okunur. Tam Türkçe.

- **PageHead:** başlık **`Gelişim Raporları`** · alt **`Koçun gönderdiği haftalık raporları görüntüle ve indir`**
- **Boş durum:** **`Henüz rapor gönderilmedi. Koçun haftalık raporu onayladığında burada görünecek.`**
- **Rapor varsa:** `Section` **`Haftalık Raporlar`** · alt **`{n} rapor`**:
  satır (`.lrow`, tıklanır → `ReportDetailModal`) = trend ikon (success) + **`{öğrenci} · {hafta}`** +
  `%{tamamlama} tamamlama` + net delta (ok) + tarih (`tr-TR`, gün+ay) + sağda chevron.
- **Liste satır yapısı:** ikon · başlık (öğrenci·hafta) · meta (tamamlama rozeti + net delta + tarih) · chevron.

## YAPMA
- ❌ ASCII: `Gelişim Raporları`, `Haftalık Raporlar`.
- ❌ Yalnızca onaylı raporları gösterme filtresini kaldırmak (veli sadece gönderilmiş raporu görür).
- ❌ Boş durum metnini atlamak; tarihi İngilizce locale ile yazmak.
