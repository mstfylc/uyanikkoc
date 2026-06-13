# SADAKAT SPEC — Koç · Envanter & Testler (tests)

Kaynak: `src/tests-ui.jsx → CoachTestsPage` (+ `TestSendModal`, `TestBuilderModal`, `CoachTestRow`).
Rota: `tests`. Veri: `useRoster()`, `useTassign()`, `useTests()`, `QKINDS`. Tam Türkçe.

## PageHead
- Başlık **`Envanter & Testler`** · alt **`Psikolojik ve yetenek testleri oluştur, gönder, sonuçları analiz et`**
- Sağ aksiyon: birincil **`Test Gönder`** (send) → `TestSendModal`.

## Bileşen sırası
1. **`.grid.g-4`** — 4 StatCard (sıra birebir):
   1. `notebook`/primary · `{tests.length}` · **`Test türü`**
   2. `send`/info · gönderilen · **`Gönderilen`**
   3. `checkCircle`/success · tamamlanan · **`Tamamlanan`**
   4. `clock`/warning · bekleyen · **`Bekleyen`**
2. **`Section` — `Test Kataloğu`** · alt **`Öğrencilere gönderebileceğin envanterler · kendi testini de
   oluşturabilirsin`** · sağda **`Yeni test`** → `TestBuilderModal`:
   `.grid.g-2` test kartları — ikon + ad (özel ise **`Özel`** rozeti) + açıklama + `{n} soru` + soru tipi rozetleri.
3. **`Section` — `Gönderilen Testler`** · alt **`{n} kayıt`** · sağda öğrenci select (`Tüm öğrenciler` + roster):
   `CoachTestRow` listesi (avatar + test + durum: **`Sonuç: {band}`** / **`Öğrenci bekleniyor`** + tarih +
   bekleyene **`Hatırlat`**). Boş: **`Henüz test gönderilmedi.`**

## YAPMA
- ❌ ASCII: `Envanter & Testler`, `Test Kataloğu`, `Gönderilen Testler`, `Yeni test`.
- ❌ StatCard sırası/etiketleri; tarih biçiminde `tr-TR` yerine İngilizce locale.
- ❌ Katalog (g-2 kartlar) + gönderilenler (liste) iki bölümünü birleştirmek.
- ❌ Bekleyen testte "Hatırlat" aksiyonunu atlamak.
