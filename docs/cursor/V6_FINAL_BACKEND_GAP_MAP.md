# Uyanık Koç Web v6 Final - Backend Gap Map

P0 backend envanteri canlı pattern'e göre çıkarıldı: `apps/web/app/api/**` route handler -> `apps/web/server/services/**` -> `packages/database/src/repositories/**` -> `packages/database/prisma/schema.prisma`. Prisma sorgusu component içinde yazılmıyor; bu pattern korunmalı.

## Prototype Store -> Backend Mapping

| Prototype key / davranış | Mevcut backend karşılığı | Eksik v6 karşılığı | Yetki |
|---|---|---|---|
| `uk_mistakes_v1` Yanlış Defteri | yok | `Mistake`, `MistakeReview` Prisma modelleri; `mistake.service.ts`; `repositories/mistakes.ts`; `/api/student/mistakes/**`, `/api/coach/students/[studentId]/mistakes`, `/api/parent/mistakes/summary` | student kendi CRUD+review; coach roster öğrencisi read; parent kendi çocuğu aggregate |
| `uk_odevler_v1` assignments | var: `Assignment`, `AssignmentResult`; `assignment.service.ts`; `repositories/assignments.ts`; `/api/student/assignments`, `/api/coach/assignments` | v6 alanları: `topic`, `source`, `questionCount`, `weekKey`, `feedback`, `smart`, `quality`, `overdueAlert` veya uyumlu plan item modeli; result -> MistakeBatch tetikleme; SmartOdev preview/assign | student kendi sonuç girer; coach roster öğrencisine atar; parent child read |
| `uk_sources_v2` sources | var: `StudentSource`, `student-sources.service.ts`, parent/student/coach sources API | kaynak status/progress v6 `KAYNAK_DURUM` karşılığı eksik görünüyor; readonly parent mount doğrulanmalı | student kendi; coach roster; parent child read |
| `uk_selfstudy_v1` self-study | konu çalışma için `StudyBlock` ve `TopicStudySession` var | self-study ayrı contract karşılığı net değil; Takvimim/NetGainMap sinyalinde kaynaklanma kararı gerekiyor | student kendi; coach roster read |
| `uk_msg_v1` messaging | var: `MessageThread`, `Message`, `ThreadMember`; `message.service.ts`; `/api/{student,coach,parent}/messages` | unread/read/mute kalıcılığı eksik; `ThreadMember.lastReadAt`, `ThreadMember.muted`; generic `/api/messages/threads` kontratı yok; otomatik yanıt taşınmamalı | görünürlük = gönderme yetkisi; backend guard zorunlu |
| `uk_notif_v2` notifications | var: `Notification` yalnız `studentId`, `parentId`; student/parent DB, coach memory | coach/user-scoped notification DB yok; `POST /api/notifications/[id]/read` v6 generic yok; message/coach-note notification üretimi eksik | all: yalnız kendi kuyruğu |
| `uk_appointments_v1` appointments | var: `Appointment`, `AppointmentSettings`; `appointment.service.ts`; student/parent/coach API | Takvimim aggregation içine dahil edilecek; enum mapping `yuzyuze` -> mevcut `in_person` uyarlanmalı | student kendi request/read; coach kendi appointment; parent child read |
| `uk_konu`, `uk_topic_src_v2` topic/exam ilişkileri | var: `Subject`, `Topic`, `TopicProgress`, `TopicStudySession`, `CoachTopicTarget`; `topic.service.ts` | NetGainMap helper endpointleri için completion gap + source/topic relation netleştirilecek | student kendi; coach roster; parent child read-only |
| Deneme sonuçları | var: `ExamResult`, `ExamSubjectResult`; `exam.service.ts`; student/parent/coach API | deneme analizi -> MistakeBatch source fields; NetGainMap trend input; coach note from exam detail | student kendi; coach roster; parent child read |

## Required v6 APIs

| API | Mevcut durum | Service/repository hedefi | Not |
|---|---|---|---|
| `GET /api/student/mistakes` | yok | `mistake.service.listStudentMistakes` -> `mistakeRepository.listForStudent` | studentId body'den alınmaz |
| `POST /api/student/mistakes` | yok | create + server `nextDue` | `photoUrl`; base64/dataURL DB'ye yazılmaz |
| `PATCH /api/student/mistakes/[id]` | yok | owner-guard update | student kendi kaydı |
| `DELETE /api/student/mistakes/[id]` | yok | owner-guard delete | student kendi kaydı |
| `POST /api/student/mistakes/[id]/review` | yok | stage/nextDue/status server hesap | aralıklar: 1, 3, 7, 21 |
| `POST /api/student/mistakes/batch` | yok | sourceKind/sourceRefId/sourceLabel ile batch create | assignment/exam ownership guard |
| `GET /api/coach/students/[studentId]/mistakes` | yok | coach roster guard + read | `coachHasStudent` pattern kullanılmalı |
| `GET /api/parent/mistakes/summary` | yok | parent child resolve + aggregate only | detay/edit yok |
| `GET /api/student/net-gain` | yok | derived service | read-only |
| `GET /api/coach/students/[studentId]/net-gain` | yok | roster guard + derived service | CTA UI'da ödev atar |
| `GET /api/parent/net-gain` | yok | parent child aggregate | CTA yok |
| `POST /api/coach/smart-assignments/preview` | yok | derived preview, DB write yok | coach only, roster guard |
| `POST /api/coach/smart-assignments/assign` | yok | transaction assignment insert | existing assignment flow kırılmamalı |
| `GET /api/student/agenda` | yok | assignment + exams + appointments + due mistakes aggregation | yeni tablo gerekmeyebilir |
| `GET /api/messages/threads` | rol bazlı API var | mevcut route'lar korunabilir veya v6 generic wrapper | route tasarımı canlı yapıya uyarlanmalı |
| `POST /api/messages/threads/[threadId]/messages` | rol bazlı `POST /api/{role}/messages/[id]` var | access guard + notification | generic route şart değilse risk notu |
| `POST /api/messages/threads/[threadId]/read` | yok | `ThreadMember.lastReadAt` | unread hesap için gerekli |
| `PATCH /api/messages/threads/[threadId]/mute` | yok | `ThreadMember.muted` | kalıcı mute |
| `GET /api/notifications` / `POST /api/notifications/[id]/read` | rol bazlı var; coach DB yok | user-scoped notification veya rol wrapper | existing endpoints korunabilir |

## Authorization Matrix

| Alan | Student | Coach | Parent |
|---|---|---|---|
| Mistakes | yalnız kendi kayıtları CRUD + review | yalnız roster öğrencisi read + konuya ödev ata | yalnız kendi çocuğu aggregate read |
| Assignments | kendi ödevlerini görür, sonuç girer | yalnız roster öğrencisine atar, feedback yazar | kendi çocuğu read-only |
| Exam results | kendi sonuçları | roster öğrencileri | kendi çocuğu read-only |
| NetGainMap | kendi, CTA programa ekle | roster öğrencisi, CTA ödev ata | kendi çocuğu, CTA yok |
| SmartOdev | erişim yok | preview + assign, yalnız roster | erişim yok |
| Messaging | koç DM + üyesi gruplar | roster öğrenci/veli DM + grup yönetimi | çocuğun koçu DM + üyesi gruplar |
| Notifications | kendi kuyruğu | kendi kuyruğu gerekli | kendi kuyruğu |
| Appointments | kendi randevuları | kendi randevu/öğrencileri | kendi çocuğu |

## Schema Gaps

- `StudentProfile` üzerinde `mistakes` relation yok.
- `Mistake` / `MistakeReview` yok.
- `Assignment` modeli v6 ödev plan item alanlarını taşımıyor: `topic`, `source`, `questionCount`, `weekKey`, `feedback`, `smart`, `overdueAlert`, `quality`.
- `Notification` modeli coach/user scope taşımıyor; sadece `studentId` ve `parentId`.
- `ThreadMember` modeli `lastReadAt` ve `muted` taşımıyor.
- `Message` modeli delivery/read state tutmuyor; unread thread-member üzerinden türetilmeli.

## Risk Notları

- Handoff'taki Zustand/React Query önerisi canlı projede dependency izni değildir; mevcut fetch + service + repository pattern'i kullanılmalı.
- Production'da demo-memory store yasak; memory fallback yalnız `DEMO_AUTH_ALLOW_IN_MEMORY=true` dev koşulunda kalmalı.
- Storage yoksa Yanlış Defteri foto upload UI disabled/opsiyonel ve riskli kabul edilmeli; DB'ye dataURL yazılmamalı.
