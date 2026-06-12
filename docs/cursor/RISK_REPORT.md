# Risk Report - Web v6 Final

**Tarih:** 2026-06-12  
**Son faz:** Web v6 Final P1 token/style parity  
**Durum:** P1 clear

## P10 Status

Status: clear

Coach notifications DB scope tamamlandi; `Notification.coachId` nullable scope ile eklendi, coach list/read/mark-all DB modunda `coachId` filtresiyle calisir. `pnpm db:generate`, `pnpm typecheck`, `pnpm lint`, `pnpm test:unit` ve gecici local CI secret env ile web build gecti. Aktif P10 riski yok.

## P11 Status

Status: clear

Final audit cleanup docs-only tamamlandi. Aktif kod riski yok; kalan mobile/modal/coach topics PNG eksigi browser/manual visual QA notu olarak tutuldu, cozuldu diye isaretlenmedi.

## P1 Status

Status: clear

P1 token/style parity değişiklikleri uygulandı; `pnpm typecheck`, `pnpm lint` ve geçici local CI secret env ile `pnpm --filter @uyanik/web build` geçti.

Önceki build blokajı kod/tasarım hatası değil, production build için beklenen `AUTH_SECRET`/`NEXTAUTH_SECRET` env eksikliğiydi. Secret dosyaya yazılmadı, fallback secret eklenmedi. Mobile/modal PNG eksikliği ve v6 feature/backend eksikleri bu fazın kapsamı dışındadır.

## Accepted P0 Risk Record

Sebep: P0 envanteri tamamlandı; implementation'a geçmeden kabul/onay gerektiren gap/riskler kullanıcı tarafından kabul edildi.

Etkilenen alan:

- Design token gate: `apps/web/styles/uk-design.css` light `--muted` halen `#767A90`; v6 hedef `#6B6F85`. Dark `--surface` ve dark neutral token seti v6 `tokens/colors.json` ile uyumsuz.
- Görsel QA: handoff paketinde mobile PNG ve modal PNG yok; `coach/c-topics` desktop PNG yok. Gerçek browser regenerate veya spec tabanlı QA gerekli.
- Student v6 route: `/student/mistakes` canlı repoda yok; nav item yok; Yanlış Defteri component/API/service/repository/Prisma modeli yok.
- Backend gaps: `Mistake`/`MistakeReview` yok; NetGainMap, SmartOdev, Takvimim aggregation endpointleri yok.
- Messaging gaps: DB-backed mesajlaşma mevcut ama unread/read/mute kalıcılığı için `ThreadMember.lastReadAt`/`muted` yok; coach notifications DB-backed değil.
- Assignment gaps: `Assignment`/`AssignmentResult` mevcut ama v6 smart assignment için topic/source/questionCount/weekKey/feedback/smart/quality/overdueAlert alanları yok.
- Storage: Yanlış Defteri fotoğrafı için object storage yok; dataURL/base64 DB'ye yazılmamalı.
- Route adaptation: handoff route önerileri canlı `/student/dashboard`, `/coach/dashboard`, `/parent/dashboard` yapısına uyarlanmalı; mevcut ekranlar silinmemeli.

Öneri:

- P1'de yalnız token/style parity gate uygulanmalı ve testler çalıştırılmalı.
- P2'den itibaren her faz 8-10 dosya sınırını aşmayacak şekilde bölünmeli; `Mistake` backend önce DB/service/repository/API olarak eklenmeli.
- Mobile/modal görseller için gerçek browser regenerate denenmeli; olmazsa `V6_FINAL_VISUAL_ACCEPTANCE.md` spec tabanlı QA ile işaretlenmeli.
- Generic API isimleri canlı route düzeniyle çakışırsa mevcut rol bazlı route'lar korunup wrapper/alias ihtiyacı ayrıca onaylanmalı.

P0 riskleri kullanıcı tarafından kabul edildi; P1 token/style parity tamamlandı. Kapsam dışı işler sonraki fazlara bırakıldı.

---

## Önceki Risk Kayıtları

### Faz 2 kapanış - 2026-06-05

Additive migration `20260604210000_faz2_skeletons`; yerel/CI için `pnpm db:migrate` gerekir.

### BACKLOG PROMPT 18 - 2026-06-04

Deneme sonuçları (YKS alpha). Additive migration; yerel/CI DB için `pnpm db:migrate` gerekir.

### BACKLOG PROMPT 17 - 2026-06-04

Kullanıcı tanımlı konu takibi. Additive migration; yerel/CI DB için `pnpm db:migrate` gerekir.

### BACKLOG PROMPT 14 - 2026-06-03

Assignment service layer refactor only. Risk yok; davranış değişmedi, yeni tablo/endpoint/dependency yok.

### PROMPT 09 - 2026-06-04

Eski blokaj `DATABASE_URL` yoktu; yerel Postgres docker-compose ile çözüldü.

---

## P5 Kapanis - 2026-06-12

Risk yok. Koc/veli Yanlis Defteri insight read mount roster ve parent child-scope guard ile tamamlandi; write aksiyonu eklenmedi.
