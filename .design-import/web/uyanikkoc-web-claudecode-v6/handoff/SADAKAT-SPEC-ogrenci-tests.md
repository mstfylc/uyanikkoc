# SADAKAT SPEC — Öğrenci · Testlerim (tests)

Kaynak: `src/tests-ui.jsx → StudentTestsPage` (+ `TestRunModal`). Rota: `tests`.
Veri: `useTassign()` (öğrenciye atanan testler), `TEST_CATALOG`, `testById`. Tam Türkçe.

## PageHead
- Başlık **`Testlerim`** · alt **`Koçunun gönderdiği envanter ve testler`** (aksiyon yok)

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `notebook`/primary · `{assigns.length}` · **`Gönderilen test`**
   2. `clock`/warning · bekleyen · **`Bekleyen`**
   3. `checkCircle`/success · tamamlanan · **`Tamamlanan`**
   4. `star`/info · `{TEST_CATALOG.length}` · **`Test türü`**
2. **`Section` — `Yapılacak Testler`** · alt **`{n} bekleyen`**:
   - Satır `.lrow`: test tonuna göre renkli ikon + ad + `{desc} · {n} soru` + birincil **`Testi Çöz`** → `TestRunModal`.
   - Boş: **`Bekleyen test yok 🎉`**
3. **`Section` — `Tamamlanan Testler`** · alt **`{n} sonuç`** (yalnızca tamamlanan varsa):
   - Satır: ikon + ad + sonuç bandı rozeti (`a.band`) + varsa **`Koç notu: {…}`** + `Badge` success **`Bitti`**.

## TestRunModal (Testi Çöz)
- Soru tipleri: **yesno** (Evet/Hayır), **scale** (0–10, **`Düşük`**/**`Yüksek`** uçları), **choice** (radyo seçenek).
- İlerleme: yanıtlanan/toplam + yüzde; hepsi yanıtlanınca gönderilir → skor + bant (`scoreBand`) hesaplanır,
  `completeTest(id, score, band, tone)` çağrılır, sonuç ekranı gösterilir.

## Sık yapılan sapmalar (YAPMA)
- ❌ ASCII: `Testlerim`, `Yapilacak Testler`, `Test turu`.
- ❌ StatCard sırası/etiketleri; boş durum metni **`Bekleyen test yok 🎉`**.
- ❌ Tamamlanan testler bölümünü her zaman göstermek (yalnızca veri varsa).
- ❌ 3 soru tipini (yesno/scale/choice) tek tipe indirgemek.
