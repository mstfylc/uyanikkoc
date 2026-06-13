# Flow — Koç: Akıllı Ödev Üret + Ata

> Rol: **koç** · Rota: `c-assignments` (Ödev & Görev) · Store: `uk_odevler_v1`
> Kaynak: `coach-smart-odev.jsx · SmartOdevModal`

## Adımlar
1. Ödev & Görev'de **"Akıllı Ödev"** → `SmartOdevModal` (öğrenci seçili / default ilk öğrenci).
2. **Açılışta otomatik analiz** (`_smSignals`) + öneri (`_smGenerate`):
   - sinyaller: hedef, şu anki net + son deneme delta, geçen hafta tamamlama %, müsaitlik (gün), en zayıf 3 ders.
   - varsayılan: intensity ← completion; focus ← prog/todo dengesi; days ← müsaitlik.
3. Koç **plan ayarlarını** değiştirir (yoğunluk / odak / güne böl / kaynak) → plan **otomatik yeniden üretilir** (`regen`). Toggle: gecikme uyarısı, kalite ölç.
4. Koç **gün/satır düzeyinde düzenler**: satır ekle ("+ Satır"), konu/tür/soru sayısı değiştir, satır sil. "Yeniden öner" sıfırdan üretir.
5. **"Planı ata"** → her item odev kaydına dönüşür:
   - `{ student, week:"w0", subject, topic, source(etiket), count, type, note, due: SMART_BASE + (gün+1), status:"pending", result:null, smart:true, overdueAlert, quality }`.
   - `note` = odak/tür + (kalite açıksa) "· süreyi not et".
   - `addOdevler(list)` → toast "{N} akıllı ödev {ad}'e atandı" → 650ms sonra kapanır.
6. Atanan ödevler öğrencinin **Ödevlerim** (günlük plan) ve **Takvimim**'inde anında görünür.

## Durumlar
- **empty:** öğrencinin müfredatı/konusu yoksa ilk dersin ilk 3 konusundan fallback plan üretilir.
- **boş gün:** `.sm-emptyrow` — atılmaz, serbest tekrar olarak kalır.
- **atandı:** buton "Atandı!" + disabled; tekrar atama engellenir.

## Backend
Öneri motoru sunucuda (öğrenci sinyalleri DB'den); `assignments` batch insert; `smart/overdueAlert/quality` alanları korunur; gecikme uyarısı job ile.
