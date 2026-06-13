# Uyanık Koç — Web Uygulaması · v6 Yeni Özellikler + Geliştirme Rehberi

Bu belge, `uyanikkoc-web-source-v5` kanonik kaynağına **v5 sonrası eklenen tüm yeni
özellikleri**, dosyalarını, veri modellerini, entegrasyon noktalarını ve **gerçek koda
geçiş (build) rehberini** içerir. (Önceki değişiklikler: `DEGISIKLIKLER.md`.)

> Çalıştırma değişmedi: `uyanik-koc-dashboard.html` tarayıcıda açılır. Demo girişleri:
> Öğrenci `elif@uyanikkoc.com` · Koç `dilek@uyanikkoc.com` · Veli `ayse@uyanikkoc.com`.

---

## 1) Yanlış Defteri + Hata Frekansı + Sıfır Hata Döngüsü  *(yeni modül)*
**Dosyalar:** `src/mistakes-store.jsx` (veri + store), `src/yanlis-defteri.jsx` (UI).
**Öğrenci menüsü:** yeni sayfa **`mistakes`** (app.jsx · MENUS.student + ROUTES.student).
**localStorage:** `uk_mistakes_v1`.

### Veri modeli (mistake)
```
{ id, student, createdAt,
  subject, topic, subtopic,
  errorType,            // bilgi | islem | sure | dikkat | yorum | unutma  (HATA_TIPI)
  source, qType,        // qType: yeninesil|klasik|islem|yorum|grafik (SORU_TURU)
  note, photo,          // photo: ~520px'e küçültülmüş dataURL (cihazda, DB'ye yük yok)
  status,               // acik | tekrar | kapandi  (TEKRAR_DURUM)
  stage, nextDue, history[] }   // sıfır hata döngüsü
```
### Store API (window'a yazılı)
`getMistakes(student)` · `addMistake(data)` · `updateMistake(id,patch)` · `removeMistake(id)`
`reviewMistake(id)` (tekrar et → sonraki aralık; son aralıktan sonra `kapandi`)
`useMistakes(student)` (reaktif) · `dueMistakes(student)` (bugün/geçmiş tekrar)
`mistakeFrequency(student, days=14)` → `{ byType, ranked, diagnosis, topTopics, total }`
`misResizeImage(file, max, cb)` (foto → dataURL)

### Sıfır Hata Döngüsü (spaced repetition)
`MIS_INTERVALS = [1,3,7,21]` gün. Her `reviewMistake` bir sonraki aralığa geçirir; bitince
`status="kapandi"`. UI: `ZeroErrorLoop` (kompakt liste + cap) + `ZeroErrorReview` (kart-kart
odak tekrar modalı). Hata Frekansı kartı: `HataFrekansiCard` (öğrenci ve koç/veli salt-görüntüleme).
> Backend'e geçişte: tablo `mistakes`, review zamanlaması cron/queue; `nextDue` sunucuda hesaplanır.

---

## 2) Net Kaybı Haritası  *(yeni — “en hızlı net nereden gelir?”)*
**Dosya:** `src/net-gain-map.jsx` → `NetGainMap({ student, sinav, role, onPick })`.
**Sinyaller:** konu tamamlanma açığı (konu-store, GERÇEK) + **Yanlış Defteri** yanlış/boş
ağırlığı + deneme trendi + hedef nete katkı. En yüksek kazançlı 3 alan + sıradaki fırsatlar.
**Rol farkı:** `coach` → “Bu konuya ödev ata” (onPick → OdevAtaModal); `student` → “Programa ekle”;
`parent` → CTA yok (salt-görüntüleme). Mount: öğrenci Denemeler, koç Konu Takibi, veli Genel Bakış.
> v2 (gelecek): ÖSYM katsayıları + bölüm hedefi + sıralama tahmini.

---

## 3) Akıllı Ödev Sistemi  *(yeni — koç)*
**Dosya:** `src/coach-smart-odev.jsx` → `SmartOdevModal`. Ödev & Görev'de **“Akıllı Ödev”** butonu.
Öğrenci sinyallerinden (hedef/net/geçen hafta tamamlama/müsaitlik/zayıf konular) **otomatik
haftalık plan** üretir; koç düzenler (yoğunluk/odak/güne böl/kaynak-bağımsız), gecikme uyarısı +
kalite (doğruluk+süre) toggle. “Planı ata” → `addOdevler` (gerçek odev-store).

---

## 4) Takvimim  *(yeni — öğrenci dashboard)*
**Dosya:** `src/student-agenda.jsx` → `TakvimimCard`. **Ajanda / Hafta / Ay** görünümleri.
Tek akışta: ödevler (odev-store) · yaklaşan denemeler · randevular (appointments) ·
Sıfır Hata tekrarları (mistakes). Filtreler: Ödev/Deneme/Randevu/Tekrar. Hepsi gerçek store'lardan.

---

## 5) Mesajlaşma — canlı iletim + bildirim  *(güncellendi)*
**Dosya:** `src/messaging.jsx`. `sendMsg(channelId, from, role, text)` artık:
alıcı rolleri hesaplar (`_msgRecipientRoles`), **okunmamış** sayacı tutar
(`channelUnread`/`markChannelRead`, `_msg.unread`), ve `pushNotif(role,…)` ile **bildirim** üretir.
Birebir sohbette **otomatik yanıt** (`MSG_REPLIES`) + **“yazıyor…”** göstergesi (simüle canlı iletim).
Kanal listesinde okunmamış rozeti; sohbet açılınca temizlenir; sessize alınınca otomatik yanıt yok.
> Backend'e geçişte: WebSocket/SSE; otomatik-yanıt simülasyonu kaldırılır, gerçek karşı taraf yazar.

---

## 6) Koç → öğrenciye geri bildirim notu  *(yeni)*
**Dosya:** `src/coach-pages.jsx` → `CoachNoteModal`. Tamamlanan ödev satırında (`CoachAssignmentRow`)
ve deneme detayında (`coach-pages2.jsx · ExamStudentDetail`) **“Not gönder”**. Not, koç↔öğrenci
DM'ine `sendMsg` ile düşer → öğrenciye **bildirim** gider; ödevse `updateOdev(id,{feedback})`.

## 7) Koç → öğrencinin Yanlış Defteri'ni görür + ödev atar  *(yeni)*
`yanlis-defteri.jsx · CoachMistakesCard` — Koç Konu Takibi'nde açık yanlışları konuya göre
gruplar; her satırda **“Ödev ata”** → `openAta(subject, topic)`. Yanında `HataFrekansiCard` (koç).

## 8) Ödev sonucu / deneme yanlışları → Yanlış Defteri besleme  *(yeni)*
`yanlis-defteri.jsx · MistakeBatchModal`. (a) Öğrenci ödev sonucunu (D/Y/B) kaydederken yanlış
varsa toplu işaretleme açılır (`odev-student.jsx`). (b) Deneme analizinde “Yanlışları deftere ekle”
(`student-exam-analiz.jsx`) — öncelikli konuların yanlışlarını hata tipiyle deftere ekler.

## 9) Veli paneli içgörüleri  *(güncellendi)*
`src/parent.jsx` · Genel Bakış'a salt-görüntüleme **Net Kaybı Haritası** + **Hata Frekansı**
(çocuğun gerçek yanlış verisinden).

## 10) Diğer
- **Konu Takibi (öğrenci) yeniden tasarım:** `student-pages.jsx` — müfredat **ısı haritası** +
  ders **sekmeleri** + ince özet şeridi (eski 4 dev kart kaldırıldı).
- **Ödevlerim** varsayılan görünüm **Günlük plan** (`student-extra.jsx`).
- **Section başlık kırılma düzeltmesi** (`ui.jsx` — başlık sarmalayıcı `flex:1`).

---

## localStorage anahtarları (özet)
`uk_mistakes_v1` (yeni) · `uk_odevler_v1` · `uk_sources_v2` · `uk_msg_v1` · `uk_notif_v2` ·
`uk_konu` · `uk_topic_src_v2` · `uk_appointments_v1` · `uk_billing*` · `uk_theme` · `uk_auth` …

---

## GELİŞTİRME / BUILD REHBERİ  (gerçek koda geçiş)

### Şu anki durum
Çalışan bir **SPA** (tek HTML, istemci-tarafı rol/sayfa yönlendirme, `localStorage` kalıcılık).
Ancak **tarayıcı-içi Babel** ile çalışıyor: ~55 `<script type="text/babel">` her açılışta
tarayıcıda derleniyor (yavaş açılış). Production için derlenmiş bir kurulum gerekir.

### Önerilen hedef
1. **Hız için minimum — Vite + React (SPA kalır):** Babel CDN kalkar → bundle/minify/code-split.
   En büyük açılış kazancı. Bileşenler büyük ölçüde aynen taşınır.
2. **Tam ürün — Next.js (React) [önerilen]:** API route + DB + auth + push tek çatıda;
   landing/SEO de aynı projede. Handoff'taki backend planıyla örtüşür.

### Taşıma adımları
- `Object.assign(window, {...})` global paylaşımını **ES `import`/`export`**'a çevir.
- `<script type="text/babel">` zincirini **modül grafiğine** dönüştür (Vite/Next derler).
- **Store deseni** (`let _state` + `localStorage` + listener + `useXxx()`) → **Zustand**
  (veya React Context) + **React Query** (API). Her `useXxx` hook'u bir query/store'a eşlenir.
- `localStorage` kalıcılığı → **REST/GraphQL API + DB** (Prisma/Postgres öner.). Anahtar→tablo:
  `uk_mistakes_v1`→`mistakes`, `uk_odevler_v1`→`assignments`, `uk_msg_v1`→`messages/threads`,
  `uk_sources_v2`→`student_sources`, `uk_konu`→`topic_status`, `uk_notif_v2`→`notifications`.
- **Gerçek-zaman:** mesaj/bildirim için WebSocket/SSE; mesajlaşmadaki otomatik-yanıt simülasyonu
  kaldırılır. **Spaced repetition** (`nextDue`) sunucuda hesaplanır + push hatırlatma.
- **Foto:** Yanlış Defteri fotoğrafı şu an dataURL (cihazda). Production'da object storage (S3) + URL.
- **Kimlik:** telefon+SMS OTP / e-posta (mevcut prototipte simüle). Auth provider + rol bazlı guard.

### Korunması gerekenler (tasarım doğruluk kaynağı)
`src/styles.css` + `tokens.json` (tek doğruluk kaynağı tasarım sistemi, açık+koyu) — birebir taşı.
Bileşenler saf React; iş mantığı store fonksiyonlarında izole — port büyük ölçüde mekanik.
