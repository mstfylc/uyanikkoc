# Latest Handoff

**Son yurutulen faz:** Web v6 Final P9 Messaging unread/read/mute persistence  
**Tarih:** 2026-06-12  
**Kapsam:** ThreadMember lastReadAt/muted persistence, unread hesaplama ve mevcut messages UI state aksiyonlari.

## P0 Çıktıları

- `docs/cursor/V6_FINAL_SCREEN_GAP_MAP.md`
- `docs/cursor/V6_FINAL_COMPONENT_GAP_MAP.md`
- `docs/cursor/V6_FINAL_BACKEND_GAP_MAP.md`
- `docs/cursor/V6_FINAL_VISUAL_ACCEPTANCE.md`
- `docs/cursor/CURSOR_RUN_LOG.md`
- `docs/cursor/RISK_REPORT.md`

## Handoff Kaynakları

- Final paket: `C:/Users/musta/Downloads/uyanikkoc (2).zip` -> `_handoff_web_v6_final/`
- Audit: `C:/Users/musta/Downloads/V6_HANDOFF_PACKAGE_AUDIT.md`
- Apply prompt: `C:/Users/musta/Downloads/CODEX_UYANIKKOC_WEB_V6_FINAL_APPLY_PROMPT.md`
- Önceki prototip paketi: `C:/Users/musta/Downloads/uyanikkoc (1).zip` -> `indir/uyanikkoc-web-source-v5/`

## Canlı Repo Gerçekliği

- Bu yeni proje değil; canlı `apps/web` Next 15 App Router yapısı korunacak.
- Gerçek dashboard route'ları: `/student/dashboard`, `/coach/dashboard`, `/parent/dashboard`.
- Mevcut pattern: `app/api` -> `server/services` -> `packages/database/src/repositories` -> Prisma.
- NextAuth/Auth.js korunacak; alternatif JWT/auth sistemi yazılmayacak.
- AI Koç canlı AI entegrasyonuna çevrilmeyecek; `Yakında` yüzeyi korunacak.

## P0 Bulguları

- `/student/mistakes` route ve Yanlış Defteri backend'i yok.
- v6 component ailesinden NetGainMap, SmartOdevModal, TakvimimCard, HataFrekansiCard, ZeroErrorLoop canlı component ağacında yok.
- Messaging/notifications kısmi DB-backed; unread/read/mute ve coach notification DB scope eksik.
- Assignment/AssignmentResult mevcut; v6 smart assignment ve source/topic/question/feedback alanları eksik.
- Mobile/modal PNG'ler ve coach topics PNG handoff paketinde yok; QA riskleri `RISK_REPORT.md` içinde.

## P1 Bulguları

- `apps/web/styles/uk-design.css` light `--muted` `#6B6F85` yapıldı.
- Dark neutral token seti final `tokens/colors.json` ile hizalandı: `--surface #181C2B`, `--surface-2 #1F2435`, `--surface-3 #282E43`, `--border #2E3450`, `--border-strong #3C4366`, `--text-2 #C9CDDF`, `--muted #969BB4`, `--faint #6E7391`.
- `apps/web/app/globals.css` warning alias değeri `#B26A12` ile hizalandı.
- Typography/radius/shadow/layout tokenları karşılaştırıldı; mevcut değerler v6 tokenlarla uyumlu bulundu.
- Test: `pnpm typecheck` OK, `pnpm lint` OK, geçici local CI secret env ile `pnpm --filter @uyanik/web build` OK. Secret dosyaya yazılmadı.

## P2 Bulguları

- `Mistake`, `MistakeReview` modelleri ve `20260612120000_mistakes` migration eklendi.
- `mistakeRepository` + `mistake.service.ts` eklendi; `studentId` yalnız session scope'tan alınır.
- `/api/student/mistakes`, `/batch`, `/:id`, `/:id/review` tek catch-all handler ile DB-backed çalışır.
- `/student/mistakes` route ve student nav item eklendi; özet, Sıfır Hata Döngüsü, Hata Frekansı, ekleme formu, filtreli liste var.
- Spaced repetition sunucuda `1 -> 3 -> 7 -> 21`; `photoUrl` dataURL/base64 kabul etmez.
- Test: `pnpm db:generate` OK, `pnpm typecheck` OK, `pnpm lint` OK, `pnpm test:unit` OK, local CI secret env ile build OK.

## P3 Bulguları

- Optik submission submit akışı answer key + öğrenci cevaplarından yanlış/boşları `optik_submission` source type ile mistake batch'e yazar.
- Duplicate engelleme `studentId + sourceKind + sourceRefId + sourceLabel + subject + topic + errorType` eşleşmesiyle servis/repository katmanında yapılır; `sourceRefId = optik:{examId}`.
- Konu bilgisi optik akışında yok; `subject = examType`, `topic = null`, `source = examTitle`, `sourceLabel = Soru N`.
- AssignmentResult akışında soru/konu/soru bazlı cevap yok; bu fazda assignment'tan otomatik mistake üretilmedi, veri uydurulmadı.
- Memory/mock parity eklendi; production memory guard gevşetilmedi.

## P4 Bulguları

- `/student/mistakes` Sıfır Hata Döngüsü'ne `Odak tekrar` modalı eklendi.
- Focus review akışı kart kart ilerler; `Atla`, `Tekrar ettim`, progress bar ve bitiş ekranı var.
- Due listesinde ilk 5 kayıt gösterilir, fazlası için `daha fazla/daha az` kontrolü eklendi.
- Mistake satırlarında `photoUrl` thumbnail + lightbox açılır; foto yoksa mevcut placeholder korunur.
- P3'ten gelen `topic=null` kayıtlar güvenli biçimde `Konu bilgisi yok` olarak gösterilir.
- Test: `pnpm typecheck` OK, `pnpm lint` OK, `pnpm test:unit` OK, local CI secret env ile build OK.

## P5 Bulgulari

- Koc icin `/api/coach/students/[id]/mistakes` eklendi; yalniz roster ogrencisi icin insight doner.
- Veli icin `/api/parent/mistakes/summary` eklendi; parentId -> child studentId cozumlemesiyle read-only aggregate doner.
- Insight servisinde acik, tekrar sirasi, kapanan ve konu/frekans gruplari tek helper ile uretilir.
- Koc ogrenci detayina ve veli dashboard'a shared `MistakeInsightsCard` mount edildi; write aksiyonu eklenmedi.
- Konu bilgisi olmayan optik kayitlar subject seviyesinde gruplanir; topic uydurulmaz.

## P6 Bulgulari

- `exam.service.ts` son iki deneme sonucundan subject bazli NetGainMap turetir; yeni tablo/migration yok.
- `/api/student/net-gain`, `/api/coach/students/[id]/net-gain`, `/api/parent/net-gain` eklendi.
- Koc endpoint roster guard, veli endpoint parent child-scope guard kullanir.
- Shared `NetGainMap` `/student/exams`, `/coach/topics`, `/parent/dashboard` icine mount edildi.
- CTA student icin programa, coach icin mevcut odev atama akisini acan sayfaya gider; parent read-only kalir.

## P7 Bulgulari

- `/api/coach/smart-assignments` tek POST route ile `preview` ve `assign` aksiyonlarini destekler.
- Preview sinyalleri Yanlis Defteri, NetGainMap ve konu takibinden server tarafinda turetilir.
- Assign aksiyonu mevcut `createCoachAssignment` akisini kullanir; roster guard ve parent resolve korunur.
- `SmartOdevModal` coach assignments ekranina eklendi; atama sonrasi liste yenilenir.
- Yeni schema/dependency yok; smart metadata mevcut assignment description alanina uyumlu ozet olarak yazilir.

## P8 Bulgulari

- `/api/student/agenda` eklendi; studentId yalniz session'dan gelir.
- Agenda `assignment`, `exam`, `appointment`, `mistake`, `study` kaynaklarini read-only birlestirir.
- `TakvimimCard` student dashboard'a mount edildi; item click ilgili mevcut route'a gider.
- Yeni tablo/migration/dependency yok; data mevcut servislerden turetilir.
- Due mistakes `nextDue` olan acik kayitlardan gelir.

## P9 Bulgulari

- `ThreadMember.lastReadAt` ve `ThreadMember.muted` additive migration ile eklendi.
- Thread listeleri viewer userId ile `unreadCount`, `muted`, `lastReadAt` doner.
- `/api/messages/thread-state` read ve mute aksiyonlarini tek guarded endpointte toplar.
- `MessagesPanel` thread acilinca okundu isaretler; mute toggle ve unread/sessiz badge gosterir.
- Memory mode icin service-level thread state parity eklendi; production memory guard degistirilmedi.

## Sonraki Adim

P10: Coach notifications DB scope veya v6 visual acceptance cleanup.
