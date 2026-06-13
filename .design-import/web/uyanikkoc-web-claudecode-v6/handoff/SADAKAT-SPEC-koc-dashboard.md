# SADAKAT SPEC — Koç · Dashboard

Kaynak: `src/coach.jsx → CoachDashboard`. Rota: `dashboard`. Veri: `COACH`, `StudentsTable`,
`CoachTasks`, `WeeklyCompletion`, `ActivityFeed`. Tam Türkçe.

## Bileşen sırası (yukarıdan aşağıya)
1. **`.grid.g-4`** — 4 StatCard (sıra birebir, delta dahil):
   1. `users`/primary · `{COACH.students}` · **`Toplam öğrenci`** · delta **`+2 bu ay`** ↑
   2. `target`/success · `%{avgCompletion}` · **`Ortalama tamamlama`** · **`+5%`** ↑
   3. `alert`/danger · `{atRisk}` · **`Risk altındaki öğrenci`** · **`+1`** ↓
   4. `clipboard`/warning · `{pendingReview}` · **`Bekleyen inceleme`** · **`3 bugün`** (flat)
2. **`.grid.col-main`** → `[StudentsTable] [CoachTasks]`
3. **`.grid.col-main`** → `[WeeklyCompletion] [ActivityFeed]`

## StudentsTable (öğrenci tablosu)
- Kolonlar: Öğrenci (avatar + ad + sınıf) · Tamamlama (% bar) · Son aktivite/durum ·
  Risk rozeti (mükemmel/iyi/dikkat/kritik) · işlem.
- Risk tonları: excellent=success, attention=warning, critical=danger.

## Diğer kartlar
- **CoachTasks:** koçun bugünkü görev/inceleme listesi.
- **WeeklyCompletion:** haftalık tamamlama grafiği (BarChart).
- **ActivityFeed:** öğrenci aktiviteleri akışı (ödev/deneme/mesaj olayları).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Toplam öğrenci`, `Risk altındaki öğrenci`, `Bekleyen inceleme`.
- ❌ StatCard sırası/etiketleri/delta'larını değiştirmek.
- ❌ İki `col-main` satır düzenini (tablo+görevler, grafik+akış) bozmak.
- ❌ Risk renk kodunu değiştirmek (mükemmel=yeşil, dikkat=sarı, kritik=kırmızı).
