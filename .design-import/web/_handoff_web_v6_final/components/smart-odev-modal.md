# Component Spec — Akıllı Ödev (SmartOdevModal)

> Kaynak: `src/coach-smart-odev.jsx` → `SmartOdevModal({ open, onClose, student, onAssign })`
> Stiller: `.sm-panel`, `.sm-analiz`, `.sm-sig`, `.sm-weakchips`, `.sm-reco`, `.sm-controls`, `.sm-ctl`, `.sm-toggle`, `.sm-day`, `.sm-item`, `.sm-isel`, `.sm-typetag` (`src/styles.css` ~1100–1150)
> Tetikleyici: Koç **Ödev & Görev** (`c-assignments`) sayfasında **"Akıllı Ödev"** butonu.
> Yazar: `addOdevler(list)` (odev-store, `uk_odevler_v1`).

## Amaç
Öğrenci sinyallerinden (hedef, net, geçen hafta tamamlama, müsaitlik, zayıf konular) **otomatik haftalık ödev planı** üretir; koç düzenler, atar.

## Modal yapısı (portal, `.modal-panel.sm-panel`)
**Head:** primary-soft `lr-icon` 38 + `bolt` ikon · başlık "Akıllı Ödev Sistemi" · alt "{öğrenci} · otomatik haftalık öneri" · kapat.

**Body (3 blok):**

### 1 · Analiz (`.sm-analiz`)
- `.sm-sig` (4 sinyal kutusu): **Hedef** ("YKS 2026" + "≈ {targetNet} net hedef") · **Şu anki net** (+ "▲/▼ {delta} son deneme", renk) · **Geçen hafta** ("%{completion}" renk: <65 danger / <85 warning / ≥85 success + "ödev tamamlama") · **Müsaitlik** ("{availDays} gün" + "tahmini / hafta").
- **Öncelikli zayıf alanlar** — `.sm-weakchips`: en zayıf 3 ders chip'i (renk noktası + ders + "%{pct}").
- `.sm-reco` — bolt ikon + otomatik cümle (`_smSentence`): "{ad}, {ders} konularında geride (%{pct}). Geçen hafta ödev tamamlama oranı %{completion} ({düşük/orta/yüksek}). Bu hafta {gün} güne bölünmüş, {yoğunluk} yoğunluklu, {odak} ağırlıklı bir plan önerdim."

### 2 · Plan ayarları (`.sm-controls`) — değişince plan otomatik yeniden üretilir
- **Yoğunluk** seg: Düşük/Orta/Yüksek (`SM_INTENSITY` — soru aralığı 15-25 / 25-40 / 40-55, perDay 1/1/2).
- **Odak** seg: Tekrar / Karma / Yeni konu (`SM_FOCUS`).
- **Güne böl** `NumStepper` (min 1, max 7).
- **Kaynak (bağımsız)** select: "Kaynak fark etmez" / "Koç PDF / föy" / öğrencinin kaynakları (`getSources`).
- 2 toggle (`.sm-toggle` switch): **Geciken ödevde otomatik uyarı** (`overdueAlert`) · **Kalite ölç (doğruluk + süre)** (`quality`).

### 3 · Önerilen plan
- "Yeniden öner" butonu (`_smGenerate`).
- **Gün blokları** (`opts.days` kadar `.sm-day`): başlık "Gün {n} · {haftagünü}" + "+ Satır" ekleme.
  - Her satır `.sm-item`: ders renk noktası + **konu select** (ders konuları) + **tür select** (`ODEV_TYPES` minus "test") + tür "soru" ise `NumStepper` (step 5, 0–300), aksi `.sm-typetag` + sil `mini-btn danger`.
  - Boş gün: `.sm-emptyrow` "Bu gün boş — serbest tekrar ya da '+ Satır' ile ödev ekle."

**Foot:** sol özet "**{N}** ödev · **{soru}** soru hedefi · {usedDays} güne yayılmış"; sağ `btn-ghost` Vazgeç + `btn-primary` "Planı ata" (icon bolt; atandıktan sonra "Atandı!" + check, disabled).

## Atama (`assign`)
Her item → odev kaydı: `{ id, student, week:"w0", subject, topic, source(etiket), count, type, note, due(gün+1), status:"pending", result:null, smart:true, overdueAlert, quality }` → `addOdevler(list)` → toast "{N} akıllı ödev {ad}'e atandı" → 650ms sonra kapanır.

## Varsayılan öneri mantığı (modal açılışında)
- intensity ← completion (<65 low / <85 mid / ≥85 high).
- focus ← progCount≥3 ? tekrar : (todo>prog·2 ? yeni : karma).
- days ← min(availDays, low:3 / mid:4 / high:5).

## Bağımlılıklar
`COACH_STUDENTS`, `getCurriculum`/`konuList`/`ensureKonuSeed` (konu-store), `getSources` (odev-store), `ODEV_TYPES`, `SUBJECT_COLORS`, `NumStepper`, `addOdevler`, `toast`.
Demo "bugün": `SMART_BASE = 2026-06-05`.
