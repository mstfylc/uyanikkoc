# Flow — Öğrenci: Yanlış Ekleme + Tekrar (Sıfır Hata Döngüsü)

> Rol: **öğrenci** · Rota: `mistakes` · Store: `uk_mistakes_v1`
> Kaynak: `yanlis-defteri.jsx`, `mistakes-store.jsx`

## A) Yanlış ekleme
1. Öğrenci Yanlış Defteri'nde **"Yanlış ekle"** (`btn-primary`) → `MistakeAddModal`.
2. Zorunlu: **Ders** + **Konu** (ikisi yoksa "Deftere ekle" disabled). Opsiyonel: alt konu, soru türü, **hata tipi** (6'dan biri, default `islem`), kaynak, çözüm notu, fotoğraf.
3. Fotoğraf seçilirse `misResizeImage(file, 520, cb)` → ~520px dataURL (cihazda; DB'ye yüklenmez — backend'de S3+URL).
4. **Kaydet** → `addMistake({...})`:
   - yeni kayıt `{ status:"acik", stage:0, nextDue: bugün+1gün, history:[] }`.
   - toast: **"Yanlış deftere eklendi · 1 gün sonra tekrar"**.
5. Modal kapanır; özet kutuları + "Tüm Yanlışlar" listesi reaktif güncellenir (`useMistakes`).

## B) Günlük tekrar (ZeroErrorLoop)
1. Sayfada **Sıfır Hata Döngüsü** kartı `dueMistakes(me)` (nextDue ≤ bugün, kapanmamış) listeler.
2. Satırda **"Tekrar ettim"** → `reviewMistake(id)`:
   - `stage++`, `history`'e bugünün damgası eklenir.
   - `stage < 4` → `status:"tekrar"`, `nextDue = bugün + MIS_INTERVALS[stage]`.
   - `stage === 4` (21 gün sonrası) → `status:"kapandi"`, `nextDue:null`.
   - toast: kapandıysa **"{konu} · kapandı 🎯 sıfır hata!"**, değilse **"{konu} tekrar edildi"**.
3. Boş → `.yd-clear` "Bugün tekrar edilecek yanlış yok — döngü temiz."

## C) Odak tekrar (kart kart)
1. **"Odak tekrar"** → `ZeroErrorReview` (snapshot = o anki due listesi).
2. Her kartta **"Tekrar ettim"** (reviewMistake + ilerle) veya **"Atla"** (yalnız ilerle).
3. Liste bitince başarı ekranı: "{reviewed} yanlışı tekrar ettin…".

## Durumlar
- **empty:** hiç yanlış yok → özet sıfır, ZeroErrorLoop temiz, HataFrekansi "Henüz yanlış eklenmedi…".
- **loading:** (backend) — kayıtlar yüklenene kadar skeleton/placeholder; prototipte anlık (localStorage).
- **error:** (backend) — kaydetme başarısızsa modal açık kalmalı + hata toast; prototipte try/catch ile sessiz.

## Backend
`mistakes` tablosu; `nextDue` + kapanma sunucuda hesaplanır; push hatırlatma cron/queue ile. Foto object storage.
