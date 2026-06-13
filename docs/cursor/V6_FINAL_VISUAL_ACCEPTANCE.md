# Uyanık Koç Web v6 Final - Visual Acceptance Checklist

Bu checklist `visual-qa/acceptance-checklist.md` maddelerinin canlı repo route düzenine uyarlanmış P0 kopyasıdır. İşaretler sonraki uygulama/QA fazlarında doldurulacak; P0'da implementation yapılmadı.

## Reality Parity QA - 2026-06-13

- [x] No-new-design rule rechecked: Codex yeni tasarım üretmedi; tüm UI değişiklikleri Claude Design handoff/spec/source prototype ile eşlendi. Kaynakta olmayan hiçbir component, renk, spacing, flow veya veri uydurulmadı.
- [x] `/coach/topics` source mapping rechecked against `SADAKAT-SPEC-koc-c-topics.md`, `src/coach-konu.jsx`, `src/coach-konu.css`, `components/net-gain-map.md`, `components/yanlis-defteri.md`, and `components/hata-frekansi.md`.
- [x] `/coach/topics` fixed order: PageHead, student strip, Net Kaybı Haritası, Öğrencinin Yanlış Defteri, Hata Frekansı, four stats, Öğrenci notları, Net Gelişimi, Haftalık Soru Hedefi + Deneme Analizleri, Soru Takibi, `.ktx`, Ödev Ata modal.
- [x] Browser QA passed on local demo-memory server: desktop 1440 and mobile 390, `.ktx=1`, `.ktx table=0`, `.ktx-topic=2`, modal opens, no horizontal overflow.
- [x] Evidence: `docs/cursor/visual-checks/desktop-light-coach-topics-reality.png`, `desktop-light-coach-topics-modal-reality.png`, `mobile-light-coach-topics-reality.png`.

## Final Live Browser QA - 2026-06-12

- [x] Final all-areas parity pass reran after coach notifications fix: 37 live Playwright visual checks passed, 0 failed.
- [x] Coach `/coach/notifications` route exists, uses shared notifications panel, supports read and mark-all through guarded coach API.
- [x] Live domain `https://koc.uyanik.com.tr` redeployed from `5b734f6`.
- [x] `/api/health` returns `authSecret: ok`.
- [x] Student dashboard Takvimim, Yanlis Defteri add/list/review, student exams NetGainMap, and optik submit/review -> Yanlis Defteri ingestion passed on live demo data.
- [x] Coach `/coach/topics` passed desktop/mobile browser QA with `.ktx` rail, `.ktx-topic` cards, NetGainMap, Yanlis Defteri Insight, Hata Frekansi, no `.ktx table`, and shared `Odev Ata` modal.
- [x] Coach SmartOdev preview + assign passed on live demo data.
- [x] Parent dashboard mistake/net insight, messages read/mute, and notifications read surface passed on live demo data.
- [ ] Password reset email delivery remains blocked by production mail env: `RESEND_API_KEY` is empty.

## 0. Design System Gate

- [x] `apps/web/styles/uk-design.css` `:root` ve `[data-theme="dark"]` değişkenleri `tokens/*` ile birebir.
- [x] Light `--muted` = `#6B6F85`; eski `#767A90` kalmadı.
- [x] Dark `--surface` = `#181C2B`; çift/yanlış dark surface kalmadı.
- [x] Dark `--surface-2`, `--surface-3`, `--border`, `--border-strong`, `--text-2`, `--muted`, `--faint` final `tokens/colors.json` ile eşleşiyor.
- [x] Plus Jakarta Sans 400-800 yüklü; `--font` doğru; `.tnum` sayılarda tabular-nums.
- [x] radius 9/13/18/24, shadow sm/md/lg/primary, `--sidebar-w:264px`, `--header-h:70px` doğru.
- [x] `color-mix()` ve `.app` radial-gradient arka planları korunmuş.

P1 notu: Bu fazda yalnız global token/style parity düzeltildi. Mobile/modal PNG eksikliği ve v6 feature UI/backend işleri sonraki fazlarda kalır.

## 1. Shell & Navigation

- [ ] `components/layout/Sidebar.tsx`: nav-item rest/hover/active stilleri v6 ile uyumlu.
- [ ] Student nav'da `/student/mistakes` `Yanlış Defteri` ve `Yeni` tag'i doğru.
- [ ] AI Koç yalnız `Yakında`; canlı OpenAI entegrasyonu yok.
- [ ] `components/layout/Header.tsx`: crumb, search, theme toggle, NotifBell, user pop doğru.
- [ ] Topbar rol segmenti PNG artefaktı kopyalanmadı; mevcut canlı rol doğru.
- [ ] <=880px bottom-nav role'e göre 4 ana + Menü; tap target min 44px.

## 2. Student `/student/mistakes`

Desktop reference:
- Light: `exports/student/desktop-light/mistakes.png`
- Dark: `exports/student/desktop-dark/mistakes.png`

Checklist:
- [ ] PageHead: "Yanlış Defteri" + "Yanlış ekle".
- [ ] 4 özet kutusu: toplam/açık/kapandı/bugün tekrar.
- [ ] ZeroErrorLoop: due satırları, 4 stage noktası, "Tekrar ettim", temiz empty state.
- [ ] HataFrekansiCard: yatay tone barları, teşhis, en sık konular.
- [ ] MistakeAddModal: ders/konu, 6 hata tipi toggle, kaynak, not, photoUrl UI/disabled hali, "1 -> 3 -> 7 -> 21".
- [ ] MistakeBatchModal: bulk + satır hata tipi; ödev max 12, deneme max 14.
- [x] ZeroErrorReview: ilerleme, kart kart review, "Atla", "Tekrar ettim", bitiş ekranı.

## 3. Student `/student/dashboard`

Desktop reference:
- Light: `exports/student/desktop-light/dashboard.png`
- Dark: `exports/student/desktop-dark/dashboard.png`

Checklist:
- [ ] Dashboard mevcut hero/stat akışı v6 tokenlarla uyumlu.
- [ ] `TakvimimCard` mount edildi.
- [ ] Ajanda/Hafta/Ay segmenti çalışıyor.
- [ ] Filtre şeridi: Tümü/Ödev/Deneme/Randevu/Tekrar sayaçları.
- [ ] Ajanda grupları: Gecikmiş/Bugün/Yarın/tarih.
- [ ] Hafta 7 kolon; <=640px yatay scroll.
- [ ] Ay 6x7 grid + type dots + seçili gün listesi.
- [ ] Item click ilgili canlı route'a gider: assignments/exams/appointments/mistakes.

## 4. Student `/student/assignments`

Desktop reference:
- Light: `exports/student/desktop-light/assignments.png`
- Dark: `exports/student/desktop-dark/assignments.png`

Checklist:
- [ ] Öğrenci ödev satırları `OdevCard` v6 meta/renkleriyle uyumlu.
- [ ] Sonuç modalı D/Y/B ve canlı net hesaplar.
- [ ] `wrong > 0` olduğunda MistakeBatchModal otomatik açılır.
- [ ] Empty/loading/error/disabled metinleri component spec ile uyumlu.

## 5. Student `/student/exams`

Desktop reference:
- Light: `exports/student/desktop-light/exams.png`
- Dark: `exports/student/desktop-dark/exams.png`

Checklist:
- [ ] NetGainMap student mode mount edildi; CTA "Programa ekle".
- [ ] Deneme analizi içinde `wrong > 0` öncelikli konularda "Yanlışları deftere ekle" CTA görünür.
- [ ] CTA yok koşulu: hiçbir öncelikli konuda yanlış yok.
- [ ] MistakeBatchModal deneme cap max 14 slot.

## 6. Student `/student/topics`

Desktop reference:
- Light: `exports/student/desktop-light/topics.png`
- Dark: `exports/student/desktop-dark/topics.png`

Checklist:
- [ ] Konu takip mevcut route'u korunur.
- [ ] v6 token, subject color ve table/list state parity doğrulanır.

## 7. Messages

Desktop references:
- Student: `exports/student/desktop-light/messages.png`, `exports/student/desktop-dark/messages.png`
- Coach: `exports/coach/desktop-light/messages.png`, `exports/coach/desktop-dark/messages.png`
- Parent: `exports/parent/desktop-light/messages.png`, `exports/parent/desktop-dark/messages.png`

Routes:
- `/student/messages`
- `/coach/messages`
- `/parent/messages`

Checklist:
- [ ] İki panel: kanal listesi + sohbet.
- [ ] Gruplar/Birebir bölümleri role göre doğru.
- [ ] Unread: rozet + bold + saat primary-600.
- [ ] Read endpoint sonrası rozet temizlenir.
- [ ] Mute kalıcıdır; çan danger; notification bastırma backend'de.
- [ ] Balon stilleri: kendi primary/beyaz sağ; karşı surface sol.
- [ ] Koç `GroupModal`/üye yönetimi.
- [ ] Otomatik DM yanıt simülasyonu production'a taşınmadı.

## 8. Coach `/coach/assignments`

Desktop reference:
- Light: `exports/coach/desktop-light/c-assignments.png`
- Dark: `exports/coach/desktop-dark/c-assignments.png`

Checklist:
- [ ] "Akıllı Ödev" butonu.
- [ ] SmartOdevModal analiz: 4 sinyal, weak chips, öneri cümlesi.
- [ ] Ayarlar: yoğunluk, odak, güne böl, kaynak, overdueAlert, quality.
- [ ] Gün blokları, satır ekle/sil/düzenle.
- [ ] Preview DB'ye yazmaz.
- [ ] Assign transaction gerçek assignment üretir.
- [ ] Tamamlanan ödevde "Not" -> CoachNoteModal.

## 9. Coach `/coach/topics`

Desktop reference:
- Eksik: handoff `coach/c-topics` PNG yok. Spec + gerçek browser QA kullanılacak.

Checklist:
- [ ] Mount sırası: NetGainMap -> CoachMistakesCard -> HataFrekansiCard -> konu tablosu.
- [ ] Tüm "Ödev ata" CTA'ları tek `CoachOdevAtaModal`'ı subject/topic prefill ile açar.
- [ ] Coach yalnız roster öğrencisinin verisini görür.

## 10. Coach Other Desktop References

- `/coach/dashboard`: `exports/coach/desktop-light/dashboard.png`, `exports/coach/desktop-dark/dashboard.png`
- `/coach/students`: `exports/coach/desktop-light/students.png`, `exports/coach/desktop-dark/students.png`
- `/coach/reports`: `exports/coach/desktop-light/reports.png`, `exports/coach/desktop-dark/reports.png`

Checklist:
- [ ] Mevcut ekranlar silinmeden v6 token/shell parity doğrulanır.

## 11. Parent

Desktop references:
- `/parent/dashboard`: `exports/parent/desktop-light/dashboard.png`, `exports/parent/desktop-dark/dashboard.png`
- `/parent/exams`: `exports/parent/desktop-light/p-exams.png`, `exports/parent/desktop-dark/p-exams.png`
- `/parent/messages`: `exports/parent/desktop-light/messages.png`, `exports/parent/desktop-dark/messages.png`

Checklist:
- [ ] Parent dashboard: NetGainMap CTA yok.
- [ ] Parent dashboard: HataFrekansi child aggregate read-only.
- [ ] Parent dashboard: KaynakTracker readonly.
- [ ] Parent yalnız kendi çocuğunun verisini görür; edit/assign yok.

## 12. Mobile & Modal QA

- [ ] Mobile PNG yok: gerçek browser/DevTools ile 390px light/dark regenerate denenecek.
- [ ] Regenerate yapılamazsa spec + token + canlı route manual QA esas alınacak.
- [ ] Modal PNG yok: SmartOdevModal, MistakeAddModal, MistakeBatchModal, ZeroErrorReview, CoachNoteModal, GroupModal gerçek browser ile yakalanacak veya spec tabanlı QA yapılacak.
- [ ] `prefers-reduced-motion` ile animasyonlar kapanır; içerik görünür.
- [ ] Modal overlay click close, ESC, focus ve scroll lock doğrulanır.

## Diff Eşikleri

- Token/color: %0 tolerans.
- Layout/spacing: <= %1.0.
- Typography metrics: <= %1.5.
- Full page: <= %2.0.
- Shadow/gradient/blur: <= %3.0.
- Zero tolerance: tokenlar, tone mapping, subject colors, selected states, toast/empty Turkish copy, spaced repetition `1 -> 3 -> 7 -> 21`.

## P11 Final Audit Delta

- P1-P10 implementasyonuyla dogrulanan alanlar: v6 token gate, `/student/mistakes`, ZeroErrorReview, NetGainMap mounts, SmartOdev preview/assign, Takvimim agenda, messaging read/mute persistence, coach notification DB scope.
- Bu faz browser pixel QA veya yeni PNG uretimi yapmadi; mobile PNG, modal PNG ve coach topics PNG eksigi cozuldu diye isaretlenmedi.
- AssignmentResult soru bazli payload eksigi devam eder; optik/deneme akisi Yanlis Defteri batch beslemesini karsilar ve konu yoksa topic uydurmaz.
- Mevcut role-based route yapisi korunur; v6 generic wrapper route'lari eklenmedi.
