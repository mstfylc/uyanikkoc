# RISKS_AND_GAPS — Eksik / Kararsız / Dikkat Alanları

> Bu paket pixel-perfect uygulama için hazırlandı. Aşağıdaki maddeler **kesin kapatılmadan** "final görsel" sayılmamalıdır. Tasarımda olmayan hiçbir ekran/renk/component UYDURULMADI; belirsizlikler burada açıkça listelendi.

## A. Ortam kısıtı kaynaklı eksik GÖRSELLER (içerik var, PNG yok)
Bunlar tasarım eksikliği değildir — yakalama ortamının kısıtıdır. Spec + canlı prototip tam mevcut.
1. **Mobil PNG'ler (mobile-light / mobile-dark) üretilemedi.** Sebep: yakalama görünüm penceresi sabit (~924px), ≤880px mobil kırılımına inilemiyor. → Gerçek tarayıcı/DevTools ile üretilmeli (exports/README.md adımları). Mobil davranış spec'lerde tam (breakpoint tablosu: tokens/spacing.json; bottom-nav: components/states-nav-modal-form-table.md).
2. **Modal PNG'leri üretilemedi** (SmartOdevModal, MistakeAddModal, MistakeBatchModal, ZeroErrorReview, CoachNoteModal, GroupModal). Sebep: yakalama aracı fixed-portal overlay'i serileştiremiyor. → components/*'ta tam specli; gerçek tarayıcıdan yakalanabilir.
3. **coach/c-topics (CoachKonuPage) PNG'i yok.** Canlıda çalışıyor; yakalanamadı. Spec + flow 05 mevcut.
4. **Topbar rol segmenti artefaktı:** otomatik PNG'lerde aktif rol "pill"'i yanlış (genelde "Koç") görünebilir — yakalama aracı sticky topbar'daki dinamik `.on` sınıfını doğru render etmiyor. Canlı app + spec doğru; KOPYALANMAMALI. Sayfa içeriği etkilenmez.
5. **Desktop genişliği ~909px** (kompakt). 1440px geniş masaüstü referansı için gerçek tarayıcı kullanın; layout aynı, yalnız `.g-4`/arama kırılımı genişlikle değişir.

## B. Hedef projeyle (apps/web) GERÇEK tutarsızlıklar — Codex düzeltmeli
1. **`apps/web/styles/uk-design.css` · `--muted` = `#767A90` (ESKİ v4).** Kanonik v6 = **`#6B6F85`**. Düzeltilmeli. (Kaynak `src/styles.css` doğru; `tokens/colors.json` doğru.)
2. **`--surface` dark:** kaynak `src/styles.css`'te iki kez yazılı (`#14172380` sonra `#181C2B`). Geçerli = **`#181C2B`**. Hedefte tek ve doğru olmalı.
3. **apps/web büyük ölçüde iskelet:** v6 modüllerinin çoğu hedefte YOK; prototipten oluşturulacak (source-map/*).

## C. Tasarımda BİLİNÇLİ "v1 / sonraki sürüm" notları (eksik değil — kapsam dışı)
1. **Net Kaybı Haritası v1:** ÖSYM katsayıları, bölüm hedefi, sıralama tahmini **v2'ye bırakıldı** (net-gain-map.jsx içi not). Bunları uydurmayın.
2. **AI Koç (`ai-coach`):** menüde **"Yakında"** etiketli — tam ekran tasarımı yok (placeholder). Üretmeyin; placeholder olarak bırakın.
3. **Akıllı Ödev öneri motoru:** prototipte deterministik/sezgisel (gerçek ML değil). Backend mantığı tasarım kapsamı dışı.

## D. Prototip simülasyonu olan, BACKEND'de değişecek davranışlar
1. **Mesaj otomatik-yanıtı** (`MSG_REPLIES`, "yazıyor…"): yalnız demo simülasyon. Gerçekte WebSocket/SSE + gerçek karşı taraf.
2. **Spaced repetition `nextDue`:** istemcide hesaplanıyor; backend'de sunucu + push hatırlatma.
3. **Yanlış Defteri fotoğrafı:** dataURL (cihazda). Backend'de object storage (S3) + URL.
4. **Kimlik:** SMS OTP / e-posta simüle. Gerçek auth provider + rol guard.
5. **Mute tercihi:** oturumluk (kalıcı değil). Backend'de kullanıcı-kanal tercihi.
6. **"Bugün" sabitleri** (MIS_TODAY / ODEV_TODAY / SMART_BASE = 2026-06-05): demo amaçlı. Üretimde gerçek tarih.

## E. Kararsız / doğrulanması gereken alanlar (ürün sahibi onayı gerekebilir)
1. **Rota desenleri** (`/student/...` vb.) ÖNERİDİR; mevcut iskelet düzeniyle netleştirilmeli (source-map/README.md).
2. **Z-index tokenizasyonu** yok (literal). Önerilen ölçek tokens/radius-shadow-zindex.json'da; benimsenecekse onay.
3. **Spacing scale tokeni** kaynakta yok (literal px). tokens/spacing.json'daki öneri ölçek opsiyonel; görsel parite için literal değer esastır.
4. **MistakeBatch slot cap** (ödev 12 / deneme 14): prototip kısıtı; backend'de tümü desteklenebilir — ürün kararı.
5. **Çoklu koç / kurum kapsamı:** prototip tek-koç demo. Gerçek RBAC (koç↔kendi öğrencisi, veli↔kendi çocuğu) backend'de zorunlu (auth-scope.json).
6. **Admin & native mobil:** bu teslimin KAPSAMI DIŞI (ayrı ürün yüzeyleri — VERSION.md). Burada ele alınmadı.

## F. Doğrulanmış / risk YOK
- Renk/typografi/radius/shadow tokenları kaynakla birebir (`tokens/*`).
- Tüm v6 component davranışları, enum'lar, toast/boş-durum metinleri kaynaktan birebir alındı.
- Desktop PNG'leri (3 rol × 2 tema, listelenen rotalar) gerçek yakalandı.
