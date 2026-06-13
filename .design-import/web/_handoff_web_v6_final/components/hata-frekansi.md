# Component Spec — Hata Frekansı (HataFrekansiCard)

> Kaynak: `src/yanlis-defteri.jsx · HataFrekansiCard`, hesap: `src/mistakes-store.jsx · mistakeFrequency(student, 14)`
> Stiller: `.hf-head`, `.hf-grid`, `.hf-bars`, `.hf-bar`, `.hf-topics` (`src/styles.css`)
> Mount: Öğrenci Yanlış Defteri (role="student"), Koç Konu Takibi (role="coach"), Veli Genel Bakış (role="parent", salt-görüntüleme).

## Yapı
`Section`:
- **title** "Hata Frekansı"
- **sub** — student: "Son 14 günde hangi tür hatayı daha çok yapıyorsun"; coach: "{student} · son 14 gün"
- **action** `Badge primary` icon `chart` → "{total} yanlış"

Card-body (flex, gap 15):
1. **`.hf-head`** — `.ic` (bolt ikon) + paragraf: **kalın cümle** ("Son 14 günde {n} {tip}, {n} {tip}, …") + `f.diagnosis` (teşhis cümlesi).
2. **`.hf-grid`** (2 kolon, ≤720px tek kolon):
   - **`.hf-bars`** — `f.ranked` (sayısı>0 olan tipler, azalan) için yatay bar: `.hf-lbl` (hata tipi badge), `.hf-track` (dolum genişliği `byType[k]/maxN*100%`, renk `var(--<tone>)`), `.hf-n.tnum` (sayı).
   - **`.hf-topics`** — başlık "En sık yanlış konular"; `f.topTopics` (max 3) için satır: "ders · konu" + `badge-muted` "{n}×".

## Hesaplama (mistakeFrequency)
- Pencere: son `N=14` gün (`createdAt >= MIS_TODAY - 13gün`).
- `byType`: 6 hata tipinin sayımı; `ranked`: sayısı>0, azalan.
- **diagnosis** kuralları:
  - total=0 → "Bu dönemde kayıtlı yanlış yok."
  - `bilgi/total > 0.45` → "Ağırlıklı bilgi eksiği — önce konu tekrarı gerekiyor."
  - `(islem+sure)/total >= 0.5` → "Asıl sorun konu bilmemek değil; çözüm disiplini ve süre yönetimi."
  - aksi → "Dikkat ve dağınık hatalar öne çıkıyor — kontrollü çözüm şart."
- `topTopics`: "ders · konu" bazında en sık 3.

## Durum (state)
- **Boş (total=0):** student/parent → "Henüz yanlış eklenmedi. İlk yanlışını ekleyince burada hata tipi dağılımın çıkacak."; **coach → component null döner (gösterilmez).**
- **Salt-görüntüleme:** parent ve coach'ta CTA yok; yalnız analiz.
