# SADAKAT SPEC — Kurum Yöneticisi · Koçlar (k-koclar) + Koç Detayı (k-coach-detay)

Kaynak: `admin/admin-extra4.jsx → KurumCoaches` (override) + `KurumCoachDetail`. Mod: `kurum`.
Veri: `getActiveOrg()`, `visibleOrgCoaches`, `coachFeedback`, `coachTasks`. **Yalnızca aktif kurum**. Tam Türkçe.

## KOÇLAR (`k-koclar`) — KurumCoaches
- **PageHead:** başlık **`Koçlar`** · alt **`{n} koç · {kapasite} kapasite`** · sağ: **`CSV indir`** + (ekle/davet).
- **`.grid.g-3`** StatCard (sıra): `users`/primary **`Toplam koç`** · `star`/warning **`Ortalama puan`** ·
  `cap`/success **`Koç başına öğrenci`**.
- Filtre/arama satırı + **`Section`** tablo (`.tbl` min-width 820): **`Koç`** · (franchise ise) **`Şube`** ·
  **`Öğrenci`** · **`Puan`** · **`Doluluk`** · **`Durum`** · **`İşlem`** (görev ata / çıkar / detay).
  Çıkarılan koç varsa `.alert-strip`. Boş: `EmptyState` **`Koç bulunamadı`**. Görev modalı: `TaskModal`.

## KOÇ DETAYI (`k-coach-detay`) — KurumCoachDetail
- Üst: geri **`Koçlara dön`** + avatar + ad.
- **`.grid.g-4`** StatCard (sıra): `cap`/primary **`Atanan öğrenci`** · `star`/warning **`Geri bildirim puanı`** ·
  `target`/success **`Öğrenci ort. net`** · `flag`/info **`Açık görev`**.
- **`.grid.col-main`**:
  - SOL: `Section` **`Öğrenci & veli geri bildirimleri`** · alt **`{n} değerlendirme · ortalama {avg}`** (boş:
    **`Henüz geri bildirim yok.`**) + `Section` **`Atanan öğrenciler`** · alt **`{n} öğrenci`** (tablo:
    Öğrenci·Sınıf·Net·Devam; satır tıklanır → öğrenci detay).
  - SAĞ: `Section` **`Görevler`** · alt **`{açık} açık · {toplam} toplam`** + **`görev ata`** (boş:
    **`Henüz görev atanmadı.`**) + `Section` **`Performans`** (`RankBars`: Doluluk/Memnuniyet/Geri bildirim).

## YAPMA
- ❌ ASCII: `Koçlar`, `Geri bildirim puanı`, `Atanan öğrenciler`, `Görevler`, `Performans`.
- ❌ StatCard sırası/etiketleri; tablo kolonları; "Şube" kolonunu tek kurumda göstermek (yalnızca franchise).
- ❌ Başka kurumun koçlarını göstermek; taban `kurum.jsx` sürümünü port etmek (override `admin-extra4` esastır).
