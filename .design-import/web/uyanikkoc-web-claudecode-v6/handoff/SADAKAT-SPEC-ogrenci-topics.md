# SADAKAT SPEC — Öğrenci · Konu Takibi (topics)

Kaynak: `src/student-pages.jsx → TopicsPage`. Rota: `topics`.
Veri: `TOPICS` (ders→konu[]), `TOPIC_STATUS` (done/progress/none + label/renk). Tam Türkçe.

## PageHead
- Başlık **`Konu Takibi`** · alt **`{sınav} müfredatına göre konu konu ilerlemen`** (örn. "YKS müfredatına…")
- Sağ aksiyon: açık buton **`Rapor indir`** (trend ikon) → `konu-takibi-raporu.csv` indirir +
  toast **`Konu takibi raporu indirildi`**.

## Bileşen sırası
1. **İnce özet şeridi** (eski 4 dev kart KALDIRILDI): genel ilerleme yüzdesi + tamamlanan/devam/
   başlanmadı sayıları kompakt satır. (Büyük StatCard kullanma.)
2. **`Section` — `Müfredat haritası`** · alt **`Her kare bir konu — yeşil tamam, sarı devam,
   kesik gri başlanmadı. Bir kareye dokun, aşağıda detayını aç.`**
   - Gövde: `.kt-map` ısı haritası — her ders satırı, konular küçük kareler. Durum renkleri:
     done = `--success`, progress = `--warning`, none = kesik gri kenarlı.
   - Kareye tıklayınca aşağıdaki ders sekmesi o derse geçer + konu detayı açılır.
3. **Ders sekmeleri** (`.seg`): dersler arası geçiş; aktif ders vurgulu.
4. **Seçili dersin konu listesi**: her satır `TopicStatusIcon` (done = check/yeşil, progress =
   sarı, none = nötr) + konu adı + durum etiketi (`TOPIC_STATUS[s].label`). Kaynak işaretleme
   satır içinde (öğrenci kendi kaynağında konuyu işaretler).

## Durumlar
- Boş/başlanmadı konu: kesik gri kare + nötr ikon.
- Hover: kare/satır hafif vurgu.
- Aktif ders sekmesi: primary vurgu.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Konu Takibi` yerine bozuk yazım; `mufredat`, `Rapor indir`.
- ❌ Eski "4 büyük kart" özetini geri getirmek — ince şerit olmalı.
- ❌ Isı haritası + ders sekmeleri + konu listesi üçlüsünden birini atlamak.
- ❌ Durum renk kodunu değiştirmek (yeşil=tamam, sarı=devam, kesik gri=başlanmadı).
- ❌ Isı haritası karesine tıklayınca ders sekmesinin senkronlanmaması.
