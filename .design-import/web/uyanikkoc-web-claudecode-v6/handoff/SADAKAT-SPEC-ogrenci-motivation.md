# SADAKAT SPEC — Öğrenci · Motivasyon (motivation)

Kaynak: `src/student-extra.jsx → MotivationPage` (+ `TargetRankModal`). Rota: `motivation`.
Veri: `useMotiv(me)`, `ACHIEVEMENTS`, `loadTargetRank()` (`localStorage: uk_target_rank`). Tam Türkçe.

## PageHead
- Başlık **`Motivasyon`** · alt **`Serini koru, rozetlerini topla, hedefe odaklan`**

## Bileşen sırası
1. **`.grid.col-main`**:
   - SOL **`.hero`** (koyu, min-height 200): flame ikon + **`Çalışma Serisi`**; büyük sayı **`12`** (60px) +
     **`gün üst üste`** / **`Rekorun: 21 gün`**; sağ üst rozet (bolt) **`Aktif`**.
     Altta `.glass` kutu: **`Bu hafta {weekHours} saat çalıştın — geçen haftaya göre +3.2 saat. Aynı tempoda devam!`**
   - SAĞ `Section` **`Hedefe Kalan`** · alt **`YKS 2026`**: `Ring` (148px, daysLeft=15 ortada, **`gün kaldı`**),
     **`20 Haz 2026 · Cumartesi`** + **`TYT oturumu 10:15'te başlıyor`**, ve buton
     **`Hedef sıralaman: {rank}`** (target ikon) → `TargetRankModal`.
2. **`CoachRatingCard`** (varsa) — koç değerlendirme kartı.
3. **`Section` — `Rozetlerin`** · alt **`{kazanılan}/{toplam} kazanıldı`** · sağda **`Tümü`** link:
   `.medal-grid` — her rozet kazanıldıysa renkli + check, kilitliyse kilit ikonu. Ad + açıklama.
4. **Günün notu kartı** (primary degrade): heart orb + koç mesajı (tırnak içinde) +
   **`Koçun {from}'dan motivasyon mesajı`** (veya "günün notu").

## TargetRankModal (`Hedef Sıralaman`)
- Başlık **`Hedef Sıralaman`** · alt **`YKS 2026 için hedeflediğin sıralama`**.
- Alan **`Hedef sıralama (ilk ...)`** numeric + sağda **`. kişi`**; hızlı chip'ler **`İlk 10.000/25.000/50.000/100.000`**.
- Footer: **`Vazgeç`** / **`Kaydet`**; kayıt sonrası toast **`Hedef sıralaman güncellendi: İlk {v}`**.
- Sayı biçimi `toLocaleString("tr-TR")` (binlik nokta).

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Motivasyon`, `gun üst üste`, `Rozetlerin`, `Hedefe Kalan`.
- ❌ Hero seri sayısını/Ring'i kaldırmak; rozet grid'ini liste yapmak.
- ❌ Sayı biçimini `tr-TR` yerine İngilizce (virgül) yapmak.
- ❌ Sıralamayı bozmak: hero+ring → (rating) → rozetler → günün notu.
